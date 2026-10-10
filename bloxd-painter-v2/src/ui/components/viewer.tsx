import LeftTools from "./ToolTabs/leftTools";
import RightTools from "./ToolTabs/rightTools";
import type { ToolId } from "./common/types";
import type { BiomeId } from "../../core/types";
import { TileCanvas } from "./TileCanvas";
import type { RenderSettings } from "../tiles/renderSettings";

interface ViewerProps {
  selectedTool: ToolId;
  selectedBiome: BiomeId;

  renderSettings: RenderSettings;

  onChangeBiome: (newBiome: BiomeId) => void;
  onChangeBrush: (newTool: ToolId) => void;
}

/* <MapCanvas world={world} worldInfo={worldInfo} onPaint={onPaint}/> */
export default function Viewer({selectedTool, selectedBiome, renderSettings, onChangeBiome, onChangeBrush}: ViewerProps) {
  return (
    <div className="viewer">
      <LeftTools 
        selectedTool={selectedTool} 
        selectedBiome={selectedBiome}
        onChangeBiome={onChangeBiome}
        onChangeBrush={onChangeBrush}
      />
      <TileCanvas renderSetting={renderSettings}/>
      <RightTools />
    </div>
  )
}