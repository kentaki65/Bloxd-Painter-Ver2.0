import { TTLCacheOption } from "@/core/types.js";
import { TTLCache } from "@isaacs/ttlcache";
import { PartitionTTLCache } from "./PartitionTTLCache.js";


export class PartitionedTTLCache {
  static DEFAULT_KEY_SEPARATOR = "$";
  nextUniquePartitionId: number;
  keySeparator: string;
  globalTTLCache: TTLCache<string, unknown>;

  constructor(options: TTLCacheOption) {
    this.nextUniquePartitionId = 0;
    this.keySeparator = options.keySeparator;

    this.globalTTLCache = new TTLCache<string, unknown>({
      ttl: options.ttl,
      max: options.max,
      updateAgeOnGet: options.updateAgeOnGet
    });
  }

  partitionTTLCache<T>(): PartitionTTLCache<T> {
    const partitionId = this.nextUniquePartitionId++;

    return new PartitionTTLCache<T>(
      (key: string) => this.getKeyForPartition(partitionId, key),
      this.globalTTLCache
    );
  }

  getKeyForPartition(partitionId: number, key: string) {
    return `${partitionId}${this.keySeparator}${key}`;
  }
}