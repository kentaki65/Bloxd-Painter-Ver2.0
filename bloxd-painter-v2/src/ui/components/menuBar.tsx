import { useState } from "react"
import type { MenuTypes } from "./common/types"

interface MenuProps {
  isOpen: boolean;
  onClick: () => void;
}

interface FileMenuProps extends MenuProps {
  onOpenCreateWorld: () => void;
}

interface ViewMenuProps extends MenuProps {
  onOpenRenderSetting: () => void;
}

interface MenuBarProps {
  onOpenCreateWorld: () => void;
  onOpenRenderSetting: () => void;
}

function FileMenu({ isOpen, onClick, onOpenCreateWorld }: FileMenuProps) {
  return (
    <div className="option">
      <div className={`nameLabel ${isOpen ? "active" : ""}`} onClick={onClick}>file</div>
      {isOpen && (
        <div className="dropdownMenu">
          <button type="button" className="dropdownButton" onClick={onOpenCreateWorld}>new palette</button>
        </div>
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
          <button type="button" className="dropdownButton" onClick={onOpenRenderSetting}>rendersetting</button>
        </div>
      )}
    </div>
  )
}

export default function MenuBar({ onOpenCreateWorld, onOpenRenderSetting }: MenuBarProps) {
  const [selectedMenu, setMenu] = useState<MenuTypes | null>(null);

  function handleMenuClick(menu: MenuTypes) {
    console.log("押された:", menu);
    setMenu(prev => prev === menu ? null : menu);
  }

  return (
    <div className="dropdown">
      <FileMenu
        isOpen={selectedMenu === "file"}
        onClick={() => handleMenuClick("file")}
        onOpenCreateWorld={onOpenCreateWorld}
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