// TileCanvas.tsx
import { useEffect, useRef } from "react";
import { chooseStep, getVisibleWorldRect, type Camera } from "../tiles/viewport";
import { drawTiles } from "../tiles/drawTiles";
import { TileClient } from "../tiles/tileClient";

const MARGIN = 64; // 2チャンクぶん

export function TileCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const camera: Camera = { camX: 0, camY: 0, zoom: 1 };

    // 1フレームに1回だけ描く
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        drawTiles(ctx, client.cache, camera, canvas.width, canvas.height);
      });
    };

    const client = new TileClient("1", 5, schedule);
    const rect = getVisibleWorldRect(camera, canvas.width, canvas.height, MARGIN);
    client.update(rect, chooseStep(camera.zoom));

    return () => client.dispose();
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
}