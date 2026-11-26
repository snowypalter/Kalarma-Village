import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Clock,
  CloudSun,
  Compass,
  Droplets,
  Fish,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Home,
  ShieldCheck,
  Shirt,
  Sparkles,
  Sprout,
  Star,
  Stethoscope,
  Store,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { ClinicalScreening } from './components/ClinicalScreening';
import { GameHUD, HudActionPage } from './components/GameHUD';
import { LearningModeModal } from './components/LearningModeModal';
import { TherapyDefenseCanvas } from './components/TherapyDefenseCanvas';
import { TitleScreen } from './components/TitleScreen';
import { VillageDiorama3D, VisitableBuildingId } from './components/VillageDiorama3D';
import { RpgTabId, VillageRpgShell } from './components/VillageRpgShell';
import { VisualNovelDialog } from './components/VisualNovelDialog';
import { CASES } from './data/cases';
import { AVATARS, CHARACTERS, VILLAGE_KEY_ART, WEATHER_INFO, getRankForXp } from './data/characters';
import { FORMULARY_DATA } from './data/formulary';
import {
  BUILDING_UPGRADES,
  DAILY_QUESTS,
  FishingSpeciesEntry,
  HerbalEncyclopediaEntry,
  UpgradableBuildingId,
  getClinicUpgradeBonus,
  getGardenUpgradeBonus,
  getPondUpgradeBonus,
} from './data/villageRpgData';
import {
  AvatarId,
  CaseScenario,
  CaseStage,
  WeatherType,
} from './types/pharmacy';
import {
  CaughtFishRecord,
  DEFAULT_BUILDING_LEVELS,
  DEFAULT_INVENTORY,
  DEFAULT_SAVE_DATA,
  DailyQuestProgress,
  GraphicsQuality,
  createDefaultDailyQuest,
  getLocalDateKey,
  hasSavedAdventure,
  loadGameSave,
  persistGameSave,
} from './utils/saveSystem';
import { soundFX } from './utils/sound';

const WEATHER_ORDER: WeatherType[] = [
  WeatherType.CERAH_HANGAT,
  WeatherType.HUJAN_LEMBAP,
  WeatherType.ANGIN_PANCAROBA,
  WeatherType.KABUT_MALAM,
];

interface PharmacistMedal {
  id: 'bronze' | 'silver' | 'gold' | 'emerald';
  tier: string;
  title: string;
  requiredCases: number;
  description: string;
  ringColor: string;
  fillColor: string;
  ribbonColor: string;
  accentText: string;
  cardBg: string;
}

const PHARMACIST_MEDALS: PharmacistMedal[] = [
  {
    id: 'bronze',
    tier: 'Perunggu',
    title: 'Inisiat Apotek',
    requiredCases: 1,
    description: 'Menuntaskan 1 kasus klinis perdana di Klinik Desa Asklepios, Kalarma Village.',
    ringColor: '#B45309',
    fillColor: '#FFD166',
    ribbonColor: '#FF5A5F',
    accentText: 'text-[#92400E]',
    cardBg: 'bg-[#FFFDF5]',
  },
  {
    id: 'silver',
    tier: 'Perak',
    title: 'Penjaga Resep Rasional',
    requiredCases: 3,
    description: 'Menyelamatkan 3 warga dengan skrining dosis & interaksi tepat.',
    ringColor: '#475569',
    fillColor: '#E2E8F0',
    ribbonColor: '#64748B',
    accentText: 'text-[#334155]',
    cardBg: 'bg-[#F8FAFC]',
  },
  {
    id: 'gold',
    tier: 'Emas',
    title: 'Ahli Stewardship',
    requiredCases: 6,
    description: 'Menuntaskan 6 kasus klinis dan mencegah resistensi maupun interaksi berat.',
    ringColor: '#CA8A04',
    fillColor: '#FEF08A',
    ribbonColor: '#EAB308',
    accentText: 'text-[#854D0E]',
    cardBg: 'bg-[#FEFCE8]',
  },
  {
    id: 'emerald',
    tier: 'Zamrud',
    title: 'Apoteker Agung',
    requiredCases: 10,
    description: 'Menyembuhkan seluruh 10 warga dan menguasai terapi desa.',
    ringColor: '#2C6E63',
    fillColor: '#A7F3D0',
    ribbonColor: '#3B826E',
    accentText: 'text-[#2C6E63]',
    cardBg: 'bg-[#F0FDF9]',
  },
];

function getDailyClinicalTip(now: Date) {
  const dayNumber = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000
  );
  const drugIndex =
    ((dayNumber % FORMULARY_DATA.length) + FORMULARY_DATA.length) % FORMULARY_DATA.length;
  const monograph = FORMULARY_DATA[drugIndex];

  const aspects = [
    { label: 'Interaksi Obat', text: monograph.interactions },
    { label: 'Stabilitas & Penyimpanan', text: monograph.storageNote },
    { label: 'Mekanisme Kerja', text: monograph.mechanism },
    { label: 'Keamanan & Efek Samping', text: monograph.sideEffects },
  ];
  const aspectIndex = Math.floor(dayNumber / FORMULARY_DATA.length) % aspects.length;
  const aspect = aspects[(aspectIndex + aspects.length) % aspects.length];

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  return {
    monograph,
    focusLabel: aspect.label,
    factText: aspect.text,
    formattedDate,
    entryNumber: drugIndex + 1,
  };
}

const CONFETTI_CLASSES = [
  'confetti-1',
  'confetti-2',
  'confetti-3',
  'confetti-4',
  'confetti-5',
  'confetti-6',
  'confetti-7',
  'confetti-8',
  'confetti-9',
  'confetti-10',
];

const MedalEmblem: React.FC<{
  medal: PharmacistMedal;
  unlocked: boolean;
  size?: number;
  celebrate?: boolean;
}> = ({ medal, unlocked, size = 48, celebrate = false }) => {
  const showBurst = unlocked && celebrate;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {showBurst && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-[#FF5A5F]/80 animate-medal-ring pointer-events-none"
          />
          {CONFETTI_CLASSES.map((cls) => (
            <span key={cls} aria-hidden="true" className={`medal-confetti-dot ${cls}`} />
          ))}
        </>
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className={`relative z-10 shrink-0 transition-transform duration-300 ${
          unlocked ? (showBurst ? 'animate-medal-pop drop-shadow-md' : '') : 'opacity-45 grayscale'
        }`}
      >
        <path
          d="M21 6H30L32 22H23L21 6Z"
          fill={unlocked ? medal.ribbonColor : '#94A3B8'}
          opacity="0.9"
        />
        <path
          d="M43 6H34L32 22H41L43 6Z"
          fill={unlocked ? medal.ringColor : '#64748B'}
          opacity="0.95"
        />
        <circle
          cx="32"
          cy="38"
          r="20"
          fill={unlocked ? medal.fillColor : '#E2E8F0'}
          stroke={unlocked ? '#2D2926' : '#94A3B8'}
          strokeWidth="3"
        />
        <circle
          cx="32"
          cy="38"
          r="14.5"
          fill="none"
          stroke={unlocked ? medal.ringColor : '#94A3B8'}
          strokeWidth="1.4"
          strokeDasharray="3 2.5"
          opacity="0.7"
        />
        {unlocked ? (
          <>
            <rect x="29.5" y="29" width="5" height="18" rx="1.5" fill={medal.ringColor} />
            <rect x="23" y="35.5" width="18" height="5" rx="1.5" fill={medal.ringColor} />
          </>
        ) : (
          <circle cx="32" cy="38" r="4.5" fill="#94A3B8" opacity="0.6" />
        )}
      </svg>
    </div>
  );
};

export default function App() {
  const [initialSave] = useState(() => loadGameSave());
  const [showTitle, setShowTitle] = useState(true);
  const [hasStarted, setHasStarted] = useState(initialSave.hasStarted);
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(initialSave.selectedAvatar);
  const [weather, setWeather] = useState<WeatherType>(initialSave.weather);
  const [xp, setXp] = useState(initialSave.xp);
  const [coins, setCoins] = useState(initialSave.coins);
  const [completedCases, setCompletedCases] = useState<string[]>(initialSave.completedCases);
  const [isMuted, setIsMuted] = useState(() => {
    soundFX.setMuted(initialSave.isMuted);
    return initialSave.isMuted;
  });
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>(
    initialSave.graphicsQuality
  );
  const [equippedOutfitId, setEquippedOutfitId] = useState<string | null>(
    initialSave.equippedOutfitId
  );
  const [unlockedOutfitIds, setUnlockedOutfitIds] = useState<string[]>(
    initialSave.unlockedOutfitIds
  );
  const [equippedSkinId, setEquippedSkinId] = useState<string | null>(
    initialSave.equippedSkinId
  );
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(
    initialSave.unlockedSkinIds
  );
  const [equippedAccessoryId, setEquippedAccessoryId] = useState<string | null>(
    initialSave.equippedAccessoryId
  );
  const [unlockedAccessoryIds, setUnlockedAccessoryIds] = useState<string[]>(
    initialSave.unlockedAccessoryIds
  );
  const [inventory, setInventory] = useState<Record<string, number>>(initialSave.inventory);
  const [discoveredHerbs, setDiscoveredHerbs] = useState<string[]>(initialSave.discoveredHerbs);
  const [caughtFish, setCaughtFish] = useState<Record<string, CaughtFishRecord>>(
    initialSave.caughtFish
  );
  const [buildingLevels, setBuildingLevels] = useState<Record<string, number>>(
    initialSave.buildingLevels
  );
  const [unlockedExpansions, setUnlockedExpansions] = useState<string[]>(
    initialSave.unlockedExpansions
  );
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>(
    initialSave.claimedAchievements
  );
  const [dailyQuest, setDailyQuest] = useState<DailyQuestProgress>(initialSave.dailyQuest);

  // Case RPG State Machine
  const [caseStage, setCaseStage] = useState<CaseStage>(CaseStage.VILLAGE_HUB);
  const [activeCase, setActiveCase] = useState<CaseScenario | null>(null);
  const [lastStars, setLastStars] = useState<number>(3);
  const [counselingDone, setCounselingDone] = useState(false);
  const [newlyUnlockedMedal, setNewlyUnlockedMedal] = useState<PharmacistMedal | null>(null);

  // HUD 3D Controls & Unified In-Game Overlays
  const [activeOverlay, setActiveOverlay] = useState<RpgTabId | null>(null);
  const [activeBuildingModal, setActiveBuildingModal] = useState<VisitableBuildingId | null>(null);
  const [timeStepTrigger, setTimeStepTrigger] = useState(0);
  const [zoomTrigger, setZoomTrigger] = useState<{ dir: 1 | -1; seq: number }>({ dir: 1, seq: 0 });
  const [focusHubTrigger, setFocusHubTrigger] = useState(0);
  const [navigateToBuilding, setNavigateToBuilding] = useState<{
    buildingId: VisitableBuildingId;
    seq: number;
  } | null>(null);
  const [formularyFocusId, setFormularyFocusId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  useEffect(() => {
    const checkDayRollover = () => {
      const now = new Date();
      const todayKey = getLocalDateKey(now);
      setCurrentDate((prev) =>
        prev.getFullYear() === now.getFullYear() &&
        prev.getMonth() === now.getMonth() &&
        prev.getDate() === now.getDate()
          ? prev
          : now
      );
      setDailyQuest((prev) =>
        prev.dateKey === todayKey ? prev : createDefaultDailyQuest(todayKey)
      );
    };
    const intervalId = window.setInterval(checkDayRollover, 60_000);
    window.addEventListener('focus', checkDayRollover);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', checkDayRollover);
    };
  }, []);

  useEffect(() => {
    persistGameSave({
      hasStarted,
      selectedAvatar,
      xp,
      coins,
      completedCases,
      weather,
      isMuted,
      graphicsQuality,
      equippedOutfitId,
      unlockedOutfitIds,
      equippedSkinId,
      unlockedSkinIds,
      equippedAccessoryId,
      unlockedAccessoryIds,
      inventory,
      discoveredHerbs,
      caughtFish,
      buildingLevels,
      unlockedExpansions,
      claimedAchievements,
      dailyQuest,
    });
  }, [
    hasStarted,
    selectedAvatar,
    xp,
    coins,
    completedCases,
    weather,
    isMuted,
    graphicsQuality,
    equippedOutfitId,
    unlockedOutfitIds,
    equippedSkinId,
    unlockedSkinIds,
    equippedAccessoryId,
    unlockedAccessoryIds,
    inventory,
    discoveredHerbs,
    caughtFish,
    buildingLevels,
    unlockedExpansions,
    claimedAchievements,
    dailyQuest,
  ]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLearnModal) setShowLearnModal(false);
        else if (activeBuildingModal) setActiveBuildingModal(null);
        else if (activeOverlay) setActiveOverlay(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showLearnModal, activeOverlay, activeBuildingModal]);

  const dailyClinicalTip = getDailyClinicalTip(currentDate);
  const avatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];
  const rankInfo = getRankForXp(xp);
  const totalCasesCount = CASES.length;
  const completedCount = completedCases.length;
  const unlockedMedals = PHARMACIST_MEDALS.filter((m) => completedCount >= m.requiredCases);
  const overallProgressPct = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalCasesCount)) * 100)
  );

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFX.setMuted(next);
    if (!next) soundFX.playClick();
  };

  const handleCycleWeather = () => {
    soundFX.playClick();
    const idx = WEATHER_ORDER.indexOf(weather);
    setWeather(WEATHER_ORDER[(idx + 1) % WEATHER_ORDER.length]);
  };

  const handleSelectCase = (scenario: CaseScenario) => {
    soundFX.playClick();
    setActiveOverlay(null);
    setShowLearnModal(false);
    setActiveCase(scenario);
    setWeather(scenario.recommendedWeather);
    setCaseStage(CaseStage.DIALOG_INTRO);
    setCounselingDone(false);
    setNewlyUnlockedMedal(null);
  };

  const bumpDailyMetric = (
    metricKey: 'casesDone' | 'herbsHarvested' | 'fishCaught' | 'shopActions',
    delta = 1
  ) => {
    const todayKey = getLocalDateKey();
    setDailyQuest((prev) => {
      const base = prev.dateKey === todayKey ? prev : createDefaultDailyQuest(todayKey);
      return {
        ...base,
        [metricKey]: base[metricKey] + delta,
      };
    });
  };

  const handleVictory = (stars: number) => {
    setLastStars(stars);
    setCaseStage(CaseStage.COUNSELING);
    const wingBonus = unlockedExpansions.includes('clinic_herb_wing') ? 15 : 0;
    const clinicUpgrade = getClinicUpgradeBonus(buildingLevels.clinic || 1);
    bumpDailyMetric('casesDone', 1);
    if (activeCase && !completedCases.includes(activeCase.id)) {
      const nextCount = completedCases.length + 1;
      const earnedNow = PHARMACIST_MEDALS.find((m) => m.requiredCases === nextCount) ?? null;
      setNewlyUnlockedMedal(earnedNow);
      setCompletedCases((prev) => [...prev, activeCase.id]);
      setXp((prev) => prev + activeCase.xpReward + clinicUpgrade.bonusXp);
      setCoins((prev) => prev + 45 + wingBonus + clinicUpgrade.bonusCoins);
    } else if (activeCase) {
      setNewlyUnlockedMedal(null);
      setXp((prev) => prev + 40 + clinicUpgrade.bonusXp);
      setCoins((prev) => prev + 15 + wingBonus + clinicUpgrade.bonusCoins);
    }
  };

  const handleHudNavigate = (page: HudActionPage) => {
    soundFX.playClick();
    setActiveBuildingModal(null);
    if (page === 'home') {
      setActiveOverlay(null);
      setShowLearnModal(false);
      setFocusHubTrigger((n) => n + 1);
      return;
    }
    if (page === 'learn') {
      setActiveOverlay(null);
      setShowLearnModal(true);
      return;
    }
    if (page === 'clinic') {
      const priorityCase =
        CASES.find((c) => !completedCases.includes(c.id) && c.recommendedWeather === weather) ||
        CASES.find((c) => !completedCases.includes(c.id));
      if (priorityCase) {
        handleSelectCase(priorityCase);
      } else {
        setActiveOverlay('quest');
      }
      return;
    }
    setActiveOverlay((prev) => (prev === page ? null : page));
  };

  const handleInteractBuilding = (buildingId: VisitableBuildingId) => {
    soundFX.playClick();
    setActiveOverlay(null);
    setShowLearnModal(false);
    setActiveBuildingModal(buildingId);
  };

  const handleWalkToBuilding = (buildingId: VisitableBuildingId) => {
    setNavigateToBuilding((prev) => ({ buildingId, seq: (prev?.seq || 0) + 1 }));
  };

  const handleHarvestHerb = (entry: HerbalEncyclopediaEntry, useSeedPack = false) => {
    const gardenBonus = getGardenUpgradeBonus(buildingLevels.garden || 1);
    const canConsumeSeed = useSeedPack && (inventory.herbal_seed_pack || 0) > 0;
    const bonusAmount =
      1 +
      (unlockedExpansions.includes('botanical_pavilion') ? 1 : 0) +
      gardenBonus.extraYield +
      (canConsumeSeed ? 1 : 0);
    setInventory((prev) => {
      const next = { ...prev };
      if (canConsumeSeed && (next.herbal_seed_pack || 0) > 0) {
        next.herbal_seed_pack -= 1;
        if (next.herbal_seed_pack <= 0) delete next.herbal_seed_pack;
      }
      next[entry.itemId] = (next[entry.itemId] || 0) + bonusAmount;
      return next;
    });
    setDiscoveredHerbs((prev) => (prev.includes(entry.id) ? prev : [...prev, entry.id]));
    setXp((prev) => prev + 8 + gardenBonus.extraXp + (canConsumeSeed ? 10 : 0));
    bumpDailyMetric('herbsHarvested', 1);
  };

  const handleCatchFish = (fish: FishingSpeciesEntry, sizeCm: number, usedBait: boolean) => {
    const pondBonus = getPondUpgradeBonus(buildingLevels.pond || 1);
    setInventory((prev) => {
      const next = { ...prev };
      if (usedBait && (next.wooden_bait || 0) > 0) {
        next.wooden_bait -= 1;
        if (next.wooden_bait <= 0) delete next.wooden_bait;
      }
      next[fish.itemId] = (next[fish.itemId] || 0) + 1;
      return next;
    });
    setCaughtFish((prev) => {
      const existing = prev[fish.id];
      return {
        ...prev,
        [fish.id]: {
          count: (existing?.count || 0) + 1,
          bestCm: Math.max(existing?.bestCm || 0, sizeCm),
        },
      };
    });
    if (pondBonus.coinBonus > 0) {
      setCoins((prev) => prev + pondBonus.coinBonus);
    }
    setXp((prev) => prev + 10);
    bumpDailyMetric('fishCaught', 1);
  };

  const handleBuyShopItem = (itemId: string, priceCoins: number, qty: number) => {
    if (coins < priceCoins) return;
    setCoins((prev) => prev - priceCoins);
    setInventory((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + qty,
    }));
    bumpDailyMetric('shopActions', 1);
  };

  const handleSellInventoryItem = (itemId: string, sellPrice: number) => {
    const cur = inventory[itemId] || 0;
    if (cur <= 0) return;
    setInventory((prev) => {
      const next = { ...prev };
      const remain = (next[itemId] || 0) - 1;
      if (remain <= 0) delete next[itemId];
      else next[itemId] = remain;
      return next;
    });
    setCoins((prev) => prev + sellPrice);
    bumpDailyMetric('shopActions', 1);
  };

  const handleCraftElixir = () => {
    if ((inventory.meniran_leaf || 0) < 1 || (inventory.temulawak_root || 0) < 1) return;
    setInventory((prev) => {
      const next = { ...prev };
      next.meniran_leaf = (next.meniran_leaf || 1) - 1;
      if (next.meniran_leaf <= 0) delete next.meniran_leaf;
      next.temulawak_root = (next.temulawak_root || 1) - 1;
      if (next.temulawak_root <= 0) delete next.temulawak_root;
      next.immun_tonic = (next.immun_tonic || 0) + 1;
      return next;
    });
    setXp((prev) => prev + 15);
    bumpDailyMetric('shopActions', 1);
  };

  const handleUseElixir = () => {
    if ((inventory.immun_tonic || 0) < 1) return;
    setInventory((prev) => {
      const next = { ...prev };
      next.immun_tonic = (next.immun_tonic || 1) - 1;
      if (next.immun_tonic <= 0) delete next.immun_tonic;
      return next;
    });
    setXp((prev) => prev + 25);
  };

  const handleEquipOutfit = (outfitId: string | null) => {
    setEquippedOutfitId(outfitId);
    if (outfitId !== null) {
      setEquippedSkinId(null);
    }
  };

  const handleUnlockOutfit = (outfitId: string, priceCoins: number) => {
    if (coins < priceCoins) return;
    setCoins((prev) => prev - priceCoins);
    setUnlockedOutfitIds((prev) => (prev.includes(outfitId) ? prev : [...prev, outfitId]));
    setEquippedSkinId(null);
    setEquippedOutfitId(outfitId);
  };

  const handleEquipSkin = (skinId: string | null) => {
    setEquippedSkinId(skinId);
  };

  const handleUnlockSkin = (skinId: string, priceCoins: number) => {
    if (coins < priceCoins) return;
    setCoins((prev) => prev - priceCoins);
    setUnlockedSkinIds((prev) => (prev.includes(skinId) ? prev : [...prev, skinId]));
    setEquippedSkinId(skinId);
  };

  const handleEquipAccessory = (accessoryId: string | null) => {
    setEquippedAccessoryId(accessoryId);
  };

  const handleUnlockAccessory = (accessoryId: string, priceCoins: number) => {
    if (coins < priceCoins) return;
    setCoins((prev) => prev - priceCoins);
    setUnlockedAccessoryIds((prev) => (prev.includes(accessoryId) ? prev : [...prev, accessoryId]));
    setEquippedAccessoryId(accessoryId);
  };

  const handleBuildExpansion = (plotId: string, costCoins: number, bonusXp: number) => {
    if (coins < costCoins || unlockedExpansions.includes(plotId)) return;
    setCoins((prev) => prev - costCoins);
    setUnlockedExpansions((prev) => [...prev, plotId]);
    setXp((prev) => prev + bonusXp);
  };

  const handleUpgradeBuilding = (
    buildingId: UpgradableBuildingId,
    nextLevel: 2 | 3,
    costCoins: number,
    bonusXp: number
  ) => {
    const curLevel = buildingLevels[buildingId] || 1;
    if (curLevel !== nextLevel - 1 || coins < costCoins) return;
    setCoins((prev) => prev - costCoins);
    setBuildingLevels((prev) => ({
      ...prev,
      [buildingId]: nextLevel,
    }));
    setXp((prev) => prev + bonusXp);
    bumpDailyMetric('shopActions', 1);
  };

  const handleClaimAchievement = (achievementId: string, rewardCoins: number) => {
    if (claimedAchievements.includes(achievementId)) return;
    setClaimedAchievements((prev) => [...prev, achievementId]);
    setCoins((prev) => prev + rewardCoins);
  };

  const handleClaimDailyQuest = (questId: string, rewardCoins: number, rewardXp: number) => {
    const def = DAILY_QUESTS.find((q) => q.id === questId);
    if (!def) return;
    const todayKey = getLocalDateKey();
    const curDaily = dailyQuest.dateKey === todayKey ? dailyQuest : createDefaultDailyQuest(todayKey);
    if (curDaily.claimedIds.includes(questId) || curDaily[def.metricKey] < def.target) return;
    setDailyQuest({
      ...curDaily,
      claimedIds: [...curDaily.claimedIds, questId],
    });
    setCoins((prev) => prev + rewardCoins);
    setXp((prev) => prev + rewardXp);
  };

  const renderLearningModal = () => {
    if (!showLearnModal) return null;
    return (
      <LearningModeModal
        onClose={() => setShowLearnModal(false)}
        onOpenFormulary={(drugId) => {
          if (drugId) setFormularyFocusId(drugId);
          setShowLearnModal(false);
          setShowTitle(false);
          setCaseStage(CaseStage.VILLAGE_HUB);
          setActiveOverlay('formulary');
        }}
        onOpenQuiz={() => {
          setShowLearnModal(false);
          setShowTitle(false);
          setCaseStage(CaseStage.VILLAGE_HUB);
          setActiveOverlay('clinical');
        }}
        onStartPlay={() => {
          setShowLearnModal(false);
          setHasStarted(true);
          setShowTitle(false);
        }}
      />
    );
  };

  const savedProgressExists = hasSavedAdventure({
    ...initialSave,
    hasStarted,
    selectedAvatar,
    xp,
    coins,
    completedCases,
    weather,
    isMuted,
    graphicsQuality,
    equippedOutfitId,
    unlockedOutfitIds,
    equippedSkinId,
    unlockedSkinIds,
    equippedAccessoryId,
    unlockedAccessoryIds,
    inventory,
    discoveredHerbs,
    caughtFish,
    buildingLevels,
    unlockedExpansions,
    claimedAchievements,
    dailyQuest,
  });

  const handleStartNewAdventure = () => {
    setHasStarted(true);
    setCaseStage(CaseStage.VILLAGE_HUB);
    setActiveCase(null);
    setActiveOverlay(null);
    setActiveBuildingModal(null);
    if (savedProgressExists) {
      setXp(DEFAULT_SAVE_DATA.xp);
      setCoins(DEFAULT_SAVE_DATA.coins);
      setCompletedCases([]);
      setEquippedOutfitId(DEFAULT_SAVE_DATA.equippedOutfitId);
      setUnlockedOutfitIds([...DEFAULT_SAVE_DATA.unlockedOutfitIds]);
      setEquippedSkinId(DEFAULT_SAVE_DATA.equippedSkinId);
      setUnlockedSkinIds([...DEFAULT_SAVE_DATA.unlockedSkinIds]);
      setEquippedAccessoryId(DEFAULT_SAVE_DATA.equippedAccessoryId);
      setUnlockedAccessoryIds([...DEFAULT_SAVE_DATA.unlockedAccessoryIds]);
      setInventory({ ...DEFAULT_INVENTORY });
      setDiscoveredHerbs([...DEFAULT_SAVE_DATA.discoveredHerbs]);
      setCaughtFish({});
      setBuildingLevels({ ...DEFAULT_BUILDING_LEVELS });
      setUnlockedExpansions([]);
      setClaimedAchievements([]);
      setDailyQuest(createDefaultDailyQuest());
    }
    setShowTitle(false);
  };

  const handleContinueAdventure = () => {
    setHasStarted(true);
    setCaseStage(CaseStage.VILLAGE_HUB);
    setActiveOverlay(null);
    setActiveBuildingModal(null);
    setShowTitle(false);
  };

  const handleResetSave = () => {
    setHasStarted(false);
    setXp(DEFAULT_SAVE_DATA.xp);
    setCoins(DEFAULT_SAVE_DATA.coins);
    setCompletedCases([]);
    setSelectedAvatar(DEFAULT_SAVE_DATA.selectedAvatar);
    setWeather(DEFAULT_SAVE_DATA.weather);
    setEquippedOutfitId(DEFAULT_SAVE_DATA.equippedOutfitId);
    setUnlockedOutfitIds([...DEFAULT_SAVE_DATA.unlockedOutfitIds]);
    setEquippedSkinId(DEFAULT_SAVE_DATA.equippedSkinId);
    setUnlockedSkinIds([...DEFAULT_SAVE_DATA.unlockedSkinIds]);
    setEquippedAccessoryId(DEFAULT_SAVE_DATA.equippedAccessoryId);
    setUnlockedAccessoryIds([...DEFAULT_SAVE_DATA.unlockedAccessoryIds]);
    setInventory({ ...DEFAULT_INVENTORY });
    setDiscoveredHerbs([...DEFAULT_SAVE_DATA.discoveredHerbs]);
    setCaughtFish({});
    setBuildingLevels({ ...DEFAULT_BUILDING_LEVELS });
    setUnlockedExpansions([]);
    setClaimedAchievements([]);
    setDailyQuest(createDefaultDailyQuest());
    setActiveCase(null);
    setActiveBuildingModal(null);
    setCaseStage(CaseStage.VILLAGE_HUB);
  };

  const claimableDailyCount = DAILY_QUESTS.filter(
    (q) =>
      dailyQuest.dateKey === getLocalDateKey(currentDate) &&
      !dailyQuest.claimedIds.includes(q.id) &&
      dailyQuest[q.metricKey] >= q.target
  ).length;

  if (showTitle) {
    return (
      <>
        <TitleScreen
          selectedAvatar={selectedAvatar}
          onSelectAvatar={setSelectedAvatar}
          hasSavedProgress={savedProgressExists}
          savedXp={xp}
          savedCasesCount={completedCases.length}
          totalCasesCount={totalCasesCount}
          weather={weather}
          onChangeWeather={setWeather}
          onStartNew={handleStartNewAdventure}
          onContinue={handleContinueAdventure}
          onResetSave={handleResetSave}
          onOpenLearnMode={() => setShowLearnModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          graphicsQuality={graphicsQuality}
          onChangeGraphicsQuality={setGraphicsQuality}
        />
        {renderLearningModal()}
      </>
    );
  }

  // CASE STAGES (Dialogue Intro, Clinical Screening, Tower Defense, Counseling)
  if (caseStage !== CaseStage.VILLAGE_HUB && activeCase) {
    return (
      <div className="min-h-[100dvh] bg-[#F2EFEB] text-[#2D2926] flex flex-col">
        <header className="sticky top-0 z-30 bg-[#FAF4E4]/95 border-b-[3px] border-[#6E4021]">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setCaseStage(CaseStage.VILLAGE_HUB);
                }}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#6E4021] hover:bg-[#522E16] border-2 border-[#E6B66B] text-[#FFF8E6] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Desa 3D</span>
              </button>
              <div className="min-w-0">
                <div className="font-display font-bold text-lg sm:text-xl text-[#2D2926] leading-none truncate">
                  {activeCase.title}
                </div>
                <div className="font-mono text-[10px] text-[#9A5016] uppercase truncate mt-0.5">
                  {CHARACTERS[activeCase.patientId].name} · {activeCase.diagnosis}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowLearnModal(true);
                }}
                className="min-h-[38px] px-2.5 py-1 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border-2 border-[#4A2B14] text-xs font-bold text-[#2D2926] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Mode Belajar</span>
              </button>
              <span className="hidden sm:inline-block font-mono text-xs font-bold bg-[#E8EFEA] border-2 border-[#2C6E63] text-[#1F4A42] px-2.5 py-1 rounded-xl tabular-nums">
                {xp} XP
              </span>
              <button
                type="button"
                onClick={handleToggleMute}
                className="min-h-[38px] min-w-[38px] rounded-xl bg-white border-2 border-[#6E4021] flex items-center justify-center cursor-pointer"
                aria-label={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-[#FF5A5F]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#2C6E63]" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-safe">
          {caseStage === CaseStage.DIALOG_INTRO && (
            <div className="space-y-4">
              <div className="v18-card relative overflow-hidden h-44 sm:h-60 bg-[#E7E2D8]">
                <img
                  src={VILLAGE_KEY_ART}
                  alt="Suasana Klinik Desa Asklepios"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2926]/85 via-[#2D2926]/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div className="text-white">
                    <div className="font-mono text-xs text-[#FFD166] uppercase tracking-wider">
                      Tahap 1 · Ruang Triase · {activeCase.diagnosis}
                    </div>
                    <div className="font-display font-bold text-2xl sm:text-3xl">
                      Pasien: {CHARACTERS[activeCase.patientId].name} (
                      {CHARACTERS[activeCase.patientId].species})
                    </div>
                  </div>
                </div>
              </div>

              <VisualNovelDialog
                lines={activeCase.introDialogs}
                onComplete={() => setCaseStage(CaseStage.SCREENING)}
                completeLabel="Buka Meja Skrining Klinis"
              />
            </div>
          )}

          {caseStage === CaseStage.SCREENING && (
            <ClinicalScreening
              scenario={activeCase}
              selectedAvatar={selectedAvatar}
              onPassScreening={() => setCaseStage(CaseStage.THERAPY_DEFENSE)}
              onBackToMap={() => setCaseStage(CaseStage.VILLAGE_HUB)}
            />
          )}

          {caseStage === CaseStage.THERAPY_DEFENSE && (
            <TherapyDefenseCanvas
              scenario={activeCase}
              weather={weather}
              selectedAvatar={selectedAvatar}
              onVictory={handleVictory}
              onExit={() => setCaseStage(CaseStage.VILLAGE_HUB)}
            />
          )}

          {caseStage === CaseStage.COUNSELING && (
            <div className="space-y-4">
              <div className="v18-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="v18-kicker mb-1">
                    Tahap 4 · Konseling Kepulangan &amp; Progresi Karier
                  </span>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#2D2926]">
                    Pasien {CHARACTERS[activeCase.patientId].name} Pulih!
                  </h2>
                </div>

                <div className="flex items-center gap-3 bg-[#FFD166] border-[2.5px] border-[#2D2926] shadow-[3px_3px_0px_#2D2926] px-4 py-2">
                  <div className="flex items-center gap-1 text-[#FF5A5F]">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${s <= lastStars ? 'fill-[#FF5A5F]' : 'opacity-25'}`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-sm font-bold text-[#2D2926] tabular-nums">
                    +{activeCase.xpReward} XP
                  </span>
                </div>
              </div>

              {!counselingDone ? (
                <VisualNovelDialog
                  lines={activeCase.counselingDialogs}
                  onComplete={() => setCounselingDone(true)}
                  completeLabel="Lihat Ringkasan Klinis"
                />
              ) : (
                <div className="v18-card p-5 sm:p-6 space-y-5">
                  {newlyUnlockedMedal && (
                    <div
                      className={`v18-card-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${newlyUnlockedMedal.cardBg}`}
                    >
                      <MedalEmblem medal={newlyUnlockedMedal} unlocked size={58} celebrate />
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#FF5A5F]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Penghargaan Medali Apoteker Baru!</span>
                        </div>
                        <h3 className="font-display font-bold text-2xl text-[#2D2926] mt-0.5">
                          Medali {newlyUnlockedMedal.tier}: {newlyUnlockedMedal.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#2D2926]/80 mt-0.5">
                          {newlyUnlockedMedal.description}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#2D2926] bg-[#FFD166] border-2 border-[#2D2926] px-2.5 py-1 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {completedCount}/{totalCasesCount} Kasus
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#E8EFEA] border-2 border-[#2D2926] text-[#2C6E63] flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                        Intisari Farmasi Klinis
                      </h3>
                      <p className="text-sm text-[#2D2926]/85 mt-1 leading-relaxed">
                        {activeCase.clinicalPearl}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F2EFEB] border-2 border-[#2D2926] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs uppercase text-[#2D2926]/70">
                        Pangkat &amp; Medali Apoteker Saat Ini
                      </div>
                      <div className="font-display font-bold text-xl text-[#2D2926]">
                        {rankInfo.current.title} ({xp} XP) · {unlockedMedals.length}/
                        {PHARMACIST_MEDALS.length} Medali
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setCaseStage(CaseStage.VILLAGE_HUB);
                        setActiveCase(null);
                        if (newlyUnlockedMedal) {
                          setActiveOverlay('achievement');
                        }
                        setNewlyUnlockedMedal(null);
                      }}
                      className="v18-btn min-h-[44px] px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#EB494E] text-white font-display font-bold text-lg whitespace-nowrap cursor-pointer"
                    >
                      Kembali ke Kalarma Village
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
        {renderLearningModal()}
      </div>
    );
  }

  // MAIN IN-GAME ZERO-SCROLL 3D WORLD + COZY UNIFIED HUD
  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#16302B] text-[#2D2926]">
      {/* Full-Viewport Interactive 3D Village */}
      <VillageDiorama3D
        embeddedInHud
        selectedAvatar={selectedAvatar}
        equippedOutfitId={equippedOutfitId}
        equippedSkinId={equippedSkinId}
        equippedAccessoryId={equippedAccessoryId}
        unlockedExpansions={unlockedExpansions}
        weather={weather}
        onChangeWeather={setWeather}
        completedCases={completedCases}
        activeCaseId={activeCase?.id ?? null}
        onSelectCase={handleSelectCase}
        onInteractBuilding={handleInteractBuilding}
        graphicsQuality={graphicsQuality}
        timeStepTrigger={timeStepTrigger}
        zoomTrigger={zoomTrigger}
        focusHubTrigger={focusHubTrigger}
        navigateToBuilding={navigateToBuilding}
      />

      {/* Unified Cozy In-Game HUD */}
      <GameHUD
        selectedAvatar={selectedAvatar}
        xp={xp}
        coins={coins}
        rankTitle={rankInfo.current.title}
        completedCount={completedCount}
        totalCases={totalCasesCount}
        weather={weather}
        isMuted={isMuted}
        claimableDailyCount={claimableDailyCount}
        dailyTipTitle={`Tips Harian · ${dailyClinicalTip.focusLabel}`}
        dailyTipDrugName={dailyClinicalTip.monograph.name}
        onNavigate={handleHudNavigate}
        onCycleWeather={handleCycleWeather}
        onStepTime={() => {
          soundFX.playClick();
          setTimeStepTrigger((n) => n + 1);
        }}
        onZoomIn={() => {
          soundFX.playClick();
          setZoomTrigger((prev) => ({ dir: 1, seq: prev.seq + 1 }));
        }}
        onZoomOut={() => {
          soundFX.playClick();
          setZoomTrigger((prev) => ({ dir: -1, seq: prev.seq + 1 }));
        }}
        onToggleMute={handleToggleMute}
      />

      {/* Structured Premium RPG Codex & Village Menu */}
      {activeOverlay && (
        <VillageRpgShell
          activeTab={activeOverlay}
          onChangeTab={setActiveOverlay}
          onClose={() => setActiveOverlay(null)}
          selectedAvatar={selectedAvatar}
          onSelectAvatar={setSelectedAvatar}
          xp={xp}
          coins={coins}
          completedCases={completedCases}
          activeCaseId={activeCase?.id ?? null}
          weather={weather}
          onChangeWeather={setWeather}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          graphicsQuality={graphicsQuality}
          onChangeGraphicsQuality={setGraphicsQuality}
          equippedOutfitId={equippedOutfitId}
          unlockedOutfitIds={unlockedOutfitIds}
          onEquipOutfit={handleEquipOutfit}
          onUnlockOutfit={handleUnlockOutfit}
          equippedSkinId={equippedSkinId}
          unlockedSkinIds={unlockedSkinIds}
          onEquipSkin={handleEquipSkin}
          onUnlockSkin={handleUnlockSkin}
          equippedAccessoryId={equippedAccessoryId}
          unlockedAccessoryIds={unlockedAccessoryIds}
          onEquipAccessory={handleEquipAccessory}
          onUnlockAccessory={handleUnlockAccessory}
          inventory={inventory}
          discoveredHerbs={discoveredHerbs}
          caughtFish={caughtFish}
          buildingLevels={buildingLevels}
          unlockedExpansions={unlockedExpansions}
          claimedAchievements={claimedAchievements}
          dailyQuest={dailyQuest}
          onSelectCase={handleSelectCase}
          onWalkToBuilding={handleWalkToBuilding}
          onOpenLearningMode={() => {
            setActiveOverlay(null);
            setShowLearnModal(true);
          }}
          onStepTime={() => setTimeStepTrigger((n) => n + 1)}
          onReturnToTitle={() => setShowTitle(true)}
          onResetSave={handleResetSave}
          onHarvestHerb={handleHarvestHerb}
          onCatchFish={handleCatchFish}
          onBuyShopItem={handleBuyShopItem}
          onSellInventoryItem={handleSellInventoryItem}
          onCraftElixir={handleCraftElixir}
          onUseElixir={handleUseElixir}
          onUpgradeBuilding={handleUpgradeBuilding}
          onBuildExpansion={handleBuildExpansion}
          onClaimAchievement={handleClaimAchievement}
          onClaimDailyQuest={handleClaimDailyQuest}
          formularyFocusId={formularyFocusId}
          onChangeFormularyFocusId={setFormularyFocusId}
          dailyTipTitle={`Tips Klinis Harian · ${dailyClinicalTip.focusLabel}`}
          dailyTipDrugName={dailyClinicalTip.monograph.name}
          dailyTipFact={dailyClinicalTip.factText}
          dailyTipDrugId={dailyClinicalTip.monograph.id}
        />
      )}

      {/* Modal Interaksi 6 Bangunan & Zona Kalarma Village */}
      {activeBuildingModal && (() => {
        const priorityCase =
          CASES.find((c) => !completedCases.includes(c.id) && c.recommendedWeather === weather) ||
          CASES.find((c) => !completedCases.includes(c.id)) ||
          null;

        const buildingMeta: Record<
          VisitableBuildingId,
          { title: string; subtitle: string; icon: React.ReactNode; badge: string }
        > = {
          clinic: {
            title: 'Klinik Desa Asklepios',
            subtitle: 'Pusat Triase, Skrining Resep & Terapi Warga Kalarma Village',
            icon: <Stethoscope className="w-5 h-5" />,
            badge: `Level ${buildingLevels.clinic || 1}/3 · Zona Medis Utama`,
          },
          house: {
            title: `Rumah Karakter · Pondok ${avatar.name}`,
            subtitle: 'Tempat istirahat apoteker muda, catatan pangkat & koleksi medali',
            icon: <Home className="w-5 h-5" />,
            badge: `${rankInfo.current.title}`,
          },
          boutique: {
            title: 'Butik Busana & Wardrobe Kalarma',
            subtitle: 'Studio 3D putar 360° untuk koleksi skin, busana & aksesoris hewan chibi',
            icon: <Shirt className="w-5 h-5" />,
            badge: `Level ${buildingLevels.boutique || 1}/3 · ${unlockedSkinIds.length} Skin`,
          },
          shop: {
            title: 'Toko Perlengkapan & Apotek',
            subtitle: 'Stok obat klinik, sediaan racik & pustaka dosis Guru Lios',
            icon: <Store className="w-5 h-5" />,
            badge: `Level ${buildingLevels.shop || 1}/3 · Logistik Farmasi`,
          },
          garden: {
            title: 'Kebun Herbal Mbah Sekar',
            subtitle: '6 petak tanaman obat berkhasiat dengan sumur irigasi alami',
            icon: <Sprout className="w-5 h-5" />,
            badge: `Level ${buildingLevels.garden || 1}/3 · ${WEATHER_INFO[weather].label}`,
          },
          pond: {
            title: 'Kolam Pemancingan Dermaga Selatan',
            subtitle: 'Dermaga kayu tepi mata air desa untuk bersantai mengamati ikan sungai',
            icon: <Fish className="w-5 h-5" />,
            badge: `Level ${buildingLevels.pond || 1}/3 · Dermaga Selatan`,
          },
          expansion: {
            title: 'Area Perluasan Lahan Timur',
            subtitle: 'Lahan kavling baru untuk pembangunan fasilitas lanjutan desa',
            icon: <Hammer className="w-5 h-5" />,
            badge: `${completedCount}/${totalCasesCount} Progres Desa`,
          },
        };

        const isUpgradableBuilding = BUILDING_UPGRADES.some((b) => b.id === activeBuildingModal);
        const meta = buildingMeta[activeBuildingModal];

        return (
          <div
            className="fixed inset-0 z-40 bg-[#2A160B]/70 flex items-center justify-center p-3 sm:p-5 pb-safe"
            role="dialog"
            aria-modal="true"
            aria-label={meta.title}
          >
            <div className="w-full max-w-2xl max-h-[90dvh] bg-[#FAF4E4] border-[3.5px] border-[#6E4021] rounded-2xl shadow-[0_12px_0_#432512,0_20px_38px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden text-[#2D2926]">
              <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-b from-[#9B6334] to-[#744522] border-b-[3px] border-[#4A2B14] text-[#FFF8E6] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD166] border-2 border-[#4A2B14] text-[#4A2B14] flex items-center justify-center shrink-0">
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#FFD166]">
                      {meta.badge}
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl leading-none truncate">
                      {meta.title}
                    </h2>
                    <p className="text-[11px] text-[#FFE8B3] mt-0.5 truncate">{meta.subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setActiveBuildingModal(null);
                  }}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-[#5C3419] hover:bg-[#FF5A5F] border-2 border-[#E6B66B] text-[#FFF8E6] inline-flex items-center justify-center shrink-0 cursor-pointer"
                  aria-label="Tutup panel bangunan"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto bg-[#F2EFEB] space-y-4">
                {activeBuildingModal === 'clinic' && (
                  <>
                    <div className="v18-card-sm p-4 bg-white space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-lg text-[#2D2926]">
                          Status Ruang Triase Klinik
                        </span>
                        <span className="font-mono text-xs font-bold bg-[#E8EFEA] text-[#2C6E63] border border-[#2C6E63] px-2.5 py-0.5 rounded-lg">
                          {completedCount}/{totalCasesCount} Kasus Tuntas
                        </span>
                      </div>
                      <p className="text-xs text-[#2D2926]/80 leading-relaxed">
                        {priorityCase
                          ? `Pasien prioritas saat ini adalah ${CHARACTERS[priorityCase.patientId].name} (${priorityCase.diagnosis}) yang sesuai dengan kondisi cuaca ${WEATHER_INFO[weather].label}.`
                          : 'Seluruh pasien desa saat ini telah pulih! Anda tetap dapat mengulang simulasi kasus melalui Daftar Pasien.'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {priorityCase && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBuildingModal(null);
                            handleSelectCase(priorityCase);
                          }}
                          className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FF5A5F] hover:bg-[#EB494E] border-2 border-[#2D2926] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Stethoscope className="w-4 h-4" />
                          <span>Tangani {CHARACTERS[priorityCase.patientId].name}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('quest');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Buka Daftar Pasien</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('clinical');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-[#E8EFEA] border-2 border-[#2C6E63] text-[#1F4A42] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Kalkulator &amp; Quiz</span>
                      </button>
                    </div>
                  </>
                )}

                {activeBuildingModal === 'house' && (
                  <>
                    <div className="v18-card-sm p-4 bg-white flex items-start gap-3.5">
                      <img
                        src={avatar.imagePath}
                        alt={avatar.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl border-2 border-[#6E4021] object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-display font-bold text-xl text-[#2D2926]">
                          {avatar.name} · {avatar.title}
                        </div>
                        <p className="text-xs text-[#2D2926]/80">{avatar.bonusDetail}</p>
                        <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] font-bold">
                          <span className="bg-[#FFD166] px-2 py-0.5 border border-[#2D2926] rounded">
                            {xp} XP
                          </span>
                          <span className="bg-[#E8EFEA] text-[#2C6E63] px-2 py-0.5 border border-[#2C6E63] rounded">
                            {unlockedMedals.length}/{PHARMACIST_MEDALS.length} Medali
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('wardrobe');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#6E4021] hover:bg-[#522E16] border-2 border-[#4A2B14] text-[#FFF8E6] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Buka Wardrobe Kostum</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('profile');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        <span>Profil &amp; Ganti Karakter</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('achievement');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] border-2 border-[#16302B] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Achievement &amp; Medali</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setShowLearnModal(true);
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-[#E8EFEA] border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Catatan Belajar</span>
                      </button>
                    </div>
                  </>
                )}

                {activeBuildingModal === 'boutique' && (
                  <>
                    <div className="v18-card-sm p-4 bg-white flex items-start gap-3.5">
                      <img
                        src={avatar.imagePath}
                        alt={avatar.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl border-2 border-[#6E4021] object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-display font-bold text-xl text-[#2D2926]">
                          Butik Jahit &amp; Koleksi Gaya Kalarma Village
                        </div>
                        <p className="text-xs text-[#2D2926]/80 leading-relaxed">
                          Coba pratinjau model 3D 360° dengan fitur zoom sebelum membeli! Tersedia 6 skin tematik (Petualang, Apoteker, Berkebun, Nelayan, Festival, Musiman), busana klinik, serta aksesoris 3D yang langsung mengubah tampilan karakter di desa.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] font-bold">
                          <span className="bg-[#FFE8A3] px-2 py-0.5 border border-[#6E4021] rounded">
                            {coins} Koin Daun
                          </span>
                          <span className="bg-[#E8EFEA] text-[#2C6E63] px-2 py-0.5 border border-[#2C6E63] rounded">
                            {unlockedSkinIds.length}/6 Skin · {unlockedAccessoryIds.length}/8 Aksesoris
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('wardrobe');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#6E4021] hover:bg-[#522E16] border-2 border-[#4A2B14] text-[#FFF8E6] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Shirt className="w-4 h-4" />
                        <span>Masuk Studio Wardrobe 3D</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('profile');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        <span>Profil &amp; Koleksi 22 Hewan</span>
                      </button>
                    </div>
                  </>
                )}

                {activeBuildingModal === 'shop' && (
                  <>
                    <div className="v18-card-sm p-4 bg-white space-y-2.5">
                      <div className="font-display font-bold text-lg text-[#2D2926]">
                        Persediaan Apotek &amp; Toko Perlengkapan Guru Lios
                      </div>
                      <p className="text-xs text-[#2D2926]/80">
                        Belanja umpan pancing, bibit herbal, atau jual hasil panen &amp; ikan. Anda juga dapat memeriksa stabilitas penyimpanan obat sesuai cuaca ({WEATHER_INFO[weather].label}).
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {FORMULARY_DATA.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setFormularyFocusId(item.id);
                              setActiveBuildingModal(null);
                              setActiveOverlay('formulary');
                            }}
                            className="p-2.5 rounded-xl bg-[#FAF4E4] hover:bg-[#FFE8A3] border-2 border-[#C8A46D] text-left cursor-pointer"
                          >
                            <div className="font-bold text-xs text-[#2D2926] truncate">
                              {item.name}
                            </div>
                            <div className="font-mono text-[10px] text-[#2C6E63] truncate">
                              {item.category}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('shop');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#6E4021] hover:bg-[#522E16] border-2 border-[#4A2B14] text-[#FFF8E6] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Store className="w-4 h-4" />
                        <span>Buka Toko Desa ({coins} Koin)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setFormularyFocusId(null);
                          setActiveBuildingModal(null);
                          setActiveOverlay('formulary');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] border-2 border-[#16302B] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Buka Formularium</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('clinical');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Kalkulator &amp; Quiz</span>
                      </button>
                    </div>
                  </>
                )}

                {activeBuildingModal === 'garden' && (
                  <>
                    <div className="v18-card-sm p-4 bg-white space-y-2.5">
                      <div className="font-display font-bold text-lg text-[#2D2926]">
                        6 Petak Fitofarmaka &amp; Obat Herbal Terstandar
                      </div>
                      <p className="text-xs text-[#2D2926]/80">
                        Kebun herbal terawat bersama Mbah Sekar. Sumur batu menjaga kelembapan akar meniran, temulawak, dan herbal Kalarma Village untuk diracik di klinik.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-xl bg-[#F0FDF9] border-2 border-[#2C6E63]/50 space-y-1">
                          <div className="font-bold text-xs text-[#1F4A42]">
                            Meniran (Phyllanthus niruri)
                          </div>
                          <p className="text-[11px] text-[#2D2926]/75">
                            Fitofarmaka imunomodulator untuk pemulihan ISPA &amp; faringitis viral.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FFFBEB] border-2 border-[#D97706]/50 space-y-1">
                          <div className="font-bold text-xs text-[#92400E]">
                            Temulawak (Curcuma xanthorrhiza)
                          </div>
                          <p className="text-[11px] text-[#2D2926]/75">
                            OHT hepatoprotektor &amp; pelindung mukosa lambung saat masa pemulihan.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('herbal');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] border-2 border-[#16302B] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sprout className="w-4 h-4" />
                        <span>Panen &amp; Ensiklopedia Herbal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setFormularyFocusId('meniran');
                          setActiveBuildingModal(null);
                          setActiveOverlay('formulary');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Monografi Formularium</span>
                      </button>
                    </div>
                  </>
                )}

                {activeBuildingModal === 'pond' && (
                  <>
                    <div className="v18-card-sm p-4 bg-white space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-lg text-[#2D2926]">
                          Ekosistem Mata Air &amp; Dermaga Kayu
                        </span>
                        <span className="font-mono text-[11px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#0284C7] px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5" />
                          Air Jernih
                        </span>
                      </div>
                      <p className="text-xs text-[#2D2926]/80 leading-relaxed">
                        Dermaga pemancingan di tepi kolam selatan menampung beragam ikan sungai lokal. Lempar kail untuk mengisi Koleksi Ikan Kalarma Village atau ubah cuaca &amp; waktu di tepi air.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('fishing');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] border-2 border-[#0C4A6E] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Fish className="w-4 h-4" />
                        <span>Memancing &amp; Koleksi Ikan</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCycleWeather}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-white border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CloudSun className="w-4 h-4" />
                        <span>Ubah Cuaca ({WEATHER_INFO[weather].label})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setTimeStepTrigger((n) => n + 1);
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Ganti Fase Waktu</span>
                      </button>
                    </div>
                  </>
                )}

                {activeBuildingModal === 'expansion' && (
                  <>
                    <div className="v18-card-sm p-4 bg-white space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-lg text-[#2D2926]">
                          Kavling Pengembangan Kalarma Village
                        </span>
                        <span className="font-mono text-xs font-bold bg-[#FFFBEB] text-[#92400E] border border-[#D97706] px-2.5 py-0.5 rounded-lg">
                          {overallProgressPct}% Kesiapan
                        </span>
                      </div>
                      <p className="text-xs text-[#2D2926]/80 leading-relaxed">
                        Patok kayu di padang rumput timur menandai zona perluasan desa. Buka Manajemen Perluasan Lahan untuk membangun fasilitas baru seperti Paviliun Herbal &amp; Sayap Klinik.
                      </p>
                      <div className="text-xs font-bold text-[#2C6E63] inline-flex items-center gap-1.5">
                        <HeartHandshake className="w-4 h-4" />
                        <span>
                          Progres dukungan warga: {completedCount} dari {totalCasesCount} kasus selesai ({xp} XP · {coins} Koin Daun)
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('expansion');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#6E4021] hover:bg-[#522E16] border-2 border-[#4A2B14] text-[#FFF8E6] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Hammer className="w-4 h-4" />
                        <span>Manajemen Perluasan Lahan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setActiveBuildingModal(null);
                          setActiveOverlay('quest');
                        }}
                        className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] border-2 border-[#16302B] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Lihat Misi Warga</span>
                      </button>
                    </div>
                  </>
                )}

                {isUpgradableBuilding && (
                  <div className="pt-3 border-t border-[#D6BE93] flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#6E4021]">
                      Tingkatkan fasilitas bangunan untuk bonus permanen.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setActiveBuildingModal(null);
                        setActiveOverlay('upgrade');
                      }}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#FFE8A3] hover:bg-[#FFD166] border-2 border-[#6E4021] text-[#3E210F] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>Upgrade Bangunan</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {renderLearningModal()}
    </div>
  );
}
