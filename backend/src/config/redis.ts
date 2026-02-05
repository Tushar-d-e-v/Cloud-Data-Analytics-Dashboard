import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL as string);

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

export default redis;