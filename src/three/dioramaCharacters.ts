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
    grad.addColorStop(0, 'rgba(18, 38, 33, 0.56)');
    grad.addColorStop(0.55, 'rgba(18, 38, 33, 0.25)');
    grad.addColorStop(1, 'rgba(18, 38, 33, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedContactShadowTex = tex;
  return tex;
}

export function buildChibiCharacter3D(
  id: CharacterId,
  initialStatus: NpcBadgeStatus = null
): ChibiCharacterRig {
  const profile = CHARACTERS[id] || CHARACTERS.sali;
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const isApothecary = id === 'sali' || id === 'kael' || id === 'milo' || id === 'tobi';
  const isMedic = isApothecary || id === 'lios' || id === 'bima' || id === 'hana' || id === 'yuna';

  // Link's Awakening Collectible Toy-Figurine Glossy Satin PBR Materials
  const furMat = new THREE.MeshPhysicalMaterial({
    color: profile.primaryColor,
    roughness: 0.42,
    metalness: 0.0,
    clearcoat: 0.48,
    clearcoatRoughness: 0.26,
    sheen: 0.3,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(0xffffff),
  });

  // Hero Apothecary Tunics get vibrant emerald/mint hero tunic + crisp white collar, or medic coat
  const outfitColor = isApothecary
    ? profile.secondaryColor
    : isMedic
      ? '#FAF7EE'
      : profile.secondaryColor;
  const outfitMat = new THREE.MeshPhysicalMaterial({
    color: outfitColor,
    roughness: 0.46,
    metalness: 0.02,
    clearcoat: 0.42,
    clearcoatRoughness: 0.28,
  });

  const accentColor = isApothecary ? '#FAF7EE' : profile.secondaryColor;
  const accentMat = new THREE.MeshPhysicalMaterial({
    color: accentColor,
    roughness: 0.4,
    metalness: 0.04,
    clearcoat: 0.5,
    clearcoatRoughness: 0.22,
  });

  const heroGreenMat = new THREE.MeshPhysicalMaterial({
    color: 0x2ea078,
    roughness: 0.34,
    metalness: 0.04,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
  });

  const darkEyeMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f201c,
    roughness: 0.05,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  });

  const shineWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const blushMat = new THREE.MeshStandardMaterial({
    color: 0xf48b82,
    roughness: 0.72,
    transparent: true,
    opacity: 0.68,
  });

  const innerEarMat = new THREE.MeshPhysicalMaterial({
    color: id === 'mimi' || id === 'milo' || id === 'geri' ? 0xf7bec0 : 0xf7dfc9,
    roughness: 0.48,
    clearcoat: 0.35,
  });

  const leatherMat = new THREE.MeshPhysicalMaterial({
    color: 0x7b4a2b,
    roughness: 0.44,
    metalness: 0.04,
    clearcoat: 0.45,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xe6a832,
    roughness: 0.2,
    metalness: 0.88,
  });

  const shoeMat = new THREE.MeshPhysicalMaterial({
    color: isApothecary ? 0x8b4d2b : isMedic ? 0x2c6e63 : 0x68452e,
    roughness: 0.38,
    metalness: 0.04,
    clearcoat: 0.55,
  });

  const noseMat = new THREE.MeshPhysicalMaterial({
    color:
      id === 'bima' || id === 'pipi' || id === 'dodo'
        ? 0xe59b32
        : id === 'koko'
          ? 0x27303c
          : 0x453129,
    roughness: 0.3,
    clearcoat: 0.7,
  });

  // Soft radial-gradient contact shadow plane on ground
  const shadowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(1.12, 1.12),
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

  // Chunky Toy-Style Chibi Boots with Rim Cuff (grounded at y = 0.095)
  const buildFoot = (xPos: number) => {
    const footGroup = new THREE.Group();
    footGroup.position.set(xPos, 0.095, 0.04);
    const boot = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 12), shoeMat);
    boot.scale.set(0.98, 0.76, 1.34);
    boot.castShadow = true;
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.028, 6, 14), leatherMat);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(0, 0.09, -0.02);
    const sole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.135, 0.145, 0.04, 12),
      new THREE.MeshStandardMaterial({ color: 0xf4eee0, roughness: 0.65 })
    );
    sole.scale.set(0.95, 1, 1.28);
    sole.position.y = -0.06;
    footGroup.add(boot, cuff, sole);
    return footGroup;
  };
  const leftFoot = buildFoot(-0.165);
  const rightFoot = buildFoot(0.165);
  bodyGroup.add(leftFoot, rightFoot);

  // Flared Collectible Chibi Tunic / Coat + Thick Leather Belt + Gold Buckle
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.37, 0.56, 20), outfitMat);
  torso.position.y = 0.44;
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.315, 0.325, 0.085, 20), leatherMat);
  belt.position.y = 0.335;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.095, 0.065), brassMat);
  buckle.position.set(0, 0.335, 0.32);
  bodyGroup.add(belt, buckle);

  // Rounded Toy Collar / Tunic V-Neck
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.06, 8, 20), accentMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.695;
  bodyGroup.add(collar);

  [0.48, 0.58].forEach((by) => {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), brassMat);
    btn.position.set(0.04, by, 0.275);
    bodyGroup.add(btn);
  });

  // Hero Apothecary Cape / Hood Flap + Cross-Body Leather Satchel
  if (isApothecary) {
    const cape = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.52, 8, 1, false, -0.7, 1.4), heroGreenMat);
    cape.position.set(0, 0.46, -0.22);
    cape.rotation.x = 0.28;
    cape.castShadow = true;
    bodyGroup.add(cape);
  }

  if (isApothecary || id === 'alia' || id === 'nino') {
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.028, 6, 18), leatherMat);
    strap.position.set(0, 0.49, 0.02);
    strap.rotation.y = Math.PI / 2;
    strap.rotation.x = 0.55;
    const satchel = new THREE.Mesh(
      new THREE.BoxGeometry(0.19, 0.17, 0.11),
      id === 'nino' ? new THREE.MeshPhysicalMaterial({ color: 0xd9382e, roughness: 0.35, clearcoat: 0.5 }) : leatherMat
    );
    satchel.position.set(0.33, 0.34, 0.08);
    satchel.rotation.z = -0.15;
    satchel.castShadow = true;
    const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 6), brassMat);
    clasp.position.set(0.37, 0.34, 0.12);
    bodyGroup.add(strap, satchel, clasp);
  }

  // Role-specific torso accessories
  if (id === 'kael') {
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.075, 10, 18), heroGreenMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 0.695;
    const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.05), heroGreenMat);
    scarfTail.position.set(0.15, 0.56, 0.26);
    scarfTail.rotation.z = -0.25;
    bodyGroup.add(scarf, scarfTail);
  } else if (id === 'bima') {
    const stethLoop = new THREE.Mesh(
      new THREE.TorusGeometry(0.23, 0.026, 8, 18, Math.PI * 1.45),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42 })
    );
    stethLoop.position.set(0, 0.64, 0.06);
    stethLoop.rotation.x = Math.PI / 2.4;
    stethLoop.rotation.z = -Math.PI * 0.22;
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 12), brassMat);
    bell.rotation.x = Math.PI / 2;
    bell.position.set(-0.08, 0.49, 0.29);
    bodyGroup.add(stethLoop, bell);
  } else if (id === 'sekar') {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshPhysicalMaterial({ color: 0x4a7852, roughness: 0.5, clearcoat: 0.4 })
    );
    shell.rotation.x = -Math.PI / 2.2;
    shell.position.set(0, 0.45, -0.18);
    shell.castShadow = true;
    const shellRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.37, 0.045, 8, 18),
      new THREE.MeshStandardMaterial({ color: 0xd9ba88, roughness: 0.68 })
    );
    shellRim.rotation.x = -Math.PI / 2.2 + Math.PI / 2;
    shellRim.position.set(0, 0.44, -0.16);
    bodyGroup.add(shell, shellRim);
  } else if (id === 'geri') {
    const bowMat = new THREE.MeshStandardMaterial({ color: 0xd9382e, roughness: 0.45 });
    const bowL = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.11, 4), bowMat);
    bowL.rotation.z = -Math.PI / 2;
    bowL.position.set(-0.06, 0.66, 0.27);
    const bowR = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.11, 4), bowMat);
    bowR.rotation.z = Math.PI / 2;
    bowR.position.set(0.06, 0.66, 0.27);
    bodyGroup.add(bowL, bowR);
  } else if (id === 'pipi' || id === 'lili' || id === 'sora') {
    const shawl = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.08, 8, 18),
      new THREE.MeshPhysicalMaterial({
        color: id === 'lili' ? 0xffd166 : id === 'sora' ? 0xe07a5f : 0xf4a9bc,
        roughness: 0.55,
        clearcoat: 0.3,
      })
    );
    shawl.rotation.x = Math.PI / 2;
    shawl.position.y = 0.67;
    bodyGroup.add(shawl);
  }

  // Shoulder-pivoted Toy Arms + Signature Handheld Props!
  const buildArm = (side: -1 | 1) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.3, 0.6, 0);
    armGroup.rotation.z = side * 0.32;

    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.092, 0.17, 6, 10), outfitMat);
    sleeve.position.y = -0.1;
    sleeve.castShadow = true;

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.05, 10), accentMat);
    cuff.position.y = -0.19;

    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.086, 12, 10), furMat);
    paw.position.y = -0.255;
    paw.castShadow = true;

    armGroup.add(sleeve, cuff, paw);
    return armGroup;
  };
  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Add charming Link's Awakening-inspired miniature toy props!
  if (isApothecary) {
    // Left Hand: Miniature Emerald-Gold Apothecary Shield (reminiscent of Link's miniature shield!)
    const shieldBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.05, 14), heroGreenMat);
    shieldBody.rotation.z = Math.PI / 2;
    shieldBody.position.set(-0.08, -0.24, 0.08);
    shieldBody.castShadow = true;
    const shieldRim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 6, 14), brassMat);
    shieldRim.rotation.y = Math.PI / 2;
    shieldRim.position.set(-0.1, -0.24, 0.08);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.13, 0.04), shineWhiteMat);
    crossV.position.set(-0.11, -0.24, 0.08);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.13), shineWhiteMat);
    crossH.position.set(-0.11, -0.24, 0.08);
    leftArm.add(shieldBody, shieldRim, crossV, crossH);

    // Right Hand: Glowing Herbal Elixir Wand / Staff
    const staffShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.48, 8), leatherMat);
    staffShaft.rotation.x = Math.PI / 2.6;
    staffShaft.position.set(0.02, -0.25, 0.16);
    staffShaft.castShadow = true;
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.075, 0),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
        roughness: 0.1,
        clearcoat: 1.0,
      })
    );
    gem.position.set(0.02, -0.17, 0.38);
    rightArm.add(staffShaft, gem);
  } else if (id === 'hana' || id === 'bima' || id === 'yuna') {
    // Clinical clipboard or healing vial
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.03), leatherMat);
    board.position.set(0.03, -0.26, 0.12);
    board.rotation.x = -0.4;
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.035), shineWhiteMat);
    sheet.position.set(0.03, -0.26, 0.125);
    sheet.rotation.x = -0.4;
    rightArm.add(board, sheet);
  } else if (id === 'sekar' || id === 'lios') {
    // Herbal Mortar / Basket
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.075, 0.14, 10), brassMat);
    pot.position.set(-0.02, -0.26, 0.12);
    leftArm.add(pot);
  } else if (id === 'nino' || id === 'cici') {
    // Courier Letter Parcel or Archivist Book in hand
    const letter = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.14, 0.045),
      id === 'cici' ? new THREE.MeshStandardMaterial({ color: 0x2c6e63, roughness: 0.5 }) : shineWhiteMat
    );
    letter.position.set(0.02, -0.26, 0.12);
    const seal = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshBasicMaterial({ color: 0xd9382e }));
    seal.position.set(0.02, -0.26, 0.145);
    rightArm.add(letter, seal);
  } else if (id === 'taro') {
    // Brass Lighthouse Lantern in hand
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 8), brassMat);
    lantern.position.set(0.02, -0.27, 0.13);
    const glowCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.048, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfde68a })
    );
    glowCore.position.set(0.02, -0.27, 0.13);
    rightArm.add(lantern, glowCore);
  }

  bodyGroup.add(leftArm, rightArm);

  // Neck-pivoted Big Chibi Head Group (y = 0.72) — signature 1:1 toy figurine proportion!
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.72;
  bodyGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.415, 24, 20);
  headGeo.scale(1.08, 0.96, 0.99);
  const head = new THREE.Mesh(headGeo, furMat);
  head.position.y = 0.26;
  head.castShadow = true;
  head.receiveShadow = true;
  headGroup.add(head);

  // Sculpted Forehead Bangs / Fluffy Hair Tuft (gives Link's Awakening charm!)
  const tuftMat = isApothecary ? new THREE.MeshPhysicalMaterial({
    color: id === 'sali' ? '#F4A29E' : id === 'milo' ? '#F7DEC8' : id === 'tobi' ? '#8CD27D' : '#EAD2AC',
    roughness: 0.42,
    clearcoat: 0.45,
  }) : furMat;
  [-0.08, 0.02, 0.1].forEach((bx, bIdx) => {
    const bang = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.2, 7), tuftMat);
    bang.position.set(bx, 0.56 - bIdx * 0.015, 0.31);
    bang.rotation.set(0.85, 0, (bIdx - 1) * -0.28);
    headGroup.add(bang);
  });

  // Hero Apothecary Pointed Toy Cap (Link-style cozy sage/emerald cap!) for active heroes
  if (isApothecary) {
    const capBrim = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.055, 8, 20), heroGreenMat);
    capBrim.rotation.x = Math.PI / 2 - 0.18;
    capBrim.position.set(0, 0.47, -0.04);
    const capCone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 12), heroGreenMat);
    capCone.position.set(0, 0.58, -0.22);
    capCone.rotation.x = -0.82;
    capCone.castShadow = true;
    headGroup.add(capBrim, capCone);
  }

  // Tall Vertical Oval Glossy Toy Eyes (Link's Awakening signature eye shape!) + Catchlights + Rosy Cheeks
  const eyeSocketGeo = new THREE.SphereGeometry(0.068, 14, 14);
  eyeSocketGeo.scale(0.84, 1.52, 0.45);
  const eyeHighlightGeo = new THREE.SphereGeometry(0.024, 8, 8);
  const cheekGeo = new THREE.SphereGeometry(0.072, 10, 8);
  cheekGeo.scale(1.32, 0.78, 0.4);
  const browGeo = new THREE.CapsuleGeometry(0.014, 0.072, 4, 6);

  [-1, 1].forEach((side) => {
    const eyeBall = new THREE.Mesh(eyeSocketGeo, darkEyeMat);
    eyeBall.position.set(side * 0.148, 0.275, 0.375);

    const catchlight = new THREE.Mesh(eyeHighlightGeo, shineWhiteMat);
    catchlight.position.set(side * 0.148 - 0.016, 0.32, 0.408);

    const microSpark = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), shineWhiteMat);
    microSpark.position.set(side * 0.148 + 0.018, 0.225, 0.404);

    const cheek = new THREE.Mesh(cheekGeo, blushMat);
    cheek.position.set(side * 0.245, 0.165, 0.325);
    cheek.rotation.y = side * 0.46;

    const brow = new THREE.Mesh(browGeo, noseMat);
    brow.position.set(side * 0.148, 0.415, 0.355);
    brow.rotation.z = Math.PI / 2 + side * (id === 'bima' ? -0.16 : 0.12);

    headGroup.add(eyeBall, catchlight, microSpark, cheek, brow);
  });

  // Species-specific Muzzle / Beak / Elephant Trunk
  if (id === 'geri') {
    const trunkUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.052, 0.24, 10), furMat);
    trunkUpper.position.set(0, 0.16, 0.43);
    trunkUpper.rotation.x = Math.PI / 3.4;
    const trunkTip = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.04, 0.18, 10), furMat);
    trunkTip.position.set(0, 0.07, 0.54);
    trunkTip.rotation.x = Math.PI / 6;
    headGroup.add(trunkUpper, trunkTip);
  } else if (id === 'bima' || id === 'pipi' || id === 'dodo') {
    if (id === 'dodo') {
      const duckBill = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), noseMat);
      duckBill.scale.set(1.35, 0.45, 1.15);
      duckBill.position.set(0, 0.17, 0.46);
      headGroup.add(duckBill);
    } else {
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.17, 6), noseMat);
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
  } else {
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.125, 12, 10), innerEarMat);
    snout.scale.set(1.25, 0.78, 0.78);
    snout.position.set(0, 0.165, 0.36);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(id === 'koko' ? 0.065 : 0.046, 10, 8), noseMat);
    nose.scale.set(1.15, id === 'koko' ? 1.4 : 0.85, 0.9);
    nose.position.set(0, 0.21, 0.45);
    headGroup.add(snout, nose);

    if (id === 'bobi') {
      [-0.025, 0.025].forEach((tx) => {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.05, 0.02), shineWhiteMat);
        tooth.position.set(tx, 0.12, 0.445);
        headGroup.add(tooth);
      });
    }
  }

  // Sculpted Dual-Tone Species Ears / Fronds / Quills / Hats
  if (id === 'milo') {
    const earGeo = new THREE.CapsuleGeometry(0.092, 0.38, 8, 12);
    const innerGeo = new THREE.CapsuleGeometry(0.048, 0.26, 6, 8);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(side * 0.22, 0.72, 0.02);
      ear.rotation.z = -side * 0.22;
      ear.castShadow = true;
      const inner = new THREE.Mesh(innerGeo, innerEarMat);
      inner.position.set(side * 0.22, 0.72, 0.085);
      inner.rotation.z = -side * 0.22;
      headGroup.add(ear, inner);
    });
  } else if (id === 'sali') {
    const gillMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4a29e,
      roughness: 0.38,
      clearcoat: 0.5,
    });
    const gillGeo = new THREE.CapsuleGeometry(0.046, 0.18, 5, 8);
    [-1, 1].forEach((side) => {
      [-0.22, 0, 0.22].forEach((rotZ, idx) => {
        const g = new THREE.Mesh(gillGeo, gillMat);
        g.position.set(side * 0.47, 0.25 + (idx - 1) * 0.095, 0);
        g.rotation.z = side * (Math.PI / 2 + rotZ);
        headGroup.add(g);
      });
    });
  } else if (id === 'kael' || id === 'alia' || id === 'mimi' || id === 'cici') {
    const earScale = id === 'alia' ? 1.5 : 1.08;
    const earGeo = new THREE.ConeGeometry(0.12 * earScale, 0.3 * earScale, 4);
    const innerGeo = new THREE.ConeGeometry(0.07 * earScale, 0.2 * earScale, 4);
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
  } else if (id === 'koko' || id === 'geri' || id === 'bobi' || id === 'lili' || id === 'taro') {
    const r = id === 'geri' ? 0.28 : id === 'koko' ? 0.18 : 0.125;
    const earGeo = new THREE.SphereGeometry(r, 12, 10);
    earGeo.scale(1, 1, 0.45);
    const innerGeo = new THREE.SphereGeometry(r * 0.62, 10, 8);
    innerGeo.scale(1, 1, 0.45);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(side * (0.41 + r * 0.18), id === 'lili' || id === 'taro' ? 0.44 : 0.32, -0.02);
      ear.castShadow = true;
      const inner = new THREE.Mesh(innerGeo, innerEarMat);
      inner.position.set(side * (0.41 + r * 0.18), id === 'lili' || id === 'taro' ? 0.44 : 0.32, 0.025);
      headGroup.add(ear, inner);
    });
  } else if (id === 'tobi' || id === 'riko') {
    [0, -0.1, -0.2].forEach((zOff, idx) => {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.08 - idx * 0.015, 0.2 - idx * 0.03, 6),
        heroGreenMat
      );
      spike.position.set(0, 0.68 - idx * 0.06, zOff - 0.02);
      spike.rotation.x = -0.35 - idx * 0.25;
      headGroup.add(spike);
    });
    if (id === 'riko') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.035, 6, 20), heroGreenMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.43;
      headGroup.add(band);
    }
  } else if (id === 'lios') {
    const quillMat = new THREE.MeshPhysicalMaterial({ color: 0x5c4b3b, roughness: 0.65, clearcoat: 0.2 });
    const quillCoords: [number, number, number, number, number][] = [
      [0, 0.55, -0.22, -0.6, 0],
      [-0.22, 0.49, -0.18, -0.5, 0.35],
      [0.22, 0.49, -0.18, -0.5, -0.35],
      [-0.32, 0.34, -0.18, -0.4, 0.55],
      [0.32, 0.34, -0.18, -0.4, -0.55],
      [0, 0.38, -0.35, -0.9, 0],
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
      new THREE.MeshStandardMaterial({ color: 0xd9ba88, roughness: 0.72 })
    );
    hatBrim.position.y = 0.57;
    hatBrim.castShadow = true;
    const hatBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.34, 0.06, 16),
      accentMat
    );
    hatBand.position.y = 0.61;
    const hatTop = new THREE.Mesh(
      new THREE.ConeGeometry(0.33, 0.24, 16),
      new THREE.MeshStandardMaterial({ color: 0xc9a36b, roughness: 0.72 })
    );
    hatTop.position.y = 0.72;
    headGroup.add(hatBrim, hatBand, hatTop);
  } else if (id === 'hana') {
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.15, 0.18),
      new THREE.MeshPhysicalMaterial({ color: 0xfaf9f5, roughness: 0.42, clearcoat: 0.4 })
    );
    cap.position.set(0, 0.64, 0.06);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.085, 0.03), redMat);
    crossV.position.set(0, 0.64, 0.155);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.032, 0.03), redMat);
    crossH.position.set(0, 0.64, 0.155);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.16, 4, 8), furMat);
      ear.position.set(side * 0.44, 0.4, -0.02);
      ear.rotation.z = side * 1.05;
      headGroup.add(ear);
    });
    headGroup.add(cap, crossV, crossH);
  } else if (id === 'bima') {
    [-1, 1].forEach((side) => {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 5), noseMat);
      tuft.position.set(side * 0.29, 0.59, 0.02);
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
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), furMat);
      ear.scale.set(1, 0.8, 0.55);
      ear.position.set(side * 0.34, 0.5, -0.02);
      headGroup.add(ear);
    });
  } else if (id === 'dodo') {
    const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.12, 16), shineWhiteMat);
    capBase.position.set(0, 0.61, 0);
    const capBand = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.045, 16), accentMat);
    capBand.position.set(0, 0.56, 0);
    headGroup.add(capBase, capBand);
  } else if (id === 'sora') {
    const woolMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78 });
    [-0.18, 0, 0.18].forEach((wx, idx) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(idx === 1 ? 0.19 : 0.15, 10, 8), woolMat);
      puff.position.set(wx, 0.61, 0.02);
      headGroup.add(puff);
    });
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.15, 4, 8), innerEarMat);
      ear.position.set(side * 0.43, 0.36, 0);
      ear.rotation.z = side * 1.1;
      headGroup.add(ear);
    });
  }

  // Round Brass Spectacles for Sali, Tobi, Guru Lios, Dr. Bima, Tante Cici, Apoteker Yuna
  if (id === 'sali' || id === 'tobi' || id === 'lios' || id === 'bima' || id === 'cici' || id === 'yuna') {
    const ringGeo = new THREE.TorusGeometry(0.098, 0.015, 8, 16);
    const lg = new THREE.Mesh(ringGeo, brassMat);
    lg.position.set(-0.148, 0.275, 0.405);
    const rg = new THREE.Mesh(ringGeo, brassMat);
    rg.position.set(0.148, 0.275, 0.405);
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.11, 6), brassMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.285, 0.41);
    headGroup.add(lg, rg, bridge);
  }

  // Dark bandit eye mask for raccoon Cici
  if (id === 'cici') {
    const maskMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.65 });
    const maskGeo = new THREE.SphereGeometry(0.11, 10, 8);
    maskGeo.scale(1.15, 0.85, 0.35);
    [-1, 1].forEach((side) => {
      const patch = new THREE.Mesh(maskGeo, maskMat);
      patch.position.set(side * 0.148, 0.275, 0.36);
      headGroup.add(patch);
    });
  }

  // Sculpted Species Tail
  let tail: THREE.Object3D | null = null;
  if (id === 'milo') {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.115, 10, 8), shineWhiteMat);
    puff.position.set(0, 0.24, -0.36);
    bodyGroup.add(puff);
    tail = puff;
  } else if (id === 'nino' || id === 'alia' || id === 'kael') {
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.28, -0.33);
    const mainTail = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.28, 6, 10), furMat);
    mainTail.position.set(0, 0.14, -0.12);
    mainTail.rotation.x = id === 'nino' ? -0.45 : -0.95;
    mainTail.castShadow = true;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), innerEarMat);
    tip.position.set(0, id === 'nino' ? 0.3 : 0.22, id === 'nino' ? -0.19 : -0.26);
    tailGroup.add(mainTail, tip);
    bodyGroup.add(tailGroup);
    tail = tailGroup;
  } else if (id === 'bobi') {
    const paddle = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.36, 10), leatherMat);
    paddle.scale.set(1.3, 1, 0.32);
    paddle.position.set(0, 0.2, -0.39);
    paddle.rotation.x = -1.1;
    bodyGroup.add(paddle);
    tail = paddle;
  } else if (id === 'mimi' || id === 'tobi' || id === 'sali' || id === 'lili' || id === 'cici') {
    const t = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, id === 'lili' || id === 'cici' ? 0.32 : 0.26, 5, 8), furMat);
    t.position.set(0, 0.28, -0.37);
    t.rotation.x = -0.85;
    bodyGroup.add(t);
    tail = t;
  } else if (id === 'taro') {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), furMat);
    puff.position.set(0, 0.24, -0.36);
    bodyGroup.add(puff);
    tail = puff;
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
    roughness: 0.32,
  });
  const activeQuestMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0xb45309,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const doneCheckMat = new THREE.MeshStandardMaterial({
    color: 0x3b826e,
    emissive: 0x1f6e52,
    emissiveIntensity: 0.4,
    roughness: 0.32,
  });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfaf9f5, roughness: 0.35 });

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
