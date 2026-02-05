import mongoose, { Schema, Document } from 'mongoose';

export interface IAnomaly {
  date: string;
  value: number;
  type: 'z-score' | 'iqr' | 'isolation-forest';
  severity: 'low' | 'medium' | 'high';
  zscore?: number;
}

export interface ISummary {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
  q1?: number;
  q3?: number;
}

export interface IAnalytics extends Document {
  datasetId: mongoose.Types.ObjectId;
  metric: string;
  summary: ISummary;
  anomalies: IAnomaly[];
  timeSeriesData: Array<{ date: string; value: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const AnomalySchema: Schema = new Schema({
  date: { type: String, required: true },
  value: { type: Number, required: true },
  type: { type: String, enum: ['z-score', 'iqr', 'isolation-forest'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  zscore: { type: Number }
});

const SummarySchema: Schema = new Schema({
  mean: { type: Number, required: true },
  median: { type: Number, required: true },
  stdDev: { type: Number, required: true },
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  count: { type: Number, required: true },
  q1: { type: Number },
  q3: { type: Number }
});

const AnalyticsSchema: Schema = new Schema({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true, index: true },
  metric: { type: String, required: true },
  summary: { type: SummarySchema, required: true },
  anomalies: [AnomalySchema],
  timeSeriesData: [{
    date: { type: String, required: true },
    value: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for efficient querying
AnalyticsSchema.index({ datasetId: 1, metric: 1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);