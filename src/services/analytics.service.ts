import mongoose from 'mongoose';
import { Event } from '../models/event.model.js';

interface DateRange {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}

const buildDateMatch = (
  projectId: string,
  dateRange: DateRange,
  additionalMatch: Record<string, unknown> = {},
) => {
  const match: Record<string, unknown> = {
    projectId: new mongoose.Types.ObjectId(projectId),
    ...additionalMatch,
  };

  if (dateRange.startDate || dateRange.endDate) {
    const timestampQuery: Record<string, Date> = {};
    if (dateRange.startDate) timestampQuery.$gte = dateRange.startDate;
    if (dateRange.endDate) timestampQuery.$lte = dateRange.endDate;
    match.timestamp = timestampQuery;
  }

  return match;
};

export const AnalyticsService = {
  getOverviewMetrics: async (projectId: string, dateRange: DateRange) => {
    const match = buildDateMatch(projectId, dateRange);

    const [pageViewsResult, sessionsResult] = await Promise.all([
      Event.countDocuments({ ...match, eventType: 'page_view' }),
      Event.aggregate([
        { $match: match },
        { $group: { _id: '$payload.sessionId' } },
        { $count: 'totalSessions' },
      ]),
    ]);

    const totalSessions = sessionsResult[0]?.totalSessions || 0;

    // Simplistic avg session duration (can be expanded later if we track session_end)
    // For V1, if we don't have session_end, we might just return 0 or calculate based on first and last event of each session.

    const sessionDurations = await Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$payload.sessionId',
          minTime: { $min: '$timestamp' },
          maxTime: { $max: '$timestamp' },
        },
      },
      {
        $project: {
          durationMs: { $subtract: ['$maxTime', '$minTime'] },
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$durationMs' },
        },
      },
    ]);

    const avgSessionDurationMs = sessionDurations[0]?.avgDuration || 0;

    return {
      pageViews: pageViewsResult,
      sessions: totalSessions,
      avgSessionDuration: Math.round(avgSessionDurationMs / 1000), // in seconds
    };
  },

  getTimeSeriesData: async (
    projectId: string,
    dateRange: DateRange,
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day',
  ) => {
    const match = buildDateMatch(projectId, dateRange, { eventType: 'page_view' });

    let format = '%Y-%m-%d';
    if (granularity === 'hour') format = '%Y-%m-%dT%H:00:00Z';
    if (granularity === 'month') format = '%Y-%m';

    const timeSeries = await Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format, date: '$timestamp' } },
          pageViews: { $sum: 1 },
          uniqueSessions: { $addToSet: '$payload.sessionId' },
        },
      },
      {
        $project: {
          timestamp: '$_id',
          pageViews: 1,
          sessions: { $size: '$uniqueSessions' },
          _id: 0,
        },
      },
      { $sort: { timestamp: 1 } },
    ]);

    return timeSeries;
  },

  getTopPages: async (projectId: string, dateRange: DateRange, limit: number = 10) => {
    const match = buildDateMatch(projectId, dateRange, { eventType: 'page_view' });

    return Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$context.path',
          views: { $sum: 1 },
          uniqueSessions: { $addToSet: '$payload.sessionId' },
        },
      },
      {
        $project: {
          path: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueSessions' },
          _id: 0,
        },
      },
      { $sort: { views: -1 } },
      { $limit: limit },
    ]);
  },

  getReferrers: async (projectId: string, dateRange: DateRange, limit: number = 10) => {
    const match = buildDateMatch(projectId, dateRange, { eventType: 'page_view' });

    return Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ['$context.referrer', 'Direct'] },
          views: { $sum: 1 },
        },
      },
      {
        $project: {
          referrer: '$_id',
          views: 1,
          _id: 0,
        },
      },
      { $sort: { views: -1 } },
      { $limit: limit },
    ]);
  },

  getSystemBreakdown: async (projectId: string, dateRange: DateRange) => {
    const match = buildDateMatch(projectId, dateRange, { eventType: 'page_view' });

    const [browsers, os, devices] = await Promise.all([
      Event.aggregate([
        { $match: match },
        { $group: { _id: '$payload.browser', count: { $sum: 1 } } },
        { $project: { name: { $ifNull: ['$_id', 'Unknown'] }, count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
      Event.aggregate([
        { $match: match },
        { $group: { _id: '$payload.os', count: { $sum: 1 } } },
        { $project: { name: { $ifNull: ['$_id', 'Unknown'] }, count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
      Event.aggregate([
        { $match: match },
        { $group: { _id: '$payload.deviceType', count: { $sum: 1 } } },
        { $project: { name: { $ifNull: ['$_id', 'Unknown'] }, count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return { browsers, os, devices };
  },

  getTopClicks: async (projectId: string, dateRange: DateRange, limit: number = 10) => {
    const match = buildDateMatch(projectId, dateRange, { eventType: 'click' });

    return Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            text: '$payload.text',
            name: '$payload.name',
          },
          path: { $first: '$payload.path' },
          clicks: { $sum: 1 },
          uniqueSessions: { $addToSet: '$payload.sessionId' },
        },
      },
      {
        $project: {
          text: '$_id.text',
          name: '$_id.name',
          path: 1,
          clicks: 1,
          uniqueUsers: { $size: '$uniqueSessions' },
          _id: 0,
        },
      },
      { $sort: { clicks: -1 } },
      { $limit: limit },
    ]);
  },

  getCustomEvents: async (projectId: string, dateRange: DateRange, limit: number = 20) => {
    const match = buildDateMatch(projectId, dateRange, { eventType: 'custom' });

    return Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$payload.eventName',
          occurrences: { $sum: 1 },
          uniqueSessions: { $addToSet: '$payload.sessionId' },
        },
      },
      {
        $project: {
          eventName: '$_id',
          occurrences: 1,
          uniqueUsers: { $size: '$uniqueSessions' },
          _id: 0,
        },
      },
      { $sort: { occurrences: -1 } },
      { $limit: limit },
    ]);
  },

  getScrollDepth: async (projectId: string, dateRange: DateRange) => {
    const match = buildDateMatch(projectId, dateRange, { eventType: 'scroll' });

    return Event.aggregate([
      { $match: match },
      {
        $group: {
          _id: { path: '$context.path', depth: '$payload.depth' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.path',
          distribution: {
            $push: {
              depth: '$_id.depth',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          path: '$_id',
          distribution: 1,
          _id: 0,
        },
      },
      { $sort: { path: 1 } },
    ]);
  },
};
