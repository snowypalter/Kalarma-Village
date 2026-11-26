import * as THREE from 'three';
import { CHARACTERS } from '../data/characters';
import { CharacterId } from '../types/pharmacy';

export type NpcBadgeStatus = 'quest' | 'active' | 'done' | null;

export interface ChibiCharacterRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftFoot: THREE.Object3D;
  rightFoot: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  tail: THREE.Object3D | null;
  statusGroup: THREE.Group | null;
  statusType: NpcBadgeStatus;
  activeDots: THREE.Mesh[];
  updateStatusBadge: (status: NpcBadgeStatus) => void;
}

let cachedContactShadowTex: THREE.CanvasTexture | null = null;

function getContactShadowTexture(): THREE.CanvasTexture {
  if (cachedContactShadowTex) return cachedContactShadowTex;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(16, 34, 24, 0.58)');
    grad.addColorStop(0.55, 'rgba(16, 34, 24, 0.24)');
    grad.addColorStop(1, 'rgba(16, 34, 24, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedContactShadowTex = tex;
  return tex;
}

interface OutfitStyle {
  coatColor: string;
  trimColor: string;
  capeColor: number;
  hasCape: boolean;
  hasApron: boolean;
  furTint?: string;
  themeMode:
    | 'default'
    | 'unequipped'
    | 'adventurer'
    | 'apothecary'
    | 'gardener'
    | 'fisher'
    | 'festival'
    | 'seasonal';
}

function resolveOutfitStyle(
  id: CharacterId,
  isApothecary: boolean,
  isMedic: boolean,
  primaryColor: string,
  secondaryColor: string,
  outfitId?: string | null,
  skinId?: string | null
): OutfitStyle {
  if (isApothecary && skinId) {
    switch (skinId) {
      case 'skin_adventurer':
        return {
          coatColor: '#4E7A45',
          trimColor: '#C68B45',
          capeColor: 0x3b5f34,
          hasCape: true,
          hasApron: false,
          themeMode: 'adventurer',
        };
      case 'skin_apothecary':
        return {
          coatColor: '#FAF4E4',
          trimColor: '#2C6E63',
          capeColor: 0x2c6e63,
          hasCape: true,
          hasApron: false,
          themeMode: 'apothecary',
        };
      case 'skin_gardener':
        return {
          coatColor: '#E5D3B3',
          trimColor: '#639E55',
          capeColor: 0x528846,
          hasCape: false,
          hasApron: true,
          themeMode: 'gardener',
        };
      case 'skin_fisher':
        return {
          coatColor: '#2E6799',
          trimColor: '#E8BC74',
          capeColor: 0x204d74,
          hasCape: false,
          hasApron: true,
          themeMode: 'fisher',
        };
      case 'skin_festival':
        return {
          coatColor: '#B83B45',
          trimColor: '#F7C948',
          capeColor: 0x8f242e,
          hasCape: true,
          hasApron: false,
          themeMode: 'festival',
        };
      case 'skin_seasonal':
        return {
          coatColor: '#5B4B8A',
          trimColor: '#F5E6CA',
          capeColor: 0x423568,
          hasCape: true,
          hasApron: false,
          themeMode: 'seasonal',
        };
    }
  }

  if (isApothecary && outfitId === null && !skinId) {
    return {
      coatColor: primaryColor,
      trimColor: secondaryColor,
      capeColor: 0x6b705c,
      hasCape: false,
      hasApron: false,
      themeMode: 'unequipped',
    };
  }

  if (isApothecary && outfitId) {
    switch (outfitId) {
      case 'adventurer_jerkin':
        return {
          coatColor: '#4F7742',
          trimColor: '#D8A24A',
          capeColor: 0x3a5a30,
          hasCape: true,
          hasApron: false,
          themeMode: 'adventurer',
        };
      case 'botanist_cloak':
      case 'herbal_apron':
      case 'forest_cloak':
        return {
          coatColor: '#3B826E',
          trimColor: '#FFD166',
          capeColor: 0x265946,
          hasCape: true,
          hasApron: true,
          themeMode: 'gardener',
        };
      case 'river_angler_vest':
      case 'scholar_robe':
        return {
          coatColor: '#2563EB',
          trimColor: '#E8BC74',
          capeColor: 0x1d4ed8,
          hasCape: false,
          hasApron: true,
          themeMode: 'fisher',
        };
      case 'festival_haori':
        return {
          coatColor: '#B93844',
          trimColor: '#FDE68A',
          capeColor: 0x8a232d,
          hasCape: true,
          hasApron: false,
          themeMode: 'festival',
        };
      case 'twilight_alchemist':
        return {
          coatColor: '#9A3412',
          trimColor: '#FDE68A',
          capeColor: 0x7c2d12,
          hasCape: true,
          hasApron: false,
          themeMode: 'default',
        };
      case 'seasonal_parka':
        return {
          coatColor: '#5A4A82',
          trimColor: '#F8EFE0',
          capeColor: 0x453766,
          hasCape: true,
          hasApron: false,
          themeMode: 'seasonal',
        };
      case 'grand_apothecary':
      case 'gold_apothecary':
        return {
          coatColor: '#16302B',
          trimColor: '#FFD166',
          capeColor: 0xd99226,
          hasCape: true,
          hasApron: false,
          themeMode: 'apothecary',
        };
      case 'classic_coat':
      default:
        return {
          coatColor: secondaryColor,
          trimColor: '#FAF5E8',
          capeColor: 0x2f8564,
          hasCape: true,
          hasApron: false,
          themeMode: 'apothecary',
        };
    }
  }

  return {
    coatColor: isApothecary ? secondaryColor : isMedic ? '#FBF7ED' : secondaryColor,
    trimColor: isApothecary ? '#FAF5E8' : secondaryColor,
    capeColor: 0x2f8564,
    hasCape: isApothecary,
    hasApron: id === 'mimi' || id === 'milo',
    themeMode: 'default',
  };
}

export function buildChibiCharacter3D(
  id: CharacterId,
  initialStatus: NpcBadgeStatus = null,
  outfitId?: string | null,
  skinId?: string | null,
  accessoryId?: string | null
): ChibiCharacterRig {
  const profile = CHARACTERS[id] || CHARACTERS.sali;
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const isApothecary = id === 'sali' || id === 'kael' || id === 'milo' || id === 'tobi';
  const isMedic = isApothecary || id === 'lios' || id === 'bima' || id === 'hana' || id === 'yuna';
  const isAvian = id === 'bima' || id === 'pipi' || id === 'dodo';

  const outfitStyle = resolveOutfitStyle(
    id,
    isApothecary,
    isMedic,
    profile.primaryColor,
    profile.secondaryColor,
    outfitId,
    skinId
  );

  // Matte Collectible 3D Figure Materials (vinyl/clay matte finish — no glossy plastic shell)
  const furColorObj = new THREE.Color(profile.primaryColor);
  if (isApothecary && skinId === 'skin_seasonal') {
    furColorObj.lerp(new THREE.Color('#F5EFE6'), 0.16);
  } else if (isApothecary && skinId === 'skin_festival') {
    furColorObj.lerp(new THREE.Color('#FFF2DF'), 0.12);
  }

  const furMat = new THREE.MeshStandardMaterial({
    color: furColorObj,
    roughness: 0.78,
    metalness: 0.0,
  });

  const outfitMat = new THREE.MeshStandardMaterial({
    color: outfitStyle.coatColor,
    roughness: 0.84,
    metalness: 0.01,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: outfitStyle.trimColor,
    roughness: 0.78,
    metalness: 0.02,
  });

  const capeMat = new THREE.MeshStandardMaterial({
    color: outfitStyle.capeColor,
    roughness: 0.84,
    metalness: 0.01,
  });

  // Glossy eyes only, so faces look expressive and alive against matte bodies
  const darkEyeMat = new THREE.MeshPhysicalMaterial({
    color: 0x13221d,
    roughness: 0.08,
    metalness: 0.04,
    clearcoat: 0.9,
    clearcoatRoughness: 0.06,
  });

  const shineWhiteMat = new THREE.MeshBasicMaterial({ color: 0xfffef8 });

  const blushMat = new THREE.MeshStandardMaterial({
    color: 0xf08c84,
    roughness: 0.85,
    transparent: true,
    opacity: 0.65,
  });

  const innerEarMat = new THREE.MeshStandardMaterial({
    color:
      id === 'mimi' || id === 'milo' || id === 'geri'
        ? 0xf4b6b8
        : id === 'lili'
          ? 0xfdf5e6
          : 0xf4d9bf,
    roughness: 0.82,
    metalness: 0.0,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x734427,
    roughness: 0.78,
    metalness: 0.02,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd99b38,
    roughness: 0.28,
    metalness: 0.82,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: isApothecary ? 0x7d4526 : isMedic ? 0x2c6e63 : 0x5c3c28,
    roughness: 0.76,
    metalness: 0.02,
  });

  const noseMat = new THREE.MeshStandardMaterial({
    color:
      id === 'bima' || id === 'pipi' || id === 'dodo'
        ? 0xe89b32
        : id === 'koko'
          ? 0x222933
          : id === 'milo' || id === 'mimi'
            ? 0xe87b86
            : 0x3f2b22,
    roughness: 0.64,
    metalness: 0.0,
  });

  // Soft grounded radial AO contact shadow
  const shadowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(1.18, 1.18),
    new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.025;
  root.add(shadowDisc);

  // Species-aware Collectible Feet / Paws / Webbed Feet
  const buildFoot = (xPos: number) => {
    const footGroup = new THREE.Group();
    footGroup.position.set(xPos, 0.095, 0.04);

    if (id === 'dodo') {
      const webbed = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.24, 3), noseMat);
      webbed.scale.set(1.15, 0.35, 1.35);
      webbed.rotation.x = Math.PI / 2;
      webbed.position.set(0, -0.02, 0.05);
      webbed.castShadow = true;
      footGroup.add(webbed);
      return footGroup;
    }

    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), shoeMat);
    boot.scale.set(0.98, 0.74, 1.3);
    boot.castShadow = true;
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.028, 6, 14), leatherMat);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(0, 0.085, -0.02);
    const sole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.14, 0.04, 12),
      new THREE.MeshStandardMaterial({ color: 0xece3d0, roughness: 0.85 })
    );
    sole.scale.set(0.94, 1, 1.24);
    sole.position.y = -0.06;
    footGroup.add(boot, cuff, sole);
    return footGroup;
  };
  const leftFoot = buildFoot(-0.165);
  const rightFoot = buildFoot(0.165);
  bodyGroup.add(leftFoot, rightFoot);

  // Collectible Chibi Body Proportions (stockier for Taro/Geri/Yuna, sleeker for Kael/Riko, fluffy for Sora)
  const torsoRadiusScale =
    id === 'taro' || id === 'geri' || id === 'yuna' || id === 'sora'
      ? 1.12
      : id === 'riko' || id === 'nino'
        ? 0.94
        : 1.0;

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24 * torsoRadiusScale, 0.37 * torsoRadiusScale, 0.56, 20),
    id === 'sora' ? furMat : outfitMat
  );
  torso.position.y = 0.44;
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  // Fluffy sheep wool fleece coat for Sora
  if (id === 'sora') {
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const fleece = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), furMat);
      fleece.position.set(Math.cos(ang) * 0.24, 0.42 + (i % 2) * 0.08, Math.sin(ang) * 0.24);
      fleece.castShadow = true;
      bodyGroup.add(fleece);
    }
  }

  // Leather belt & brass clasp
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.315 * torsoRadiusScale, 0.325 * torsoRadiusScale, 0.08, 20),
    leatherMat
  );
  belt.position.y = 0.335;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.06), brassMat);
  buckle.position.set(0, 0.335, 0.32 * torsoRadiusScale);
  bodyGroup.add(belt, buckle);

  // Soft collar / Scarf trim
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.245 * torsoRadiusScale, 0.06, 8, 20), accentMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.695;
  bodyGroup.add(collar);

  [0.48, 0.58].forEach((by) => {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), brassMat);
    btn.position.set(0.04, by, 0.275 * torsoRadiusScale);
    bodyGroup.add(btn);
  });

  // Front Apron for Milo / Mimi / Herbal Apron outfit
  if (outfitStyle.hasApron) {
    const apron = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.38, 0.48, 14, 1, false, -0.85, 1.7),
      accentMat
    );
    apron.position.set(0, 0.39, 0.02);
    apron.castShadow = true;
    bodyGroup.add(apron);
  }

  // Cozy Short Cape / Cloak on Back
  if (outfitStyle.hasCape) {
    const cape = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.5, 10, 1, false, -0.75, 1.5), capeMat);
    cape.position.set(0, 0.46, -0.22);
    cape.rotation.x = 0.26;
    cape.castShadow = true;
    bodyGroup.add(cape);
  }

  // Cross-Body Leather Medicine Satchel (omitted when skin unequipped or festival robe worn)
  if ((isApothecary && outfitStyle.themeMode !== 'unequipped' && outfitStyle.themeMode !== 'festival') || id === 'alia' || id === 'nino') {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.026, 6, 18), leatherMat);
    strap.position.set(0, 0.49, 0.02);
    strap.rotation.y = Math.PI / 2;
    strap.rotation.x = 0.55;
    const satchel = new THREE.Mesh(
      new THREE.BoxGeometry(0.19, 0.17, 0.11),
      id === 'nino' ? new THREE.MeshStandardMaterial({ color: 0xd9382e, roughness: 0.72 }) : leatherMat
    );
    satchel.position.set(0.33, 0.34, 0.08);
    satchel.rotation.z = -0.15;
    satchel.castShadow = true;
    const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 6), brassMat);
    clasp.position.set(0.37, 0.34, 0.12);
    bodyGroup.add(strap, satchel, clasp);
  }

  // Distinct 3D Skin & Theme Torso Geometry
  if (isApothecary && outfitStyle.themeMode === 'adventurer') {
    // Explorer backpack with rolled canvas blanket on back
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.2), leatherMat);
    pack.position.set(0, 0.46, -0.34);
    pack.castShadow = true;
    const bedroll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.42, 10),
      new THREE.MeshStandardMaterial({ color: 0xc9a86c, roughness: 0.86 })
    );
    bedroll.rotation.z = Math.PI / 2;
    bedroll.position.set(0, 0.68, -0.34);
    bedroll.castShadow = true;
    bodyGroup.add(pack, bedroll);
  } else if (isApothecary && outfitStyle.themeMode === 'fisher') {
    // Woven wicker creel fish basket at left hip
    const creel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.15, 0.24, 10),
      new THREE.MeshStandardMaterial({ color: 0xb98548, roughness: 0.86 })
    );
    creel.position.set(-0.36, 0.32, 0.02);
    creel.castShadow = true;
    bodyGroup.add(creel);
  } else if (isApothecary && outfitStyle.themeMode === 'festival') {
    // Wide gold Obi sash & back festival bow + glowing lantern waist charm
    const obi = new THREE.Mesh(
      new THREE.CylinderGeometry(0.335 * torsoRadiusScale, 0.35 * torsoRadiusScale, 0.16, 20),
      accentMat
    );
    obi.position.y = 0.36;
    const bowBack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.12), accentMat);
    bowBack.position.set(0, 0.38, -0.34);
    bowBack.castShadow = true;
    const charmLantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 10, 8),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.65,
        roughness: 0.4,
      })
    );
    charmLantern.position.set(-0.35, 0.34, 0.12);
    bodyGroup.add(obi, bowBack, charmLantern);
  } else if (isApothecary && outfitStyle.themeMode === 'seasonal') {
    // Plush cream fur-trimmed collar & lower hem trim
    const furTrimMat = new THREE.MeshStandardMaterial({ color: 0xf8f1e4, roughness: 0.92 });
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const collarPuff = new THREE.Mesh(new THREE.SphereGeometry(0.088, 8, 8), furTrimMat);
      collarPuff.position.set(Math.cos(ang) * 0.24, 0.69, Math.sin(ang) * 0.24);
      const hemPuff = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 8), furTrimMat);
      hemPuff.position.set(Math.cos(ang) * 0.33, 0.2, Math.sin(ang) * 0.33);
      bodyGroup.add(collarPuff, hemPuff);
    }
  } else if (isApothecary && outfitStyle.themeMode === 'gardener') {
    // Seed pouch with sprouting green leaf at belt
    const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), leatherMat);
    pouch.position.set(-0.32, 0.34, 0.1);
    const sprout = new THREE.Mesh(
      new THREE.ConeGeometry(0.045, 0.14, 5),
      new THREE.MeshStandardMaterial({ color: 0x62b34c, roughness: 0.8 })
    );
    sprout.position.set(-0.32, 0.46, 0.12);
    bodyGroup.add(pouch, sprout);
  } else if (isApothecary && outfitStyle.themeMode === 'apothecary') {
    // Emerald clinic crest pin on lapel
    const badgeBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.025, 12),
      new THREE.MeshStandardMaterial({ color: 0x2c6e63, roughness: 0.6 })
    );
    badgeBase.rotation.x = Math.PI / 2;
    badgeBase.position.set(-0.14, 0.54, 0.285 * torsoRadiusScale);
    bodyGroup.add(badgeBase);
  }

  // Role-specific torso details
  if (id === 'kael') {
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.072, 10, 18), capeMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 0.695;
    const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.05), capeMat);
    scarfTail.position.set(0.15, 0.56, 0.26);
    scarfTail.rotation.z = -0.25;
    bodyGroup.add(scarf, scarfTail);
  } else if (id === 'bima' || id === 'lios') {
    const stethLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.23, 0.025, 8, 18, Math.PI * 1.45),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 })
    );
    stethLoop.position.set(0, 0.64, 0.06);
    stethLoop.rotation.x = Math.PI / 2.4;
    stethLoop.rotation.z = -Math.PI * 0.22;
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 12), brassMat);
    bell.rotation.x = Math.PI / 2;
    bell.position.set(-0.08, 0.49, 0.29);
    bodyGroup.add(stethLoop, bell);
  } else if (id === 'sekar') {
    // Detailed Tortoise Shell on back with hexagonal crest plates
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x45734c, roughness: 0.82 })
    );
    shell.rotation.x = -Math.PI / 2.15;
    shell.position.set(0, 0.44, -0.18);
    shell.castShadow = true;
    const shellRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.05, 8, 18),
      new THREE.MeshStandardMaterial({ color: 0xd4b483, roughness: 0.82 })
    );
    shellRim.rotation.x = -Math.PI / 2.15 + Math.PI / 2;
    shellRim.position.set(0, 0.43, -0.16);
    const scute = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.19, 0.08, 6),
      new THREE.MeshStandardMaterial({ color: 0x355c3c, roughness: 0.85 })
    );
    scute.rotation.x = -Math.PI / 2.15 + Math.PI / 2;
    scute.position.set(0, 0.47, -0.53);
    bodyGroup.add(shell, shellRim, scute);
  } else if (id === 'geri') {
    const bowMat = new THREE.MeshStandardMaterial({ color: 0xd9382e, roughness: 0.72 });
    const bowL = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.11, 4), bowMat);
    bowL.rotation.z = -Math.PI / 2;
    bowL.position.set(-0.06, 0.66, 0.27 * torsoRadiusScale);
    const bowR = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.11, 4), bowMat);
    bowR.rotation.z = Math.PI / 2;
    bowR.position.set(0.06, 0.66, 0.27 * torsoRadiusScale);
    bodyGroup.add(bowL, bowR);
  } else if (id === 'pipi' || id === 'lili' || id === 'sora') {
    const shawl = new THREE.Mesh(
      new THREE.TorusGeometry(0.26 * torsoRadiusScale, 0.08, 8, 18),
      new THREE.MeshStandardMaterial({
        color: id === 'lili' ? 0xf7c954 : id === 'sora' ? 0xe07a5f : 0xf29eb4,
        roughness: 0.84,
      })
    );
    shawl.rotation.x = Math.PI / 2;
    shawl.position.y = 0.67;
    bodyGroup.add(shawl);
  }

  // Shoulder-pivoted Animal Arms / Feathered Wings + Handheld Props
  const buildArm = (side: -1 | 1) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * (0.3 * torsoRadiusScale), 0.6, 0);
    armGroup.rotation.z = side * 0.32;

    if (isAvian) {
      const wing = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), furMat);
      wing.scale.set(0.55, 1.65, 0.95);
      wing.position.set(side * 0.03, -0.15, 0);
      wing.castShadow = true;
      armGroup.add(wing);
      return armGroup;
    }

    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.16, 6, 10), outfitMat);
    sleeve.position.y = -0.1;
    sleeve.castShadow = true;

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.096, 0.096, 0.048, 10), accentMat);
    cuff.position.y = -0.19;

    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.084, 12, 10), furMat);
    paw.position.y = -0.255;
    paw.castShadow = true;

    armGroup.add(sleeve, cuff, paw);
    return armGroup;
  };
  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Species-specific & Role-specific Miniature Matte Props
  if (id === 'sali') {
    // Glowing Healing Potion Flask in right hand + Herbal Notebook in left
    const vial = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 8),
      new THREE.MeshPhysicalMaterial({ color: 0x67e8f9, roughness: 0.25, clearcoat: 0.6 })
    );
    vial.position.set(0.02, -0.26, 0.12);
    const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.05, 8), leatherMat);
    cork.position.set(0.02, -0.16, 0.12);
    rightArm.add(vial, cork);
  } else if (id === 'kael') {
    // Explorer Herbal Staff + Brass Compass
    const staffShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.54, 8), leatherMat);
    staffShaft.rotation.x = Math.PI / 2.6;
    staffShaft.position.set(0.02, -0.25, 0.16);
    staffShaft.castShadow = true;
    const leafHead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), capeMat);
    leafHead.scale.set(1, 1.25, 0.5);
    leafHead.position.set(0.02, -0.16, 0.39);
    rightArm.add(staffShaft, leafHead);
  } else if (id === 'milo') {
    // Wooden Mortar & Pestle in hand
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.07, 0.13, 10), leatherMat);
    bowl.position.set(-0.02, -0.25, 0.12);
    const pestle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.16, 6), accentMat);
    pestle.position.set(0.01, -0.18, 0.13);
    pestle.rotation.z = -0.35;
    leftArm.add(bowl, pestle);
  } else if (id === 'tobi') {
    // Brass Magnifying Glass in right hand
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.22, 6), leatherMat);
    handle.rotation.x = Math.PI / 3;
    handle.position.set(0.02, -0.25, 0.12);
    const lensRim = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 14), brassMat);
    lensRim.position.set(0.02, -0.17, 0.24);
    rightArm.add(handle, lensRim);
  } else if (id === 'hana' || id === 'bima' || id === 'yuna') {
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.03), leatherMat);
    board.position.set(0.03, -0.26, 0.12);
    board.rotation.x = -0.4;
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.035), shineWhiteMat);
    sheet.position.set(0.03, -0.26, 0.125);
    sheet.rotation.x = -0.4;
    rightArm.add(board, sheet);
  } else if (id === 'sekar' || id === 'lios') {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.075, 0.14, 10), brassMat);
    pot.position.set(-0.02, -0.26, 0.12);
    leftArm.add(pot);
    if (id === 'sekar') {
      const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.65, 7), leatherMat);
      cane.position.set(0.02, -0.35, 0.12);
      rightArm.add(cane);
    }
  } else if (id === 'nino' || id === 'cici') {
    const letter = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.14, 0.045),
      id === 'cici' ? new THREE.MeshStandardMaterial({ color: 0x2c6e63, roughness: 0.78 }) : shineWhiteMat
    );
    letter.position.set(0.02, -0.26, 0.12);
    const seal = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshBasicMaterial({ color: 0xd9382e }));
    seal.position.set(0.02, -0.26, 0.145);
    rightArm.add(letter, seal);
  } else if (id === 'dodo') {
    const paddleShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.56, 6), leatherMat);
    paddleShaft.position.set(0.05, -0.25, 0.1);
    paddleShaft.rotation.x = 0.25;
    const paddleBlade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.03), accentMat);
    paddleBlade.position.set(0.05, -0.5, 0.16);
    paddleBlade.rotation.x = 0.25;
    rightArm.add(paddleShaft, paddleBlade);
  } else if (id === 'taro') {
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 8), brassMat);
    lantern.position.set(0.02, -0.27, 0.13);
    const glowCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.048, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfde68a })
    );
    glowCore.position.set(0.02, -0.27, 0.13);
    rightArm.add(lantern, glowCore);
  } else if (id === 'sora') {
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.14, 10), leatherMat);
    basket.position.set(0.02, -0.27, 0.12);
    const yarnBall = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), accentMat);
    yarnBall.position.set(0.02, -0.2, 0.12);
    rightArm.add(basket, yarnBall);
  }

  bodyGroup.add(leftArm, rightArm);

  // Collectible Chibi Animal Head Group (y = 0.72) — ZERO human hair bangs!
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.72;
  bodyGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.415, 22, 18);
  // Distinct species skull proportions (axolotl wide, bird oval, capybara long, bear broad)
  if (id === 'sali') headGeo.scale(1.18, 0.9, 1.0);
  else if (id === 'yuna') headGeo.scale(1.04, 0.94, 1.18);
  else if (isAvian) headGeo.scale(1.02, 0.96, 1.0);
  else if (id === 'taro' || id === 'geri') headGeo.scale(1.12, 0.96, 1.02);
  else headGeo.scale(1.06, 0.95, 0.98);

  const head = new THREE.Mesh(headGeo, furMat);
  head.position.y = 0.26;
  head.castShadow = true;
  head.receiveShadow = true;
  headGroup.add(head);

  // Glossy Expressive Animal Eyes + Rosy Cheeks
  const eyeSocketGeo = new THREE.SphereGeometry(
    id === 'tobi' ? 0.088 : id === 'sali' ? 0.062 : 0.066,
    14,
    14
  );
  if (id === 'yuna') {
    eyeSocketGeo.scale(1.15, 0.65, 0.45); // Calm serene capybara eyes
  } else if (id === 'tobi') {
    eyeSocketGeo.scale(1.0, 1.0, 0.85); // Chameleon round turret eyes
  } else {
    eyeSocketGeo.scale(0.88, 1.38, 0.46);
  }
  const eyeHighlightGeo = new THREE.SphereGeometry(0.022, 8, 8);
  const cheekGeo = new THREE.SphereGeometry(0.072, 10, 8);
  cheekGeo.scale(1.3, 0.76, 0.4);
  const browGeo = new THREE.CapsuleGeometry(0.014, 0.07, 4, 6);

  const eyeSpacing = id === 'sali' ? 0.185 : id === 'tobi' ? 0.175 : 0.148;
  [-1, 1].forEach((side) => {
    // Chameleon Tobi gets iconic ringed turret eyes
    if (id === 'tobi') {
      const turret = new THREE.Mesh(
        new THREE.TorusGeometry(0.082, 0.025, 8, 14),
        new THREE.MeshStandardMaterial({ color: 0x84c99b, roughness: 0.72 })
      );
      turret.position.set(side * eyeSpacing, 0.285, 0.365);
      headGroup.add(turret);
    }

    const eyeBall = new THREE.Mesh(eyeSocketGeo, darkEyeMat);
    eyeBall.position.set(side * eyeSpacing, 0.275, 0.375);

    const catchlight = new THREE.Mesh(eyeHighlightGeo, shineWhiteMat);
    catchlight.position.set(side * eyeSpacing - 0.015, 0.315, 0.408);

    const microSpark = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), shineWhiteMat);
    microSpark.position.set(side * eyeSpacing + 0.016, 0.23, 0.404);

    const cheek = new THREE.Mesh(cheekGeo, blushMat);
    cheek.position.set(side * (eyeSpacing + 0.095), 0.165, 0.325);
    cheek.rotation.y = side * 0.46;

    headGroup.add(eyeBall, catchlight, microSpark, cheek);

    if (id !== 'yuna') {
      const brow = new THREE.Mesh(browGeo, noseMat);
      brow.position.set(side * eyeSpacing, 0.41, 0.355);
      brow.rotation.z = Math.PI / 2 + side * (id === 'bima' ? -0.18 : 0.12);
      headGroup.add(brow);
    }
  });

  // Species-specific Muzzles, Snouts, Trunks & Beaks
  if (id === 'geri') {
    const trunkUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.052, 0.24, 10), furMat);
    trunkUpper.position.set(0, 0.16, 0.43);
    trunkUpper.rotation.x = Math.PI / 3.4;
    const trunkTip = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.04, 0.18, 10), furMat);
    trunkTip.position.set(0, 0.07, 0.54);
    trunkTip.rotation.x = Math.PI / 6;
    [-0.1, 0.1].forEach((tx) => {
      const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.11, 8), shineWhiteMat);
      tusk.rotation.x = Math.PI / 2.3;
      tusk.position.set(tx, 0.12, 0.44);
      headGroup.add(tusk);
    });
    headGroup.add(trunkUpper, trunkTip);
  } else if (isAvian) {
    if (id === 'dodo') {
      const duckBill = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 8), noseMat);
      duckBill.scale.set(1.38, 0.44, 1.2);
      duckBill.position.set(0, 0.17, 0.46);
      headGroup.add(duckBill);
    } else {
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.078, 0.17, 6), noseMat);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 0.19, 0.45);
      headGroup.add(beak);
    }
    if (id === 'bima') {
      [-1, 1].forEach((side) => {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 14), innerEarMat);
        disc.rotation.x = Math.PI / 2;
        disc.position.set(side * 0.13, 0.265, 0.355);
        headGroup.add(disc);
      });
    }
  } else if (id === 'sali') {
    // Axolotl wide cute smile & tiny nostrils (no mammalian snout!)
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.014, 6, 12, Math.PI), noseMat);
    smile.rotation.z = Math.PI;
    smile.position.set(0, 0.17, 0.4);
    headGroup.add(smile);
  } else if (id === 'kael' || id === 'alia') {
    // Tapered canine/fox muzzle
    const muzzle = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 10), innerEarMat);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0.16, 0.42);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.044, 8, 8), noseMat);
    nose.position.set(0, 0.185, 0.52);
    headGroup.add(muzzle, nose);
  } else if (id === 'yuna') {
    // Boxy-rounded capybara nose bridge
    const capySnout = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), furMat);
    capySnout.scale.set(1.15, 0.85, 1.05);
    capySnout.position.set(0, 0.175, 0.39);
    const capyNose = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), noseMat);
    capyNose.position.set(0, 0.22, 0.52);
    headGroup.add(capySnout, capyNose);
  } else {
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.125, 12, 10), innerEarMat);
    snout.scale.set(1.25, 0.78, 0.78);
    snout.position.set(0, 0.165, 0.36);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(id === 'koko' ? 0.068 : 0.045, 10, 8), noseMat);
    nose.scale.set(1.15, id === 'koko' ? 1.42 : 0.85, 0.9);
    nose.position.set(0, 0.21, 0.45);
    headGroup.add(snout, nose);

    if (id === 'bobi') {
      [-0.026, 0.026].forEach((tx) => {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.052, 0.02), shineWhiteMat);
        tooth.position.set(tx, 0.12, 0.445);
        headGroup.add(tooth);
      });
    }
    if (id === 'mimi') {
      [-1, 1].forEach((side) => {
        [-0.03, 0.03].forEach((wy) => {
          const whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 4), noseMat);
          whisker.rotation.z = Math.PI / 2 + side * wy * 3.5;
          whisker.position.set(side * 0.22, 0.17 + wy, 0.38);
          headGroup.add(whisker);
        });
      });
    }
  }

  // Distinct Species Ears, Gills, Antlers, Casques & Hats
  if (id === 'milo') {
    const earGeo = new THREE.CapsuleGeometry(0.092, 0.4, 8, 12);
    const innerGeo = new THREE.CapsuleGeometry(0.048, 0.28, 6, 8);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(side * 0.2, 0.74, 0.02);
      ear.rotation.z = -side * (side === 1 ? 0.36 : 0.16);
      ear.castShadow = true;
      const inner = new THREE.Mesh(innerGeo, innerEarMat);
      inner.position.set(side * 0.2, 0.74, 0.082);
      inner.rotation.z = -side * (side === 1 ? 0.36 : 0.16);
      headGroup.add(ear, inner);
    });
  } else if (id === 'sali') {
    // Signature 3-branch feathered Axolotl gills
    const gillMat = new THREE.MeshStandardMaterial({
      color: 0xec8e8e,
      roughness: 0.74,
    });
    const gillGeo = new THREE.CapsuleGeometry(0.046, 0.2, 5, 8);
    [-1, 1].forEach((side) => {
      [-0.25, 0, 0.25].forEach((rotZ, idx) => {
        const g = new THREE.Mesh(gillGeo, gillMat);
        g.position.set(side * 0.49, 0.25 + (idx - 1) * 0.1, 0);
        g.rotation.z = side * (Math.PI / 2 + rotZ);
        g.castShadow = true;
        headGroup.add(g);
      });
    });
  } else if (id === 'kael' || id === 'alia' || id === 'mimi' || id === 'cici') {
    const earScale = id === 'alia' ? 1.55 : id === 'kael' ? 1.2 : 1.08;
    const earGeo = new THREE.ConeGeometry(0.12 * earScale, 0.31 * earScale, 4);
    const innerGeo = new THREE.ConeGeometry(0.07 * earScale, 0.21 * earScale, 4);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(side * 0.24, 0.63, 0.02);
      ear.rotation.z = -side * 0.28;
      ear.castShadow = true;
      const inner = new THREE.Mesh(innerGeo, innerEarMat);
      inner.position.set(side * 0.24, 0.62, 0.065);
      inner.rotation.z = -side * 0.28;
      headGroup.add(ear, inner);
    });
    // Small apothecary badge beret for Kael when wearing scholar/gold outfit
    if (id === 'kael') {
      const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.05, 12), capeMat);
      badge.position.set(0, 0.64, -0.02);
      headGroup.add(badge);
    }
  } else if (id === 'koko' || id === 'geri' || id === 'bobi' || id === 'lili' || id === 'taro') {
    const r = id === 'geri' ? 0.3 : id === 'koko' ? 0.19 : 0.13;
    const earGeo = new THREE.SphereGeometry(r, 12, 10);
    earGeo.scale(1, 1, 0.45);
    const innerGeo = new THREE.SphereGeometry(r * 0.62, 10, 8);
    innerGeo.scale(1, 1, 0.45);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(side * (0.41 + r * 0.18), id === 'lili' || id === 'taro' ? 0.46 : 0.32, -0.02);
      ear.castShadow = true;
      const inner = new THREE.Mesh(innerGeo, innerEarMat);
      inner.position.set(side * (0.41 + r * 0.18), id === 'lili' || id === 'taro' ? 0.46 : 0.32, 0.025);
      headGroup.add(ear, inner);
    });
    if (id === 'lili') {
      // Red panda cream cheek & brow patches
      [-1, 1].forEach((side) => {
        const browDot = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), innerEarMat);
        browDot.position.set(side * 0.14, 0.39, 0.37);
        headGroup.add(browDot);
      });
    }
  } else if (id === 'tobi' || id === 'riko') {
    // Chameleon casque / Iguana dorsal spine crest
    if (id === 'tobi') {
      const casque = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.38, 6), furMat);
      casque.position.set(0, 0.56, -0.14);
      casque.rotation.x = -0.58;
      casque.castShadow = true;
      headGroup.add(casque);
    }
    [0, -0.11, -0.22].forEach((zOff, idx) => {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.078 - idx * 0.014, 0.21 - idx * 0.03, 6),
        capeMat
      );
      spike.position.set(0, 0.67 - idx * 0.06, zOff - 0.02);
      spike.rotation.x = -0.35 - idx * 0.25;
      headGroup.add(spike);
    });
    if (id === 'riko') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.035, 6, 20), capeMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.43;
      headGroup.add(band);
    }
  } else if (id === 'lios') {
    const quillMat = new THREE.MeshStandardMaterial({ color: 0x5c4b3b, roughness: 0.85 });
    const quillCoords: [number, number, number, number, number][] = [
      [0, 0.56, -0.2, -0.55, 0],
      [-0.22, 0.5, -0.17, -0.45, 0.35],
      [0.22, 0.5, -0.17, -0.45, -0.35],
      [-0.33, 0.34, -0.18, -0.4, 0.55],
      [0.33, 0.34, -0.18, -0.4, -0.55],
      [0, 0.38, -0.34, -0.9, 0],
    ];
    quillCoords.forEach(([qx, qy, qz, rx, rz]) => {
      const quill = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 7), quillMat);
      quill.position.set(qx, qy, qz);
      quill.rotation.set(rx, 0, rz);
      quill.castShadow = true;
      headGroup.add(quill);
    });
  } else if (id === 'sekar') {
    const hatBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.55, 0.045, 20),
      new THREE.MeshStandardMaterial({ color: 0xd9ba88, roughness: 0.86 })
    );
    hatBrim.position.y = 0.57;
    hatBrim.castShadow = true;
    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.34, 0.06, 16), accentMat);
    hatBand.position.y = 0.61;
    const hatTop = new THREE.Mesh(
      new THREE.ConeGeometry(0.33, 0.24, 16),
      new THREE.MeshStandardMaterial({ color: 0xc9a36b, roughness: 0.86 })
    );
    hatTop.position.y = 0.72;
    headGroup.add(hatBrim, hatBand, hatTop);
  } else if (id === 'hana') {
    // Spotted Fawn Ears + Tiny Antler Buds + Nurse Cap
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.15, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xfaf9f5, roughness: 0.78 })
    );
    cap.position.set(0, 0.64, 0.06);
    const redMat = new THREE.MeshStandardMaterial({ color: 0x26926b, roughness: 0.7 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.085, 0.03), redMat);
    crossV.position.set(0, 0.64, 0.155);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.032, 0.03), redMat);
    crossH.position.set(0, 0.64, 0.155);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.18, 4, 8), furMat);
      ear.position.set(side * 0.44, 0.42, -0.02);
      ear.rotation.z = side * 1.02;
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 6), innerEarMat);
      spot.position.set(side * 0.2, 0.48, 0.24);
      headGroup.add(ear, spot);
    });
    headGroup.add(cap, crossV, crossH);
  } else if (id === 'bima') {
    [-1, 1].forEach((side) => {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 5), noseMat);
      tuft.position.set(side * 0.29, 0.6, 0.02);
      tuft.rotation.z = -side * 0.45;
      headGroup.add(tuft);
    });
  } else if (id === 'nino') {
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.24, 5), furMat);
      ear.position.set(side * 0.24, 0.6, 0);
      ear.rotation.z = -side * 0.25;
      headGroup.add(ear);
    });
  } else if (id === 'pipi') {
    const crest = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), innerEarMat);
    crest.scale.set(1.2, 0.6, 1.3);
    crest.position.set(0, 0.61, 0.04);
    headGroup.add(crest);
  } else if (id === 'yuna') {
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), furMat);
      ear.scale.set(1, 0.8, 0.55);
      ear.position.set(side * 0.32, 0.52, -0.02);
      headGroup.add(ear);
    });
    // Signature calming capybara citrus fruit + herb leaf on head!
    const yuzu = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xf4a432, roughness: 0.62 })
    );
    yuzu.position.set(0, 0.69, 0.02);
    const yuzuLeaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.09, 5),
      new THREE.MeshStandardMaterial({ color: 0x4ea561, roughness: 0.78 })
    );
    yuzuLeaf.position.set(0.04, 0.78, 0.02);
    yuzuLeaf.rotation.z = -0.6;
    headGroup.add(yuzu, yuzuLeaf);
  } else if (id === 'dodo') {
    const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.12, 16), shineWhiteMat);
    capBase.position.set(0, 0.61, 0);
    const capBand = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.045, 16), accentMat);
    capBand.position.set(0, 0.56, 0);
    headGroup.add(capBase, capBand);
  } else if (id === 'sora') {
    const woolMat = new THREE.MeshStandardMaterial({ color: 0xfffef8, roughness: 0.92 });
    [-0.18, 0, 0.18].forEach((wx, idx) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(idx === 1 ? 0.195 : 0.155, 10, 8), woolMat);
      puff.position.set(wx, 0.61, 0.02);
      headGroup.add(puff);
    });
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.16, 4, 8), innerEarMat);
      ear.position.set(side * 0.43, 0.35, 0);
      ear.rotation.z = side * 1.1;
      headGroup.add(ear);
    });
  }

  const accessoryIsHeadwear =
    isApothecary &&
    (accessoryId === 'acc_straw_hat' ||
      accessoryId === 'acc_angler_hat' ||
      accessoryId === 'acc_herb_crown' ||
      accessoryId === 'acc_festival_mask');

  // Skin-based 3D Headgear (when no conflicting accessory hat is equipped)
  if (isApothecary && !accessoryIsHeadwear) {
    if (skinId === 'skin_gardener') {
      const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.56, 0.6, 0.045, 20),
        new THREE.MeshStandardMaterial({ color: 0xdec086, roughness: 0.88 })
      );
      brim.position.y = 0.62;
      brim.castShadow = true;
      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.33, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xd1ad6b, roughness: 0.88 })
      );
      crown.position.y = 0.73;
      const ribbon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.31, 0.32, 0.055, 16),
        new THREE.MeshStandardMaterial({ color: 0x528846, roughness: 0.8 })
      );
      ribbon.position.y = 0.66;
      headGroup.add(brim, crown, ribbon);
    } else if (skinId === 'skin_fisher') {
      const bucketBrim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.56, 0.07, 18),
        new THREE.MeshStandardMaterial({ color: 0x2e6799, roughness: 0.82 })
      );
      bucketBrim.position.y = 0.61;
      bucketBrim.castShadow = true;
      const bucketTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.29, 0.36, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x255680, roughness: 0.82 })
      );
      bucketTop.position.y = 0.72;
      const lurePin = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), brassMat);
      lurePin.position.set(0.24, 0.68, 0.28);
      headGroup.add(bucketBrim, bucketTop, lurePin);
    } else if (skinId === 'skin_adventurer') {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.042, 8, 22),
        new THREE.MeshStandardMaterial({ color: 0xc68b45, roughness: 0.8 })
      );
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.45;
      const feather = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.24, 5),
        new THREE.MeshStandardMaterial({ color: 0x76b947, roughness: 0.8 })
      );
      feather.position.set(0.36, 0.58, -0.05);
      feather.rotation.z = -0.5;
      headGroup.add(band, feather);
    }
  }

  // Wearable 3D Accessories Collection (equips cleanly on any animal character!)
  if (isApothecary && accessoryId) {
    if (accessoryId === 'acc_straw_hat') {
      const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.56, 0.6, 0.045, 20),
        new THREE.MeshStandardMaterial({ color: 0xe3c284, roughness: 0.88 })
      );
      brim.position.y = 0.62;
      brim.castShadow = true;
      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.33, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xd4ae68, roughness: 0.88 })
      );
      crown.position.y = 0.73;
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.31, 0.32, 0.055, 16),
        new THREE.MeshStandardMaterial({ color: 0x4e8f5b, roughness: 0.8 })
      );
      band.position.y = 0.66;
      headGroup.add(brim, crown, band);
    } else if (accessoryId === 'acc_angler_hat') {
      const brim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.56, 0.07, 18),
        new THREE.MeshStandardMaterial({ color: 0x2e6799, roughness: 0.82 })
      );
      brim.position.y = 0.61;
      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.29, 0.36, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0x255680, roughness: 0.82 })
      );
      top.position.y = 0.72;
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), brassMat);
      pin.position.set(0.24, 0.68, 0.28);
      headGroup.add(brim, top, pin);
    } else if (accessoryId === 'acc_herb_crown') {
      const vine = new THREE.Mesh(
        new THREE.TorusGeometry(0.36, 0.038, 8, 22),
        new THREE.MeshStandardMaterial({ color: 0x529f44, roughness: 0.82 })
      );
      vine.rotation.x = Math.PI / 2;
      vine.position.y = 0.58;
      headGroup.add(vine);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const blossom = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 8, 6),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0xf6a9be : 0xfde68a,
            roughness: 0.82,
          })
        );
        blossom.position.set(Math.cos(ang) * 0.37, 0.6, Math.sin(ang) * 0.37);
        headGroup.add(blossom);
      }
    } else if (accessoryId === 'acc_festival_mask') {
      const maskGroup = new THREE.Group();
      maskGroup.position.set(0.31, 0.54, 0.24);
      maskGroup.rotation.set(-0.28, 0.55, -0.2);
      const facePlate = new THREE.Mesh(
        new THREE.SphereGeometry(0.145, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xfff8eb, roughness: 0.72 })
      );
      facePlate.scale.set(1.05, 0.92, 0.36);
      const earL = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.11, 4),
        new THREE.MeshStandardMaterial({ color: 0xd9382e, roughness: 0.72 })
      );
      earL.position.set(-0.08, 0.13, 0);
      const earR = earL.clone();
      earR.position.set(0.08, 0.13, 0);
      maskGroup.add(facePlate, earL, earR);
      headGroup.add(maskGroup);
    } else if (accessoryId === 'acc_explorer_bag' && outfitStyle.themeMode !== 'adventurer') {
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.2), leatherMat);
      pack.position.set(0, 0.46, -0.34);
      pack.castShadow = true;
      const roll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.085, 0.42, 10),
        new THREE.MeshStandardMaterial({ color: 0xd8b467, roughness: 0.86 })
      );
      roll.rotation.z = Math.PI / 2;
      roll.position.set(0, 0.68, -0.34);
      bodyGroup.add(pack, roll);
    } else if (accessoryId === 'acc_knit_scarf') {
      const scarfMat = new THREE.MeshStandardMaterial({ color: 0xc84b52, roughness: 0.88 });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.285 * torsoRadiusScale, 0.08, 10, 20), scarfMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.71;
      const tailEnd = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.28, 0.055), scarfMat);
      tailEnd.position.set(-0.16, 0.56, 0.27);
      tailEnd.rotation.z = 0.22;
      bodyGroup.add(ring, tailEnd);
    } else if (accessoryId === 'acc_apothecary_lantern') {
      const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 8), brassMat);
      lanternBody.position.set(-0.03, -0.28, 0.14);
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.052, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.85,
          roughness: 0.35,
        })
      );
      glow.position.set(-0.03, -0.28, 0.14);
      leftArm.add(lanternBody, glow);
    }
  }

  // Round Brass Spectacles for scholarly/clinical animals OR when acc_round_glasses is equipped
  const showSpectacles =
    (isApothecary && accessoryId === 'acc_round_glasses') ||
    (!isApothecary && (id === 'lios' || id === 'bima' || id === 'cici' || id === 'yuna')) ||
    ((id === 'sali' || id === 'tobi') && accessoryId === null && outfitStyle.themeMode !== 'unequipped');

  if (showSpectacles) {
    const ringGeo = new THREE.TorusGeometry(0.098, 0.015, 8, 16);
    const lg = new THREE.Mesh(ringGeo, brassMat);
    lg.position.set(-eyeSpacing, 0.275, 0.405);
    const rg = new THREE.Mesh(ringGeo, brassMat);
    rg.position.set(eyeSpacing, 0.275, 0.405);
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.11, 6), brassMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.285, 0.41);
    headGroup.add(lg, rg, bridge);
  }

  // Dark bandit eye mask for raccoon Cici
  if (id === 'cici') {
    const maskMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.8 });
    const maskGeo = new THREE.SphereGeometry(0.11, 10, 8);
    maskGeo.scale(1.15, 0.85, 0.35);
    [-1, 1].forEach((side) => {
      const patch = new THREE.Mesh(maskGeo, maskMat);
      patch.position.set(side * 0.148, 0.275, 0.36);
      headGroup.add(patch);
    });
  }

  // Distinct Sculpted Animal Tails
  let tail: THREE.Object3D | null = null;
  if (id === 'milo') {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), shineWhiteMat);
    puff.position.set(0, 0.24, -0.36);
    bodyGroup.add(puff);
    tail = puff;
  } else if (id === 'nino' || id === 'alia' || id === 'kael') {
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.28, -0.33);
    const mainTail = new THREE.Mesh(
      new THREE.CapsuleGeometry(id === 'nino' ? 0.13 : 0.105, id === 'nino' ? 0.34 : 0.28, 6, 10),
      furMat
    );
    mainTail.position.set(0, id === 'nino' ? 0.2 : 0.14, -0.13);
    mainTail.rotation.x = id === 'nino' ? -0.32 : -0.95;
    mainTail.castShadow = true;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 8), innerEarMat);
    tip.position.set(0, id === 'nino' ? 0.39 : 0.22, id === 'nino' ? -0.2 : -0.26);
    tailGroup.add(mainTail, tip);
    bodyGroup.add(tailGroup);
    tail = tailGroup;
  } else if (id === 'tobi') {
    // Iconic Curled Spiral Chameleon Tail
    const curlTail = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.055, 8, 16, Math.PI * 1.55), furMat);
    curlTail.rotation.y = Math.PI / 2;
    curlTail.position.set(0, 0.28, -0.39);
    curlTail.castShadow = true;
    bodyGroup.add(curlTail);
    tail = curlTail;
  } else if (id === 'bobi') {
    const paddle = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.36, 10), leatherMat);
    paddle.scale.set(1.35, 1, 0.32);
    paddle.position.set(0, 0.2, -0.39);
    paddle.rotation.x = -1.1;
    bodyGroup.add(paddle);
    tail = paddle;
  } else if (id === 'mimi' || id === 'sali' || id === 'lili' || id === 'cici' || id === 'riko') {
    const t = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, id === 'lili' || id === 'cici' ? 0.32 : 0.26, 5, 8),
      furMat
    );
    t.position.set(0, 0.28, -0.37);
    t.rotation.x = -0.85;
    bodyGroup.add(t);
    tail = t;
  } else if (id === 'taro' || id === 'sora') {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), furMat);
    puff.position.set(0, 0.24, -0.36);
    bodyGroup.add(puff);
    tail = puff;
  } else if (isAvian) {
    const fan = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 5), furMat);
    fan.scale.set(1.2, 1, 0.4);
    fan.rotation.x = -Math.PI / 2.2;
    fan.position.set(0, 0.24, -0.38);
    bodyGroup.add(fan);
    tail = fan;
  }

  // Pediatric scale for child patient Lili
  if (id === 'lili') {
    root.scale.setScalar(0.84);
  }

  // Floating 3D Status Marker above head (! quest, ... active/talking, checkmark done)
  const statusGroup = new THREE.Group();
  statusGroup.position.y = 1.9;
  root.add(statusGroup);

  const questExclMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0x991b1b,
    emissiveIntensity: 0.4,
    roughness: 0.42,
  });
  const activeQuestMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0xb45309,
    emissiveIntensity: 0.5,
    roughness: 0.4,
  });
  const doneCheckMat = new THREE.MeshStandardMaterial({
    color: 0x3b826e,
    emissive: 0x1f6e52,
    emissiveIntensity: 0.4,
    roughness: 0.42,
  });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfaf9f5, roughness: 0.45 });

  const discGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.09, 18);
  const exclBarGeo = new THREE.BoxGeometry(0.07, 0.19, 0.12);
  const exclDotGeo = new THREE.BoxGeometry(0.07, 0.06, 0.12);
  const ellipsisDotGeo = new THREE.SphereGeometry(0.044, 8, 8);
  const checkShortGeo = new THREE.BoxGeometry(0.06, 0.12, 0.12);
  const checkLongGeo = new THREE.BoxGeometry(0.06, 0.22, 0.12);
  const activeDots: THREE.Mesh[] = [];

  const buildStatusVisual = (status: NpcBadgeStatus) => {
    while (statusGroup.children.length > 0) {
      statusGroup.remove(statusGroup.children[0]);
    }
    activeDots.length = 0;

    if (!status) {
      statusGroup.visible = false;
      return;
    }
    statusGroup.visible = true;

    const discMat =
      status === 'quest' ? questExclMat : status === 'active' ? activeQuestMat : doneCheckMat;
    const badgeDisc = new THREE.Mesh(discGeo, discMat);
    badgeDisc.rotation.x = Math.PI / 2;
    statusGroup.add(badgeDisc);

    if (status === 'quest') {
      const bar = new THREE.Mesh(exclBarGeo, whiteMat);
      bar.position.y = 0.04;
      const dot = new THREE.Mesh(exclDotGeo, whiteMat);
      dot.position.y = -0.1;
      statusGroup.add(bar, dot);
    } else if (status === 'active') {
      [-0.1, 0, 0.1].forEach((dx) => {
        const dot = new THREE.Mesh(ellipsisDotGeo, whiteMat);
        dot.position.set(dx, 0, 0.05);
        dot.scale.set(1, 1, 0.7);
        statusGroup.add(dot);
        activeDots.push(dot);
      });
    } else {
      const leg1 = new THREE.Mesh(checkShortGeo, whiteMat);
      leg1.position.set(-0.05, -0.02, 0);
      leg1.rotation.z = 0.65;
      const leg2 = new THREE.Mesh(checkLongGeo, whiteMat);
      leg2.position.set(0.05, 0.02, 0);
      leg2.rotation.z = -0.6;
      statusGroup.add(leg1, leg2);
    }
  };

  buildStatusVisual(initialStatus);

  const rig: ChibiCharacterRig = {
    root,
    bodyGroup,
    headGroup,
    leftFoot,
    rightFoot,
    leftArm,
    rightArm,
    tail,
    statusGroup,
    statusType: initialStatus,
    activeDots,
    updateStatusBadge: (next) => {
      if (rig.statusType === next) return;
      rig.statusType = next;
      buildStatusVisual(next);
    },
  };

  return rig;
}
