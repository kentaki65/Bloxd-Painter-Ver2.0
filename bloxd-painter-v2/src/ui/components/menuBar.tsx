import { useState } from "react"
import type { MenuTypes } from "./common/types"

interface MenuProps {
  isOpen: boolean;
  onClick: () => void;
}

interface FileMenuProps extends MenuProps {
  onOpenCreateWorld: () => void;
  onOpenExport: () => void;
}

interface ViewMenuProps extends MenuProps {
  onOpenRenderSetting: () => void;
}

interface MenuBarProps {
  onOpenCreateWorld: () => void;
  onOpenRenderSetting: () => void;
  onOpenExport: () => void;
}

function FileMenu({ isOpen, onClick, onOpenCreateWorld, onOpenExport }: FileMenuProps) {
  return (
    <div className="option">
      <div className={`nameLabel ${isOpen ? "active" : ""}`} onClick={onClick}>file</div>
      {isOpen && (
        <>
          <div className="dropdownMenu">
            <button type="button" className="dropdownButton" onClick={onOpenCreateWorld}>new palette</button>
          </div>
          <div className="dropdownMenu">
            <button type="button" className="dropdownButton" onClick={onOpenExport}>export</button>
          </div>
        </>
      )}
    </div>
  )
}

function EditMenu({ isOpen, onClick }: MenuProps) {
  return (
    <div className="option">
      <div className="nameLabel" onClick={onClick}>edit</div>
      {isOpen && (
        <div className="dropdownMenu">

        </div>
      )}
    </div>
  )
}

function ViewMenu({ isOpen, onClick, onOpenRenderSetting }: ViewMenuProps) {
  return (
    <div className="option">
      <div className="nameLabel" onClick={onClick}>view</div>
      {isOpen && (
        <div className="dropdownMenu">
          <button type="button" className="dropdownButton" onClick={onOpenRenderSetting}>render setting</button>
        </div>
      )}
    </div>
  )
}

export default function MenuBar({ onOpenCreateWorld, onOpenRenderSetting, onOpenExport }: MenuBarProps) {
  const [selectedMenu, setMenu] = useState<MenuTypes | null>(null);

  function handleMenuClick(menu: MenuTypes) {
    setMenu(prev => prev === menu ? null : menu);
  }

  return (
    <div className="dropdown">
      <FileMenu
        isOpen={selectedMenu === "file"}
        onClick={() => handleMenuClick("file")}
        onOpenCreateWorld={onOpenCreateWorld}
        onOpenExport={onOpenExport}
      />
      <EditMenu isOpen={selectedMenu === "edit"} onClick={() => handleMenuClick("edit")} />
      <ViewMenu
        isOpen={selectedMenu === "view"}
        onClick={() => handleMenuClick("view")}
        onOpenRenderSetting={onOpenRenderSetting}
      />
    </div>
  )
}