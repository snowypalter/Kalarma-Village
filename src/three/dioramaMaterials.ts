import * as THREE from 'three';

export interface WaterRippleUniforms {
  uTime: { value: number };
}

export interface DioramaMaterialSet {
  grassTop: THREE.MeshStandardMaterial;
  grassAccent: THREE.MeshStandardMaterial;
  grassChartreuse: THREE.MeshStandardMaterial;
  soil: THREE.MeshStandardMaterial;
  riverSand: THREE.MeshStandardMaterial;
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
  mailboxRed: THREE.MeshStandardMaterial;
  sailCloth: THREE.MeshStandardMaterial;
  glassWindow: THREE.MeshStandardMaterial;
  glassWindowLit: THREE.MeshStandardMaterial;
  glassConservatory: THREE.MeshPhysicalMaterial;
  brass: THREE.MeshStandardMaterial;
  crossEmerald: THREE.MeshStandardMaterial;
  foliageGreen: THREE.MeshStandardMaterial;
  foliageSage: THREE.MeshStandardMaterial;
  foliageLime: THREE.MeshStandardMaterial;
  foliageDeep: THREE.MeshStandardMaterial;
  blossomPink: THREE.MeshStandardMaterial;
  blossomCream: THREE.MeshStandardMaterial;
  roofSlate: THREE.MeshStandardMaterial;
  fruitAccent: THREE.MeshStandardMaterial;
  citrusAccent: THREE.MeshStandardMaterial;
  mushroomCapRed: THREE.MeshStandardMaterial;
  mushroomCapCream: THREE.MeshStandardMaterial;
  herbPurple: THREE.MeshStandardMaterial;
  herbGold: THREE.MeshStandardMaterial;
  fishAccent: THREE.MeshStandardMaterial;
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
  registry: THREE.Texture[],
  size = 256
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const stones = ['#DDD0B6', '#CEC0A4', '#D6C8AE', '#C4B597', '#E5DAC2'];

  const map = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(1042);
      ctx.fillStyle = '#8F846E';
      ctx.fillRect(0, 0, w, h);

      const step = size / 8;
      for (let y = 6; y < h; y += step) {
        const rowOffset = (Math.floor(y / step) % 2) * (step / 2);
        for (let x = -step * 0.4; x < w + step * 0.5; x += step) {
          const sx = x + rowOffset + (rand() - 0.5) * 2.5;
          const sy = y + (rand() - 0.5) * 2.5;
          const sw = step * 0.76 + (rand() - 0.5) * 2;
          const sh = step * 0.72 + (rand() - 0.5) * 2;
          ctx.fillStyle = stones[Math.floor(rand() * stones.length)];
          ctx.beginPath();
          ctx.roundRect(sx, sy, sw, sh, Math.max(4, step * 0.28));
          ctx.fill();

          ctx.strokeStyle = 'rgba(255,249,235,0.42)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }
      // Subtle mossy flecks between cobbles
      for (let i = 0; i < 48; i++) {
        ctx.fillStyle = `rgba(88, 158, 66, ${0.18 + rand() * 0.16})`;
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, 1.4 + rand() * 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    size,
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
      const step = size / 8;
      for (let y = 6; y < h; y += step) {
        const rowOffset = (Math.floor(y / step) % 2) * (step / 2);
        for (let x = -step * 0.4; x < w + step * 0.5; x += step) {
          const sx = x + rowOffset + (rand() - 0.5) * 2.5;
          const sy = y + (rand() - 0.5) * 2.5;
          const sw = step * 0.76 + (rand() - 0.5) * 2;
          const sh = step * 0.72 + (rand() - 0.5) * 2;
          const lum = 185 + Math.floor(rand() * 55);
          ctx.fillStyle = `rgb(${lum},${lum},${lum})`;
          ctx.beginPath();
          ctx.roundRect(sx, sy, sw, sh, Math.max(4, step * 0.28));
          ctx.fill();
        }
      }
    },
    size,
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
      // Warm sunlit meadow dappled patches
      for (let i = 0; i < 56; i++) {
        ctx.fillStyle = rand() > 0.45 ? bladeHex1 : bladeHex2;
        ctx.globalAlpha = 0.28 + rand() * 0.22;
        ctx.beginPath();
        ctx.ellipse(rand() * w, rand() * h, 10 + rand() * 20, 8 + rand() * 15, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 460; i++) {
        const gx = rand() * w;
        const gy = rand() * h;
        ctx.fillStyle = rand() > 0.45 ? bladeHex1 : bladeHex2;
        ctx.globalAlpha = 0.3 + rand() * 0.35;
        ctx.fillRect(gx, gy, 2 + rand() * 2, 4 + rand() * 5);
      }
      // Micro clover & warm buttercup dots
      for (let i = 0; i < 46; i++) {
        ctx.fillStyle = rand() > 0.35 ? '#9FE265' : '#FFF4B8';
        ctx.globalAlpha = 0.48;
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, 1.4 + rand() * 1.6, 0, Math.PI * 2);
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
      for (let i = 0; i < 440; i++) {
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
        ctx.fillStyle = 'rgba(20, 12, 6, 0.22)';
        ctx.fillRect(0, y, w, 2);
        ctx.fillStyle = highlightHex;
        ctx.globalAlpha = 0.16;
        ctx.fillRect(0, y + 2, w, 2);
        ctx.globalAlpha = 1;
      }
      for (let i = 0; i < 160; i++) {
        const y = rand() * h;
        ctx.strokeStyle = rand() > 0.3 ? grainHex : highlightHex;
        ctx.globalAlpha = 0.2 + rand() * 0.22;
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
          ctx.globalAlpha = 0.92;
          ctx.beginPath();
          ctx.arc(x + offset + tileW / 2, y + 6, tileW * 0.5, 0, Math.PI);
          ctx.fill();

          ctx.globalAlpha = 0.28;
          ctx.strokeStyle = '#FFF9E8';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(x + offset + tileW / 2, y + 5, tileW * 0.44, 0.25, Math.PI - 0.25);
          ctx.stroke();

          ctx.globalAlpha = 0.45;
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
        ctx.fillStyle = rand() > 0.5 ? 'rgba(255,252,240,0.22)' : 'rgba(130,108,82,0.08)';
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
          ctx.roundRect(x + off + 2, y + 2, 52, 28, 7);
          ctx.fill();
        }
      }
      for (let i = 0; i < 130; i++) {
        ctx.fillStyle = rand() > 0.68 ? 'rgba(92,162,74,0.26)' : 'rgba(255,250,235,0.12)';
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
          ctx.roundRect(x + off + 2, y + 2, 52, 28, 7);
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
      for (let i = 0; i < 240; i++) {
        ctx.fillStyle = rand() > 0.45 ? lightHex : darkHex;
        ctx.globalAlpha = 0.3 + rand() * 0.35;
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
      grad.addColorStop(0, '#44B5D4');
      grad.addColorStop(0.5, '#6FD5EE');
      grad.addColorStop(1, '#44B5D4');
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

function createSpottedMushroomTexture(
  baseHex: string,
  spotHex: string,
  anisotropy: number,
  registry: THREE.Texture[]
): THREE.CanvasTexture {
  return makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(8421);
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = spotHex;
      for (let i = 0; i < 24; i++) {
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * (h * 0.72), 4 + rand() * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    128,
    1,
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

  const texRes = isConstrainedGpu ? 128 : 256;
  const cobblePair = createCobblePair(anisotropy, textures, texRes);

  // Rich, living Cozy Fantasy Meadow Greens (warm sunlit chartreuse + saturated emerald/forest moss)
  const grassMainPair = createGrassPair('#62B34C', '#7FD054', '#488D3E', anisotropy, textures);
  const grassAccPair = createGrassPair('#529F44', '#6EC04E', '#3C7F36', anisotropy, textures);
  const grassChartPair = createGrassPair('#86CA4D', '#A4DE60', '#63A83E', anisotropy, textures);

  const woodDarkPair = createWoodPair('#664026', '#482B17', '#805336', anisotropy, textures);
  const woodWarmPair = createWoodPair('#BD7A40', '#925828', '#D7965B', anisotropy, textures);
  const woodPlankPair = createWoodPair('#D8C39E', '#B39B74', '#EADAB9', anisotropy, textures);
  const plasterIvoryPair = createPlasterPair('#F7EFE0', anisotropy, textures);
  const plasterSagePair = createPlasterPair('#DCE9D7', anisotropy, textures);

  const stoneCliffPair = createStonePair('#6A746C', ['#848E84', '#747E75', '#919B8F', '#667168'], anisotropy, textures);
  const stoneLightPair = createStonePair('#968F7F', ['#B6AE9D', '#C5BCAE', '#A69F8F', '#D0C7B8'], anisotropy, textures);

  const roofTealPair = createRoofTilePair(['#2B7A69', '#226153', '#39927F'], '#18473D', anisotropy, textures);
  const roofTerraPair = createRoofTilePair(['#D6633F', '#BC4F2F', '#E47A56'], '#86341C', anisotropy, textures);
  const roofCoralPair = createRoofTilePair(['#DF7762', '#C25E4A', '#EA917E'], '#8E4132', anisotropy, textures);
  const roofCreamPair = createRoofTilePair(['#EEDB8F', '#DEC676', '#F7E9AF'], '#A88E4A', anisotropy, textures);
  const roofSlatePair = createRoofTilePair(['#4F7E9B', '#3E6882', '#6495B3'], '#2D4D61', anisotropy, textures);
  const roofMosaicPair = createRoofTilePair(
    ['#E07B5F', '#ECD09A', '#81ABC0', '#CF5F47', '#B5C597'],
    '#7D503F',
    anisotropy,
    textures
  );

  const soilTex = makeCanvasTexture(
    (ctx, w, h) => {
      const rand = seededNoise(8812);
      ctx.fillStyle = '#8C5F3B';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 18) {
        ctx.fillStyle = rand() > 0.5 ? 'rgba(55, 34, 18, 0.16)' : 'rgba(176, 128, 82, 0.18)';
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

  const foliageGreenTex = createFoliageTexture('#3F9B4E', '#5CBF5F', '#29763B', anisotropy, textures);
  const foliageSageTex = createFoliageTexture('#58AD55', '#78CA68', '#3E8A42', anisotropy, textures);
  const foliageLimeTex = createFoliageTexture('#82C949', '#A3DF5E', '#60A534', anisotropy, textures);
  const foliageDeepTex = createFoliageTexture('#2B7B45', '#429B59', '#1E5B33', anisotropy, textures);
  const blossomPinkTex = createFoliageTexture('#F19AB0', '#FABDD0', '#D8748D', anisotropy, textures);
  const blossomCreamTex = createFoliageTexture('#F7DFB3', '#FFF2D6', '#DFBE8C', anisotropy, textures);
  const waterfallTex = createWaterfallTexture(anisotropy, textures);
  const mushroomRedTex = createSpottedMushroomTexture('#D94B38', '#FFF6E6', anisotropy, textures);

  // Matte Terrain & Architecture Materials (zero glossy plastic sheen)
  const grassTop = new THREE.MeshStandardMaterial({
    map: grassMainPair.map,
    bumpMap: grassMainPair.bumpMap,
    bumpScale: 0.032,
    roughness: 0.9,
    metalness: 0.0,
  });

  const grassAccent = new THREE.MeshStandardMaterial({
    map: grassAccPair.map,
    bumpMap: grassAccPair.bumpMap,
    bumpScale: 0.03,
    roughness: 0.9,
    metalness: 0.0,
  });

  const grassChartreuse = new THREE.MeshStandardMaterial({
    map: grassChartPair.map,
    bumpMap: grassChartPair.bumpMap,
    bumpScale: 0.028,
    roughness: 0.88,
    metalness: 0.0,
  });

  const soil = new THREE.MeshStandardMaterial({
    map: soilTex,
    roughness: 0.94,
    metalness: 0.0,
  });

  const riverSand = new THREE.MeshStandardMaterial({
    color: 0xd8c398,
    roughness: 0.92,
    metalness: 0.0,
  });

  const stoneCliff = new THREE.MeshStandardMaterial({
    map: stoneCliffPair.map,
    bumpMap: stoneCliffPair.bumpMap,
    bumpScale: 0.052,
    roughness: 0.88,
    metalness: 0.02,
  });

  const stoneLight = new THREE.MeshStandardMaterial({
    map: stoneLightPair.map,
    bumpMap: stoneLightPair.bumpMap,
    bumpScale: 0.045,
    roughness: 0.86,
    metalness: 0.02,
  });

  const cobbleRoad = new THREE.MeshStandardMaterial({
    map: cobblePair.map,
    bumpMap: cobblePair.bumpMap,
    bumpScale: 0.05,
    roughness: 0.88,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const waterUniforms: WaterRippleUniforms = {
    uTime: { value: 0 },
  };
  const water = new THREE.MeshPhysicalMaterial({
    color: 0x3db5d3,
    roughness: 0.12,
    metalness: 0.04,
    clearcoat: 0.95,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
    envMapIntensity: 1.35,
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
        transformed.y += (wave1 * 0.028 + wave2 * 0.014);
        `
      );
  };
  water.customProgramCacheKey = () => 'asklepios_pbr_water_v3';

  const waterfall = new THREE.MeshPhysicalMaterial({
    map: waterfallTex,
    color: 0x8be2f7,
    roughness: 0.18,
    metalness: 0.02,
    clearcoat: 0.75,
    emissive: 0x26798f,
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.88,
  });

  const waterFoam = new THREE.MeshStandardMaterial({
    color: 0xf7fdff,
    roughness: 0.65,
    metalness: 0.0,
    emissive: 0xcffafe,
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.88,
  });

  const woodDark = new THREE.MeshStandardMaterial({
    map: woodDarkPair.map,
    bumpMap: woodDarkPair.bumpMap,
    bumpScale: 0.032,
    roughness: 0.86,
    metalness: 0.01,
  });

  const woodWarm = new THREE.MeshStandardMaterial({
    map: woodWarmPair.map,
    bumpMap: woodWarmPair.bumpMap,
    bumpScale: 0.032,
    roughness: 0.84,
    metalness: 0.01,
  });

  const woodPlank = new THREE.MeshStandardMaterial({
    map: woodPlankPair.map,
    bumpMap: woodPlankPair.bumpMap,
    bumpScale: 0.028,
    roughness: 0.86,
    metalness: 0.0,
  });

  const plasterIvory = new THREE.MeshStandardMaterial({
    map: plasterIvoryPair.map,
    bumpMap: plasterIvoryPair.bumpMap,
    bumpScale: 0.02,
    roughness: 0.86,
    metalness: 0.0,
  });

  const plasterSage = new THREE.MeshStandardMaterial({
    map: plasterSagePair.map,
    bumpMap: plasterSagePair.bumpMap,
    bumpScale: 0.02,
    roughness: 0.86,
    metalness: 0.0,
  });

  const roofTeal = new THREE.MeshStandardMaterial({
    map: roofTealPair.map,
    bumpMap: roofTealPair.bumpMap,
    bumpScale: 0.045,
    roughness: 0.78,
    metalness: 0.02,
  });

  const roofTerracotta = new THREE.MeshStandardMaterial({
    map: roofTerraPair.map,
    bumpMap: roofTerraPair.bumpMap,
    bumpScale: 0.045,
    roughness: 0.78,
    metalness: 0.02,
  });

  const roofCoral = new THREE.MeshStandardMaterial({
    map: roofCoralPair.map,
    bumpMap: roofCoralPair.bumpMap,
    bumpScale: 0.045,
    roughness: 0.8,
    metalness: 0.02,
  });

  const roofCream = new THREE.MeshStandardMaterial({
    map: roofCreamPair.map,
    bumpMap: roofCreamPair.bumpMap,
    bumpScale: 0.04,
    roughness: 0.82,
    metalness: 0.0,
  });

  const roofMosaic = new THREE.MeshStandardMaterial({
    map: roofMosaicPair.map,
    bumpMap: roofMosaicPair.bumpMap,
    bumpScale: 0.048,
    roughness: 0.76,
    metalness: 0.02,
  });

  const mailboxRed = new THREE.MeshStandardMaterial({
    color: 0xd9382e,
    roughness: 0.62,
    metalness: 0.04,
  });

  const sailCloth = new THREE.MeshStandardMaterial({
    color: 0xf7efe0,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const glassWindow = new THREE.MeshPhysicalMaterial({
    color: 0x8cc6e0,
    roughness: 0.14,
    metalness: 0.08,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.25,
    emissive: 0x1d4e68,
    emissiveIntensity: 0.14,
  });

  const glassWindowLit = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.28,
    metalness: 0.04,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.95,
  });

  const glassConservatory = new THREE.MeshPhysicalMaterial({
    color: 0xbfe9f6,
    roughness: 0.1,
    metalness: 0.04,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.3,
    transparent: true,
    opacity: isConstrainedGpu ? 0.42 : 0.48,
    depthWrite: false,
  });

  const brass = new THREE.MeshStandardMaterial({
    color: 0xd99b38,
    roughness: 0.28,
    metalness: 0.86,
    envMapIntensity: 1.25,
  });

  const crossEmerald = new THREE.MeshStandardMaterial({
    color: 0x26926b,
    roughness: 0.65,
    metalness: 0.04,
    emissive: 0x185c42,
    emissiveIntensity: 0.2,
  });

  // Rich Matte Foliage Materials (no glossy plastic highlight)
  const foliageGreen = new THREE.MeshStandardMaterial({
    map: foliageGreenTex,
    roughness: 0.88,
    metalness: 0.0,
  });

  const foliageSage = new THREE.MeshStandardMaterial({
    map: foliageSageTex,
    roughness: 0.88,
    metalness: 0.0,
  });

  const foliageLime = new THREE.MeshStandardMaterial({
    map: foliageLimeTex,
    roughness: 0.86,
    metalness: 0.0,
  });

  const foliageDeep = new THREE.MeshStandardMaterial({
    map: foliageDeepTex,
    roughness: 0.9,
    metalness: 0.0,
  });

  const blossomPink = new THREE.MeshStandardMaterial({
    map: blossomPinkTex,
    roughness: 0.85,
    metalness: 0.0,
  });

  const blossomCream = new THREE.MeshStandardMaterial({
    map: blossomCreamTex,
    roughness: 0.85,
    metalness: 0.0,
  });

  const roofSlate = new THREE.MeshStandardMaterial({
    map: roofSlatePair.map,
    bumpMap: roofSlatePair.bumpMap,
    bumpScale: 0.044,
    roughness: 0.78,
    metalness: 0.02,
  });

  const fruitAccent = new THREE.MeshStandardMaterial({
    color: 0xe34b36,
    roughness: 0.62,
    metalness: 0.02,
  });

  const citrusAccent = new THREE.MeshStandardMaterial({
    color: 0xf49d2a,
    roughness: 0.62,
    metalness: 0.02,
  });

  const mushroomCapRed = new THREE.MeshStandardMaterial({
    map: mushroomRedTex,
    roughness: 0.74,
    metalness: 0.0,
  });

  const mushroomCapCream = new THREE.MeshStandardMaterial({
    color: 0xe9c891,
    roughness: 0.78,
    metalness: 0.0,
  });

  const herbPurple = new THREE.MeshStandardMaterial({
    color: 0x9b6ed1,
    roughness: 0.82,
    metalness: 0.0,
  });

  const herbGold = new THREE.MeshStandardMaterial({
    color: 0xefc043,
    roughness: 0.8,
    metalness: 0.0,
  });

  const fishAccent = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.45,
    metalness: 0.04,
  });

  const allMats: THREE.Material[] = [
    grassTop,
    grassAccent,
    grassChartreuse,
    soil,
    riverSand,
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
    roofSlate,
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
    foliageDeep,
    blossomPink,
    blossomCream,
    fruitAccent,
    citrusAccent,
    mushroomCapRed,
    mushroomCapCream,
    herbPurple,
    herbGold,
    fishAccent,
  ];

  return {
    grassTop,
    grassAccent,
    grassChartreuse,
    soil,
    riverSand,
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
    roofSlate,
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
    foliageDeep,
    blossomPink,
    blossomCream,
    fruitAccent,
    citrusAccent,
    mushroomCapRed,
    mushroomCapCream,
    herbPurple,
    herbGold,
    fishAccent,
    disposeAll: () => {
      textures.forEach((t) => t.dispose());
      allMats.forEach((m) => m.dispose());
    },
  };
}
