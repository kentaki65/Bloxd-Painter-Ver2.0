import type { VoxelWorld } from "../../world/VoxelWorld";
import LeftTools from "./ToolTabs/leftTools";
import { MapCanvas } from "./mapCanvas";
import RightTools from "./ToolTabs/rightTools";

interface Props {
  world: VoxelWorld;
  onPaint: (worldX: number, worldZ: number) => void;
}

export default function Viewer({world, onPaint}: Props) {
  return (
    <div className="viewer">
      <LeftTools />
      <MapCanvas world={world} onPaint={onPaint}/>
      <RightTools />
    </div>
  )
}