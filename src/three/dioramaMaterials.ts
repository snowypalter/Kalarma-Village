import * as THREE from 'three';

export interface WaterRippleUniforms {
  uTime: { value: number };
}

export interface DioramaMaterialSet {
  grassTop: THREE.MeshStandardMaterial;
  grassAccent: THREE.MeshStandardMaterial;
  grassChartreuse: THREE.MeshStandardMaterial;
  soil: THREE.MeshStandardMaterial;
  stoneCliff: THREE.MeshStandardMaterial;
  stoneLight: THREE.MeshStandardMaterial;
  cobbleRoad: THREE.MeshStandardMaterial;
  water: THREE.MeshPhysicalMaterial;
  waterfall: THREE.MeshPhysicalMaterial;
  waterFoam: THREE.MeshStandardMaterial;
  waterUniforms: WaterRippleUniforms;
  woodDark: THREE.MeshStandardMaterial;
  woodWarm: THREE.MeshStandardMaterial;
  woodPlank: THREE.MeshStandardMaterial;
  plasterIvory: THREE.MeshStandardMaterial;
  plasterSage: THREE.MeshStandardMaterial;
  roofTeal: THREE.MeshStandardMaterial;
  roofTerracotta: THREE.MeshStandardMaterial;
  roofCoral: THREE.MeshStandardMaterial;
  roofCream: THREE.MeshStandardMaterial;
  roofMosaic: THREE.MeshStandardMaterial;
  mailboxRed: THREE.MeshPhysicalMaterial;
  sailCloth: THREE.MeshStandardMaterial;
  glassWindow: THREE.MeshStandardMaterial;
  glassWindowLit: THREE.MeshStandardMaterial;
  glassConservatory: THREE.MeshPhysicalMaterial;
  brass: THREE.MeshStandardMaterial;
  crossEmerald: THREE.MeshStandardMaterial;
  foliageGreen: THREE.MeshPhysicalMaterial;
  foliageSage: THREE.MeshPhysicalMaterial;
  foliageLime: THREE.MeshPhysicalMaterial;
  blossomPink: THREE.MeshPhysicalMaterial;
  blossomCream: THREE.MeshPhysicalMaterial;
  disposeAll: () => void;
}

// Deterministic pseudo-random helper for clean, repeatable procedural PBR textures
function seededNoise(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeCanvasTexture(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  size: number,
  repeatX: number,
  repeatY: number,
  isColor: boolean,
  anisotropy: number,
  registry: THREE.Texture[]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) draw(ctx, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  registry.push(tex);
  return tex;
}

function createCobblePair(
  anisotropy: number,
  registry: THREE.Texture[]
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const stones = ['#E6DEC8', '#D8CEB8', '#DFD6C2', '#CFC3AC', '#EDE6D4'];

  const map = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(1042);
      ctx.fillStyle = '#A89F8B';
      ctx.fillRect(0, 0, w, h);

      for (let y = 6; y < h; y += 32) {
        const rowOffset = (Math.floor(y / 32) % 2) * 16;
        for (let x = -12; x < w + 16; x += 32) {
          const sx = x + rowOffset + (rand() - 0.5) * 3;
          const sy = y + (rand() - 0.5) * 3;
          const sw = 24 + (rand() - 0.5) * 3;
          const sh = 23 + (rand() - 0.5) * 3;
          ctx.fillStyle = stones[Math.floor(rand() * stones.length)];
          ctx.beginPath();
          ctx.roundRect(sx, sy, sw, sh, 8);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255,253,245,0.45)';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }
      for (let i = 0; i < 45; i++) {
        ctx.fillStyle = `rgba(116, 178, 88, ${0.14 + rand() * 0.14})`;
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, 1.5 + rand() * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    256,
    4,
    4,
    true,
    anisotropy,
    registry
  );

  const bumpMap = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(1042);
      ctx.fillStyle = '#303030';
      ctx.fillRect(0, 0, w, h);
      for (let y = 6; y < h; y += 32) {
        const rowOffset = (Math.floor(y / 32) % 2) * 16;
        for (let x = -12; x < w + 16; x += 32) {
          const sx = x + rowOffset + (rand() - 0.5) * 3;
          const sy = y + (rand() - 0.5) * 3;
          const sw = 24 + (rand() - 0.5) * 3;
          const sh = 23 + (rand() - 0.5) * 3;
          const lum = 185 + Math.floor(rand() * 55);
          ctx.fillStyle = `rgb(${lum},${lum},${lum})`;
          ctx.beginPath();
          ctx.roundRect(sx, sy, sw, sh, 8);
          ctx.fill();
        }
      }
    },
    256,
    4,
    4,
    false,
    anisotropy,
    registry
  );

  return { map, bumpMap };
}

function createGrassPair(
  baseHex: string,
  bladeHex1: string,
  bladeHex2: string,
  anisotropy: number,
  registry: THREE.Texture[]
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const map = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(2099);
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, w, h);
      // Soft painterly meadow dapple patches
      for (let i = 0; i < 48; i++) {
        ctx.fillStyle = rand() > 0.48 ? bladeHex1 : bladeHex2;
        ctx.globalAlpha = 0.22 + rand() * 0.2;
        ctx.beginPath();
        ctx.ellipse(rand() * w, rand() * h, 10 + rand() * 18, 8 + rand() * 14, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 420; i++) {
        const gx = rand() * w;
        const gy = rand() * h;
        ctx.fillStyle = rand() > 0.45 ? bladeHex1 : bladeHex2;
        ctx.globalAlpha = 0.25 + rand() * 0.35;
        ctx.fillRect(gx, gy, 2 + rand() * 2, 4 + rand() * 5);
      }
      // Micro clover & warm daisy dots
      for (let i = 0; i < 42; i++) {
        ctx.fillStyle = rand() > 0.35 ? '#C5EA9E' : '#FFF8DC';
        ctx.globalAlpha = 0.42;
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, 1.5 + rand() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    256,
    6,
    6,
    true,
    anisotropy,
    registry
  );

  const bumpMap = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(2099);
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 420; i++) {
        const v = 132 + Math.floor(rand() * 98);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(rand() * w, rand() * h, 2, 5);
      }
    },
    256,
    6,
    6,
    false,
    anisotropy,
    registry
  );

  return { map, bumpMap };
}

function createWoodPair(
  baseHex: string,
  grainHex: string,
  highlightHex: string,
  anisotropy: number,
  registry: THREE.Texture[]
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const map = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(3117);
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, w, h);

      for (let y = 0; y < h; y += 32) {
        ctx.fillStyle = 'rgba(20, 12, 6, 0.2)';
        ctx.fillRect(0, y, w, 2);
        ctx.fillStyle = highlightHex;
        ctx.globalAlpha = 0.16;
        ctx.fillRect(0, y + 2, w, 2);
        ctx.globalAlpha = 1;
      }
      for (let i = 0; i < 160; i++) {
        const y = rand() * h;
        ctx.strokeStyle = rand() > 0.3 ? grainHex : highlightHex;
        ctx.globalAlpha = 0.18 + rand() * 0.2;
        ctx.lineWidth = 1 + rand() * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          w * 0.33,
          y + (rand() - 0.5) * 5,
          w * 0.66,
          y + (rand() - 0.5) * 5,
          w,
          y
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    256,
    2,
    2,
    true,
    anisotropy,
    registry
  );

  const bumpMap = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(3117);
      ctx.fillStyle = '#909090';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) {
        ctx.fillStyle = '#383838';
        ctx.fillRect(0, y, w, 2);
      }
      for (let i = 0; i < 120; i++) {
        const v = 105 + Math.floor(rand() * 85);
        ctx.strokeStyle = `rgb(${v},${v},${v})`;
        ctx.lineWidth = 1.2;
        const y = rand() * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    },
    256,
    2,
    2,
    false,
    anisotropy,
    registry
  );

  return { map, bumpMap };
}

function createRoofTilePair(
  palette: string[],
  mortarHex: string,
  anisotropy: number,
  registry: THREE.Texture[]
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const map = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(4221);
      ctx.fillStyle = palette[0];
      ctx.fillRect(0, 0, w, h);

      const tileH = 26;
      const tileW = 32;
      for (let row = 0; row * tileH < h + tileH; row++) {
        const offset = (row % 2) * (tileW / 2);
        const y = row * tileH;
        for (let x = -tileW; x < w + tileW; x += tileW) {
          ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
          ctx.globalAlpha = 0.88;
          ctx.beginPath();
          ctx.arc(x + offset + tileW / 2, y + 6, tileW * 0.5, 0, Math.PI);
          ctx.fill();

          // Glossy pastel ceramic rim highlight
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x + offset + tileW / 2, y + 5, tileW * 0.44, 0.25, Math.PI - 0.25);
          ctx.stroke();

          ctx.globalAlpha = 0.42;
          ctx.strokeStyle = mortarHex;
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.arc(x + offset + tileW / 2, y + 6, tileW * 0.52, 0.08, Math.PI - 0.08);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    },
    256,
    3,
    3,
    true,
    anisotropy,
    registry
  );

  const bumpMap = makeCanvasTexture(
    (ctx, w, h) => {
      ctx.fillStyle = '#B8B8B8';
      ctx.fillRect(0, 0, w, h);
      const tileH = 26;
      const tileW = 32;
      for (let row = 0; row * tileH < h + tileH; row++) {
        const offset = (row % 2) * (tileW / 2);
        const y = row * tileH;
        for (let x = -tileW; x < w + tileW; x += tileW) {
          ctx.strokeStyle = '#383838';
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.arc(x + offset + tileW / 2, y + 6, tileW * 0.52, 0.08, Math.PI - 0.08);
          ctx.stroke();
        }
      }
    },
    256,
    3,
    3,
    false,
    anisotropy,
    registry
  );

  return { map, bumpMap };
}

function createPlasterPair(
  baseHex: string,
  anisotropy: number,
  registry: THREE.Texture[]
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const map = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(5103);
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 380; i++) {
        ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(130,115,95,0.06)';
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, 1 + rand() * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    128,
    2,
    2,
    true,
    anisotropy,
    registry
  );

  const bumpMap = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(5103);
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 320; i++) {
        const v = 110 + Math.floor(rand() * 48);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(rand() * w, rand() * h, 2, 2);
      }
    },
    128,
    2,
    2,
    false,
    anisotropy,
    registry
  );

  return { map, bumpMap };
}

function createStonePair(
  mortarHex: string,
  shades: string[],
  anisotropy: number,
  registry: THREE.Texture[]
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const map = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(6077);
      ctx.fillStyle = mortarHex;
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) {
        const off = (Math.floor(y / 32) % 2) * 28;
        for (let x = -32; x < w + 32; x += 56) {
          ctx.fillStyle = shades[Math.floor(rand() * shades.length)];
          ctx.beginPath();
          ctx.roundRect(x + off + 2, y + 2, 52, 28, 6);
          ctx.fill();
        }
      }
      for (let i = 0; i < 120; i++) {
        ctx.fillStyle = rand() > 0.72 ? 'rgba(116,178,96,0.22)' : 'rgba(255,255,255,0.1)';
        ctx.fillRect(rand() * w, rand() * h, 2.5, 2.5);
      }
    },
    256,
    2,
    2,
    true,
    anisotropy,
    registry
  );

  const bumpMap = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(6077);
      ctx.fillStyle = '#404040';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) {
        const off = (Math.floor(y / 32) % 2) * 28;
        for (let x = -32; x < w + 32; x += 56) {
          const lum = 160 + Math.floor(rand() * 62);
          ctx.fillStyle = `rgb(${lum},${lum},${lum})`;
          ctx.beginPath();
          ctx.roundRect(x + off + 2, y + 2, 52, 28, 6);
          ctx.fill();
        }
      }
    },
    256,
    2,
    2,
    false,
    anisotropy,
    registry
  );

  return { map, bumpMap };
}

function createFoliageTexture(
  baseHex: string,
  lightHex: string,
  darkHex: string,
  anisotropy: number,
  registry: THREE.Texture[]
): THREE.CanvasTexture {
  return makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(7731);
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 220; i++) {
        ctx.fillStyle = rand() > 0.45 ? lightHex : darkHex;
        ctx.globalAlpha = 0.28 + rand() * 0.34;
        ctx.beginPath();
        ctx.ellipse(
          rand() * w,
          rand() * h,
          4 + rand() * 6,
          2.5 + rand() * 4,
          rand() * Math.PI,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    128,
    2,
    2,
    true,
    anisotropy,
    registry
  );
}

function createWaterfallTexture(
  anisotropy: number,
  registry: THREE.Texture[]
): THREE.CanvasTexture {
  return makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(9921);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#55BFD9');
      grad.addColorStop(0.5, '#7AD7EC');
      grad.addColorStop(1, '#55BFD9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 42; i++) {
        const sx = rand() * w;
        const sy = rand() * h;
        const sw = 3 + rand() * 6;
        const sh = 24 + rand() * 44;
        ctx.fillStyle = rand() > 0.35 ? 'rgba(255,255,255,0.68)' : 'rgba(205,247,255,0.45)';
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, sw / 2);
        ctx.fill();
      }
    },
    128,
    2,
    1,
    true,
    anisotropy,
    registry
  );
}

export function createDioramaMaterials(
  maxAnisotropy: number,
  isConstrainedGpu: boolean
): DioramaMaterialSet {
  const anisotropy = Math.min(4, Math.max(1, maxAnisotropy));
  const textures: THREE.Texture[] = [];

  const cobblePair = createCobblePair(anisotropy, textures);
  // Lush Link's Awakening + Painterly Fantasy Meadow Grass Palette
  const grassMainPair = createGrassPair('#7AC261', '#9AD65D', '#5EA44B', anisotropy, textures);
  const grassAccPair = createGrassPair('#69B358', '#89CC5B', '#4F9444', anisotropy, textures);
  const grassChartPair = createGrassPair('#9ED45A', '#BCE774', '#7AB947', anisotropy, textures);

  const woodDarkPair = createWoodPair('#6E482E', '#4F321E', '#895E3F', anisotropy, textures);
  const woodWarmPair = createWoodPair('#C28149', '#996030', '#DC9E64', anisotropy, textures);
  const woodPlankPair = createWoodPair('#DDD0B8', '#B8A88C', '#EFE6D5', anisotropy, textures);
  const plasterIvoryPair = createPlasterPair('#FAF4E8', anisotropy, textures);
  const plasterSagePair = createPlasterPair('#E3EDE2', anisotropy, textures);

  const stoneCliffPair = createStonePair('#747E78', ['#8B968F', '#7C8780', '#96A199', '#6F7A73'], anisotropy, textures);
  const stoneLightPair = createStonePair('#9A968A', ['#B5B0A3', '#C5BFB2', '#A7A295', '#CFCAC0'], anisotropy, textures);

  const roofTealPair = createRoofTilePair(['#2E7B6D', '#246458', '#3F9686'], '#1B4B42', anisotropy, textures);
  const roofTerraPair = createRoofTilePair(['#DC6D48', '#C45937', '#EA845E'], '#8F3C23', anisotropy, textures);
  const roofCoralPair = createRoofTilePair(['#E4816D', '#C96855', '#F09D8C'], '#984738', anisotropy, textures);
  const roofCreamPair = createRoofTilePair(['#F2E2C2', '#E0CCA8', '#FAF0DA'], '#B59E78', anisotropy, textures);
  // Link's Awakening Pastel Mosaic Shingles!
  const roofMosaicPair = createRoofTilePair(
    ['#E8876D', '#F1D4A7', '#94B8C9', '#DA6B52', '#C5CEAC'],
    '#8B5B4A',
    anisotropy,
    textures
  );

  const soilTex = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(8812);
      ctx.fillStyle = '#9C714A';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 18) {
        ctx.fillStyle = rand() > 0.5 ? 'rgba(65, 42, 24, 0.14)' : 'rgba(186, 142, 98, 0.16)';
        ctx.fillRect(0, y, w, 6 + rand() * 8);
      }
    },
    128,
    3,
    1,
    true,
    anisotropy,
    textures
  );

  const foliageGreenTex = createFoliageTexture('#4FA564', '#6EC47B', '#37824C', anisotropy, textures);
  const foliageSageTex = createFoliageTexture('#6CB76B', '#8CD27D', '#4E9750', anisotropy, textures);
  const foliageLimeTex = createFoliageTexture('#9AD156', '#BBE871', '#77B23D', anisotropy, textures);
  const blossomPinkTex = createFoliageTexture('#F4A9BC', '#FCC9D6', '#DF859D', anisotropy, textures);
  const blossomCreamTex = createFoliageTexture('#F9E4BE', '#FFF5E0', '#E4C79B', anisotropy, textures);
  const waterfallTex = createWaterfallTexture(anisotropy, textures);

  const grassTop = new THREE.MeshStandardMaterial({
    map: grassMainPair.map,
    bumpMap: grassMainPair.bumpMap,
    bumpScale: 0.03,
    roughness: 0.84,
    metalness: 0.0,
  });

  const grassAccent = new THREE.MeshStandardMaterial({
    map: grassAccPair.map,
    bumpMap: grassAccPair.bumpMap,
    bumpScale: 0.028,
    roughness: 0.82,
    metalness: 0.0,
  });

  const grassChartreuse = new THREE.MeshStandardMaterial({
    map: grassChartPair.map,
    bumpMap: grassChartPair.bumpMap,
    bumpScale: 0.025,
    roughness: 0.78,
    metalness: 0.0,
  });

  const soil = new THREE.MeshStandardMaterial({
    map: soilTex,
    roughness: 0.9,
    metalness: 0.0,
  });

  const stoneCliff = new THREE.MeshStandardMaterial({
    map: stoneCliffPair.map,
    bumpMap: stoneCliffPair.bumpMap,
    bumpScale: 0.05,
    roughness: 0.82,
    metalness: 0.03,
  });

  const stoneLight = new THREE.MeshStandardMaterial({
    map: stoneLightPair.map,
    bumpMap: stoneLightPair.bumpMap,
    bumpScale: 0.045,
    roughness: 0.78,
    metalness: 0.02,
  });

  const cobbleRoad = new THREE.MeshStandardMaterial({
    map: cobblePair.map,
    bumpMap: cobblePair.bumpMap,
    bumpScale: 0.05,
    roughness: 0.8,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const waterUniforms: WaterRippleUniforms = {
    uTime: { value: 0 },
  };
  const water = new THREE.MeshPhysicalMaterial({
    color: 0x56c3dd,
    roughness: 0.08,
    metalness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.92,
    envMapIntensity: 1.5,
    transparent: true,
    opacity: 0.84,
  });
  water.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = waterUniforms.uTime;
    shader.vertexShader =
      `uniform float uTime;\n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float wave1 = sin(position.x * 1.9 + uTime * 2.2) * cos(position.z * 1.6 - uTime * 1.8);
        float wave2 = sin((position.x + position.z) * 2.8 - uTime * 2.7);
        transformed.y += (wave1 * 0.03 + wave2 * 0.015);
        `
      );
  };
  water.customProgramCacheKey = () => 'asklepios_pbr_water_v2';

  const waterfall = new THREE.MeshPhysicalMaterial({
    map: waterfallTex,
    color: 0x99e8fa,
    roughness: 0.14,
    metalness: 0.02,
    clearcoat: 0.85,
    emissive: 0x2f879e,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.88,
  });

  const waterFoam = new THREE.MeshStandardMaterial({
    color: 0xf7fdff,
    roughness: 0.42,
    metalness: 0.0,
    emissive: 0xcffafe,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.9,
  });

  const woodDark = new THREE.MeshStandardMaterial({
    map: woodDarkPair.map,
    bumpMap: woodDarkPair.bumpMap,
    bumpScale: 0.032,
    roughness: 0.74,
    metalness: 0.02,
  });

  const woodWarm = new THREE.MeshStandardMaterial({
    map: woodWarmPair.map,
    bumpMap: woodWarmPair.bumpMap,
    bumpScale: 0.032,
    roughness: 0.68,
    metalness: 0.02,
  });

  const woodPlank = new THREE.MeshStandardMaterial({
    map: woodPlankPair.map,
    bumpMap: woodPlankPair.bumpMap,
    bumpScale: 0.028,
    roughness: 0.76,
    metalness: 0.0,
  });

  const plasterIvory = new THREE.MeshStandardMaterial({
    map: plasterIvoryPair.map,
    bumpMap: plasterIvoryPair.bumpMap,
    bumpScale: 0.018,
    roughness: 0.72,
    metalness: 0.0,
  });

  const plasterSage = new THREE.MeshStandardMaterial({
    map: plasterSagePair.map,
    bumpMap: plasterSagePair.bumpMap,
    bumpScale: 0.018,
    roughness: 0.74,
    metalness: 0.0,
  });

  const roofTeal = new THREE.MeshStandardMaterial({
    map: roofTealPair.map,
    bumpMap: roofTealPair.bumpMap,
    bumpScale: 0.045,
    roughness: 0.56,
    metalness: 0.04,
  });

  const roofTerracotta = new THREE.MeshStandardMaterial({
    map: roofTerraPair.map,
    bumpMap: roofTerraPair.bumpMap,
    bumpScale: 0.045,
    roughness: 0.58,
    metalness: 0.02,
  });

  const roofCoral = new THREE.MeshStandardMaterial({
    map: roofCoralPair.map,
    bumpMap: roofCoralPair.bumpMap,
    bumpScale: 0.045,
    roughness: 0.6,
    metalness: 0.02,
  });

  const roofCream = new THREE.MeshStandardMaterial({
    map: roofCreamPair.map,
    bumpMap: roofCreamPair.bumpMap,
    bumpScale: 0.04,
    roughness: 0.64,
    metalness: 0.0,
  });

  const roofMosaic = new THREE.MeshStandardMaterial({
    map: roofMosaicPair.map,
    bumpMap: roofMosaicPair.bumpMap,
    bumpScale: 0.048,
    roughness: 0.52,
    metalness: 0.04,
  });

  const mailboxRed = new THREE.MeshPhysicalMaterial({
    color: 0xd9382e,
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.8,
    clearcoatRoughness: 0.16,
  });

  const sailCloth = new THREE.MeshStandardMaterial({
    color: 0xf7f1e3,
    roughness: 0.84,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const glassWindow = new THREE.MeshPhysicalMaterial({
    color: 0x9bd0e8,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.4,
    emissive: 0x1d4e68,
    emissiveIntensity: 0.15,
  });

  const glassWindowLit = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.22,
    metalness: 0.05,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.95,
  });

  const glassConservatory = new THREE.MeshPhysicalMaterial({
    color: 0xbfe9f6,
    roughness: 0.08,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.35,
    transparent: true,
    opacity: isConstrainedGpu ? 0.42 : 0.5,
    depthWrite: false,
  });

  const brass = new THREE.MeshStandardMaterial({
    color: 0xd99b38,
    roughness: 0.22,
    metalness: 0.9,
    envMapIntensity: 1.35,
  });

  const crossEmerald = new THREE.MeshStandardMaterial({
    color: 0x2ea078,
    roughness: 0.35,
    metalness: 0.08,
    emissive: 0x1f6e52,
    emissiveIntensity: 0.28,
  });

  const foliageGreen = new THREE.MeshPhysicalMaterial({
    map: foliageGreenTex,
    roughness: 0.74,
    metalness: 0.0,
    sheen: 0.4,
    sheenRoughness: 0.68,
    sheenColor: new THREE.Color(0xb2e89d),
  });

  const foliageSage = new THREE.MeshPhysicalMaterial({
    map: foliageSageTex,
    roughness: 0.74,
    metalness: 0.0,
    sheen: 0.4,
    sheenRoughness: 0.68,
    sheenColor: new THREE.Color(0xc5f0a8),
  });

  const foliageLime = new THREE.MeshPhysicalMaterial({
    map: foliageLimeTex,
    roughness: 0.7,
    metalness: 0.0,
    sheen: 0.45,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(0xe1f99a),
  });

  const blossomPink = new THREE.MeshPhysicalMaterial({
    map: blossomPinkTex,
    roughness: 0.72,
    metalness: 0.0,
    sheen: 0.45,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(0xffe4ea),
  });

  const blossomCream = new THREE.MeshPhysicalMaterial({
    map: blossomCreamTex,
    roughness: 0.72,
    metalness: 0.0,
    sheen: 0.45,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(0xfff9ec),
  });

  const allMats: THREE.Material[] = [
    grassTop,
    grassAccent,
    grassChartreuse,
    soil,
    stoneCliff,
    stoneLight,
    cobbleRoad,
    water,
    waterfall,
    waterFoam,
    woodDark,
    woodWarm,
    woodPlank,
    plasterIvory,
    plasterSage,
    roofTeal,
    roofTerracotta,
    roofCoral,
    roofCream,
    roofMosaic,
    mailboxRed,
    sailCloth,
    glassWindow,
    glassWindowLit,
    glassConservatory,
    brass,
    crossEmerald,
    foliageGreen,
    foliageSage,
    foliageLime,
    blossomPink,
    blossomCream,
  ];

  return {
    grassTop,
    grassAccent,
    grassChartreuse,
    soil,
    stoneCliff,
    stoneLight,
    cobbleRoad,
    water,
    waterfall,
    waterFoam,
    waterUniforms,
    woodDark,
    woodWarm,
    woodPlank,
    plasterIvory,
    plasterSage,
    roofTeal,
    roofTerracotta,
    roofCoral,
    roofCream,
    roofMosaic,
    mailboxRed,
    sailCloth,
    glassWindow,
    glassWindowLit,
    glassConservatory,
    brass,
    crossEmerald,
    foliageGreen,
    foliageSage,
    foliageLime,
    blossomPink,
    blossomCream,
    disposeAll: () => {
      textures.forEach((t) => t.dispose());
      allMats.forEach((m) => m.dispose());
    },
  };
}
