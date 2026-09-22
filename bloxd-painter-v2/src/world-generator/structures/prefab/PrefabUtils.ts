import { PrefabPlacement } from "@/core/types.js";

//gE
export function worldToPrefabX(
  prefabPlacement: PrefabPlacement, 
  worldX: number
) {
  let localX = worldX - prefabPlacement.anchorX;

  if (prefabPlacement.xRotationOffset !== null) {
    localX = prefabPlacement.xRotationOffset - localX;
  }

  return localX;
}

//yE
export function worldToPrefabZ(
  prefabPlacement: PrefabPlacement, 
  worldZ: number
) {
  let localZ = worldZ - prefabPlacement.anchorZ;

  if (prefabPlacement.zRotationOffset !== null) {
    localZ = prefabPlacement.zRotationOffset - localZ;
  }

  return localZ;
}

//OE
export function prefabToWorldX(
  prefabPlacement: PrefabPlacement,
  localX: number,
  localZ: number
) {
  const rotatedCoordinate = prefabPlacement.shouldSwapXZ ? localZ : localX;

  if (prefabPlacement.xRotationOffset !== null) {
    return prefabPlacement.xRotationOffset - rotatedCoordinate + prefabPlacement.anchorX;
  }

  return rotatedCoordinate + prefabPlacement.anchorX;
}

//kR
export function prefabToWorldZ(
  prefabPlacement: PrefabPlacement,
  localX: number,
  localZ: number
) {
  const rotatedCoordinate = prefabPlacement.shouldSwapXZ ? localX : localZ;

  if (prefabPlacement.zRotationOffset !== null) {
    return prefabPlacement.zRotationOffset - rotatedCoordinate + prefabPlacement.anchorZ;
  }

  return rotatedCoordinate + prefabPlacement.anchorZ;
}