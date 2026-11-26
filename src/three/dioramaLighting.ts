import * as THREE from 'three';
import { WeatherType } from '../types/pharmacy';

export type TimePhaseName = 'Pagi Cerah' | 'Siang Hangat' | 'Senja Keemasan' | 'Malam Tenang';

interface LightKeyframe {
  phase: number;
  sky: number;
  fog: number;
  fogDensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPos: [number, number, number];
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  fillColor: number;
  fillIntensity: number;
  nightGlow: number;
}

const KEYFRAMES: LightKeyframe[] = [
  {
    phase: 0.0, // Pagi Cerah
    sky: 0xdceee6,
    fog: 0xdceee6,
    fogDensity: 0.009,
    sunColor: 0xffe4c4,
    sunIntensity: 1.28,
    sunPos: [21, 13, 10],
    hemiSky: 0xd8f0fa,
    hemiGround: 0x9c7b5c,
    hemiIntensity: 0.72,
    fillColor: 0xc4e3ed,
    fillIntensity: 0.42,
    nightGlow: 0.0,
  },
  {
    phase: 0.25, // Siang Hangat
    sky: 0xdbece2,
    fog: 0xdbece2,
    fogDensity: 0.008,
    sunColor: 0xfff4d6,
    sunIntensity: 1.5,
    sunPos: [10, 26, 14],
    hemiSky: 0xcbe8f6,
    hemiGround: 0x8d6e53,
    hemiIntensity: 0.78,
    fillColor: 0xbbe0e8,
    fillIntensity: 0.38,
    nightGlow: 0.0,
  },
  {
    phase: 0.55, // Senja Keemasan
    sky: 0xe6b48e,
    fog: 0xe2ae88,
    fogDensity: 0.0115,
    sunColor: 0xff9b59,
    sunIntensity: 1.2,
    sunPos: [-20, 9.5, 16],
    hemiSky: 0xf7b799,
    hemiGround: 0x6d4e42,
    hemiIntensity: 0.64,
    fillColor: 0x9ab8d9,
    fillIntensity: 0.45,
    nightGlow: 0.55,
  },
  {
    phase: 0.8, // Malam Tenang
    sky: 0x162d2a,
    fog: 0x162d2a,
    fogDensity: 0.016,
    sunColor: 0x8cbcf7,
    sunIntensity: 0.54,
    sunPos: [-8, 22, -10],
    hemiSky: 0x3b5d7a,
    hemiGround: 0x1f332c,
    hemiIntensity: 0.46,
    fillColor: 0x335b66,
    fillIntensity: 0.28,
    nightGlow: 1.0,
  },
];

export function getTimePhaseLabel(phase: number): TimePhaseName {
  const p = ((phase % 1) + 1) % 1;
  if (p < 0.2) return 'Pagi Cerah';
  if (p < 0.46) return 'Siang Hangat';
  if (p < 0.72) return 'Senja Keemasan';
  return 'Malam Tenang';
}

export interface DayNightLightingRig {
  update: (
    phase: number,
    weather: WeatherType,
    scene: THREE.Scene,
    sunLight: THREE.DirectionalLight,
    hemiLight: THREE.HemisphereLight,
    fillLight: THREE.DirectionalLight,
    windowMeshes: THREE.Mesh[],
    litWindowMat: THREE.MeshStandardMaterial,
    unlitWindowMat: THREE.MeshStandardMaterial,
    lanternLights: THREE.PointLight[],
    lanternBulbs: THREE.Mesh[]
  ) => void;
}

export function createDayNightLightingRig(): DayNightLightingRig {
  const _cA = new THREE.Color();
  const _cB = new THREE.Color();
  const _sky = new THREE.Color();
  const _fog = new THREE.Color();
  const _rainTint = new THREE.Color(0xb8cdd0);
  const _windTint = new THREE.Color(0xe6dfc8);
  const _winDayColor = new THREE.Color(0x9bd0e8);
  const _winNightColor = new THREE.Color(0xfde68a);

  return {
    update: (
      phase,
      weather,
      scene,
      sunLight,
      hemiLight,
      fillLight,
      windowMeshes,
      litWindowMat,
      unlitWindowMat,
      lanternLights,
      lanternBulbs
    ) => {
      const p = ((phase % 1) + 1) % 1;

      // Find surrounding keyframes (wrapping cleanly from last back to first)
      let k0 = KEYFRAMES[KEYFRAMES.length - 1];
      let k1 = KEYFRAMES[0];
      let localT = 0;

      for (let i = 0; i < KEYFRAMES.length; i++) {
        const cur = KEYFRAMES[i];
        const next = KEYFRAMES[(i + 1) % KEYFRAMES.length];
        const startP = cur.phase;
        const endP = i === KEYFRAMES.length - 1 ? 1.0 : next.phase;
        if (p >= startP && p <= endP) {
          k0 = cur;
          k1 = next;
          localT = (p - startP) / Math.max(0.0001, endP - startP);
          break;
        }
      }

      // Smoothstep easing for organic dawn/dusk transitions
      const t = localT * localT * (3 - 2 * localT);

      // Sky & Fog interpolation
      _cA.setHex(k0.sky);
      _cB.setHex(k1.sky);
      _sky.copy(_cA).lerp(_cB, t);

      _cA.setHex(k0.fog);
      _cB.setHex(k1.fog);
      _fog.copy(_cA).lerp(_cB, t);

      let fogDensity = THREE.MathUtils.lerp(k0.fogDensity, k1.fogDensity, t);
      let sunIntensity = THREE.MathUtils.lerp(k0.sunIntensity, k1.sunIntensity, t);

      // Apply Weather atmosphere modulation
      if (weather === WeatherType.HUJAN_LEMBAP) {
        _sky.lerp(_rainTint, 0.45);
        _fog.lerp(_rainTint, 0.45);
        fogDensity += 0.004;
        sunIntensity *= 0.65;
      } else if (weather === WeatherType.ANGIN_PANCAROBA) {
        _sky.lerp(_windTint, 0.16);
        _fog.lerp(_windTint, 0.16);
        fogDensity += 0.0015;
      } else if (weather === WeatherType.KABUT_MALAM) {
        fogDensity += 0.002;
      }

      (scene.background as THREE.Color).copy(_sky);
      const sceneFog = scene.fog as THREE.FogExp2;
      sceneFog.color.copy(_fog);
      sceneFog.density = fogDensity;

      // Sun position & color
      sunLight.position.set(
        THREE.MathUtils.lerp(k0.sunPos[0], k1.sunPos[0], t),
        THREE.MathUtils.lerp(k0.sunPos[1], k1.sunPos[1], t),
        THREE.MathUtils.lerp(k0.sunPos[2], k1.sunPos[2], t)
      );
      _cA.setHex(k0.sunColor);
      _cB.setHex(k1.sunColor);
      sunLight.color.copy(_cA).lerp(_cB, t);
      sunLight.intensity = sunIntensity;

      // Hemisphere sky/ground colors
      _cA.setHex(k0.hemiSky);
      _cB.setHex(k1.hemiSky);
      hemiLight.color.copy(_cA).lerp(_cB, t);

      _cA.setHex(k0.hemiGround);
      _cB.setHex(k1.hemiGround);
      hemiLight.groundColor.copy(_cA).lerp(_cB, t);
      hemiLight.intensity = THREE.MathUtils.lerp(k0.hemiIntensity, k1.hemiIntensity, t);

      // Fill light
      _cA.setHex(k0.fillColor);
      _cB.setHex(k1.fillColor);
      fillLight.color.copy(_cA).lerp(_cB, t);
      fillLight.intensity = THREE.MathUtils.lerp(k0.fillIntensity, k1.fillIntensity, t);

      // Gradual warm window & lantern glow across Dusk -> Night
      const nightGlow = THREE.MathUtils.lerp(k0.nightGlow, k1.nightGlow, t);

      // Realistic IBL reflection intensity: crisp in daylight, moody at night
      scene.environmentIntensity =
        weather === WeatherType.HUJAN_LEMBAP
          ? THREE.MathUtils.lerp(0.68, 0.28, nightGlow)
          : THREE.MathUtils.lerp(0.9, 0.25, nightGlow);

      if (nightGlow > 0.08) {
        litWindowMat.color.copy(_winDayColor).lerp(_winNightColor, nightGlow);
        litWindowMat.emissiveIntensity = THREE.MathUtils.lerp(0.15, 1.05, nightGlow);
        windowMeshes.forEach((wm) => {
          if (wm.material !== litWindowMat) wm.material = litWindowMat;
        });
      } else {
        windowMeshes.forEach((wm) => {
          if (wm.material !== unlitWindowMat) wm.material = unlitWindowMat;
        });
      }

      lanternLights.forEach((pl) => {
        pl.intensity = nightGlow * 3.0;
      });
      lanternBulbs.forEach((b) => {
        const m = b.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = 0.35 + nightGlow * 1.55;
      });
    },
  };
}
