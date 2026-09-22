import { Vec2 } from "@/core/types.js";
import { SeededRandom } from "@/noise/SeededRandom.js";
import { PointsGenerator } from "./PointsGenerator.js";

export class FeaturePointGenerator {
  chunkSize: number;
  pointsGenerator: PointsGenerator;
  seed: string | number;
  tempChunkCoord: Vec2;
  chunkSearchRadius: number;

  constructor(
    chunkSize: number,
    pointsGenerator: PointsGenerator,
    searchRadiusSize: number,
    seed: string | number,
  ) {
    this.chunkSize = chunkSize;
    this.pointsGenerator = pointsGenerator;
    this.seed = seed;
    this.tempChunkCoord = [0, 0];
    this.chunkSearchRadius = Math.floor((searchRadiusSize * 0.5) / this.chunkSize) + 1;
  }

  getChunkCoordFromGlobalCoord(x: number, z: number) {
    this.tempChunkCoord[0] = Math.floor(x / this.chunkSize);
    this.tempChunkCoord[1] = Math.floor(z / this.chunkSize);
    return this.tempChunkCoord;
  }

  getSurroundingFeatures(x: number, z: number): Vec2[] {
    const chunkCoord = this.getChunkCoordFromGlobalCoord(x, z);
    const features: Vec2[] = [];

    for (
      let chunkX = chunkCoord[0] - this.chunkSearchRadius;
      chunkX <= chunkCoord[0] + this.chunkSearchRadius;
      chunkX++
    ) {
      for (
        let chunkZ = chunkCoord[1] - this.chunkSearchRadius;
        chunkZ <= chunkCoord[1] + this.chunkSearchRadius;
        chunkZ++
      ) {
        if (this.pointsGenerator.isPoint(chunkX, chunkZ)) {
          features.push(
            this.getRandomPointInChunk(chunkX, chunkZ)
          );
        }
      }
    }

    return features;
  }

  getRandomPointInChunk(chunkX: number, chunkZ: number): Vec2 {
    const baseX = chunkX * this.chunkSize;
    const baseZ = chunkZ * this.chunkSize;

    const random = new SeededRandom(
      `${chunkX}|${chunkZ}|${this.seed}`
    );

    return [
      baseX + Math.floor(random.next() * this.chunkSize),
      baseZ + Math.floor(random.next() * this.chunkSize)
    ];
  }
}