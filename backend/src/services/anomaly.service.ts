import { IAnomaly } from '../models/analytics.model';

export interface DataPoint {
  date: string;
  value: number;
}

export class AnomalyService {
  
  // Z-Score based anomaly detection
  static detectZScoreAnomalies(
    data: DataPoint[], 
    threshold: number = 2.5
  ): IAnomaly[] {
    if (data.length < 3) return [];

    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: IAnomaly[] = [];

    data.forEach(point => {
      const zscore = Math.abs((point.value - mean) / stdDev);
      
      if (zscore > threshold) {
        let severity: 'low' | 'medium' | 'high' = 'low';
        
        if (zscore > 4) severity = 'high';
        else if (zscore > 3) severity = 'medium';

        anomalies.push({
          date: point.date,
          value: point.value,
          type: 'z-score',
          severity,
          zscore: zscore
        });
      }
    });

    return anomalies;
  }

  // IQR (Interquartile Range) based anomaly detection
  static detectIQRAnomalies(data: DataPoint[]): IAnomaly[] {
    if (data.length < 4) return [];

    const values = data.map(d => d.value).sort((a, b) => a - b);
    const q1Index = Math.floor(values.length * 0.25);
    const q3Index = Math.floor(values.length * 0.75);
    
    const q1 = values[q1Index];
    const q3 = values[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const anomalies: IAnomaly[] = [];

    data.forEach(point => {
      if (point.value < lowerBound || point.value > upperBound) {
        let severity: 'low' | 'medium' | 'high' = 'low';
        
        const extremeLowerBound = q1 - 3 * iqr;
        const extremeUpperBound = q3 + 3 * iqr;
        
        if (point.value < extremeLowerBound || point.value > extremeUpperBound) {
          severity = 'high';
        } else {
          severity = 'medium';
        }

        anomalies.push({
          date: point.date,
          value: point.value,
          type: 'iqr',
          severity
        });
      }
    });

    return anomalies;
  }

  // Combined anomaly detection
  static detectAnomalies(data: DataPoint[]): IAnomaly[] {
    const zscoreAnomalies = this.detectZScoreAnomalies(data);
    const iqrAnomalies = this.detectIQRAnomalies(data);

    // Merge and deduplicate anomalies
    const anomalyMap = new Map<string, IAnomaly>();

    [...zscoreAnomalies, ...iqrAnomalies].forEach(anomaly => {
      const key = anomaly.date;
      const existing = anomalyMap.get(key);
      
      if (!existing || this.getSeverityScore(anomaly.severity) > this.getSeverityScore(existing.severity)) {
        anomalyMap.set(key, anomaly);
      }
    });

    return Array.from(anomalyMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  private static getSeverityScore(severity: 'low' | 'medium' | 'high'): number {
    switch (severity) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 0;
    }
  }
}

export default AnomalyService;