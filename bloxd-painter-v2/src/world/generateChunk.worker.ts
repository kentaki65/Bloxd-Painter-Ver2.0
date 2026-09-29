import ndarray from "ndarray";
import type { WorldGenerator } from "../world-generator";
import { createGenerator } from "./generateChunk";
import { chunkSize } from "../core/types";

interface InitMessage {
  type: "init";
  seed: string;
  worldScale?: number;
}

interface GenerateMessage {
  type: "generate";
  chunkX: number;
  chunkY: number;
  chunkZ: number;
}

type WorkerMessage = InitMessage | GenerateMessage;

let generator: WorldGenerator | null = null;
let initialized = false;

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const data = event.data;
  if (data.type === "init") {
    generator = createGenerator(data.seed, data.worldScale ?? 1);
    initialized = true;
  } else if (data.type === "generate") {
    if (initialized) {
      const chunk = ndarray(new Uint16Array(chunkSize ** 3), [chunkSize, chunkSize, chunkSize]);
      generator!.getChunk(chunk, data.chunkX, data.chunkY, data.chunkZ);
      self.postMessage({
        type: "generated",
        chunkX: data.chunkX,
        chunkY: data.chunkY,
        chunkZ: data.chunkZ,
        data: chunk.data, // Uint16Array
      }, { transfer: [chunk.data.buffer] });
    } else {
      //未初期化なので警告?
    }
  }
}