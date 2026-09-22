import { Vec3, Vec3Object } from "@/core/types.js";
import { Sparse3DMap } from "@/data/array/Sparse3DMap.js";

export class RLEChunkContainer {
  name: string;
  startOffset: Vec3Object;
  dimensions: Vec3Object;
  rleChunkStorage: Sparse3DMap<unknown>;
  blockData: Sparse3DMap<unknown>;
  pasteOffset: Vec3Object;
  lobbyCode: string | null;
  disjoint: boolean;

  constructor(
    name: string,
    startOffset: Vec3Object,
    dimensions: Vec3Object,
    rleChunkStorage: Sparse3DMap<unknown>,
    blockData = new Sparse3DMap(),
    pasteOffset: Vec3Object = { x: 0, y: 0, z: 0 },
    lobbyCode: string | null = null,
    disjoint = false
  ) {
    this.name = name;
    this.startOffset = startOffset;
    this.dimensions = dimensions;
    this.rleChunkStorage = rleChunkStorage;
    this.blockData = blockData;
    this.pasteOffset = pasteOffset;
    this.lobbyCode = lobbyCode;
    this.disjoint = disjoint;
  }

  getRLEChunk(x: number, y: number, z: number) {
    return this.rleChunkStorage.get(x, y, z);
  }

  getNumRLEChunks(): number {
    return this.rleChunkStorage.getNumItems();
  }

  *getRLECoords(): Generator<[number, number, number]> {
    const coord: Vec3 = [0, 0, 0];

    for (const { x, y, z } of this.rleChunkStorage) {
      coord[0] = x;
      coord[1] = y;
      coord[2] = z;
      yield coord;
    }
  }
}