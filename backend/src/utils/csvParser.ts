import csv from 'csv-parser';
import { Readable } from 'stream';

export interface ParsedData {
  columns: string[];
  records: Record<string, any>[];
  recordCount: number;
}

export const parseCSV = (buffer: Buffer): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const records: Record<string, any>[] = [];
    let columns: string[] = [];

    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('headers', (headers: string[]) => {
        columns = headers;
      })
      .on('data', (data: Record<string, any>) => {
        // Convert numeric strings to numbers
        const processedData: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
            processedData[key] = Number(value);
          } else {
            processedData[key] = value;
          }
        }
        records.push(processedData);
      })
      .on('end', () => {
        resolve({
          columns,
          records,
          recordCount: records.length
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

export const parseJSON = (buffer: Buffer): ParsedData => {
  try {
    const data = JSON.parse(buffer.toString());
    
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }

    if (data.length === 0) {
      throw new Error('JSON array cannot be empty');
    }

    const columns = Object.keys(data[0]);
    
    return {
      columns,
      records: data,
      recordCount: data.length
    };
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error}`);
  }
};