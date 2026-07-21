import { type Request, type Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { analyticsQuerySchema } from '../validators/analytics.validator.js';

export const getOverview = async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { projectId } = req.params;
    const query = analyticsQuerySchema.parse(req.query);

    const dateRange = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const overview = await AnalyticsService.getOverviewMetrics(projectId, dateRange);
    res.json(overview);
  } catch (error) {
    console.error('getOverview Error:', error);
    res.status(400).json({ error: 'Failed to get overview metrics' });
  }
};

export const getTimeSeries = async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { projectId } = req.params;
    const query = analyticsQuerySchema.parse(req.query);

    const dateRange = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const timeSeries = await AnalyticsService.getTimeSeriesData(
      projectId,
      dateRange,
      query.granularity,
    );
    res.json(timeSeries);
  } catch (error) {
    console.error('getTimeSeries Error:', error);
    res.status(400).json({ error: 'Failed to get time series data' });
  }
};

export const getTopPages = async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { projectId } = req.params;
    const query = analyticsQuerySchema.parse(req.query);

    const dateRange = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const topPages = await AnalyticsService.getTopPages(projectId, dateRange, query.limit);
    res.json(topPages);
  } catch (error) {
    console.error('getTopPages Error:', error);
    res.status(400).json({ error: 'Failed to get top pages' });
  }
};

export const getReferrers = async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { projectId } = req.params;
    const query = analyticsQuerySchema.parse(req.query);

    const dateRange = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const referrers = await AnalyticsService.getReferrers(projectId, dateRange, query.limit);
    res.json(referrers);
  } catch (error) {
    console.error('getReferrers Error:', error);
    res.status(400).json({ error: 'Failed to get referrers' });
  }
};

export const getSystemBreakdown = async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { projectId } = req.params;
    const query = analyticsQuerySchema.parse(req.query);

    const dateRange = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const systems = await AnalyticsService.getSystemBreakdown(projectId, dateRange);
    res.json(systems);
  } catch (error) {
    console.error('getSystemBreakdown Error:', error);
    res.status(400).json({ error: 'Failed to get system breakdown' });
  }
};

export const getTopClicks = async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { projectId } = req.params;
    const query = analyticsQuerySchema.parse(req.query);

    const dateRange = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const topClicks = await AnalyticsService.getTopClicks(projectId, dateRange, query.limit);
    res.json(topClicks);
  } catch (error) {
    console.error('getTopClicks Error:', error);
    res.status(400).json({ error: 'Failed to get top clicks' });
  }
};

export const getCustomEvents = async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { projectId } = req.params;
    const query = analyticsQuerySchema.parse(req.query);

    const dateRange = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const customEvents = await AnalyticsService.getCustomEvents(projectId, dateRange, query.limit);
    res.json(customEvents);
  } catch (error) {
    console.error('getCustomEvents Error:', error);
    res.status(400).json({ error: 'Failed to get custom events' });
  }
};

export const getScrollDepth = async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { projectId } = req.params;
    const query = analyticsQuerySchema.parse(req.query);

    const dateRange = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const scrollDepth = await AnalyticsService.getScrollDepth(projectId, dateRange);
    res.json(scrollDepth);
  } catch (error) {
    console.error('getScrollDepth Error:', error);
    res.status(400).json({ error: 'Failed to get scroll depth' });
  }
};
