import { chunkSize } from "../../../core/types";
import {
  buildEncodedSchem,
  downloadSchems,
  encodeChunkRle,
  writeEncodedSchem,
  type SchemChunkInput,
  type WrittenSchems,
} from "./exportSchem";

export interface ReplayChunkForSchem {
  chunkPos: readonly [x: number, y: number, z: number];
  blocks: Uint16Array;
}

export interface ReplaySchemExport extends WrittenSchems {
  originChunkPos: readonly [x: number, y: number, z: number];
}

const MAX_AVRO_INT = 0x7fff_ffff;

export function createReplaySchem(
  name: string,
  replayChunks: Iterable<ReplayChunkForSchem>,
): ReplaySchemExport | null {
  const encodedChunks: SchemChunkInput[] = [];
  let minCX = Infinity;
  let minCY = Infinity;
  let minCZ = Infinity;
  let chunkIndex = 0;

  for (const chunk of replayChunks) {
    const index = chunkIndex++;
    const [cx, cy, cz] = chunk.chunkPos;
    if (![cx, cy, cz].every(Number.isSafeInteger)) {
      throw new Error(
        `Replay chunk ${index} has invalid coordinates: ${JSON.stringify(chunk.chunkPos)}`,
      );
    }

    if (chunk.blocks.length !== chunkSize ** 3) {
      throw new Error(
        `Replay chunk ${index} at ${cx}|${cy}|${cz} has ${chunk.blocks.length} blocks; expected ${chunkSize ** 3}`,
      );
    }

    const { bytes, empty } = encodeChunkRle(chunk.blocks);
    encodedChunks.push({ cx, cy, cz, empty, blocks: bytes });

    minCX = Math.min(minCX, cx);
    minCY = Math.min(minCY, cy);
    minCZ = Math.min(minCZ, cz);
  }

  if (encodedChunks.length === 0) {
    return null;
  }

  const schematic = buildEncodedSchem(name, encodedChunks);
  if (schematic === null) {
    return null;
  }

  for (const [dimension, size] of [
    ["sizeX", schematic.sizeX],
    ["sizeY", schematic.sizeY],
    ["sizeZ", schematic.sizeZ],
  ] as const) {
    if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_AVRO_INT) {
      throw new Error(
        `Replay schematic ${dimension} ${size} is outside the Avro int range`,
      );
    }
  }

  return {
    ...writeEncodedSchem(schematic),
    originChunkPos: [minCX, minCY, minCZ],
  };
}

export async function downloadReplaySchem(
  name: string,
  replayChunks: Iterable<ReplayChunkForSchem>,
): Promise<ReplaySchemExport> {
  const result = createReplaySchem(name, replayChunks);
  if (result === null) {
    throw new Error("Replay contains no non-air blocks to export");
  }

  await downloadSchems(name, result);
  return result;
}
