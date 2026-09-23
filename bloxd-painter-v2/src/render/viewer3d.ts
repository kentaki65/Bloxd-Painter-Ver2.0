// src/render3d/viewer3d.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VoxelWorld } from "../world/VoxelWorld";
import { getColor } from "../render/blockColors";

export class Viewer3D {
  private geometryWidth = 0;
  private geometryDepth = 0;
  private geometryOriginX = 0;
  private geometryOriginZ = 0;

  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private mesh: THREE.Mesh | null = null;

  constructor(container: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
    this.camera.position.set(100, 150, 100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(50, 100, 50);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0x888888));

    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // ハイトマップとしてグリッド表示（1マス=1頂点、高さに応じてY座標を変える）
  renderHeightfield(world: VoxelWorld, originX: number, originZ: number, width: number, depth: number): void {
    this.geometryWidth = width;
    this.geometryDepth = depth;
    this.geometryOriginX = originX;
    this.geometryOriginZ = originZ;
    
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }

    const geometry = new THREE.PlaneGeometry(width, depth, width - 1, depth - 1);
    geometry.rotateX(-Math.PI / 2); // XZ平面に寝かせる

    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const localX = Math.round(positions.getX(i) + width / 2);
      const localZ = Math.round(positions.getZ(i) + depth / 2);
      const worldX = originX + (width - 1 - localX);
      const worldZ = originZ + localZ;

      const top = world.findTopBlock(worldX, worldZ);
      const height = top ? top.y : 0;
      positions.setY(i, height);

      const color = new THREE.Color(top ? getColor(top.blockId) : "#000000");
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  updateHeightfieldPartial(world: VoxelWorld, updateX: number, updateZ: number, updateWidth: number, updateHeight: number): void {
    if (!this.mesh) return;
    const geometry = this.mesh.geometry as THREE.PlaneGeometry;
    const positions = geometry.attributes.position;
    const colors = geometry.attributes.color as THREE.BufferAttribute;

    for (let dz = 0; dz < updateHeight; dz++) {
      for (let dx = 0; dx < updateWidth; dx++) {
        const worldX = updateX + dx;
        const worldZ = updateZ + dz;

        // このワールド座標がジオメトリのどの頂点インデックスに対応するか逆算
        const localX = this.geometryWidth - 1 - (worldX - this.geometryOriginX); // 反転を考慮
        const localZ = worldZ - this.geometryOriginZ;

        if (localX < 0 || localX >= this.geometryWidth || localZ < 0 || localZ >= this.geometryDepth) continue;

        const i = localZ * this.geometryWidth + localX;
        const top = world.findTopBlock(worldX, worldZ);
        const height = top ? top.y : 0;
        positions.setY(i, height);

        const color = new THREE.Color(top ? getColor(top.blockId) : "#000000");
        colors.setXYZ(i, color.r, color.g, color.b);
      }
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}