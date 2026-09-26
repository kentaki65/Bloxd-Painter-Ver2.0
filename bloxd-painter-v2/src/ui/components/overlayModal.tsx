export default function CreateWorldModal() {
  return (
    <div className="modalOverlay" id="createWorldOverlay">
      <div className="modal" id="createWorldModal">
        <div className="modalTitle">Create World</div>

        <div className="field">
          <label htmlFor="newFileName">File name</label>
          <input type="text" id="newFileName" placeholder="File name" value="schem" />
        </div>

        <div className="field">
          <label htmlFor="newChunkX">Width (chunks)</label>
          <input type="number" id="newChunkX" value="4" min="1" max="24"/>
        </div>

        <div className="field">
          <label htmlFor="newChunkZ">Height (chunks)</label>
          <input type="number" id="newChunkZ" value="4" min="1" max="24"/>
        </div>

        <div className="field">
          <label htmlFor="newMaxHeight">Max height</label>
          <input type="number" id="newMaxHeight" value="64" min="32" max="128"/>
        </div>

        <div className="field">
          <label htmlFor="newWaterLevel">Water level</label>
          <input type="number" id="newWaterLevel" value="0" min="0"/>
        </div>

        <div className="modalButtons">
          <button type="button" id="createWorldConfirm">Create</button>
          <button type="button" id="createWorldCancel">Cancel</button>
        </div>
      </div>
    </div>
  )
}