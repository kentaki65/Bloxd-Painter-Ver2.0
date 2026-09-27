// src/render/renderTop.ts
import { worldToCanvasX } from "../core/utils";
import { VoxelWorld } from "../world/VoxelWorld";
import { getColor } from "./blockColors";

export function renderTopDown(
  world: VoxelWorld,
  ctx: OffscreenCanvasRenderingContext2D,
  originX: number, originZ: number,
  width: number, height: number
): void {
  const imageData = ctx.createImageData(width, height);

  for (let dz = 0; dz < height; dz++) {
    for (let dx = 0; dx < width; dx++) {
      const x = originX + dx;
      const z = originZ + dz;
      const top = world.findTopBlock(x, z);
      const color = top ? getColor(top.blockId) : "#000000";
      const [r, g, b] = hexToRgb(color);

      const canvasX = worldToCanvasX(x, originX, width);

      const idx = (dz * width + canvasX) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export function renderTopDownPartial(
  world: VoxelWorld,
  ctx: OffscreenCanvasRenderingContext2D,
  viewOriginX: number, viewOriginZ: number,
  updateX: number, updateZ: number,
  updateWidth: number, updateHeight: number
): void {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let dz = 0; dz < updateHeight; dz++) {
    for (let dx = 0; dx < updateWidth; dx++) {
      const x = updateX + dx;         // 反転なし、素直に
      const z = updateZ + dz;
      const top = world.findTopBlock(x, z);
      const color = top ? getColor(top.blockId) : "#000000";
      const [r, g, b] = hexToRgb(color);

      const canvasX = worldToCanvasX(x, viewOriginX, ctx.canvas.width);  // 書き込み先だけ変換
      const canvasY = z - viewOriginZ;

      if (canvasX < 0 || canvasX >= ctx.canvas.width || canvasY < 0 || canvasY >= ctx.canvas.height) continue;
      const idx = (canvasY * ctx.canvas.width + canvasX) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex: string): [number, number, number] {
  if (hex === "transparent") return [0, 0, 0];
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}