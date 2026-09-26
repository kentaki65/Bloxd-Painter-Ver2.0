import { useState } from "react"
import TabButton from "../common/tabButton";
import type { LeftTabTypes, TabProp } from "../common/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ToolId = "spray" | "height" | "flatten" | "smooth" | "biome";

interface ToolDef {
  id: ToolId;
  title: string;
  icon: { type: "fontawesome"; className: string } | { type: "text"; content: string; }
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
      type: "text",
      content: "⇅"
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
      type: "text",
      content: "⤵"
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

function BiomeLayerTab({ name }: TabProp) {
  return (
    <>
      <div className="toolName">{name}</div>
      <div className="columnWrap" id="layerContent">
        <div className="toolContent">
          <div className="toolTypes"></div>
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

export default function LeftTools() {
  const [selectedTool, setTool] = useState<ToolId>("height");
  const [selectedTab, setTab] = useState<LeftTabTypes>("terrain");

  const handleChangeTab = (newTab: LeftTabTypes) => setTab(newTab);

  return (
    <div className="toolsColumn">
      <div className="labels">tools</div>
      <div className="toolsUi">
        {tools.map(tool => (
          <ToolButton key={tool.id} tool={tool} isActive={selectedTool === tool.id} onClick={() => setTool(tool.id)} />
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
          {selectedTab === "biome" && <BiomeLayerTab name="biome" />}
          {selectedTab === "advanced" && <AdvancedSettingTab name="advanced" />}
        </div>
      </div>
    </div>
  )
}