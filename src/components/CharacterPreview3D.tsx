import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CharacterId, EmotionType } from '../types/pharmacy';
import { ChibiCharacterRig, buildChibiCharacter3D } from '../three/dioramaCharacters';
import { CharacterPortrait } from './CharacterPortrait';

export interface CharacterPreview3DProps {
  characterId: CharacterId;
  outfitId?: string | null;
  skinId?: string | null;
  accessoryId?: string | null;
  zoomScale?: number;
  onZoomChange?: (nextZoom: number) => void;
  autoRotate?: boolean;
  rotateStepTrigger?: { deltaRad: number; seq: number } | null;
  resetViewSeq?: number;
  className?: string;
}

function disposeObject3DResources(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      const mat = obj.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    }
  });
}

export const CharacterPreview3D: React.FC<CharacterPreview3DProps> = ({
  characterId,
  outfitId = 'classic_coat',
  skinId = null,
  accessoryId = null,
  zoomScale = 1,
  onZoomChange,
  autoRotate = false,
  rotateStepTrigger = null,
  resetViewSeq = 0,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  const propsRef = useRef({
    characterId,
    outfitId,
    skinId,
    accessoryId,
    zoomScale,
    autoRotate,
  });
  propsRef.current = {
    characterId,
    outfitId,
    skinId,
    accessoryId,
    zoomScale,
    autoRotate,
  };

  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;

  const orbitRef = useRef({
    yaw: 0.25,
    targetYaw: 0.25,
    pitch: 0.24,
    targetPitch: 0.24,
    zoom: zoomScale,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    orbitRef.current.zoom = THREE.MathUtils.clamp(zoomScale, 0.65, 1.75);
  }, [zoomScale]);

  useEffect(() => {
    if (!rotateStepTrigger || rotateStepTrigger.seq <= 0) return;
    orbitRef.current.targetYaw += rotateStepTrigger.deltaRad;
  }, [rotateStepTrigger]);

  useEffect(() => {
    if (resetViewSeq <= 0) return;
    orbitRef.current.targetYaw = 0.25;
    orbitRef.current.targetPitch = 0.24;
    orbitRef.current.zoom = 1;
    onZoomChangeRef.current?.(1);
  }, [resetViewSeq]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const canvasEl = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    canvasEl.addEventListener('webglcontextlost', handleContextLost);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initW = container.clientWidth || 320;
    const initH = container.clientHeight || 320;
    renderer.setSize(initW, initH);
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.display = 'block';
    canvasEl.style.touchAction = 'none';
    container.appendChild(canvasEl);

    const scene = new THREE.Scene();

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(35, initW / Math.max(1, initH), 0.1, 40);

    // 3-Point Warm Cozy Diorama Studio Lighting
    const hemi = new THREE.HemisphereLight(0xf6ebd8, 0x6e4b30, 0.92);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.38);
    keyLight.position.set(2.8, 4.4, 3.6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -1.8;
    keyLight.shadow.camera.right = 1.8;
    keyLight.shadow.camera.top = 2.0;
    keyLight.shadow.camera.bottom = -1.5;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xcbe8f6, 0.45);
    fillLight.position.set(-3.2, 2.2, 1.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffe4b3, 0.52);
    rimLight.position.set(-1.4, 3.0, -3.5);
    scene.add(rimLight);

    // Stylized Wooden + Emerald Turntable Pedestal
    const turntableGroup = new THREE.Group();
    const stoneBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.06, 0.14, 28),
      new THREE.MeshStandardMaterial({ color: 0xc2b59b, roughness: 0.88 })
    );
    stoneBase.position.y = -0.13;
    stoneBase.receiveShadow = true;

    const woodDeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.84, 0.88, 0.1, 28),
      new THREE.MeshStandardMaterial({ color: 0x8f5932, roughness: 0.72 })
    );
    woodDeck.position.y = -0.03;
    woodDeck.receiveShadow = true;

    const mossRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.84, 0.032, 8, 28),
      new THREE.MeshStandardMaterial({ color: 0x5f9e48, roughness: 0.84 })
    );
    mossRing.rotation.x = Math.PI / 2;
    mossRing.position.y = 0.02;

    const brassTrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.91, 0.018, 6, 28),
      new THREE.MeshStandardMaterial({ color: 0xd99b38, roughness: 0.35, metalness: 0.65 })
    );
    brassTrim.rotation.x = Math.PI / 2;
    brassTrim.position.y = -0.06;

    turntableGroup.add(stoneBase, woodDeck, mossRing, brassTrim);
    scene.add(turntableGroup);

    let activeCharId = propsRef.current.characterId;
    let activeOutfitId = propsRef.current.outfitId ?? null;
    let activeSkinId = propsRef.current.skinId ?? null;
    let activeAccessoryId = propsRef.current.accessoryId ?? null;

    let charRig: ChibiCharacterRig = buildChibiCharacter3D(
      activeCharId,
      null,
      activeOutfitId,
      activeSkinId,
      activeAccessoryId
    );
    charRig.root.position.set(0, 0.02, 0);
    turntableGroup.add(charRig.root);

    // Pointer 360 rotation + Wheel zoom
    const onPointerDown = (e: PointerEvent) => {
      orbitRef.current.dragging = true;
      orbitRef.current.lastX = e.clientX;
      orbitRef.current.lastY = e.clientY;
      try {
        canvasEl.setPointerCapture(e.pointerId);
      } catch {
        // ignore if unsupported
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!orbitRef.current.dragging) return;
      const dx = e.clientX - orbitRef.current.lastX;
      const dy = e.clientY - orbitRef.current.lastY;
      orbitRef.current.lastX = e.clientX;
      orbitRef.current.lastY = e.clientY;
      orbitRef.current.targetYaw += dx * 0.013;
      orbitRef.current.targetPitch = THREE.MathUtils.clamp(
        orbitRef.current.targetPitch + dy * 0.006,
        -0.05,
        0.58
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      orbitRef.current.dragging = false;
      try {
        if (canvasEl.hasPointerCapture(e.pointerId)) {
          canvasEl.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const nextZoom = THREE.MathUtils.clamp(
        orbitRef.current.zoom - Math.sign(e.deltaY) * 0.1,
        0.65,
        1.75
      );
      orbitRef.current.zoom = nextZoom;
      onZoomChangeRef.current?.(Number(nextZoom.toFixed(2)));
    };

    canvasEl.addEventListener('pointerdown', onPointerDown);
    canvasEl.addEventListener('pointermove', onPointerMove);
    canvasEl.addEventListener('pointerup', onPointerUp);
    canvasEl.addEventListener('pointercancel', onPointerUp);
    canvasEl.addEventListener('wheel', onWheel, { passive: false });

    const syncSize = () => {
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(syncSize);
    ro.observe(container);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    let curDistance = 3.25;

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const cur = propsRef.current;

      // Rebuild rig dynamically whenever character, skin, outfit, or accessory changes
      const nextOutfit = cur.outfitId ?? null;
      const nextSkin = cur.skinId ?? null;
      const nextAcc = cur.accessoryId ?? null;
      if (
        cur.characterId !== activeCharId ||
        nextOutfit !== activeOutfitId ||
        nextSkin !== activeSkinId ||
        nextAcc !== activeAccessoryId
      ) {
        turntableGroup.remove(charRig.root);
        disposeObject3DResources(charRig.root);
        activeCharId = cur.characterId;
        activeOutfitId = nextOutfit;
        activeSkinId = nextSkin;
        activeAccessoryId = nextAcc;
        charRig = buildChibiCharacter3D(
          activeCharId,
          null,
          activeOutfitId,
          activeSkinId,
          activeAccessoryId
        );
        charRig.root.position.set(0, 0.02, 0);
        turntableGroup.add(charRig.root);
      }

      if (cur.autoRotate && !orbitRef.current.dragging) {
        orbitRef.current.targetYaw += dt * 0.72;
      }

      orbitRef.current.yaw = THREE.MathUtils.damp(
        orbitRef.current.yaw,
        orbitRef.current.targetYaw,
        9.5,
        dt
      );
      orbitRef.current.pitch = THREE.MathUtils.damp(
        orbitRef.current.pitch,
        orbitRef.current.targetPitch,
        9.5,
        dt
      );

      turntableGroup.rotation.y = orbitRef.current.yaw;

      const targetDist = 3.25 / THREE.MathUtils.clamp(orbitRef.current.zoom, 0.65, 1.75);
      curDistance = THREE.MathUtils.damp(curDistance, targetDist, 9.0, dt);
      const lookY = 0.68 + (orbitRef.current.zoom - 1) * 0.1;
      camera.position.set(
        0,
        lookY + Math.sin(orbitRef.current.pitch) * curDistance,
        Math.cos(orbitRef.current.pitch) * curDistance
      );
      camera.lookAt(0, 0.62, 0);

      // Gentle chibi idle animation
      const breath = Math.sin(t * 2.5) * 0.025;
      charRig.bodyGroup.position.y = breath;
      charRig.headGroup.rotation.y = Math.sin(t * 1.15) * 0.09;
      charRig.headGroup.rotation.z = Math.sin(t * 1.6) * 0.035;
      charRig.leftArm.rotation.z = 0.16 + Math.sin(t * 2.1) * 0.05;
      charRig.rightArm.rotation.z = -0.16 - Math.sin(t * 2.1) * 0.05;
      if (charRig.tail) {
        charRig.tail.rotation.y = Math.sin(t * 3.4) * 0.24;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      ro.disconnect();
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      canvasEl.removeEventListener('pointermove', onPointerMove);
      canvasEl.removeEventListener('pointerup', onPointerUp);
      canvasEl.removeEventListener('pointercancel', onPointerUp);
      canvasEl.removeEventListener('wheel', onWheel);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);
      disposeObject3DResources(turntableGroup);
      envRT.dispose();
      renderer.dispose();
      if (canvasEl.parentNode === container) {
        container.removeChild(canvasEl);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#FAF2DD] to-[#EADAB8] p-4 ${className}`}
      >
        <CharacterPortrait characterId={characterId} emotion={EmotionType.HAPPY} size={112} />
        <span className="text-xs font-semibold text-[#5D351B] text-center">
          Pratinjau 2D aktif (peramban membatasi konteks 3D tambahan)
        </span>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative cursor-grab active:cursor-grabbing select-none ${className}`}
      aria-label="Tampilan Karakter 3D Interaktif 360 Derajat"
    />
  );
};
