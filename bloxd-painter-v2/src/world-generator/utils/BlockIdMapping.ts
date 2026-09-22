import { BlockId, BlockMetadata, BlockName } from "@/core/types.js";

const ROTATIONS = [0, 90, 180, 270];

export class BlockIdMappingManager {
  blockIdMappings: Record<string, Uint16Array>;

  constructor(blockMetadata: BlockMetadata) {
    this.blockIdMappings = {};

    const blockIds = new Set<BlockId>((Object.keys(blockMetadata) as BlockName[]).map((key) => blockMetadata[key].id));
    blockIds.add(0);

    const maxBlockId = Math.max(...blockIds);

    for (const rotation of ROTATIONS) {
      for (const mirror of [false, true]) {
        const key = this.getBlockIdMappingKey(rotation, mirror);
        this.blockIdMappings[key] = this.createBlockIdMapping(
          blockMetadata,
          maxBlockId,
          rotation,
          mirror
        );
      }
    }
  }

  getBlockIdMapping(rotation: number, mirror: boolean): Uint16Array | undefined {
    const key = this.getBlockIdMappingKey(rotation, mirror);
    return this.blockIdMappings[key];
  }

  getBlockIdMappingKey(rotation: number, mirror: boolean): string {
    return `r${rotation}|m${Number(mirror)}`;
  }

  createBlockIdMapping(
    blockMetadata: BlockMetadata,
    maxBlockId: number,
    rotation: number,
    mirror: boolean
  ): Uint16Array {
    const blockIdMapping = new Uint16Array(maxBlockId + 1);

    const rotationIndex = Math.round(rotation / 90);
    const rotationMapping = new Uint8Array(4);

    for (let i = 0; i < 4; i++) {
      rotationMapping[i] = (4 + i - rotationIndex) % 4;
    }

    if (mirror) {
      let temp = rotationMapping[0];
      rotationMapping[0] = rotationMapping[1]!;
      rotationMapping[1] = temp!;

      temp = rotationMapping[2];
      rotationMapping[2] = rotationMapping[3]!;
      rotationMapping[3] = temp!;
    }

    //metaが必要!!!!
    for (const blockName of Object.keys(blockMetadata) as BlockName[]) {
      const { id: blockId, meta } = blockMetadata[blockName];
      const { rot, rootName, metaStr } = meta;

      let mappedBlockId: number;

      if (rot === null) {
        mappedBlockId = blockId;
      } else {
        const mappedRotation = rotationMapping[rot - 1]! + 1;

        const mappedMetaStr = metaStr.replace(
          `rot${rot}`,
          `rot${mappedRotation}`
        );

        const mappedName = `${rootName}|${mappedMetaStr}` as BlockName;

        mappedBlockId = blockMetadata[mappedName]?.id ?? null;

        if (mappedBlockId === null) {
          const rootBlock = blockMetadata[rootName as BlockName];

          mappedBlockId =
            "rootMetaDesc" in rootBlock && rootBlock.rootMetaDesc === mappedName
              ? rootBlock.id
              : blockId;
        }
      }

      blockIdMapping[blockId] = mappedBlockId;
    }

    return blockIdMapping;
  }
}