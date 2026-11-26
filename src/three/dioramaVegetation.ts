import * as THREE from 'three';

export interface VegetationConfig {
  quality: 'low' | 'medium';
  exclusionZones: Array<{ x: number; z: number; halfW: number; halfD: number }>;
  roadSegments: Array<{ x: number; z: number; w: number; d: number; rotY?: number }>;
  treeAnchors: Array<{ x: number; z: number; scale: number }>;
  buildingShadowAnchors: Array<{ x: number; z: number; radiusX: number; radiusZ: number }>;
}

export interface StylizedVegetationSystem {
  group: THREE.Group;
  update: (elapsed: number, isWindy: boolean) => void;
  dispose: () => void;
}

function createDeterministicRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createSoftAoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(18, 34, 22, 0.56)');
    grad.addColorStop(0.55, 'rgba(18, 34, 22, 0.26)');
    grad.addColorStop(1, 'rgba(18, 34, 22, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildStylizedVegetationSystem(
  config: VegetationConfig
): StylizedVegetationSystem {
  const group = new THREE.Group();
  const rand = createDeterministicRng(90210);
  const isLow = config.quality === 'low';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  const isInsideWater = (x: number, z: number, pad = 1.0) => {
    // Central Koi Pond
    if (Math.abs(x) < 6.0 + pad && z > -1.0 - pad && z < 4.2 + pad) return true;
    // West winding river stream
    if (x <= -5.8 && z > 1.35 - pad && z < 3.85 + pad) return true;
    // East winding river stream
    if (x >= 5.8 && z > 0.35 - pad && z < 2.85 + pad) return true;
    return false;
  };

  const isInsideExclusion = (x: number, z: number, pad = 0.6) => {
    if (isInsideWater(x, z, pad)) return true;
    for (let i = 0; i < config.exclusionZones.length; i++) {
      const zBox = config.exclusionZones[i];
      if (
        Math.abs(x - zBox.x) < zBox.halfW + pad &&
        Math.abs(z - zBox.z) < zBox.halfD + pad
      ) {
        return true;
      }
    }
    return false;
  };

  const isOnRoad = (x: number, z: number, pad = 0.45) => {
    if (Math.hypot(x, z - 8.8) < 4.35 + pad) return true;
    for (let i = 0; i < config.roadSegments.length; i++) {
      const r = config.roadSegments[i];
      const ang = -(r.rotY ?? 0);
      const dx = x - r.x;
      const dz = z - r.z;
      const lx = dx * Math.cos(ang) - dz * Math.sin(ang);
      const lz = dx * Math.sin(ang) + dz * Math.cos(ang);
      if (Math.abs(lx) < r.w * 0.5 + pad && Math.abs(lz) < r.d * 0.5 + pad) {
        return true;
      }
    }
    return false;
  };

  // -------------------------------------------------------------------------
  // 1. SOFT AMBIENT OCCLUSION CONTACT-SHADOW DISCS (Trees + Buildings)
  // -------------------------------------------------------------------------
  const aoTex = createSoftAoTexture();
  textures.push(aoTex);

  const aoGeo = new THREE.PlaneGeometry(1, 1);
  aoGeo.rotateX(-Math.PI / 2);
  geometries.push(aoGeo);

  const aoMat = new THREE.MeshBasicMaterial({
    map: aoTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.8,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  materials.push(aoMat);

  const aoCount =
    config.treeAnchors.length + config.buildingShadowAnchors.length;
  const aoInst = new THREE.InstancedMesh(aoGeo, aoMat, Math.max(1, aoCount));
  let aoIdx = 0;

  config.buildingShadowAnchors.forEach((b) => {
    dummy.position.set(b.x, 0.018, b.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(b.radiusX * 2.35, 1, b.radiusZ * 2.35);
    dummy.updateMatrix();
    aoInst.setMatrixAt(aoIdx++, dummy.matrix);
  });

  config.treeAnchors.forEach((t) => {
    dummy.position.set(t.x, 0.02, t.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(3.4 * t.scale, 1, 3.4 * t.scale);
    dummy.updateMatrix();
    aoInst.setMatrixAt(aoIdx++, dummy.matrix);
  });
  aoInst.instanceMatrix.needsUpdate = true;
  aoInst.computeBoundingSphere();
  group.add(aoInst);

  // -------------------------------------------------------------------------
  // 2. STEPPING-STONE PAVERS ALONG VILLAGE PATHWAYS
  // -------------------------------------------------------------------------
  const paverPoints: { x: number; z: number; rot: number; sx: number; sz: number }[] = [];
  config.roadSegments.forEach((seg) => {
    const count = Math.max(3, Math.floor((seg.w + seg.d) * (isLow ? 0.55 : 0.9)));
    const ry = seg.rotY ?? 0;
    for (let i = 0; i < count; i++) {
      const lx = (rand() - 0.5) * Math.max(0.5, seg.w - 0.8);
      const lz = (rand() - 0.5) * Math.max(0.5, seg.d - 0.8);
      const wx = seg.x + lx * Math.cos(ry) + lz * Math.sin(ry);
      const wz = seg.z - lx * Math.sin(ry) + lz * Math.cos(ry);
      if (isInsideWater(wx, wz, 0.1)) continue;
      if (Math.hypot(wx, wz - 8.8) < 1.35) continue;
      paverPoints.push({
        x: wx,
        z: wz,
        rot: rand() * Math.PI,
        sx: 0.45 + rand() * 0.4,
        sz: 0.38 + rand() * 0.35,
      });
    }
  });

  if (paverPoints.length > 0) {
    const paverGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.06, 7);
    geometries.push(paverGeo);
    const paverMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.88,
      metalness: 0.02,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    materials.push(paverMat);

    const paverInst = new THREE.InstancedMesh(paverGeo, paverMat, paverPoints.length);
    paverInst.receiveShadow = true;
    const stoneTones = [0xe0d5bd, 0xd1c5ab, 0xc7baa0, 0xe8dec7, 0xccc0aa];

    paverPoints.forEach((p, idx) => {
      dummy.position.set(p.x, 0.045, p.z);
      dummy.rotation.set(0, p.rot, 0);
      dummy.scale.set(p.sx, 1, p.sz);
      dummy.updateMatrix();
      paverInst.setMatrixAt(idx, dummy.matrix);
      color.setHex(stoneTones[idx % stoneTones.length]);
      paverInst.setColorAt(idx, color);
    });
    paverInst.instanceMatrix.needsUpdate = true;
    if (paverInst.instanceColor) paverInst.instanceColor.needsUpdate = true;
    paverInst.computeBoundingSphere();
    group.add(paverInst);
  }

  // -------------------------------------------------------------------------
  // 3. MATTE ROUNDED MULTI-PUFF BUSHES (Vibrant Living Greens)
  // -------------------------------------------------------------------------
  const bushSpots: { x: number; z: number; sc: number; hue: number }[] = [];
  const targetBushes = isLow ? 36 : 62;
  let attempts = 0;
  while (bushSpots.length < targetBushes && attempts < 700) {
    attempts++;
    const x = (rand() - 0.5) * 44;
    const z = (rand() - 0.5) * 44;
    if (isInsideExclusion(x, z, 0.85) || isOnRoad(x, z, 0.7)) continue;
    const tooClose = bushSpots.some((b) => Math.hypot(b.x - x, b.z - z) < 2.2);
    if (tooClose) continue;
    bushSpots.push({
      x,
      z,
      sc: 0.74 + rand() * 0.56,
      hue: rand(),
    });
  }

  const bushPuffsPerCluster = 3;
  const bushGeo = new THREE.SphereGeometry(0.48, 12, 10);
  geometries.push(bushGeo);
  const bushMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.0,
  });
  materials.push(bushMat);

  const bushInst = new THREE.InstancedMesh(
    bushGeo,
    bushMat,
    Math.max(1, bushSpots.length * bushPuffsPerCluster)
  );
  bushInst.castShadow = !isLow;
  bushInst.receiveShadow = true;

  const bushPalette = [0x3b964c, 0x52ad50, 0x6ec354, 0x2f7f44, 0x7dcd54];
  const bushAnimMeta: {
    baseX: number;
    baseY: number;
    baseZ: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    rotY: number;
    phase: number;
  }[] = [];

  bushSpots.forEach((b, idx) => {
    const offsets: [number, number, number, number][] = [
      [0, 0.36 * b.sc, 0, 1.0],
      [-0.36 * b.sc, 0.28 * b.sc, 0.18 * b.sc, 0.76],
      [0.34 * b.sc, 0.3 * b.sc, -0.16 * b.sc, 0.82],
    ];
    offsets.forEach(([ox, oy, oz, rScale], subIdx) => {
      const mIdx = idx * bushPuffsPerCluster + subIdx;
      const sx = b.sc * rScale * 1.12;
      const sy = b.sc * rScale * 0.86;
      const sz = b.sc * rScale * 1.1;
      const px = b.x + ox;
      const pz = b.z + oz;
      const ry = idx * 1.3 + subIdx * 0.9;

      dummy.position.set(px, oy, pz);
      dummy.rotation.set(0, ry, 0);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      bushInst.setMatrixAt(mIdx, dummy.matrix);

      color.setHex(bushPalette[(idx + subIdx) % bushPalette.length]);
      bushInst.setColorAt(mIdx, color);

      bushAnimMeta.push({
        baseX: px,
        baseY: oy,
        baseZ: pz,
        scaleX: sx,
        scaleY: sy,
        scaleZ: sz,
        rotY: ry,
        phase: idx * 0.71 + subIdx * 0.4,
      });
    });
  });
  bushInst.instanceMatrix.needsUpdate = true;
  if (bushInst.instanceColor) bushInst.instanceColor.needsUpdate = true;
  bushInst.computeBoundingSphere();
  group.add(bushInst);

  // -------------------------------------------------------------------------
  // 4. LUSH GRASS TUFTS & MEDICINAL HERB SPRIGS (Animated Wind Sway)
  // -------------------------------------------------------------------------
  const tuftSpots: { x: number; z: number; sc: number; rotY: number; isHerb: boolean }[] = [];
  const targetTufts = isLow ? 140 : 250;
  let tuftTries = 0;
  while (tuftSpots.length < targetTufts && tuftTries < 1400) {
    tuftTries++;
    const x = (rand() - 0.5) * 45;
    const z = (rand() - 0.5) * 45;
    if (isInsideExclusion(x, z, 0.38) || isOnRoad(x, z, 0.25)) continue;
    tuftSpots.push({
      x,
      z,
      sc: 0.75 + rand() * 0.6,
      rotY: rand() * Math.PI * 2,
      isHerb: rand() > 0.68,
    });
  }

  const bladeGeo = new THREE.ConeGeometry(0.11, 0.36, 5);
  bladeGeo.translate(0, 0.18, 0);
  geometries.push(bladeGeo);

  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.0,
  });
  materials.push(bladeMat);

  const bladesPerTuft = 3;
  const tuftInst = new THREE.InstancedMesh(
    bladeGeo,
    bladeMat,
    Math.max(1, tuftSpots.length * bladesPerTuft)
  );
  tuftInst.receiveShadow = true;

  const grassPalette = [0x6fc44b, 0x89d656, 0x54a743, 0x418d4c, 0x97dc5f];
  const tuftMeta: {
    x: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
    sc: number;
    phase: number;
  }[] = [];

  tuftSpots.forEach((t, idx) => {
    for (let b = 0; b < bladesPerTuft; b++) {
      const mIdx = idx * bladesPerTuft + b;
      const ang = t.rotY + b * 2.09;
      const px = t.x + Math.cos(ang) * 0.11 * t.sc;
      const pz = t.z + Math.sin(ang) * 0.11 * t.sc;
      const rx = (b - 1) * 0.18;
      const rz = (b % 2 === 0 ? 1 : -1) * 0.22;
      const sc = t.sc * (0.85 + b * 0.12);

      dummy.position.set(px, 0, pz);
      dummy.rotation.set(rx, ang, rz);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      tuftInst.setMatrixAt(mIdx, dummy.matrix);

      color.setHex(
        t.isHerb
          ? b === 1
            ? 0x2f8f6b
            : 0x49b086
          : grassPalette[(idx + b) % grassPalette.length]
      );
      tuftInst.setColorAt(mIdx, color);

      tuftMeta.push({
        x: px,
        z: pz,
        rx,
        ry: ang,
        rz,
        sc,
        phase: idx * 0.43 + b * 0.6,
      });
    }
  });
  tuftInst.instanceMatrix.needsUpdate = true;
  if (tuftInst.instanceColor) tuftInst.instanceColor.needsUpdate = true;
  tuftInst.computeBoundingSphere();
  group.add(tuftInst);

  // -------------------------------------------------------------------------
  // 5. WILDFLOWERS & HERB BLOOMS
  // -------------------------------------------------------------------------
  const flowerSpots = tuftSpots.filter((_, idx) => idx % (isLow ? 4 : 3) === 0);
  if (flowerSpots.length > 0) {
    const petalGeo = new THREE.DodecahedronGeometry(0.115, 0);
    petalGeo.scale(1.2, 0.45, 1.2);
    geometries.push(petalGeo);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.0,
    });
    materials.push(petalMat);

    const flowerInst = new THREE.InstancedMesh(petalGeo, petalMat, flowerSpots.length);
    const flowerColors = [0xffcf40, 0xf27da8, 0xfff5d6, 0xb87ee8, 0xff9776, 0x7bb9f5];

    flowerSpots.forEach((f, idx) => {
      dummy.position.set(f.x, 0.28 * f.sc, f.z);
      dummy.rotation.set(0.14, f.rotY, 0.08);
      dummy.scale.setScalar(f.sc * 1.05);
      dummy.updateMatrix();
      flowerInst.setMatrixAt(idx, dummy.matrix);
      color.setHex(flowerColors[idx % flowerColors.length]);
      flowerInst.setColorAt(idx, color);
    });
    flowerInst.instanceMatrix.needsUpdate = true;
    if (flowerInst.instanceColor) flowerInst.instanceColor.needsUpdate = true;
    flowerInst.computeBoundingSphere();
    group.add(flowerInst);
  }

  // -------------------------------------------------------------------------
  // 6. WOODLAND MUSHROOMS NEAR TREE ROOTS & FOREST EDGES (Red Toadstools & Cream)
  // -------------------------------------------------------------------------
  const mushroomSpots: { x: number; z: number; sc: number; isRed: boolean }[] = [];
  config.treeAnchors.forEach((t, idx) => {
    const count = isLow ? 1 : 2;
    for (let m = 0; m < count; m++) {
      const ang = idx * 1.8 + m * 2.1;
      const dist = 0.75 * t.scale + 0.35;
      const mx = t.x + Math.cos(ang) * dist;
      const mz = t.z + Math.sin(ang) * dist;
      if (isInsideWater(mx, mz, 0.3) || isOnRoad(mx, mz, 0.3)) continue;
      mushroomSpots.push({
        x: mx,
        z: mz,
        sc: 0.8 + ((idx + m) % 3) * 0.22,
        isRed: (idx + m) % 2 === 0,
      });
    }
  });

  if (mushroomSpots.length > 0) {
    const stemGeo = new THREE.CylinderGeometry(0.045, 0.068, 0.16, 7);
    const capGeo = new THREE.ConeGeometry(0.14, 0.12, 8);
    geometries.push(stemGeo, capGeo);

    const stemMat = new THREE.MeshStandardMaterial({ color: 0xf7efe0, roughness: 0.85 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.76 });
    materials.push(stemMat, capMat);

    const stemInst = new THREE.InstancedMesh(stemGeo, stemMat, mushroomSpots.length);
    const capInst = new THREE.InstancedMesh(capGeo, capMat, mushroomSpots.length);
    capInst.castShadow = !isLow;

    mushroomSpots.forEach((m, idx) => {
      dummy.position.set(m.x, 0.08 * m.sc, m.z);
      dummy.rotation.set(0, idx * 0.7, 0);
      dummy.scale.setScalar(m.sc);
      dummy.updateMatrix();
      stemInst.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(m.x, 0.19 * m.sc, m.z);
      dummy.updateMatrix();
      capInst.setMatrixAt(idx, dummy.matrix);

      color.setHex(m.isRed ? 0xd94b38 : 0xe8c488);
      capInst.setColorAt(idx, color);
    });
    stemInst.instanceMatrix.needsUpdate = true;
    capInst.instanceMatrix.needsUpdate = true;
    if (capInst.instanceColor) capInst.instanceColor.needsUpdate = true;
    stemInst.computeBoundingSphere();
    capInst.computeBoundingSphere();
    group.add(stemInst, capInst);
  }

  // -------------------------------------------------------------------------
  // 7. ROUNDED MOSSY MEADOW BOULDERS (InstancedMesh)
  // -------------------------------------------------------------------------
  const rockSpots: { x: number; z: number; sx: number; sy: number; sz: number; ry: number }[] = [];
  const targetRocks = isLow ? 16 : 28;
  let rockTries = 0;
  while (rockSpots.length < targetRocks && rockTries < 500) {
    rockTries++;
    const x = (rand() - 0.5) * 44;
    const z = (rand() - 0.5) * 44;
    if (isInsideExclusion(x, z, 0.95) || isOnRoad(x, z, 0.8)) continue;
    rockSpots.push({
      x,
      z,
      sx: 0.42 + rand() * 0.45,
      sy: 0.28 + rand() * 0.24,
      sz: 0.38 + rand() * 0.42,
      ry: rand() * Math.PI * 2,
    });
  }

  if (rockSpots.length > 0) {
    const rockGeo = new THREE.DodecahedronGeometry(0.65, 1);
    geometries.push(rockGeo);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.88,
      metalness: 0.02,
    });
    materials.push(rockMat);

    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockSpots.length);
    rockInst.castShadow = !isLow;
    rockInst.receiveShadow = true;
    const rockTones = [0xb0ab9c, 0x9b9789, 0xc2bcac, 0x8d9988];

    rockSpots.forEach((r, idx) => {
      dummy.position.set(r.x, r.sy * 0.32, r.z);
      dummy.rotation.set(0, r.ry, 0);
      dummy.scale.set(r.sx, r.sy, r.sz);
      dummy.updateMatrix();
      rockInst.setMatrixAt(idx, dummy.matrix);
      color.setHex(rockTones[idx % rockTones.length]);
      rockInst.setColorAt(idx, color);
    });
    rockInst.instanceMatrix.needsUpdate = true;
    if (rockInst.instanceColor) rockInst.instanceColor.needsUpdate = true;
    rockInst.computeBoundingSphere();
    group.add(rockInst);
  }

  let lastWindUpdate = -1;

  return {
    group,
    update: (elapsed: number, isWindy: boolean) => {
      const interval = isLow ? 0.09 : 0.045;
      if (lastWindUpdate >= 0 && elapsed - lastWindUpdate < interval) return;
      lastWindUpdate = elapsed;

      const swayAmp = isWindy ? 0.24 : 0.08;
      const swayFreq = isWindy ? 4.1 : 1.9;

      for (let i = 0; i < tuftMeta.length; i++) {
        const m = tuftMeta[i];
        const sway = Math.sin(elapsed * swayFreq + m.phase) * swayAmp;
        dummy.position.set(m.x, 0, m.z);
        dummy.rotation.set(m.rx + sway * 0.45, m.ry, m.rz + sway);
        dummy.scale.setScalar(m.sc);
        dummy.updateMatrix();
        tuftInst.setMatrixAt(i, dummy.matrix);
      }
      tuftInst.instanceMatrix.needsUpdate = true;

      if (!isLow) {
        const bushFreq = isWindy ? 3.2 : 1.4;
        const bushAmp = isWindy ? 0.035 : 0.012;
        for (let i = 0; i < bushAnimMeta.length; i++) {
          const b = bushAnimMeta[i];
          const wobble = Math.sin(elapsed * bushFreq + b.phase) * bushAmp;
          dummy.position.set(b.baseX, b.baseY, b.baseZ);
          dummy.rotation.set(wobble, b.rotY, wobble * 0.8);
          dummy.scale.set(b.scaleX, b.scaleY * (1 + wobble * 0.6), b.scaleZ);
          dummy.updateMatrix();
          bushInst.setMatrixAt(i, dummy.matrix);
        }
        bushInst.instanceMatrix.needsUpdate = true;
      }
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
