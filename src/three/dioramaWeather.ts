import * as THREE from 'three';
import { WeatherType } from '../types/pharmacy';

export interface WeatherParticleSystem {
  group: THREE.Group;
  update: (weather: WeatherType, dt: number, elapsed: number) => void;
  dispose: () => void;
}

function createSoftGlowTexture(innerRgba: string, outerRgba: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, innerRgba);
    grad.addColorStop(0.45, innerRgba);
    grad.addColorStop(1, outerRgba);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMistTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(220, 242, 236, 0.42)');
    grad.addColorStop(0.5, 'rgba(205, 232, 226, 0.18)');
    grad.addColorStop(1, 'rgba(205, 232, 226, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWeatherParticleSystem(isSoftwareGl: boolean): WeatherParticleSystem {
  const group = new THREE.Group();

  const glowTex = createSoftGlowTexture('rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)');
  const mistTex = createMistTexture();

  // Pre-allocated dummy for zero-GC matrix updates
  const _dummy = new THREE.Object3D();
  const _color = new THREE.Color();

  // -------------------------------------------------------------------------
  // 1. FALLING LEAVES & BLOSSOM PETALS (Cerah Hangat & Angin Pancaroba)
  // -------------------------------------------------------------------------
  const leafCount = isSoftwareGl ? 55 : 95;
  const leafGeo = new THREE.PlaneGeometry(0.32, 0.18, 2, 1);
  // Slight gentle curl along X so each leaf catches sunlight naturally
  const lPos = leafGeo.attributes.position;
  for (let i = 0; i < lPos.count; i++) {
    const x = lPos.getX(i);
    lPos.setZ(i, Math.abs(x) * 0.18);
  }
  leafGeo.computeVertexNormals();

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
  leafMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const leafData = Array.from({ length: leafCount }, (_, i) => ({
    x: (Math.random() - 0.5) * 34,
    y: Math.random() * 14 + 0.5,
    z: (Math.random() - 0.5) * 34,
    rx: Math.random() * Math.PI * 2,
    ry: Math.random() * Math.PI * 2,
    rz: Math.random() * Math.PI * 2,
    speedY: 0.8 + Math.random() * 0.7,
    phase: i * 0.73 + Math.random() * 4,
    scale: 0.7 + Math.random() * 0.65,
  }));
  group.add(leafMesh);

  let lastLeafTheme: 'blossom' | 'wind' | null = null;
  const blossomPalette = [0xf4b6c2, 0xf8d1da, 0xfaf0ca, 0x84c99b];
  const windPalette = [0xfbbf24, 0xd97706, 0x7cb882, 0xfde68a];

  const applyLeafPalette = (theme: 'blossom' | 'wind') => {
    if (lastLeafTheme === theme) return;
    lastLeafTheme = theme;
    const pal = theme === 'blossom' ? blossomPalette : windPalette;
    for (let i = 0; i < leafCount; i++) {
      _color.setHex(pal[i % pal.length]);
      leafMesh.setColorAt(i, _color);
    }
    if (leafMesh.instanceColor) leafMesh.instanceColor.needsUpdate = true;
  };
  applyLeafPalette('blossom');

  // -------------------------------------------------------------------------
  // 2. RAIN DROPLET STREAKS & GROUND SPLASH RIPPLES (Hujan Lembap)
  // -------------------------------------------------------------------------
  const rainCount = isSoftwareGl ? 150 : 260;
  const rainPositions = new Float32Array(rainCount * 2 * 3);
  const rainSeeds = Array.from({ length: rainCount }, () => ({
    x: (Math.random() - 0.5) * 35,
    y: Math.random() * 16 + 0.5,
    z: (Math.random() - 0.5) * 35,
    speed: 14 + Math.random() * 6,
  }));
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rainMat = new THREE.LineBasicMaterial({
    color: 0xdbeafe,
    transparent: true,
    opacity: 0.72,
  });
  const rainLines = new THREE.LineSegments(rainGeo, rainMat);
  rainLines.visible = false;
  group.add(rainLines);

  const rippleCount = isSoftwareGl ? 14 : 24;
  const rippleGeo = new THREE.RingGeometry(0.14, 0.21, 16);
  rippleGeo.rotateX(-Math.PI / 2);
  const rippleMat = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rippleMesh = new THREE.InstancedMesh(rippleGeo, rippleMat, rippleCount);
  rippleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  rippleMesh.visible = false;

  const rippleData = Array.from({ length: rippleCount }, (_, i) => ({
    x: (Math.random() - 0.5) * 30,
    z: (Math.random() - 0.5) * 30,
    progress: (i / rippleCount) % 1,
    speed: 1.4 + Math.random() * 0.9,
  }));
  group.add(rippleMesh);

  // -------------------------------------------------------------------------
  // 3. FLOATING POLLEN / FIREFLIES (Points with Soft Glow Texture)
  // -------------------------------------------------------------------------
  const moteCount = isSoftwareGl ? 70 : 120;
  const motePositions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePositions[i * 3] = (Math.random() - 0.5) * 34;
    motePositions[i * 3 + 1] = Math.random() * 9 + 0.4;
    motePositions[i * 3 + 2] = (Math.random() - 0.5) * 34;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: 0xfef08a,
    map: glowTex,
    size: 0.36,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const motePoints = new THREE.Points(moteGeo, moteMat);
  group.add(motePoints);

  // -------------------------------------------------------------------------
  // 4. DRIFTING LOW-LYING FOG / MIST PUFFS (Kabut Malam & Light Rain Mist)
  // -------------------------------------------------------------------------
  const mistCount = isSoftwareGl ? 10 : 18;
  const mistSprites: { sprite: THREE.Sprite; baseZ: number; speedX: number; phase: number; baseScale: number }[] = [];
  const mistMat = new THREE.SpriteMaterial({
    map: mistTex,
    color: 0xd1fae5,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  for (let i = 0; i < mistCount; i++) {
    const sprite = new THREE.Sprite(mistMat);
    const baseScale = 5.2 + Math.random() * 4.5;
    sprite.position.set(
      (Math.random() - 0.5) * 32,
      0.85 + Math.random() * 1.4,
      (Math.random() - 0.5) * 30
    );
    sprite.scale.set(baseScale * 1.5, baseScale * 0.72, 1);
    group.add(sprite);
    mistSprites.push({
      sprite,
      baseZ: sprite.position.z,
      speedX: 0.35 + Math.random() * 0.4,
      phase: i * 1.1,
      baseScale,
    });
  }

  return {
    group,
    update: (weather: WeatherType, dt: number, elapsed: number) => {
      const isSunny = weather === WeatherType.CERAH_HANGAT;
      const isRain = weather === WeatherType.HUJAN_LEMBAP;
      const isWind = weather === WeatherType.ANGIN_PANCAROBA;
      const isNight = weather === WeatherType.KABUT_MALAM;

      // 1. Update Falling Leaves & Petals
      leafMesh.visible = isSunny || isWind;
      if (leafMesh.visible) {
        applyLeafPalette(isWind ? 'wind' : 'blossom');
        for (let i = 0; i < leafCount; i++) {
          const d = leafData[i];
          if (isWind) {
            d.x += (6.2 + Math.sin(elapsed * 1.7 + d.phase) * 1.6) * dt;
            d.y -= d.speedY * 1.35 * dt;
            d.z += Math.cos(elapsed * 2.1 + d.phase) * 1.9 * dt;
            d.rx += 3.8 * dt;
            d.ry += 4.2 * dt;
            d.rz += 2.6 * dt;
          } else {
            d.y -= d.speedY * 0.85 * dt;
            d.x += Math.sin(elapsed * 1.4 + d.phase) * 0.75 * dt;
            d.z += Math.cos(elapsed * 1.2 + d.phase) * 0.75 * dt;
            d.rx += 1.4 * dt;
            d.ry += 1.8 * dt;
            d.rz += 1.1 * dt;
          }

          if (d.y < 0.15) {
            d.y = 14 + Math.random() * 2;
            d.x = (Math.random() - 0.5) * 34;
            d.z = (Math.random() - 0.5) * 34;
          }
          if (d.x > 17.5) d.x = -17.5;
          if (d.x < -17.5) d.x = 17.5;
          if (d.z > 17.5) d.z = -17.5;
          if (d.z < -17.5) d.z = 17.5;

          _dummy.position.set(d.x, d.y, d.z);
          _dummy.rotation.set(d.rx, d.ry, d.rz);
          _dummy.scale.setScalar(d.scale);
          _dummy.updateMatrix();
          leafMesh.setMatrixAt(i, _dummy.matrix);
        }
        leafMesh.instanceMatrix.needsUpdate = true;
      }

      // 2. Update Rain Streaks & Ground Splash Ripples
      rainLines.visible = isRain;
      rippleMesh.visible = isRain;
      if (isRain) {
        const attr = rainGeo.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < rainCount; i++) {
          const r = rainSeeds[i];
          r.y -= r.speed * dt;
          r.x -= 2.4 * dt;
          if (r.y < 0.1) {
            r.y = 15 + Math.random() * 2;
            r.x = (Math.random() - 0.5) * 35;
            r.z = (Math.random() - 0.5) * 35;
          }
          if (r.x < -17.5) r.x = 17.5;

          const idx = i * 2;
          attr.setXYZ(idx, r.x, r.y, r.z);
          attr.setXYZ(idx + 1, r.x + 0.14, r.y + 0.92, r.z);
        }
        attr.needsUpdate = true;

        for (let i = 0; i < rippleCount; i++) {
          const rp = rippleData[i];
          rp.progress += rp.speed * dt;
          if (rp.progress >= 1) {
            rp.progress = 0;
            rp.x = (Math.random() - 0.5) * 30;
            rp.z = (Math.random() - 0.5) * 30;
          }
          const s = 0.25 + rp.progress * 1.9;
          _dummy.position.set(rp.x, 0.06, rp.z);
          _dummy.rotation.set(0, 0, 0);
          _dummy.scale.set(s, 1, s);
          _dummy.updateMatrix();
          rippleMesh.setMatrixAt(i, _dummy.matrix);
        }
        rippleMesh.instanceMatrix.needsUpdate = true;
      }

      // 3. Update Glowing Pollen / Fireflies
      motePoints.visible = !isRain;
      if (motePoints.visible) {
        if (isNight) {
          moteMat.color.setHex(0xa7f3d0);
          moteMat.size = 0.44;
          moteMat.opacity = 0.72 + Math.sin(elapsed * 3.5) * 0.2;
        } else if (isWind) {
          moteMat.color.setHex(0xfde047);
          moteMat.size = 0.34;
          moteMat.opacity = 0.85;
        } else {
          moteMat.color.setHex(0xfef9c3);
          moteMat.size = 0.28;
          moteMat.opacity = 0.55;
        }

        const mAttr = moteGeo.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < moteCount; i++) {
          let mx = mAttr.getX(i);
          let my = mAttr.getY(i);
          let mz = mAttr.getZ(i);

          if (isWind) {
            mx += 5.4 * dt;
            my += Math.sin(elapsed * 2.5 + i) * 0.5 * dt;
            mz += Math.cos(elapsed * 2.0 + i) * 1.2 * dt;
          } else if (isNight) {
            mx += Math.sin(elapsed * 0.9 + i) * 0.45 * dt;
            my += Math.cos(elapsed * 1.3 + i * 0.5) * 0.35 * dt;
            mz += Math.cos(elapsed * 0.8 + i) * 0.45 * dt;
          } else {
            mx += Math.sin(elapsed * 0.7 + i) * 0.3 * dt;
            my += Math.sin(elapsed * 1.1 + i) * 0.25 * dt;
          }

          if (mx > 17) mx = -17;
          if (mx < -17) mx = 17;
          if (mz > 17) mz = -17;
          if (mz < -17) mz = 17;
          if (my < 0.4) my = 0.4;
          if (my > 9.5) my = 9.5;

          mAttr.setXYZ(i, mx, my, mz);
        }
        mAttr.needsUpdate = true;
      }

      // 4. Update Drifting Fog / Mist Puffs (strong in Kabut Malam, light river mist in Rain)
      const showMist = isNight || isRain;
      if (showMist) {
        mistMat.color.setHex(isNight ? 0xccece2 : 0xdbeafe);
        mistMat.opacity = isNight ? 0.56 : 0.26;
      }
      for (let i = 0; i < mistSprites.length; i++) {
        const ms = mistSprites[i];
        ms.sprite.visible = showMist;
        if (!showMist) continue;

        ms.sprite.position.x += ms.speedX * (isRain ? 1.4 : 1.0) * dt;
        ms.sprite.position.z = ms.baseZ + Math.sin(elapsed * 0.45 + ms.phase) * 0.9;
        ms.sprite.position.y = 0.9 + Math.sin(elapsed * 0.6 + ms.phase) * 0.22;
        if (ms.sprite.position.x > 18) ms.sprite.position.x = -18;
      }
    },
    dispose: () => {
      leafGeo.dispose();
      leafMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      rippleGeo.dispose();
      rippleMat.dispose();
      moteGeo.dispose();
      moteMat.dispose();
      mistMat.dispose();
      glowTex.dispose();
      mistTex.dispose();
    },
  };
}
