export class Sparse4DArray {
  array: number[][][][];

  constructor() {
    this.array = [];
  }

  get(x: number, y: number, z: number, d: number) {
    return this.array[x]?.[y]?.[z]?.[d];
  }

  set(x: number, y: number, z: number, d: number, value: number) {
    this.array[x] ??= [];
    this.array[x][y] ??= [];
    this.array[x][y][z] ??= [];

    this.array[x][y][z][d] = value;
  }
}