import type { BiomeId, TileCoord } from "../../core/types";
import { EditHistory } from "../../ui/tiles/history/editHisotry";
import { patchTile } from "../../ui/tiles/patchTile";
import type { WorldGenerator } from "../../world-generator";
import { createGenerator } from "../generateChunk";
import { BiomeOverrideLayer } from "../overrideLayers/BiomeOverrideLayer";
import { HeightOverrideLayer } from "../overrideLayers/HeightOverrideLayer";
import { ColumnSampler } from "./ColumnSampler";
import { generateTile } from "./GenerateTile";

interface EditRect { x0: number; x1: number; z0: number; z1: number }
interface TileTarget { step: number; tx: number; tz: number }

export interface BiomeSurface {
  topsoil: number;   // 地表のブロックID
  topwater: number;  // 水面のブロックID
}

export interface HeightEdit {
  x: number;
  z: number;
  value: number | null; // null = 上書きを消す
}

export interface BiomeEdit {
  x: number;
  z: number;
  value: BiomeId | null; // null = 上書きを消す
}

interface SetOptionsMessage {
  type: "setOptions";
  epoch: number;
  biomeAffectsHeight: boolean;
}

interface EditMessage {
  type: "edit";
  epoch: number;
  strokeId: number;
  height: HeightEdit[];
  biome: BiomeEdit[];
  rect: { x0: number; x1: number; z0: number; z1: number }; // x1, z1 は含まない
  targets: { step: number; tx: number; tz: number }[];
}

interface HistoryMessage {
  type: "undo" | "redo";
  epoch: number;
  strokeId: number;
  rect: EditRect;
  targets: TileTarget[];
}

export interface TilePatchMessage {
  type: "tilePatch";
  epoch: number;
  step: number;
  tx: number;
  tz: number;
  indices: Uint16Array<ArrayBuffer>;
  ground: Int16Array<ArrayBuffer>;
  water: Int16Array<ArrayBuffer>;
  biomeId: Uint8Array<ArrayBuffer>;
  groundBlock: Uint16Array<ArrayBuffer>;
}

interface EditAppliedMessage {
  type: "editApplied";
  epoch: number;
}

interface InitMessage {
  type: "init";
  seed: string;
  maxHeight: number;
  cacheSizeMultiplier?: number;
}

interface InitReadyMessage {
  type: "initReady";
  biomeSurfaces: BiomeSurface[];
  waterBlockId: number;
}

interface TileRequest {
  type: "tileRequest"
  requestId: number;
  tiles: TileCoord[]
}

export interface TileMessage extends TileCoord {
  type: "tile",
  requestId: number;
  epoch: number;
  ground: Int16Array<ArrayBuffer>;
  water: Int16Array<ArrayBuffer>;
  biomeId: Uint8Array<ArrayBuffer>;
  groundBlock?: Uint16Array<ArrayBuffer>
}

interface ErrorMessage {
  type: "error";
  message: string;
  requestId?: number;
};

type WorkerMessage = InitMessage | TileRequest | EditMessage | SetOptionsMessage | HistoryMessage;
export type WorkerResponse = InitReadyMessage | TileMessage | EditAppliedMessage | ErrorMessage | TilePatchMessage;

let generator: WorldGenerator | null = null;
let sampler: ColumnSampler | null = null;
let heightLayer: HeightOverrideLayer | null = null;
let biomeLayer: BiomeOverrideLayer | null = null;
let history = new EditHistory();
let appliedEpoch = 0;

let tileQueue: TileCoord[] = [];
let currentRequestId = 0;
let pumping = false;

function sendResponse(data: WorkerResponse, transfer?: Transferable[]) {
  self.postMessage(data, { transfer });
}

function sendPatches(epoch: number, rect: EditRect, targets: TileTarget[]) {
  for (const t of targets) {
    const p = patchTile(sampler!, generator!, t.step, t.tx, t.tz, rect, epoch);
    if (!p) continue;
    sendResponse(p, [p.indices.buffer, p.ground.buffer, p.water.buffer, p.biomeId.buffer, p.groundBlock.buffer]);
  }
  sendResponse({ type: "editApplied", epoch });
}

async function pump() {
  if (pumping) return;
  if (!generator || !sampler) {
    sendResponse({
      type: "error",
      message: "Either the generator or sampler hasn't been initialized",
      requestId: currentRequestId
    })
    return;
  }

  pumping = true;

  try {
    while (tileQueue.length > 0) {
      const firstTile = tileQueue.shift();
      const requestId = currentRequestId;
      if (!firstTile) continue;

      const { ground, water, biomeId, groundBlock } = generateTile(
        sampler, generator, firstTile.step, firstTile.tx, firstTile.tz,
      );

      sendResponse({
        type: "tile",
        requestId: requestId,
        epoch: appliedEpoch,
        step: firstTile.step,
        tx: firstTile.tx,
        tz: firstTile.tz,
        ground, water, biomeId, groundBlock,
      }, [ground.buffer, water.buffer, biomeId.buffer, groundBlock.buffer]);
      generateTile(sampler, generator, 4, 0, 0);

      await new Promise<void>(resolve => setTimeout(resolve));
    }
  } catch (e: any) {
    sendResponse({ type: "error", message: e?.message ?? "error on tileGenerate", requestId: currentRequestId })
  } finally {
    pumping = false;
  }
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const data = event.data;
  if (data.type === "init") {
    try {
      heightLayer = new HeightOverrideLayer();
      biomeLayer = new BiomeOverrideLayer();
      appliedEpoch = 0;
      generator = createGenerator(data.seed, data.cacheSizeMultiplier ?? 1, biomeLayer, heightLayer);
      sampler = new ColumnSampler(generator);
      history = new EditHistory();

      //ダミー
      generateTile(sampler, generator, 4, 0, 0);

      const biomeSurfaces = generator.biomeSelector.biomeEntries.map((e) => ({
        topsoil: e.biome.topsoilBlockType,
        topwater: e.biome.topwaterBlockType,
      }));

      sendResponse({ type: "initReady", biomeSurfaces, waterBlockId: generator.chunkGenerator.waterId });
    } catch (e: any) {
      sendResponse({ type: "error", message: e?.message ?? "error on init" })
    }
  } else if (data.type === "tileRequest") {
    if (!generator || !sampler) {
      sendResponse({
        type: "error",
        message: "Either the generator or sampler hasn't been initialized",
        requestId: data.requestId
      })
      return;
    }

    currentRequestId = data.requestId;
    tileQueue = [...data.tiles];
    pump();
  } else if (data.type === "edit") {
    if (!heightLayer || !biomeLayer || !sampler || !generator) {
      sendResponse({ type: "error", message: "edit before init" });
      return;
    }
    const stroke = history.begin(data.strokeId);
    for (const e of data.height) {
      stroke.h.add(e.x, e.z, heightLayer.get(e.x, e.z)); // 変える前に記録
      if (e.value === null) heightLayer.clear(e.x, e.z);
      else heightLayer.set(e.x, e.z, e.value);
    }
    for (const e of data.biome) {
      stroke.b.add(e.x, e.z, biomeLayer.get(e.x, e.z));
      if (e.value === null) biomeLayer.clear(e.x, e.z);
      else biomeLayer.set(e.x, e.z, e.value);
    }
    appliedEpoch = data.epoch;
    sendPatches(data.epoch, data.rect, data.targets);
  } else if (data.type === "undo" || data.type === "redo") {
    if (!heightLayer || !biomeLayer || !sampler || !generator) {
      sendResponse({ type: "error", message: "history before init" });
      return;
    }
    history.revert(data.type, data.strokeId, heightLayer, biomeLayer);
    appliedEpoch = data.epoch;
    sendPatches(data.epoch, data.rect, data.targets);
  } else if (data.type === "setOptions") {
    if (!sampler) return;
    sampler.biomeAffectsHeight = data.biomeAffectsHeight;
    appliedEpoch = data.epoch;
    sendResponse({ type: "editApplied", epoch: data.epoch });
  }
}