import type { VoxelWorld } from "../../world/VoxelWorld";
import LeftTools from "./ToolTabs/leftTools";
import { MapCanvas } from "./mapCanvas";
import RightTools from "./ToolTabs/rightTools";
import type { ToolId, WorldSettings } from "./common/types";
import type { BiomeId } from "../../core/types";
import { TileCanvas } from "./TileCanvas";

interface Props {
  world: VoxelWorld;
  worldInfo: WorldSettings;
  selectedTool: ToolId;
  selectedBiome: BiomeId;

  onPaint: (worldX: number, worldZ: number) => void;

  onChangeBiome: (newBiome: BiomeId) => void;
  onChangeBrush: (newTool: ToolId) => void;
}

/* <MapCanvas world={world} worldInfo={worldInfo} onPaint={onPaint}/> */
export default function Viewer({world, worldInfo, selectedTool, selectedBiome, onPaint, onChangeBiome, onChangeBrush}: Props) {
  return (
    <div className="viewer">
      <LeftTools 
        selectedTool={selectedTool} 
        selectedBiome={selectedBiome}
        onChangeBiome={onChangeBiome}
        onChangeBrush={onChangeBrush}
      />
      <TileCanvas />
      <RightTools />
    </div>
  )
}