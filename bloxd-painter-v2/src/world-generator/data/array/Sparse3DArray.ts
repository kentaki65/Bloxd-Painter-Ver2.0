//lH
export class Sparse3DArray {
  array: number[][][];

  constructor() {
    this.array = [];
  }

  get(x: number, y: number, z: number) {
    return this.array[x]?.[y]?.[z];
  }

  set(x: number, y: number, z: number, value: number): void {
    if (!this.array[x]) {
      this.array[x] = [];
    }

    if (!this.array[x][y]) {
      this.array[x][y] = [];
    }

    this.array[x][y][z] = value;
  }
}