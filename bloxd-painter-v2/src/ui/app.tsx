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

import type { WorkerResponse } from "../world/worker/Worker";
import type { ToolId, WorldSettings } from "./components/common/types";
import { TileCache, type TileData } from "./tiles/tileCache";
import { buildTileRequest } from "./tiles/viewport";

const CHUNK_Y_START = -32;

export function App() {
  const worldInfo = useRef<WorldSettings>({
    fileName: "idk",
    seed: "vast_ridge_755876",
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

    const worker = new Worker(new URL("../world/worker/Worker.ts", import.meta.url), { type: "module" });
    let sentSecond = false;

    worker.onmessage = (msg) => {
      const res = msg.data as WorkerResponse;

      if (res.type === "initReady") {
        worker.postMessage({
          type: "tileRequest",
          requestId: 1,
          tiles: Array.from({ length: 20 }, (_, i) => ({ step: 1, tx: i, tz: 0 })),
        });
      } else if (res.type === "tile") {
        //console.log(`tile requestId=${res.requestId} step=${res.step} tx=${res.tx} tz=${res.tz}`);

        if (!sentSecond) {
          sentSecond = true;
          worker.postMessage({
            type: "tileRequest",
            requestId: 2,
            tiles: [
              { step: 1, tx: 100, tz: 0 },
              { step: 1, tx: 101, tz: 0 },
            ],
          });

          //---テストゾーン---///
          const makeTile = (): TileData => ({
            ground: new Int16Array(16384),
            water: new Int16Array(16384),
            biomeId: new Uint8Array(16384),
          });

          const cache = new TileCache();
          const rect = { x0: -864, x1: 64, z0: -64, z1: 664 };

          const req = buildTileRequest(rect, 1, cache);
          console.log(req.length, req[0], req[4]);

          cache.set(16, -1, 0, makeTile());
          const req2 = buildTileRequest(rect, 1, cache);
          console.log(req2.length, req2[0]);

        }
      } else if (res.type === "error") {
        console.error(res.message, res.requestId);
      }
    };

    worker.postMessage({ type: "init", seed: "1", maxHeight: 5 });
    return () => worker.terminate();
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