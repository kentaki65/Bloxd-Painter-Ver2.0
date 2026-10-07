// tileImage.ts
import { TILE_SIZE } from "../../core/TileProtocol";
import { colorAt, type BiomePalette, type RGB } from "./tileColor";

const MISSING: BiomePalette = { land: [255, 0, 255], seabed: [255, 0, 255] };

export function createTileImage(
  data: { ground: Int16Array; water: Int16Array; biomeId: Uint8Array },
  palettes: BiomePalette[],
): OffscreenCanvas {
  const image = new ImageData(TILE_SIZE, TILE_SIZE);
  const px = image.data;
  const rgb: RGB = [0, 0, 0];

  for (let dz = 0; dz < TILE_SIZE; dz++) {
    for (let dx = 0; dx < TILE_SIZE; dx++) {
      const i = dz * TILE_SIZE + dx;
      const palette = palettes[data.biomeId[i]!] ?? MISSING;
      colorAt(palette, data.ground[i]!, data.water[i]!, rgb);

      const o = (dz * TILE_SIZE + (TILE_SIZE - 1 - dx)) * 4;
      px[o] = rgb[0];
      px[o + 1] = rgb[1];
      px[o + 2] = rgb[2];
      px[o + 3] = 255;
    }
  }

  const canvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE);
  canvas.getContext("2d")!.putImageData(image, 0, 0);
  return canvas;
}