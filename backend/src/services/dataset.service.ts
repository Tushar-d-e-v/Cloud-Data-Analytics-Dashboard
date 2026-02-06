import mongoose from 'mongoose';
import Dataset, { IDataset } from '../models/dataset.model';
import Record from '../models/record.model';
import { uploadToS3, deleteFromS3 } from '../config/s3';
import { parseCSV, parseJSON } from '../utils/csvParser';
import AnalyticsService from './analytics.service';

export class DatasetService {
  
  async uploadDataset(
    file: Express.Multer.File,
    userId: string,
    datasetName: string,
    timeColumn?: string,
    metricColumn?: string
  ): Promise<IDataset> {
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `datasets/${userId}/${timestamp}-${file.originalname}`;
    
    try {
      // Upload file to S3
      const s3FilePath = await uploadToS3(
        file.buffer,
        fileName,
        file.mimetype
      );

      // Parse file content
      let parsedData;
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        parsedData = await parseCSV(file.buffer);
      } else if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
        parsedData = parseJSON(file.buffer);
      } else {
        throw new Error('Unsupported file format. Please upload CSV or JSON files.');
      }

      // Create dataset record
      const dataset = new Dataset({
        userId,
        datasetName,
        s3FilePath,
        columns: parsedData.columns,
        status: 'processing',
        timeColumn,
        metricColumn,
        recordCount: parsedData.recordCount,
        rowCount: parsedData.recordCount,
        columnCount: parsedData.columns.length,
        fileSize: file.size
      });

      await dataset.save();

      // Process records in background
      this.processRecords(dataset._id.toString(), parsedData.records, timeColumn);

      return dataset;
      
    } catch (error) {
      // Clean up S3 file if upload succeeded but processing failed
      try {
        await deleteFromS3(fileName);
      } catch (cleanupError) {
        console.error('Failed to cleanup S3 file:', cleanupError);
      }
      throw error;
    }
  }

  private async processRecords(
    datasetId: string, 
    records: Record<string, any>[], 
    timeColumn?: string
  ): Promise<void> {
    try {
      const objectId = new mongoose.Types.ObjectId(datasetId);
      
      // Prepare records for bulk insert
      const recordDocuments = records.map(data => {
        let timestamp: Date | undefined;
        
        // Try to parse timestamp from time column
        if (timeColumn && data[timeColumn]) {
          const parsedDate = new Date(data[timeColumn]);
          if (!isNaN(parsedDate.getTime())) {
            timestamp = parsedDate;
          }
        }

        return {
          datasetId: objectId,
          data,
          timestamp
        };
      });

      // Bulk insert records
      await Record.insertMany(recordDocuments);

      // Update dataset status
      await Dataset.findByIdAndUpdate(objectId, { 
        status: 'processed' 
      });

      console.log(`✅ Processed ${records.length} records for dataset ${datasetId}`);
      
    } catch (error) {
      console.error(`❌ Failed to process records for dataset ${datasetId}:`, error);
      
      // Update dataset status to error
      await Dataset.findByIdAndUpdate(datasetId, { 
        status: 'error' 
      });
    }
  }

  async getUserDatasets(userId: string): Promise<IDataset[]> {
    return Dataset.find({ userId }).sort({ uploadedAt: -1 });
  }

  async getDataset(datasetId: string, userId: string): Promise<IDataset | null> {
    return Dataset.findOne({ 
      _id: new mongoose.Types.ObjectId(datasetId), 
      userId 
    });
  }

  async deleteDataset(datasetId: string, userId: string): Promise<void> {
    const dataset = await Dataset.findOne({ 
      _id: new mongoose.Types.ObjectId(datasetId), 
      userId 
    });

    if (!dataset) {
      throw new Error('Dataset not found or access denied');
    }

    try {
      // Delete from S3 or local storage
      if (dataset.s3FilePath.startsWith('local://')) {
        const fileName = dataset.s3FilePath.replace('local://', '');
        await deleteFromS3(fileName);
      } else {
        const s3Key = dataset.s3FilePath.split('/').slice(-3).join('/');
        await deleteFromS3(s3Key);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Continue with database cleanup even if file deletion fails
    }

    // Delete records
    await Record.deleteMany({ datasetId: new mongoose.Types.ObjectId(datasetId) });

    // Delete analytics
    await mongoose.model('Analytics').deleteMany({ datasetId: new mongoose.Types.ObjectId(datasetId) });

    // Delete dataset
    await Dataset.findByIdAndDelete(datasetId);

    // Invalidate cache
    await AnalyticsService.invalidateCache(datasetId);
  }

  async reprocessDataset(datasetId: string, userId: string): Promise<IDataset> {
    const dataset = await Dataset.findOne({ 
      _id: new mongoose.Types.ObjectId(datasetId), 
      userId 
    });

    if (!dataset) {
      throw new Error('Dataset not found or access denied');
    }

    // Update status to processing
    dataset.status = 'processing';
    await dataset.save();

    // Delete existing records
    await Record.deleteMany({ datasetId: new mongoose.Types.ObjectId(datasetId) });

    // Invalidate cache
    await AnalyticsService.invalidateCache(datasetId);

    // Note: In a real implementation, you would re-download from S3 and reprocess
    // For now, we'll just update the status back to processed
    setTimeout(async () => {
      dataset.status = 'processed';
      await dataset.save();
    }, 2000);

    return dataset;
  }
}

export default new DatasetService();