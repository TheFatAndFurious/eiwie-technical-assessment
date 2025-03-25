import { Cache} from "cache-manager";

export async function invalidateTransactionsCache(
  userId: string,
  cacheManager: Cache,
): Promise<void> {
  const pattern = `transactions:userId:${userId}*`;
  await cacheManager.clear();
  console.log("Invalidate cache", pattern);
}

