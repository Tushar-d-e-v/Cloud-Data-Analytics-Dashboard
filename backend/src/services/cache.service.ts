import redis from '../config/redis';

export class CacheService {
  async get(key: string): Promise<any> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Analytics-specific cache methods
  getAnalyticsCacheKey(datasetId: string, metric: string): string {
    return `analytics:${datasetId}:${metric}`;
  }

  async getAnalytics(datasetId: string, metric: string): Promise<any> {
    const key = this.getAnalyticsCacheKey(datasetId, metric);
    return this.get(key);
  }

  async setAnalytics(datasetId: string, metric: string, data: any): Promise<void> {
    const key = this.getAnalyticsCacheKey(datasetId, metric);
    await this.set(key, data, 7200); // 2 hours TTL
  }

  async invalidateDatasetCache(datasetId: string): Promise<void> {
    try {
      const keys = await redis.keys(`analytics:${datasetId}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

export default new CacheService();