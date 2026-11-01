import type { ColumnSampler, ColumnSample } from "./ColumnSampler";
import type { HeightOverrideLayer } from "../overrideLayers/HeightOverrideLayer";
import type { BiomeOverrideLayer } from "../overrideLayers/BiomeOverrideLayer";
import type { BiomeId } from "../../core/types";
import type { Stroke } from "../../ui/tiles/history/editHisotry";

export type BrushOp = "raise" | "lower" | "flatten" | "smooth" | "set" | "resetHeight" | "biome" | "biomeReset";

export interface BrushFilter {
  minHeight: number | null;
  maxHeight: number | null;
  minSlope: number | null; // 度
  maxSlope: number | null;
}

export interface BrushStamps {
  op: BrushOp;
  stamps: { x: number; z: number }[];
  radius: number;
  amount: number; // raise/lower: 中心での変化(ブロック)。flatten/smooth: 混ぜる割合 0〜1
  value: number;  // set: 高さ。biome: バイオームID
  filter: BrushFilter;
}

const MIN_HEIGHT = -100; // 調整してください
const MAX_HEIGHT = 255;

// 「上書きなしの高さ」を覚えておく(毎回サンプリングすると遅いため)
const BLOCK = 64;
const UNSET = -32768;

class BaseHeights {
  private blocks = new Map<number, Int16Array>();
  private sampler: ColumnSampler;
  private layer: HeightOverrideLayer;
  private out: ColumnSample = { ground: 0, water: 0, biomeId: 0 };

  constructor(sampler: ColumnSampler, layer: HeightOverrideLayer) {
    this.sampler = sampler;
    this.layer = layer;
  }

  clear() {
    this.blocks.clear();
  }

  // 今の高さ(上書きがあればそれ、なければ生成された高さ)
  get(x: number, z: number): number {
    const ov = this.layer.get(x, z);
    if (ov !== undefined) return ov;

    const bx = Math.floor(x / BLOCK);
    const bz = Math.floor(z / BLOCK);
    const key = (bx + 65536) * 131072 + (bz + 65536);
    let arr = this.blocks.get(key);
    if (!arr) {
      if (this.blocks.size > 4096) this.blocks.clear();
      arr = new Int16Array(BLOCK * BLOCK).fill(UNSET);
      this.blocks.set(key, arr);
    }
    const idx = (z - bz * BLOCK) * BLOCK + (x - bx * BLOCK);
    let v = arr[idx]!;
    if (v === UNSET) {
      this.sampler.sample(x, z, this.out);
      v = this.out.ground;
      arr[idx] = v; // 上書きのない列だけを覚える
    }
    return v;
  }
}

export class BrushEngine {
  private heights: BaseHeights;
  private sampler: ColumnSampler;
  private heightLayer: HeightOverrideLayer;
  private biomeLayer: BiomeOverrideLayer;
  private flatStroke = -1;
  private flatLevel = 0;

  constructor(sampler: ColumnSampler, heightLayer: HeightOverrideLayer, biomeLayer: BiomeOverrideLayer) {
    this.sampler = sampler;
    this.heightLayer = heightLayer;
    this.biomeLayer = biomeLayer;
    this.heights = new BaseHeights(sampler, heightLayer);
  }

  clearCache() {
    this.heights.clear();
  }

  run(p: BrushStamps, strokeId: number, stroke: Stroke): void {
    if (p.op === "biome" || p.op === "biomeReset") {
      if (this.sampler.biomeAffectsHeight) this.heights.clear();
      for (const s of p.stamps) this.biomeStamp(p, s.x, s.z, stroke);
      return;
    }
    if (p.op === "flatten" && this.flatStroke !== strokeId) {
      const first = p.stamps[0];
      if (!first) return;
      this.flatStroke = strokeId;
      this.flatLevel = this.heights.get(first.x, first.z); // ストロークの最初の地点の高さ
    }
    for (const s of p.stamps) {
      if (p.op === "resetHeight") this.resetStamp(p, s.x, s.z, stroke);
      else this.heightStamp(p, s.x, s.z, stroke);
    }
  }

  private biomeStamp(p: BrushStamps, cx: number, cz: number, stroke: Stroke) {
    const r = p.radius;
    const r2 = r * r;
    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dz * dz > r2) continue;
        const x = cx + dx;
        const z = cz + dz;
        stroke.b.add(x, z, this.biomeLayer.get(x, z));
        if (p.op === "biome") this.biomeLayer.set(x, z, p.value as BiomeId);
        else this.biomeLayer.clear(x, z);
      }
    }
  }

  private resetStamp(p: BrushStamps, cx: number, cz: number, stroke: Stroke) {
    const r = p.radius;
    const r2 = r * r;
    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dz * dz > r2) continue;
        const x = cx + dx;
        const z = cz + dz;
        const prev = this.heightLayer.get(x, z);
        if (prev === undefined) continue;
        stroke.h.add(x, z, prev);
        this.heightLayer.clear(x, z);
      }
    }
  }

  private heightStamp(p: BrushStamps, cx: number, cz: number, stroke: Stroke) {
    const r = p.radius;
    const r2 = r * r;
    const M = 1; // 傾斜と平滑化のために、周りを1列ぶん読む
    const n = 2 * r + 1 + 2 * M;
    const ox = cx - r - M;
    const oz = cz - r - M;

    const grid = new Int32Array(n * n);
    for (let gz = 0; gz < n; gz++) {
      for (let gx = 0; gx < n; gx++) grid[gz * n + gx] = this.heights.get(ox + gx, oz + gz);
    }

    const f = p.filter;
    const useSlope = f.minSlope !== null || f.maxSlope !== null;
    const cap = (2 * r + 1) * (2 * r + 1);
    const cxs = new Int32Array(cap);
    const czs = new Int32Array(cap);
    const cnh = new Int32Array(cap);
    let count = 0;

    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        const d2 = dx * dx + dz * dz;
        if (d2 > r2) continue;
        const i = (dz + r + M) * n + (dx + r + M);
        const h = grid[i]!;

        if (f.minHeight !== null && h < f.minHeight) continue;
        if (f.maxHeight !== null && h > f.maxHeight) continue;
        if (useSlope) {
          const sx = (grid[i + 1]! - grid[i - 1]!) / 2;
          const sz = (grid[i + n]! - grid[i - n]!) / 2;
          const slope = (Math.atan(Math.hypot(sx, sz)) * 180) / Math.PI;
          if (f.minSlope !== null && slope < f.minSlope) continue;
          if (f.maxSlope !== null && slope > f.maxSlope) continue;
        }

        const t = Math.sqrt(d2) / r;
        const w = 1 - t * t * (3 - 2 * t); // 中心が1、縁が0のなだらかな減衰

        let nh = h;
        switch (p.op) {
          case "set":
            nh = p.value;
            break;
          case "raise":
            nh = Math.round(h + p.amount * w);
            break;
          case "lower":
            nh = Math.round(h - p.amount * w);
            break;
          case "flatten":
            nh = Math.round(h + (this.flatLevel - h) * Math.min(1, p.amount) * w);
            break;
          case "smooth": {
            const avg =
              (grid[i - n - 1]! + grid[i - n]! + grid[i - n + 1]! +
                grid[i - 1]! + h + grid[i + 1]! +
                grid[i + n - 1]! + grid[i + n]! + grid[i + n + 1]!) / 9;
            nh = Math.round(h + (avg - h) * Math.min(1, p.amount) * w);
            break;
          }
        }
        nh = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, nh));
        if (nh === h) continue;

        cxs[count] = cx + dx;
        czs[count] = cz + dz;
        cnh[count] = nh;
        count++;
      }
    }

    // 全部計算してから、まとめて書き込む(smooth が、順番に左右されないように)
    for (let k = 0; k < count; k++) {
      const x = cxs[k]!;
      const z = czs[k]!;
      stroke.h.add(x, z, this.heightLayer.get(x, z)); // 変える前の値を記録
      this.heightLayer.set(x, z, cnh[k]!);
    }
  }
}