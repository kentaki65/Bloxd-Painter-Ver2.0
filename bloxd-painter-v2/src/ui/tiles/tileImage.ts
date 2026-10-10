// tileImage.ts
import { TILE_SIZE } from "../../core/TileProtocol";
import type { BlockColorTable } from "./blockColorTable";
import type { RenderSettings } from "./renderSettings";
import { colorAt, type BiomePalette, type RGB } from "./tileColor";

const MISSING: BiomePalette = { land: [255, 0, 255], seabed: [255, 0, 255] };

const CONTOUR_INTERVAL: Record<number, number> = { 1: 12, 2: 12, 4: 16, 8: 32, 16: 32 };
const CONTOUR_DARKEN = 0.01;

// 隣のタイルが欠けている方向のビット
export const EDGE_E = 1; // ワールド x+ 側(画面の左)
export const EDGE_W = 2; // ワールド x- 側(画面の右)
export const EDGE_N = 4; // ワールド z- 側(画面の上)
export const EDGE_S = 8; // ワールド z+ 側(画面の下)

// 陰影の調整値
const SHADE_STRENGTH = 1;
const SHADE_MIN = 0.8;
const SHADE_MAX = 1.4;

const WATER_RGB: RGB = [48, 96, 208];

export interface TileLike {
  ground: Int16Array;
  water: Int16Array;
  biomeId: Uint8Array;
  groundBlock?: Uint16Array;
}

// 隣のタイル(同じ step)の高さ配列。なければ undefined
export interface Neighbors {
  east?: Int16Array;  // tx+1
  west?: Int16Array;  // tx-1
  north?: Int16Array; // tz-1
  south?: Int16Array; // tz+1
}

export interface RenderOptions {
  palettes: BiomePalette[];
  blockColors: BlockColorTable;
  surfaceIsWater: boolean[]; // バイオームごとに、水面のブロックが Water か
  settings: RenderSettings;
}

export interface RenderResult {
  image: OffscreenCanvas;
  missing: number; // 欠けていた方向のビット和
}

function blendWater(seabed: RGB, depth: number, out: RGB) {
  const a = 0.4 + 0.5 * Math.min(Math.max(depth, 0) / 16, 1);
  out[0] = seabed[0] * (1 - a) + WATER_RGB[0] * a;
  out[1] = seabed[1] * (1 - a) + WATER_RGB[1] * a;
  out[2] = seabed[2] * (1 - a) + WATER_RGB[2] * a;
}

export function renderTile(
  data: TileLike,
  opts: RenderOptions,
  nb: Neighbors,
  step: number,
  target?: OffscreenCanvas,
): RenderResult {
  const { palettes, blockColors, surfaceIsWater, settings } = opts;
  const useBlock = settings.mode === "block" && data.groundBlock !== undefined;
  
  const T = TILE_SIZE;
  const image = target ?? new OffscreenCanvas(T, T);
  const ctx = image.getContext("2d")!;
  const imgData = ctx.createImageData(T, T);
  const px = imgData.data;
  const g = data.ground;
  const rgb: RGB = [0, 0, 0];

  const missing =
    (nb.east ? 0 : EDGE_E) | (nb.west ? 0 : EDGE_W) |
    (nb.north ? 0 : EDGE_N) | (nb.south ? 0 : EDGE_S);

  let interval = CONTOUR_INTERVAL[step] ?? 32;
  if(opts.settings.countorsOverride.contorsIntervalOverride) interval = opts.settings.countorsOverride.contourInterval!;

  for (let dz = 0; dz < T; dz++) {
    for (let dx = 0; dx < T; dx++) {
      const i = dz * T + dx;
      const ground = g[i];
      const water = data.water[i];

      const biomeId = data.biomeId[i];
      const palette = palettes[biomeId] ?? MISSING;
      const isWater = water > ground;

      if (useBlock) {
        const bed = blockColors.get(data.groundBlock![i]);
        if (!isWater) {
          rgb[0] = bed[0]; rgb[1] = bed[1]; rgb[2] = bed[2];
        } else if (surfaceIsWater[biomeId]) {
          blendWater(bed, water - ground, rgb);
        } else {
          rgb[0] = palette.seabed[0]; rgb[1] = palette.seabed[1]; rgb[2] = palette.seabed[2];
        }
      } else {
        colorAt(palette, ground, water, rgb);
      }

      let m = 1;
      if (!(water > ground)) {
        const hE = dx < T - 1 ? g[i + 1] : nb.east ? nb.east[dz * T] : ground;
        const hW = dx > 0 ? g[i - 1] : nb.west ? nb.west[dz * T + T - 1] : ground;
        const hS = dz < T - 1 ? g[i + T] : nb.south ? nb.south[dx] : ground;
        const hN = dz > 0 ? g[i - T] : nb.north ? nb.north[(T - 1) * T + dx] : ground;

        if(settings.shading){
          const dhdx = (hW - hE) / (2 * step);
          const dhdz = (hS - hN) / (2 * step);
          m = 1 + SHADE_STRENGTH * (dhdx + dhdz);
          if (m < SHADE_MIN) m = SHADE_MIN;
          else if (m > SHADE_MAX) m = SHADE_MAX;          
        }

        if(settings.contours){
          const lv = Math.floor(ground / interval);
          if (
            lv > Math.floor(hE / interval) ||
            lv > Math.floor(hW / interval) ||
            lv > Math.floor(hS / interval) ||
            lv > Math.floor(hN / interval)
          ) {
            m *= CONTOUR_DARKEN;
          }          
        }

      }

      const sx = T - 1 - dx; // 左右反転して書く
      const o = (dz * T + sx) * 4;
      px[o] = rgb[0] * m;     // Uint8ClampedArray なので、はみ出しは自動で丸められる
      px[o + 1] = rgb[1] * m;
      px[o + 2] = rgb[2] * m;
      px[o + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return { image, missing };
}