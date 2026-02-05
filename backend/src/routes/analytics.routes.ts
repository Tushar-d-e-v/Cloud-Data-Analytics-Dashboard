import { Router } from 'express';
import { 
  runAnalytics, 
  getAnalytics, 
  getDatasetMetrics, 
  invalidateCache 
} from '../controllers/analytics.controller';
import { validateRequest, analyticsRunSchema } from '../utils/validators';
import authenticateToken from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Analytics routes
router.post('/run', validateRequest(analyticsRunSchema), runAnalytics);
router.get('/:datasetId', getAnalytics);
router.get('/:datasetId/metrics', getDatasetMetrics);
router.delete('/:datasetId/cache', invalidateCache);

export default router;