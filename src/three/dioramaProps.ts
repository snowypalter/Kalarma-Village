import * as THREE from 'three';
import { DioramaMaterialSet } from './dioramaMaterials';

export interface ColliderBox {
  id: string;
  label: string;
  x: number;
  z: number;
  halfW: number;
  halfD: number;
}

export interface FishAnimatedItem {
  group: THREE.Group;
  tail: THREE.Mesh;
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
}

export interface PondAnimatedRefs {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  riverWestMesh: THREE.Mesh;
  riverEastMesh: THREE.Mesh;
  boatGroup: THREE.Group;
  waterwheelGroup: THREE.Group;
  foamMeshes: THREE.Mesh[];
  waterfallMeshes: THREE.Mesh[];
  fishes: FishAnimatedItem[];
}

export const VILLAGE_ROAD_SEGMENTS: [number, number, number, number, number][] = [
  [0, -7.2, 12.0, 7.2, 0],           // Spacious Plaza in front of Clinic
  [-5.2, -10.6, 9.6, 2.4, 0.25],     // Path to Rumah Karakter
  [0, 1.8, 3.2, 17.5, 0],            // Main North-South spine across Stone Bridge
  [4.3, 1.6, 2.0, 9.2, 0],           // Path across Eastern Plank Bridge
  [12.2, 1.8, 2.1, 10.6, 0],         // Path from Toko Perlengkapan across East River Bridge
  [-11.5, 1.2, 2.0, 9.5, 0],         // Path across West Timber Bridge to Kebun Herbal
  [2.45, 5.4, 1.8, 3.4, 0],          // Approach path to Fishing Pier
  [0, 8.8, 32.5, 3.2, 0],            // Wide East-West village promenade
  [-8.0, 6.8, 5.2, 2.2, 0.3],        // Spur to Kebun Herbal gate
  [8.2, -2.2, 11.5, 2.6, 0.14],      // Avenue to Toko Perlengkapan & Apotek
  [-10.5, -4.5, 13.0, 2.6, -0.32],   // Avenue to West neighborhoods
  [10.8, -8.5, 11.5, 2.5, 0.28],     // Avenue to East villas
  [0, 14.2, 24.5, 5.2, 0],           // Spacious South market plaza
  [11.4, 11.4, 4.4, 2.4, 0],         // Spur to Area Perluasan Lahan
  [6.8, -4.4, 2.6, 2.4, 0],          // Spur to Butik Busana & Wardrobe
];

export function buildFloatingIsland(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();
  const islandSize = 52;

  // 1. Core Lush Meadow Base (top flush at y = 0)
  const grassGeo = new THREE.BoxGeometry(islandSize, 0.78, islandSize);
  const grass = new THREE.Mesh(grassGeo, mats.grassTop);
  grass.position.y = -0.39;
  grass.receiveShadow = true;
  grass.castShadow = true;
  group.add(grass);

  // Mid warm soil stratum
  const soilGeo = new THREE.BoxGeometry(islandSize - 0.6, 1.65, islandSize - 0.6);
  const soil = new THREE.Mesh(soilGeo, mats.soil);
  soil.position.y = -1.6;
  soil.castShadow = true;
  soil.receiveShadow = true;
  group.add(soil);

  // Sculpted faceted rocky island underbelly
  const cliffGeo = new THREE.CylinderGeometry(islandSize * 0.53, islandSize * 0.34, 3.2, 8);
  const cliff = new THREE.Mesh(cliffGeo, mats.stoneCliff);
  cliff.rotation.y = Math.PI / 8;
  cliff.position.y = -3.95;
  cliff.castShadow = true;
  group.add(cliff);

  // 2. Multi-Tiered Outer Limestone Cliff Plateaus & Grassy Terraces
  const cliffTerraces: [number, number, number, number, number, number][] = [
    [-23.2, -23.2, 8.2, 4.2, 6.8, 0.18],
    [-12.8, -24.6, 10.6, 3.0, 4.0, 0.05],
    [12.8, -24.5, 10.4, 3.2, 4.2, -0.06],
    [23.4, -22.8, 7.8, 3.8, 7.0, -0.22],
    [-24.8, -6.0, 3.6, 2.4, 13.5, 0.08],
    [24.6, -2.5, 5.2, 3.1, 10.5, -0.12],
    [24.6, 13.0, 3.8, 2.3, 9.5, 0.14],
    [-24.6, 13.5, 3.6, 2.1, 9.5, -0.1],
  ];
  cliffTerraces.forEach(([tx, tz, tw, th, td, ry]) => {
    const rockBlock = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), mats.stoneLight);
    rockBlock.position.set(tx, th * 0.42 - 0.15, tz);
    rockBlock.rotation.y = ry;
    rockBlock.castShadow = true;
    rockBlock.receiveShadow = true;

    const cap = new THREE.Mesh(new THREE.BoxGeometry(tw + 0.48, 0.44, td + 0.48), mats.grassChartreuse);
    cap.position.set(tx, th * 0.92 - 0.08, tz);
    cap.rotation.y = ry;
    cap.castShadow = true;
    cap.receiveShadow = true;

    const cushionLip = new THREE.Mesh(
      new THREE.CylinderGeometry(Math.min(tw, td) * 0.44, Math.min(tw, td) * 0.48, 0.36, 10),
      mats.grassAccent
    );
    cushionLip.position.set(tx, th * 0.96, tz);
    cushionLip.scale.set((tw + 0.2) / Math.min(tw, td), 1, (td + 0.2) / Math.min(tw, td));
    cushionLip.receiveShadow = true;
    group.add(rockBlock, cap, cushionLip);
  });

  // 3. Soft Rounded Grassy Overhang Cushions across lawns
  const meadowPads: [number, number, number, boolean][] = [
    [-16.5, -15.5, 4.4, true],
    [16.8, -14.2, 4.2, false],
    [-16.0, 14.2, 4.5, true],
    [16.2, 14.8, 4.2, false],
    [-9.5, -5.2, 3.0, true],
    [9.4, -6.2, 3.0, true],
    [-6.2, 6.2, 2.6, false],
    [6.4, 6.1, 2.8, true],
    [0, -19.5, 3.4, false],
    [-17.5, -3.5, 3.0, false],
    [17.8, 4.4, 3.0, true],
  ];
  meadowPads.forEach(([px, pz, r, isBright]) => {
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r * 1.07, 0.06, 16),
      isBright ? mats.grassChartreuse : mats.grassAccent
    );
    pad.position.set(px, 0.02, pz);
    pad.receiveShadow = true;
    group.add(pad);
  });

  // 4. Expanded Cobblestone Village Road Network & Central Plaza Circle
  VILLAGE_ROAD_SEGMENTS.forEach(([rx, rz, rw, rd, rotY]) => {
    const road = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.05, rd), mats.cobbleRoad);
    road.position.set(rx, 0.025, rz);
    road.rotation.y = rotY;
    road.receiveShadow = true;
    group.add(road);
  });

  const plazaDisc = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.2, 0.06, 24), mats.cobbleRoad);
  plazaDisc.position.set(0, 0.03, 8.8);
  plazaDisc.receiveShadow = true;
  group.add(plazaDisc);

  // 5. Storybook Wooden Pasture Fences framing the perimeter
  const addFenceRun = (x1: number, z1: number, x2: number, z2: number, posts: number) => {
    for (let i = 0; i <= posts; i++) {
      const t = i / posts;
      const px = THREE.MathUtils.lerp(x1, x2, t);
      const pz = THREE.MathUtils.lerp(z1, z2, t);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.68, 8), mats.woodDark);
      post.position.set(px, 0.34, pz);
      post.castShadow = true;
      group.add(post);
    }
    const len = Math.hypot(x2 - x1, z2 - z1);
    const angle = -Math.atan2(z2 - z1, x2 - x1);
    [0.48, 0.25].forEach((ry) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.07), mats.woodWarm);
      rail.position.set((x1 + x2) / 2, ry, (z1 + z2) / 2);
      rail.rotation.y = angle;
      rail.castShadow = true;
      group.add(rail);
    });
  };

  addFenceRun(-23.8, -23.8, -10.5, -23.8, 5);
  addFenceRun(10.5, -23.8, 23.8, -23.8, 5);
  addFenceRun(-23.8, 23.8, -8.2, 23.8, 6);
  addFenceRun(8.2, 23.8, 23.8, 23.8, 6);
  addFenceRun(-22.2, 5.4, -18.5, 5.4, 2);
  addFenceRun(17.8, 10.6, 22.4, 10.6, 2);

  // 6. Smooth Rounded Diorama Rim Boulders
  const rimRocks: [number, number, number, number][] = [
    [-23.2, -16.5, 1.15, 0.4],
    [23.2, -16.8, 1.2, 1.1],
    [-23.2, 12.2, 1.05, 2.0],
    [23.1, 12.5, 1.1, 0.7],
    [0, -23.8, 1.2, 0.5],
    [-12.5, 23.6, 1.0, 1.4],
    [12.5, 23.6, 1.0, 2.3],
    [-6.1, -1.7, 0.76, 0.3],
    [6.1, -1.6, 0.78, 1.1],
  ];
  rimRocks.forEach(([rx, rz, sc, rot]) => {
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68 * sc, 1), mats.stoneLight);
    boulder.scale.set(1.28, 0.72, 0.98);
    boulder.position.set(rx, 0.2, rz);
    boulder.rotation.y = rot;
    boulder.castShadow = true;
    boulder.receiveShadow = true;
    group.add(boulder);
  });

  return group;
}

export function buildHospitalBuilding(
  mats: DioramaMaterialSet,
  windowMeshes: THREE.Mesh[]
): THREE.Group {
  const group = new THREE.Group();

  // Stone foundation terrace
  const base = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.48, 5.3), mats.stoneLight);
  base.position.y = 0.24;
  base.receiveShadow = true;
  base.castShadow = true;
  group.add(base);

  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 0.45), mats.stoneLight);
    step.position.set(0, 0.075 + s * 0.14, 2.78 + (2 - s) * 0.42);
    step.receiveShadow = true;
    step.castShadow = true;
    group.add(step);
  }

  // Main Hall with Tudor half-timber framing
  const floor1 = new THREE.Mesh(new THREE.BoxGeometry(7.6, 2.4, 4.5), mats.plasterIvory);
  floor1.position.y = 1.68;
  floor1.castShadow = true;
  floor1.receiveShadow = true;
  group.add(floor1);

  [-3.72, -1.85, 1.85, 3.72].forEach((bx) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.4, 4.56), mats.woodDark);
    beam.position.set(bx, 1.68, 0);
    beam.castShadow = true;
    group.add(beam);
  });

  // Second story upper ward
  const floor2 = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.85, 3.8), mats.plasterSage);
  floor2.position.y = 3.8;
  floor2.castShadow = true;
  floor2.receiveShadow = true;
  group.add(floor2);

  // Pitched Teal Layered Roof + Dormer + Chimney
  const roofUpper = new THREE.Mesh(new THREE.ConeGeometry(4.4, 2.1, 4), mats.roofTeal);
  roofUpper.rotation.y = Math.PI / 4;
  roofUpper.scale.set(1.16, 1, 0.86);
  roofUpper.position.y = 5.72;
  roofUpper.castShadow = true;
  group.add(roofUpper);

  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.5, 0.55), mats.stoneLight);
  chimney.position.set(2.1, 5.55, -0.8);
  chimney.castShadow = true;
  group.add(chimney);

  const roofLower = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.32, 5.4), mats.roofTerracotta);
  roofLower.position.y = 2.98;
  roofLower.castShadow = true;
  group.add(roofLower);

  // Stone Clinic Watchtower Turret on North-West Flank
  const towerBase = new THREE.Mesh(new THREE.BoxGeometry(2.1, 5.9, 2.1), mats.stoneLight);
  towerBase.position.set(-4.35, 2.95, -1.35);
  towerBase.castShadow = true;
  towerBase.receiveShadow = true;
  const towerBattlement = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.45, 2.38), mats.stoneCliff);
  towerBattlement.position.set(-4.35, 5.95, -1.35);
  towerBattlement.castShadow = true;
  const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.75, 1.45, 4), mats.roofTerracotta);
  towerRoof.rotation.y = Math.PI / 4;
  towerRoof.position.set(-4.35, 6.88, -1.35);
  towerRoof.castShadow = true;
  const towerSlit = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.65, 0.14), mats.glassWindow);
  towerSlit.position.set(-4.35, 4.75, -0.28);
  windowMeshes.push(towerSlit);
  group.add(towerBase, towerBattlement, towerRoof, towerSlit);

  // Timber entrance pillars & arched awning beam
  [-1.5, 1.5].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 2.5, 10), mats.woodDark);
    pillar.position.set(px, 1.65, 2.52);
    pillar.castShadow = true;
    group.add(pillar);
  });
  const porticoBeam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.24, 0.6), mats.woodWarm);
  porticoBeam.position.set(0, 2.82, 2.45);
  porticoBeam.castShadow = true;
  group.add(porticoBeam);

  // Double wooden entrance doors with brass handles
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.18), mats.woodWarm);
  door.position.set(0, 1.38, 2.28);
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.86, 1.98, 0.12), mats.woodDark);
  doorFrame.position.set(0, 1.4, 2.24);
  const handleL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mats.brass);
  handleL.position.set(-0.16, 1.28, 2.4);
  const handleR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mats.brass);
  handleR.position.set(0.16, 1.28, 2.4);
  group.add(doorFrame, door, handleL, handleR);

  // Hanging Herbal Drying Bundles & Clay Herb Planters flanking Clinic Porch
  [-2.15, 2.15].forEach((hx, idx) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.42, 10), mats.roofTerracotta);
    pot.position.set(hx, 0.68, 2.65);
    pot.castShadow = true;
    const bush = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 10, 8),
      idx === 0 ? mats.foliageLime : mats.herbPurple
    );
    bush.position.set(hx, 1.02, 2.65);
    bush.castShadow = true;
    const herbBundle = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 6), mats.foliageSage);
    herbBundle.position.set(hx * 0.72, 2.52, 2.48);
    group.add(pot, bush, herbBundle);
  });

  // Glowing warm windows with dark wood frames & flower sills
  const winPositions: [number, number, number][] = [
    [-2.5, 1.75, 2.28],
    [2.5, 1.75, 2.28],
    [-1.6, 3.88, 1.93],
    [1.6, 3.88, 1.93],
  ];
  winPositions.forEach(([wx, wy, wz]) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.06, 0.08), mats.woodDark);
    frame.position.set(wx, wy, wz - 0.02);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.1, 0.2), mats.woodWarm);
    sill.position.set(wx, wy - 0.52, wz + 0.04);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 0.12), mats.glassWindow);
    win.position.set(wx, wy, wz);
    group.add(frame, sill, win);
    windowMeshes.push(win);
  });

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.14, 0.55, 10), mats.brass);
  spire.position.set(0, 6.85, 0);
  const spireOrb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), mats.brass);
  spireOrb.position.set(0, 7.15, 0);
  group.add(spire, spireOrb);

  // Iconic Green/White Medical Cross Plaque on Roof Gable
  const plaque = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.18, 20), mats.plasterIvory);
  plaque.rotation.x = Math.PI / 2;
  plaque.position.set(0, 3.92, 1.98);
  const plaqueRim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.055, 8, 24), mats.brass);
  plaqueRim.position.set(0, 3.92, 2.04);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 0.24), mats.crossEmerald);
  crossV.position.set(0, 3.92, 2.02);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.24), mats.crossEmerald);
  crossH.position.set(0, 3.92, 2.02);
  group.add(plaque, plaqueRim, crossV, crossH);

  // Glass Herb Conservatory Side Wing with interior herb beds
  const wingFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 3.2), mats.glassConservatory);
  wingFrame.position.set(5.1, 1.4, -0.2);
  const wingBase = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.5, 3.3), mats.stoneLight);
  wingBase.position.set(5.1, 0.25, -0.2);
  const wingHerbBed = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 2.1), mats.foliageLime);
  wingHerbBed.position.set(5.1, 0.65, -0.2);
  group.add(wingBase, wingHerbBed, wingFrame);

  return group;
}

export function buildApothecaryPavilion(
  mats: DioramaMaterialSet,
  lanternLights: THREE.PointLight[],
  lanternBulbs: THREE.Mesh[],
  enablePointLights = true
): THREE.Group {
  const group = new THREE.Group();

  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 4.7), mats.woodWarm);
  deck.position.y = 0.175;
  deck.receiveShadow = true;
  deck.castShadow = true;
  group.add(deck);

  const step = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.18, 0.55), mats.woodPlank);
  step.position.set(0, 0.09, 2.55);
  step.receiveShadow = true;
  group.add(step);

  [
    [-2.2, -1.9],
    [2.2, -1.9],
    [-2.2, 1.9],
    [2.2, 1.9],
  ].forEach(([px, pz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.5, 10), mats.woodDark);
    col.position.set(px, 1.55, pz);
    col.castShadow = true;
    group.add(col);
  });

  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.25, 1.7, 4), mats.roofTeal);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.55;
  roof.castShadow = true;
  group.add(roof);

  const roofRim = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.16, 4.9), mats.woodDark);
  roofRim.position.y = 2.75;
  group.add(roofRim);

  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 0.12), mats.plasterIvory);
  signBoard.position.set(0, 2.55, 2.38);
  const signTrim = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.65, 0.08), mats.woodDark);
  signTrim.position.set(0, 2.55, 2.34);
  const signFlask = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.34, 8), mats.crossEmerald);
  signFlask.position.set(0, 2.55, 2.46);
  group.add(signTrim, signBoard, signFlask);

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 0.45), mats.woodDark);
  shelf.position.set(0, 1.3, -1.55);
  shelf.castShadow = true;
  group.add(shelf);

  const bottleColors = [0x3b826e, 0xd97706, 0x38bdf8, 0xf472b6, 0xa78bfa];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const bMat = new THREE.MeshStandardMaterial({
        color: bottleColors[(r + c) % bottleColors.length],
        roughness: 0.32,
        metalness: 0.08,
      });
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.32, 8), bMat);
      bottle.position.set(-1.1 + c * 0.55, 1.0 + r * 0.75, -1.45);
      group.add(bottle);
    }
  }

  const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.72, 0.9), mats.woodWarm);
  table.position.set(0, 0.71, 0.3);
  table.castShadow = true;
  const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.22, 12), mats.brass);
  mortar.position.set(0, 1.18, 0.3);
  group.add(table, mortar);

  const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.54, 0.66), mats.woodWarm);
  crate1.position.set(-2.95, 0.27, 0.9);
  crate1.castShadow = true;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.68, 10), mats.woodDark);
  barrel.position.set(2.95, 0.34, 0.8);
  barrel.castShadow = true;
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.42, 10), mats.roofTerracotta);
  jar.position.set(2.9, 0.21, 1.45);
  group.add(crate1, barrel, jar);

  const lanternColors = [0xfde68a, 0xfbcfe8];
  [-2.0, 2.0].forEach((lx, idx) => {
    const bulbMat = new THREE.MeshStandardMaterial({
      color: lanternColors[idx],
      emissive: lanternColors[idx],
      emissiveIntensity: 0.5,
      roughness: 0.35,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), bulbMat);
    bulb.position.set(lx, 2.35, 1.9);
    group.add(bulb);
    lanternBulbs.push(bulb);

    if (enablePointLights) {
      const pLight = new THREE.PointLight(lanternColors[idx], 0.0, 8, 1.5);
      pLight.position.set(lx, 2.2, 2.1);
      group.add(pLight);
      lanternLights.push(pLight);
    }
  });

  return group;
}

export function buildMarketStall(
  mats: DioramaMaterialSet,
  awningMat: THREE.MeshStandardMaterial
): THREE.Group {
  const group = new THREE.Group();

  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.85, 1.5), mats.woodWarm);
  counter.position.y = 0.425;
  counter.castShadow = true;
  counter.receiveShadow = true;
  group.add(counter);

  [
    [-1.35, -0.65],
    [1.35, -0.65],
    [-1.35, 0.65],
    [1.35, 0.65],
  ].forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.1, 8), mats.woodDark);
    pole.position.set(px, 1.05, pz);
    pole.castShadow = true;
    group.add(pole);
  });

  const awning = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 2.15), awningMat);
  awning.position.set(0, 2.15, 0.05);
  awning.rotation.x = 0.22;
  awning.castShadow = true;
  group.add(awning);

  [-0.85, 0, 0.85].forEach((bx, idx) => {
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.24, 10), mats.woodDark);
    basket.position.set(bx, 0.96, 0.1);
    const herbs = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 10, 8),
      idx === 1 ? mats.blossomPink : mats.foliageLime
    );
    herbs.scale.y = 0.65;
    herbs.position.set(bx, 1.08, 0.1);
    group.add(basket, herbs);
  });

  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.65), mats.woodWarm);
  crate.position.set(1.85, 0.275, 0.2);
  crate.castShadow = true;
  group.add(crate);

  return group;
}

export function buildVillagerCottage(
  mats: DioramaMaterialSet,
  roofMat: THREE.MeshStandardMaterial,
  windowMeshes: THREE.Mesh[],
  withMailbox = false,
  withClothesline = false
): THREE.Group {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.3, 3.45), mats.stoneLight);
  plinth.position.y = 0.15;
  plinth.receiveShadow = true;
  group.add(plinth);

  const walls = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.85, 3.0), mats.plasterIvory);
  walls.position.y = 1.22;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  [
    [-1.66, -1.46],
    [1.66, -1.46],
    [-1.66, 1.46],
    [1.66, 1.46],
  ].forEach(([bx, bz]) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.86, 0.14), mats.woodDark);
    beam.position.set(bx, 1.22, bz);
    beam.castShadow = true;
    group.add(beam);
  });

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.92, 1.62, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 2.94;
  roof.castShadow = true;
  group.add(roof);

  const gableArch = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.16, 8, 16, Math.PI), mats.woodWarm);
  gableArch.position.set(0, 2.06, 1.54);
  gableArch.castShadow = true;
  group.add(gableArch);

  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.1, 0.46), mats.stoneLight);
  chimney.position.set(0.95, 3.12, -0.5);
  chimney.castShadow = true;
  group.add(chimney);

  const doorBase = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.92, 0.16), mats.woodWarm);
  doorBase.position.set(0, 0.74, 1.52);
  const doorRoundTop = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.16, 12), mats.woodWarm);
  doorRoundTop.rotation.x = Math.PI / 2;
  doorRoundTop.position.set(0, 1.18, 1.52);
  const doorOuterFrame = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.075, 8, 14, Math.PI), mats.woodDark);
  doorOuterFrame.position.set(0, 1.18, 1.54);
  const doorKnob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), mats.brass);
  doorKnob.position.set(0.2, 0.85, 1.62);
  group.add(doorBase, doorRoundTop, doorOuterFrame, doorKnob);

  [-1.08, 1.08].forEach((wx) => {
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.08), mats.woodDark);
    winFrame.position.set(wx, 1.32, 1.5);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.12), mats.glassWindow);
    win.position.set(wx, 1.32, 1.52);
    const flowerBox = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.18, 0.24), mats.woodWarm);
    flowerBox.position.set(wx, 0.92, 1.58);
    const blooms = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), mats.blossomPink);
    blooms.scale.set(1.9, 0.55, 0.7);
    blooms.position.set(wx, 1.04, 1.58);
    group.add(winFrame, win, flowerBox, blooms);
    windowMeshes.push(win);
  });

  if (withMailbox) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.72, 8), mats.woodDark);
    post.position.set(2.15, 0.36, 1.35);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.56), mats.mailboxRed);
    box.position.set(2.15, 0.78, 1.35);
    box.castShadow = true;
    const roofCap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.58, 10, 1, false, 0, Math.PI), mats.mailboxRed);
    roofCap.rotation.z = Math.PI / 2;
    roofCap.rotation.y = Math.PI / 2;
    roofCap.position.set(2.15, 0.95, 1.35);
    const signTab = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.04), mats.plasterIvory);
    signTab.position.set(2.15, 1.15, 1.35);
    group.add(post, box, roofCap, signTab);
  }

  if (withClothesline) {
    [-2.45, -1.85].forEach((px) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.15, 6), mats.woodDark);
      pole.position.set(px, 0.57, 1.15);
      pole.castShadow = true;
      group.add(pole);
    });
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65, 5), mats.woodWarm);
    cord.rotation.z = Math.PI / 2;
    cord.position.set(-2.15, 1.04, 1.15);
    const tunicHang = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.06), mats.crossEmerald);
    tunicHang.position.set(-2.15, 0.85, 1.15);
    tunicHang.castShadow = true;
    group.add(cord, tunicHang);
  }

  return group;
}

export function buildSacredAncientTree(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();

  const rootMound = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.5, 0.45, 14), mats.grassChartreuse);
  rootMound.position.y = 0.22;
  rootMound.receiveShadow = true;
  group.add(rootMound);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 3.1, 10), mats.woodDark);
  trunk.position.y = 1.65;
  trunk.castShadow = true;
  group.add(trunk);

  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 + 0.3;
    const root = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.95, 5, 8), mats.woodDark);
    root.position.set(Math.cos(ang) * 0.92, 0.45, Math.sin(ang) * 0.92);
    root.rotation.z = Math.cos(ang) * 1.1;
    root.rotation.x = -Math.sin(ang) * 1.1;
    root.castShadow = true;
    group.add(root);

    // Clustered toadstool mushrooms around ancient tree roots!
    const mStem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.16, 6), mats.plasterIvory);
    mStem.position.set(Math.cos(ang + 0.35) * 1.35, 0.48, Math.sin(ang + 0.35) * 1.35);
    const mCap = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.12, 8), mats.mushroomCapRed);
    mCap.position.set(Math.cos(ang + 0.35) * 1.35, 0.59, Math.sin(ang + 0.35) * 1.35);
    group.add(mStem, mCap);

    const bough = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 1.8, 7), mats.woodDark);
    bough.position.set(Math.cos(ang) * 0.85, 3.1, Math.sin(ang) * 0.85);
    bough.rotation.z = -Math.cos(ang) * 0.65;
    bough.rotation.x = Math.sin(ang) * 0.65;
    bough.castShadow = true;
    group.add(bough);
  }

  const puffs: [number, number, number, number, THREE.Material][] = [
    [0, 4.15, 0, 1.95, mats.foliageDeep],
    [-1.4, 3.65, 0.7, 1.4, mats.foliageGreen],
    [1.45, 3.7, -0.65, 1.38, mats.foliageSage],
    [0.15, 3.6, 1.4, 1.3, mats.foliageLime],
    [-0.2, 3.75, -1.35, 1.32, mats.foliageGreen],
    [0.1, 5.15, 0.1, 1.35, mats.foliageLime],
  ];
  puffs.forEach(([px, py, pz, r, m]) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m);
    puff.scale.set(1.12, 0.82, 1.12);
    puff.position.set(px, py, pz);
    puff.castShadow = true;
    puff.receiveShadow = true;
    group.add(puff);
  });

  return group;
}

export function buildSacredTreeLOD(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 3.1, 6), mats.woodDark);
  trunk.position.y = 1.55;
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(2.35, 10, 8), mats.foliageDeep);
  canopy.scale.set(1.15, 0.8, 1.15);
  canopy.position.y = 4.1;
  group.add(trunk, canopy);
  return group;
}

export function buildCliffWindmill(mats: DioramaMaterialSet): {
  group: THREE.Group;
  bladesGroup: THREE.Group;
} {
  const group = new THREE.Group();

  const mound = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.2, 1.35, 10), mats.stoneLight);
  mound.position.y = 0.675;
  mound.castShadow = true;
  mound.receiveShadow = true;
  const grassCap = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.88, 0.25, 12), mats.grassChartreuse);
  grassCap.position.y = 1.38;
  grassCap.receiveShadow = true;
  group.add(mound, grassCap);

  const baseTower = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.22, 2.1, 10), mats.stoneLight);
  baseTower.position.y = 2.48;
  baseTower.castShadow = true;
  const upperTower = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.95, 1.35, 10), mats.plasterIvory);
  upperTower.position.y = 4.15;
  upperTower.castShadow = true;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.12, 1.15, 8), mats.roofTerracotta);
  roof.position.y = 5.32;
  roof.castShadow = true;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 0.2), mats.woodDark);
  door.position.set(0, 1.95, 1.1);
  group.add(baseTower, upperTower, roof, door);

  const bladesGroup = new THREE.Group();
  bladesGroup.position.set(0, 4.3, 0.95);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.42, 10), mats.woodDark);
  hub.rotation.x = Math.PI / 2;
  bladesGroup.add(hub);

  for (let i = 0; i < 4; i++) {
    const armHolder = new THREE.Group();
    armHolder.rotation.z = (i * Math.PI) / 2 + 0.35;

    const spar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.15, 0.08), mats.woodDark);
    spar.position.y = 1.08;
    spar.castShadow = true;

    const sail = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.65, 0.03), mats.sailCloth);
    sail.position.set(0.32, 1.25, 0.02);
    sail.rotation.y = 0.16;
    sail.castShadow = true;

    armHolder.add(spar, sail);
    bladesGroup.add(armHolder);
  }

  group.add(bladesGroup);
  return { group, bladesGroup };
}

export function buildWindmillLOD(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.35, 4.6, 7), mats.stoneLight);
  body.position.y = 2.3;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.1, 6), mats.roofTerracotta);
  roof.position.y = 5.1;
  group.add(body, roof);
  return group;
}

export function buildCentralFountain(mats: DioramaMaterialSet): {
  group: THREE.Group;
  spoutMesh: THREE.Mesh;
} {
  const group = new THREE.Group();

  const outerRim = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.18, 0.36, 18), mats.stoneLight);
  outerRim.position.y = 0.18;
  outerRim.castShadow = true;
  outerRim.receiveShadow = true;

  const basinWater = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.12, 18), mats.water);
  basinWater.position.y = 0.32;

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.82, 12), mats.stoneLight);
  pillar.position.y = 0.65;
  pillar.castShadow = true;

  const upperBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.24, 0.2, 14), mats.stoneLight);
  upperBowl.position.y = 1.02;
  upperBowl.castShadow = true;

  const spoutMesh = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 10), mats.waterFoam);
  spoutMesh.position.y = 1.32;

  group.add(outerRim, basinWater, pillar, upperBowl, spoutMesh);
  return { group, spoutMesh };
}

export function buildPondAndBridge(mats: DioramaMaterialSet): PondAnimatedRefs {
  const group = new THREE.Group();
  const foamMeshes: THREE.Mesh[] = [];
  const waterfallMeshes: THREE.Mesh[] = [];

  // 1. Central Koi Pond + Winding East-West Village River Channel
  const waterGeo = new THREE.PlaneGeometry(11.8, 5.3, 24, 12);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMesh = new THREE.Mesh(waterGeo, mats.water);
  waterMesh.position.set(0, 0.035, 1.6);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // West Winding River Stream (x in [-24.5, -5.8], z = 2.6)
  const riverWestGeo = new THREE.PlaneGeometry(18.8, 2.35, 18, 6);
  riverWestGeo.rotateX(-Math.PI / 2);
  const riverWestMesh = new THREE.Mesh(riverWestGeo, mats.water);
  riverWestMesh.position.set(-15.1, 0.03, 2.6);
  riverWestMesh.receiveShadow = true;
  group.add(riverWestMesh);

  // East Winding River Stream (x in [5.8, 24.5], z = 1.6)
  const riverEastGeo = new THREE.PlaneGeometry(18.8, 2.25, 18, 6);
  riverEastGeo.rotateX(-Math.PI / 2);
  const riverEastMesh = new THREE.Mesh(riverEastGeo, mats.water);
  riverEastMesh.position.set(15.1, 0.03, 1.6);
  riverEastMesh.receiveShadow = true;
  group.add(riverEastMesh);

  // Riverbank Sand Borders & Mossy River Stones along West & East Streams
  const bankRocks: [number, number, number][] = [
    [-22.0, 1.35, 0.42],
    [-18.5, 3.85, 0.48],
    [-15.2, 1.35, 0.36],
    [-8.6, 3.85, 0.44],
    [8.4, 0.4, 0.42],
    [15.6, 2.8, 0.46],
    [19.2, 0.4, 0.38],
    [22.4, 2.8, 0.48],
  ];
  bankRocks.forEach(([bx, bz, sc]) => {
    const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(sc, 1), mats.stoneLight);
    rk.scale.set(1.3, 0.58, 1.0);
    rk.position.set(bx, 0.14, bz);
    rk.castShadow = true;
    rk.receiveShadow = true;
    group.add(rk);
  });

  // Sandy pebbles inside central pond
  const pebbleCoords: [number, number, number][] = [
    [-2.4, 0.6, 0.24],
    [-2.1, 2.7, 0.2],
    [2.3, 0.8, 0.22],
    [2.7, 2.5, 0.26],
    [3.4, 3.1, 0.2],
    [-3.5, 2.9, 0.22],
  ];
  pebbleCoords.forEach(([px, pz, r]) => {
    const pebble = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mats.riverSand);
    pebble.scale.set(1.3, 0.45, 1.1);
    pebble.position.set(px, 0.04, pz);
    group.add(pebble);
  });

  // Rounded stone pond rim rocks
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * Math.PI * 2;
    const rx = Math.cos(ang) * 5.95;
    const rz = 1.6 + Math.sin(ang) * 2.7;
    if (Math.abs(rx) < 1.55 || (rx > 3.35 && rx < 5.2)) continue;
    if (Math.abs(rx) > 5.3 && Math.abs(rz - 2.0) < 1.3) continue; // Keep West/East stream mouths clear
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 1), mats.stoneLight);
    rock.scale.set(1.25, 0.58, 1.02);
    rock.position.set(rx, 0.14, rz);
    rock.castShadow = true;
    group.add(rock);
  }

  // 2. Central Arched 3D Stone Bridge (x = 0)
  const stoneBridge = new THREE.Group();
  for (let s = -4; s <= 4; s++) {
    const archY = Math.cos((s / 4) * (Math.PI / 2)) * 0.55 + 0.15;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 0.62), mats.stoneLight);
    plank.position.set(0, archY, 1.6 + s * 0.58);
    plank.castShadow = true;
    plank.receiveShadow = true;
    stoneBridge.add(plank);

    if (s % 2 === 0) {
      [-1.12, 1.12].forEach((px) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.56, 0.25), mats.stoneLight);
        post.position.set(px, archY + 0.32, 1.6 + s * 0.58);
        post.castShadow = true;
        stoneBridge.add(post);
      });
    }
  }
  group.add(stoneBridge);

  // Helper to build charming arched Wooden Plank Footbridges with side posts
  const buildWoodenFootbridge = (bx: number, bz: number, halfSpan: number) => {
    const br = new THREE.Group();
    const steps = 3;
    for (let s = -steps; s <= steps; s++) {
      const t = s / steps;
      const archY = Math.cos(t * (Math.PI / 2)) * 0.22 + 0.16;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.14, halfSpan * 0.32), mats.woodPlank);
      plank.position.set(bx, archY, bz + t * halfSpan);
      plank.rotation.y = (s % 2 === 0 ? 1 : -1) * 0.02;
      plank.castShadow = true;
      plank.receiveShadow = true;
      br.add(plank);
    }
    [-0.48, 0.48].forEach((ox) => {
      const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, halfSpan * 2.25), mats.woodDark);
      stringer.position.set(bx + ox, 0.14, bz);
      br.add(stringer);
      [-halfSpan * 0.9, 0, halfSpan * 0.9].forEach((oz) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.62, 6), mats.woodDark);
        post.position.set(bx + ox * 1.42, 0.42, bz + oz);
        post.castShadow = true;
        br.add(post);
      });
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, halfSpan * 1.9), mats.woodWarm);
      rail.position.set(bx + ox * 1.42, 0.66, bz);
      rail.castShadow = true;
      br.add(rail);
    });
    group.add(br);
  };

  // 3. Three Cozy Wooden Bridges across Pond & Winding River
  buildWoodenFootbridge(4.3, 1.6, 2.25);     // East Pond Plank Bridge
  buildWoodenFootbridge(12.2, 1.6, 1.45);    // East Stream Bridge near Toko Perlengkapan
  buildWoodenFootbridge(-11.5, 2.6, 1.45);   // West Stream Bridge near Kebun Herbal

  // 4. Upper West Rocky Cliff Waterfall + Rotating Wooden Waterwheel Mill (-6.5, 1.6)
  const millCliff = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.65, 2.2), mats.stoneLight);
  millCliff.position.set(-6.75, 0.82, 0.65);
  millCliff.castShadow = true;
  millCliff.receiveShadow = true;
  const millCap = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.28, 2.35), mats.grassChartreuse);
  millCap.position.set(-6.75, 1.72, 0.65);
  millCap.receiveShadow = true;
  group.add(millCliff, millCap);

  const upperFall = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.55, 0.28), mats.waterfall);
  upperFall.position.set(-5.78, 0.85, 1.25);
  upperFall.rotation.z = -0.35;
  group.add(upperFall);
  waterfallMeshes.push(upperFall);

  const upperFoam = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.14, 7, 14), mats.waterFoam);
  upperFoam.rotation.x = Math.PI / 2;
  upperFoam.position.set(-5.25, 0.08, 1.25);
  group.add(upperFoam);
  foamMeshes.push(upperFoam);

  const waterwheelGroup = new THREE.Group();
  waterwheelGroup.position.set(-5.58, 0.88, 0.25);
  const wheelRimL = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.075, 8, 18), mats.woodDark);
  wheelRimL.rotation.y = Math.PI / 2;
  wheelRimL.position.x = -0.18;
  const wheelRimR = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.075, 8, 18), mats.woodDark);
  wheelRimR.rotation.y = Math.PI / 2;
  wheelRimR.position.x = 0.18;
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.8, 10), mats.woodDark);
  axle.rotation.z = Math.PI / 2;
  waterwheelGroup.add(wheelRimL, wheelRimR, axle);

  for (let p = 0; p < 8; p++) {
    const ang = (p / 8) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.46, 0.08), mats.woodWarm);
    spoke.rotation.x = ang;
    const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.06), mats.woodWarm);
    paddle.position.set(0, Math.cos(ang) * 0.72, Math.sin(ang) * 0.72);
    paddle.rotation.x = ang;
    paddle.castShadow = true;
    waterwheelGroup.add(spoke, paddle);
  }
  group.add(waterwheelGroup);

  // 5. River Rapids Foam Ripples
  [
    [-16.8, 2.6],
    [-7.8, 2.6],
    [8.2, 1.6],
    [17.6, 1.6],
  ].forEach(([fx, fz]) => {
    const foam = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 6, 12), mats.waterFoam);
    foam.rotation.x = Math.PI / 2;
    foam.position.set(fx, 0.06, fz);
    group.add(foam);
    foamMeshes.push(foam);
  });

  // 6. Lotus Pads & Vibrant Diorama Blossoms
  const padCoords: [number, number][] = [
    [-3.6, 0.9],
    [-2.7, 2.4],
    [2.3, 1.2],
    [2.9, 2.3],
    [-4.3, 2.8],
    [-15.2, 2.4],
    [15.4, 1.7],
  ];
  padCoords.forEach(([lx, lz], idx) => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.045, 14), mats.foliageLime);
    pad.position.set(lx, 0.065, lz);
    const flower = new THREE.Mesh(
      new THREE.ConeGeometry(0.17, 0.2, 6),
      idx % 2 === 0 ? mats.blossomPink : mats.blossomCream
    );
    flower.rotation.x = Math.PI;
    flower.position.set(lx, 0.16, lz);
    group.add(pad, flower);
  });

  // 7. Tiny Moored Wooden Rowboat
  const boatGroup = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.72), mats.woodDark);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.68), mats.woodWarm);
  seat.position.y = 0.18;
  boatGroup.add(hull, seat);
  boatGroup.position.set(-3.9, 0.16, 1.5);
  boatGroup.rotation.y = 0.25;
  boatGroup.castShadow = true;
  group.add(boatGroup);

  // 8. Kolam Pemancingan — Cozy Wooden Fishing Pier at x = 2.45
  const pierGroup = new THREE.Group();
  pierGroup.position.set(2.45, 0, 3.4);

  [
    [-0.52, -0.82],
    [0.52, -0.82],
    [-0.52, 0.35],
    [0.52, 0.35],
    [-0.52, 1.05],
    [0.52, 1.05],
  ].forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 0.65, 8), mats.woodDark);
    post.position.set(px, 0.18, pz);
    post.castShadow = true;
    pierGroup.add(post);
  });

  [-0.4, 0.4].forEach((ox) => {
    const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.1, 2.25), mats.woodDark);
    stringer.position.set(ox, 0.17, 0.1);
    pierGroup.add(stringer);
  });
  for (let i = 0; i < 6; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.08, 0.31), mats.woodPlank);
    plank.position.set(0, 0.23, -0.8 + i * 0.36);
    plank.rotation.y = (i % 2 === 0 ? 1 : -1) * 0.02;
    plank.receiveShadow = true;
    plank.castShadow = true;
    pierGroup.add(plank);
  }

  const bench = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.72), mats.woodWarm);
  bench.position.set(-0.34, 0.36, -0.35);
  bench.castShadow = true;
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.28, 10), mats.woodWarm);
  basket.position.set(0.36, 0.38, -0.45);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 1.45, 6), mats.woodDark);
  rod.position.set(0.42, 0.65, -0.95);
  rod.rotation.x = -0.82;
  rod.rotation.z = -0.15;
  const dockLanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.92, 7), mats.woodDark);
  dockLanternPost.position.set(-0.52, 0.62, -0.82);
  const dockLanternGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.35,
    })
  );
  dockLanternGlow.position.set(-0.52, 1.12, -0.82);
  pierGroup.add(bench, basket, rod, dockLanternPost, dockLanternGlow);
  group.add(pierGroup);

  // 9. Animated Swimming Koi Fish
  const fishes: FishAnimatedItem[] = [];
  const fishConfigs: [number, number, number, number, number, number][] = [
    [-2.4, 1.5, 1.2, 0.55, 0.75, 0],
    [2.1, 1.25, 0.85, 0.48, 0.95, 2.1],
    [0.2, 2.5, 0.65, 0.36, 1.1, 4.2],
  ];
  fishConfigs.forEach(([cx, cz, rx, rz, spd, ph]) => {
    const fGroup = new THREE.Group();
    const fBody = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), mats.fishAccent);
    fBody.scale.set(0.75, 0.65, 1.6);
    const fTail = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), mats.fishAccent);
    fTail.rotation.x = Math.PI / 2;
    fTail.position.z = -0.22;
    fGroup.add(fBody, fTail);
    fGroup.position.set(cx, -0.02, cz);
    group.add(fGroup);
    fishes.push({
      group: fGroup,
      tail: fTail,
      centerX: cx,
      centerZ: cz,
      radiusX: rx,
      radiusZ: rz,
      speed: spd,
      phase: ph,
    });
  });

  return {
    group,
    waterMesh,
    riverWestMesh,
    riverEastMesh,
    boatGroup,
    waterwheelGroup,
    foamMeshes,
    waterfallMeshes,
    fishes,
  };
}

export type TreeSpeciesVariant = 'oak' | 'fruit' | 'citrus' | 'blossom' | 'blossomCream' | 'conifer';

export function buildTree3D(
  mats: DioramaMaterialSet,
  variantOrBlossom: boolean | TreeSpeciesVariant
): THREE.Group {
  const variant: TreeSpeciesVariant =
    typeof variantOrBlossom === 'boolean'
      ? variantOrBlossom
        ? 'blossom'
        : 'oak'
      : variantOrBlossom;

  const tree = new THREE.Group();

  const rootMound = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.64, 0.2, 12), mats.grassChartreuse);
  rootMound.position.y = 0.1;
  rootMound.receiveShadow = true;

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.35, 1.6, 10), mats.woodDark);
  trunk.position.y = 0.8;
  trunk.castShadow = true;
  tree.add(rootMound, trunk);

  // Exposed Gnarled Surface Roots & Root-Base Mushroom Accent
  for (let r = 0; r < 4; r++) {
    const ang = (r / 4) * Math.PI * 2 + 0.35;
    const root = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.4, 4, 6), mats.woodDark);
    root.position.set(Math.cos(ang) * 0.32, 0.12, Math.sin(ang) * 0.32);
    root.rotation.z = Math.cos(ang) * 1.15;
    root.rotation.x = -Math.sin(ang) * 1.15;
    root.castShadow = true;
    tree.add(root);
  }

  if (variant === 'conifer') {
    const tiers: [number, number, number, THREE.Material][] = [
      [1.38, 1.08, 0.86, mats.foliageDeep],
      [2.05, 0.86, 0.78, mats.foliageGreen],
      [2.65, 0.62, 0.72, mats.foliageSage],
    ];
    tiers.forEach(([py, rad, sy, mat]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(rad, 14, 10), mat);
      puff.scale.set(1.06, sy, 1.06);
      puff.position.y = py;
      puff.castShadow = true;
      puff.receiveShadow = true;
      tree.add(puff);
    });
    return tree;
  }

  const branchL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.78, 6), mats.woodDark);
  branchL.position.set(-0.28, 1.48, 0.12);
  branchL.rotation.z = 0.55;
  branchL.castShadow = true;

  const branchR = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.12, 0.74, 6), mats.woodDark);
  branchR.position.set(0.3, 1.5, -0.1);
  branchR.rotation.z = -0.52;
  branchR.castShadow = true;
  tree.add(branchL, branchR);

  const canopyMat =
    variant === 'blossom'
      ? mats.blossomPink
      : variant === 'blossomCream'
        ? mats.blossomCream
        : mats.foliageGreen;
  const subMat =
    variant === 'blossom'
      ? mats.blossomCream
      : variant === 'blossomCream'
        ? mats.blossomPink
        : mats.foliageLime;
  const midMat =
    variant === 'blossom' || variant === 'blossomCream'
      ? mats.blossomPink
      : mats.foliageDeep;

  // Plush multi-lobe rounded canopy silhouettes
  const mainCanopy = new THREE.Mesh(new THREE.SphereGeometry(1.02, 16, 12), canopyMat);
  mainCanopy.position.y = 2.1;
  mainCanopy.scale.set(1.14, 0.92, 1.14);
  mainCanopy.castShadow = true;
  mainCanopy.receiveShadow = true;

  const side1 = new THREE.Mesh(new THREE.SphereGeometry(0.72, 14, 10), midMat);
  side1.position.set(-0.58, 1.76, 0.36);
  side1.castShadow = true;
  side1.receiveShadow = true;

  const side2 = new THREE.Mesh(new THREE.SphereGeometry(0.68, 14, 10), canopyMat);
  side2.position.set(0.58, 1.82, -0.28);
  side2.castShadow = true;
  side2.receiveShadow = true;

  const crownTop = new THREE.Mesh(new THREE.SphereGeometry(0.58, 12, 10), subMat);
  crownTop.position.set(0.06, 2.74, 0.08);
  crownTop.castShadow = true;

  tree.add(mainCanopy, side1, side2, crownTop);

  if (variant === 'fruit' || variant === 'citrus') {
    const fMat = variant === 'citrus' ? mats.citrusAccent : mats.fruitAccent;
    const fruits: [number, number, number][] = [
      [-0.82, 1.8, 0.65],
      [0.74, 1.88, 0.48],
      [0.12, 2.15, 1.02],
      [-0.25, 2.55, -0.45],
      [0.52, 2.42, 0.62],
    ];
    fruits.forEach(([fx, fy, fz]) => {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.125, 8, 6), fMat);
      fruit.position.set(fx, fy, fz);
      tree.add(fruit);
    });
  }

  if (variant === 'blossom' || variant === 'blossomCream') {
    const petalRing = new THREE.Mesh(
      new THREE.CircleGeometry(1.0, 14),
      variant === 'blossom' ? mats.blossomPink : mats.blossomCream
    );
    petalRing.rotation.x = -Math.PI / 2;
    petalRing.position.y = 0.025;
    petalRing.receiveShadow = true;
    tree.add(petalRing);
  }

  return tree;
}

export function buildCharacterHouse(
  mats: DioramaMaterialSet,
  windowMeshes: THREE.Mesh[],
  lanternLights: THREE.PointLight[],
  lanternBulbs: THREE.Mesh[],
  enablePointLights = true
): THREE.Group {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.34, 3.6), mats.stoneLight);
  plinth.position.y = 0.17;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  group.add(plinth);

  const porch = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.24, 1.05), mats.woodPlank);
  porch.position.set(0, 0.12, 2.18);
  porch.receiveShadow = true;
  group.add(porch);

  const walls = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.05, 3.2), mats.plasterIvory);
  walls.position.y = 1.36;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  [
    [-1.85, -1.55],
    [1.85, -1.55],
    [-1.85, 1.55],
    [1.85, 1.55],
  ].forEach(([bx, bz]) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.06, 0.16), mats.woodDark);
    beam.position.set(bx, 1.36, bz);
    beam.castShadow = true;
    group.add(beam);
  });

  const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(3.25, 1.95, 4), mats.roofSlate);
  mainRoof.rotation.y = Math.PI / 4;
  mainRoof.scale.set(1.06, 1, 0.94);
  mainRoof.position.y = 3.35;
  mainRoof.castShadow = true;
  group.add(mainRoof);

  const dormerWall = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.1, 1.3), mats.plasterSage);
  dormerWall.position.set(1.2, 2.6, 0.65);
  dormerWall.castShadow = true;
  const dormerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.95, 4), mats.roofCoral);
  dormerRoof.rotation.y = Math.PI / 4;
  dormerRoof.position.set(1.2, 3.6, 0.65);
  dormerRoof.castShadow = true;
  group.add(dormerWall, dormerRoof);

  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.35, 0.5), mats.stoneCliff);
  chimney.position.set(-1.15, 3.55, -0.75);
  chimney.castShadow = true;
  const chimneyCap = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.14, 0.64), mats.stoneLight);
  chimneyCap.position.set(-1.15, 4.26, -0.75);
  group.add(chimney, chimneyCap);

  const doorBase = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.05, 0.16), mats.woodWarm);
  doorBase.position.set(0, 0.86, 1.62);
  const doorArch = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 12), mats.woodWarm);
  doorArch.rotation.x = Math.PI / 2;
  doorArch.position.set(0, 1.38, 1.62);
  const doorTrim = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 8, 14, Math.PI), mats.woodDark);
  doorTrim.position.set(0, 1.38, 1.65);
  const awning = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.12, 0.72), mats.roofTerracotta);
  awning.position.set(0, 1.98, 1.95);
  awning.rotation.x = 0.25;
  awning.castShadow = true;
  group.add(doorBase, doorArch, doorTrim, awning);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 8),
    new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.55,
      roughness: 0.35,
    })
  );
  bulb.position.set(0.88, 1.72, 1.85);
  group.add(bulb);
  lanternBulbs.push(bulb);
  if (enablePointLights) {
    const pLight = new THREE.PointLight(0xfde68a, 0.0, 7, 1.5);
    pLight.position.set(0.88, 1.65, 2.05);
    group.add(pLight);
    lanternLights.push(pLight);
  }

  [-1.22, 1.22].forEach((wx) => {
    const wFrame = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.08), mats.woodDark);
    wFrame.position.set(wx, 1.4, 1.6);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.12), mats.glassWindow);
    win.position.set(wx, 1.4, 1.62);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.18, 0.24), mats.woodWarm);
    box.position.set(wx, 0.98, 1.68);
    const flowers = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), mats.blossomPink);
    flowers.scale.set(1.9, 0.55, 0.7);
    flowers.position.set(wx, 1.1, 1.68);
    group.add(wFrame, win, box, flowers);
    windowMeshes.push(win);
  });

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3 - row; col++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 7), mats.woodDark);
      log.rotation.x = Math.PI / 2;
      log.position.set(-2.15 + col * 0.2 + row * 0.1, 0.12 + row * 0.16, 0.8);
      group.add(log);
    }
  }
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.34, 10), mats.roofTerracotta);
  pot.position.set(2.15, 0.17, 1.25);
  const potBush = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), mats.foliageLime);
  potBush.position.set(2.15, 0.42, 1.25);
  group.add(pot, potBush);

  return group;
}

export function buildCharacterHouseLOD(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.2, 3.2), mats.plasterIvory);
  walls.position.y = 1.1;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.25, 1.95, 4), mats.roofSlate);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.35;
  group.add(walls, roof);
  return group;
}

export function buildHerbalGarden(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();

  const pad = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.05, 3.9), mats.grassAccent);
  pad.position.y = 0.025;
  pad.receiveShadow = true;
  group.add(pad);

  const addFence = (x1: number, z1: number, x2: number, z2: number, posts: number) => {
    for (let i = 0; i <= posts; i++) {
      const t = i / posts;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.62, 7), mats.woodDark);
      p.position.set(THREE.MathUtils.lerp(x1, x2, t), 0.31, THREE.MathUtils.lerp(z1, z2, t));
      p.castShadow = true;
      group.add(p);
    }
    const len = Math.hypot(x2 - x1, z2 - z1);
    const ang = -Math.atan2(z2 - z1, x2 - x1);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.06), mats.woodWarm);
    rail.position.set((x1 + x2) / 2, 0.42, (z1 + z2) / 2);
    rail.rotation.y = ang;
    group.add(rail);
  };
  addFence(-2.45, -1.85, 2.45, -1.85, 4);
  addFence(-2.45, 1.85, 2.45, 1.85, 4);
  addFence(-2.45, -1.85, -2.45, 1.85, 3);
  addFence(2.45, -1.85, 2.45, -0.65, 1);
  addFence(2.45, 0.65, 2.45, 1.85, 1);

  const gateTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 1.55), mats.woodWarm);
  gateTop.position.set(2.45, 1.48, 0);
  [-0.65, 0.65].forEach((gz) => {
    const gPost = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 1.5, 8), mats.woodDark);
    gPost.position.set(2.45, 0.75, gz);
    gPost.castShadow = true;
    group.add(gPost);
  });
  group.add(gateTop);

  const herbColors = [
    mats.foliageLime,
    mats.herbGold,
    mats.herbPurple,
    mats.foliageSage,
    mats.blossomCream,
    mats.crossEmerald,
  ];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const bx = -1.35 + col * 1.18;
      const bz = -0.82 + row * 1.32;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.24, 0.92), mats.woodDark);
      frame.position.set(bx, 0.12, bz);
      frame.castShadow = true;
      frame.receiveShadow = true;
      const dirt = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.2, 0.8), mats.soil);
      dirt.position.set(bx, 0.16, bz);
      group.add(frame, dirt);

      const hMat = herbColors[row * 3 + col];
      for (let s = 0; s < 4; s++) {
        const sx = bx + ((s % 2) - 0.5) * 0.36;
        const sz = bz + (Math.floor(s / 2) - 0.5) * 0.32;
        const herbPuff = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), hMat);
        herbPuff.scale.set(1.05, 0.9, 1.05);
        herbPuff.position.set(sx, 0.34, sz);
        group.add(herbPuff);
      }
    }
  }

  const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.45, 12), mats.stoneLight);
  wellBase.position.set(1.85, 0.225, -1.2);
  wellBase.castShadow = true;
  const wellWater = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 10), mats.water);
  wellWater.position.set(1.85, 0.38, -1.2);
  const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.55, 4), mats.roofTerracotta);
  wellRoof.rotation.y = Math.PI / 4;
  wellRoof.position.set(1.85, 1.28, -1.2);
  [-0.36, 0.36].forEach((ox) => {
    const wp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 6), mats.woodDark);
    wp.position.set(1.85 + ox, 0.76, -1.2);
    group.add(wp);
  });
  group.add(wellBase, wellWater, wellRoof);

  const kiosk = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.52, 0.58), mats.woodWarm);
  kiosk.position.set(1.8, 0.26, 1.22);
  kiosk.castShadow = true;
  const bag1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), mats.plasterIvory);
  bag1.scale.set(1.1, 1.25, 0.9);
  bag1.position.set(1.62, 0.64, 1.22);
  const bag2 = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), mats.roofCream);
  bag2.scale.set(1.1, 1.2, 0.9);
  bag2.position.set(1.98, 0.62, 1.22);
  group.add(kiosk, bag1, bag2);

  return group;
}

export function buildHerbalGardenLOD(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();
  const pad = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.2, 3.9), mats.grassAccent);
  pad.position.y = 0.1;
  const well = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.6, 4), mats.roofTerracotta);
  well.position.set(1.85, 1.2, -1.2);
  group.add(pad, well);
  return group;
}

export function buildExpansionZone(
  mats: DioramaMaterialSet,
  unlockedExpansions: string[] = []
): THREE.Group {
  const group = new THREE.Group();

  const plot = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.07, 2.9), mats.soil);
  plot.position.y = 0.035;
  plot.receiveShadow = true;
  group.add(plot);

  const corners: [number, number][] = [
    [-2.05, -1.45],
    [2.05, -1.45],
    [2.05, 1.45],
    [-2.05, 1.45],
  ];
  corners.forEach(([cx, cz]) => {
    const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.65, 7), mats.woodDark);
    stake.position.set(cx, 0.325, cz);
    stake.castShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), mats.roofCoral);
    cap.position.set(cx, 0.66, cz);
    group.add(stake, cap);
  });

  const northRail = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.05, 0.05), mats.woodWarm);
  northRail.position.set(0, 0.42, -1.45);
  const southRail = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.05, 0.05), mats.woodWarm);
  southRail.position.set(0, 0.42, 1.45);
  const eastRail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2.9), mats.woodWarm);
  eastRail.position.set(2.05, 0.42, 0);
  group.add(northRail, southRail, eastRail);

  const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.15, 7), mats.woodDark);
  signPost.position.set(-1.75, 0.57, -0.55);
  signPost.castShadow = true;
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.46, 0.92), mats.plasterIvory);
  signBoard.position.set(-1.75, 0.95, -0.55);
  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.54, 1.0), mats.woodWarm);
  signFrame.position.set(-1.73, 0.95, -0.55);
  group.add(signPost, signFrame, signBoard);

  // Dynamically construct built expansions when unlocked in Expansion Management!
  if (unlockedExpansions.includes('botanical_pavilion') || unlockedExpansions.includes('herb_greenhouse')) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.25, 1.5), mats.stoneLight);
    base.position.set(0.8, 0.125, -0.58);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.76, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.glassConservatory);
    dome.position.set(0.8, 0.25, -0.58);
    const herbInner = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 6), mats.foliageLime);
    herbInner.position.set(0.8, 0.42, -0.58);
    group.add(base, herbInner, dome);
  } else {
    for (let i = 0; i < 3; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.14, 0.42), mats.woodPlank);
      plank.position.set(0.85, 0.14 + i * 0.15, -0.55);
      plank.rotation.y = 0.08 * i;
      plank.castShadow = true;
      group.add(plank);
    }
  }

  if (
    unlockedExpansions.includes('south_pier_upgrade') ||
    unlockedExpansions.includes('tea_gazebo') ||
    unlockedExpansions.includes('herbal_tea_gazebo')
  ) {
    const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.35, 8), mats.woodDark);
    lanternPost.position.set(-0.75, 0.68, 0.68);
    lanternPost.castShadow = true;
    const lanternArm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.08), mats.woodWarm);
    lanternArm.position.set(-0.52, 1.3, 0.68);
    const lanternOrb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), mats.herbGold);
    lanternOrb.position.set(-0.3, 1.15, 0.68);
    const crateBench = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.34, 0.45), mats.woodPlank);
    crateBench.position.set(-0.72, 0.2, 0.22);
    crateBench.castShadow = true;
    group.add(lanternPost, lanternArm, lanternOrb, crateBench);
  } else {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.48, 0.58), mats.woodWarm);
    crate.position.set(-0.65, 0.28, 0.62);
    crate.castShadow = true;
    group.add(crate);
  }

  if (unlockedExpansions.includes('clinic_herb_wing') || unlockedExpansions.includes('apothecary_workshop')) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.52, 0.65), mats.woodDark);
    bench.position.set(0.95, 0.28, 0.72);
    bench.castShadow = true;
    const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.2, 10), mats.brass);
    mortar.position.set(0.95, 0.64, 0.72);
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 8), mats.glassConservatory);
    jar.position.set(0.62, 0.65, 0.72);
    group.add(bench, mortar, jar);
  } else {
    const stoneStack1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 0.62), mats.stoneLight);
    stoneStack1.position.set(0.9, 0.25, 0.68);
    stoneStack1.castShadow = true;
    group.add(stoneStack1);
  }

  if (unlockedExpansions.includes('eastern_observatory')) {
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.22, 8), mats.woodWarm);
    deck.position.set(-0.38, 0.14, -0.58);
    deck.castShadow = true;
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.12, 0.72, 8), mats.roofTeal);
    canopy.position.set(-0.38, 1.72, -0.58);
    canopy.castShadow = true;
    [-0.55, 0.55].forEach((ox) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 1.32, 6), mats.woodDark);
      pillar.position.set(-0.38 + ox, 0.85, -0.58);
      pillar.castShadow = true;
      group.add(pillar);
    });
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mats.brass);
    finial.position.set(-0.38, 2.12, -0.58);
    group.add(deck, canopy, finial);
  }

  return group;
}

export function buildVillageSignposts(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();
  const signCoords: [number, number, number][] = [
    [-3.2, -5.8, 0.4],
    [5.8, 7.6, -0.5],
    [-6.6, 7.6, 0.55],
    [10.2, -0.4, -0.35],
  ];
  signCoords.forEach(([sx, sz, ry]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.05, 7), mats.woodDark);
    post.position.set(sx, 0.52, sz);
    post.castShadow = true;
    const arrow1 = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.2, 0.08), mats.woodWarm);
    arrow1.position.set(sx + 0.1, 0.92, sz);
    arrow1.rotation.y = ry;
    arrow1.castShadow = true;
    const arrow2 = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.18, 0.08), mats.roofCoral);
    arrow2.position.set(sx - 0.08, 0.68, sz);
    arrow2.rotation.y = ry - 0.65;
    arrow2.castShadow = true;
    group.add(post, arrow1, arrow2);
  });
  return group;
}

export function buildVillageStreetLamps(
  mats: DioramaMaterialSet,
  lanternBulbs: THREE.Mesh[]
): THREE.Group {
  const group = new THREE.Group();
  const lampPositions: [number, number][] = [
    [-4.8, -8.5],
    [4.8, -8.5],
    [-2.4, 5.2],
    [7.2, 7.2],
    [-7.2, 7.2],
    [6.5, -1.6],
  ];

  lampPositions.forEach(([lx, lz]) => {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.22, 8), mats.stoneCliff);
    base.position.set(lx, 0.11, lz);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.75, 8), mats.woodDark);
    pole.position.set(lx, 0.98, lz);
    pole.castShadow = true;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.2, 6), mats.woodDark);
    cap.position.set(lx, 2.02, lz);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45,
      roughness: 0.35,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), bulbMat);
    bulb.position.set(lx, 1.84, lz);
    lanternBulbs.push(bulb);
    group.add(base, pole, cap, bulb);
  });

  return group;
}

export function buildWardrobeBoutique(
  mats: DioramaMaterialSet,
  windowMeshes: THREE.Mesh[],
  lanternBulbs: THREE.Mesh[]
): THREE.Group {
  const group = new THREE.Group();

  // Warm stone plinth & wooden porch step
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.32, 3.6), mats.stoneLight);
  plinth.position.y = 0.16;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  const porchStep = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.14, 0.56), mats.woodPlank);
  porchStep.position.set(0, 0.08, 2.02);
  porchStep.receiveShadow = true;
  group.add(plinth, porchStep);

  // Cream plaster boutique walls + dark timber posts
  const walls = new THREE.Mesh(new THREE.BoxGeometry(3.9, 2.15, 3.15), mats.plasterIvory);
  walls.position.y = 1.38;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  [
    [-1.9, -1.52],
    [1.9, -1.52],
    [-1.9, 1.52],
    [1.9, 1.52],
  ].forEach(([bx, bz]) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.16, 0.16), mats.woodDark);
    beam.position.set(bx, 1.38, bz);
    beam.castShadow = true;
    group.add(beam);
  });

  // Charming pitched coral-and-terracotta boutique roof + ornamental gable
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.35, 1.85, 4), mats.roofCoral);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.12, 1, 0.92);
  roof.position.y = 3.35;
  roof.castShadow = true;
  const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(4.45, 0.18, 3.65), mats.woodWarm);
  roofTrim.position.y = 2.48;
  roofTrim.castShadow = true;
  const spire = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), mats.brass);
  spire.position.y = 4.32;
  group.add(roof, roofTrim, spire);

  // Striped Coral & Cream Shop Awning over front display & entrance
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.12, 0.95),
      i % 2 === 0 ? mats.roofCoral : mats.roofCream
    );
    stripe.position.set(-1.44 + i * 0.72, 2.12, 1.98);
    stripe.rotation.x = 0.28;
    stripe.castShadow = true;
    group.add(stripe);
  }

  // Hanging Boutique Signboard with miniature golden coat hanger / shirt crest
  const signArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.78), mats.woodDark);
  signArm.position.set(-1.82, 2.26, 1.85);
  const signPlate = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.46, 0.1), mats.plasterIvory);
  signPlate.position.set(-1.82, 1.96, 2.18);
  const signTrim = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.54, 0.06), mats.woodDark);
  signTrim.position.set(-1.82, 1.96, 2.14);
  const signShirt = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.06), mats.roofCoral);
  signShirt.position.set(-1.82, 1.96, 2.24);
  group.add(signArm, signTrim, signPlate, signShirt);

  // Double Boutique Doors with warm window pane
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.48, 0.14), mats.woodWarm);
  door.position.set(-0.62, 1.06, 1.6);
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.6, 0.1), mats.woodDark);
  doorFrame.position.set(-0.62, 1.08, 1.56);
  const doorKnob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), mats.brass);
  doorKnob.position.set(-0.32, 1.02, 1.68);
  group.add(doorFrame, door, doorKnob);

  // Large Showcase Display Window on Right Side with Miniature Mannequin & Rolled Fabric Bolts
  const showFrame = new THREE.Mesh(new THREE.BoxGeometry(1.58, 1.18, 0.12), mats.woodDark);
  showFrame.position.set(0.88, 1.32, 1.58);
  const showGlass = new THREE.Mesh(new THREE.BoxGeometry(1.42, 1.02, 0.14), mats.glassWindow);
  showGlass.position.set(0.88, 1.32, 1.6);
  windowMeshes.push(showGlass);
  const showSill = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.14, 0.34), mats.woodWarm);
  showSill.position.set(0.88, 0.72, 1.68);
  group.add(showFrame, showGlass, showSill);

  // Outdoor Fabric Stand & Mannequin Dress Form beside entrance
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.1, 10), mats.woodDark);
  standBase.position.set(1.56, 0.37, 2.02);
  const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8), mats.woodDark);
  standPole.position.set(1.56, 0.76, 2.02);
  const mannequinTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.44, 10), mats.crossEmerald);
  mannequinTorso.position.set(1.56, 1.02, 2.02);
  const mannequinTrim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 6, 12), mats.brass);
  mannequinTrim.rotation.x = Math.PI / 2;
  mannequinTrim.position.set(1.56, 1.24, 2.02);
  group.add(standBase, standPole, mannequinTorso, mannequinTrim);

  // Rolled colorful cloth bolts on a small wooden display bench
  const clothBench = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.32, 0.46), mats.woodPlank);
  clothBench.position.set(-1.62, 0.46, 1.88);
  clothBench.castShadow = true;
  const boltMaterials = [mats.roofCoral, mats.crossEmerald, mats.herbGold];
  boltMaterials.forEach((bMat, idx) => {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.42, 8), bMat);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(-1.82 + idx * 0.2, 0.7, 1.88);
    group.add(bolt);
  });
  group.add(clothBench);

  // Warm Boutique Front Lanterns
  [-0.02, 1.78].forEach((lx) => {
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.55,
      roughness: 0.35,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), bulbMat);
    bulb.position.set(lx, 1.92, 1.84);
    lanternBulbs.push(bulb);
    group.add(bulb);
  });

  // Side windows & flower planters
  [-1.96, 1.96].forEach((sx) => {
    const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.68, 0.75), mats.glassWindow);
    sideWin.position.set(sx, 1.38, 0);
    windowMeshes.push(sideWin);
    group.add(sideWin);
  });

  return group;
}

export function buildWardrobeBoutiqueLOD(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(3.9, 2.2, 3.15), mats.plasterIvory);
  walls.position.y = 1.1;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.35, 1.85, 4), mats.roofCoral);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.12, 1, 0.92);
  roof.position.y = 3.35;
  group.add(walls, roof);
  return group;
}

// ---------------------------------------------------------------------------
// Ultra-lightweight LOD1 proxy builders
// ---------------------------------------------------------------------------

export function buildHospitalLOD(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(8.4, 2.85, 5.3), mats.plasterIvory);
  base.position.y = 1.425;
  const upper = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.85, 3.8), mats.plasterSage);
  upper.position.y = 3.8;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.4, 2.1, 4), mats.roofTeal);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.16, 1, 0.86);
  roof.position.y = 5.72;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(2.1, 6.2, 2.1), mats.stoneLight);
  tower.position.set(-4.35, 3.1, -1.35);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 3.2), mats.glassConservatory);
  wing.position.set(5.1, 1.3, -0.2);
  group.add(base, upper, roof, tower, wing);
  return group;
}

export function buildApothecaryLOD(mats: DioramaMaterialSet): THREE.Group {
  const group = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.6, 4.7), mats.woodWarm);
  deck.position.y = 0.8;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.25, 1.7, 4), mats.roofTeal);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.55;
  group.add(deck, roof);
  return group;
}

export function buildMarketStallLOD(
  mats: DioramaMaterialSet,
  awningMat: THREE.MeshStandardMaterial
): THREE.Group {
  const group = new THREE.Group();
  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.85, 1.5), mats.woodWarm);
  counter.position.y = 0.425;
  const awning = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 2.15), awningMat);
  awning.position.set(0, 2.15, 0.05);
  awning.rotation.x = 0.22;
  group.add(counter, awning);
  return group;
}

export function buildVillagerCottageLOD(
  mats: DioramaMaterialSet,
  roofMat: THREE.MeshStandardMaterial
): THREE.Group {
  const group = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.1, 3.0), mats.plasterIvory);
  walls.position.y = 1.05;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.92, 1.62, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 2.94;
  group.add(walls, roof);
  return group;
}

export function buildTreeLOD(
  mats: DioramaMaterialSet,
  variantOrBlossom: boolean | TreeSpeciesVariant
): THREE.Group {
  const isBlossom =
    variantOrBlossom === true || variantOrBlossom === 'blossom' || variantOrBlossom === 'blossomCream';
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.55, 5), mats.woodDark);
  trunk.position.y = 0.78;
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 10, 8),
    isBlossom
      ? variantOrBlossom === 'blossomCream'
        ? mats.blossomCream
        : mats.blossomPink
      : mats.foliageGreen
  );
  canopy.position.y = 2.05;
  tree.add(trunk, canopy);
  return tree;
}
