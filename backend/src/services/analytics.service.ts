import mongoose from 'mongoose';
import Dataset from '../models/dataset.model';
import Record from '../models/record.model';
import Analytics, { ISummary, IAnalytics } from '../models/analytics.model';
import AnomalyService, { DataPoint } from './anomaly.service';
import CacheService from './cache.service';

export class AnalyticsService {
  
  async runAnalytics(datasetId: string, metric: string, userId: string): Promise<IAnalytics> {
    // Check cache first
    const cached = await CacheService.getAnalytics(datasetId, metric);
    if (cached) {
      return cached;
    }

    // Verify dataset ownership
    const dataset = await Dataset.findOne({ 
      _id: new mongoose.Types.ObjectId(datasetId), 
      userId 
    });
    
    if (!dataset) {
      throw new Error('Dataset not found or access denied');
    }

    if (dataset.status !== 'processed') {
      throw new Error('Dataset is not ready for analytics');
    }

    // Get records for the dataset
    const records = await Record.find({ datasetId: new mongoose.Types.ObjectId(datasetId) });
    
    if (records.length === 0) {
      throw new Error('No records found for dataset');
    }

    // Extract metric values and prepare time series data
    const timeSeriesData: DataPoint[] = [];
    const metricValues: number[] = [];

    records.forEach(record => {
      const value = record.data[metric];
      if (typeof value === 'number' && !isNaN(value)) {
        metricValues.push(value);
        
        // Try to extract date from time column or use record timestamp
        let dateStr = record.timestamp?.toISOString().split('T')[0] || 
                     record.data[dataset.timeColumn || 'date'] || 
                     record.createdAt.toISOString().split('T')[0];
        
        timeSeriesData.push({
          date: dateStr,
          value: value
        });
      }
    });

    if (metricValues.length === 0) {
      throw new Error(`No valid numeric values found for metric: ${metric}`);
    }

    // Calculate summary statistics
    const summary = this.calculateSummaryStats(metricValues);
    
    // Detect anomalies
    const anomalies = AnomalyService.detectAnomalies(timeSeriesData);

    // Sort time series data by date
    timeSeriesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Save or update analytics
    let analytics = await Analytics.findOne({ 
      datasetId: new mongoose.Types.ObjectId(datasetId), 
      metric 
    });

    if (analytics) {
      analytics.summary = summary;
      analytics.anomalies = anomalies;
      analytics.timeSeriesData = timeSeriesData;
      analytics.updatedAt = new Date();
      await analytics.save();
    } else {
      analytics = new Analytics({
        datasetId: new mongoose.Types.ObjectId(datasetId),
        metric,
        summary,
        anomalies,
        timeSeriesData
      });
      await analytics.save();
    }

    // Cache the results
    await CacheService.setAnalytics(datasetId, metric, analytics);

    return analytics;
  }

  async getAnalytics(datasetId: string, metric: string, userId: string): Promise<IAnalytics | null> {
    // Check cache first
    const cached = await CacheService.getAnalytics(datasetId, metric);
    if (cached) {
      return cached;
    }

    // Verify dataset ownership
    const dataset = await Dataset.findOne({ 
      _id: new mongoose.Types.ObjectId(datasetId), 
      userId 
    });
    
    if (!dataset) {
      throw new Error('Dataset not found or access denied');
    }

    // Get from database
    const analytics = await Analytics.findOne({ 
      datasetId: new mongoose.Types.ObjectId(datasetId), 
      metric 
    });

    if (analytics) {
      // Cache for future requests
      await CacheService.setAnalytics(datasetId, metric, analytics);
    }

    return analytics;
  }

  async getDatasetMetrics(datasetId: string, userId: string): Promise<string[]> {
    // Verify dataset ownership
    const dataset = await Dataset.findOne({ 
      _id: new mongoose.Types.ObjectId(datasetId), 
      userId 
    });
    
    if (!dataset) {
      throw new Error('Dataset not found or access denied');
    }

    // Get numeric columns from dataset
    const numericColumns = dataset.columns.filter(col => {
      // Exclude common non-metric columns
      const excludeColumns = ['id', 'date', 'time', 'timestamp', 'created_at', 'updated_at'];
      return !excludeColumns.includes(col.toLowerCase());
    });

    return numericColumns;
  }

  private calculateSummaryStats(values: number[]): ISummary {
    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    
    // Basic stats
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    
    // Median
    const median = count % 2 === 0 
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];
    
    // Standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    
    // Quartiles
    const q1Index = Math.floor(count * 0.25);
    const q3Index = Math.floor(count * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];

    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      min,
      max,
      count,
      q1,
      q3
    };
  }

  async invalidateCache(datasetId: string): Promise<void> {
    await CacheService.invalidateDatasetCache(datasetId);
  }
}

export default new AnalyticsService();