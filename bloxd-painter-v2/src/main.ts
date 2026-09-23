import { VoxelWorld } from "./world/VoxelWorld";
import { createGenerator, generateAndApplyChunk } from "./world/generateChunk";
import { BRUSH_RADIUS, chunkSize } from "./core/types";
import { renderTopDown, renderTopDownPartial } from "./render/renderTop";
import { HeightOverrideLayer } from "./world/overrideLayers/HeightOverrideLayer";
import { Viewer3D } from "./render/viewer3d";
import { applyHeightBrush } from "./brush/heightBrush";
import { BiomeOverrideLayer } from "./world/overrideLayers/BiomeOverrideLayer";
import { applyBiomeBrush } from "./brush/biomeBrush";

const world = new VoxelWorld();
const biomeOverrideLayer = new BiomeOverrideLayer();
const heightOverrideLayer = new HeightOverrideLayer();

const seed = "vast_ridge_755876"; //vast_ridge_755876
const generator = createGenerator(seed, 1, biomeOverrideLayer, heightOverrideLayer);

let brushMode: "height" | "biome" = "height";
const TEST_BIOME_ID = 16; //

const chunkX = 10;
const chunkY = 10;
const chunkZ = 10;

for (let cx = 0; cx < chunkX; cx++) {
  for (let cy = 0; cy < chunkY; cy++){
    for (let cz = 0; cz < chunkZ; cz++) {
      generateAndApplyChunk(world, generator, cx * chunkSize, -32 + cy * chunkSize, cz * chunkSize);
    }    
  }
}

const viewerContainer = document.getElementById("viewer3d") as HTMLElement;
const viewer = new Viewer3D(viewerContainer);
viewer.renderHeightfield(world, 0, 0, 320, 320);

const canvas = document.getElementById("map") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
renderTopDown(world, ctx, 0, 0, 320, 320);

const viewOriginX = 0;
const viewOriginZ = 0;
const FIXED_HEIGHT = 15; // とりあえず固定値でテスト

let isDragging = false;

function paintAt(clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  const canvasX = clientX - rect.left;
  const canvasY = clientY - rect.top;
  const worldX = viewOriginX + (canvas.width - 1 - Math.floor(canvasX));
  const worldZ = viewOriginZ + Math.floor(canvasY);

  if (brushMode === "height") {
    applyHeightBrush(world, generator, heightOverrideLayer, worldX, worldZ, FIXED_HEIGHT, chunkY, -32);
  } else {
    applyBiomeBrush(world, generator, biomeOverrideLayer, worldX, worldZ, TEST_BIOME_ID, chunkY, -32);
  }

  const margin = BRUSH_RADIUS + 2;
  renderTopDownPartial(world, ctx, viewOriginX, viewOriginZ, worldX - margin, worldZ - margin, margin * 2, margin * 2);
  viewer.updateHeightfieldPartial(world, worldX - margin, worldZ - margin, margin * 2, margin * 2);
}

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  paintAt(e.clientX, e.clientY);
});
canvas.addEventListener("mousemove", (e) => {
  if (isDragging) paintAt(e.clientX, e.clientY);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "b") {
    brushMode = brushMode === "height" ? "biome" : "height";
    console.log("brush mode:", brushMode);
  }
});

window.addEventListener("mouseup", () => { isDragging = false; });