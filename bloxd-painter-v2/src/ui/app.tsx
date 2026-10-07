import { useEffect, useRef, useState } from "react";

import MenuBar from "./components/menuBar";
import UnderBar from "./components/undetbar";
import Viewer from "./components/viewer";
import CreateWorldModal from "./components/overlayModal";

import { VoxelWorld } from "../world/VoxelWorld";
import { HeightOverrideLayer } from "../world/overrideLayers/HeightOverrideLayer";
import { BiomeOverrideLayer } from "../world/overrideLayers/BiomeOverrideLayer";
import { createGenerator, generateChunksAsync } from "../world/generateChunk";
import { applyHeightBrush } from "../brush/heightBrush";
import { applyBiomeBrush } from "../brush/biomeBrush";
import { BiomeId, BRUSH_RADIUS } from "../core/types";
import type { ToolId, WorldSettings } from "./components/common/types";
import { TileClient } from "./tiles/tileClient";

const CHUNK_Y_START = -32;

export function App() {
  const worldInfo = useRef<WorldSettings>({
    fileName: "idk",
    seed: "1",
    chunkX: 10,
    chunkZ: 10,
    chunkY: 10,
  })

  const [world, setWorld] = useState(() => new VoxelWorld());
  const [heightOverrideLayer, setHeightOverrideLayer] = useState(new HeightOverrideLayer());
  const [biomeOverrideLayer, setBiomeOverrideLayer] = useState(new BiomeOverrideLayer());
  const [generator, setGenerator] = useState(() => createGenerator(worldInfo.current.seed, 1, biomeOverrideLayer, heightOverrideLayer));

  const [brushMode, setBrushMode] = useState<ToolId>("height");
  const [biomeType, setBiomeType] = useState<BiomeId>(6);

  const [isReady, setIsReady] = useState(false);
  const [isCreateWorldModalOpen, setCreateWorldModalOpen] = useState(false);

  useEffect(() => {
    generateChunksAsync(world, worldInfo.current).then(() => {
      setIsReady(true);
    })
  }, [world])

  function handlePaint(x: number, z: number) {
    if (brushMode === "height") {
      applyHeightBrush(world, generator, heightOverrideLayer, x, z, 15, worldInfo.current.chunkY, CHUNK_Y_START);
    } else if (brushMode === "biome") {
      applyBiomeBrush(world, generator, biomeOverrideLayer, x, z, biomeType, worldInfo.current.chunkY, CHUNK_Y_START);
    } else {
      //なにもせえへんで
    }
  }

  const handleChangeBrush = (newTool: ToolId) => setBrushMode(newTool);
  const handleChangeBiome = (newBiome: BiomeId) => {
    setBiomeType(newBiome)
  };

  return (
    <div className="screen">
      <MenuBar onOpenCreateWorld={() => setCreateWorldModalOpen(true)} />
    
      {isReady && <Viewer
        world={world}
        worldInfo={worldInfo.current}

        selectedTool={brushMode}
        selectedBiome={biomeType}
        onPaint={handlePaint}

        onChangeBiome={handleChangeBiome}
        onChangeBrush={handleChangeBrush}
      />}

      <UnderBar location={[1, 2, 3]} height={2} slope={2} biome={biomeType} radius={BRUSH_RADIUS} zoom={20} />

      <CreateWorldModal
        isOpen={isCreateWorldModalOpen}
        onConfirm={(worldSetting) => {
          worldInfo.current = worldSetting;

          setIsReady(false);

          const newWorld = new VoxelWorld();
          const newHeightOverrideLayer = new HeightOverrideLayer();
          const newBiomeOverrideLayer = new BiomeOverrideLayer();
          const newGenerator = createGenerator(worldInfo.current.seed, 1, newBiomeOverrideLayer, newHeightOverrideLayer);

          setWorld(newWorld);
          setHeightOverrideLayer(newHeightOverrideLayer);
          setBiomeOverrideLayer(newBiomeOverrideLayer);
          setGenerator(newGenerator);

          setCreateWorldModalOpen(false);
        }}
        onClose={() => setCreateWorldModalOpen(false)}
      />
    </div>
  )
}