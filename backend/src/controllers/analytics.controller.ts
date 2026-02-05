import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import AnalyticsService from '../services/analytics.service';

export const runAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { datasetId, metric } = req.body;

    const analytics = await AnalyticsService.runAnalytics(datasetId, metric, userId);

    res.json({
      success: true,
      message: 'Analytics generated successfully',
      data: { analytics }
    });

  } catch (error: any) {
    console.error('Run analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to run analytics'
    });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { datasetId } = req.params;
    const { metric } = req.query;

    if (!metric || typeof metric !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Metric parameter is required'
      });
    }

    const analytics = await AnalyticsService.getAnalytics(datasetId, metric, userId);

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics not found. Please run analytics first.'
      });
    }

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics'
    });
  }
};

export const getDatasetMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { datasetId } = req.params;

    const metrics = await AnalyticsService.getDatasetMetrics(datasetId, userId);

    res.json({
      success: true,
      data: { metrics }
    });

  } catch (error: any) {
    console.error('Get dataset metrics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dataset metrics'
    });
  }
};

export const invalidateCache = async (req: AuthRequest, res: Response) => {
  try {
    const { datasetId } = req.params;

    await AnalyticsService.invalidateCache(datasetId);

    res.json({
      success: true,
      message: 'Cache invalidated successfully'
    });

  } catch (error: any) {
    console.error('Invalidate cache error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to invalidate cache'
    });
  }
};