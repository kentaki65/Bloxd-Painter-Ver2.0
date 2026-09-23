export function getCirclePoints(centerX: number, centerZ: number, radius: number): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  const r2 = radius * radius;

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      if (dx * dx + dz * dz <= r2) {
        points.push([centerX + dx, centerZ + dz]);
      }
    }
  }

  return points;
}