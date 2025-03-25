import { Redis } from 'ioredis';

export async function invalidateRedisTransactions(
  pattern: string,
  redis: Redis,
): Promise<void> {
  const keysToErase: string[] = await redis.keys(pattern);
  if (keysToErase) {
    console.log('keysToErase', keysToErase);
    await redis.del(keysToErase[0]);
  }
}
