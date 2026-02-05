import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import AnalyticsService from '../services/analytics.service';
import DatasetService from '../services/dataset.service';

export const generateReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { datasetId, metrics } = req.body;

    // Validate input
    if (!datasetId || !metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        success: false,
        message: 'Dataset ID and metrics array are required'
      });
    }

    // Get dataset info
    const dataset = await DatasetService.getDataset(datasetId, userId);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Generate analytics for each metric
    const analyticsResults = [];
    for (const metric of metrics) {
      try {
        const analytics = await AnalyticsService.runAnalytics(datasetId, metric, userId);
        analyticsResults.push({
          metric,
          success: true,
          data: analytics
        });
      } catch (error: any) {
        analyticsResults.push({
          metric,
          success: false,
          error: error.message
        });
      }
    }

    // Generate report summary
    const report = {
      id: `report_${Date.now()}`,
      datasetId,
      datasetName: dataset.datasetName,
      generatedAt: new Date().toISOString(),
      metrics: analyticsResults,
      summary: {
        totalMetrics: metrics.length,
        successfulMetrics: analyticsResults.filter(r => r.success).length,
        failedMetrics: analyticsResults.filter(r => !r.success).length,
        totalAnomalies: analyticsResults
          .filter(r => r.success)
          .reduce((sum, r) => sum + (r.data?.anomalies?.length || 0), 0)
      }
    };

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: { report }
    });

  } catch (error: any) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate report'
    });
  }
};

export const getInsights = async (req: AuthRequest, res: Response) => {
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

    // Generate insights based on analytics
    const insights = [];

    // Summary insights
    const { summary, anomalies } = analytics;
    
    insights.push({
      type: 'summary',
      title: 'Statistical Overview',
      description: `The ${metric} has an average value of ${summary.mean.toLocaleString()} with a standard deviation of ${summary.stdDev.toLocaleString()}.`,
      severity: 'info'
    });

    // Anomaly insights
    if (anomalies.length > 0) {
      const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
      const mediumSeverityAnomalies = anomalies.filter(a => a.severity === 'medium');

      if (highSeverityAnomalies.length > 0) {
        insights.push({
          type: 'anomaly',
          title: 'Critical Anomalies Detected',
          description: `Found ${highSeverityAnomalies.length} high-severity anomalies that require immediate attention.`,
          severity: 'high',
          details: highSeverityAnomalies.slice(0, 3) // Show top 3
        });
      }

      if (mediumSeverityAnomalies.length > 0) {
        insights.push({
          type: 'anomaly',
          title: 'Moderate Anomalies',
          description: `Detected ${mediumSeverityAnomalies.length} medium-severity anomalies that may indicate trends worth monitoring.`,
          severity: 'medium'
        });
      }
    } else {
      insights.push({
        type: 'normal',
        title: 'No Anomalies Detected',
        description: `The ${metric} data appears to be within normal ranges with no significant outliers.`,
        severity: 'info'
      });
    }

    // Trend insights
    if (analytics.timeSeriesData.length > 1) {
      const firstValue = analytics.timeSeriesData[0].value;
      const lastValue = analytics.timeSeriesData[analytics.timeSeriesData.length - 1].value;
      const percentChange = ((lastValue - firstValue) / firstValue) * 100;

      if (Math.abs(percentChange) > 10) {
        insights.push({
          type: 'trend',
          title: percentChange > 0 ? 'Upward Trend' : 'Downward Trend',
          description: `The ${metric} has ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% over the analyzed period.`,
          severity: Math.abs(percentChange) > 50 ? 'high' : 'medium'
        });
      }
    }

    res.json({
      success: true,
      data: { insights }
    });

  } catch (error: any) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate insights'
    });
  }
};