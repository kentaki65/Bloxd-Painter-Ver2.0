export class Sparse3DMap<T> {
  storage: Record<string, Record<string, Sparse3DMapEntry<T>>>;
  zeroStorage: Record<string, Sparse3DMapEntry<T>>;
  mutationCountMask = 2147483647;
  mutationCount = 0;
  itemCount = 0;

  constructor() {
    this.storage = {};
    this.zeroStorage = {};
  }

  set(x: number, y: number, z: number, value: T): T | undefined {
    this.mutationCount =
      (this.mutationCount + 1) & this.mutationCountMask;

    const localKey =
      (x & 1023) |
      ((y & 1023) << 10) |
      ((z & 1023) << 20);

    if (
      Math.abs(x) < 512 &&
      Math.abs(y) < 512 &&
      Math.abs(z) < 512
    ) {
      const oldValue = this.zeroStorage[localKey]?.val;

      if (!(localKey in this.zeroStorage)) {
        this.itemCount++;
      }

      this.zeroStorage[localKey] = {
        x,
        y,
        z,
        val: value
      };

      return oldValue;
    }

    const chunkKey =
      ((x >> 10) & 1023) |
      (((y >> 10) & 1023) << 10) |
      (((z >> 10) & 1023) << 20);

    this.storage[chunkKey] ||= {};

    const chunkStorage = this.storage[chunkKey];
    const oldValue = chunkStorage[localKey]?.val;

    if (!(localKey in chunkStorage)) {
      this.itemCount++;
    }

    chunkStorage[localKey] = {
      x,
      y,
      z,
      val: value
    };

    return oldValue;
  }

  get(x: number, y: number, z: number): T | undefined {
    const localKey =
      (x & 1023) |
      ((y & 1023) << 10) |
      ((z & 1023) << 20);

    if (
      Math.abs(x) < 512 &&
      Math.abs(y) < 512 &&
      Math.abs(z) < 512
    ) {
      return this.zeroStorage[localKey]?.val;
    }

    const chunkKey =
      ((x >> 10) & 1023) |
      (((y >> 10) & 1023) << 10) |
      (((z >> 10) & 1023) << 20);

    if (!this.storage[chunkKey]) {
      return;
    }

    const entry = this.storage[chunkKey][localKey];
    return entry?.val;
  }

  remove(x: number, y: number, z: number): void {
    this.mutationCount =
      (this.mutationCount + 1) & this.mutationCountMask;

    const localKey =
      (x & 1023) |
      ((y & 1023) << 10) |
      ((z & 1023) << 20);

    if (
      Math.abs(x) < 512 &&
      Math.abs(y) < 512 &&
      Math.abs(z) < 512
    ) {
      if (localKey in this.zeroStorage) {
        this.itemCount--;
      }

      delete this.zeroStorage[localKey];
      return;
    }

    const chunkKey =
      ((x >> 10) & 1023) |
      (((y >> 10) & 1023) << 10) |
      (((z >> 10) & 1023) << 20);

    const chunkStorage = this.storage[chunkKey];

    if (chunkStorage) {
      if (localKey in chunkStorage) {
        this.itemCount--;
      }

      delete chunkStorage[localKey];
    }
  }

  removeBy(
    predicate: (x: number, y: number, z: number, value: T) => boolean
  ): void {
    for (const {
      x,
      y,
      z,
      val
    } of this.iterate(true)) {
      if (predicate(x, y, z, val)) {
        this.remove(x, y, z);
      }
    }
  }

  *iterate(allowMutation = false): Generator<Sparse3DMapEntry<T>> {
    const initialMutationCount = this.mutationCount;

    for (const key in this.zeroStorage) {
      yield this.zeroStorage[key]!;

      if (!allowMutation && initialMutationCount !== this.mutationCount) {
        throw new Sparse3DMapMutationError();
      }
    }

    for (const chunkKey in this.storage) {
      const chunkStorage = this.storage[chunkKey];

      for (const localKey in chunkStorage) {
        yield chunkStorage[localKey]!;

        if (!allowMutation && initialMutationCount !== this.mutationCount) {
          throw new Sparse3DMapMutationError();
        }
      }
    }
  }

  entries(): Sparse3DMapEntry<T>[] {
    return Array.from(this.iterate(true));
  }

  [Symbol.iterator](): Generator<Sparse3DMapEntry<T>> {
    return this.iterate(false);
  }

  getNumItems(): number {
    return this.itemCount;
  }

  getNumItemsVerySlowly(): number {
    let count = 0;

    for (const chunkKey in this.storage) {
      count += Object.keys(this.storage[chunkKey]!).length;
    }

    count += Object.keys(this.zeroStorage).length;

    return count;
  }
}

interface Sparse3DMapEntry<T> {
  x: number;
  y: number;
  z: number;
  val: T;
}

class Sparse3DMapMutationError extends Error {
  constructor() {
    super("Sparse3DMap has been mutated during iteration");
  }
}