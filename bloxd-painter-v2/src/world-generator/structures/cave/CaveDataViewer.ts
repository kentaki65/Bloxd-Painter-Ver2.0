//numCaveTypesについて縛れるかもしれん

import { CaveField } from "../../core/constants.js";
import type { NumCaveTypes } from "../../core/types.js";
import type { CaveTypeBlockId } from "./CaveMetadataManager.js";
import { ChunkDataCache4D } from "../../data/cache/ChunkDataCache4D.js";

class CaveDataViewBase {
  numCaveTypes: NumCaveTypes;
  caveTypeToBlockIds: CaveTypeBlockId[];
  caveTypePrioritization: number[];
  chunkSize: number;

  constructor(
    numCaveTypes: NumCaveTypes,
    caveTypeToBlockIds: CaveTypeBlockId[],
    caveTypePrioritization: number[],
    chunkSize: number,
  ) {
    this.numCaveTypes = numCaveTypes;
    this.caveTypeToBlockIds = caveTypeToBlockIds;
    this.caveTypePrioritization = caveTypePrioritization;
    this.chunkSize = chunkSize;
  }
}

export class CaveDataView extends CaveDataViewBase {
  data: any;

  constructor(
    numCaveTypes: NumCaveTypes,
    caveTypeToBlockIds: CaveTypeBlockId[],
    caveTypePrioritization: number[],
    chunkSize: number,
    data: ChunkDataCache4D
  ) {
    super(numCaveTypes, caveTypeToBlockIds, caveTypePrioritization, chunkSize);
    this.data = data;
  }

  getOrGenerate(x: number, y: number, z: number, caveType: CaveField) {
    return this.data.getOrGenerate(x, y, z, caveType);
  }

  viewJustInnerChunk() {
    return new InnerChunkCaveDataView(
      this.numCaveTypes,
      this.caveTypeToBlockIds,
      this.caveTypePrioritization,
      this.chunkSize,
      this.data.viewJustInnerChunk()
    );
  }
}

export class InnerChunkCaveDataView extends CaveDataViewBase {
  data: any;

  constructor(
    numCaveTypes: NumCaveTypes,
    caveTypeToBlockIds: CaveTypeBlockId[],
    caveTypePrioritization: number[],
    chunkSize: number,
    data: any
  ) {
    super(numCaveTypes, caveTypeToBlockIds, caveTypePrioritization, chunkSize);
    this.data = data;
  }

  getOrGenerate(x: number, y: number, z: number, caveType: CaveField) {
    return this.data.get(x, y, z, caveType);
  }
}