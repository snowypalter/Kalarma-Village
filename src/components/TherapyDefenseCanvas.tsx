import React, { useEffect, useRef, useState } from 'react';
import {
  AlertOctagon,
  Calculator,
  Pause,
  Play,
  FastForward,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { TOWERS } from '../data/cases';
import { AVATARS, CHARACTERS } from '../data/characters';
import { AvatarId, CaseScenario, TowerId, WeatherType } from '../types/pharmacy';
import { soundFX } from '../utils/sound';

interface TherapyDefenseCanvasProps {
  scenario: CaseScenario;
  weather: WeatherType;
  selectedAvatar: AvatarId;
  onVictory: (stars: number) => void;
  onExit: () => void;
}

interface TowerNode {
  id: number;
  x: number;
  y: number;
  towerId: TowerId | null;
  cooldown: number;
  flash: number;
}

interface EnemyEntity {
  id: number;
  type: string;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
  progress: number;
  x: number;
  y: number;
  reward: number;
  mutatedResistant: boolean;
  hitFlash: number;
}

interface ProjectileEntity {
  x: number;
  y: number;
  targetId: number;
  damage: number;
  color: string;
  speed: number;
}

interface ParticleEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const WAYPOINTS = [
  { x: 40, y: 120 },
  { x: 240, y: 120 },
  { x: 240, y: 310 },
  { x: 520, y: 310 },
  { x: 520, y: 105 },
  { x: 760, y: 105 },
  { x: 760, y: 290 },
  { x: 870, y: 290 },
];

const LOGICAL_W = 900;
const LOGICAL_H = 420;

const TOWER_SLOTS: { id: number; x: number; y: number }[] = [
  { id: 0, x: 150, y: 205 },
  { id: 1, x: 345, y: 210 },
  { id: 2, x: 425, y: 205 },
  { id: 3, x: 425, y: 95 },
  { id: 4, x: 640, y: 200 },
  { id: 5, x: 645, y: 365 },
  { id: 6, x: 825, y: 195 },
];

export const TherapyDefenseCanvas: React.FC<TherapyDefenseCanvasProps> = ({
  scenario,
  weather,
  selectedAvatar,
  onVictory,
  onExit,
}) => {
  const avatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];
  const patient = CHARACTERS[scenario.patientId];

  const [selectedTowerTool, setSelectedTowerTool] = useState<TowerId>(scenario.recommendedTowers[0]);
  const [speedMultiplier, setSpeedMultiplier] = useState<0 | 1 | 2>(1);
  const [showCalcDrawer, setShowCalcDrawer] = useState(false);

  // HUD snapshot state (updated cleanly without driving the animation loop)
  const [hudState, setHudState] = useState({
    energy: scenario.startingEnergy + (avatar.id === AvatarId.KAEL ? 20 : 0),
    organHealth: 100,
    waveIndex: 0,
    totalWaves: scenario.waves.length,
    toxicity: 0,
    stoppedEarly: false,
    outcome: 'playing' as 'playing' | 'victory' | 'defeat',
    alertBanner: '' as string,
  });

  // In-game Mini-Drawer IV Infusion TPM state
  const [infVol, setInfVol] = useState<number>(scenario.infusionConfig.enabled ? 500 : 500);
  const [infHours, setInfHours] = useState<number>(scenario.infusionConfig.enabled ? 2 : 4);
  const [infFactor, setInfFactor] = useState<20 | 60>(20);
  const currentTpm = Math.round((infVol * infFactor) / Math.max(0.5, infHours * 60));

  const isTpmInWindow = scenario.infusionConfig.enabled
    ? currentTpm >= scenario.infusionConfig.minTpm - (avatar.id === AvatarId.SALI ? 4 : 0) &&
      currentTpm <= scenario.infusionConfig.maxTpm + (avatar.id === AvatarId.SALI ? 4 : 0)
    : true;

  // Refs for isolated 60fps simulation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speedRef = useRef<0 | 1 | 2>(1);
  const selectedToolRef = useRef<TowerId>(selectedTowerTool);
  const tpmWindowRef = useRef<boolean>(isTpmInWindow);
  const simRef = useRef({
    energy: scenario.startingEnergy + (avatar.id === AvatarId.KAEL ? 20 : 0),
    organHealth: 100,
    waveIndex: 0,
    spawnedInWave: 0,
    spawnTimer: 0.6,
    nextEnemyId: 1,
    toxicity: 0,
    stoppedEarly: false,
    earlyStopTriggered: false,
    outcome: 'playing' as 'playing' | 'victory' | 'defeat',
    alertBanner: '',
    shakeTime: 0,
    nodes: TOWER_SLOTS.map((s) => ({
      ...s,
      towerId: null as TowerId | null,
      cooldown: 0,
      flash: 0,
    })) as TowerNode[],
    enemies: [] as EnemyEntity[],
    projectiles: [] as ProjectileEntity[],
    particles: [] as ParticleEntity[],
  });

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    selectedToolRef.current = selectedTowerTool;
  }, [selectedTowerTool]);

  useEffect(() => {
    tpmWindowRef.current = isTpmInWindow;
  }, [isTpmInWindow]);

  const resetArena = () => {
    soundFX.playClick();
    const startE = scenario.startingEnergy + (avatar.id === AvatarId.KAEL ? 20 : 0);
    simRef.current = {
      energy: startE,
      organHealth: 100,
      waveIndex: 0,
      spawnedInWave: 0,
      spawnTimer: 0.6,
      nextEnemyId: 1,
      toxicity: 0,
      stoppedEarly: false,
      earlyStopTriggered: false,
      outcome: 'playing',
      alertBanner: '',
      shakeTime: 0,
      nodes: TOWER_SLOTS.map((s) => ({
        ...s,
        towerId: null,
        cooldown: 0,
        flash: 0,
      })),
      enemies: [],
      projectiles: [],
      particles: [],
    };
    setSpeedMultiplier(1);
    setHudState({
      energy: startE,
      organHealth: 100,
      waveIndex: 0,
      totalWaves: scenario.waves.length,
      toxicity: 0,
      stoppedEarly: false,
      outcome: 'playing',
      alertBanner: '',
    });
  };

  const triggerEarlyStop = () => {
    const sim = simRef.current;
    if (sim.earlyStopTriggered || sim.outcome !== 'playing') return;
    sim.earlyStopTriggered = true;
    sim.stoppedEarly = true;
    sim.shakeTime = 0.4;
    sim.alertBanner =
      'Terapi dihentikan dini! Bakteri yang tersisa bermutasi membentuk Perisai Merah Resisten!';
    soundFX.playResistanceAlert();

    // Mutate active enemies & spawn an extra resistant wave surge
    sim.enemies.forEach((en) => {
      en.mutatedResistant = true;
      en.maxHp = Math.round(en.maxHp * 1.65);
      en.hp = en.maxHp;
      en.speed = Math.round(en.speed * 1.35);
    });
  };

  const handleCanvasInteract = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const sim = simRef.current;
    if (!canvas || sim.outcome !== 'playing') return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((clientX - rect.left) / rect.width) * LOGICAL_W;
    const y = ((clientY - rect.top) / rect.height) * LOGICAL_H;

    // Find nearest node within 44px radius
    let clickedNode: TowerNode | null = null;
    for (const node of sim.nodes) {
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist <= 42) {
        clickedNode = node;
        break;
      }
    }

    if (!clickedNode) return;

    const tool = TOWERS[selectedToolRef.current];

    // If node already has tower, clicking removes/refunds 60% so user can adjust strategy
    if (clickedNode.towerId) {
      const prevTower = TOWERS[clickedNode.towerId];
      sim.energy += Math.round(prevTower.cost * 0.6);
      clickedNode.towerId = null;
      soundFX.playClick();
      recalcToxicity(sim);
      return;
    }

    // Warn if placing antibiotic on non-antibiotic viral/GERD case!
    if (scenario.isNonAntibioticCase && tool.isAntibiotic) {
      sim.alertBanner =
        'Peringatan Stewardship: Kasus ini tidak memerlukan antibiotik! Gunakan terapi non-antibiotik atau Pos Herbal.';
      sim.shakeTime = 0.25;
      soundFX.playError();
      return;
    }

    if (sim.energy < tool.cost) {
      sim.alertBanner = `Energi Terapi belum cukup (butuh ${tool.cost}). Tunggu eliminasi patogen.`;
      soundFX.playError();
      return;
    }

    sim.energy -= tool.cost;
    clickedNode.towerId = tool.id;
    clickedNode.flash = 0.25;
    soundFX.playPlaceTower();

    // Particle burst
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      sim.particles.push({
        x: clickedNode.x,
        y: clickedNode.y,
        vx: Math.cos(angle) * 65,
        vy: Math.sin(angle) * 65,
        life: 0.45,
        color: tool.color,
        size: 4,
      });
    }

    recalcToxicity(sim);
  };

  const recalcToxicity = (sim: typeof simRef.current) => {
    let rawTox = 0;
    const counts: Record<string, number> = {};
    sim.nodes.forEach((n) => {
      if (!n.towerId) return;
      const def = TOWERS[n.towerId];
      counts[n.towerId] = (counts[n.towerId] || 0) + 1;
      // Stacking identical high-potency drugs increases toxicity faster
      const stackPenalty = counts[n.towerId] > 2 && def.toxicityWeight > 0 ? 18 : 0;
      rawTox += def.toxicityWeight * 16 + stackPenalty;
    });
    if (avatar.id === AvatarId.MILO) {
      rawTox *= 0.8;
    }
    sim.toxicity = Math.max(0, Math.min(100, Math.round(rawTox)));
    if (sim.toxicity >= 75) {
      sim.alertBanner =
        'Peringatan Overdosis & Toksisitas! Terlalu banyak menara dosis tinggi menumpuk. Tambahkan Temulawak Mbah Sekar atau kurangi duplikasi.';
      sim.shakeTime = 0.3;
      soundFX.playResistanceAlert();
    } else if (sim.alertBanner.includes('Toksisitas')) {
      sim.alertBanner = '';
    }
  };

  // Main 60fps Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const syncCanvasBuffer = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(LOGICAL_W, Math.round(rect.width * dpr));
      const targetH = Math.max(LOGICAL_H, Math.round(rect.height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };
    syncCanvasBuffer();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncCanvasBuffer) : null;
    ro?.observe(canvas);

    let animId = 0;
    let lastTime = performance.now();
    let hudSyncAcc = 0;

    const step = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const clampedDt = Math.min(rawDt, 0.05);
      const dt = clampedDt * speedRef.current;

      const sim = simRef.current;
      const w = LOGICAL_W;
      const h = LOGICAL_H;

      // UPDATE SIMULATION
      if (sim.outcome === 'playing' && dt > 0) {
        if (sim.shakeTime > 0) sim.shakeTime = Math.max(0, sim.shakeTime - clampedDt);

        // Spawn current wave enemies
        const currentWave = scenario.waves[sim.waveIndex];
        if (currentWave) {
          if (sim.spawnedInWave < currentWave.count) {
            sim.spawnTimer -= dt;
            if (sim.spawnTimer <= 0) {
              const weatherSpeedBoost =
                weather === WeatherType.HUJAN_LEMBAP && currentWave.enemyType === 'coccus' ? 1.1 : 1.0;

              sim.enemies.push({
                id: sim.nextEnemyId++,
                type: currentWave.enemyType,
                hp: currentWave.hp,
                maxHp: currentWave.hp,
                speed: currentWave.speed * weatherSpeedBoost,
                pathIndex: 0,
                progress: 0,
                x: WAYPOINTS[0].x,
                y: WAYPOINTS[0].y,
                reward: currentWave.reward,
                mutatedResistant: false,
                hitFlash: 0,
              });
              sim.spawnedInWave++;
              sim.spawnTimer = currentWave.spawnInterval;
            }
          } else if (sim.enemies.length === 0) {
            if (sim.waveIndex < scenario.waves.length - 1) {
              sim.waveIndex++;
              sim.spawnedInWave = 0;
              sim.spawnTimer = 1.4;
              sim.energy += 25;
            } else {
              sim.outcome = 'victory';
              soundFX.playSuccess();
            }
          }
        }

        // Move enemies along vascular path
        for (let i = sim.enemies.length - 1; i >= 0; i--) {
          const en = sim.enemies[i];
          if (en.hitFlash > 0) en.hitFlash = Math.max(0, en.hitFlash - dt);

          const targetWp = WAYPOINTS[en.pathIndex + 1];
          if (!targetWp) {
            // Reached patient organ!
            sim.organHealth = Math.max(0, sim.organHealth - (en.mutatedResistant ? 20 : 12));
            sim.shakeTime = 0.25;
            soundFX.playError();
            sim.enemies.splice(i, 1);
            if (sim.organHealth <= 0) {
              sim.outcome = 'defeat';
            }
            continue;
          }

          const dx = targetWp.x - en.x;
          const dy = targetWp.y - en.y;
          const dist = Math.hypot(dx, dy);
          const move = en.speed * dt;
          if (dist <= move) {
            en.x = targetWp.x;
            en.y = targetWp.y;
            en.pathIndex++;
          } else {
            en.x += (dx / dist) * move;
            en.y += (dy / dist) * move;
          }
        }

        // Tower firing logic
        sim.nodes.forEach((node) => {
          if (node.flash > 0) node.flash = Math.max(0, node.flash - dt);
          if (!node.towerId) return;
          const def = TOWERS[node.towerId];

          if (node.cooldown > 0) {
            node.cooldown -= dt;
            return;
          }

          // Find first enemy in range
          const target = sim.enemies.find((en) => Math.hypot(en.x - node.x, en.y - node.y) <= def.range);
          if (target) {
            // Calculate modifiers (Avatar, Weather, Therapeutic Window TPM, Toxicity penalty)
            let dmg = def.damage;
            if (def.category === 'herbal') {
              if (weather === WeatherType.CERAH_HANGAT) dmg *= 1.15;
              dmg *= 1 + avatar.herbalPowerBonus;
            } else {
              dmg *= 1 + avatar.dosePrecisionBonus * 0.6;
            }
            if (!tpmWindowRef.current) {
              dmg *= 0.6;
            }
            if (sim.toxicity >= 75) {
              dmg *= 0.72;
            }
            if (target.mutatedResistant && def.isAntibiotic && def.id !== TowerId.VANCOMYCIN_IV) {
              dmg *= 0.45;
            }

            sim.projectiles.push({
              x: node.x,
              y: node.y,
              targetId: target.id,
              damage: Math.round(dmg),
              color: def.color,
              speed: 360,
            });
            const rateBonus = 1 + avatar.towerFireRateBonus;
            node.cooldown = 1 / (def.fireRate * rateBonus);
            soundFX.playShoot();
          }
        });

        // Update projectiles
        for (let i = sim.projectiles.length - 1; i >= 0; i--) {
          const p = sim.projectiles[i];
          const target = sim.enemies.find((e) => e.id === p.targetId);
          if (!target) {
            sim.projectiles.splice(i, 1);
            continue;
          }
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const dist = Math.hypot(dx, dy);
          const stepDist = p.speed * dt;

          if (dist <= stepDist + 10) {
            target.hp -= p.damage;
            target.hitFlash = 0.14;
            sim.projectiles.splice(i, 1);

            for (let k = 0; k < 5; k++) {
              sim.particles.push({
                x: target.x,
                y: target.y,
                vx: (Math.random() - 0.5) * 90,
                vy: (Math.random() - 0.5) * 90,
                life: 0.3,
                color: p.color,
                size: 3,
              });
            }

            if (target.hp <= 0) {
              sim.energy += target.reward;
              const idx = sim.enemies.findIndex((e) => e.id === target.id);
              if (idx !== -1) sim.enemies.splice(idx, 1);
            }
          } else {
            p.x += (dx / dist) * stepDist;
            p.y += (dy / dist) * stepDist;
          }
        }

        // Update particles
        for (let i = sim.particles.length - 1; i >= 0; i--) {
          const pt = sim.particles[i];
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.life -= dt;
          if (pt.life <= 0) sim.particles.splice(i, 1);
        }
      }

      // RENDER ARENA (scaled cleanly into logical 900x420 coordinate space)
      ctx.setTransform(canvas.width / LOGICAL_W, 0, 0, canvas.height / LOGICAL_H, 0, 0);
      ctx.save();
      if (sim.shakeTime > 0) {
        const mag = sim.shakeTime * 12;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      // Warm bio-cellular tissue background
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#F5F2EA');
      bgGrad.addColorStop(1, '#E8EFEA');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle cellular hex/grid texture
      ctx.strokeStyle = 'rgba(44, 110, 99, 0.06)';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < w; gx += 60) {
        for (let gy = 40; gy < h; gy += 60) {
          ctx.beginPath();
          ctx.arc(gx, gy, 24, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Organic vascular/tissue path
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#D9C5B2';
      ctx.lineWidth = 46;
      ctx.beginPath();
      WAYPOINTS.forEach((wp, idx) => (idx === 0 ? ctx.moveTo(wp.x, wp.y) : ctx.lineTo(wp.x, wp.y)));
      ctx.stroke();

      ctx.strokeStyle = '#EFE6DA';
      ctx.lineWidth = 34;
      ctx.beginPath();
      WAYPOINTS.forEach((wp, idx) => (idx === 0 ? ctx.moveTo(wp.x, wp.y) : ctx.lineTo(wp.x, wp.y)));
      ctx.stroke();

      // Organ Sanctuary Shield at end of path
      const endWp = WAYPOINTS[WAYPOINTS.length - 1];
      ctx.fillStyle = sim.organHealth > 50 ? '#3B826E' : '#DC2626';
      ctx.beginPath();
      ctx.arc(endWp.x - 10, endWp.y, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FAF9F5';
      ctx.font = 'bold 12px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SEL', endWp.x - 10, endWp.y + 4);

      // Draw Tower Placement Nodes & Towers
      sim.nodes.forEach((node) => {
        if (!node.towerId) {
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 23, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(44, 110, 99, 0.45)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#2C6E63';
          ctx.font = 'bold 18px "DM Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('+', node.x, node.y + 6);
        } else {
          const def = TOWERS[node.towerId];
          // Range aura
          ctx.fillStyle = `${def.color}14`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, def.range, 0, Math.PI * 2);
          ctx.fill();

          // Tower base
          ctx.fillStyle = node.flash > 0 ? '#FFFFFF' : def.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 23, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FAF9F5';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px "DM Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(def.shortName.slice(0, 7), node.x, node.y + 4);
        }
      });

      // Draw Enemies (Pathogens / Symptom Surges)
      sim.enemies.forEach((en) => {
        ctx.save();
        ctx.translate(en.x, en.y);

        // Red Resistance Shield if stopped early
        if (en.mutatedResistant) {
          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(0, 0, 21, 0, Math.PI * 2);
          ctx.stroke();
        }

        const bodyColor =
          en.hitFlash > 0
            ? '#FFFFFF'
            : en.type === 'mrsa'
              ? '#7C2D12'
              : en.type === 'virus'
                ? '#6D28D9'
                : en.type === 'acid'
                  ? '#D97706'
                  : en.type === 'hypertension'
                    ? '#B91C1C'
                    : en.type === 'glucose'
                      ? '#0369A1'
                      : '#15803D';

        ctx.fillStyle = bodyColor;
        if (en.type === 'ecoli') {
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 10, 0.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pathogen eyes
        ctx.fillStyle = '#FAF9F5';
        ctx.beginPath();
        ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
        ctx.arc(4, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // HP bar
        const pct = Math.max(0, en.hp / en.maxHp);
        ctx.fillStyle = 'rgba(22,48,43,0.25)';
        ctx.fillRect(-16, -24, 32, 5);
        ctx.fillStyle = en.mutatedResistant ? '#DC2626' : '#3B826E';
        ctx.fillRect(-16, -24, 32 * pct, 5);

        ctx.restore();
      });

      // Draw Projectiles
      sim.projectiles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Particles
      sim.particles.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.life * 2.2);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      ctx.restore();

      // Sync React HUD state cleanly ~6 times/sec or on outcome change
      hudSyncAcc += clampedDt;
      if (hudSyncAcc >= 0.15 || sim.outcome !== 'playing') {
        hudSyncAcc = 0;
        setHudState((prev) => {
          if (
            prev.energy === sim.energy &&
            prev.organHealth === sim.organHealth &&
            prev.waveIndex === sim.waveIndex &&
            prev.toxicity === sim.toxicity &&
            prev.stoppedEarly === sim.stoppedEarly &&
            prev.outcome === sim.outcome &&
            prev.alertBanner === sim.alertBanner
          ) {
            return prev;
          }
          return {
            energy: sim.energy,
            organHealth: sim.organHealth,
            waveIndex: sim.waveIndex,
            totalWaves: scenario.waves.length,
            toxicity: sim.toxicity,
            stoppedEarly: sim.stoppedEarly,
            outcome: sim.outcome,
            alertBanner: sim.alertBanner,
          };
        });
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      ro?.disconnect();
    };
  }, [scenario, weather, avatar]);

  return (
    <div className="space-y-4">
      {/* Unobtrusive Clinical HUD Header */}
      <div className="v18-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-xs font-bold uppercase text-[#FF5A5F]">
            Arena Benteng Terapi · {scenario.organName} ({patient.name})
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono tabular-nums mt-1">
            <span className="font-bold text-[#2D2926]">Kesehatan Sel: {hudState.organHealth}%</span>
            <span aria-hidden="true">·</span>
            <span className="font-bold text-[#2C6E63]">Energi Terapi: {hudState.energy}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#2D2926]">
              Gelombang {hudState.waveIndex + 1}/{hudState.totalWaves}
            </span>
            <span aria-hidden="true">·</span>
            <span
              className={
                hudState.toxicity >= 75
                  ? 'text-[#FF5A5F] font-bold'
                  : hudState.toxicity >= 45
                    ? 'text-[#D97706] font-bold'
                    : 'text-[#2C6E63] font-bold'
              }
            >
              Beban Toksisitas: {hudState.toxicity}%
            </span>
          </div>
        </div>

        {/* Speed & Drawer Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#F2EFEB] border-2 border-[#2D2926] p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSpeedMultiplier(0);
              }}
              className={`min-h-[40px] px-3 text-xs font-bold uppercase inline-flex items-center gap-1 cursor-pointer ${
                speedMultiplier === 0 ? 'bg-[#FF5A5F] text-white' : 'text-[#2D2926]'
              }`}
              aria-label="Jeda simulasi"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Jeda</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSpeedMultiplier(1);
              }}
              className={`min-h-[40px] px-3 text-xs font-bold uppercase inline-flex items-center gap-1 cursor-pointer ${
                speedMultiplier === 1 ? 'bg-[#FF5A5F] text-white' : 'text-[#2D2926]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>1x</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSpeedMultiplier(2);
              }}
              className={`min-h-[40px] px-3 text-xs font-bold uppercase inline-flex items-center gap-1 cursor-pointer ${
                speedMultiplier === 2 ? 'bg-[#FF5A5F] text-white' : 'text-[#2D2926]'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>2x</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setShowCalcDrawer((s) => !s);
            }}
            className={`v18-btn min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              !isTpmInWindow
                ? 'bg-[#FF5A5F] text-white'
                : 'bg-white text-[#2D2926] hover:bg-[#FFD166]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>
              Kalkulator Infus {scenario.infusionConfig.enabled ? `(${currentTpm} TPM)` : ''}
            </span>
          </button>

          {!scenario.isNonAntibioticCase && (
            <button
              type="button"
              onClick={triggerEarlyStop}
              disabled={hudState.stoppedEarly || hudState.outcome !== 'playing'}
              className="v18-btn min-h-[44px] px-3.5 py-2 bg-[#FFF1F2] hover:bg-[#FF5A5F] hover:text-white disabled:opacity-45 text-xs font-bold uppercase tracking-wider text-[#B91C1C] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Hentikan Terapi Dini</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner (Resistance / Toxicity / Stewardship) */}
      {hudState.alertBanner && (
        <div className="v18-card-sm bg-[#FF5A5F] text-white px-4 py-3 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertOctagon className="w-5 h-5 shrink-0" />
          <span className="font-bold">{hudState.alertBanner}</span>
        </div>
      )}

      {/* Main Arena Canvas Container (Isolated from HUD overlays) */}
      <div className="v18-card relative overflow-hidden bg-[#E8EFEA]">
        <div className="w-full aspect-video sm:aspect-[900/420] bg-[#E8EFEA] relative">
          <canvas
            ref={canvasRef}
            width={900}
            height={420}
            onClick={(e) => handleCanvasInteract(e.clientX, e.clientY)}
            className="w-full h-full block cursor-crosshair touch-manipulation"
            aria-label="Kanvas Arena Benteng Terapi"
          />
        </div>

        {/* In-Game Infusion TPM Mini-Drawer */}
        {showCalcDrawer && (
          <div className="v18-card-sm absolute top-3 right-3 w-[300px] sm:w-[330px] bg-[#F2EFEB] p-4 z-20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-bold text-xl text-[#2D2926]">
                Kalibrasi Laju Infus (TPM)
              </h4>
              <button
                type="button"
                onClick={() => setShowCalcDrawer(false)}
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center border-2 border-transparent hover:border-[#2D2926] hover:bg-white cursor-pointer"
                aria-label="Tutup kalkulator mini"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-[#2D2926]/80 mb-3">
              {scenario.infusionConfig.enabled
                ? `Target ${scenario.infusionConfig.drugName}: ${scenario.infusionConfig.minTpm}–${scenario.infusionConfig.maxTpm} TPM (Therapeutic Window).`
                : 'Simulasi laju infus pendukung: TPM = (Volume mL × Faktor Tetes) / (Jam × 60).'}
            </p>

            <div className="space-y-2.5 text-xs">
              <label className="block">
                <span className="font-bold text-[#2D2926]">Volume Cairan (mL): {infVol} mL</span>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={50}
                  value={infVol}
                  onChange={(e) => setInfVol(Number(e.target.value))}
                  className="w-full accent-[#FF5A5F]"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]">Durasi Pemberian: {infHours} jam</span>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={0.5}
                  value={infHours}
                  onChange={(e) => setInfHours(Number(e.target.value))}
                  className="w-full accent-[#FF5A5F]"
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInfFactor(20)}
                  className={`flex-1 min-h-[40px] border-2 border-[#2D2926] text-xs font-bold uppercase cursor-pointer ${
                    infFactor === 20
                      ? 'bg-[#FF5A5F] text-white'
                      : 'bg-white text-[#2D2926]'
                  }`}
                >
                  Makro (20)
                </button>
                <button
                  type="button"
                  onClick={() => setInfFactor(60)}
                  className={`flex-1 min-h-[40px] border-2 border-[#2D2926] text-xs font-bold uppercase cursor-pointer ${
                    infFactor === 60
                      ? 'bg-[#FF5A5F] text-white'
                      : 'bg-white text-[#2D2926]'
                  }`}
                >
                  Mikro (60)
                </button>
              </div>
              <div
                className={`p-2.5 border-2 border-[#2D2926] font-mono text-center font-bold tabular-nums ${
                  isTpmInWindow
                    ? 'bg-[#E8EFEA] text-[#2D2926]'
                    : 'bg-[#FF5A5F] text-white'
                }`}
              >
                {currentTpm} TPM · {isTpmInWindow ? 'Dalam Therapeutic Window' : 'Di Luar Rentang Aman!'}
              </div>
            </div>
          </div>
        )}

        {/* Victory / Defeat Overlay Modal */}
        {hudState.outcome !== 'playing' && (
          <div className="absolute inset-0 bg-[#2D2926]/75 flex items-center justify-center p-4 z-30">
            <div className="v18-card bg-[#F2EFEB] max-w-md w-full p-6 text-center space-y-4">
              {hudState.outcome === 'victory' ? (
                <>
                  <div className="w-12 h-12 bg-[#FFD166] border-2 border-[#2D2926] text-[#2D2926] mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-3xl text-[#2D2926]">
                    Terapi Berhasil Menyelamatkan {patient.name}!
                  </h3>
                  <p className="text-sm text-[#2D2926]/80 leading-relaxed">
                    Kesehatan Sel tersisa {hudState.organHealth}% dengan beban toksisitas {hudState.toxicity}%.
                    {hudState.stoppedEarly
                      ? ' Meski sempat terjadi mutasi resisten akibat penghentian dini, kamu berhasil memulihkannya!'
                      : ' Kamu menerapkan farmakoterapi rasional dengan sangat baik.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playSuccess();
                      const stars = hudState.organHealth >= 85 && !hudState.stoppedEarly ? 3 : 2;
                      onVictory(stars);
                    }}
                    className="v18-btn w-full min-h-[48px] px-5 py-3 bg-[#FF5A5F] hover:bg-[#EB494E] text-white font-display font-bold text-lg cursor-pointer"
                  >
                    Lanjut ke Konseling Kepulangan
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-display font-bold text-3xl text-[#FF5A5F]">
                    Kondisi Sel Melemah — Ulangi Terapi
                  </h3>
                  <p className="text-sm text-[#2D2926]/80 leading-relaxed">
                    Patogen berhasil menembus pertahanan sel. Periksa pemilihan menara yang sesuai, hindari
                    penumpukan toksik, dan jaga laju infus TPM di rentang aman.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetArena}
                      className="v18-btn flex-1 min-h-[44px] px-4 py-2.5 bg-[#FF5A5F] text-white font-bold uppercase text-xs tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Coba Lagi</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExit}
                      className="v18-btn min-h-[44px] px-4 py-2.5 bg-white text-xs font-bold uppercase tracking-wider text-[#2D2926] cursor-pointer"
                    >
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tower Placement Palette */}
      <div className="v18-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-display font-bold text-xl text-[#2D2926]">
            Pilih Menara Terapi Modern &amp; Pos Herbal (Ketuk tanda + pada kanvas)
          </h3>
          <span className="font-mono text-[11px] font-bold uppercase text-[#2D2926]/70">
            Ketuk menara terpasang untuk melepas &amp; refund 60%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenario.allowedTowers.map((tId) => {
            const tower = TOWERS[tId];
            const active = selectedTowerTool === tId;
            return (
              <button
                key={tId}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setSelectedTowerTool(tId);
                }}
                className={`text-left p-3.5 transition-all min-h-[44px] cursor-pointer ${
                  active
                    ? 'v18-card-sm bg-[#FFD166]/45'
                    : 'bg-[#F2EFEB] border-2 border-[#2D2926]/25 hover:border-[#2D2926]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-display font-bold text-lg text-[#2D2926] leading-none">
                    {tower.name}
                  </span>
                  <span className="font-mono text-xs font-bold bg-white border border-[#2D2926] px-1.5 py-0.5 text-[#2D2926] tabular-nums">
                    {tower.cost} E
                  </span>
                </div>
                <div className="font-mono text-[10px] font-bold uppercase text-[#FF5A5F] mb-1">
                  {tower.category === 'herbal' ? 'Herbal Mbah Sekar' : 'Terapi Modern'} · {tower.targetType}
                </div>
                <p className="text-[11px] text-[#2D2926]/75 leading-snug">{tower.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
