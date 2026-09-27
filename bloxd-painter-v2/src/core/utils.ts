export function worldToCanvasX(worldX: number, viewOriginX: number, canvasWidth: number): number {
  return canvasWidth - 1 - (worldX - viewOriginX);
}

export function canvasToWorldX(canvasX: number, viewOriginX: number, canvasWidth: number): number {
  return canvasWidth - 1 - canvasX + viewOriginX;
}