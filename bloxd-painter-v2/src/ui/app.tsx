import { useEffect, useState } from "react";
import { VoxelWorld } from "../world/VoxelWorld";
import { createGenerator, generateAndApplyChunk } from "../world/generateChunk";
import { applyHeightBrush } from "../brush/heightBrush";
import { applyBiomeBrush } from "../brush/biomeBrush";
import { HeightOverrideLayer } from "../world/overrideLayers/HeightOverrideLayer";
import { BiomeOverrideLayer } from "../world/overrideLayers/BiomeOverrideLayer";
import { MapCanvas } from "./mapCanvas";
import {  chunkSize } from "../core/types";

const SEED = "vast_ridge_755876";
const chunkX = 10;
const chunkY = 6;
const chunkZ = 10;

const CHUNK_Y_START = -32;

export function App() {
  const [world] = useState(() => new VoxelWorld());
  const [heightOverrideLayer] = useState(() => new HeightOverrideLayer());
  const [biomeOverrideLayer] = useState(() => new BiomeOverrideLayer());
  const [generator] = useState(() => createGenerator(SEED, 1, biomeOverrideLayer, heightOverrideLayer));

  const [brushMode, setBrushMode] = useState<"height" | "biome">("height");
  const [isReady, setIsReady] = useState(false);

  const [ biomeType, setBiomeType ] = useState<number>(1);

  useEffect(() => {
    for (let cx = 0; cx < chunkX; cx++) {
      for (let cy = 0; cy < chunkY; cy++) {
        for (let cz = 0; cz < chunkZ; cz++) {
          generateAndApplyChunk(world, generator, cx * chunkSize, -32 + cy * chunkSize, cz * chunkSize);
        }
      }
    }
    setIsReady(true);
  }, [])

  function handleSetBiomeType(newValue: string){
    const value = parseInt(newValue, 10);
    if(Number.isNaN(value)) return;

    setBiomeType(value);
  }

  function handlePaint(x: number, z: number) {
    const biomeId = biomeType;

    if (brushMode === "height") {
      applyHeightBrush(world, generator, heightOverrideLayer, x, z, 15, chunkY, CHUNK_Y_START);
    } else {
      applyBiomeBrush(world, generator, biomeOverrideLayer, x, z, biomeId, chunkY, CHUNK_Y_START);
    }
  }

  return (
    <div className="screen">
      {isReady ? (
        <MapCanvas world={world} onPaint={handlePaint} />
      ) : (
        <div>生成中...</div>
      )}
      <button onClick={() => setBrushMode(brushMode === "height" ? "biome" : "height")}>
        Mode: {brushMode}
      </button>
      <label>
        biomeId: <input value={biomeType} type="number" onChange={e => handleSetBiomeType(e.target.value)}></input>
      </label>
    </div>
  );
}