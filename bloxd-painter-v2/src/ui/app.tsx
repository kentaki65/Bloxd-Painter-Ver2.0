import { useEffect, useState } from "react";
import MenuBar from "./components/menuBar";
import UnderBar from "./components/undetbar";
import Viewer from "./components/viewer";
import { VoxelWorld } from "../world/VoxelWorld";
import { HeightOverrideLayer } from "../world/overrideLayers/HeightOverrideLayer";
import { BiomeOverrideLayer } from "../world/overrideLayers/BiomeOverrideLayer";
import { createGenerator, generateChunksAsync } from "../world/generateChunk";
import { applyHeightBrush } from "../brush/heightBrush";
import { applyBiomeBrush } from "../brush/biomeBrush";

const SEED = "vast_ridge_755876";
const chunkX = 10;
const chunkY = 10;
const chunkZ = 10;

const CHUNK_Y_START = -32;

export function App() {
  const [world] = useState(() => new VoxelWorld());
  const [heightOverrideLayer] = useState(() => new HeightOverrideLayer());
  const [biomeOverrideLayer] = useState(() => new BiomeOverrideLayer());
  const [generator] = useState(() => createGenerator(SEED, 1, biomeOverrideLayer, heightOverrideLayer));

  const [brushMode, setBrushMode] = useState<"height" | "biome">("height");
  const [biomeType, setBiomeType] = useState<number>(1);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    generateChunksAsync(world, generator, chunkX, chunkY, chunkZ).then(() => {
      setIsReady(true);
    })
  }, [])
  
  function handleSetBiomeType(newValue: string) {
    const value = parseInt(newValue, 10);
    if (Number.isNaN(value)) return;

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
      <MenuBar />
      {isReady && (
        <Viewer world={world} onPaint={handlePaint}/>
      )}
      <UnderBar />
    </div>
  )
}