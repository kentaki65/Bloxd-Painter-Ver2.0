import { getColor } from "../../render/blockColors";
import { OUT_OF_RUNGE_NUMBER } from "../../core/TileProtocol";
import type { BiomeSurface } from "../../world/worker/Worker";

// tileColor.ts
export type RGB = [number, number, number];

export interface BiomePalette {
  land: RGB;
  seabed: RGB;
}

const WATER_RGB: RGB = [48, 96, 208];
const FALLBACK_RGB: RGB = [128, 128, 128]; // "transparent" など、色にできないとき

function hexToRgb(hex: string): RGB {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return FALLBACK_RGB;
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

// 添字 = biomeId
export function buildPalettes(surfaces: BiomeSurface[]): BiomePalette[] {
  return surfaces.map((s) => ({
    land: hexToRgb(getColor(s.topsoil)),
    seabed: hexToRgb(getColor(s.topwater)),
  }));
}

// 1サンプルの色を out に書く(毎回、新しい配列を作らないため)
export function colorAt(p: BiomePalette, ground: number, water: number, out: RGB): void {
  if (water === OUT_OF_RUNGE_NUMBER.NO_WATER_VALUE) {
    out[0] = p.land[0];
    out[1] = p.land[1];
    out[2] = p.land[2];
    return;
  }
  // 水の深さが深いほど、青を濃くする(深さ16以上で一定)
  const depth = water - ground;
  const a = 0.4 + 0.5 * Math.min(Math.max(depth, 0) / 16, 1);
  out[0] = Math.round(p.seabed[0] * (1 - a) + WATER_RGB[0] * a);
  out[1] = Math.round(p.seabed[1] * (1 - a) + WATER_RGB[1] * a);
  out[2] = Math.round(p.seabed[2] * (1 - a) + WATER_RGB[2] * a);
}