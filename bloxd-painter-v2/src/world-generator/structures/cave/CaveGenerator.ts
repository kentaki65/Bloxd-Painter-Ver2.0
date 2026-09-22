import { CaveField, HeightField, OUT_OF_RUNGE_NUMBER } from "@/core/constants.js";
import { ChunkArray4D } from "@/data/array/ChunkArray4D.js";
import { Sparse4DArray } from "@/data/array/Sparse4DArray.js";
import { ChunkDataCache3D } from "@/data/cache/ChunkDataCache3D.js";
import { getDistance, getDistanceToSegment } from "@/utils/mathHelper.js";
import { PitCaveMetadataForChunk, RavineCaveMetadataForChunk, SpaghettiCaveMetadata, SphereCaveMetadataForChunk } from "./CaveMetadataManager.js";

type CaveMetadata = ChunkArray4D | Sparse4DArray;

export class CaveGenerator {
  heightmapVals: ChunkDataCache3D;
  spaghettiCaveMetadataForChunk: SpaghettiCaveMetadata[];
  pitCaveMetadataForChunk: PitCaveMetadataForChunk[];
  ravineCaveMetadataForChunk: RavineCaveMetadataForChunk[];
  sphereCaveMetadataForChunk: SphereCaveMetadataForChunk[];
  numCaveTypes: number;

  static SPAGHETTI_CAVE_EDGE_CUTOFF = 0.08;

  constructor(
    heightmapVals: ChunkDataCache3D,
    spaghettiCaveMetadataForChunk: SpaghettiCaveMetadata[],
    pitCaveMetadataForChunk: PitCaveMetadataForChunk[],
    ravineCaveMetadataForChunk: RavineCaveMetadataForChunk[],
    sphereCaveMetadataForChunk: SphereCaveMetadataForChunk[],
    numCaveTypes: number
  ) {
    this.heightmapVals = heightmapVals;
    this.spaghettiCaveMetadataForChunk = spaghettiCaveMetadataForChunk;
    this.pitCaveMetadataForChunk = pitCaveMetadataForChunk;
    this.ravineCaveMetadataForChunk = ravineCaveMetadataForChunk;
    this.sphereCaveMetadataForChunk = sphereCaveMetadataForChunk;
    this.numCaveTypes = numCaveTypes;
  }

  generateAndSet(chunkX: number, chunkZ: number, caveMetadata: CaveMetadata) {
    this.setDefaultCaves(chunkX, chunkZ, caveMetadata);
    this.generateAndSetSpaghettiCaves(chunkX, chunkZ, caveMetadata);
    this.generateAndSetPitCaves(chunkX, chunkZ, caveMetadata);
    this.generateAndSetRavineCaves(chunkX, chunkZ, caveMetadata);
    this.generateAndSetSphereCaves(chunkX, chunkZ, caveMetadata);
    this.removeCavesNearWater(chunkX, chunkZ, caveMetadata);
  }

  setDefaultCaves(chunkX: number, chunkZ: number, caveMetadata: CaveMetadata) {
    for (let caveType = 0; caveType < this.numCaveTypes; caveType++) {
      caveMetadata.set(
        chunkX,
        chunkZ,
        caveType,
        CaveField.FloorY,
        OUT_OF_RUNGE_NUMBER.NO_CAVE_NUMBER
      );

      caveMetadata.set(
        chunkX,
        chunkZ,
        caveType,
        CaveField.CeilingY,
        OUT_OF_RUNGE_NUMBER.NO_CAVE_NUMBER
      );
    }
  }

  generateAndSetSpaghettiCaves(chunkX: number, chunkZ: number, caveMetadata: CaveMetadata) {
    for (const metadata of this.spaghettiCaveMetadataForChunk) {
      const edgeNoise = metadata.caveEdgeNoiseGenerator.getOctaves(chunkX, chunkZ);

      if (edgeNoise >= CaveGenerator.SPAGHETTI_CAVE_EDGE_CUTOFF) {
        continue;
      }

      const heightNoise = metadata.caveHeightNoiseGenerator.getOctaves(chunkX, chunkZ);

      if (heightNoise === OUT_OF_RUNGE_NUMBER.OUT_OF_RANGE) {
        continue;
      }

      if (!(metadata.caveHeightThreshold.low < heightNoise) || !(heightNoise < metadata.caveHeightThreshold.high)) {
        continue;
      }

      let caveHeight;

      {
        let heightFactor = 1 - Math.abs(heightNoise - metadata.caveHeightThreshold.midpoint) / metadata.caveHeightThreshold.halfWidth;
        heightFactor = Math.min(
          metadata.caveHeightPercentageUpperBound,
          heightFactor
        );

        caveHeight = metadata.caveHeightMax * heightFactor;
      }

      if (edgeNoise > 0) {
        caveHeight *= (CaveGenerator.SPAGHETTI_CAVE_EDGE_CUTOFF - edgeNoise) / CaveGenerator.SPAGHETTI_CAVE_EDGE_CUTOFF;
      }

      const xzPerturbX =
        metadata.caveXZPerturbNoiseGenerator.getOctaves(
          chunkX,
          chunkZ
        );

      const xzPerturbZ =
        metadata.caveXZPerturbNoiseGenerator.getOctaves(
          chunkX + 980,
          chunkZ - 370
        );

      const yPerturb =
        metadata.caveYPerturbNoiseGenerator.getOctaves(
          chunkX + xzPerturbX,
          chunkZ + xzPerturbZ
        );

      const floorY = Math.floor(metadata.caveCentreY + yPerturb - caveHeight);
      let ceilingY = Math.floor(metadata.caveCentreY + yPerturb + caveHeight);

      if (ceilingY + 1 === this.heightmapVals.getOrGenerate(chunkX, chunkZ, HeightField.GroundHeight)) {
        ceilingY++;
      }

      caveMetadata.set(
        chunkX,
        chunkZ,
        metadata.caveType,
        CaveField.FloorY,
        floorY
      );

      caveMetadata.set(
        chunkX,
        chunkZ,
        metadata.caveType,
        CaveField.CeilingY,
        ceilingY
      );
    }
  }

  generateAndSetPitCaves(chunkX: number, chunkZ: number, caveMetadata: CaveMetadata) {
    for (const metadata of this.pitCaveMetadataForChunk) {
      const pitMinX = metadata.pitMinX;
      const pitMaxX = metadata.pitMaxX;
      const pitMinZ = metadata.pitMinZ;
      const pitMaxZ = metadata.pitMaxZ;

      const perturbedX =
        chunkX +
        metadata.pitXZPerturbNoiseGenerator.getOctaves(
          chunkX,
          chunkZ
        );

      const perturbedZ =
        chunkZ +
        metadata.pitXZPerturbNoiseGenerator.getOctaves(
          chunkX + 430,
          chunkZ - 330
        );

      if (
        perturbedX < pitMinX ||
        perturbedX > pitMaxX ||
        perturbedZ < pitMinZ ||
        perturbedZ > pitMaxZ
      ) {
        continue;
      }

      const hasNoHeightPerturbation =
        metadata.pitHeightPerturbNoiseGenerator === null;

      const floorYPerturb =
        metadata.pitFloorYPerturbNoiseGenerator.getOctaves(
          chunkX,
          chunkZ
        );

      const heightPerturb = hasNoHeightPerturbation
        ? 0
        : metadata.pitHeightPerturbNoiseGenerator!.getOctaves(
          chunkX,
          chunkZ
        );

      let floorY = metadata.pitFloorY + floorYPerturb;
      let ceilingY =
        metadata.pitFloorY +
        metadata.pitHeight +
        heightPerturb;

      const edgeDistance = 4;

      const distanceFromXEdge = Math.min(
        perturbedX - pitMinX,
        pitMaxX - perturbedX
      );

      const distanceFromZEdge = Math.min(
        perturbedZ - pitMinZ,
        pitMaxZ - perturbedZ
      );

      const distanceFromEdge = Math.min(
        distanceFromXEdge,
        distanceFromZEdge
      );

      if (distanceFromEdge < edgeDistance) {
        const edgeFactor =
          1 - distanceFromEdge / edgeDistance;

        floorY += (5 + metadata.pitMidpointYPerturbNoiseGenerator.getOctaves(chunkX, chunkZ)) * edgeFactor;

        if (!hasNoHeightPerturbation) {
          ceilingY -=
            (ceilingY - floorY) * edgeFactor;
        }
      }

      floorY = Math.floor(floorY);
      ceilingY = Math.floor(ceilingY);

      if (
        hasNoHeightPerturbation ||
        ceilingY + 1 ===
        this.heightmapVals.getOrGenerate(
          chunkX,
          chunkZ,
          HeightField.GroundHeight
        )
      ) {
        ceilingY++;
      }

      let caveType = metadata.caveType;

      if (
        metadata.wallType !== null &&
        (distanceFromXEdge <= 0.9 ||
          distanceFromZEdge <= 0.9)
      ) {
        caveType = metadata.wallType;
      } else if (metadata.pitCeilingThickness > 0) {
        ceilingY -= metadata.pitCeilingThickness;

        caveMetadata.set(
          chunkX,
          chunkZ,
          metadata.ceilingType!,
          CaveField.FloorY,
          ceilingY
        );

        caveMetadata.set(
          chunkX,
          chunkZ,
          metadata.ceilingType!,
          CaveField.CeilingY,
          ceilingY + metadata.pitCeilingThickness
        );
      }

      caveMetadata.set(
        chunkX,
        chunkZ,
        caveType,
        CaveField.FloorY,
        floorY
      );

      caveMetadata.set(
        chunkX,
        chunkZ,
        caveType,
        CaveField.CeilingY,
        ceilingY
      );
    }
  }

  generateAndSetRavineCaves(chunkX: number, chunkZ: number, caveMetadata: CaveMetadata) {
    for (const metadata of this.ravineCaveMetadataForChunk) {
      const ravineCentre = metadata.ravineCentre;
      const ravineWidth = metadata.ravineWidth;
      const ravineLength = metadata.ravineLength;

      const perturbedX =
        chunkX +
        metadata.ravineXZPerturbNoiseGenerator.getOctaves(
          chunkX,
          chunkZ
        );

      const perturbedZ =
        chunkZ +
        metadata.ravineXZPerturbNoiseGenerator.getOctaves(
          chunkX + 430,
          chunkZ - 330
        );

      const distanceFromCentre = getDistance(
        ravineCentre,
        perturbedX,
        perturbedZ
      );

      if (distanceFromCentre > ravineLength) {
        continue;
      }

      const distanceFromLine = getDistanceToSegment(
        [perturbedX, perturbedZ],
        ravineCentre,
        [
          ravineCentre[0] + metadata.ravineDirection[0],
          ravineCentre[1] + metadata.ravineDirection[1]
        ]
      );

      const currentWidth =
        ravineWidth *
        (1 - distanceFromCentre / ravineLength);

      if (distanceFromLine > currentWidth) {
        continue;
      }

      const yPerturb =
        metadata.ravineYPerturbNoiseGenerator.getOctaves(
          chunkX,
          chunkZ
        );

      let floorY = metadata.ravineFloorY + yPerturb;
      let ceilingY =
        metadata.ravineFloorY +
        metadata.ravineHeight +
        yPerturb;

      const edgeDistance = 3;
      const distanceFromEdge =
        currentWidth - distanceFromLine;

      if (distanceFromEdge < edgeDistance) {
        const edgeFactor =
          1 - distanceFromEdge / edgeDistance;

        floorY +=
          metadata.ravineHeight * edgeFactor;
      }

      floorY = Math.floor(floorY);
      ceilingY = Math.floor(ceilingY);

      if (
        ceilingY + 1 ===
        this.heightmapVals.getOrGenerate(
          chunkX,
          chunkZ,
          HeightField.GroundHeight
        )
      ) {
        ceilingY++;
      }

      caveMetadata.set(
        chunkX,
        chunkZ,
        metadata.caveType,
        CaveField.FloorY,
        floorY
      );

      caveMetadata.set(
        chunkX,
        chunkZ,
        metadata.caveType,
        CaveField.CeilingY,
        ceilingY
      );
    }
  }

  generateAndSetSphereCaves(chunkX: number, chunkZ: number, caveMetadata: CaveMetadata) {
    for (const metadata of this.sphereCaveMetadataForChunk) {
      const perturbedX =
        chunkX +
        metadata.sphereXZPerturbNoiseGenerator.getOctaves(
          chunkX,
          chunkZ
        );

      const perturbedZ =
        chunkZ +
        metadata.sphereXZPerturbNoiseGenerator.getOctaves(
          chunkX + 430,
          chunkZ - 330
        );

      const offsetX =
        metadata.sphereCentreX - perturbedX;

      const offsetZ =
        metadata.sphereCentreZ - perturbedZ;

      const distanceSquared =
        offsetX * offsetX + offsetZ * offsetZ;

      if (distanceSquared > metadata.sphereRadiusSquared) {
        continue;
      }

      const verticalRadius = Math.sqrt(
        metadata.sphereRadiusSquared - distanceSquared
      );

      const floorY = Math.floor(
        metadata.sphereCentreY - verticalRadius
      );

      let ceilingY = Math.floor(
        metadata.sphereCentreY + verticalRadius
      );

      if (
        ceilingY + 1 ===
        this.heightmapVals.getOrGenerate(
          chunkX,
          chunkZ,
          HeightField.GroundHeight
        )
      ) {
        ceilingY++;
      }

      caveMetadata.set(
        chunkX,
        chunkZ,
        metadata.caveType,
        CaveField.FloorY,
        floorY
      );

      caveMetadata.set(
        chunkX,
        chunkZ,
        metadata.caveType,
        CaveField.CeilingY,
        ceilingY
      );
    }
  }

  removeCavesNearWater(chunkX: number, chunkZ: number, caveMetadata: CaveMetadata) {
    const cavesAllowedBelowY =
      this.heightmapVals.getOrGenerate(
        chunkX,
        chunkZ,
        HeightField.CavesAllowedBelowY
      );

    if (cavesAllowedBelowY !== 10000) {
      for (
        let caveType = 0;
        caveType < this.numCaveTypes;
        caveType++
      ) {
        if (
          caveMetadata.get(
            chunkX,
            chunkZ,
            caveType,
            CaveField.CeilingY
          ) <= cavesAllowedBelowY
        ) {
          continue;
        }

        if (
          caveMetadata.get(
            chunkX,
            chunkZ,
            caveType,
            CaveField.FloorY
          ) <= cavesAllowedBelowY
        ) {
          caveMetadata.set(
            chunkX,
            chunkZ,
            caveType,
            CaveField.CeilingY,
            cavesAllowedBelowY
          );
        } else {
          caveMetadata.set(
            chunkX,
            chunkZ,
            caveType,
            CaveField.FloorY,
            OUT_OF_RUNGE_NUMBER.NO_CAVE_NUMBER
          );

          caveMetadata.set(
            chunkX,
            chunkZ,
            caveType,
            CaveField.CeilingY,
            OUT_OF_RUNGE_NUMBER.NO_CAVE_NUMBER
          );
        }
      }
    }
  }
}