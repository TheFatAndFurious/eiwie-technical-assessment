import { Redis } from 'ioredis';
import { CacheService } from '../interfaces/cache.service.interface';
import { InternalServerErrorException } from '@nestjs/common';

export class RedisCacheService implements CacheService {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    let data: string | null = null;

    try {
      data = await this.redis.get(key);
    } catch (e) {
      console.error('Redis error, could not get data', e);
      throw new InternalServerErrorException(e);
    }

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as T;
    } catch (e) {
      console.error('Could not parse JSON', e);
      throw new InternalServerErrorException('Error parsing data ', e);
    }
  }
  async set<T>(key: string, value: any): Promise<void> {}
  async delete<T>(key: string): Promise<void> {}
}

