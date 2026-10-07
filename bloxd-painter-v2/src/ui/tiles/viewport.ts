
import { TILE_SIZE } from "../../core/TileProtocol";
import type { TileCache } from "./tileCache";
import type { WorldRect, TileCoord, CameraRef } from "../../core/types";

export type Camera = Omit<CameraRef, "panning" | "panStartX" | "panStartY">
export const STEPS = [1, 2, 4, 8, 16] as const;

export function chooseStep(zoom: number): number {
  console.log(zoom);
  let step = 1; // どれも満たさないとき(ズームが大きいとき)は 1
  for (const s of STEPS) {
    if (s * zoom <= 1 + 1e-9) step = s;
  }
  return step;
}

export function getVisibleWorldRect(
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
  marginBlocks = 0
): WorldRect {
  const { camX, camY, zoom } = camera;
  const rawLeft = (0 - camX) / zoom;
  const rawRight = (canvasWidth - camX) / zoom;

  const xa = -rawLeft;
  const xb = -rawRight;

  const z0 = (0 - camY) / zoom;
  const z1 = (canvasHeight - camY) / zoom;

  return {
    x0: Math.min(xa, xb) - marginBlocks,
    x1: Math.max(xa, xb) + marginBlocks,
    z0: z0 - marginBlocks,
    z1: z1 + marginBlocks,
  };
}

export interface TileRange {
  step: number;
  txMin: number;
  txMax: number;
  tzMin: number;
  tzMax: number;
}
// 見える範囲を覆う、タイル番号の範囲

export function getTileRange(rect: WorldRect, step: number): TileRange {
  const size = TILE_SIZE * step; // タイル1枚が覆うブロック数
  return {
    step,
    txMin: Math.floor(rect.x0 / size),
    txMax: Math.floor(rect.x1 / size),
    tzMin: Math.floor(rect.z0 / size),
    tzMax: Math.floor(rect.z1 / size),
  };
}
// 範囲を、タイルの一覧にする

export function expandRange(r: TileRange): TileCoord[] {
  const tiles: TileCoord[] = [];
  for (let tz = r.tzMin; tz <= r.tzMax; tz++) {
    for (let tx = r.txMin; tx <= r.txMax; tx++) {
      tiles.push({ step: r.step, tx, tz });
    }
  }
  return tiles;
}

export function buildTileRequest(
  rect: WorldRect,
  targetStep: number,
  cache: TileCache,
): TileCoord[] {
  // 見える範囲の中心(ブロック座標)。近い順に並べるための基準
  const cx = (rect.x0 + rect.x1) / 2;
  const cz = (rect.z0 + rect.z1) / 2;

  const result: TileCoord[] = [];

  // 16 から目標の段階まで、粗い順
  const levels = STEPS.filter((s) => s >= targetStep).reverse();

  for (const step of levels) {
    const size = TILE_SIZE * step;

    // 範囲 → 一覧 → キャッシュにないものだけ
    const missing = expandRange(getTileRange(rect, step)).filter(
      (t) => !cache.has(t.step, t.tx, t.tz),
    );

    // 画面の中心に近い順
    const dist = (t: TileCoord) => {
      const dx = (t.tx + 0.5) * size - cx;
      const dz = (t.tz + 0.5) * size - cz;
      return dx * dx + dz * dz;
    };
    missing.sort((a, b) => dist(a) - dist(b));

    result.push(...missing);
  }

  return result;
}