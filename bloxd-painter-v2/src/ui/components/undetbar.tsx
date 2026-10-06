import { BiomeId, biomeNameById } from "../../core/types";

interface UnderBerState {
  location: [number, number, number];
  height: number;
  slope: number;
  biome: BiomeId;
  radius: number;
  zoom: number;
}

export default function UnderBar({location, height, slope, biome, radius, zoom}: UnderBerState){
  return (
    <div className="underbar">
      <div className="child">location: {location.join(", ")}</div>
      <div className="child">height: {height}</div>
      <div className="child">slope: {slope}</div>
      <div className="child">biome: {biomeNameById[biome]}</div>
      <div className="child">radius: {radius}</div>
      <div className="child">zoom: {zoom}</div>
    </div>
  )
}