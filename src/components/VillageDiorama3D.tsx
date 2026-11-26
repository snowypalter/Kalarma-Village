import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CheckCircle2,
  Clock,
  CloudRain,
  MessageCircle,
  Moon,
  Stethoscope,
  Sun,
  Volume2,
  VolumeX,
  Wind,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { CASES } from '../data/cases';
import { AVATARS, CHARACTERS, WEATHER_INFO } from '../data/characters';
import { AvatarId, CaseScenario, CharacterId, EmotionType, WeatherType } from '../types/pharmacy';
import { villageAmbientAudio } from '../utils/ambientAudio';
import { soundFX } from '../utils/sound';
import { ChibiCharacterRig, buildChibiCharacter3D } from '../three/dioramaCharacters';
import { TimePhaseName, createDayNightLightingRig, getTimePhaseLabel } from '../three/dioramaLighting';
import { createDioramaMaterials } from '../three/dioramaMaterials';
import { createWeatherParticleSystem } from '../three/dioramaWeather';
import {
  ColliderBox,
  buildApothecaryLOD,
  buildApothecaryPavilion,
  buildCentralFountain,
  buildCliffWindmill,
  buildFloatingIsland,
  buildHospitalBuilding,
  buildHospitalLOD,
  buildMarketStall,
  buildMarketStallLOD,
  buildPondAndBridge,
  buildSacredAncientTree,
  buildSacredTreeLOD,
  buildTree3D,
  buildTreeLOD,
  buildVillagerCottage,
  buildVillagerCottageLOD,
  buildWindmillLOD,
} from '../three/dioramaProps';
import { CharacterPortrait } from './CharacterPortrait';
import { VirtualJoystick } from './VirtualJoystick';

interface VillageDiorama3DProps {
  selectedAvatar: AvatarId;
  weather: WeatherType;
  onChangeWeather: (w: WeatherType) => void;
  completedCases: string[];
  activeCaseId?: string | null;
  onSelectCase: (scenario: CaseScenario) => void;
  timeStepTrigger?: number;
  zoomTrigger?: { dir: 1 | -1; seq: number };
  focusHubTrigger?: number;
  embeddedInHud?: boolean;
  viewportSectionRef?: React.RefObject<HTMLDivElement | null>;
}

const WEATHER_ICONS: Record<WeatherType, React.ReactNode> = {
  [WeatherType.CERAH_HANGAT]: <Sun className="w-4 h-4" />,
  [WeatherType.HUJAN_LEMBAP]: <CloudRain className="w-4 h-4" />,
  [WeatherType.ANGIN_PANCAROBA]: <Wind className="w-4 h-4" />,
  [WeatherType.KABUT_MALAM]: <Moon className="w-4 h-4" />,
};

interface NpcStation {
  id: CharacterId;
  x: number;
  z: number;
  rotY: number;
  caseId?: string;
  mentorQuote?: string;
}

const NPC_STATIONS: NpcStation[] = [
  // Mentors around Hospital & Pharmacy Pavilion
  {
    id: 'bima',
    x: -2.0,
    z: -9.8,
    rotY: 0.2,
    mentorQuote:
      'Dr. Bima: Selamat datang di RS Utama Asklepios! Saya menyiapkan resep klinis, pastikan Anda menyaring dosis dan alergi pasien.',
  },
  {
    id: 'hana',
    x: 2.2,
    z: -9.8,
    rotY: -0.2,
    mentorQuote:
      'Perawat Hana: Ruang rawat dan pompa infus sudah siap. Jaga laju TPM tetap berada di Therapeutic Window ya!',
  },
  {
    id: 'lios',
    x: 9.0,
    z: -0.4,
    rotY: -0.5,
    mentorQuote:
      'Guru Lios: Di Paviliun Apotek ini kita meracik terapi modern dan menjaga standar antibiotik rasional desa.',
  },
  {
    id: 'alia',
    x: 13.8,
    z: 1.4,
    rotY: -0.4,
    mentorQuote:
      'Alia: Klik warga bertanda seru merah (!) atau dekati dengan analog untuk mulai mewawancarai dan menyaring resep mereka.',
  },
  {
    id: 'sekar',
    x: -11.4,
    z: 8.2,
    rotY: 0.9,
    mentorQuote:
      'Mbah Sekar: Tanaman Meniran dan Temulawak di kios selatan berkhasiat +15% lebih kuat saat cuaca Cerah Hangat!',
  },
  {
    id: 'yuna',
    x: -4.2,
    z: -5.2,
    rotY: 0.35,
    mentorQuote:
      'Apoteker Yuna: Ingat selalu catat dugaan efek samping obat (MESO) dan dengarkan riwayat keluhan pasien dengan tenang ya!',
  },
  {
    id: 'dodo',
    x: 5.4,
    z: 4.4,
    rotY: -0.65,
    mentorQuote:
      'Paman Dodo: Ha-ha! Sehabis mendayung di danau, saya sering lupa minum obat kalau tidak diingatkan jadwal minumnya oleh apoteker!',
  },
  {
    id: 'sora',
    x: -9.8,
    z: 13.6,
    rotY: 0.5,
    mentorQuote:
      'Sora: Terkadang label peringatan obat membuatku cemas, tapi penjelasan apoteker tentang DAGUSIBU selalu menenangkanku.',
  },
  // 10 Villager Patients spaced across the expanded village neighborhoods
  { id: 'koko', x: -14.2, z: -10.8, rotY: 0.4, caseId: 'case-koko' },
  { id: 'geri', x: 14.2, z: -10.8, rotY: -0.4, caseId: 'case-geri' },
  { id: 'mimi', x: -14.2, z: 1.4, rotY: 0.8, caseId: 'case-mimi' },
  { id: 'nino', x: 5.8, z: 13.4, rotY: -0.2, caseId: 'case-nino' },
  { id: 'riko', x: 14.4, z: 7.2, rotY: -0.8, caseId: 'case-riko' },
  { id: 'bobi', x: 13.8, z: 14.8, rotY: -0.6, caseId: 'case-bobi' },
  { id: 'pipi', x: -14.0, z: 14.4, rotY: 0.6, caseId: 'case-pipi' },
  { id: 'lili', x: -8.4, z: -8.8, rotY: 0.55, caseId: 'case-lili' },
  { id: 'cici', x: -5.6, z: 12.6, rotY: 0.45, caseId: 'case-cici' },
  { id: 'taro', x: 8.6, z: -11.4, rotY: -0.55, caseId: 'case-taro' },
];

// Pre-allocated zero-GC math & culling helpers
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersectPt = new THREE.Vector3();
const _projScreenMatrix = new THREE.Matrix4();
const _frustum = new THREE.Frustum();
const _cullSphere = new THREE.Sphere();

function groundHeightAt(x: number, z: number): number {
  // Raised arch over the central stone bridge at x in [-1.4, 1.4], z in [-0.9, 4.1]
  if (Math.abs(x) <= 1.45 && z >= -0.9 && z <= 4.1) {
    const t = (z - 1.6) / 2.5;
    return Math.max(0, Math.cos(t * (Math.PI / 2)) * 0.62 + 0.16);
  }
  // Gentle arch over the eastern weathered wooden plank bridge at x in [3.5, 5.1], z in [-0.9, 4.1]
  if (Math.abs(x - 4.3) <= 0.78 && z >= -0.9 && z <= 4.1) {
    const t = (z - 1.6) / 2.5;
    return Math.max(0, Math.cos(t * (Math.PI / 2)) * 0.2 + 0.18);
  }
  return 0;
}

export const VillageDiorama3D: React.FC<VillageDiorama3DProps> = ({
  selectedAvatar,
  weather,
  onChangeWeather,
  completedCases,
  activeCaseId = null,
  onSelectCase,
  timeStepTrigger = 0,
  zoomTrigger,
  focusHubTrigger = 0,
  embeddedInHud = false,
  viewportSectionRef,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);

  const weatherRef = useRef<WeatherType>(weather);
  const completedRef = useRef<string[]>(completedCases);
  const activeCaseIdRef = useRef<string | null>(activeCaseId);
  const talkingNpcIdRef = useRef<CharacterId | null>(null);
  const avatarRef = useRef<AvatarId>(selectedAvatar);
  const zoomRef = useRef<number>(1.0);
  const dayPhaseRef = useRef<number>((0.08 + (completedCases.length % 7) * 0.08) % 1);
  const targetPhaseRef = useRef<number | null>(null);
  const nightLockBlendRef = useRef<number>(weather === WeatherType.KABUT_MALAM ? 1 : 0);
  const prevCompletedLenRef = useRef<number>(completedCases.length);

  const playerStateRef = useRef({
    x: 0,
    z: -2.2,
    rotY: 0,
    walkPhase: 0,
    speed: 6.8,
    autoTarget: null as { x: number; z: number } | null,
    autoInteractNpcId: null as CharacterId | null,
  });

  const keysRef = useRef<Record<string, boolean>>({});
  const joystickRef = useRef<{ active: boolean; dx: number; dy: number }>({
    active: false,
    dx: 0,
    dy: 0,
  });

  const [nearbyNpc, setNearbyNpc] = useState<NpcStation | null>(null);
  const [mentorBubble, setMentorBubble] = useState<{ id: CharacterId; text: string } | null>(null);
  const [ambientMuted, setAmbientMuted] = useState(() => villageAmbientAudio.isLocalMuted());
  const [timePhaseLabel, setTimePhaseLabel] = useState<TimePhaseName>(() =>
    weather === WeatherType.KABUT_MALAM
      ? 'Malam Tenang'
      : getTimePhaseLabel((0.08 + (completedCases.length % 7) * 0.08) % 1)
  );

  const onSelectCaseRef = useRef(onSelectCase);
  useEffect(() => {
    onSelectCaseRef.current = onSelectCase;
  }, [onSelectCase]);

  useEffect(() => {
    weatherRef.current = weather;
    villageAmbientAudio.setWeather(weather);
  }, [weather]);

  useEffect(() => {
    completedRef.current = completedCases;
    if (completedCases.length > prevCompletedLenRef.current) {
      dayPhaseRef.current = (dayPhaseRef.current + 0.08) % 1;
    }
    prevCompletedLenRef.current = completedCases.length;
  }, [completedCases]);

  useEffect(() => {
    activeCaseIdRef.current = activeCaseId;
  }, [activeCaseId]);

  useEffect(() => {
    talkingNpcIdRef.current = mentorBubble ? mentorBubble.id : null;
  }, [mentorBubble]);

  useEffect(() => {
    avatarRef.current = selectedAvatar;
  }, [selectedAvatar]);

  useEffect(() => {
    if (timeStepTrigger <= 0) return;
    const cur = dayPhaseRef.current;
    const stops = [0.08, 0.28, 0.56, 0.82];
    const nextStop = stops.find((s) => s > cur + 0.06) ?? stops[0];
    targetPhaseRef.current = nextStop;
  }, [timeStepTrigger]);

  useEffect(() => {
    if (!zoomTrigger || zoomTrigger.seq <= 0) return;
    if (zoomTrigger.dir > 0) {
      zoomRef.current = Math.min(1.45, zoomRef.current + 0.15);
    } else {
      zoomRef.current = Math.max(0.55, zoomRef.current - 0.15);
    }
  }, [zoomTrigger]);

  useEffect(() => {
    if (focusHubTrigger <= 0) return;
    playerStateRef.current.autoTarget = { x: 0, z: -2.2 };
    playerStateRef.current.autoInteractNpcId = null;
    zoomRef.current = 1.0;
  }, [focusHubTrigger]);

  const interactWithStation = (station: NpcStation) => {
    soundFX.playClick();
    if (station.caseId) {
      const found = CASES.find((c) => c.id === station.caseId);
      if (found) {
        onSelectCaseRef.current(found);
        return;
      }
    }
    if (station.mentorQuote) {
      setMentorBubble({ id: station.id, text: station.mentorQuote });
    }
  };

  const triggerRef = useRef<() => void>(() => {});
  triggerRef.current = () => {
    if (nearbyNpc) {
      interactWithStation(nearbyNpc);
    }
  };

  const handleJoystickVector = (dx: number, dy: number, active: boolean) => {
    if (active) {
      villageAmbientAudio.start(weatherRef.current);
    }
    joystickRef.current = { active, dx, dy };
    if (active && (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05)) {
      playerStateRef.current.autoTarget = null;
      playerStateRef.current.autoInteractNpcId = null;
    }
  };

  // Start ambient soundscape on mount (if already unlocked) or first interaction, and clean up on unmount
  useEffect(() => {
    villageAmbientAudio.start(weatherRef.current);
    const unlockAmbient = () => {
      villageAmbientAudio.start(weatherRef.current);
    };
    window.addEventListener('pointerdown', unlockAmbient, { passive: true });
    window.addEventListener('keydown', unlockAmbient, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAmbient);
      window.removeEventListener('keydown', unlockAmbient);
      villageAmbientAudio.stop();
    };
  }, []);

  // Keyboard movement + Space/E interact
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        e.preventDefault();
        keysRef.current[k] = true;
        playerStateRef.current.autoTarget = null;
        playerStateRef.current.autoInteractNpcId = null;
      }
      if (k === 'e' || e.code === 'Space') {
        if (tag !== 'BUTTON') {
          e.preventDefault();
          triggerRef.current();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const onBlur = () => {
      keysRef.current = {};
      joystickRef.current = { active: false, dx: 0, dy: 0 };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Main Three.js WebGL 3D Isometric Diorama Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const gpuProfile = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return { isSoftwareGl: true, isConstrainedGpu: true };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      const isIntegrated = /Intel|UHD|Iris|HD Graphics|AMD Radeon\(TM\) Graphics|Radeon Vega|Mali|Adreno|PowerVR/i.test(
        gpu
      );
      const devMem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      const lowMem = typeof devMem === 'number' && devMem <= 8;
      return {
        isSoftwareGl,
        isConstrainedGpu: isSoftwareGl || isIntegrated || lowMem,
      };
    })();
    const { isSoftwareGl, isConstrainedGpu } = gpuProfile;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isConstrainedGpu,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, isConstrainedGpu ? 1.25 : 1.75)
    );
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initW = container.clientWidth || 900;
    const initH = container.clientHeight || 520;
    renderer.setSize(initW, initH);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbece2);
    scene.fog = new THREE.FogExp2(0xdbece2, 0.011);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // True Isometric Orthographic Camera (45 deg yaw, ~35 deg pitch)
    const frustumBase = 19.5;
    const aspect = initW / Math.max(1, initH);
    const camera = new THREE.OrthographicCamera(
      (-frustumBase * aspect) / 2,
      (frustumBase * aspect) / 2,
      frustumBase / 2,
      -frustumBase / 2,
      0.1,
      160
    );
    const camOffset = new THREE.Vector3(26, 21.2, 26);
    const camLookTarget = new THREE.Vector3(0, 0.5, -2.2);
    camera.position.copy(camLookTarget).add(camOffset);
    camera.lookAt(camLookTarget);

    // Warm Sunlight + Cool Sky/Ground Hemisphere Rig
    const hemiLight = new THREE.HemisphereLight(0xcbe8f6, 0x8d6e53, 0.72);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff4d6, 1.45);
    sunLight.position.set(18, 28, 16);
    sunLight.castShadow = !isSoftwareGl;
    const shadowSize = isConstrainedGpu ? 768 : 1024;
    sunLight.shadow.mapSize.width = shadowSize;
    sunLight.shadow.mapSize.height = shadowSize;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 90;
    sunLight.shadow.camera.left = -29;
    sunLight.shadow.camera.right = 29;
    sunLight.shadow.camera.top = 29;
    sunLight.shadow.camera.bottom = -29;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    sunLight.shadow.radius = isConstrainedGpu ? 1.5 : 2.5;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xbbe0e8, 0.38);
    fillLight.position.set(-14, 10, -12);
    scene.add(fillLight);

    // Subtle back rim light for realistic silhouette separation on characters & foliage
    const rimLight = new THREE.DirectionalLight(0xfff1d6, 0.32);
    rimLight.position.set(-12, 16, -18);
    scene.add(rimLight);

    // Build Diorama Materials & World
    const maxAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const mats = createDioramaMaterials(maxAnisotropy, isConstrainedGpu);
    const island = buildFloatingIsland(mats);
    scene.add(island);

    const windowMeshes: THREE.Mesh[] = [];
    const lanternLights: THREE.PointLight[] = [];
    const lanternBulbs: THREE.Mesh[] = [];
    const colliders: ColliderBox[] = [];
    const clickableProxies: THREE.Mesh[] = [];

    interface LodEntry {
      lod: THREE.LOD;
      highGroup: THREE.Group;
      lowGroup: THREE.Group;
      radius: number;
      threshold: number;
      isVegetation: boolean;
    }
    const lodEntries: LodEntry[] = [];

    const registerLod = (
      highGroup: THREE.Group,
      lowGroup: THREE.Group,
      radius: number,
      threshold: number,
      isVegetation = false
    ): THREE.LOD => {
      const lod = new THREE.LOD();
      lod.autoUpdate = false;
      highGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.frustumCulled = true;
      });
      lowGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.frustumCulled = true;
      });
      lowGroup.visible = false;
      lod.addLevel(highGroup, 0);
      lod.addLevel(lowGroup, threshold);
      lodEntries.push({ lod, highGroup, lowGroup, radius, threshold, isVegetation });
      return lod;
    };

    // 1. Hospital & Clinic Utama Asklepios (North)
    const hospitalHigh = buildHospitalBuilding(mats, windowMeshes);
    const hospitalLow = buildHospitalLOD(mats);
    const hospitalLod = registerLod(hospitalHigh, hospitalLow, 8.0, isConstrainedGpu ? 19.0 : 23.0);
    hospitalLod.position.set(0, 0, -15.0);
    scene.add(hospitalLod);
    colliders.push({ id: 'hospital', label: 'RS Utama Asklepios', x: 0, z: -15.0, halfW: 4.5, halfD: 2.8 });

    // 2. Paviliun Herbal & Apotek Guru Lios (East beside pond)
    const pavilionHigh = buildApothecaryPavilion(mats, lanternLights, lanternBulbs);
    const pavilionLow = buildApothecaryLOD(mats);
    const pavilionLod = registerLod(pavilionHigh, pavilionLow, 6.0, isConstrainedGpu ? 18.0 : 21.5);
    pavilionLod.position.set(12.6, 0, -2.6);
    scene.add(pavilionLod);
    colliders.push({ id: 'pavilion', label: 'Apotek Guru Lios', x: 12.6, z: -2.6, halfW: 2.8, halfD: 2.5 });

    // 3. Pond, Dual Bridges (Stone Arch + Plank Footbridge), Waterfall & Waterwheel Mill
    const {
      group: pondGroup,
      waterMesh,
      boatGroup,
      waterwheelGroup,
      foamMeshes,
    } = buildPondAndBridge(mats);
    scene.add(pondGroup);
    colliders.push({ id: 'watermill-cliff', label: 'Kincir Air Sungai', x: -6.75, z: 1.6, halfW: 1.15, halfD: 1.45 });

    // 3b. Central Village Stone Fountain Plaza
    const { group: fountainGroup, spoutMesh: fountainSpout } = buildCentralFountain(mats);
    fountainGroup.position.set(0, 0, 8.8);
    scene.add(fountainGroup);
    colliders.push({ id: 'fountain', label: 'Air Mancur Desa', x: 0, z: 8.8, halfW: 1.05, halfD: 1.05 });

    // 3c. Sacred Giant Ancient Herb Tree (North-East Plaza beside Clinic)
    const sacredHigh = buildSacredAncientTree(mats);
    const sacredLow = buildSacredTreeLOD(mats);
    const sacredLod = registerLod(sacredHigh, sacredLow, 7.5, isConstrainedGpu ? 18.5 : 22.0, true);
    sacredLod.position.set(9.5, 0, -18.2);
    scene.add(sacredLod);
    colliders.push({ id: 'sacred-tree', label: 'Pohon Herbal Suci', x: 9.5, z: -18.2, halfW: 1.0, halfD: 1.0 });

    // 3d. Cliff Bluff Rotating Wooden Windmill (East Bluff)
    const { group: windmillHigh, bladesGroup: windmillBlades } = buildCliffWindmill(mats);
    const windmillLow = buildWindmillLOD(mats);
    const windmillLod = registerLod(windmillHigh, windmillLow, 6.5, isConstrainedGpu ? 19.0 : 22.5);
    windmillLod.position.set(19.8, 0, -2.5);
    windmillLod.rotation.y = -0.45;
    scene.add(windmillLod);
    colliders.push({ id: 'windmill', label: 'Kincir Angin Tebing', x: 19.8, z: -2.5, halfW: 1.45, halfD: 1.45 });

    // 4. Market Kiosks (South)
    const stallSpecs: [number, number, number, THREE.MeshStandardMaterial][] = [
      [-7.8, 17.4, 0, mats.roofCoral],
      [0, 17.8, 0, mats.plasterSage],
      [7.8, 17.4, 0, mats.roofCream],
    ];
    stallSpecs.forEach(([sx, sz, ry, awn], idx) => {
      const stallHigh = buildMarketStall(mats, awn);
      const stallLow = buildMarketStallLOD(mats, awn);
      const stallLod = registerLod(stallHigh, stallLow, 4.2, isConstrainedGpu ? 16.5 : 19.5);
      stallLod.position.set(sx, 0, sz);
      stallLod.rotation.y = ry;
      scene.add(stallLod);
      colliders.push({ id: `stall-${idx}`, label: 'Kios Pasar Obat', x: sx, z: sz, halfW: 1.9, halfD: 1.1 });
    });

    // 5. Storybook Villager Cottages (mosaic pastel roofs, mailboxes & clotheslines)
    const cottageSpecs: [string, number, number, number, THREE.MeshStandardMaterial, boolean, boolean][] = [
      ['koko_house', -17.2, -13.5, 0.28, mats.roofTeal, true, false],
      ['geri_house', 17.2, -13.5, -0.28, mats.roofTerracotta, false, true],
      ['mimi_cafe', -17.8, -1.6, 0.55, mats.roofMosaic, true, true],
      ['sekar_hut', -16.2, 8.2, 0.4, mats.plasterSage, false, false],
      ['pipi_cottage', -17.4, 16.5, 0.5, mats.roofMosaic, true, false],
      ['riko_lodge', 17.6, 6.8, -0.5, mats.roofTeal, false, true],
      ['bobi_hut', 17.2, 16.5, -0.45, mats.roofTerracotta, true, false],
    ];
    cottageSpecs.forEach(([cid, cx, cz, ry, rMat, mailbox, clothesline]) => {
      const cottageHigh = buildVillagerCottage(mats, rMat, windowMeshes, mailbox, clothesline);
      const cottageLow = buildVillagerCottageLOD(mats, rMat);
      const cottageLod = registerLod(cottageHigh, cottageLow, 4.8, isConstrainedGpu ? 17.0 : 20.0);
      cottageLod.position.set(cx, 0, cz);
      cottageLod.rotation.y = ry;
      scene.add(cottageLod);
      colliders.push({ id: cid, label: cid, x: cx, z: cz, halfW: 2.1, halfD: 1.9 });
    });

    // 6. Botanical & Blossom 3D Trees framing the spacious 52x52 island
    const treeSpecs: [number, number, number, boolean][] = [
      [-20.8, -18.5, 1.2, false],
      [-10.2, -20.5, 1.0, true],
      [4.8, -20.2, 0.95, true],
      [15.2, -19.8, 1.1, false],
      [20.6, -18.2, 1.15, true],
      [-21.2, -8.0, 1.05, true],
      [-21.4, 3.2, 1.1, false],
      [21.2, -9.2, 1.05, false],
      [21.4, 3.5, 1.0, true],
      [-21.2, 12.5, 1.05, false],
      [21.2, 12.5, 1.05, false],
      [-20.5, 20.5, 1.15, true],
      [-11.8, 20.8, 0.95, false],
      [-3.8, 21.0, 0.95, true],
      [4.2, 21.0, 0.95, false],
      [20.5, 20.5, 1.15, true],
    ];
    treeSpecs.forEach(([tx, tz, sc, isBlossom]) => {
      const treeHigh = buildTree3D(mats, isBlossom);
      const treeLow = buildTreeLOD(mats, isBlossom);
      const treeLod = registerLod(treeHigh, treeLow, 4.5 * sc, isConstrainedGpu ? 16.0 : 19.0, true);
      treeLod.position.set(tx, 0, tz);
      treeLod.scale.setScalar(sc);
      scene.add(treeLod);
    });

    // 7. Tap-on-ground Target Ring Marker
    const targetRing = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.48, 24),
      new THREE.MeshBasicMaterial({ color: 0x2c6e63, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.y = 0.06;
    targetRing.visible = false;
    scene.add(targetRing);

    // 8. NPC 3D Chibi Rigs + Raycast Proxy Hitboxes
    const npcRigs: Map<
      CharacterId,
      { station: NpcStation; rig: ChibiCharacterRig; seed: number; greetBlend: number }
    > = new Map();
    const proxyGeo = new THREE.CylinderGeometry(0.65, 0.65, 2.2, 10);
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });

    NPC_STATIONS.forEach((st, idx) => {
      const isDone = st.caseId ? completedRef.current.includes(st.caseId) : false;
      const status = st.caseId ? (isDone ? 'done' : 'quest') : null;
      const rig = buildChibiCharacter3D(st.id, status);
      rig.root.position.set(st.x, groundHeightAt(st.x, st.z), st.z);
      rig.root.rotation.y = st.rotY;
      scene.add(rig.root);

      const proxy = new THREE.Mesh(proxyGeo, proxyMat);
      proxy.position.set(st.x, 1.1, st.z);
      proxy.userData.station = st;
      scene.add(proxy);
      clickableProxies.push(proxy);

      npcRigs.set(st.id, {
        station: st,
        rig,
        seed: idx * 1.47 + st.x * 0.31 + st.z * 0.23,
        greetBlend: 0,
      });
    });

    // 9. Active Player 3D Chibi Rig (swaps cleanly when selectedAvatar changes)
    let activePlayerId = avatarRef.current;
    let playerRig = buildChibiCharacter3D(activePlayerId, null);
    playerRig.root.position.set(playerStateRef.current.x, 0, playerStateRef.current.z);
    scene.add(playerRig.root);

    // 10. Dynamic Multi-Layer 3D Weather Particle System & Day-Dusk-Night Lighting Rig
    const weatherSystem = createWeatherParticleSystem(isConstrainedGpu);
    scene.add(weatherSystem.group);
    const lightingRig = createDayNightLightingRig();

    // Pre-compile shaders once if GPU available
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster Pointer Interaction (Click villager or ground)
    const handlePointerTap = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, camera);

      const npcHits = _raycaster.intersectObjects(clickableProxies, false);
      if (npcHits.length > 0) {
        const station = npcHits[0].object.userData.station as NpcStation | undefined;
        if (station) {
          soundFX.playClick();
          // Walk to point in front of NPC and auto-open dialog on arrival
          const approachX = station.x + Math.sin(station.rotY) * 1.4;
          const approachZ = station.z + Math.cos(station.rotY) * 1.4;
          playerStateRef.current.autoTarget = { x: approachX, z: approachZ };
          playerStateRef.current.autoInteractNpcId = station.id;
          return;
        }
      }

      if (_raycaster.ray.intersectPlane(_groundPlane, _intersectPt)) {
        const tx = THREE.MathUtils.clamp(_intersectPt.x, -23.5, 23.5);
        const tz = THREE.MathUtils.clamp(_intersectPt.z, -23.5, 23.5);
        playerStateRef.current.autoTarget = { x: tx, z: tz };
        playerStateRef.current.autoInteractNpcId = null;
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerTap);

    // Responsive Resize Observer
    const syncSize = () => {
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 520;
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(syncSize);
    ro.observe(container);

    // Animation Loop (with software-WebGL afterDraw pacing)
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();
    let uiTimer = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        if (disposed) return;
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      // Swap player 3D rig if avatar changed
      if (avatarRef.current !== activePlayerId) {
        scene.remove(playerRig.root);
        playerRig.root.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
        activePlayerId = avatarRef.current;
        playerRig = buildChibiCharacter3D(activePlayerId, null);
        scene.add(playerRig.root);
      }

      // 1. PLAYER MOVEMENT (Analog + WASD + Raycast Tap-to-Walk)
      const ps = playerStateRef.current;
      let screenX = joystickRef.current.dx;
      let screenY = joystickRef.current.dy;

      const keys = keysRef.current;
      if (keys['w'] || keys['arrowup']) screenY -= 1;
      if (keys['s'] || keys['arrowdown']) screenY += 1;
      if (keys['a'] || keys['arrowleft']) screenX -= 1;
      if (keys['d'] || keys['arrowright']) screenX += 1;

      let worldVx = 0;
      let worldVz = 0;
      const inputMag = Math.hypot(screenX, screenY);

      if (inputMag > 0.05) {
        const clamped = Math.min(1, inputMag);
        const sx = screenX / inputMag;
        const sy = screenY / inputMag;
        // Isometric 45 deg camera screen-to-world projection
        const forward = -sy;
        const right = sx;
        worldVx = (right - forward) * 0.7071 * clamped;
        worldVz = (-right - forward) * 0.7071 * clamped;
      } else if (ps.autoTarget) {
        const dx = ps.autoTarget.x - ps.x;
        const dz = ps.autoTarget.z - ps.z;
        const d = Math.hypot(dx, dz);
        if (d > 0.25) {
          worldVx = dx / d;
          worldVz = dz / d;
        } else {
          const arrivedNpcId = ps.autoInteractNpcId;
          ps.autoTarget = null;
          ps.autoInteractNpcId = null;
          if (arrivedNpcId) {
            const st = NPC_STATIONS.find((n) => n.id === arrivedNpcId);
            if (st) interactWithStation(st);
          }
        }
      }

      const moveMag = Math.hypot(worldVx, worldVz);
      const isMoving = moveMag > 0.05;

      if (isMoving) {
        const nextX = THREE.MathUtils.clamp(ps.x + worldVx * ps.speed * dt, -23.8, 23.8);
        const nextZ = THREE.MathUtils.clamp(ps.z + worldVz * ps.speed * dt, -23.8, 23.8);

        const hitsObstacle = (tx: number, tz: number) => {
          // Pond water check (allow crossing on Stone Bridge |tx|<=1.35 OR Plank Bridge |tx-4.3|<=0.72)
          const onStoneBridge = Math.abs(tx) <= 1.35;
          const onPlankBridge = Math.abs(tx - 4.3) <= 0.72;
          if (!onStoneBridge && !onPlankBridge && Math.abs(tx) < 5.8 && tz > -0.7 && tz < 3.9) {
            return true;
          }
          return colliders.some(
            (c) => Math.abs(tx - c.x) < c.halfW + 0.45 && Math.abs(tz - c.z) < c.halfD + 0.45
          );
        };

        if (!hitsObstacle(nextX, ps.z)) ps.x = nextX;
        if (!hitsObstacle(ps.x, nextZ)) ps.z = nextZ;

        const targetRot = Math.atan2(worldVx, worldVz);
        let diff = targetRot - ps.rotY;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        ps.rotY += diff * Math.min(1, dt * 12);
        ps.walkPhase += dt * (7 + moveMag * 5);
      }

      // Apply transform & cozy hop/idle animation to player 3D chibi
      const groundY = groundHeightAt(ps.x, ps.z);
      playerRig.root.position.set(ps.x, groundY, ps.z);
      playerRig.root.rotation.y = ps.rotY;
      if (isMoving) {
        playerRig.bodyGroup.position.y = Math.abs(Math.sin(ps.walkPhase)) * 0.14;
        playerRig.headGroup.rotation.x = Math.sin(ps.walkPhase * 2) * 0.05;
        playerRig.headGroup.rotation.y = 0;
        playerRig.leftFoot.position.z = Math.sin(ps.walkPhase) * 0.14;
        playerRig.rightFoot.position.z = -Math.sin(ps.walkPhase) * 0.14;
        playerRig.leftArm.rotation.x = -Math.sin(ps.walkPhase) * 0.45;
        playerRig.rightArm.rotation.x = Math.sin(ps.walkPhase) * 0.45;
        playerRig.leftArm.rotation.z = -0.32;
        playerRig.rightArm.rotation.z = 0.32;
        if (playerRig.tail) {
          playerRig.tail.rotation.y = Math.sin(ps.walkPhase * 1.4) * 0.28;
        }
      } else {
        playerRig.bodyGroup.position.y = Math.sin(elapsed * 2.4) * 0.025;
        playerRig.headGroup.rotation.x = Math.sin(elapsed * 1.8) * 0.04;
        playerRig.headGroup.rotation.y = Math.sin(elapsed * 0.9) * 0.12;
        playerRig.leftFoot.position.z = 0.04;
        playerRig.rightFoot.position.z = 0.04;
        playerRig.leftArm.rotation.x = Math.sin(elapsed * 2.4) * 0.04;
        playerRig.rightArm.rotation.x = -Math.sin(elapsed * 2.4) * 0.04;
        playerRig.leftArm.rotation.z = -0.32 + Math.sin(elapsed * 2.0) * 0.03;
        playerRig.rightArm.rotation.z = 0.32 - Math.sin(elapsed * 2.0) * 0.03;
        if (playerRig.tail) {
          playerRig.tail.rotation.y = Math.sin(elapsed * 4.5) * 0.18;
        }
      }

      // Sync NPC Quest Tracking badges ('!' -> '...' -> '✓') + Lifelike Idle & Proximity Greeting Animations
      npcRigs.forEach((entry) => {
        const { station, rig, seed } = entry;
        const isDone = station.caseId ? completedRef.current.includes(station.caseId) : false;
        const isSick = Boolean(station.caseId && !isDone);
        const isInConversation = talkingNpcIdRef.current === station.id;
        const isApproachingToInteract = ps.autoInteractNpcId === station.id;
        const isActiveMission = Boolean(station.caseId && activeCaseIdRef.current === station.caseId && !isDone);

        if (isInConversation || isApproachingToInteract || isActiveMission) {
          rig.updateStatusBadge('active');
        } else if (station.caseId) {
          rig.updateStatusBadge(isDone ? 'done' : 'quest');
        } else {
          rig.updateStatusBadge(null);
        }

        if (!rig.root.visible) return;

        if (rig.statusGroup && rig.statusGroup.visible) {
          rig.statusGroup.position.y = 1.88 + Math.sin(elapsed * 3.2 + seed) * 0.09;
          rig.statusGroup.rotation.y = Math.PI / 4 + Math.sin(elapsed * 1.4 + seed) * 0.2;
          if (rig.statusType === 'active' && rig.activeDots.length === 3) {
            for (let dIdx = 0; dIdx < 3; dIdx++) {
              rig.activeDots[dIdx].position.y = Math.max(0, Math.sin(elapsed * 6.5 - dIdx * 0.85)) * 0.055;
            }
          }
        }

        const dx = ps.x - station.x;
        const dz = ps.z - station.z;
        const distToPlayer = Math.hypot(dx, dz);
        const isNear = distToPlayer <= 4.2;

        entry.greetBlend = THREE.MathUtils.damp(entry.greetBlend, isNear ? 1 : 0, 6.5, dt);
        const g = entry.greetBlend;

        // Smoothly face player when nearby, otherwise return to resting orientation
        const desiredRotY = isNear ? Math.atan2(dx, dz) : station.rotY;
        let rotDiff = desiredRotY - rig.root.rotation.y;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        rig.root.rotation.y += rotDiff * Math.min(1, dt * 7);

        // Ambient idle motion
        const idleBreath = Math.sin(elapsed * (isSick ? 1.8 : 2.3) + seed) * (isSick ? 0.018 : 0.03);
        const idleSwayZ = Math.sin(elapsed * 1.25 + seed) * (isSick ? 0.035 : 0.022);
        const idleHeadX = isSick
          ? 0.12 + Math.sin(elapsed * 2.2 + seed) * 0.045
          : Math.sin(elapsed * 1.7 + seed) * 0.055;
        const idleHeadY = Math.sin(elapsed * 0.85 + seed) * (isSick ? 0.12 : 0.22);
        const idleHeadZ = Math.sin(elapsed * 1.15 + seed) * 0.05;
        const idleArmX = Math.sin(elapsed * 2.1 + seed) * 0.06;
        const idleRightArmZ = 0.32 + Math.sin(elapsed * 1.9 + seed) * 0.04;
        const idleLeftArmZ = -0.32 - Math.sin(elapsed * 1.9 + seed) * 0.04;

        // Proximity greeting motion (nodding, waving, happy bounce)
        const waveSpeed = isSick ? 5.6 : 9.2;
        const greetRightArmZ = isSick
          ? 1.72 + Math.sin(elapsed * waveSpeed + seed) * 0.24
          : 2.28 + Math.sin(elapsed * waveSpeed + seed) * 0.38;
        const greetRightArmX = -0.24;
        const greetHeadX = isSick
          ? 0.05 + Math.sin(elapsed * 4.5 + seed) * 0.11
          : Math.sin(elapsed * 6.0 + seed) * 0.15;
        const greetHop = isSick
          ? Math.abs(Math.sin(elapsed * 3.0 + seed)) * 0.025
          : Math.abs(Math.sin(elapsed * 4.6 + seed)) * 0.065;

        // Blend Idle <-> Greeting cleanly without allocations
        rig.bodyGroup.position.y = THREE.MathUtils.lerp(idleBreath, greetHop, g);
        rig.bodyGroup.rotation.z = THREE.MathUtils.lerp(idleSwayZ, Math.sin(elapsed * 4 + seed) * 0.03, g);

        rig.headGroup.rotation.x = THREE.MathUtils.lerp(idleHeadX, greetHeadX, g);
        rig.headGroup.rotation.y = THREE.MathUtils.lerp(idleHeadY, Math.sin(elapsed * 2.2 + seed) * 0.06, g);
        rig.headGroup.rotation.z = THREE.MathUtils.lerp(idleHeadZ, Math.sin(elapsed * 3.1 + seed) * 0.07, g);

        rig.leftArm.rotation.x = THREE.MathUtils.lerp(idleArmX, 0.1, g);
        rig.leftArm.rotation.z = THREE.MathUtils.lerp(idleLeftArmZ, -0.38, g);

        rig.rightArm.rotation.x = THREE.MathUtils.lerp(-idleArmX, greetRightArmX, g);
        rig.rightArm.rotation.z = THREE.MathUtils.lerp(idleRightArmZ, greetRightArmZ, g);

        if (rig.tail) {
          const tailSpeed = THREE.MathUtils.lerp(3.2, 9.5, g);
          const tailAmp = THREE.MathUtils.lerp(0.14, 0.34, g);
          rig.tail.rotation.y = Math.sin(elapsed * tailSpeed + seed) * tailAmp;
        }
      });

      // Ground target ring visibility
      if (ps.autoTarget) {
        targetRing.visible = true;
        targetRing.position.set(ps.autoTarget.x, groundHeightAt(ps.autoTarget.x, ps.autoTarget.z) + 0.05, ps.autoTarget.z);
        const s = 1 + Math.sin(elapsed * 8) * 0.12;
        targetRing.scale.set(s, s, 1);
      } else {
        targetRing.visible = false;
      }

      // 2. SMOOTH ISOMETRIC CAMERA TRACKING & ZOOM
      const curW = container.clientWidth || 900;
      const curH = container.clientHeight || 520;
      const curAspect = curW / Math.max(1, curH);
      const frustumH = frustumBase / zoomRef.current;
      camera.left = (-frustumH * curAspect) / 2;
      camera.right = (frustumH * curAspect) / 2;
      camera.top = frustumH / 2;
      camera.bottom = -frustumH / 2;
      camera.updateProjectionMatrix();

      camLookTarget.x = THREE.MathUtils.damp(camLookTarget.x, ps.x * 0.85, 6, dt);
      camLookTarget.z = THREE.MathUtils.damp(camLookTarget.z, ps.z * 0.85, 6, dt);
      camera.position.copy(camLookTarget).add(camOffset);
      camera.lookAt(camLookTarget);
      camera.updateMatrixWorld();

      // Update Frustum & Zero-GC Frustum Culling + Symmetric Distance-Based LOD
      _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      _frustum.setFromProjectionMatrix(_projScreenMatrix);

      const curZoom = zoomRef.current;
      const curWeather = weatherRef.current;
      const isWindy = curWeather === WeatherType.ANGIN_PANCAROBA;
      const swayAmp = isWindy ? 0.08 : 0.02;
      const swayFreq = isWindy ? 3.5 : 1.4;
      let treeIdx = 0;

      for (let i = 0; i < lodEntries.length; i++) {
        const entry = lodEntries[i];
        const pos = entry.lod.position;
        _cullSphere.center.set(pos.x, pos.y + 1.5, pos.z);
        _cullSphere.radius = entry.radius;

        const inFrustum = _frustum.intersectsSphere(_cullSphere);
        entry.lod.visible = inFrustum;

        if (inFrustum) {
          const focalDist = Math.hypot(pos.x - camLookTarget.x, pos.z - camLookTarget.z) / curZoom;
          const showHigh = focalDist < entry.threshold;
          entry.highGroup.visible = showHigh;
          entry.lowGroup.visible = !showHigh;

          if (entry.isVegetation && showHigh) {
            entry.lod.rotation.z = Math.sin(elapsed * swayFreq + treeIdx) * swayAmp;
          }
        }
        if (entry.isVegetation) {
          treeIdx++;
        }
      }

      // 3. WATER, WATERWHEEL, WINDMILL, FOUNTAIN & QUEST/NPC ANIMATIONS
      mats.waterUniforms.uTime.value = elapsed;
      if (mats.waterfall.map) {
        mats.waterfall.map.offset.y = -(elapsed * 1.15) % 1;
      }
      boatGroup.position.y = 0.16 + Math.sin(elapsed * 1.8) * 0.035;
      boatGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.04;
      waterMesh.position.y = 0.035 + Math.sin(elapsed * 2.1) * 0.012;
      waterwheelGroup.rotation.x -= dt * 1.25;
      windmillBlades.rotation.z -= dt * (isWindy ? 1.9 : 0.72);
      fountainSpout.scale.y = 0.92 + Math.sin(elapsed * 6.5) * 0.14;
      for (let f = 0; f < foamMeshes.length; f++) {
        const pulse = 0.92 + Math.sin(elapsed * 5.2 + f * 1.7) * 0.12;
        foamMeshes[f].scale.set(pulse, pulse, 1);
      }

      npcRigs.forEach((entry) => {
        const { station, rig } = entry;
        _cullSphere.center.set(station.x, rig.root.position.y + 0.9, station.z);
        _cullSphere.radius = 2.6;
        const npcVisible = _frustum.intersectsSphere(_cullSphere);
        rig.root.visible = npcVisible;
      });

      // 4. CONTINUOUS DAY -> DUSK -> NIGHT LIGHTING TRANSITION & DYNAMIC 3D PARTICLES
      const stepPhaseCircular = (cur: number, tgt: number, alpha: number) => {
        const diff = (((tgt - cur) % 1) + 1.5) % 1 - 0.5;
        return (((cur + diff * alpha) % 1) + 1) % 1;
      };

      if (targetPhaseRef.current !== null) {
        const diff = (((targetPhaseRef.current - dayPhaseRef.current) % 1) + 1.5) % 1 - 0.5;
        if (Math.abs(diff) < 0.005) {
          dayPhaseRef.current = targetPhaseRef.current;
          targetPhaseRef.current = null;
        } else {
          dayPhaseRef.current = stepPhaseCircular(dayPhaseRef.current, targetPhaseRef.current, Math.min(1, dt * 2.8));
        }
      } else {
        // Real-time continuous progression (~96s full Pagi -> Siang -> Senja -> Malam -> Pagi cycle)
        dayPhaseRef.current = (dayPhaseRef.current + dt / 96) % 1;
      }

      const isNightWeather = curWeather === WeatherType.KABUT_MALAM;
      nightLockBlendRef.current = THREE.MathUtils.damp(
        nightLockBlendRef.current,
        isNightWeather ? 1 : 0,
        2.2,
        dt
      );
      const effectivePhase = stepPhaseCircular(dayPhaseRef.current, 0.82, nightLockBlendRef.current);

      lightingRig.update(
        effectivePhase,
        curWeather,
        scene,
        sunLight,
        hemiLight,
        fillLight,
        windowMeshes,
        mats.glassWindowLit,
        mats.glassWindow,
        lanternLights,
        lanternBulbs
      );

      // Animate multi-layer weather particle system according to active scenario weather
      weatherSystem.update(curWeather, dt, elapsed);

      // 5. UPDATE MINI-MAP & NEARBY NPC HUD (~8 Hz)
      uiTimer += dt;
      if (uiTimer >= 0.12) {
        uiTimer = 0;

        const nextPhaseLabel = getTimePhaseLabel(effectivePhase);
        setTimePhaseLabel((prev) => (prev === nextPhaseLabel ? prev : nextPhaseLabel));

        let closest: NpcStation | null = null;
        let minDist = 2.6;
        for (const st of NPC_STATIONS) {
          const d = Math.hypot(st.x - ps.x, st.z - ps.z);
          if (d < minDist) {
            minDist = d;
            closest = st;
          }
        }
        setNearbyNpc((prev) => (prev?.id === closest?.id ? prev : closest));

        // Update spatial water stream proximity ("gemericik air" near pond & stone bridge)
        const dxPond = Math.max(0, Math.abs(ps.x) - 5.5);
        const dzPond = Math.max(0, Math.abs(ps.z - 1.6) - 2.4);
        const pondDist = Math.hypot(dxPond, dzPond);
        const waterProximity = Math.max(0, Math.min(1, 1 - pondDist / 10.5));
        villageAmbientAudio.setWaterProximity(waterProximity);

        const mini = minimapRef.current;
        if (mini) {
          const mctx = mini.getContext('2d');
          if (mctx) {
            const mw = mini.width;
            const mh = mini.height;
            mctx.fillStyle = '#16302B';
            mctx.fillRect(0, 0, mw, mh);

            const toMiniX = (wx: number) => ((wx + 26) / 52) * mw;
            const toMiniY = (wz: number) => ((wz + 26) / 52) * mh;

            // Pond
            mctx.fillStyle = '#38BDF8';
            mctx.globalAlpha = 0.45;
            mctx.fillRect(toMiniX(-5.7), toMiniY(-1.0), (11.4 / 52) * mw, (5.2 / 52) * mh);
            mctx.globalAlpha = 1;

            // Hospital & buildings
            colliders.forEach((c) => {
              mctx.fillStyle = c.id === 'hospital' ? '#FAF9F5' : '#84A98C';
              mctx.fillRect(
                toMiniX(c.x - c.halfW),
                toMiniY(c.z - c.halfD),
                ((c.halfW * 2) / 52) * mw,
                ((c.halfD * 2) / 52) * mh
              );
            });

            // Patient markers
            NPC_STATIONS.forEach((st) => {
              if (!st.caseId) return;
              const done = completedRef.current.includes(st.caseId);
              mctx.fillStyle = done ? '#3B826E' : '#F59E0B';
              mctx.beginPath();
              mctx.arc(toMiniX(st.x), toMiniY(st.z), 3.2, 0, Math.PI * 2);
              mctx.fill();
            });

            // Player dot
            mctx.fillStyle = '#38BDF8';
            mctx.beginPath();
            mctx.arc(toMiniX(ps.x), toMiniY(ps.z), 4.2, 0, Math.PI * 2);
            mctx.fill();
            mctx.strokeStyle = '#FFFFFF';
            mctx.lineWidth = 1.5;
            mctx.stroke();
          }
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      frameId = window.setTimeout(tick, 0);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerTap);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
      mats.disposeAll();
      weatherSystem.dispose();
      proxyGeo.dispose();
      proxyMat.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const currentWeather = WEATHER_INFO[weather];
  const playerAvatarProfile = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];

  return (
    <div className={embeddedInHud ? 'relative w-full h-full' : 'space-y-6'}>
      {!embeddedInHud && (
        <div className="v18-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="v18-kicker mb-2">Cuaca &amp; Epidemiologi Diorama 3D</span>
            <div className="font-display font-bold text-xl sm:text-2xl text-[#2D2926] leading-tight">
              {currentWeather.label} — {currentWeather.epidemiologyNote}
            </div>
            <p className="text-xs sm:text-sm text-[#2D2926]/70 mt-1">
              {currentWeather.clinicalEffect}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 bg-[#F2EFEB] border-2 border-[#2D2926] p-1.5 shrink-0">
            {(Object.keys(WEATHER_INFO) as WeatherType[]).map((wKey) => {
              const active = weather === wKey;
              return (
                <button
                  key={wKey}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onChangeWeather(wKey);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#FF5A5F] text-white border-2 border-[#2D2926] shadow-[3px_3px_0px_#2D2926]'
                      : 'bg-white text-[#2D2926] border-2 border-transparent hover:border-[#2D2926]/40'
                  }`}
                >
                  {WEATHER_ICONS[wKey]}
                  <span>{WEATHER_INFO[wKey].label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* True 3D Isometric Diorama WebGL Viewport */}
      <div
        ref={viewportSectionRef}
        className={
          embeddedInHud
            ? 'relative overflow-hidden bg-[#16302B] select-none w-full h-full'
            : 'relative overflow-hidden v18-card bg-[#E7E2D8] select-none h-[340px] sm:h-[460px] lg:h-[540px]'
        }
      >
        {/* Isolated empty WebGL mount container */}
        <div ref={mountRef} className="w-full h-full cursor-pointer" />

        {/* Legacy standalone guidance HUD (hidden when unified GameHUD is overlaid) */}
        {!embeddedInHud && (
          <div className="pointer-events-none absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#2D2926] text-white px-3 py-1.5 sm:px-3.5 sm:py-2 border-2 border-white/80 shadow-[4px_4px_0px_rgba(45,41,38,0.45)] text-xs max-w-[54%] sm:max-w-[60%]">
            <div className="font-display font-bold text-sm sm:text-base leading-none text-[#FFD166] truncate">
              {playerAvatarProfile.name} · {timePhaseLabel}
            </div>
            <div className="text-[10px] sm:text-[11px] text-white/90 mt-1 line-clamp-2">
              Analog / WASD untuk bergerak · Klik warga (!) untuk memeriksa
            </div>
          </div>
        )}

        {/* Live Mini-Map (positioned cleanly beside HUD rails when embeddedInHud is active) */}
        <div
          className={
            embeddedInHud
              ? 'hidden md:flex absolute top-16 right-[92px] z-10 flex-col items-end gap-1 pointer-events-none'
              : 'absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex flex-col items-end gap-1.5 sm:gap-2'
          }
        >
          <div className="pointer-events-none overflow-hidden rounded-xl border-2 border-[#E8BC74] shadow-[0_4px_0_#3E210F] bg-[#2D2926]">
            <canvas
              ref={minimapRef}
              width={132}
              height={132}
              className={embeddedInHud ? 'block w-[92px] h-auto' : 'block w-[76px] sm:w-[112px] h-auto'}
            />
            <div className="px-2 py-0.5 bg-[#3E210F] text-[10px] font-mono text-[#FFF8E6] flex items-center justify-between gap-2">
              <span>{embeddedInHud ? timePhaseLabel.split(' ')[0] : 'Pulau 3D'}</span>
              <span className="tabular-nums text-[#FFD166] font-bold">
                {completedCases.length}/{CASES.length}
              </span>
            </div>
          </div>

          {!embeddedInHud && (
            <div className="flex gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  const cur = dayPhaseRef.current;
                  const stops = [0.08, 0.28, 0.56, 0.82];
                  const nextStop = stops.find((s) => s > cur + 0.06) ?? stops[0];
                  targetPhaseRef.current = nextStop;
                }}
                className="v18-btn min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] bg-white hover:bg-[#FFD166] text-[#2D2926] flex items-center justify-center cursor-pointer"
                title="Lanjutkan transisi waktu (Pagi / Siang / Senja / Malam)"
                aria-label="Lanjutkan transisi waktu desa"
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  const next = !ambientMuted;
                  setAmbientMuted(next);
                  villageAmbientAudio.setLocalMuted(next);
                  if (!next) villageAmbientAudio.start(weatherRef.current);
                }}
                className={`v18-btn min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center cursor-pointer ${
                  ambientMuted
                    ? 'bg-white text-[#FF5A5F] hover:bg-[#F2EFEB]'
                    : 'bg-white text-[#2D2926] hover:bg-[#FFD166]'
                }`}
                title={ambientMuted ? 'Aktifkan suara alam desa' : 'Bisukan suara alam desa'}
                aria-label={ambientMuted ? 'Aktifkan suara alam desa' : 'Bisukan suara alam desa'}
              >
                {ambientMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  zoomRef.current = Math.min(1.45, zoomRef.current + 0.15);
                }}
                className="v18-btn min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] bg-white hover:bg-[#FFD166] text-[#2D2926] flex items-center justify-center cursor-pointer"
                aria-label="Perbesar kamera diorama"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  zoomRef.current = Math.max(0.55, zoomRef.current - 0.15);
                }}
                className="v18-btn min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] bg-white hover:bg-[#FFD166] text-[#2D2926] flex items-center justify-center cursor-pointer"
                aria-label="Perkecil kamera diorama"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom-Left Virtual Analog Joystick (tucked cleanly above bottom dock & safe-area when embeddedInHud) */}
        <div
          className={
            embeddedInHud
              ? 'absolute bottom-[64px] left-2 sm:bottom-[86px] sm:left-4 z-20 pb-safe'
              : 'absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20'
          }
        >
          <div className="sm:hidden">
            <VirtualJoystick onVectorChange={handleJoystickVector} size={82} />
          </div>
          <div className="hidden sm:block">
            <VirtualJoystick onVectorChange={handleJoystickVector} size={110} />
          </div>
        </div>

        {/* Bottom-Right Context Action Button when near 3D Villager or Mentor */}
        {nearbyNpc && (
          <div
            className={
              embeddedInHud
                ? 'absolute bottom-[68px] right-2 sm:bottom-[92px] sm:right-4 z-30 pb-safe max-w-[calc(100vw-114px)]'
                : 'absolute bottom-4 right-3 sm:bottom-5 sm:right-4 z-20'
            }
          >
            <button
              type="button"
              onClick={() => interactWithStation(nearbyNpc)}
              className="min-h-[44px] sm:min-h-[50px] max-w-full px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-[#FF5A5F] hover:bg-[#EB494E] border-[2.5px] border-[#FFF8E6] shadow-[0_4px_0_#7F1D1D] text-white font-display font-bold text-sm sm:text-xl inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer"
            >
              {nearbyNpc.caseId ? (
                <>
                  <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">Periksa {CHARACTERS[nearbyNpc.id].name}</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="truncate">Bicara: {CHARACTERS[nearbyNpc.id].name}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Mentor Speech Bubble Overlay when talking in 3D Village */}
        {mentorBubble && (
          <div
            className={
              embeddedInHud
                ? 'bg-[#FAF4E4] border-[3px] border-[#6E4021] rounded-2xl shadow-[0_6px_0_#3E210F] absolute bottom-[156px] left-2.5 right-2.5 sm:bottom-[152px] sm:left-24 sm:right-auto sm:max-w-lg p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3 z-30 pb-safe'
                : 'v18-card-sm absolute bottom-3 left-28 right-3 sm:bottom-4 sm:left-40 sm:max-w-lg p-3 sm:p-3.5 flex items-start gap-3 z-30'
            }
          >
            <CharacterPortrait characterId={mentorBubble.id} emotion={EmotionType.HAPPY} size={48} />
            <p className="text-xs sm:text-sm text-[#2D2926] leading-relaxed flex-1 font-medium">
              {mentorBubble.text}
            </p>
            <button
              type="button"
              onClick={() => setMentorBubble(null)}
              className="min-h-[36px] min-w-[36px] rounded-lg inline-flex items-center justify-center border-2 border-transparent hover:border-[#2D2926] hover:bg-[#F2EFEB] text-[#2D2926] cursor-pointer"
              aria-label="Tutup pesan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Legacy Patient Roster Cards Below (omitted in full-viewport GameHUD mode) */}
      {!embeddedInHud && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="v18-kicker">Daftar Pasien &amp; Kios Desa</span>
            <h3 className="font-display font-bold text-2xl text-[#2D2926]">
              ({completedCases.length}/{CASES.length} Selesai)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#2D2926]/70">
            Klik warga di diorama 3D atau pilih kartu kasus di bawah
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CASES.map((c) => {
            const patient = CHARACTERS[c.patientId];
            const isDone = completedCases.includes(c.id);
            const isActiveMission = !isDone && activeCaseId === c.id;
            const matchesWeather = c.recommendedWeather === weather;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onSelectCase(c);
                }}
                className={`v18-card-sm text-left p-4 transition-transform hover:-translate-y-0.5 flex flex-col justify-between gap-3 min-h-[44px] cursor-pointer ${
                  isActiveMission
                    ? 'bg-[#FFD166]/25'
                    : isDone
                      ? 'bg-white opacity-90'
                      : 'bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#2D2926]/75 mb-2">
                    <span>
                      {patient.name} ({patient.species}) · {c.difficulty}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 border border-[#2D2926] ${
                        isDone
                          ? 'bg-[#E8EFEA] text-[#2C6E63]'
                          : isActiveMission
                            ? 'bg-[#FFD166] text-[#2D2926]'
                            : matchesWeather
                              ? 'bg-[#FF5A5F] text-white'
                              : 'bg-[#F2EFEB] text-[#2D2926]'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isDone
                        ? 'Selesai'
                        : isActiveMission
                          ? 'Misi Aktif (...)'
                          : matchesWeather
                            ? 'Prioritas Cuaca'
                            : 'Menunggu Triase'}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-xl text-[#FF5A5F] leading-snug">
                    {c.title}
                  </h4>
                  <p className="text-xs text-[#2D2926]/75 mt-1.5 leading-relaxed line-clamp-2">
                    {c.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t-2 border-dashed border-[#2D2926]/15 text-xs font-bold text-[#2D2926]">
                  <span>{c.diagnosis}</span>
                  <span className="font-mono tabular-nums bg-[#FFD166] px-2 py-0.5 border border-[#2D2926]">
                    +{c.xpReward} XP
                  </span>
                </div>
              </button>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};
