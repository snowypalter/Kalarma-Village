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

export interface PondAnimatedRefs {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  boatGroup: THREE.Group;
  waterwheelGroup: THREE.Group;
  foamMeshes: THREE.Mesh[];
  waterfallMeshes: THREE.Mesh[];
}

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
  const cliffGeo = new THREE.CylinderGeometry(islandSize * 0.53, islandSize * 0.34, 3.2, 6);
  const cliff = new THREE.Mesh(cliffGeo, mats.stoneCliff);
  cliff.rotation.y = Math.PI / 6;
  cliff.position.y = -3.95;
  cliff.castShadow = true;
  group.add(cliff);

  // 2. Multi-Tiered Outer Limestone Cliff Plateaus & Grassy Terraces framing the wider 52x52 perimeter
  const cliffTerraces: [number, number, number, number, number, number][] = [
    [-23.2, -23.2, 8.2, 4.2, 6.8, 0.18],   // Northwest high bluff
    [-12.8, -24.6, 10.6, 3.0, 4.0, 0.05],  // North-left terrace
    [12.8, -24.5, 10.4, 3.2, 4.2, -0.06],  // North-right terrace behind Sacred Tree
    [23.4, -22.8, 7.8, 3.8, 7.0, -0.22],   // Northeast cliff bluff
    [-24.8, -6.0, 3.6, 2.4, 13.5, 0.08],   // West cliff flank
    [24.6, -2.5, 5.2, 3.1, 10.5, -0.12],   // East Windmill cliff bluff
    [24.6, 13.0, 3.8, 2.3, 9.5, 0.14],     // Southeast cliff bluff
    [-24.6, 13.5, 3.6, 2.1, 9.5, -0.1],    // Southwest cliff flank
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

  // 3. Soft Rounded Grassy Overhang Cushions across the spacious lawns
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
    [-17.5, -1.0, 3.2, false],
    [17.8, 2.4, 3.1, true],
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
  const roadSegments: [number, number, number, number, number][] = [
    [0, -7.2, 12.0, 7.2, 0],         // Spacious Plaza in front of Hospital
    [0, 1.8, 3.2, 17.5, 0],          // Main North-South spine across Stone Bridge
    [4.3, 1.6, 2.0, 9.2, 0],         // Path across Eastern Plank Bridge
    [0, 8.8, 32.5, 3.2, 0],          // Wide East-West village promenade
    [8.2, -2.2, 11.5, 2.6, 0.14],    // Avenue to Apothecary Pavilion
    [-10.5, -4.5, 13.0, 2.6, -0.32], // Avenue to West neighborhoods
    [10.8, -8.5, 11.5, 2.5, 0.28],   // Avenue to East villas
    [0, 14.2, 24.5, 5.2, 0],         // Spacious South market plaza
  ];
  roadSegments.forEach(([rx, rz, rw, rd, rotY]) => {
    const road = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.05, rd), mats.cobbleRoad);
    road.position.set(rx, 0.025, rz);
    road.rotation.y = rotY;
    road.receiveShadow = true;
    group.add(road);
  });

  // Circular cobblestone Fountain Courtyard disc at (0, 8.8)
  const plazaDisc = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.2, 0.06, 24), mats.cobbleRoad);
  plazaDisc.position.set(0, 0.03, 8.8);
  plazaDisc.receiveShadow = true;
  group.add(plazaDisc);

  // 5. Storybook Wooden Pasture Fences framing the expanded 52x52 perimeter
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

  // 6. Smooth Rounded Diorama River/Rim Boulders
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

  // 7. Instanced Grass Overhang Tufts + Oversized Colorful Botanical Wildflowers (2 Draw Calls Total!)
  const tuftSpots: [number, number, number, number][] = [
    [-20.5, -19.2, 1.1, 0x8cd25b],
    [-14.5, -19.8, 1.0, 0x9de061],
    [-7.8, -20.2, 1.15, 0x73bf57],
    [7.8, -20.2, 1.1, 0x8cd25b],
    [14.5, -19.8, 1.0, 0x79c65c],
    [20.5, -19.0, 1.15, 0x9de061],
    [-21.2, -8.5, 1.1, 0x73bf57],
    [-21.0, 2.5, 1.2, 0x8cd25b],
    [-21.0, 12.8, 1.05, 0x9de061],
    [21.0, -8.5, 1.1, 0x79c65c],
    [21.2, 3.8, 1.2, 0x8cd25b],
    [20.8, 12.8, 1.05, 0x73bf57],
    [-11.5, -6.5, 1.0, 0x9de061],
    [-7.8, 5.0, 1.1, 0x8cd25b],
    [7.6, 4.8, 1.1, 0x79c65c],
    [-12.2, 19.8, 1.1, 0x9de061],
    [12.2, 19.8, 1.1, 0x8cd25b],
    [-4.8, 21.8, 1.0, 0x73bf57],
    [4.8, 21.8, 1.0, 0x9de061],
    [-19.5, 20.2, 1.2, 0x79c65c],
    [19.5, 20.2, 1.2, 0x9de061],
    [-3.1, -0.8, 0.9, 0x9de061],
    [2.6, 4.5, 0.95, 0x8cd25b],
    [-2.4, 4.5, 0.95, 0x9de061],
    [7.2, -5.2, 1.05, 0x9de061],
    [-6.6, -4.8, 1.05, 0x8cd25b],
    [-15.8, -11.5, 1.0, 0x9de061],
    [15.8, -11.5, 1.0, 0x8cd25b],
    [-15.2, 9.8, 1.05, 0x79c65c],
    [15.2, 9.8, 1.05, 0x9de061],
  ];

  const bladeGeo = new THREE.ConeGeometry(0.18, 0.44, 6);
  bladeGeo.translate(0, 0.22, 0);
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78 });
  const bladeInst = new THREE.InstancedMesh(bladeGeo, bladeMat, tuftSpots.length * 3);
  bladeInst.receiveShadow = true;

  // Stylized Link's Awakening chunky 5-petal blossom heads
  const bloomGeo = new THREE.DodecahedronGeometry(0.15, 0);
  bloomGeo.scale(1.25, 0.55, 1.25);
  const bloomMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
  const bloomInst = new THREE.InstancedMesh(bloomGeo, bloomMat, tuftSpots.length);

  const _dummy = new THREE.Object3D();
  const _col = new THREE.Color();
  const bloomColors = [0xf48fb1, 0xffd54f, 0xff8a65, 0xfff8e1, 0xce93d8];

  tuftSpots.forEach(([tx, tz, sc, colHex], idx) => {
    for (let b = 0; b < 3; b++) {
      const ang = b * 2.1 + idx * 0.7;
      _dummy.position.set(tx + Math.cos(ang) * 0.17, 0.0, tz + Math.sin(ang) * 0.17);
      _dummy.rotation.set((b - 1) * 0.16, ang, (b % 2 === 0 ? 1 : -1) * 0.18);
      _dummy.scale.setScalar(sc * (0.85 + b * 0.12));
      _dummy.updateMatrix();
      bladeInst.setMatrixAt(idx * 3 + b, _dummy.matrix);
      _col.setHex(colHex);
      bladeInst.setColorAt(idx * 3 + b, _col);
    }

    _dummy.position.set(tx, 0.36 * sc, tz);
    _dummy.rotation.set(0.15, idx * 0.9, 0);
    _dummy.scale.setScalar(sc);
    _dummy.updateMatrix();
    bloomInst.setMatrixAt(idx, _dummy.matrix);
    _col.setHex(bloomColors[idx % bloomColors.length]);
    bloomInst.setColorAt(idx, _col);
  });

  bladeInst.instanceMatrix.needsUpdate = true;
  if (bladeInst.instanceColor) bladeInst.instanceColor.needsUpdate = true;
  bladeInst.computeBoundingSphere();

  bloomInst.instanceMatrix.needsUpdate = true;
  if (bloomInst.instanceColor) bloomInst.instanceColor.needsUpdate = true;
  bloomInst.computeBoundingSphere();

  group.add(bladeInst, bloomInst);

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

  // Stone steps leading up to main doors
  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 0.45), mats.stoneLight);
    step.position.set(0, 0.075 + s * 0.14, 2.78 + (2 - s) * 0.42);
    step.receiveShadow = true;
    step.castShadow = true;
    group.add(step);
  }

  // Ground floor main hall with Tudor half-timber framing
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

  // Pitched Teal Layered Roof (upper) + Twin Dormer Chimneys
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

  // Lower veranda terracotta skirt roof
  const roofLower = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.32, 5.4), mats.roofTerracotta);
  roofLower.position.y = 2.98;
  roofLower.castShadow = true;
  group.add(roofLower);

  // Tall Stone Clinic Watchtower Turret on North-West Flank (from Image 2 village castle tower!)
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

  // Glowing warm windows with dark wood frames & sills
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

  // Brass roof finial spire
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
  lanternBulbs: THREE.Mesh[]
): THREE.Group {
  const group = new THREE.Group();

  // Raised wooden deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 4.6), mats.woodWarm);
  deck.position.y = 0.175;
  deck.receiveShadow = true;
  deck.castShadow = true;
  group.add(deck);

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

  // Open Pagoda-style Sage Roof with warm wood trim
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.15, 1.65, 4), mats.roofTeal);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.52;
  roof.castShadow = true;
  group.add(roof);

  // Apothecary Shelves with Colorful Glass Potion Bottles
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.9, 0.45), mats.woodDark);
  shelf.position.set(0, 1.3, -1.55);
  shelf.castShadow = true;
  group.add(shelf);

  const bottleColors = [0x3b826e, 0xd97706, 0x38bdf8, 0xf472b6, 0xa78bfa];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const bMat = new THREE.MeshStandardMaterial({
        color: bottleColors[(r + c) % bottleColors.length],
        roughness: 0.15,
        metalness: 0.12,
      });
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.32, 8), bMat);
      bottle.position.set(-1.1 + c * 0.55, 1.0 + r * 0.75, -1.45);
      group.add(bottle);
    }
  }

  // Mixing table & brass mortar in center
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.72, 0.9), mats.woodWarm);
  table.position.set(0, 0.71, 0.3);
  table.castShadow = true;
  const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.22, 12), mats.brass);
  mortar.position.set(0, 1.18, 0.3);
  group.add(table, mortar);

  // Pastel Hanging Lanterns
  const lanternColors = [0xfde68a, 0xfbcfe8];
  [-2.0, 2.0].forEach((lx, idx) => {
    const bulbMat = new THREE.MeshStandardMaterial({
      color: lanternColors[idx],
      emissive: lanternColors[idx],
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), bulbMat);
    bulb.position.set(lx, 2.35, 1.9);
    group.add(bulb);
    lanternBulbs.push(bulb);

    const pLight = new THREE.PointLight(lanternColors[idx], 0.0, 8, 1.5);
    pLight.position.set(lx, 2.2, 2.1);
    group.add(pLight);
    lanternLights.push(pLight);
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

  // Warm stone plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.3, 3.45), mats.stoneLight);
  plinth.position.y = 0.15;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Stucco cottage walls + Tudor dark-oak corner beams
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

  // Storybook Steep Roof + Link's Awakening Barrel-Arch Wooden Gable Rim
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

  // Round-topped Cozy Wooden Door (from Image 1 Link's Awakening cottage!)
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

  // Iconic Crimson Red Village Mailbox beside cottage (Image 1 detail!)
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

  // Tiny Cozy Clothesline / Herb Drying Line beside cottage (Image 1 detail!)
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

  // Grassy terraced shrine plinth around ancient roots
  const rootMound = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.5, 0.45, 14), mats.grassChartreuse);
  rootMound.position.y = 0.22;
  rootMound.receiveShadow = true;
  group.add(rootMound);

  // Gnarled thick trunk & spreading surface roots (Image 2 iconic centerpiece!)
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 3.1, 10), mats.woodDark);
  trunk.position.y = 1.65;
  trunk.castShadow = true;
  group.add(trunk);

  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + 0.4;
    const root = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.95, 5, 8), mats.woodDark);
    root.position.set(Math.cos(ang) * 0.85, 0.45, Math.sin(ang) * 0.85);
    root.rotation.z = Math.cos(ang) * 1.1;
    root.rotation.x = -Math.sin(ang) * 1.1;
    root.castShadow = true;
    group.add(root);

    const bough = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 1.8, 7), mats.woodDark);
    bough.position.set(Math.cos(ang) * 0.85, 3.1, Math.sin(ang) * 0.85);
    bough.rotation.z = -Math.cos(ang) * 0.65;
    bough.rotation.x = Math.sin(ang) * 0.65;
    bough.castShadow = true;
    group.add(bough);
  }

  // Towering Layered Emerald & Sunlit Lime Canopy Puffs
  const puffs: [number, number, number, number, THREE.Material][] = [
    [0, 4.15, 0, 1.95, mats.foliageGreen],
    [-1.4, 3.65, 0.7, 1.4, mats.foliageSage],
    [1.45, 3.7, -0.65, 1.38, mats.foliageGreen],
    [0.15, 3.6, 1.4, 1.3, mats.foliageLime],
    [-0.2, 3.75, -1.35, 1.32, mats.foliageSage],
    [0.1, 5.15, 0.1, 1.35, mats.foliageLime],
  ];
  puffs.forEach(([px, py, pz, r, m]) => {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), m);
    puff.scale.set(1.12, 0.78, 1.12);
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
  const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(2.35, 0), mats.foliageGreen);
  canopy.scale.set(1.15, 0.78, 1.15);
  canopy.position.y = 4.1;
  group.add(trunk, canopy);
  return group;
}

export function buildCliffWindmill(mats: DioramaMaterialSet): {
  group: THREE.Group;
  bladesGroup: THREE.Group;
} {
  const group = new THREE.Group();

  // Elevated stone cliff pedestal
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.2, 1.35, 10), mats.stoneLight);
  mound.position.y = 0.675;
  mound.castShadow = true;
  mound.receiveShadow = true;
  const grassCap = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.88, 0.25, 12), mats.grassChartreuse);
  grassCap.position.y = 1.38;
  grassCap.receiveShadow = true;
  group.add(mound, grassCap);

  // Stone & timber tower body
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

  // Rotating 4-Sail Windmill Rotor Hub
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

  // 1. Shimmering Turquoise River Pond Surface (clear shallow diorama water)
  const waterGeo = new THREE.PlaneGeometry(11.8, 5.3, 24, 12);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMesh = new THREE.Mesh(waterGeo, mats.water);
  waterMesh.position.set(0, 0.035, 1.6);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // Light sandy pebbles & stepping stones visible near water margins
  const pebbleCoords: [number, number, number][] = [
    [-2.4, 0.6, 0.24],
    [-2.1, 2.7, 0.2],
    [2.3, 0.8, 0.22],
    [2.7, 2.5, 0.26],
    [3.4, 3.1, 0.2],
    [-3.5, 2.9, 0.22],
  ];
  pebbleCoords.forEach(([px, pz, r]) => {
    const pebble = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mats.stoneLight);
    pebble.scale.set(1.3, 0.45, 1.1);
    pebble.position.set(px, 0.04, pz);
    group.add(pebble);
  });

  // Rounded stone pond rim rocks
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * Math.PI * 2;
    const rx = Math.cos(ang) * 5.95;
    const rz = 1.6 + Math.sin(ang) * 2.7;
    // Leave clearance for both Stone Bridge (|x|<1.5) and Plank Bridge (x in [3.4, 5.2])
    if (Math.abs(rx) < 1.55 || (rx > 3.35 && rx < 5.2)) continue;
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

  // 3. Weathered Wooden Plank Footbridge (from Image 1 Link's Awakening!) at x = 4.3
  const plankBridge = new THREE.Group();
  for (let s = -3; s <= 3; s++) {
    const archY = Math.cos((s / 3) * (Math.PI / 2)) * 0.2 + 0.16;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.14, 0.68), mats.woodPlank);
    plank.position.set(4.3, archY, 1.6 + s * 0.72);
    plank.rotation.y = (s % 2 === 0 ? 1 : -1) * 0.025;
    plank.castShadow = true;
    plank.receiveShadow = true;
    plankBridge.add(plank);
  }
  // Longitudinal timber stringers beneath planks
  [-0.45, 0.45].forEach((ox) => {
    const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 5.2), mats.woodDark);
    stringer.position.set(4.3 + ox, 0.14, 1.6);
    plankBridge.add(stringer);
  });
  group.add(plankBridge);

  // 4. Upper West Rocky Cliff Waterfall + Rotating Wooden Waterwheel Mill (-6.5, 1.6)
  const millCliff = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.65, 2.7), mats.stoneLight);
  millCliff.position.set(-6.75, 0.82, 1.6);
  millCliff.castShadow = true;
  millCliff.receiveShadow = true;
  const millCap = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.28, 2.85), mats.grassChartreuse);
  millCap.position.set(-6.75, 1.72, 1.6);
  millCap.receiveShadow = true;
  group.add(millCliff, millCap);

  // Upper waterfall chute tumbling into the pond beside the waterwheel
  const upperFall = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.55, 0.28), mats.waterfall);
  upperFall.position.set(-5.78, 0.85, 2.25);
  upperFall.rotation.z = -0.35;
  group.add(upperFall);
  waterfallMeshes.push(upperFall);

  const upperFoam = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.14, 7, 14), mats.waterFoam);
  upperFoam.rotation.x = Math.PI / 2;
  upperFoam.position.set(-5.25, 0.08, 2.25);
  group.add(upperFoam);
  foamMeshes.push(upperFoam);

  // Rotating Wooden Waterwheel (from Image 2 mill wheel!)
  const waterwheelGroup = new THREE.Group();
  waterwheelGroup.position.set(-5.58, 0.88, 1.15);
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

  // 5. Lower East Twin Spillway Waterfall Cascade (visually spilling over stone weir at x=6.05, z=1.6)
  const spillwayRock = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 2.2), mats.stoneLight);
  spillwayRock.position.set(5.95, 0.14, 1.6);
  group.add(spillwayRock);

  [-0.52, 0.52].forEach((oz) => {
    const lowerFoam = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.11, 6, 12), mats.waterFoam);
    lowerFoam.rotation.x = Math.PI / 2;
    lowerFoam.position.set(5.55, 0.08, 1.6 + oz);
    group.add(lowerFoam);
    foamMeshes.push(lowerFoam);
  });

  // 6. Lotus Pads & Vibrant Diorama Blossoms
  const padCoords: [number, number][] = [
    [-3.6, 0.9],
    [-2.7, 2.4],
    [2.3, 1.2],
    [2.9, 2.3],
    [-4.3, 2.8],
  ];
  padCoords.forEach(([lx, lz], idx) => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.045, 14), mats.foliageLime);
    pad.position.set(lx, 0.065, lz);
    const flower = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.22, 6),
      idx % 2 === 0 ? mats.blossomPink : mats.blossomCream
    );
    flower.rotation.x = Math.PI;
    flower.position.set(lx, 0.17, lz);
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

  return { group, waterMesh, boatGroup, waterwheelGroup, foamMeshes, waterfallMeshes };
}

export function buildTree3D(mats: DioramaMaterialSet, isBlossom: boolean): THREE.Group {
  const tree = new THREE.Group();

  // Soft chartreuse grass mound collar at trunk base
  const rootMound = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.54, 0.18, 10), mats.grassChartreuse);
  rootMound.position.y = 0.09;
  rootMound.receiveShadow = true;

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.31, 1.6, 9), mats.woodDark);
  trunk.position.y = 0.8;
  trunk.castShadow = true;

  const branchL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.8, 6), mats.woodDark);
  branchL.position.set(-0.3, 1.52, 0.12);
  branchL.rotation.z = 0.55;
  branchL.castShadow = true;

  const branchR = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.12, 0.75, 6), mats.woodDark);
  branchR.position.set(0.32, 1.54, -0.1);
  branchR.rotation.z = -0.52;
  branchR.castShadow = true;

  tree.add(rootMound, trunk, branchL, branchR);

  const canopyMat = isBlossom ? mats.blossomPink : mats.foliageGreen;
  const subMat = isBlossom ? mats.blossomCream : mats.foliageLime;
  const midMat = isBlossom ? mats.blossomPink : mats.foliageSage;

  // Lush painterly rounded puffs inspired by both Image 1 & Image 2
  const mainCanopy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.02, 1), canopyMat);
  mainCanopy.position.y = 2.12;
  mainCanopy.scale.set(1.08, 0.9, 1.08);
  mainCanopy.castShadow = true;
  mainCanopy.receiveShadow = true;

  const side1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), midMat);
  side1.position.set(-0.58, 1.76, 0.36);
  side1.castShadow = true;
  side1.receiveShadow = true;

  const side2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 1), canopyMat);
  side2.position.set(0.58, 1.82, -0.26);
  side2.castShadow = true;
  side2.receiveShadow = true;

  const crownTop = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 1), subMat);
  crownTop.position.set(0.08, 2.75, 0.08);
  crownTop.castShadow = true;

  tree.add(mainCanopy, side1, side2, crownTop);

  if (isBlossom) {
    const petalRing = new THREE.Mesh(new THREE.CircleGeometry(0.95, 14), mats.blossomPink);
    petalRing.rotation.x = -Math.PI / 2;
    petalRing.position.y = 0.025;
    petalRing.receiveShadow = true;
    tree.add(petalRing);
  }

  return tree;
}

// ---------------------------------------------------------------------------
// Ultra-lightweight LOD1 proxy builders (shared materials, minimal triangles)
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
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.6, 4.6), mats.woodWarm);
  deck.position.y = 0.8;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(4.15, 1.65, 4), mats.roofTeal);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.52;
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

export function buildTreeLOD(mats: DioramaMaterialSet, isBlossom: boolean): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.55, 5), mats.woodDark);
  trunk.position.y = 0.78;
  const canopy = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.18, 0),
    isBlossom ? mats.blossomPink : mats.foliageGreen
  );
  canopy.position.y = 2.0;
  tree.add(trunk, canopy);
  return tree;
}
