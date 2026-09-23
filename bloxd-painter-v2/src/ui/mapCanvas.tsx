import React, { useRef, useEffect } from "react";
import { VoxelWorld } from "../world/VoxelWorld";
import { renderTopDown, renderTopDownPartial } from "../render/renderTop";
import { BRUSH_RADIUS } from "../core/types";

interface Props {
  world: VoxelWorld;
  onPaint: (worldX: number, worldZ: number) => void;
}

export function MapCanvas({ world, onPaint }: Props) {
  //useRefでcanvasを保持する
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  //描画が終わった後に実行される
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    renderTopDown(world, ctx, 0, 0, canvas.width, canvas.height);
  }, [world])

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    isDragging.current = true;
    paintAt(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (isDragging.current) paintAt(e);
  }

  function paintAt(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    //左右反転
    const worldX = canvas.width - 1 - Math.floor(canvasX);
    const worldZ = Math.floor(canvasY);
    onPaint(worldX, worldZ);

    const ctx = canvas.getContext("2d")!;
    const margin = BRUSH_RADIUS + 2; // brush/circleBrush.tsで定義したBRUSH_RADIUSをimportするか、定数を共有する必要あり
    renderTopDownPartial(world, ctx, 0, 0, worldX - margin, worldZ - margin, margin * 2, margin * 2);
  }

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={320}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => isDragging.current = false}
    />
  )
}