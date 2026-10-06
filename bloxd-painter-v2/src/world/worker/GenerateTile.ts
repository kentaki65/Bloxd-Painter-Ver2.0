import type { ColumnSample, ColumnSampler } from "./ColumnSampler";
import { TILE_SIZE } from "./TileProtocol";

export function generateTile(sampler: ColumnSampler, steps: number, tx: number, tz: number) {
  const out: ColumnSample = { ground: 0, water: 0, biomeId: 0 };
  const ground = new Int16Array(TILE_SIZE * TILE_SIZE);
  const water = new Int16Array(TILE_SIZE * TILE_SIZE);
  const biomeId = new Uint8Array(TILE_SIZE * TILE_SIZE);

  //左上の座標
  //x or z * tilesize * steps
  const leftX = tx * TILE_SIZE * steps;
  const leftZ = tz * TILE_SIZE * steps;

  for (let dz = 0; dz < TILE_SIZE; dz++) {
    for (let dx = 0; dx < TILE_SIZE; dx++) {
      //ワールド座標
      //左上 + dx or dz * steps
      const x = leftX + dx * steps;
      const z = leftZ + dz * steps;

      sampler.sample(x, z, out);

      const index = dz * TILE_SIZE + dx;
      ground[index] = out.ground;
      water[index] = out.water;
      biomeId[index] = out.biomeId;
    }
  }

  return { ground, water, biomeId };
}