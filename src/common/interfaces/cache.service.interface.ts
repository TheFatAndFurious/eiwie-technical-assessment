export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<T>;
  delete(pattern: string): Promise<void>;
  clear(key: string): Promise<void>;
}
