import type { BlockId } from "../core/types.js";

export class BidirectionalMap {
  keyToValueTable: Record<string, BlockId>;
  valueToKeyTable: Record<string, BlockId>;

  constructor(keyToValueTable: Record<string, BlockId>) {
    this.keyToValueTable = keyToValueTable;
    const valueToKeyTable: Record<string, BlockId> = {};

    for (const key in this.keyToValueTable) {
      const value = this.keyToValueTable[key]!;
      if (valueToKeyTable[value] !== undefined) {
        throw new Error(
          `Duplicate value found in bi-directional table: ${String(value)}`
        );
      }
      valueToKeyTable[value] = Number(key);
    }
    this.valueToKeyTable = valueToKeyTable;
  }

  get(key: BlockId): BlockId | undefined {
    return this.keyToValueTable[key];
  }

  reverseGet(value: BlockId): BlockId | undefined {
    return this.valueToKeyTable[value];
  }
}