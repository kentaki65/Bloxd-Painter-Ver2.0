import ndarray from "ndarray";
import { chunkSize } from "../../../core/types";
import type { HeightOverrideLayer } from "../../overrideLayers/HeightOverrideLayer";
import type { BiomeOverrideLayer } from "../../overrideLayers/BiomeOverrideLayer";
import { schema0 } from "./schema"
import { Buffer } from "buffer";
import JSZip from "jszip";

export const MAX_CHUNKS_PER_FILE = 200;

export interface ExportInfoResponse {
  type: "exportInfo";
  requestId: number;
  empty: boolean;
  minCX: number; maxCX: number; minCZ: number; maxCZ: number; // 余白なし
}

export interface ExportChunkResponse {
  type: "exportChunk";
  requestId: number;
  cx: number; cy: number; cz: number;
  empty: boolean; // 全部が空気
  blocks: Uint8Array<ArrayBuffer>; // RLE + LEB128
  done: number;
  total: number;
}

export type SchemChunkInput = Pick<
  ExportChunkResponse,
  "cx" | "cy" | "cz" | "empty" | "blocks"
>;

export interface EncodedChunk {
  x: number;
  y: number;
  z: number;
  blocks: Uint8Array | Buffer;
}

export interface EncodedSchemJson {
  name: string;
  x: number;
  y: number;
  z: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  chunks: EncodedChunk[];
  filler: number;
}

export interface RawSchemInput {
  name: string;
  pos: [number, number, number];
  size: [number, number, number];
  chunks: RawChunkData[];
}

export interface RawChunkData {
  x: number;
  y: number;
  z: number;
  blocks: number[]; // decoded済みのブロックID配列
}

export interface WrittenSchems {
  schems: Buffer[];
  offsets: { x: number; y: number; z: number }[];
}

export interface SplitResult {
  schems: EncodedSchemJson[];
  sliceSize: number;
}

export type SchemPart = {
  json: any; // 既存のavro用オブジェクトと同じ形
  offset: { x: number; y: number; z: number }; // 全体の最小の角からの相対ブロック座標
  gx: number;
  gz: number;
};

export interface ExportDoneResponse {
  type: "exportDone";
  requestId: number;
}

export function columnBounds(h: HeightOverrideLayer, b: BiomeOverrideLayer) {
  let minCX = Infinity, maxCX = -Infinity, minCZ = Infinity, maxCZ = -Infinity;
  const add = (x: number, z: number) => {
    const cx = Math.floor(x / chunkSize);
    const cz = Math.floor(z / chunkSize);
    if (cx < minCX) minCX = cx;
    if (cx > maxCX) maxCX = cx;
    if (cz < minCZ) minCZ = cz;
    if (cz > maxCZ) maxCZ = cz;
  };
  h.forEachColumn(add);
  b.forEachColumn(add);
  return minCX === Infinity ? null : { minCX, maxCX, minCZ, maxCZ };
}

function leb128Size(value: number): number {
  let size = 1;
  while (value >= 128) {
    value = Math.floor(value / 128);
    size++;
  }
  return size;
}

function writeLeb128(output: Uint8Array, offset: number, value: number): number {
  while (value >= 128) {
    output[offset++] = (value & 0x7f) | 0x80;
    value = Math.floor(value / 128);
  }
  output[offset++] = value;
  return offset;
}

export function encodeChunkRle(
  data: Uint16Array,
): { bytes: Uint8Array<ArrayBuffer>; empty: boolean } {
  if (data.length !== chunkSize ** 3) {
    throw new Error(
      `Expected ${chunkSize ** 3} block IDs, received ${data.length}`,
    );
  }

  let encodedSize = 0;
  let empty = true;
  for (let index = 0; index < data.length;) {
    const blockId = data[index]!;
    let runLength = 1;
    while (index + runLength < data.length && data[index + runLength] === blockId) {
      runLength++;
    }
    encodedSize += leb128Size(runLength) + leb128Size(blockId);
    if (blockId !== 0) empty = false;
    index += runLength;
  }

  const bytes = new Uint8Array(encodedSize);
  let offset = 0;
  for (let index = 0; index < data.length;) {
    const blockId = data[index]!;
    let runLength = 1;
    while (index + runLength < data.length && data[index + runLength] === blockId) {
      runLength++;
    }
    offset = writeLeb128(bytes, offset, runLength);
    offset = writeLeb128(bytes, offset, blockId);
    index += runLength;
  }

  return { bytes, empty };
}

export function chunkTiling(sx: number, sy: number, sz: number, maxChunks = 200) {
  const per = Math.max(1, Math.floor(maxChunks / sy)); // 1ファイルに入るチャンク列の数
  const tz = Math.min(sz, Math.max(1, Math.floor(Math.sqrt(per))));
  const tx = Math.max(1, Math.floor(per / tz));
  return { tx, tz };
}

export function splitTiles(json: any, maxChunks = MAX_CHUNKS_PER_FILE): SchemPart[] {
  const sx = Math.ceil(json.sizeX / 32);
  const sy = Math.ceil(json.sizeY / 32);
  const sz = Math.ceil(json.sizeZ / 32);
  if (sy > maxChunks) throw new Error(`縦が ${sy} チャンクあり、1ファイルの上限(${maxChunks})を超えています`);
  const { tx, tz } = chunkTiling(sx, sy, sz, maxChunks);

  const groups = new Map<string, SchemPart>();
  for (const c of json.chunks) {
    const gx = Math.floor(c.x / tx);
    const gz = Math.floor(c.z / tz);
    const key = gx + "," + gz;
    let part = groups.get(key);
    if (!part) {
      const w = Math.min(tx, sx - gx * tx);
      const d = Math.min(tz, sz - gz * tz);
      part = {
        gx,
        gz,
        offset: { x: gx * tx * 32, y: 0, z: gz * tz * 32 },
        json: {
          ...json,
          name: `${json.name}_x${gx}_z${gz}`,
          x: 0, y: 0, z: 0,
          sizeX: w * 32,
          sizeZ: d * 32,
          chunks: [],
        },
      };
      groups.set(key, part);
    }
    part.json.chunks.push({ ...c, x: c.x - gx * tx, z: c.z - gz * tz });
  }
  const parts = [...groups.values()];
  if (parts.length === 1) parts[0]!.json.name = json.name;
  return parts;
}

export function writeEncodedSchem(avroJson: EncodedSchemJson): WrittenSchems {
  const parts = splitTiles(avroJson);
  const schems = parts.map((p) => {
    const json = {
      ...p.json,
      chunks: p.json.chunks.map((c: EncodedChunk) => ({ ...c, blocks: Buffer.from(c.blocks) })),
    };
    return schema0.toBuffer(json);
  });
  return { schems, offsets: parts.map((p) => p.offset) };
}

export function buildEncodedSchem(name: string, chunks: readonly SchemChunkInput[]): EncodedSchemJson | null {
  let maxUsedCY = -Infinity;
  let minCX = Infinity, minCY = Infinity, minCZ = Infinity;
  let maxCX = -Infinity, maxCZ = -Infinity;
  for (const c of chunks) {
    if (!c.empty && c.cy > maxUsedCY) maxUsedCY = c.cy;
    if (c.cx < minCX) minCX = c.cx;
    if (c.cx > maxCX) maxCX = c.cx;
    if (c.cy < minCY) minCY = c.cy;
    if (c.cz < minCZ) minCZ = c.cz;
    if (c.cz > maxCZ) maxCZ = c.cz;
  }
  if (maxUsedCY === -Infinity) return null;

  // 一番上の、空のチャンクは、落とす
  const used = chunks.filter((c) => c.cy <= maxUsedCY);

  return {
    name,
    x: 0, y: 0, z: 0,
    sizeX: (maxCX - minCX + 1) * chunkSize,
    sizeY: (maxUsedCY - minCY + 1) * chunkSize,
    sizeZ: (maxCZ - minCZ + 1) * chunkSize,
    chunks: used.map((c) => ({ x: c.cx - minCX, y: c.cy - minCY, z: c.cz - minCZ, blocks: c.blocks })),
    filler: 0,
  };
}

export async function downloadSchems(name: string, result: WrittenSchems): Promise<void> {
  const baseName = name || "schem";

  if (result.schems.length === 1) {
    const schem = result.schems[0];
    if (!schem) return;

    const blob = new Blob([new Uint8Array(schem)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.bloxdschem`;
    a.click();

    URL.revokeObjectURL(url);
    return;
  }

  const zip = new JSZip();

  result.schems.forEach((bin: Buffer, i: number) => {
    zip.file(`${baseName}${i}.bloxdschem`, new Uint8Array(bin));
  });

  zip.file("schem.json", JSON.stringify({
    version: 1,
    split: true,
    count: result.schems.length,
    offsets: result.offsets, // ファイル順(0,1,2…)の、相対座標
  }, null, 2));

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName}.zip`;
  a.click();

  URL.revokeObjectURL(url);
}

export function runExport(
  generator: { getChunk: (arr: any, x: number, y: number, z: number) => unknown },
  heightLayer: HeightOverrideLayer,
  biomeLayer: BiomeOverrideLayer,
  req: { requestId: number; margin: number; yChunkStart: number; yChunkCount: number },
  post: (msg: ExportChunkResponse | ExportDoneResponse, transfer?: Transferable[]) => void,
): boolean {
  const bounds = columnBounds(heightLayer, biomeLayer);
  if (!bounds) return false;

  const m = req.margin;
  const x0 = bounds.minCX - m, x1 = bounds.maxCX + m;
  const z0 = bounds.minCZ - m, z1 = bounds.maxCZ + m;
  const total = (x1 - x0 + 1) * (z1 - z0 + 1) * req.yChunkCount;
  let done = 0;

  for (let cx = x0; cx <= x1; cx++) {
    for (let cz = z0; cz <= z1; cz++) {
      for (let k = 0; k < req.yChunkCount; k++) {
        const cy = req.yChunkStart + k;
        const arr = ndarray(new Uint16Array(chunkSize ** 3), [chunkSize, chunkSize, chunkSize]);
        generator.getChunk(arr, cx * chunkSize, cy * chunkSize, cz * chunkSize);
        const { bytes, empty } = encodeChunkRle(arr.data as Uint16Array);
        done++;
        post(
          { type: "exportChunk", requestId: req.requestId, cx, cy, cz, empty, blocks: bytes, done, total },
          [bytes.buffer],
        );
      }
    }
  }
  post({ type: "exportDone", requestId: req.requestId });
  return true;
}