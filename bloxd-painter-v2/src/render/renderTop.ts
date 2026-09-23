// src/render/renderTop.ts
import { VoxelWorld } from "../world/VoxelWorld";
import { getColor } from "./blockColors";

export function renderTopDown(
  world: VoxelWorld,
  ctx: CanvasRenderingContext2D,
  originX: number, originZ: number, // 描画開始座標
  width: number, height: number      // 描画するブロック数
): void {
  const imageData = ctx.createImageData(width, height);

  for (let dz = 0; dz < height; dz++) {
    for (let dx = 0; dx < width; dx++) {
      const x = originX + (width - 1 - dx);;
      const z = originZ + dz;
      const top = world.findTopBlock(x, z);
      const color = top ? getColor(top.blockId) : "#000000";

      const [r, g, b] = hexToRgb(color);
      const idx = (dz * width + dx) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// renderTopDown に範囲限定版を追加
export function renderTopDownPartial(
  world: VoxelWorld,
  ctx: CanvasRenderingContext2D,
  viewOriginX: number, viewOriginZ: number, // ビュー全体の原点
  updateX: number, updateZ: number,          // 更新したい範囲の開始座標（ワールド座標）
  updateWidth: number, updateHeight: number
): void {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let dz = 0; dz < updateHeight; dz++) {
    for (let dx = 0; dx < updateWidth; dx++) {
      const x = updateX + dx;
      const z = updateZ + dz;
      const top = world.findTopBlock(x, z);
      const color = top ? getColor(top.blockId) : "#000000";
      const [r, g, b] = hexToRgb(color);

      // キャンバス上の位置（反転を考慮）
      const canvasX = ctx.canvas.width - 1 - (x - viewOriginX);
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