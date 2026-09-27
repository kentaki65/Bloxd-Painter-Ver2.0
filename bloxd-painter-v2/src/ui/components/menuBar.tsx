import { useState } from "react"
import type { MenuTypes } from "./common/types"

interface MenuProps {
  isOpen: boolean;
  onClick: () => void;
}

function FileMenu({ isOpen, onClick }: MenuProps) {
  return (
    <div className="option">
      <div className={`nameLabel ${isOpen ? "active" : ""}`} onClick={onClick}>file</div>
      {isOpen && (
        <div className={`dropdownMenu ${isOpen ? "active" : ""}`}>
          <button type="button" className="dropdownButton">new palette</button>
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

function ViewMenu({ isOpen, onClick }: MenuProps) {
  return (
    <div className="option">
      <div className="nameLabel" onClick={onClick}>view</div>
      {isOpen && (
        <div className="dropdownMenu">

        </div>
      )}
    </div>
  )
}

export default function MenuBar() {
  const [selectedMenu, setMenu] = useState<MenuTypes | null>(null);

  function handleMenuClick(menu: MenuTypes) {
    console.log("押された:", menu);
    setMenu(prev => prev === menu ? null : menu);
  }

  return (
    <div className="dropdown">
      <FileMenu isOpen={selectedMenu === "file"} onClick={() => handleMenuClick("file")} />
      <EditMenu isOpen={selectedMenu === "edit"} onClick={() => handleMenuClick("edit")} />
      <ViewMenu isOpen={selectedMenu === "view"} onClick={() => handleMenuClick("view")} />
    </div>
  )
}