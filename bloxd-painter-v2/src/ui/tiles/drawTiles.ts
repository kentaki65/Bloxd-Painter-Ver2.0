// drawTiles.ts
import { TILE_SIZE } from "../../core/TileProtocol";
import type { TileClient } from "./tileClient";
import {
  STEPS,
  chooseStep,
  getTileRange,
  getVisibleWorldRect,
  type Camera,
} from "./viewport";

export function drawTiles(
  ctx: CanvasRenderingContext2D,
  client: TileClient,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const { camX, camY, zoom } = camera;
  const targetStep = chooseStep(zoom);

  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.imageSmoothingEnabled = false;

  // 見えている範囲だけ(余白なし)
  const rect = getVisibleWorldRect(camera, canvasWidth, canvasHeight, 0);

  // 粗い段階から先に貼る。細かいタイルが、上から上書きする
  for (const step of STEPS.filter((s) => s >= targetStep).reverse()) {
    const size = TILE_SIZE * step;
    const r = getTileRange(rect, step);

    for (let tz = r.tzMin; tz <= r.tzMax; tz++) {
      for (let tx = r.txMin; tx <= r.txMax; tx++) {
        const image = client.getImage(step, tx, tz);
        if (!image) continue;

        // 画面の x は camX - ワールドの x × zoom(左右反転)
        const left = camX - (tx + 1) * size * zoom;
        const right = camX - tx * size * zoom;
        const top = camY + tz * size * zoom;
        const bottom = camY + (tz + 1) * size * zoom;

        // 端を整数にそろえて、隣のタイルとの隙間・重なりを防ぐ
        const x0 = Math.round(left);
        const y0 = Math.round(top);
        ctx.drawImage(image, x0, y0, Math.round(right) - x0, Math.round(bottom) - y0);
      }
    }
  }
}