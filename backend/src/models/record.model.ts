import mongoose, { Schema, Document } from 'mongoose';

export interface IRecord extends Document {
  datasetId: mongoose.Types.ObjectId;
  data: Record<string, any>;
  timestamp?: Date;
  createdAt: Date;
}

const RecordSchema: Schema = new Schema({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  timestamp: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
RecordSchema.index({ datasetId: 1, timestamp: 1 });

export default mongoose.model<IRecord>('Record', RecordSchema);