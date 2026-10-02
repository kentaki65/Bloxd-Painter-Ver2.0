import { BRUSH_RADIUS } from "../../core/types";

export default function UnderBar(){
  return (
    <div className="underbar">
      <div className="child">location: </div>
      <div className="child">height: </div>
      <div className="child">slope: </div>
      <div className="child">biome: </div>
      <div className="child">radius: {BRUSH_RADIUS}</div>
      <div className="child">zoom: </div>
    </div>
  )
}