import type { TileCoord } from "../../core/types";
import type { WorldGenerator } from "../../world-generator";
import { createGenerator } from "../generateChunk";
import { ColumnSampler } from "./ColumnSampler";
import { generateTile } from "./GenerateTile";

export interface BiomeSurface {
  topsoil: number;   // 地表のブロックID
  topwater: number;  // 水の下の地面のブロックID
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
}

interface TileRequest {
  type: "tileRequest"
  requestId: number;
  tiles: TileCoord[]
}

interface TileMessage extends TileCoord {
  type: "tile",
  requestId: number;
  ground: Int16Array<ArrayBuffer>;
  water: Int16Array<ArrayBuffer>;
  biomeId: Uint8Array<ArrayBuffer>;
}

interface ErrorMessage {
  type: "error";
  message: string;
  requestId?: number;
};

type WorkerMessage = InitMessage | TileRequest;
export type WorkerResponse = InitReadyMessage | TileMessage | ErrorMessage;

let generator: WorldGenerator | null = null;
let sampler: ColumnSampler | null = null;

let tileQueue: TileCoord[] = [];
let currentRequestId = 0;
let pumping = false;

function sendResponse(data: WorkerResponse, transfer?: Transferable[]) {
  self.postMessage(data, { transfer });
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

      const { ground, water, biomeId } = generateTile(sampler, firstTile.step, firstTile.tx, firstTile.tz);

      sendResponse({
        type: "tile",
        requestId: requestId,
        step: firstTile.step,
        tx: firstTile.tx,
        tz: firstTile.tz,
        ground, water, biomeId
      }, [ground.buffer, water.buffer, biomeId.buffer])

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
      generator = createGenerator(data.seed, data.cacheSizeMultiplier ?? 1);
      sampler = new ColumnSampler(generator);

      //ダミー
      generateTile(sampler, 4, 0, 0);
      const biomeSurfaces = generator.biomeSelector.biomeEntries.map((e) => ({
        topsoil: e.biome.topsoilBlockType,
        topwater: e.biome.topwaterBlockType,
      }));
      sendResponse({ type: "initReady", biomeSurfaces });
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
  }
}