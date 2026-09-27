import { useState } from "react"
import type { MenuTypes } from "./common/types"

interface MenuProps {
  isOpen: boolean;
  onClick: () => void;
}

function FileMenu({ isOpen, onClick }: MenuProps) {
  return (
    <div className="option">
      <div className="nameLabel" onClick={onClick}>file</div>
      <div className="dropdownMenu">
        {isOpen && (
          <></>
        )}
      </div>
    </div>
  )
}

function EditMenu({ isOpen, onClick }: MenuProps) {
  return (
    <div className="option">
      <div className="nameLabel" onClick={onClick}>edit</div>
      <div className="dropdownMenu">
        {isOpen && (
          <></>
        )}
      </div>
    </div>
  )
}

function ViewMenu({ isOpen, onClick }: MenuProps) {
  return (
    <div className="option">
      <div className="nameLabel" onClick={onClick}>view</div>
      <div className="dropdownMenu">
        {isOpen && (
          <></>
        )}
      </div>
    </div>
  )
}

export default function MenuBar() {
  const [selectedMenu, setMenu] = useState<MenuTypes | null>(null);

  function handleMenuClick(menu: MenuTypes) {
    setMenu(prev => prev === menu ? null : menu);
  }

  return (
    <div className="dropdown">
      <FileMenu isOpen={selectedMenu === "file"} onClick={() => handleMenuClick("file")} />
      <EditMenu isOpen={selectedMenu === "edit"} onClick={() => handleMenuClick("edit")}/>
      <ViewMenu isOpen={selectedMenu === "view"} onClick={() => handleMenuClick("view")}/>
    </div>
  )
}