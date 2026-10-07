// tileCache.ts
import { LRUCache } from "lru-cache";

export interface TileData {
  ground: Int16Array<ArrayBuffer>;
  water: Int16Array<ArrayBuffer>;
  biomeId: Uint8Array<ArrayBuffer>;
  image: OffscreenCanvas;
}

export function tileKey(step: number, tx: number, tz: number): string {
  return `${step},${tx},${tz}`;
}

// 1枚は約80KB(16384 × (2 + 2 + 1) バイト)。120MB で約1500枚。
const DEFAULT_MAX_BYTES = 120 * 1024 * 1024;

export class TileCache {
  private cache: LRUCache<string, TileData>;

  constructor(maxBytes = DEFAULT_MAX_BYTES) {
    this.cache = new LRUCache<string, TileData>({
      maxSize: maxBytes,
      sizeCalculation: (t) => t.ground.byteLength + t.water.byteLength + t.biomeId.byteLength,
    });
  }

  // 持っているかだけ見る(新しさは更新しない)
  has(step: number, tx: number, tz: number): boolean {
    return this.cache.has(tileKey(step, tx, tz));
  }

  // 実際に使う(新しさを更新する)
  get(step: number, tx: number, tz: number): TileData | undefined {
    return this.cache.get(tileKey(step, tx, tz));
  }

  set(step: number, tx: number, tz: number, data: TileData): void {
    this.cache.set(tileKey(step, tx, tz), data);
  }
}