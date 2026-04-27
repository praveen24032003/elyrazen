import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, '..', 'public', 'models');
const outFile = path.join(outDir, 'smart-house.gltf');

const positions = new Float32Array([
  -0.5, -0.5, 0.5,
  0.5, -0.5, 0.5,
  0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5,
  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  0.5, 0.5, -0.5,
  -0.5, 0.5, -0.5,
]);

const indices = new Uint16Array([
  0, 1, 2, 0, 2, 3,
  1, 5, 6, 1, 6, 2,
  5, 4, 7, 5, 7, 6,
  4, 0, 3, 4, 3, 7,
  3, 2, 6, 3, 6, 7,
  4, 5, 1, 4, 1, 0,
]);

const posBuffer = Buffer.from(positions.buffer);
const idxBuffer = Buffer.from(indices.buffer);
const merged = Buffer.concat([posBuffer, idxBuffer]);
const base64 = merged.toString('base64');

const positionViewOffset = 0;
const positionViewLength = posBuffer.byteLength;
const indexViewOffset = posBuffer.byteLength;
const indexViewLength = idxBuffer.byteLength;

function quatFromEuler(rx, ry, rz) {
  const cx = Math.cos(rx * 0.5);
  const sx = Math.sin(rx * 0.5);
  const cy = Math.cos(ry * 0.5);
  const sy = Math.sin(ry * 0.5);
  const cz = Math.cos(rz * 0.5);
  const sz = Math.sin(rz * 0.5);

  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz,
  ];
}

const roomNodes = [
  { name: 'LivingRoom', t: [-3.5, 0.18, -1.4], s: [3.8, 0.22, 2.6] },
  { name: 'Hall', t: [0, 0.18, -1.4], s: [3.2, 0.22, 2.6] },
  { name: 'Kitchen', t: [3.5, 0.18, -1.4], s: [3.8, 0.22, 2.6] },
  { name: 'DiningArea', t: [-2.7, 0.18, 1.8], s: [4.2, 0.22, 2.2] },
  { name: 'Staircase', t: [0.8, 0.18, 1.8], s: [2.2, 0.22, 2.2] },
  { name: 'Bathroom', t: [3.2, 0.18, 1.8], s: [1.7, 0.22, 2.2] },
  { name: 'MasterBedroom', t: [5.5, 0.18, 1.8], s: [2.3, 0.22, 2.2] },
  { name: 'ParkingArea', t: [0.8, 0.14, -5.5], s: [4.8, 0.18, 1.8] },
];

const shellNodes = [
  { name: 'FrontWall', t: [0.8, 1.35, -3.5], s: [12.8, 2.2, 0.2] },
  { name: 'BackWall', t: [0.8, 1.35, 3.8], s: [12.8, 2.2, 0.2] },
  { name: 'LeftWall', t: [-5.5, 1.35, 0.15], s: [0.2, 2.2, 7.1] },
  { name: 'RightWall', t: [7.1, 1.35, 0.15], s: [0.2, 2.2, 7.1] },
  { name: 'InnerWallA', t: [-1.7, 1.2, 0.2], s: [0.16, 1.9, 6.0] },
  { name: 'InnerWallB', t: [2.0, 1.2, 0.2], s: [0.16, 1.9, 6.0] },
  { name: 'InnerWallC', t: [4.8, 1.2, 0.9], s: [0.16, 1.9, 4.4] },
];

const roofNodes = [
  {
    name: 'RoofLeft',
    t: [-1.0, 2.5, 0.15],
    s: [6.7, 0.16, 7.3],
    r: quatFromEuler(0, 0, -0.42),
  },
  {
    name: 'RoofRight',
    t: [2.6, 2.5, 0.15],
    s: [6.7, 0.16, 7.3],
    r: quatFromEuler(0, 0, 0.42),
  },
  { name: 'RoofRidge', t: [0.8, 3.55, 0.15], s: [0.26, 0.26, 7.0] },
];

const decorNodes = [
  { name: 'FrontDeck', t: [0.8, 0.1, -4.2], s: [5.0, 0.12, 1.2] },
  { name: 'GardenLeft', t: [-4.0, 0.06, -4.2], s: [2.2, 0.08, 1.2] },
  { name: 'GardenRight', t: [5.4, 0.06, -4.2], s: [2.2, 0.08, 1.2] },
];

const interiorNodes = [
  { name: 'BedroomBedBase', t: [5.45, 0.42, 2.0], s: [1.5, 0.28, 1.1] },
  { name: 'BedroomBedMattress', t: [5.45, 0.58, 2.0], s: [1.45, 0.18, 1.05] },
  { name: 'BedroomLampStand', t: [6.2, 0.65, 1.2], s: [0.12, 0.75, 0.12] },
  { name: 'BedroomLampShade', t: [6.2, 1.15, 1.2], s: [0.35, 0.3, 0.35] },
  { name: 'KitchenShelfBase', t: [3.5, 0.85, -2.4], s: [2.2, 0.18, 0.4] },
  { name: 'KitchenShelfUpper1', t: [3.5, 1.35, -2.35], s: [2.2, 0.14, 0.34] },
  { name: 'KitchenShelfUpper2', t: [3.5, 1.85, -2.3], s: [2.2, 0.14, 0.3] },
  { name: 'KitchenShelfUpper3', t: [3.5, 2.25, -2.25], s: [2.2, 0.12, 0.26] },
  { name: 'DiningTable', t: [-2.7, 0.5, 1.8], s: [1.4, 0.35, 0.9] },
  { name: 'DiningBenchA', t: [-2.7, 0.42, 0.95], s: [1.2, 0.24, 0.35] },
  { name: 'DiningBenchB', t: [-2.7, 0.42, 2.65], s: [1.2, 0.24, 0.35] },
];

const parkingNodes = [
  { name: 'ParkingLampPost', t: [-1.4, 1.25, -5.5], s: [0.18, 2.1, 0.18] },
  { name: 'ParkingLamp', t: [-1.4, 2.45, -5.5], s: [0.45, 0.28, 0.45] },
];

const nodes = [
  { name: 'Floor', mesh: 1, translation: [0.8, 0.05, 0.2], scale: [12.8, 0.14, 7.2] },
  ...roomNodes.map((room) => ({
    name: room.name,
    mesh: 0,
    translation: room.t,
    scale: room.s,
  })),
  ...shellNodes.map((item) => ({
    name: item.name,
    mesh: 2,
    translation: item.t,
    scale: item.s,
  })),
  ...roofNodes.map((item) => ({
    name: item.name,
    mesh: 3,
    translation: item.t,
    scale: item.s,
    ...(item.r ? { rotation: item.r } : {}),
  })),
  ...decorNodes.map((item) => ({
    name: item.name,
    mesh: 4,
    translation: item.t,
    scale: item.s,
  })),
  ...interiorNodes.map((item) => ({
    name: item.name,
    mesh: 5,
    translation: item.t,
    scale: item.s,
  })),
  ...parkingNodes.map((item) => ({
    name: item.name,
    mesh: item.name === 'ParkingLamp' ? 6 : 5,
    translation: item.t,
    scale: item.s,
  })),
];

const gltf = {
  asset: { version: '2.0', generator: 'elyra-zen-house-generator' },
  scenes: [{ nodes: nodes.map((_, i) => i) }],
  scene: 0,
  nodes,
  meshes: [
    {
      name: 'RoomMesh',
      primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }],
    },
    {
      name: 'FloorMesh',
      primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 1 }],
    },
    {
      name: 'WallMesh',
      primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 2 }],
    },
    {
      name: 'RoofMesh',
      primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 3 }],
    },
    {
      name: 'DecorMesh',
      primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 4 }],
    },
    {
      name: 'FurnitureMesh',
      primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 5 }],
    },
    {
      name: 'LampMesh',
      primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 6 }],
    },
  ],
  materials: [
    {
      name: 'RoomMaterial',
      pbrMetallicRoughness: { baseColorFactor: [0.92, 0.93, 0.95, 1], metallicFactor: 0.03, roughnessFactor: 0.86 },
    },
    {
      name: 'FloorMaterial',
      pbrMetallicRoughness: { baseColorFactor: [0.96, 0.96, 0.97, 1], metallicFactor: 0.0, roughnessFactor: 1.0 },
    },
    {
      name: 'WallMaterial',
      pbrMetallicRoughness: { baseColorFactor: [0.97, 0.97, 0.98, 1], metallicFactor: 0.04, roughnessFactor: 0.82 },
    },
    {
      name: 'RoofMaterial',
      pbrMetallicRoughness: { baseColorFactor: [0.28, 0.31, 0.36, 1], metallicFactor: 0.08, roughnessFactor: 0.72 },
    },
    {
      name: 'DecorMaterial',
      pbrMetallicRoughness: { baseColorFactor: [0.74, 0.83, 0.74, 1], metallicFactor: 0.0, roughnessFactor: 1.0 },
    },
    {
      name: 'FurnitureMaterial',
      pbrMetallicRoughness: { baseColorFactor: [0.72, 0.64, 0.54, 1], metallicFactor: 0.02, roughnessFactor: 0.78 },
    },
    {
      name: 'LampMaterial',
      pbrMetallicRoughness: { baseColorFactor: [0.98, 0.9, 0.6, 1], metallicFactor: 0.0, roughnessFactor: 0.5 },
      emissiveFactor: [0.22, 0.18, 0.06],
    },
  ],
  buffers: [
    {
      uri: `data:application/octet-stream;base64,${base64}`,
      byteLength: merged.byteLength,
    },
  ],
  bufferViews: [
    { buffer: 0, byteOffset: positionViewOffset, byteLength: positionViewLength, target: 34962 },
    { buffer: 0, byteOffset: indexViewOffset, byteLength: indexViewLength, target: 34963 },
  ],
  accessors: [
    {
      bufferView: 0,
      byteOffset: 0,
      componentType: 5126,
      count: 8,
      type: 'VEC3',
      min: [-0.5, -0.5, -0.5],
      max: [0.5, 0.5, 0.5],
    },
    {
      bufferView: 1,
      byteOffset: 0,
      componentType: 5123,
      count: 36,
      type: 'SCALAR',
    },
  ],
};

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(outFile, JSON.stringify(gltf), 'utf-8');
console.log(`Generated ${outFile}`);
