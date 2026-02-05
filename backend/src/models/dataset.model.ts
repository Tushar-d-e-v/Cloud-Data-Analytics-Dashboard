import mongoose, { Schema, Document } from 'mongoose';

export interface IDataset extends Document {
  userId: string;
  datasetName: string;
  s3FilePath: string;
  uploadedAt: Date;
  columns: string[];
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  timeColumn?: string;
  metricColumn?: string;
  recordCount?: number;
  fileSize?: number;
}

const DatasetSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  datasetName: { type: String, required: true },
  s3FilePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  columns: [{ type: String }],
  status: { 
    type: String, 
    enum: ['uploaded', 'processing', 'processed', 'error'],
    default: 'uploaded'
  },
  timeColumn: { type: String },
  metricColumn: { type: String },
  recordCount: { type: Number },
  fileSize: { type: Number }
});

export default mongoose.model<IDataset>('Dataset', DatasetSchema);