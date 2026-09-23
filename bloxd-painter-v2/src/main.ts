import { VoxelWorld } from "./world/VoxelWorld";
import { createGenerator, generateAndApplyChunk } from "./world/generateChunk";
import { BiomeId, chunkSize } from "./core/types";
import { renderTopDown } from "./render/renderTop";
import { BiomeOverrideLayer } from "./world/overrideLayers/BiomeOverrideLayer";

const world = new VoxelWorld();
const overrideLayer = new BiomeOverrideLayer();

const seed = "vast_ridge_755876";
const generator = createGenerator(seed, 1, overrideLayer);

const chunkX = 10;
const chunkY = 10;
const chunkZ = 10;
const overrideChunkX = 0;
const overrideChunkZ = 0;

for (let cx = 0; cx < chunkX; cx++) {
  for (let cy = 0; cy < chunkY; cy++){
    for (let cz = 0; cz < chunkZ; cz++) {
      generateAndApplyChunk(world, generator, cx * chunkSize, -32 + cy * chunkSize, cz * chunkSize);
    }    
  }
}

const desertBiomeId: BiomeId = 4;

for (let x = 0; x < chunkSize; x++) {
  for (let z = 0; z < chunkSize; z++) {
    overrideLayer.set(x, z, desertBiomeId);
  }
}

generator.mostRecentlyAccessedChunkColumn = null;
generator.chunkColumnInfos.delete(`0|0`);

for (let cy = 0; cy < chunkY; cy++) {
  generateAndApplyChunk(world, generator, overrideChunkX, -32 + cy * chunkSize, overrideChunkZ);
}

console.log(world.getChunkCount());
for (let y = -35; y <= 50; y++) {
  const b = world.getBlock(0, y, 0);
  console.log(`y=${y}: block=${b}`);
}

const canvas = document.getElementById("map") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
renderTopDown(world, ctx, 0, 0, 320, 320);