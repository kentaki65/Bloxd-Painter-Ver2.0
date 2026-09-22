import { BlockId, BlockMetadata, BlockName } from "@/core/types.js";

export function isNullOrUndefined<T>(
  value: T | null | undefined
): value is null | undefined {
  return value === undefined || value === null;
}

export function getBlockId(
  blockName: BlockName | "Air",
  blockMetadata: BlockMetadata
): BlockId {
  if (blockName === "Air") {
    return 0;
  }

  const blockData = blockMetadata[blockName];

  if (blockData === undefined) {
    throw new Error(`Block "${blockName}" not found in blockMetadata`);
  }

  return blockData.id;
}