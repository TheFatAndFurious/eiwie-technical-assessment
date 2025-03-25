import { Redis } from 'ioredis';

export const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => new Redis('redis://localhost:6379'),
};