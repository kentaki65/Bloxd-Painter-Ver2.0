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
      const x = originX + dx;
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

function hexToRgb(hex: string): [number, number, number] {
  if (hex === "transparent") return [0, 0, 0];
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}