import { ChunkSize } from "../core/constants.js";
import type { ClusterSettingsResult, Vec2 } from "../core/types.js";
import { SimpleOctavesNoise } from "../noise/SimpleOctaveNoise.js";

interface ClosestPointOnSegmentResult {
  alongCoord: number;
  fracAlong: number;
  lineSegmentLength: number;
}

const shiftBits = Math.log2(ChunkSize) | 0;

//YH
export function divideByChunkSize(value: number): number {
  return value >> shiftBits;
}

//QH
export function multiplyByChunkSize(value: number): number {
  return value << shiftBits;
}

//LH
export function manhattanDistance(point: Vec2, x: number, y: number): number {
  return Math.abs(point[0] - x) + Math.abs(point[1] - y);
}

//gH
export function squaredDistance(pointA: Vec2, pointB: Vec2): number {
  const dx = pointA[0] - pointB[0];
  const dy = pointA[1] - pointB[1];

  return dx * dx + dy * dy;
}

//yH
export function squaredDistanceToPoint(point: Vec2, x: number, y: number): number {
  const dx = point[0] - x;
  const dy = point[1] - y;

  return dx * dx + dy * dy;
}

//oH
export function getDistance(point: Vec2, x: number, y: number): number {
  const dx = point[0] - x;
  const dy = point[1] - y;

  return Math.sqrt(dx * dx + dy * dy);
}

//kI
export function getClosestPointOnSegment(
  point: Vec2, 
  segmentStart: Vec2, 
  segmentEnd: Vec2
): ClosestPointOnSegmentResult {
  const segmentLengthSquared = squaredDistance(segmentStart, segmentEnd);

  const projection =
    ((point[0] - segmentStart[0]) * (segmentEnd[0] - segmentStart[0]) +
      (point[1] - segmentStart[1]) * (segmentEnd[1] - segmentStart[1])) /
    segmentLengthSquared;

  let closestX;
  let closestY;
  let fractionAlongSegment;

  if (projection < 0) {
    closestX = segmentStart[0];
    closestY = segmentStart[1];
    fractionAlongSegment = 0;
  } else if (projection > 1) {
    closestX = segmentEnd[0];
    closestY = segmentEnd[1];
    fractionAlongSegment = 1;
  } else {
    closestX = segmentStart[0] + projection * (segmentEnd[0] - segmentStart[0]);
    closestY = segmentStart[1] + projection * (segmentEnd[1] - segmentStart[1]);
    fractionAlongSegment = projection;
  }

  return {
    alongCoord: getDistance(point, closestX, closestY),
    fracAlong: fractionAlongSegment,
    lineSegmentLength: Math.sqrt(segmentLengthSquared)
  };
}

//CH
export function getDistanceToSegment(point: Vec2, segmentStart: Vec2, segmentEnd: Vec2): number {
  const segmentLengthSquared = squaredDistance(segmentStart, segmentEnd);
  const projection = ((point[0] - segmentStart[0]) * (segmentEnd[0] - segmentStart[0]) + (point[1] - segmentStart[1]) * (segmentEnd[1] - segmentStart[1])) / segmentLengthSquared;
  const projectedX = segmentStart[0] + projection * (segmentEnd[0] - segmentStart[0]);
  const projectedY = segmentStart[1] + projection * (segmentEnd[1] - segmentStart[1]);

  return getDistance(point, projectedX, projectedY);
}

//cH
export function normalizeVector2(vector: Vec2): void {
  if (Math.abs(vector[0]) < 1e-4) {
    vector[0] = 0;
    vector[1] = 1;
  } else {
    const length = Math.sqrt(
      vector[0] * vector[0] +
      vector[1] * vector[1]
    );

    vector[0] /= length;
    vector[1] /= length;
  }
}

//UH
//型修正必要
export function getTotalAmplitude(noiseGenerator: SimpleOctavesNoise ): number {
  let totalAmplitude = 0;

  for (const { amplitude } of noiseGenerator.customOctaves) totalAmplitude += amplitude;
  return totalAmplitude;
}

//修正必要
//me = min
//zi = max
export function interpolateClusterValue(clusterSettings: ClusterSettingsResult, y: number): number {
  const { minChance, maxChance, shallowClusterY, deepClusterY } = clusterSettings;
  if (maxChance === undefined || shallowClusterY === undefined || deepClusterY === undefined) {
    return minChance;
  }
  return minChance + (maxChance - minChance) * Math.max(0, Math.min(1, (shallowClusterY - y) / (shallowClusterY - deepClusterY)));
}