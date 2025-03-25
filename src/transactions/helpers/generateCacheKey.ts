export function generateCacheKey(
  prefix: string,
  userId: string,
  filters: Record<string, any>,
): string {
  const key = Object.entries(filters)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}:${v}`)
    .join('|');

  return `${prefix}:userId:${userId}|${key}`;
}
