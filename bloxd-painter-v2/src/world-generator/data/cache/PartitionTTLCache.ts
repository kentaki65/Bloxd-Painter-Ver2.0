import { TTLCache } from "@isaacs/ttlcache";

export class PartitionTTLCache<T> {
  getGlobalKey: (key: string) => string;
  globalTTLCache: TTLCache<string, unknown>;

  constructor(
    getGlobalKey: (key: string) => string,
    globalTTLCache: TTLCache<string, unknown>
  ) {
    this.getGlobalKey = getGlobalKey;
    this.globalTTLCache = globalTTLCache;
  }

  get(key: string): T | undefined {
    const globalKey = this.getGlobalKey(key);
    return this.globalTTLCache.get(globalKey) as T | undefined;
  }

  set(key: string, value: T): void {
    const globalKey = this.getGlobalKey(key);
    this.globalTTLCache.set(globalKey, value);
  }

  delete(key: string): boolean {
    const globalKey = this.getGlobalKey(key);
    return this.globalTTLCache.delete(globalKey);
  }
}