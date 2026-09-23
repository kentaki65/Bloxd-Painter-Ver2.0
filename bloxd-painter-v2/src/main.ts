import { VoxelWorld } from "./world/VoxelWorld";
import { createGenerator, generateAndApplyChunk } from "./world/generateChunk";
import { chunkSize } from "./core/types";
import { renderTopDown } from "./render/renderTop";
import { HeightOverrideLayer } from "./world/overrideLayers/HeightOverrideLayer";
import { Viewer3D } from "./render/viewer3d";

const world = new VoxelWorld();
const heightOverrideLayer = new HeightOverrideLayer();

const seed = "vast_ridge_755876";
const generator = createGenerator(seed, 1, null, heightOverrideLayer);

const chunkX = 10;
const chunkY = 10;
const chunkZ = 10;

// 1. 通常の地形をまず全部生成
for (let cx = 0; cx < chunkX; cx++) {
  for (let cy = 0; cy < chunkY; cy++){
    for (let cz = 0; cz < chunkZ; cz++) {
      generateAndApplyChunk(world, generator, cx * chunkSize, -32 + cy * chunkSize, cz * chunkSize);
    }    
  }
}

// 2. 高さを上書き設定（ブロック座標そのまま。1点だけ上書き）
const targetX = 27;
const targetZ = 208;
heightOverrideLayer.set(targetX, targetZ, 10);

// 3. targetX, targetZ が属する「チャンクの起点座標」を計算
const chunkStartX = Math.floor(targetX / chunkSize) * chunkSize; // = 0
const chunkStartZ = Math.floor(targetZ / chunkSize) * chunkSize; // = 192

// 4. キャッシュを消して、そのチャンク列だけ再生成
generator.mostRecentlyAccessedChunkColumn = null;
generator.chunkColumnInfos.delete(`${chunkStartX}|${chunkStartZ}`);

for (let cy = 0; cy < chunkY; cy++) {
  generateAndApplyChunk(world, generator, chunkStartX, -32 + cy * chunkSize, chunkStartZ);
}

// 5. 確認（targetX, targetZ で見る。ブロック座標はそのままでOK）
console.log(world.getChunkCount());
for (let y = -35; y <= 50; y++) {
  const b = world.getBlock(targetX, y, targetZ);
  console.log(`y=${y}: block=${b}`);
}

const viewerContainer = document.getElementById("viewer3d") as HTMLElement;
const viewer = new Viewer3D(viewerContainer);
viewer.renderHeightfield(world, 0, 0, 320, 320);