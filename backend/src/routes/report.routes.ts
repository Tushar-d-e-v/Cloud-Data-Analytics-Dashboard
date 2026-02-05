import { Router } from 'express';
import { generateReport, getInsights } from '../controllers/report.controller';
import authenticateToken from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Report routes
router.post('/generate', generateReport);
router.get('/:datasetId/insights', getInsights);

export default router;