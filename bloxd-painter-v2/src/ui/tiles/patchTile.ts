import { TILE_SIZE } from "../../core/TileProtocol";
import type { WorldGenerator } from "../../world-generator";
import type { ColumnSampler } from "../../world/worker/ColumnSampler";
import type { TilePatchMessage } from "../../world/worker/Worker";
import { getGroundBlockId } from "./groundBlock";

export function patchTile(
  sampler: ColumnSampler,
  generator: WorldGenerator,
  step: number,
  tx: number,
  tz: number,
  rect: { x0: number; x1: number; z0: number; z1: number },
  epoch: number,
): TilePatchMessage | null {
  const size = TILE_SIZE * step;
  const bx = tx * size;
  const bz = tz * size;

  // rect に入るサンプルの範囲(タイル内の添字)
  const dx0 = Math.max(0, Math.ceil((rect.x0 - bx) / step));
  const dx1 = Math.min(TILE_SIZE - 1, Math.ceil((rect.x1 - bx) / step) - 1);
  const dz0 = Math.max(0, Math.ceil((rect.z0 - bz) / step));
  const dz1 = Math.min(TILE_SIZE - 1, Math.ceil((rect.z1 - bz) / step) - 1);
  if (dx0 > dx1 || dz0 > dz1) return null;

  const n = (dx1 - dx0 + 1) * (dz1 - dz0 + 1);
  const indices = new Uint16Array(n);
  const ground = new Int16Array(n);
  const water = new Int16Array(n);
  const biomeId = new Uint8Array(n);
  const groundBlock = new Uint16Array(n);

  const out = { ground: 0, water: 0, biomeId: 0 }; // generateTile と同じ形に
  let i = 0;
  for (let dz = dz0; dz <= dz1; dz++) {
    for (let dx = dx0; dx <= dx1; dx++) {
      const x = bx + dx * step;
      const z = bz + dz * step;
      sampler.sample(x, z, out as any);
      indices[i] = dz * TILE_SIZE + dx;
      ground[i] = out.ground;
      water[i] = out.water;
      biomeId[i] = out.biomeId;
      groundBlock[i] = getGroundBlockId(generator, out.biomeId, x, z, out.ground, out.water);
      i++;
    }
  }
  return { type: "tilePatch", epoch, step, tx, tz, indices, ground, water, biomeId, groundBlock };
}