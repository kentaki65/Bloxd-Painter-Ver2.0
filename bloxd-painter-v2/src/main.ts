import { VoxelWorld } from "./world/VoxelWorld";

const world = new VoxelWorld();

world.setBlock(5, 10, 5, 2);       // Dirt
world.setBlock(5, 63, 5, 4);       // チャンクをまたぐ座標（Grass Block）
world.setBlock(-1, -1, -1, 7);     // 負の座標（Gravel）

console.log(world.getBlock(5, 10, 5));    // 2
console.log(world.getBlock(5, 63, 5));    // 4
console.log(world.getBlock(-1, -1, -1));  // 7
console.log(world.getBlock(999, 999, 999)); // 1 (未生成チャンク)
console.log("chunks:", world.getChunkCount());