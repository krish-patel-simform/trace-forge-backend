import { Router } from 'express';
import {
  getOverview,
  getTimeSeries,
  getTopPages,
  getReferrers,
  getSystemBreakdown,
  getTopClicks,
  getTopSearches,
  getCustomEvents,
  getScrollDepth,
} from '../controllers/analytics.controller.js';
import { protect as requireAuth } from '../middlewares/auth.middleware.js';

const router = Router({ mergeParams: true }); // mergeParams is needed because we mount at /projects/:projectId/analytics

// Protect all analytics endpoints with user authentication
router.use(requireAuth);

// Note: You can add an extra middleware here to check if the authenticated user has access to `req.params.projectId`
// e.g. router.use(requireProjectAccess)

router.get('/overview', getOverview);
router.get('/timeseries', getTimeSeries);
router.get('/pages', getTopPages);
router.get('/referrers', getReferrers);
router.get('/systems', getSystemBreakdown);

// Engagement endpoints
router.get('/engagement/clicks', getTopClicks);
router.get('/engagement/searches', getTopSearches);
router.get('/engagement/custom', getCustomEvents);
router.get('/engagement/scroll', getScrollDepth);

export default router;
