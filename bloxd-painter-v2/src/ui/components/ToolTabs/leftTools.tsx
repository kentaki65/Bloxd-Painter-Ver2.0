import { useState } from "react"
import TabButton from "../common/tabButton";
import type { LeftTabTypes, TabProp, ToolId } from "../common/types";
import { BiomeId } from "../../../core/types";

interface ToolDef {
  id: ToolId;
  title: string;
  icon: { type: "fontawesome"; className: string } | { type: "text"; content: string; }
}

interface BiomeLayerTabProp extends TabProp {
  selectedBiome: string;
  onChangeBiome: (newBiome: BiomeId) => void;
}

const tools: ToolDef[] = [
  {
    id: "spray",
    title: "spray paint: spray paint any terrain. layer or biome onto the world",
    icon: {
      type: "fontawesome",
      className: "fa-solid fa-spray-can"
    }
  },
  {
    id: "height",
    title: "height: raise or lower the terrain",
    icon: {
      type: "fontawesome",
      className: "ri-arrow-up-down-fill"
    }
  },
  {
    id: "flatten",
    title: "flatten: flatten an area",
    icon: {
      type: "text",
      content: "⤳"
    }
  },
  {
    id: "smooth",
    title: "smooth: smooth the terrain out",
    icon: {
      type: "fontawesome",
      className: "ri-corner-right-down-fill"
    }
  },
  {
    id: "biome",
    title: "",
    icon: {
      type: "fontawesome",
      className: "fa-solid fa-layer-group"
    }
  }
]

const biomes = Object.entries(BiomeId).filter((entry): entry is [string, BiomeId] => typeof entry[1] === "number");

function ToolButton({ tool, isActive, onClick }: { tool: ToolDef; isActive: boolean; onClick: () => void }) {
  return (
    <button className={`Button ${isActive ? "active" : ""}`} title={tool.title} onClick={onClick}>
      {tool.icon.type === "fontawesome"
        ? <i className={tool.icon.className}></i>
        : <div className="buttonStr">{tool.icon.content}</div>}
    </button>
  )
}

function TerrainTab({ name }: TabProp) {
  return (
    <>
      <div className="toolName">{name}</div>
      <div className="columnWrap" id="terrainContent">
        <div className="toolContent">
          <div className="toolTypes">
          </div>
        </div>
      </div>
    </>
  )
}

function BiomeLayerTab({ name, selectedBiome, onChangeBiome }: BiomeLayerTabProp) {
  return (
    <>
      <div className="toolName">{name}</div>
      <div className="columnWrap" id="layerContent">
        <div className="toolContent">
          <div className="toolTypes">
            <div className="toolTypesWrapper">
              <div>selected biome: {selectedBiome}</div>
              {biomes.map(([biomeName, id]) => <button key={biomeName} onClick={() => onChangeBiome(id)}>{biomeName}</button>)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function AdvancedSettingTab({ name }: TabProp) {
  return (
    <>
      <div className="toolName">{name}</div>
      <div className="columnWrap" id="advancedContent">
        <div className="toolContent">
          <div className="toolTypes">
          </div>
        </div>
      </div>
    </>
  )
}

export default function LeftTools({ selectedTool, selectedBiome, onChangeBiome, onChangeBrush }: {
  selectedTool: ToolId;
  selectedBiome: string;
  onChangeBiome: (newBiome: BiomeId) => void;
  onChangeBrush: (newTool: ToolId) => void;
}) {
  const [selectedTab, setTab] = useState<LeftTabTypes>("terrain");

  const handleChangeTab = (newTab: LeftTabTypes) => setTab(newTab);

  function handleChungeBrush(newTool: ToolId) {
    onChangeBrush(newTool);
  }

  return (
    <div className="toolsColumn">
      <div className="labels">tools</div>
      <div className="toolsUi">
        {tools.map(tool => (
          <ToolButton key={tool.id} tool={tool} isActive={selectedTool === tool.id} onClick={() => handleChungeBrush(tool.id)} />
        ))}
      </div>

      <div className="toolBox">
        <div className="toolTabs">
          <TabButton
            name="Terrain"
            isActive={selectedTab === "terrain"}
            onClick={() => handleChangeTab("terrain")}
          />
          <TabButton
            name="Biome"
            isActive={selectedTab === "biome"}
            onClick={() => handleChangeTab("biome")}
          />
          <TabButton
            name="Advanced Settings"
            isActive={selectedTab === "advanced"}
            onClick={() => handleChangeTab("advanced")}
          />
        </div>

        <div className="toolColumn">
          {selectedTab === "terrain" && <TerrainTab name="terrain" />}
          {selectedTab === "biome" && <BiomeLayerTab
            selectedBiome={selectedBiome}
            onChangeBiome={onChangeBiome}
            name="biome"
          />}
          {selectedTab === "advanced" && <AdvancedSettingTab name="advanced" />}
        </div>
      </div>
    </div>
  )
}