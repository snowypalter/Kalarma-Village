import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Anchor,
  ArrowUpCircle,
  Award,
  Backpack,
  BookOpen,
  Building2,
  Calculator,
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CloudSun,
  Coins,
  Compass,
  Droplets,
  Eye,
  Fish,
  FlaskConical,
  Glasses,
  GraduationCap,
  Hammer,
  Home,
  Lightbulb,
  Lock,
  Map as MapIcon,
  Monitor,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ScrollText,
  Settings,
  Shirt,
  ShoppingBag,
  Sparkles,
  Sprout,
  Stethoscope,
  Store,
  Trophy,
  User,
  Users,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { CASES } from '../data/cases';
import { AVATARS, CHARACTERS, WEATHER_INFO, getRankForXp } from '../data/characters';
import {
  BUILDING_UPGRADES,
  DAILY_QUESTS,
  EXPANSION_PLOTS,
  FISHING_SPECIES,
  FishingSpeciesEntry,
  HERBAL_ENCYCLOPEDIA,
  HerbalEncyclopediaEntry,
  INVENTORY_CATALOG,
  SHOP_ITEMS,
  UpgradableBuildingId,
  VILLAGE_ACHIEVEMENTS,
  WARDROBE_ACCESSORIES,
  WARDROBE_OUTFITS,
  WARDROBE_SKINS,
  applyDiscountPrice,
  applySellBonusPrice,
  countTotalFish,
  getBoutiqueDiscountRate,
  getGardenUpgradeBonus,
  getPondUpgradeBonus,
  getShopTradeModifiers,
} from '../data/villageRpgData';
import {
  AvatarId,
  CaseScenario,
  CharacterId,
  EmotionType,
  WeatherType,
} from '../types/pharmacy';
import { CaughtFishRecord, DailyQuestProgress, GraphicsQuality } from '../utils/saveSystem';
import { soundFX } from '../utils/sound';
import { CalculatorSuite } from './CalculatorSuite';
import { CharacterPortrait } from './CharacterPortrait';
import { CharacterPreview3D } from './CharacterPreview3D';
import { ClinicalQuiz } from './ClinicalQuiz';
import { FormularyBook } from './FormularyBook';
import { VISITABLE_BUILDINGS, VisitableBuildingId } from './VillageDiorama3D';

export type RpgTabId =
  | 'profile'
  | 'wardrobe'
  | 'achievement'
  | 'quest'
  | 'daily'
  | 'map'
  | 'inventory'
  | 'herbal'
  | 'fishing'
  | 'formulary'
  | 'clinical'
  | 'shop'
  | 'upgrade'
  | 'expansion'
  | 'settings';

type RpgRealmId = 'character' | 'adventure' | 'codex' | 'village';

const REALM_CONFIG: Array<{
  id: RpgRealmId;
  label: string;
  tabs: Array<{ id: RpgTabId; label: string; icon: React.ReactNode }>;
}> = [
  {
    id: 'character',
    label: 'Karakter',
    tabs: [
      { id: 'profile', label: 'Profil Karakter', icon: <User className="w-3.5 h-3.5" /> },
      { id: 'wardrobe', label: 'Wardrobe', icon: <Shirt className="w-3.5 h-3.5" /> },
      { id: 'achievement', label: 'Achievement', icon: <Trophy className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'adventure',
    label: 'Petualangan',
    tabs: [
      { id: 'quest', label: 'Quest Journal', icon: <ScrollText className="w-3.5 h-3.5" /> },
      { id: 'daily', label: 'Daily Quest', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
      { id: 'map', label: 'Map Desa', icon: <MapIcon className="w-3.5 h-3.5" /> },
      { id: 'inventory', label: 'Inventory', icon: <Backpack className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'codex',
    label: 'Ensiklopedia',
    tabs: [
      { id: 'herbal', label: 'Herbal Encyclopedia', icon: <Sprout className="w-3.5 h-3.5" /> },
      { id: 'fishing', label: 'Fishing Collection', icon: <Fish className="w-3.5 h-3.5" /> },
      { id: 'formulary', label: 'Buku Obat', icon: <BookOpen className="w-3.5 h-3.5" /> },
      { id: 'clinical', label: 'Kalkulator & Quiz', icon: <Calculator className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'village',
    label: 'Desa & Sistem',
    tabs: [
      { id: 'shop', label: 'Toko Desa', icon: <Store className="w-3.5 h-3.5" /> },
      { id: 'upgrade', label: 'Upgrade Bangunan', icon: <ArrowUpCircle className="w-3.5 h-3.5" /> },
      { id: 'expansion', label: 'Perluasan Lahan', icon: <Hammer className="w-3.5 h-3.5" /> },
      { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-3.5 h-3.5" /> },
    ],
  },
];

function getRealmForTab(tab: RpgTabId): RpgRealmId {
  for (const realm of REALM_CONFIG) {
    if (realm.tabs.some((t) => t.id === tab)) return realm.id;
  }
  return 'character';
}

const NPC_DIRECTORY_LIST: CharacterId[] = [
  'lios',
  'alia',
  'bima',
  'sekar',
  'hana',
  'yuna',
  'koko',
  'bobi',
  'geri',
  'mimi',
  'nino',
  'riko',
  'pipi',
  'lili',
  'cici',
  'taro',
  'dodo',
  'sora',
];

const EMOTION_OPTIONS: Array<{ id: EmotionType; label: string }> = [
  { id: EmotionType.HAPPY, label: 'Senang' },
  { id: EmotionType.THINKING, label: 'Berpikir' },
  { id: EmotionType.PANICKED, label: 'Panik' },
  { id: EmotionType.SICK, label: 'Lemas' },
  { id: EmotionType.PROUD, label: 'Bangga' },
  { id: EmotionType.SERIOUS, label: 'Serius' },
];

const WEATHER_ORDER: WeatherType[] = [
  WeatherType.CERAH_HANGAT,
  WeatherType.HUJAN_LEMBAP,
  WeatherType.ANGIN_PANCAROBA,
  WeatherType.KABUT_MALAM,
];

interface MedalTier {
  id: 'bronze' | 'silver' | 'gold' | 'emerald';
  tier: string;
  title: string;
  requiredCases: number;
  description: string;
  ringColor: string;
  fillColor: string;
  ribbonColor: string;
}

const PHARMACIST_MEDALS: MedalTier[] = [
  {
    id: 'bronze',
    tier: 'Perunggu',
    title: 'Inisiat Apotek',
    requiredCases: 1,
    description: 'Menuntaskan 1 kasus klinis perdana di Klinik Desa Asklepios.',
    ringColor: '#B45309',
    fillColor: '#FFD166',
    ribbonColor: '#FF5A5F',
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
  },
  {
    id: 'emerald',
    tier: 'Zamrud',
    title: 'Apoteker Agung',
    requiredCases: 10,
    description: 'Menyembuhkan seluruh 10 warga Kalarma Village.',
    ringColor: '#2C6E63',
    fillColor: '#A7F3D0',
    ribbonColor: '#3B826E',
  },
];

const LeafCornerOrnament: React.FC<{ className?: string; flip?: boolean }> = ({
  className = '',
  flip = false,
}) => (
  <svg
    viewBox="0 0 36 28"
    fill="none"
    aria-hidden="true"
    className={`pointer-events-none select-none ${flip ? '-scale-x-100' : ''} ${className}`}
  >
    <path
      d="M4 20C4 11 11 5 21 6C19 14 14 21 4 20Z"
      fill="#76B947"
      stroke="#2E561D"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M15 24C16 16 23 11 32 13C29 20 23 25 15 24Z"
      fill="#9BD45B"
      stroke="#2E561D"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M6 19C11 14 15 11 19 8" stroke="#2E561D" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MAP_ZONES: Array<{
  id: VisitableBuildingId;
  name: string;
  role: string;
  mapLeftPct: number;
  mapTopPct: number;
  summary: string;
  targetTab: RpgTabId;
  actionLabel: string;
}> = [
  {
    id: 'house',
    name: 'Rumah Karakter',
    role: 'Tempat Istirahat & Koleksi Medali',
    mapLeftPct: 22,
    mapTopPct: 22,
    summary: 'Atur profil apoteker, ganti karakter pendamping, dan pantau progres pangkat.',
    targetTab: 'profile',
    actionLabel: 'Buka Profil Karakter',
  },
  {
    id: 'clinic',
    name: 'Klinik Desa Asklepios',
    role: 'Pusat Triase & Skrining Klinis',
    mapLeftPct: 52,
    mapTopPct: 18,
    summary: 'Periksa resep dokter, skrining interaksi obat, dan rawat warga yang sakit.',
    targetTab: 'quest',
    actionLabel: 'Buka Quest Journal',
  },
  {
    id: 'boutique',
    name: 'Butik Busana & Wardrobe',
    role: 'Studio 3D Skin, Busana & Aksesoris',
    mapLeftPct: 72,
    mapTopPct: 30,
    summary: 'Pratinjau 360°, lepas/pasang 6 skin tematik, busana, dan aksesoris 3D secara langsung.',
    targetTab: 'wardrobe',
    actionLabel: 'Masuk Butik Wardrobe',
  },
  {
    id: 'shop',
    name: 'Toko Perlengkapan & Apotek',
    role: 'Pasar Desa & Apotek Guru Lios',
    mapLeftPct: 81,
    mapTopPct: 48,
    summary: 'Beli umpan, bibit herbal, peralatan apotek, atau jual hasil panen dan ikan.',
    targetTab: 'shop',
    actionLabel: 'Masuk Toko',
  },
  {
    id: 'garden',
    name: 'Kebun Herbal Mbah Sekar',
    role: '6 Petak Tanaman Obat & Sumur Batu',
    mapLeftPct: 22,
    mapTopPct: 62,
    summary: 'Panen tanaman obat terstandar dan pelajari monografi di Ensiklopedia Herbal.',
    targetTab: 'herbal',
    actionLabel: 'Buka Herbal',
  },
  {
    id: 'pond',
    name: 'Kolam Pemancingan',
    role: 'Dermaga Kayu Mata Air Selatan',
    mapLeftPct: 52,
    mapTopPct: 65,
    summary: 'Lempar kail untuk menangkap spesies ikan sungai dan catat rekor di koleksi.',
    targetTab: 'fishing',
    actionLabel: 'Buka Pancing',
  },
  {
    id: 'expansion',
    name: 'Area Perluasan Lahan',
    role: 'Kavling Pembangunan Timur',
    mapLeftPct: 80,
    mapTopPct: 80,
    summary: 'Kelola pembangunan paviliun baru untuk meningkatkan kapasitas dan bonus desa.',
    targetTab: 'expansion',
    actionLabel: 'Kelola Lahan',
  },
];

export interface VillageRpgShellProps {
  activeTab: RpgTabId;
  onChangeTab: (tab: RpgTabId) => void;
  onClose: () => void;

  selectedAvatar: AvatarId;
  onSelectAvatar: (id: AvatarId) => void;
  xp: number;
  coins: number;
  completedCases: string[];
  activeCaseId: string | null;
  weather: WeatherType;
  onChangeWeather: (w: WeatherType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  graphicsQuality: GraphicsQuality;
  onChangeGraphicsQuality: (q: GraphicsQuality) => void;

  equippedOutfitId: string | null;
  unlockedOutfitIds: string[];
  onEquipOutfit: (id: string | null) => void;
  onUnlockOutfit: (outfitId: string, priceCoins: number) => void;

  equippedSkinId: string | null;
  unlockedSkinIds: string[];
  onEquipSkin: (id: string | null) => void;
  onUnlockSkin: (skinId: string, priceCoins: number) => void;

  equippedAccessoryId: string | null;
  unlockedAccessoryIds: string[];
  onEquipAccessory: (id: string | null) => void;
  onUnlockAccessory: (accessoryId: string, priceCoins: number) => void;

  inventory: Record<string, number>;
  discoveredHerbs: string[];
  caughtFish: Record<string, CaughtFishRecord>;
  buildingLevels: Record<string, number>;
  unlockedExpansions: string[];
  claimedAchievements: string[];
  dailyQuest: DailyQuestProgress;

  onSelectCase: (scenario: CaseScenario) => void;
  onWalkToBuilding: (buildingId: VisitableBuildingId) => void;
  onOpenLearningMode: () => void;
  onStepTime: () => void;
  onReturnToTitle: () => void;
  onResetSave: () => void;

  onHarvestHerb: (entry: HerbalEncyclopediaEntry, useSeedPack?: boolean) => void;
  onCatchFish: (fish: FishingSpeciesEntry, sizeCm: number, usedBait: boolean) => void;
  onBuyShopItem: (itemId: string, priceCoins: number, qty: number) => void;
  onSellInventoryItem: (itemId: string, sellPrice: number) => void;
  onCraftElixir: () => void;
  onUseElixir: () => void;
  onUpgradeBuilding: (
    buildingId: UpgradableBuildingId,
    nextLevel: 2 | 3,
    costCoins: number,
    bonusXp: number
  ) => void;
  onBuildExpansion: (plotId: string, costCoins: number, bonusXp: number) => void;
  onClaimAchievement: (achievementId: string, rewardCoins: number) => void;
  onClaimDailyQuest: (questId: string, rewardCoins: number, rewardXp: number) => void;

  formularyFocusId: string | null;
  onChangeFormularyFocusId: (id: string | null) => void;
  dailyTipTitle: string;
  dailyTipDrugName: string;
  dailyTipFact: string;
  dailyTipDrugId: string;
}

export const VillageRpgShell: React.FC<VillageRpgShellProps> = ({
  activeTab,
  onChangeTab,
  onClose,
  selectedAvatar,
  onSelectAvatar,
  xp,
  coins,
  completedCases,
  activeCaseId,
  weather,
  onChangeWeather,
  isMuted,
  onToggleMute,
  graphicsQuality,
  onChangeGraphicsQuality,
  equippedOutfitId,
  unlockedOutfitIds,
  onEquipOutfit,
  onUnlockOutfit,
  equippedSkinId,
  unlockedSkinIds,
  onEquipSkin,
  onUnlockSkin,
  equippedAccessoryId,
  unlockedAccessoryIds,
  onEquipAccessory,
  onUnlockAccessory,
  inventory,
  discoveredHerbs,
  caughtFish,
  buildingLevels,
  unlockedExpansions,
  claimedAchievements,
  dailyQuest,
  onSelectCase,
  onWalkToBuilding,
  onOpenLearningMode,
  onStepTime,
  onReturnToTitle,
  onResetSave,
  onHarvestHerb,
  onCatchFish,
  onBuyShopItem,
  onSellInventoryItem,
  onCraftElixir,
  onUseElixir,
  onUpgradeBuilding,
  onBuildExpansion,
  onClaimAchievement,
  onClaimDailyQuest,
  formularyFocusId,
  onChangeFormularyFocusId,
  dailyTipTitle,
  dailyTipDrugName,
  dailyTipFact,
  dailyTipDrugId,
}) => {
  const [questFilter, setQuestFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [invFilter, setInvFilter] = useState<'Semua' | 'Herbal' | 'Ikan' | 'Perlengkapan' | 'Racikan'>('Semua');
  const [selectedInvItem, setSelectedInvItem] = useState<string>('meniran_leaf');
  const [selectedMapZone, setSelectedMapZone] = useState<VisitableBuildingId>('clinic');
  const [clinicalSubTab, setClinicalSubTab] = useState<'calculator' | 'quiz'>('calculator');
  const [shopSubTab, setShopSubTab] = useState<'buy' | 'sell'>('buy');
  const [previewEmotion, setPreviewEmotion] = useState<EmotionType>(EmotionType.HAPPY);
  const [inspectedProfileCharId, setInspectedProfileCharId] = useState<CharacterId>(selectedAvatar);
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'avatar' | 'mentor' | 'villager'>('all');
  const [wardrobeSubTab, setWardrobeSubTab] = useState<'skins' | 'outfits' | 'accessories'>('skins');
  const [previewSkinId, setPreviewSkinId] = useState<string | null | undefined>(undefined);
  const [previewOutfitId, setPreviewOutfitId] = useState<string | null | undefined>(undefined);
  const [previewAccessoryId, setPreviewAccessoryId] = useState<string | null | undefined>(undefined);
  const [studioZoom, setStudioZoom] = useState<number>(1);
  const [studioAutoRotate, setStudioAutoRotate] = useState<boolean>(false);
  const [studioRotateStep, setStudioRotateStep] = useState<{ deltaRad: number; seq: number }>({
    deltaRad: 0,
    seq: 0,
  });
  const [studioResetSeq, setStudioResetSeq] = useState<number>(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Sync inspected character when player changes active avatar
  useEffect(() => {
    setInspectedProfileCharId(selectedAvatar);
  }, [selectedAvatar]);

  // Clear temporary try-on previews whenever leaving wardrobe tab
  useEffect(() => {
    if (activeTab !== 'wardrobe') {
      setPreviewSkinId(undefined);
      setPreviewOutfitId(undefined);
      setPreviewAccessoryId(undefined);
    }
  }, [activeTab]);

  // Interactive Fishing State
  const [fishingPhase, setFishingPhase] = useState<'idle' | 'casting' | 'bite'>('idle');
  const [lastCatchMsg, setLastCatchMsg] = useState<string | null>(null);
  const fishingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (fishingTimerRef.current) window.clearTimeout(fishingTimerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setFeedbackBanner(msg);
  };

  useEffect(() => {
    if (!feedbackBanner) return;
    const t = window.setTimeout(() => setFeedbackBanner(null), 3200);
    return () => window.clearTimeout(t);
  }, [feedbackBanner]);

  const activeRealmId = getRealmForTab(activeTab);
  const activeRealm = REALM_CONFIG.find((r) => r.id === activeRealmId) || REALM_CONFIG[0];
  const avatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];
  const equippedSkin = WARDROBE_SKINS.find((s) => s.id === equippedSkinId) || null;
  const equippedOutfit = WARDROBE_OUTFITS.find((o) => o.id === equippedOutfitId) || null;
  const equippedAccessory = WARDROBE_ACCESSORIES.find((a) => a.id === equippedAccessoryId) || null;

  // Resolved preview values for 3D Wardrobe Studio (Preview Before Buying)
  const effectivePreviewSkinId = previewSkinId !== undefined ? previewSkinId : equippedSkinId;
  const effectivePreviewOutfitId = previewOutfitId !== undefined ? previewOutfitId : equippedOutfitId;
  const effectivePreviewAccessoryId =
    previewAccessoryId !== undefined ? previewAccessoryId : equippedAccessoryId;
  const isTryOnActive =
    (previewSkinId !== undefined && previewSkinId !== equippedSkinId) ||
    (previewOutfitId !== undefined && previewOutfitId !== equippedOutfitId) ||
    (previewAccessoryId !== undefined && previewAccessoryId !== equippedAccessoryId);

  const previewSkinObj = WARDROBE_SKINS.find((s) => s.id === effectivePreviewSkinId) || null;
  const previewOutfitObj = WARDROBE_OUTFITS.find((o) => o.id === effectivePreviewOutfitId) || null;
  const previewAccObj =
    WARDROBE_ACCESSORIES.find((a) => a.id === effectivePreviewAccessoryId) || null;

  const resetStudioPreview = () => {
    setPreviewSkinId(undefined);
    setPreviewOutfitId(undefined);
    setPreviewAccessoryId(undefined);
  };

  const rankInfo = getRankForXp(xp);
  const completedCount = completedCases.length;
  const totalCasesCount = CASES.length;
  const overallProgressPct = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalCasesCount)) * 100)
  );
  const xpProgressPct = rankInfo.next
    ? Math.min(
        100,
        Math.round(
          ((xp - rankInfo.current.minXp) /
            Math.max(1, rankInfo.next.minXp - rankInfo.current.minXp)) *
            100
        )
      )
    : 100;

  const boutiqueDiscountRate = getBoutiqueDiscountRate(buildingLevels.boutique || 1);
  const shopTradeMods = getShopTradeModifiers(buildingLevels.shop || 1);
  const pondUpgradeBonus = getPondUpgradeBonus(buildingLevels.pond || 1);
  const gardenUpgradeBonus = getGardenUpgradeBonus(buildingLevels.garden || 1);
  const upgradedBuildingsCount = Object.values(buildingLevels).filter((lvl) => lvl >= 2).length;

  const achievementCtx = useMemo(
    () => ({
      completedCases: completedCount,
      xp,
      discoveredHerbs: discoveredHerbs.length,
      uniqueFishCaught: Object.keys(caughtFish).length,
      totalFishCaught: countTotalFish(caughtFish),
      unlockedOutfits: unlockedOutfitIds.length,
      unlockedExpansions: unlockedExpansions.length,
      upgradedBuildings: upgradedBuildingsCount,
    }),
    [
      completedCount,
      xp,
      discoveredHerbs.length,
      caughtFish,
      unlockedOutfitIds.length,
      unlockedExpansions.length,
      upgradedBuildingsCount,
    ]
  );

  const inventoryEntries = useMemo(() => {
    return Object.entries(inventory)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        itemId,
        qty,
        def: INVENTORY_CATALOG[itemId],
      }))
      .filter((entry) => Boolean(entry.def))
      .filter((entry) => invFilter === 'Semua' || entry.def.category === invFilter);
  }, [inventory, invFilter]);

  const activeInvDetail =
    inventoryEntries.find((entry) => entry.itemId === selectedInvItem)?.def ||
    inventoryEntries[0]?.def ||
    INVENTORY_CATALOG[selectedInvItem] ||
    INVENTORY_CATALOG.meniran_leaf;
  const activeInvQty = inventory[activeInvDetail.id] || 0;
  const activeInvSellPrice = applySellBonusPrice(
    activeInvDetail.sellCoins,
    shopTradeMods.sellBonusRate
  );

  const handleStartFishingCast = () => {
    const baitCount = inventory.wooden_bait || 0;
    if (baitCount <= 0) {
      soundFX.playClick();
      showToast('Umpan pelet habis. Beli umpan terlebih dahulu di Toko Desa.');
      return;
    }
    soundFX.playClick();
    setLastCatchMsg(null);
    setFishingPhase('casting');
    if (fishingTimerRef.current) window.clearTimeout(fishingTimerRef.current);
    fishingTimerRef.current = window.setTimeout(() => {
      setFishingPhase('bite');
      soundFX.playSuccess();
    }, 1150);
  };

  const handleReelFishingCatch = () => {
    if (fishingPhase !== 'bite') return;
    if (fishingTimerRef.current) window.clearTimeout(fishingTimerRef.current);
    const hasPierUpgrade = unlockedExpansions.includes('south_pier_upgrade');
    const weightedPool: FishingSpeciesEntry[] = [];
    for (const sp of FISHING_SPECIES) {
      let weight = sp.rarity === 'Umum' ? 4 : sp.rarity === 'Langka' ? 2 : 1;
      if (sp.preferredWeather === weather) weight += 3;
      if (hasPierUpgrade && sp.rarity !== 'Umum') weight += 2;
      if (pondUpgradeBonus.rareWeightBonus > 0 && sp.rarity !== 'Umum') {
        weight += pondUpgradeBonus.rareWeightBonus;
      }
      for (let i = 0; i < weight; i++) weightedPool.push(sp);
    }
    const picked = weightedPool[Math.floor(Math.random() * weightedPool.length)] || FISHING_SPECIES[0];
    const span = picked.maxCm - picked.minCm;
    const sizeCm = Math.round((picked.minCm + Math.random() * span) * 10) / 10;

    onCatchFish(picked, sizeCm, true);
    soundFX.playSuccess();
    setFishingPhase('idle');
    setLastCatchMsg(
      pondUpgradeBonus.coinBonus > 0
        ? `Berhasil menangkap ${picked.name} (${sizeCm} cm) + bonus +${pondUpgradeBonus.coinBonus} Koin!`
        : `Berhasil menangkap ${picked.name} sepanjang ${sizeCm} cm!`
    );
  };

  const activeMapZoneObj = MAP_ZONES.find((z) => z.id === selectedMapZone) || MAP_ZONES[0];
  const buildingCoord = VISITABLE_BUILDINGS.find((b) => b.id === selectedMapZone);

  return (
    <div
      className="fixed inset-0 z-40 bg-[#231208]/75 flex items-center justify-center p-2 sm:p-5 pb-safe"
      role="dialog"
      aria-modal="true"
      aria-label="Menu Petualangan Kalarma Village"
    >
      <div className="relative w-full max-w-6xl h-[92dvh] sm:h-[88dvh] bg-[#FAF2DD] border-[4px] border-[#5D351B] rounded-2xl shadow-[0_14px_0_#3E210F,0_24px_48px_rgba(0,0,0,0.55)] flex flex-col overflow-hidden text-[#2D2926]">
        {/* Wooden RPG Header with Leaf Ornaments */}
        <header className="relative px-4 sm:px-6 py-3 bg-gradient-to-b from-[#9A6032] via-[#7E4B23] to-[#633818] border-b-[3px] border-[#43230F] text-[#FFF8E6] shrink-0">
          <LeafCornerOrnament className="hidden sm:block absolute -top-2 left-2 w-8 h-6" />
          <LeafCornerOrnament className="hidden sm:block absolute -top-2 right-14 w-8 h-6" flip />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-[#E8BC74] bg-[#4A2B14] overflow-hidden shrink-0">
                <img
                  src={avatar.imagePath}
                  alt={avatar.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-xl sm:text-2xl leading-none truncate text-[#FFF8E6]">
                  Kalarma Village · Buku Petualangan
                </h2>
                <div className="text-[11px] sm:text-xs text-[#FFE5A3] mt-0.5 flex items-center gap-2 truncate">
                  <span className="truncate">{avatar.name}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{rankInfo.current.title}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono font-bold tabular-nums text-[#FFD166] shrink-0">
                    {coins} Koin Daun
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="min-h-[40px] min-w-[40px] rounded-xl bg-[#4A2B14] hover:bg-[#DC2626] border-2 border-[#E8BC74] text-[#FFF8E6] inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              aria-label="Tutup menu RPG"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Realm Level-1 Navigation */}
          <nav
            aria-label="Kategori Menu Utama"
            className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5"
          >
            {REALM_CONFIG.map((realm) => {
              const active = realm.id === activeRealmId;
              return (
                <button
                  key={realm.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onChangeTab(realm.tabs[0].id);
                  }}
                  className={`min-h-[38px] px-4 py-1.5 rounded-xl border-2 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                    active
                      ? 'bg-[#FFE59E] text-[#3E210F] border-[#FFF8E6] shadow-[0_2px_0_#3E210F]'
                      : 'bg-[#542F16]/85 text-[#FDE6B6] border-[#9E6A3A] hover:bg-[#6E4021]'
                  }`}
                >
                  {realm.label}
                </button>
              );
            })}
          </nav>
        </header>

        {/* Sub-Tab Bar for Active Realm */}
        <div className="px-4 sm:px-6 py-2 bg-[#EADAB8] border-b-2 border-[#C8A46D] flex items-center gap-1.5 overflow-x-auto shrink-0">
          {activeRealm.tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onChangeTab(tab.id);
                }}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#2C6E63] text-white border-[#16302B]'
                    : 'bg-[#FAF4E4] text-[#4A2B14] border-[#C8A46D] hover:bg-[#FFF6DA]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Toast Feedback */}
        {feedbackBanner && (
          <div
            role="status"
            className="mx-4 sm:mx-6 mt-3 px-4 py-2 rounded-xl bg-[#2C6E63] text-white border-2 border-[#16302B] text-xs font-bold flex items-center justify-between gap-2 shrink-0"
          >
            <span>{feedbackBanner}</span>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="text-white/80 hover:text-white cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Content Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F6EDD9]">
          {/* 1. PROFILE & KOLEKSI KARAKTER */}
          {activeTab === 'profile' && (() => {
            const inspectedChar = CHARACTERS[inspectedProfileCharId];
            const inspectedHeroMeta = AVATARS.find((a) => a.id === inspectedProfileCharId) || null;
            const isActiveHero = inspectedProfileCharId === selectedAvatar;
            const allCollectionIds: CharacterId[] = [
              ...AVATARS.map((a) => a.id),
              ...NPC_DIRECTORY_LIST,
            ];
            const filteredCollection = allCollectionIds.filter((cid) => {
              if (collectionFilter === 'all') return true;
              return CHARACTERS[cid].group === collectionFilter;
            });

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Column: Live 360° & Zoomable 3D Animal Showcase + Active Loadout */}
                <div className="lg:col-span-5 lg:sticky lg:top-0 bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-4 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-[#8B572A]">
                        {inspectedChar.species} ·{' '}
                        {inspectedChar.group === 'avatar'
                          ? 'Apoteker Pendamping'
                          : inspectedChar.group === 'mentor'
                            ? 'Tenaga Medis'
                            : 'Warga Desa'}
                      </div>
                      <h3 className="font-display font-bold text-3xl text-[#2D2926] leading-tight truncate">
                        {inspectedChar.name}
                      </h3>
                      <div className="text-xs font-semibold text-[#2C6E63]">{inspectedChar.role}</div>
                    </div>
                    {isActiveHero && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#2C6E63] text-white text-[11px] font-bold shrink-0">
                        Aktif di Dunia 3D
                      </span>
                    )}
                  </div>

                  {/* Interactive 360° 3D Viewport */}
                  <div className="relative h-64 sm:h-72 rounded-xl border-2 border-[#C8A46D] bg-gradient-to-b from-[#DCEFD8] via-[#EEF5DF] to-[#E5D3B3] overflow-hidden">
                    <CharacterPreview3D
                      characterId={inspectedProfileCharId}
                      outfitId={inspectedHeroMeta ? equippedOutfitId : undefined}
                      skinId={inspectedHeroMeta ? equippedSkinId : undefined}
                      accessoryId={inspectedHeroMeta ? equippedAccessoryId : undefined}
                      zoomScale={studioZoom}
                      onZoomChange={setStudioZoom}
                      autoRotate={studioAutoRotate}
                      rotateStepTrigger={studioRotateStep}
                      resetViewSeq={studioResetSeq}
                      className="w-full h-full"
                    />
                    <div className="pointer-events-none absolute top-2 left-2 px-2 py-1 rounded-lg bg-[#3E210F]/80 text-[#FFF8E6] text-[10px] font-semibold">
                      Seret untuk putar 360° · Scroll untuk zoom
                    </div>
                    <div className="pointer-events-none absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#3E210F]/80 text-[#FFD166] font-mono text-[10px] font-bold tabular-nums">
                      Zoom {studioZoom.toFixed(2)}x
                    </div>
                  </div>

                  {/* 360 Rotation & Zoom Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setStudioRotateStep((p) => ({ deltaRad: -Math.PI / 4, seq: p.seq + 1 }));
                        }}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-xs font-bold text-[#4A2B14] inline-flex items-center gap-1 cursor-pointer"
                        title="Putar kiri 45 derajat"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>-45°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setStudioAutoRotate((v) => !v);
                        }}
                        className={`min-h-[34px] px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                          studioAutoRotate
                            ? 'bg-[#2C6E63] text-white border-[#16302B]'
                            : 'bg-[#FAF4E4] text-[#4A2B14] border-[#9E7344] hover:bg-[#FFE8A3]'
                        }`}
                      >
                        {studioAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>360°</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setStudioRotateStep((p) => ({ deltaRad: Math.PI / 4, seq: p.seq + 1 }));
                        }}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-xs font-bold text-[#4A2B14] inline-flex items-center gap-1 cursor-pointer"
                        title="Putar kanan 45 derajat"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>+45°</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setStudioZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))));
                        }}
                        className="min-h-[34px] min-w-[34px] rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-[#4A2B14] inline-flex items-center justify-center cursor-pointer"
                        aria-label="Perkecil karakter"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setStudioZoom((z) => Math.min(1.75, Number((z + 0.15).toFixed(2))));
                        }}
                        className="min-h-[34px] min-w-[34px] rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-[#4A2B14] inline-flex items-center justify-center cursor-pointer"
                        aria-label="Perbesar karakter"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setStudioAutoRotate(false);
                          setStudioZoom(1);
                          setStudioResetSeq((s) => s + 1);
                        }}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-xs font-bold text-[#4A2B14] cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Bio & Bonus */}
                  <p className="text-xs text-[#2D2926]/85 leading-relaxed bg-[#FAF4E4] border border-[#D6BE93] rounded-lg p-3">
                    {inspectedHeroMeta ? inspectedHeroMeta.bonusDetail : inspectedChar.bio}
                  </p>

                  {/* If viewing a playable hero that isn't currently active, offer Select */}
                  {inspectedHeroMeta && !isActiveHero && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playSuccess();
                        onSelectAvatar(inspectedHeroMeta.id);
                        showToast(`${inspectedHeroMeta.name} kini menjadi apoteker aktif di desa!`);
                      }}
                      className="min-h-[40px] w-full px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] text-white text-xs font-bold cursor-pointer"
                    >
                      Pilih {inspectedHeroMeta.name} Sebagai Karakter Utama
                    </button>
                  )}

                  {/* Active Player Stats & Equipped Loadout */}
                  <div className="space-y-2 pt-2.5 border-t border-[#D6BE93]">
                    <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                      <span>Pangkat ({rankInfo.current.title})</span>
                      <span>
                        {xp} XP {rankInfo.next ? `(${xpProgressPct}%)` : '(Maksimum)'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#EADAB8] border border-[#9E7344] overflow-hidden">
                      <div className="h-full bg-[#2C6E63]" style={{ width: `${xpProgressPct}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-[#FAF4E4] border border-[#D6BE93]">
                        <div className="text-[#8B572A] font-medium">Skin Aktif</div>
                        <div className="font-bold text-[#2D2926] truncate">
                          {equippedSkin ? equippedSkin.name : 'Tanpa Skin'}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF4E4] border border-[#D6BE93]">
                        <div className="text-[#8B572A] font-medium">Busana</div>
                        <div className="font-bold text-[#2D2926] truncate">
                          {equippedOutfit ? equippedOutfit.name : 'Natural'}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF4E4] border border-[#D6BE93]">
                        <div className="text-[#8B572A] font-medium">Aksesoris</div>
                        <div className="font-bold text-[#2D2926] truncate">
                          {equippedAccessory ? equippedAccessory.name : 'Tidak Ada'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#5D351B] pt-1 tabular-nums">
                      <span>Pasien Sembuh: {completedCount}/{totalCasesCount}</span>
                      <span>Koin Daun: {coins}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      onChangeTab('wardrobe');
                    }}
                    className="min-h-[42px] w-full px-4 py-2 rounded-xl bg-[#6E4021] hover:bg-[#522E16] text-[#FFF8E6] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shirt className="w-4 h-4" />
                    <span>Buka Character Wardrobe &amp; Butik 3D</span>
                  </button>
                </div>

                {/* Right Column: Hero Selection + 22-Species Animal Collection */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Playable Hero Selection */}
                  <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-5 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                          Pilih Karakter Utama
                        </h3>
                        <p className="text-xs text-[#6E4021]">
                          4 Apoteker Hewan Chibi yang dapat dimainkan langsung di dunia 3D
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#2C6E63]">
                        Aktif: {avatar.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {AVATARS.map((av) => {
                        const isSel = av.id === selectedAvatar;
                        const isInspected = av.id === inspectedProfileCharId;
                        return (
                          <div
                            key={av.id}
                            className={`p-3 rounded-xl border-2 flex flex-col justify-between gap-2.5 transition-all ${
                              isSel
                                ? 'bg-[#FFE8A3] border-[#6E4021]'
                                : isInspected
                                  ? 'bg-[#F0FDF9] border-[#2C6E63]'
                                  : 'bg-[#FAF4E4] border-[#D6BE93]'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#6E4021] shrink-0 bg-white">
                                <img
                                  src={av.imagePath}
                                  alt={av.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                {isSel && (
                                  <span className="absolute top-1 right-1 w-4 h-4 rounded bg-[#2C6E63] text-white flex items-center justify-center">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-display font-bold text-lg text-[#2D2926] leading-none">
                                  {av.name}
                                </div>
                                <div className="text-[11px] font-semibold text-[#8B572A] mt-0.5">
                                  {av.species} · {av.title}
                                </div>
                                <p className="text-[11px] text-[#2D2926]/80 mt-1 line-clamp-2">
                                  {av.bonusDetail}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  soundFX.playClick();
                                  setInspectedProfileCharId(av.id);
                                }}
                                className="min-h-[34px] flex-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#FFF6DA] border border-[#9E7344] text-[11px] font-bold text-[#4A2B14] inline-flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat 3D</span>
                              </button>
                              <button
                                type="button"
                                disabled={isSel}
                                onClick={() => {
                                  soundFX.playSuccess();
                                  onSelectAvatar(av.id);
                                  setInspectedProfileCharId(av.id);
                                  showToast(`${av.name} (${av.species}) kini aktif di dunia 3D!`);
                                }}
                                className={`min-h-[34px] flex-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                  isSel
                                    ? 'bg-[#2C6E63] text-white cursor-default'
                                    : 'bg-[#6E4021] hover:bg-[#522E16] text-[#FFF8E6] cursor-pointer'
                                }`}
                              >
                                {isSel ? 'Dipilih' : 'Pilih Karakter'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Complete 22 Animal Species Collection Browser */}
                  <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                          Koleksi Hewan Kalarma Village ({allCollectionIds.length} Spesies)
                        </h3>
                        <p className="text-xs text-[#6E4021]">
                          Klik karakter hewan manapun untuk memutar model 3D 360° dan membaca profil spesiesnya
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { id: 'all', label: 'Semua' },
                          { id: 'avatar', label: 'Apoteker' },
                          { id: 'mentor', label: 'Medis' },
                          { id: 'villager', label: 'Warga' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setCollectionFilter(f.id as 'all' | 'avatar' | 'mentor' | 'villager');
                            }}
                            className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                              collectionFilter === f.id
                                ? 'bg-[#6E4021] text-[#FFF8E6] border-[#4A2B14]'
                                : 'bg-[#FAF4E4] text-[#4A2B14] border-[#C8A46D]'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {inspectedChar.group !== 'avatar' && (
                      <div className="p-3 rounded-xl bg-[#FAF4E4] border border-[#D6BE93] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <CharacterPortrait
                            characterId={inspectedProfileCharId}
                            emotion={previewEmotion}
                            size={44}
                          />
                          <div className="text-xs">
                            <div className="font-bold text-[#2D2926]">
                              Ekspresi Potret: {inspectedChar.name}
                            </div>
                            <div className="text-[#6E4021]">{inspectedChar.species}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {EMOTION_OPTIONS.map((em) => (
                            <button
                              key={em.id}
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setPreviewEmotion(em.id);
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-bold border cursor-pointer ${
                                previewEmotion === em.id
                                  ? 'bg-[#2C6E63] text-white border-[#16302B]'
                                  : 'bg-white text-[#4A2B14] border-[#C8A46D]'
                              }`}
                            >
                              {em.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {filteredCollection.map((cid) => {
                        const char = CHARACTERS[cid];
                        const isInspected = cid === inspectedProfileCharId;
                        return (
                          <button
                            key={cid}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setInspectedProfileCharId(cid);
                            }}
                            className={`text-left p-3 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-colors ${
                              isInspected
                                ? 'bg-[#E8EFEA] border-[#2C6E63]'
                                : 'bg-[#FAF4E4] border-[#D6BE93] hover:bg-[#FFF6DA]'
                            }`}
                          >
                            <CharacterPortrait
                              characterId={cid}
                              emotion={isInspected ? previewEmotion : EmotionType.HAPPY}
                              size={48}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-[10px] font-bold text-[#8B572A] uppercase truncate">
                                {char.species}
                              </div>
                              <div className="font-display font-bold text-base text-[#2D2926] leading-tight truncate">
                                {char.name}
                              </div>
                              <div className="text-[11px] font-semibold text-[#2C6E63] truncate">
                                {char.role}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. CHARACTER WARDROBE, SKIN, OUTFIT & ACCESSORY STUDIO 3D */}
          {activeTab === 'wardrobe' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Sticky 3D Turntable Studio */}
              <div className="lg:col-span-5 lg:sticky lg:top-0 bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-[#8B572A]">
                      Butik &amp; Studio Wardrobe 3D
                    </div>
                    <h3 className="font-display font-bold text-2xl text-[#2D2926] leading-none mt-0.5">
                      {avatar.name} · {avatar.species}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold bg-[#FFE8A3] border border-[#6E4021] text-[#3E210F] px-2.5 py-1 rounded-lg tabular-nums shrink-0">
                    {coins} Koin
                  </span>
                </div>

                {/* Quick Playable Animal Switcher right inside Wardrobe */}
                <div className="grid grid-cols-4 gap-1.5">
                  {AVATARS.map((av) => {
                    const active = av.id === selectedAvatar;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onSelectAvatar(av.id);
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold truncate cursor-pointer ${
                          active
                            ? 'bg-[#6E4021] text-[#FFF8E6] border-[#4A2B14]'
                            : 'bg-[#FAF4E4] text-[#4A2B14] border-[#D6BE93] hover:bg-[#FFE8A3]'
                        }`}
                        title={`${av.name} (${av.species})`}
                      >
                        {av.name}
                      </button>
                    );
                  })}
                </div>

                {/* Live Try-On / Preview Before Buying Banner */}
                {isTryOnActive && (
                  <div className="px-3 py-2 rounded-xl bg-[#FEF3C7] border-2 border-[#D97706] flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-[#92400E]">Mode Pratinjau Sebelum Membeli</div>
                      <div className="text-[11px] text-[#78350F] truncate">
                        {[
                          previewSkinObj ? previewSkinObj.name : effectivePreviewSkinId === null && previewSkinId === null ? 'Tanpa Skin' : null,
                          previewOutfitObj ? previewOutfitObj.name : effectivePreviewOutfitId === null && previewOutfitId === null ? 'Tanpa Busana' : null,
                          previewAccObj ? previewAccObj.name : effectivePreviewAccessoryId === null && previewAccessoryId === null ? 'Tanpa Aksesoris' : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        resetStudioPreview();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#92400E] text-white text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Kembali
                    </button>
                  </div>
                )}

                {/* Live 360° & Zoomable 3D Model Stage */}
                <div className="relative h-64 sm:h-72 rounded-xl border-2 border-[#C8A46D] bg-gradient-to-b from-[#DCEFD8] via-[#F2F6E4] to-[#E5D3B3] overflow-hidden">
                  <CharacterPreview3D
                    characterId={selectedAvatar}
                    outfitId={effectivePreviewOutfitId}
                    skinId={effectivePreviewSkinId}
                    accessoryId={effectivePreviewAccessoryId}
                    zoomScale={studioZoom}
                    onZoomChange={setStudioZoom}
                    autoRotate={studioAutoRotate}
                    rotateStepTrigger={studioRotateStep}
                    resetViewSeq={studioResetSeq}
                    className="w-full h-full"
                  />
                  <div className="pointer-events-none absolute top-2 left-2 px-2 py-1 rounded-lg bg-[#3E210F]/80 text-[#FFF8E6] text-[10px] font-semibold">
                    Seret 360° · Scroll Zoom
                  </div>
                  <div className="pointer-events-none absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#3E210F]/80 text-[#FFD166] font-mono text-[10px] font-bold tabular-nums">
                    {studioZoom.toFixed(2)}x
                  </div>
                </div>

                {/* 360° Rotation & Zoom Controls */}
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStudioRotateStep((p) => ({ deltaRad: -Math.PI / 4, seq: p.seq + 1 }));
                      }}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-xs font-bold text-[#4A2B14] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>-45°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStudioAutoRotate((v) => !v);
                      }}
                      className={`min-h-[34px] px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                        studioAutoRotate
                          ? 'bg-[#2C6E63] text-white border-[#16302B]'
                          : 'bg-[#FAF4E4] text-[#4A2B14] border-[#9E7344] hover:bg-[#FFE8A3]'
                      }`}
                    >
                      {studioAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>360°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStudioRotateStep((p) => ({ deltaRad: Math.PI / 4, seq: p.seq + 1 }));
                      }}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-xs font-bold text-[#4A2B14] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>+45°</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStudioZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))));
                      }}
                      className="min-h-[34px] min-w-[34px] rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-[#4A2B14] inline-flex items-center justify-center cursor-pointer"
                      aria-label="Perkecil karakter"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStudioZoom((z) => Math.min(1.75, Number((z + 0.15).toFixed(2))));
                      }}
                      className="min-h-[34px] min-w-[34px] rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-[#4A2B14] inline-flex items-center justify-center cursor-pointer"
                      aria-label="Perbesar karakter"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStudioAutoRotate(false);
                        setStudioZoom(1);
                        setStudioResetSeq((s) => s + 1);
                      }}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-xs font-bold text-[#4A2B14] cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Active Equipped Slots with Unequip Controls */}
                <div className="pt-2.5 border-t border-[#D6BE93] space-y-2 text-xs">
                  <div className="font-bold text-[#4A2B14]">Perlengkapan Terpasang Saat Ini</div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#FAF4E4] border border-[#D6BE93]">
                    <div className="min-w-0">
                      <span className="text-[#8B572A]">Skin: </span>
                      <span className="font-bold text-[#2D2926]">
                        {equippedSkin ? equippedSkin.name : 'Tidak Dipakai'}
                      </span>
                    </div>
                    {equippedSkin && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onEquipSkin(null);
                          setPreviewSkinId(undefined);
                          showToast('Skin dilepas. Busana dasar kini tampil.');
                        }}
                        className="px-2 py-1 rounded bg-[#FFF5F5] border border-[#DC2626] text-[#B91C1C] text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        Lepas
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#FAF4E4] border border-[#D6BE93]">
                    <div className="min-w-0">
                      <span className="text-[#8B572A]">Busana: </span>
                      <span className="font-bold text-[#2D2926]">
                        {equippedOutfit ? equippedOutfit.name : 'Tunik Alami Hewan'}
                      </span>
                    </div>
                    {equippedOutfit && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onEquipOutfit(null);
                          setPreviewOutfitId(undefined);
                          showToast('Busana dilepas. Tampilan tunik alami aktif.');
                        }}
                        className="px-2 py-1 rounded bg-[#FFF5F5] border border-[#DC2626] text-[#B91C1C] text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        Lepas
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#FAF4E4] border border-[#D6BE93]">
                    <div className="min-w-0">
                      <span className="text-[#8B572A]">Aksesoris: </span>
                      <span className="font-bold text-[#2D2926]">
                        {equippedAccessory ? equippedAccessory.name : 'Tidak Dipakai'}
                      </span>
                    </div>
                    {equippedAccessory && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onEquipAccessory(null);
                          setPreviewAccessoryId(undefined);
                          showToast('Aksesoris 3D dilepas.');
                        }}
                        className="px-2 py-1 rounded bg-[#FFF5F5] border border-[#DC2626] text-[#B91C1C] text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        Lepas
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Skin / Outfit / Accessory Collection Catalog */}
              <div className="lg:col-span-7 space-y-4">
                {/* Category Sub-Tabs */}
                <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setWardrobeSubTab('skins');
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                        wardrobeSubTab === 'skins'
                          ? 'bg-[#6E4021] text-[#FFF8E6] border-[#4A2B14]'
                          : 'bg-[#FAF4E4] text-[#4A2B14] border-[#C8A46D] hover:bg-[#FFE8A3]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Koleksi Skin ({WARDROBE_SKINS.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setWardrobeSubTab('outfits');
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                        wardrobeSubTab === 'outfits'
                          ? 'bg-[#6E4021] text-[#FFF8E6] border-[#4A2B14]'
                          : 'bg-[#FAF4E4] text-[#4A2B14] border-[#C8A46D] hover:bg-[#FFE8A3]'
                      }`}
                    >
                      <Shirt className="w-3.5 h-3.5" />
                      <span>Koleksi Busana ({WARDROBE_OUTFITS.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setWardrobeSubTab('accessories');
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                        wardrobeSubTab === 'accessories'
                          ? 'bg-[#6E4021] text-[#FFF8E6] border-[#4A2B14]'
                          : 'bg-[#FAF4E4] text-[#4A2B14] border-[#C8A46D] hover:bg-[#FFE8A3]'
                      }`}
                    >
                      <Glasses className="w-3.5 h-3.5" />
                      <span>Aksesoris 3D ({WARDROBE_ACCESSORIES.length})</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] font-bold text-[#2C6E63] tabular-nums">
                    {wardrobeSubTab === 'skins'
                      ? `${unlockedSkinIds.length}/${WARDROBE_SKINS.length} Skin`
                      : wardrobeSubTab === 'outfits'
                        ? `${unlockedOutfitIds.length}/${WARDROBE_OUTFITS.length} Busana`
                        : `${unlockedAccessoryIds.length}/${WARDROBE_ACCESSORIES.length} Aksesoris`}
                  </div>
                </div>

                {/* 6 THEMED SKINS COLLECTION */}
                {wardrobeSubTab === 'skins' && (
                  <div className="space-y-3">
                    {boutiqueDiscountRate > 0 && (
                      <div className="px-3.5 py-2 rounded-xl bg-[#F0FDF9] border border-[#2C6E63] text-xs font-bold text-[#1F4A42]">
                        Bonus Butik Level {buildingLevels.boutique}: Diskon {Math.round(boutiqueDiscountRate * 100)}% Koin Daun aktif untuk seluruh Skin, Busana &amp; Aksesoris!
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {WARDROBE_SKINS.map((skin) => {
                      const owned = unlockedSkinIds.includes(skin.id);
                      const equipped = equippedSkinId === skin.id;
                      const previewing = effectivePreviewSkinId === skin.id;
                      const effectivePrice = applyDiscountPrice(skin.priceCoins, boutiqueDiscountRate);
                      const xpMet = xp >= skin.requiredXp;
                      const canAfford = coins >= effectivePrice;

                      return (
                        <div
                          key={skin.id}
                          className={`rounded-xl border-2 p-4 flex flex-col justify-between gap-3 ${
                            equipped
                              ? 'bg-[#FFE8A3] border-[#6E4021]'
                              : previewing
                                ? 'bg-[#F0FDF9] border-[#2C6E63]'
                                : 'bg-[#FFFDF7] border-[#C8A46D]'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className="w-10 h-10 rounded-lg border-[3px] flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: skin.swatchHex,
                                  borderColor: skin.trimHex,
                                }}
                              >
                                <Sparkles className="w-4 h-4 text-[#2D2926]" />
                              </div>
                              <span className="text-[11px] font-bold text-[#6E4021] tabular-nums">
                                {owned
                                  ? equipped
                                    ? 'Sedang Dipakai'
                                    : 'Dimiliki'
                                  : `${effectivePrice} Koin${skin.requiredXp > 0 ? ` · ${skin.requiredXp} XP` : ''}`}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-xl text-[#2D2926]">
                                {skin.name}
                              </h4>
                              <div className="text-[11px] font-semibold text-[#2C6E63]">
                                {skin.categoryLabel}
                              </div>
                            </div>
                            <p className="text-xs text-[#2D2926]/80 leading-relaxed">
                              {skin.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setPreviewSkinId(previewSkinId === skin.id ? undefined : skin.id);
                              }}
                              className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer ${
                                previewing && !equipped
                                  ? 'bg-[#2C6E63] text-white border-[#16302B]'
                                  : 'bg-[#FAF4E4] hover:bg-[#FFF6DA] text-[#4A2B14] border-[#9E7344]'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Pratinjau</span>
                            </button>

                            {owned ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (equipped) {
                                    soundFX.playClick();
                                    onEquipSkin(null);
                                    setPreviewSkinId(undefined);
                                    showToast(`${skin.name} dilepas.`);
                                  } else {
                                    soundFX.playSuccess();
                                    onEquipSkin(skin.id);
                                    setPreviewSkinId(undefined);
                                    showToast(`${skin.name} langsung aktif pada model 3D ${avatar.name}!`);
                                  }
                                }}
                                className={`min-h-[38px] flex-1 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                                  equipped
                                    ? 'bg-[#FFF5F5] hover:bg-[#FEE2E2] border border-[#DC2626] text-[#B91C1C]'
                                    : 'bg-[#6E4021] hover:bg-[#522E16] text-[#FFF8E6]'
                                }`}
                              >
                                {equipped ? 'Lepas Skin' : 'Pakai Skin'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!xpMet || !canAfford}
                                onClick={() => {
                                  soundFX.playSuccess();
                                  onUnlockSkin(skin.id, effectivePrice);
                                  setPreviewSkinId(undefined);
                                  showToast(`Berhasil membeli & memasang ${skin.name}!`);
                                }}
                                className={`min-h-[38px] flex-1 px-3 py-1.5 rounded-xl text-xs font-bold ${
                                  xpMet && canAfford
                                    ? 'bg-[#2C6E63] hover:bg-[#23594F] text-white cursor-pointer'
                                    : 'bg-[#EADAB8] text-[#6E4021]/60 cursor-not-allowed'
                                }`}
                              >
                                {!xpMet
                                  ? `Butuh ${skin.requiredXp} XP`
                                  : !canAfford
                                    ? `Koin Kurang (${effectivePrice})`
                                    : `Beli · ${effectivePrice} Koin`}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                )}

                {/* OUTFITS COLLECTION */}
                {wardrobeSubTab === 'outfits' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {WARDROBE_OUTFITS.map((outfit) => {
                      const owned = unlockedOutfitIds.includes(outfit.id);
                      const equipped = !equippedSkinId && equippedOutfitId === outfit.id;
                      const previewing =
                        effectivePreviewSkinId === null && effectivePreviewOutfitId === outfit.id;
                      const effectivePrice = applyDiscountPrice(
                        outfit.priceCoins,
                        boutiqueDiscountRate
                      );
                      const xpMet = xp >= outfit.requiredXp;
                      const canAfford = coins >= effectivePrice;

                      return (
                        <div
                          key={outfit.id}
                          className={`rounded-xl border-2 p-4 flex flex-col justify-between gap-3 ${
                            equipped
                              ? 'bg-[#FFE8A3] border-[#6E4021]'
                              : previewing
                                ? 'bg-[#F0FDF9] border-[#2C6E63]'
                                : 'bg-[#FFFDF7] border-[#C8A46D]'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className="w-10 h-10 rounded-lg border-[3px] flex items-center justify-center shrink-0"
                                style={{
                                  backgroundColor: outfit.swatchHex,
                                  borderColor: outfit.trimHex,
                                }}
                              >
                                <Shirt className="w-4 h-4 text-[#2D2926]" />
                              </div>
                              <span className="text-[11px] font-bold text-[#6E4021] tabular-nums">
                                {owned
                                  ? equipped
                                    ? 'Terpasang'
                                    : 'Dimiliki'
                                  : `${effectivePrice} Koin${outfit.requiredXp > 0 ? ` · ${outfit.requiredXp} XP` : ''}`}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-xl text-[#2D2926]">
                                {outfit.name}
                              </h4>
                              <div className="text-[11px] text-[#2C6E63] font-semibold">
                                {outfit.slotLabel}
                              </div>
                            </div>
                            <p className="text-xs text-[#2D2926]/80 leading-relaxed">
                              {outfit.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                if (previewOutfitId === outfit.id && previewSkinId === null) {
                                  setPreviewOutfitId(undefined);
                                  setPreviewSkinId(undefined);
                                } else {
                                  setPreviewSkinId(null);
                                  setPreviewOutfitId(outfit.id);
                                }
                              }}
                              className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer ${
                                previewing && !equipped
                                  ? 'bg-[#2C6E63] text-white border-[#16302B]'
                                  : 'bg-[#FAF4E4] hover:bg-[#FFF6DA] text-[#4A2B14] border-[#9E7344]'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Pratinjau</span>
                            </button>

                            {owned ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (equipped) {
                                    soundFX.playClick();
                                    onEquipOutfit(null);
                                    resetStudioPreview();
                                    showToast(`${outfit.name} dilepas.`);
                                  } else {
                                    soundFX.playSuccess();
                                    onEquipOutfit(outfit.id);
                                    resetStudioPreview();
                                    showToast(
                                      equippedSkinId
                                        ? `${outfit.name} dipakai (skin tematik dilepas agar busana terlihat).`
                                        : `${outfit.name} kini dipakai oleh ${avatar.name}.`
                                    );
                                  }
                                }}
                                className={`min-h-[38px] flex-1 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                                  equipped
                                    ? 'bg-[#FFF5F5] hover:bg-[#FEE2E2] border border-[#DC2626] text-[#B91C1C]'
                                    : 'bg-[#6E4021] hover:bg-[#522E16] text-[#FFF8E6]'
                                }`}
                              >
                                {equipped ? 'Lepas' : 'Pakai Busana'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!xpMet || !canAfford}
                                onClick={() => {
                                  soundFX.playSuccess();
                                  onUnlockOutfit(outfit.id, effectivePrice);
                                  resetStudioPreview();
                                  showToast(`Berhasil membuka & memakai ${outfit.name}!`);
                                }}
                                className={`min-h-[38px] flex-1 px-3 py-1.5 rounded-xl text-xs font-bold ${
                                  xpMet && canAfford
                                    ? 'bg-[#2C6E63] hover:bg-[#23594F] text-white cursor-pointer'
                                    : 'bg-[#EADAB8] text-[#6E4021]/60 cursor-not-allowed'
                                }`}
                              >
                                {!xpMet
                                  ? `Butuh ${outfit.requiredXp} XP`
                                  : !canAfford
                                    ? `Koin Kurang (${effectivePrice})`
                                    : `Beli · ${effectivePrice} Koin`}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3D ACCESSORIES COLLECTION */}
                {wardrobeSubTab === 'accessories' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {WARDROBE_ACCESSORIES.map((acc) => {
                      const owned = unlockedAccessoryIds.includes(acc.id);
                      const equipped = equippedAccessoryId === acc.id;
                      const previewing = effectivePreviewAccessoryId === acc.id;
                      const effectivePrice = applyDiscountPrice(
                        acc.priceCoins,
                        boutiqueDiscountRate
                      );
                      const xpMet = xp >= acc.requiredXp;
                      const canAfford = coins >= effectivePrice;

                      return (
                        <div
                          key={acc.id}
                          className={`rounded-xl border-2 p-4 flex flex-col justify-between gap-3 ${
                            equipped
                              ? 'bg-[#FFE8A3] border-[#6E4021]'
                              : previewing
                                ? 'bg-[#F0FDF9] border-[#2C6E63]'
                                : 'bg-[#FFFDF7] border-[#C8A46D]'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className="w-10 h-10 rounded-lg border-2 border-[#4A2B14] flex items-center justify-center shrink-0"
                                style={{ backgroundColor: acc.swatchHex }}
                              >
                                <Glasses className="w-4 h-4 text-[#2D2926]" />
                              </div>
                              <span className="text-[11px] font-bold text-[#6E4021] tabular-nums">
                                {owned
                                  ? equipped
                                    ? 'Terpasang'
                                    : 'Dimiliki'
                                  : `${effectivePrice} Koin${acc.requiredXp > 0 ? ` · ${acc.requiredXp} XP` : ''}`}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-xl text-[#2D2926]">
                                {acc.name}
                              </h4>
                              <div className="text-[11px] font-semibold text-[#2C6E63]">
                                {acc.slotLabel}
                              </div>
                            </div>
                            <p className="text-xs text-[#2D2926]/80 leading-relaxed">
                              {acc.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setPreviewAccessoryId(previewAccessoryId === acc.id ? undefined : acc.id);
                              }}
                              className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer ${
                                previewing && !equipped
                                  ? 'bg-[#2C6E63] text-white border-[#16302B]'
                                  : 'bg-[#FAF4E4] hover:bg-[#FFF6DA] text-[#4A2B14] border-[#9E7344]'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Pratinjau</span>
                            </button>

                            {owned ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (equipped) {
                                    soundFX.playClick();
                                    onEquipAccessory(null);
                                    setPreviewAccessoryId(undefined);
                                    showToast(`${acc.name} dilepas.`);
                                  } else {
                                    soundFX.playSuccess();
                                    onEquipAccessory(acc.id);
                                    setPreviewAccessoryId(undefined);
                                    showToast(`${acc.name} dipasang pada model 3D ${avatar.name}!`);
                                  }
                                }}
                                className={`min-h-[38px] flex-1 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                                  equipped
                                    ? 'bg-[#FFF5F5] hover:bg-[#FEE2E2] border border-[#DC2626] text-[#B91C1C]'
                                    : 'bg-[#6E4021] hover:bg-[#522E16] text-[#FFF8E6]'
                                }`}
                              >
                                {equipped ? 'Lepas' : 'Pasang'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!xpMet || !canAfford}
                                onClick={() => {
                                  soundFX.playSuccess();
                                  onUnlockAccessory(acc.id, effectivePrice);
                                  setPreviewAccessoryId(undefined);
                                  showToast(`Berhasil membuka & memasang ${acc.name}!`);
                                }}
                                className={`min-h-[38px] flex-1 px-3 py-1.5 rounded-xl text-xs font-bold ${
                                  xpMet && canAfford
                                    ? 'bg-[#2C6E63] hover:bg-[#23594F] text-white cursor-pointer'
                                    : 'bg-[#EADAB8] text-[#6E4021]/60 cursor-not-allowed'
                                }`}
                              >
                                {!xpMet
                                  ? `Butuh ${acc.requiredXp} XP`
                                  : !canAfford
                                    ? `Koin Kurang (${effectivePrice})`
                                    : `Beli · ${effectivePrice} Koin`}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. ACHIEVEMENT & MEDALI */}
          {activeTab === 'achievement' && (
            <div className="space-y-6">
              <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                    Medali Apoteker &amp; Pencapaian Kalarma
                  </h3>
                  <p className="text-xs text-[#2D2926]/80 mt-0.5">
                    Klaim hadiah Koin Daun dari pencapaian eksplorasi, herbal, pemancingan, dan pembangunan desa.
                  </p>
                </div>
                <div className="font-mono text-xs font-bold text-[#6E4021] tabular-nums">
                  {completedCount}/{totalCasesCount} Kasus · {overallProgressPct}%
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {PHARMACIST_MEDALS.map((medal) => {
                  const unlocked = completedCount >= medal.requiredCases;
                  return (
                    <div
                      key={medal.id}
                      className={`rounded-xl border-2 p-4 space-y-2 ${
                        unlocked ? 'bg-[#FFFDF7] border-[#6E4021]' : 'bg-[#FAF4E4] border-[#D6BE93]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#8B572A]">
                          Medali {medal.tier}
                        </span>
                        {unlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2C6E63]" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#8B572A]/60" />
                        )}
                      </div>
                      <div className="font-display font-bold text-lg text-[#2D2926]">
                        {medal.title}
                      </div>
                      <p className="text-xs text-[#2D2926]/75 leading-snug">{medal.description}</p>
                      <div className="font-mono text-[11px] font-bold text-[#2C6E63] tabular-nums">
                        {Math.min(completedCount, medal.requiredCases)}/{medal.requiredCases} Kasus
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {VILLAGE_ACHIEVEMENTS.map((ach) => {
                  const val = Math.min(ach.targetValue, ach.progressValue(achievementCtx));
                  const completed = val >= ach.targetValue;
                  const claimed = claimedAchievements.includes(ach.id);
                  const pct = Math.round((val / Math.max(1, ach.targetValue)) * 100);

                  return (
                    <div
                      key={ach.id}
                      className="bg-[#FFFDF7] border-2 border-[#C8A46D] rounded-xl p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-xs text-[#8B572A] font-medium">
                            {ach.category} · Target {ach.targetLabel}
                          </div>
                          <h4 className="font-display font-bold text-xl text-[#2D2926]">
                            {ach.title}
                          </h4>
                          <p className="text-xs text-[#2D2926]/80">{ach.description}</p>
                        </div>
                        <div className="font-mono text-xs font-bold text-[#9A5016] tabular-nums shrink-0">
                          +{ach.rewardCoins} Koin
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#EADAB8]">
                        <div className="flex-1 space-y-1">
                          <div className="w-full h-2 rounded-full bg-[#EADAB8] overflow-hidden">
                            <div
                              className="h-full bg-[#2C6E63]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="font-mono text-[11px] text-[#5D351B] tabular-nums">
                            Progres: {val}/{ach.targetValue}
                          </div>
                        </div>

                        {claimed ? (
                          <span className="text-xs font-bold text-[#2C6E63] px-3 py-1.5">
                            Sudah Diklaim
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={!completed}
                            onClick={() => {
                              soundFX.playSuccess();
                              onClaimAchievement(ach.id, ach.rewardCoins);
                              showToast(`Hadiah +${ach.rewardCoins} Koin Daun diklaim!`);
                            }}
                            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                              completed
                                ? 'bg-[#FFD166] hover:bg-[#FFC43D] border border-[#6E4021] text-[#3E210F] cursor-pointer'
                                : 'bg-[#EADAB8] text-[#6E4021]/60 cursor-not-allowed'
                            }`}
                          >
                            {completed ? 'Klaim Hadiah' : 'Belum Selesai'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. QUEST JOURNAL */}
          {activeTab === 'quest' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-4">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                    Jurnal Tugas Klinik &amp; Warga Desa
                  </h3>
                  <p className="text-xs text-[#2D2926]/75">
                    Pilih kasus untuk memulai wawancara klinis, skrining resep, dan pertahanan terapi.
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#EADAB8] rounded-xl border border-[#C8A46D] shrink-0">
                  {[
                    { id: 'all', label: `Semua (${CASES.length})` },
                    { id: 'pending', label: `Menunggu (${CASES.length - completedCount})` },
                    { id: 'done', label: `Selesai (${completedCount})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setQuestFilter(f.id as 'all' | 'pending' | 'done');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap ${
                        questFilter === f.id
                          ? 'bg-[#6E4021] text-[#FFF8E6]'
                          : 'text-[#4A2B14] hover:bg-[#FAF4E4]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CASES.filter((c) => {
                  const done = completedCases.includes(c.id);
                  if (questFilter === 'pending') return !done;
                  if (questFilter === 'done') return done;
                  return true;
                }).map((c) => {
                  const patient = CHARACTERS[c.patientId];
                  const isDone = completedCases.includes(c.id);
                  const isActive = !isDone && activeCaseId === c.id;
                  const weatherMatch = c.recommendedWeather === weather;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectCase(c);
                      }}
                      className={`text-left rounded-xl border-2 p-4 flex flex-col justify-between gap-3 cursor-pointer transition-transform hover:-translate-y-0.5 ${
                        isActive
                          ? 'bg-[#FFE8A3] border-[#6E4021]'
                          : isDone
                            ? 'bg-[#FAF4E4] border-[#C8A46D]'
                            : 'bg-[#FFFDF7] border-[#9E7344]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs text-[#6E4021]">
                          <span className="truncate font-medium">
                            {patient.name} · {c.difficulty}
                          </span>
                          <span
                            className={`font-bold shrink-0 ${
                              isDone
                                ? 'text-[#2C6E63]'
                                : weatherMatch
                                  ? 'text-[#DC2626]'
                                  : 'text-[#8B572A]'
                            }`}
                          >
                            {isDone
                              ? 'Selesai'
                              : isActive
                                ? 'Aktif'
                                : weatherMatch
                                  ? 'Prioritas Cuaca'
                                  : 'Menunggu'}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-xl text-[#2D2926] leading-snug">
                          {c.title}
                        </h4>
                        <p className="text-xs text-[#2D2926]/80 line-clamp-2">{c.summary}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-[#EADAB8] text-xs font-bold tabular-nums">
                        <span className="truncate text-[#2C6E63] pr-2">{c.diagnosis}</span>
                        <span className="text-[#9A5016] shrink-0">+{c.xpReward} XP · +45 Koin</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4B. DAILY QUEST */}
          {activeTab === 'daily' && (
            <div className="space-y-4">
              <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                    Daily Quest Kalarma Village
                  </h3>
                  <p className="text-xs text-[#2D2926]/80 mt-0.5">
                    Tugas harian apoteker muda yang di-reset otomatis setiap pergantian hari ({dailyQuest.dateKey}).
                  </p>
                </div>
                <div className="font-mono text-xs font-bold text-[#2C6E63] bg-[#F0FDF9] border border-[#2C6E63] px-3 py-1.5 rounded-xl tabular-nums shrink-0">
                  Selesai: {dailyQuest.claimedIds.length}/{DAILY_QUESTS.length} · {coins} Koin
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DAILY_QUESTS.map((dq) => {
                  const rawVal = dailyQuest[dq.metricKey] || 0;
                  const val = Math.min(dq.target, rawVal);
                  const pct = Math.round((val / Math.max(1, dq.target)) * 100);
                  const done = val >= dq.target;
                  const claimed = dailyQuest.claimedIds.includes(dq.id);

                  return (
                    <div
                      key={dq.id}
                      className={`rounded-xl border-2 p-4 flex flex-col justify-between gap-3 ${
                        claimed
                          ? 'bg-[#F0FDF9] border-[#2C6E63]'
                          : done
                            ? 'bg-[#FFE8A3] border-[#6E4021]'
                            : 'bg-[#FFFDF7] border-[#C8A46D]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-[#8B572A]">{dq.category}</span>
                          <span className="font-mono font-bold text-[#2C6E63] tabular-nums">
                            +{dq.rewardCoins} Koin · +{dq.rewardXp} XP
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-xl text-[#2D2926]">
                          {dq.title}
                        </h4>
                        <p className="text-xs text-[#2D2926]/80 leading-relaxed">{dq.description}</p>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-[#EADAB8]">
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-[#4A2B14] tabular-nums">
                          <span>Progres Hari Ini</span>
                          <span>
                            {val}/{dq.target}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#EADAB8] overflow-hidden">
                          <div className="h-full bg-[#2C6E63]" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          {claimed ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C6E63]">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Hadiah Harian Sudah Diklaim</span>
                            </span>
                          ) : done ? (
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playSuccess();
                                onClaimDailyQuest(dq.id, dq.rewardCoins, dq.rewardXp);
                                showToast(
                                  `Klaim ${dq.title}: +${dq.rewardCoins} Koin Daun & +${dq.rewardXp} XP!`
                                );
                              }}
                              className="min-h-[40px] flex-1 px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] text-white text-xs font-bold cursor-pointer"
                            >
                              Klaim +{dq.rewardCoins} Koin · +{dq.rewardXp} XP
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                onChangeTab(dq.actionTab);
                              }}
                              className="min-h-[40px] flex-1 px-4 py-2 rounded-xl bg-[#FAF4E4] hover:bg-[#FFF6DA] border border-[#8B572A] text-[#4A2B14] text-xs font-bold cursor-pointer"
                            >
                              {dq.actionLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. INTERACTIVE VILLAGE MAP */}
          {activeTab === 'map' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-7 relative rounded-xl border-[3px] border-[#6E4021] bg-gradient-to-br from-[#CFE9C8] via-[#B4DCAB] to-[#98CA94] min-h-[340px] sm:min-h-[400px] overflow-hidden p-4">
                {/* Stylized Topographic Roads & Pond */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  <path
                    d="M 22 22 L 52 18 L 52 65 M 52 36 L 72 30 L 81 48 M 22 62 L 52 65 L 80 80"
                    stroke="#E8D2A4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <ellipse cx="52" cy="66" rx="11" ry="8" fill="#5CA8C8" stroke="#D5C097" strokeWidth="1.2" />
                </svg>

                <div className="relative z-10 flex items-center justify-between text-xs font-bold text-[#2F4D2A]">
                  <span>Peta Topografi Kalarma Village</span>
                  <span>Cuaca: {WEATHER_INFO[weather].label}</span>
                </div>

                {MAP_ZONES.map((zone) => {
                  const selected = zone.id === selectedMapZone;
                  const bLevel = buildingLevels[zone.id];
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setSelectedMapZone(zone.id);
                      }}
                      style={{ left: `${zone.mapLeftPct}%`, top: `${zone.mapTopPct}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl border-2 text-[11px] sm:text-xs font-bold transition-transform cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                        selected
                          ? 'z-20 scale-105 bg-[#FFE8A3] border-[#4A2B14] text-[#2D2926] shadow-[0_4px_0_#4A2B14]'
                          : 'z-10 bg-[#FAF4E4]/95 border-[#8B572A] text-[#3E210F] hover:scale-105'
                      }`}
                    >
                      <span>{zone.name}</span>
                      {bLevel !== undefined && (
                        <span className="px-1.5 py-0.5 rounded bg-[#2C6E63] text-white font-mono text-[10px] leading-none">
                          Lv.{bLevel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-5 bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#8B572A]">
                    <span>{activeMapZoneObj.role}</span>
                    {buildingLevels[activeMapZoneObj.id] !== undefined && (
                      <span className="font-mono font-bold text-[#2C6E63]">
                        Level {buildingLevels[activeMapZoneObj.id]}/3
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-3xl text-[#2D2926]">
                    {activeMapZoneObj.name}
                  </h3>
                  <p className="text-sm text-[#2D2926]/85 leading-relaxed">
                    {activeMapZoneObj.summary}
                  </p>
                  {buildingCoord && (
                    <div className="p-3 rounded-xl bg-[#FAF4E4] border border-[#D6BE93] text-xs text-[#4A2B14] font-mono tabular-nums">
                      Koordinat Pintu Masuk: X {buildingCoord.entranceX.toFixed(1)} · Z{' '}
                      {buildingCoord.entranceZ.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onClose();
                        onWalkToBuilding(activeMapZoneObj.id);
                      }}
                      className="min-h-[42px] flex-1 px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Jalan ke Lokasi (3D)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onChangeTab(activeMapZoneObj.targetTab);
                      }}
                      className="min-h-[42px] flex-1 px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border border-[#6E4021] text-[#3E210F] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{activeMapZoneObj.actionLabel}</span>
                    </button>
                  </div>
                  {buildingLevels[activeMapZoneObj.id] !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onChangeTab('upgrade');
                      }}
                      className="min-h-[38px] w-full px-4 py-1.5 rounded-xl bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#9E7344] text-[#4A2B14] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>Upgrade Bangunan ini</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6. INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-display font-bold text-xl text-[#2D2926]">
                    <Coins className="w-5 h-5 text-[#D97706]" />
                    <span className="tabular-nums">{coins} Koin Daun</span>
                  </div>
                  <div className="flex flex-wrap gap-1 bg-[#EADAB8] p-1 rounded-xl border border-[#C8A46D]">
                    {(['Semua', 'Herbal', 'Ikan', 'Perlengkapan', 'Racikan'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setInvFilter(cat);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          invFilter === cat
                            ? 'bg-[#6E4021] text-[#FFF8E6]'
                            : 'text-[#4A2B14] hover:bg-[#FAF4E4]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {inventoryEntries.length === 0 ? (
                  <div className="bg-[#FFFDF7] border-2 border-dashed border-[#9E7344] rounded-xl p-8 text-center text-sm text-[#6E4021]">
                    Belum ada barang di kategori ini. Panen tanaman di Kebun Herbal, memancing di Kolam, atau beli perlengkapan di Toko Desa.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {inventoryEntries.map(({ itemId, qty, def }) => {
                      const active = activeInvDetail.id === itemId;
                      return (
                        <button
                          key={itemId}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setSelectedInvItem(itemId);
                          }}
                          className={`text-left p-3.5 rounded-xl border-2 flex items-center justify-between gap-3 cursor-pointer ${
                            active
                              ? 'bg-[#FFE8A3] border-[#6E4021]'
                              : 'bg-[#FFFDF7] border-[#C8A46D] hover:bg-[#FFF6DA]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-[11px] text-[#8B572A]">{def.category}</div>
                            <div className="font-display font-bold text-lg text-[#2D2926] truncate">
                              {def.name}
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold text-[#2C6E63] tabular-nums shrink-0">
                            x{qty}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-5 space-y-4">
                <div>
                  <div className="text-xs text-[#8B572A]">
                    {activeInvDetail.category} · Dimiliki: {activeInvQty} pcs
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926] mt-0.5">
                    {activeInvDetail.name}
                  </h3>
                  <p className="text-xs text-[#2D2926]/80 mt-2 leading-relaxed">
                    {activeInvDetail.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF4E4] border border-[#D6BE93] space-y-2">
                  <div className="font-display font-bold text-base text-[#2D2926] flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-[#2C6E63]" />
                    <span>Meja Racik Cepat (Eliksir Imun Asklepios)</span>
                  </div>
                  <p className="text-xs text-[#2D2926]/75">
                    Gabungkan 1 Daun Meniran ({inventory.meniran_leaf || 0}) + 1 Rimpang Temulawak ({inventory.temulawak_root || 0}).
                  </p>
                  <button
                    type="button"
                    disabled={(inventory.meniran_leaf || 0) < 1 || (inventory.temulawak_root || 0) < 1}
                    onClick={() => {
                      soundFX.playSuccess();
                      onCraftElixir();
                      showToast('Berhasil meracik 1 Eliksir Imun Asklepios!');
                    }}
                    className={`min-h-[38px] w-full px-3 py-1.5 rounded-xl text-xs font-bold ${
                      (inventory.meniran_leaf || 0) >= 1 && (inventory.temulawak_root || 0) >= 1
                        ? 'bg-[#2C6E63] hover:bg-[#23594F] text-white cursor-pointer'
                        : 'bg-[#EADAB8] text-[#6E4021]/60 cursor-not-allowed'
                    }`}
                  >
                    Racik Eliksir Imun
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeInvDetail.id === 'immun_tonic' && activeInvQty > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playSuccess();
                        onUseElixir();
                        showToast('Eliksir digunakan! +25 XP pengalaman apoteker.');
                      }}
                      className="min-h-[40px] flex-1 px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border border-[#6E4021] text-[#3E210F] text-xs font-bold cursor-pointer"
                    >
                      Gunakan (+25 XP)
                    </button>
                  )}
                  {activeInvDetail.id === 'wooden_bait' && activeInvQty > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onChangeTab('fishing');
                      }}
                      className="min-h-[40px] flex-1 px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
                    >
                      Gunakan di Kolam Pancing
                    </button>
                  )}
                  {activeInvDetail.id === 'herbal_seed_pack' && activeInvQty > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onChangeTab('herbal');
                      }}
                      className="min-h-[40px] flex-1 px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] text-white text-xs font-bold cursor-pointer"
                    >
                      Tanam di Kebun Herbal
                    </button>
                  )}
                  {activeInvDetail.id === 'clinical_spuit' && activeInvQty > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setClinicalSubTab('calculator');
                        onChangeTab('clinical');
                      }}
                      className="min-h-[40px] flex-1 px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] text-white text-xs font-bold cursor-pointer"
                    >
                      Buka Kalkulator Dosis Anak
                    </button>
                  )}
                  {activeInvQty > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onSellInventoryItem(activeInvDetail.id, activeInvSellPrice);
                        showToast(`Terjual 1 ${activeInvDetail.name} (+${activeInvSellPrice} Koin Daun).`);
                      }}
                      className="min-h-[40px] flex-1 px-4 py-2 rounded-xl bg-[#6E4021] hover:bg-[#522E16] text-[#FFF8E6] text-xs font-bold cursor-pointer"
                    >
                      Jual 1 (+{activeInvSellPrice} Koin)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7. HERBAL ENCYCLOPEDIA */}
          {activeTab === 'herbal' && (
            <div className="space-y-4">
              <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                    Ensiklopedia Herbal &amp; Fitofarmaka Kalarma
                  </h3>
                  <p className="text-xs text-[#2D2926]/80">
                    Kumpulkan tanaman obat dari Kebun Mbah Sekar untuk melengkapi catatan farmakognosi desa ({discoveredHerbs.length}/{HERBAL_ENCYCLOPEDIA.length} tercatat).
                  </p>
                </div>
                <div className="text-xs font-bold text-[#2C6E63] shrink-0 text-right">
                  <div>Cuaca: {WEATHER_INFO[weather].label}</div>
                  {gardenUpgradeBonus.extraYield > 0 && (
                    <div className="text-[11px] text-[#9A5016]">
                      Kebun Lv.{buildingLevels.garden}: +{gardenUpgradeBonus.extraYield} panen · +{gardenUpgradeBonus.extraXp} XP
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HERBAL_ENCYCLOPEDIA.map((herb) => {
                  const known = discoveredHerbs.includes(herb.id);
                  const qtyOwned = inventory[herb.itemId] || 0;
                  const seedCount = inventory.herbal_seed_pack || 0;
                  const weatherBonus = herb.bestWeather === weather;

                  return (
                    <div
                      key={herb.id}
                      className="bg-[#FFFDF7] border-2 border-[#C8A46D] rounded-xl p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-[#2C6E63] font-semibold">
                            {herb.category} · Stok Tas: {qtyOwned}
                          </span>
                          {weatherBonus && (
                            <span className="font-bold text-[#9A5016]">Panen Subur (+Bonus)</span>
                          )}
                        </div>
                        <h4 className="font-display font-bold text-2xl text-[#2D2926]">
                          {herb.name}{' '}
                          <span className="text-sm font-sans italic font-normal text-[#6E4021]">
                            ({herb.latinName})
                          </span>
                        </h4>
                        <div className="text-xs text-[#6E4021]">Habitat: {herb.habitat}</div>
                        <p className="text-xs text-[#2D2926]/85 leading-relaxed">
                          <span className="font-bold">Senyawa Aktif:</span> {herb.activeCompounds}.{' '}
                          {herb.clinicalUse}
                        </p>
                        <p className="text-[11px] text-[#9A5016]">
                          Perhatian Klinis: {herb.caution}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EADAB8]">
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playSuccess();
                            onHarvestHerb(herb, false);
                            showToast(
                              `Memanen ${herb.name}! ${known ? 'Stok tas bertambah.' : 'Entri baru terbuka di Ensiklopedia!'}`
                            );
                          }}
                          className="min-h-[38px] flex-1 px-3 py-1.5 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sprout className="w-4 h-4" />
                          <span>Panen di Kebun</span>
                        </button>
                        {seedCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playSuccess();
                              onHarvestHerb(herb, true);
                              showToast(
                                `Panen subur ${herb.name} memakai 1 Paket Bibit! (+1 ekstra & +10 XP)`
                              );
                            }}
                            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border border-[#6E4021] text-[#3E210F] text-xs font-bold cursor-pointer"
                          >
                            +Bibit ({seedCount})
                          </button>
                        )}
                        {herb.formularyId && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onChangeFormularyFocusId(herb.formularyId || null);
                              onChangeTab('formulary');
                            }}
                            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#8B572A] text-[#4A2B14] text-xs font-bold cursor-pointer"
                          >
                            Monografi Formularium
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. FISHING COLLECTION */}
          {activeTab === 'fishing' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-[#E6F4F9] to-[#FAF4E4] border-2 border-[#2C6E63] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#0369A1]">
                    Dermaga Selatan (Lv.{buildingLevels.pond || 1}) · Umpan Pelet: {inventory.wooden_bait || 0} pcs · Koleksi:{' '}
                    {Object.keys(caughtFish).length}/{FISHING_SPECIES.length} Spesies
                    {pondUpgradeBonus.coinBonus > 0 ? ` · Bonus +${pondUpgradeBonus.coinBonus} Koin` : ''}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                    Kolam Pemancingan &amp; Buku Ikan Kalarma
                  </h3>
                  <p className="text-xs text-[#2D2926]/80">
                    {lastCatchMsg ||
                      'Lempar kail dengan umpan pelet untuk menangkap ikan penghuni mata air Kalarma.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {fishingPhase === 'idle' && (
                    <button
                      type="button"
                      onClick={handleStartFishingCast}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Anchor className="w-4 h-4" />
                      <span>Lempar Kail (1 Umpan)</span>
                    </button>
                  )}
                  {fishingPhase === 'casting' && (
                    <span className="min-h-[44px] px-5 py-2 rounded-xl bg-[#FAF4E4] border-2 border-[#0284C7] text-[#0369A1] text-xs font-bold inline-flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      <span>Menunggu tarikan pelampung...</span>
                    </span>
                  )}
                  {fishingPhase === 'bite' && (
                    <button
                      type="button"
                      onClick={handleReelFishingCatch}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#FF5A5F] hover:bg-[#EB494E] border-2 border-[#4A2B14] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Fish className="w-4 h-4" />
                      <span>Ikan Menyambar! Tarik Sekarang</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FISHING_SPECIES.map((fish) => {
                  const rec = caughtFish[fish.id];
                  const caught = Boolean(rec && rec.count > 0);
                  const favWeather = fish.preferredWeather === weather;

                  return (
                    <div
                      key={fish.id}
                      className={`rounded-xl border-2 p-4 space-y-2 ${
                        caught
                          ? 'bg-[#FFFDF7] border-[#2C6E63]'
                          : 'bg-[#FAF4E4] border-[#C8A46D]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-[#0369A1]">
                          {fish.rarity} · {fish.sellCoins} Koin
                        </span>
                        {favWeather && (
                          <span className="font-semibold text-[#2C6E63]">Cuaca Cocok</span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-xl text-[#2D2926]">
                        {caught ? fish.name : `${fish.name} (Belum Tertangkap)`}
                      </h4>
                      <p className="text-xs text-[#2D2926]/80">{fish.habitatNote}</p>
                      <div className="pt-2 border-t border-[#EADAB8] flex items-center justify-between text-xs font-mono tabular-nums text-[#5D351B]">
                        <span>Tertangkap: {rec?.count || 0}x</span>
                        <span>Rekor: {rec ? `${rec.bestCm} cm` : '-'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 9. FORMULARY BOOK */}
          {activeTab === 'formulary' && <FormularyBook initialDrugId={formularyFocusId} />}

          {/* 10. CALCULATOR & QUIZ */}
          {activeTab === 'clinical' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-[#EADAB8] p-1.5 rounded-xl border border-[#C8A46D] w-fit">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setClinicalSubTab('calculator');
                  }}
                  className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                    clinicalSubTab === 'calculator'
                      ? 'bg-[#6E4021] text-[#FFF8E6]'
                      : 'text-[#4A2B14] hover:bg-[#FAF4E4]'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span>Kalkulator Farmasi Klinis</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setClinicalSubTab('quiz');
                  }}
                  className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                    clinicalSubTab === 'quiz'
                      ? 'bg-[#6E4021] text-[#FFF8E6]'
                      : 'text-[#4A2B14] hover:bg-[#FAF4E4]'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Evaluasi Quiz Apoteker</span>
                </button>
              </div>

              {clinicalSubTab === 'calculator' ? <CalculatorSuite /> : <ClinicalQuiz />}
            </div>
          )}

          {/* 11. SHOP */}
          {activeTab === 'shop' && (
            <div className="space-y-4">
              <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                    Toko Perlengkapan &amp; Apotek Guru Lios
                  </h3>
                  <p className="text-xs text-[#2D2926]/80">
                    Belanja perlengkapan petualangan atau jual hasil panen herbal &amp; tangkapan ikanmu.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-[#9A5016] tabular-nums">
                    {coins} Koin Daun
                  </span>
                  <div className="flex gap-1 bg-[#EADAB8] p-1 rounded-xl border border-[#C8A46D]">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setShopSubTab('buy');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        shopSubTab === 'buy'
                          ? 'bg-[#6E4021] text-[#FFF8E6]'
                          : 'text-[#4A2B14]'
                      }`}
                    >
                      Beli Barang
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setShopSubTab('sell');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        shopSubTab === 'sell'
                          ? 'bg-[#6E4021] text-[#FFF8E6]'
                          : 'text-[#4A2B14]'
                      }`}
                    >
                      Jual Hasil
                    </button>
                  </div>
                </div>
              </div>

              {shopTradeMods.discountRate > 0 && (
                <div className="px-4 py-2 rounded-xl bg-[#F0FDF9] border border-[#2C6E63] text-xs font-bold text-[#1F4A42]">
                  Bonus Toko Level {buildingLevels.shop}: Diskon beli {Math.round(shopTradeMods.discountRate * 100)}% &amp; harga jual panen/ikan naik +{Math.round(shopTradeMods.sellBonusRate * 100)}% aktif!
                </div>
              )}

              {shopSubTab === 'buy' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SHOP_ITEMS.map((item) => {
                    const effectivePrice = applyDiscountPrice(
                      item.priceCoins,
                      shopTradeMods.discountRate
                    );
                    const affordable = coins >= effectivePrice;
                    const currentStock = inventory[item.itemId] || 0;
                    return (
                      <div
                        key={item.id}
                        className="bg-[#FFFDF7] border-2 border-[#C8A46D] rounded-xl p-4 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-[#8B572A]">
                            <span>{item.category}</span>
                            <span className="tabular-nums">Di Tas: {currentStock}</span>
                          </div>
                          <h4 className="font-display font-bold text-xl text-[#2D2926]">
                            {item.name}
                          </h4>
                          <p className="text-xs text-[#2D2926]/80">{item.description}</p>
                        </div>

                        <button
                          type="button"
                          disabled={!affordable}
                          onClick={() => {
                            soundFX.playSuccess();
                            onBuyShopItem(item.itemId, effectivePrice, item.quantityGranted);
                            showToast(`Membeli ${item.name} seharga ${effectivePrice} Koin Daun.`);
                          }}
                          className={`min-h-[40px] w-full px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 ${
                            affordable
                              ? 'bg-[#2C6E63] hover:bg-[#23594F] text-white cursor-pointer'
                              : 'bg-[#EADAB8] text-[#6E4021]/60 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>
                            {affordable
                              ? `Beli · ${effectivePrice} Koin`
                              : `Koin Kurang (${effectivePrice})`}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {Object.entries(inventory)
                    .filter(([id, qty]) => qty > 0 && Boolean(INVENTORY_CATALOG[id]))
                    .map(([id, qty]) => {
                      const def = INVENTORY_CATALOG[id];
                      const effectiveSell = applySellBonusPrice(
                        def.sellCoins,
                        shopTradeMods.sellBonusRate
                      );
                      return (
                        <div
                          key={id}
                          className="bg-[#FFFDF7] border-2 border-[#C8A46D] rounded-xl p-4 flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs text-[#8B572A] tabular-nums">
                              {def.category} · Stok: {qty}
                            </div>
                            <h4 className="font-display font-bold text-lg text-[#2D2926]">
                              {def.name}
                            </h4>
                            <p className="text-xs text-[#2D2926]/75 mt-1">{def.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onSellInventoryItem(id, effectiveSell);
                              showToast(`Terjual 1 ${def.name} (+${effectiveSell} Koin Daun).`);
                            }}
                            className="min-h-[38px] w-full px-3 py-1.5 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border border-[#6E4021] text-[#3E210F] text-xs font-bold cursor-pointer"
                          >
                            Jual 1 (+{effectiveSell} Koin)
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* 11B. BUILDING UPGRADE */}
          {activeTab === 'upgrade' && (
            <div className="space-y-4">
              <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                    Upgrade Bangunan Kalarma Village
                  </h3>
                  <p className="text-xs text-[#2D2926]/80">
                    Tingkatkan 5 fasilitas utama desa hingga Level 3 untuk membuka bonus permanen di Klinik, Kebun Herbal, Kolam Pancing, Toko, dan Butik.
                  </p>
                </div>
                <div className="font-mono text-xs font-bold text-[#6E4021] tabular-nums shrink-0">
                  Diupgrade: {upgradedBuildingsCount}/{BUILDING_UPGRADES.length} · Saldo: {coins} Koin
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BUILDING_UPGRADES.map((bld) => {
                  const curLevel = buildingLevels[bld.id] || 1;
                  const nextTier = bld.tiers.find((t) => t.level === curLevel + 1) || null;
                  const activeTier =
                    curLevel >= 2 ? bld.tiers.find((t) => t.level === curLevel) || null : null;
                  const casesMet = nextTier ? completedCount >= nextTier.requiredCases : true;
                  const coinsMet = nextTier ? coins >= nextTier.costCoins : true;

                  return (
                    <div
                      key={bld.id}
                      className={`rounded-xl border-2 p-5 flex flex-col justify-between gap-4 ${
                        curLevel >= 3
                          ? 'bg-[#F0FDF9] border-[#2C6E63]'
                          : 'bg-[#FFFDF7] border-[#C8A46D]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-[#8B572A]">{bld.zoneLabel}</span>
                          <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-[#6E4021] text-[#FFF8E6]">
                            Level {curLevel}/3
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-2xl text-[#2D2926]">
                          {bld.name}
                        </h4>
                        <div className="p-2.5 rounded-lg bg-[#FAF4E4] border border-[#D6BE93] text-xs text-[#2C6E63] font-semibold">
                          {activeTier
                            ? `Aktif (${activeTier.title}): ${activeTier.perkSummary}`
                            : bld.baseSummary}
                        </div>
                        {nextTier && (
                          <div className="p-2.5 rounded-lg bg-[#FFF8E6] border border-[#C8A46D] text-xs text-[#4A2B14] space-y-0.5">
                            <div className="font-bold">
                              Target Level {nextTier.level}: {nextTier.title}
                            </div>
                            <div>Bonus: {nextTier.perkSummary}</div>
                            <div className="font-mono text-[11px] text-[#9A5016] pt-0.5 tabular-nums">
                              Syarat: {nextTier.requiredCases} Kasus · Biaya {nextTier.costCoins} Koin · +{nextTier.bonusXp} XP
                            </div>
                          </div>
                        )}
                      </div>

                      {!nextTier ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C6E63]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Bangunan Mencapai Level Maksimal</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!casesMet || !coinsMet}
                          onClick={() => {
                            soundFX.playSuccess();
                            onUpgradeBuilding(
                              bld.id,
                              nextTier.level,
                              nextTier.costCoins,
                              nextTier.bonusXp
                            );
                            showToast(
                              `${bld.name} naik ke Level ${nextTier.level} (${nextTier.title})! +${nextTier.bonusXp} XP`
                            );
                          }}
                          className={`min-h-[42px] w-full px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 ${
                            casesMet && coinsMet
                              ? 'bg-[#6E4021] hover:bg-[#522E16] text-[#FFF8E6] cursor-pointer'
                              : 'bg-[#EADAB8] text-[#6E4021]/60 cursor-not-allowed'
                          }`}
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                          <span>
                            {!casesMet
                              ? `Tuntaskan ${nextTier.requiredCases} Kasus Terlebih Dahulu`
                              : !coinsMet
                                ? `Butuh ${nextTier.costCoins} Koin Daun`
                                : `Upgrade ke Lv.${nextTier.level} · ${nextTier.costCoins} Koin`}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 12. EXPANSION MANAGEMENT */}
          {activeTab === 'expansion' && (
            <div className="space-y-4">
              <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                    Manajemen Perluasan Lahan &amp; Fasilitas Desa
                  </h3>
                  <p className="text-xs text-[#2D2926]/80">
                    Kembangkan kavling timur dan fasilitas pendukung desa seiring meningkatnya kasus warga yang pulih.
                  </p>
                </div>
                <div className="font-mono text-xs font-bold text-[#6E4021] tabular-nums shrink-0">
                  Terbangun: {unlockedExpansions.length}/{EXPANSION_PLOTS.length} · Saldo: {coins} Koin
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPANSION_PLOTS.map((plot) => {
                  const built = unlockedExpansions.includes(plot.id);
                  const casesMet = completedCount >= plot.requiredCases;
                  const coinsMet = coins >= plot.costCoins;

                  return (
                    <div
                      key={plot.id}
                      className={`rounded-xl border-2 p-5 flex flex-col justify-between gap-4 ${
                        built ? 'bg-[#F0FDF9] border-[#2C6E63]' : 'bg-[#FFFDF7] border-[#C8A46D]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-[#8B572A]">{plot.zoneLabel}</span>
                          <span className="font-bold text-[#2C6E63]">
                            {built ? 'Selesai Dibangun' : `Syarat: ${plot.requiredCases} Kasus`}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-2xl text-[#2D2926]">
                          {plot.name}
                        </h4>
                        <p className="text-xs text-[#2D2926]/80 leading-relaxed">
                          {plot.description}
                        </p>
                        <div className="p-2.5 rounded-lg bg-[#FAF4E4] border border-[#D6BE93] text-xs text-[#2C6E63] font-semibold">
                          Manfaat: {plot.perkLabel}
                        </div>
                      </div>

                      {built ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C6E63]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Fasilitas Aktif Beroperasi</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!casesMet || !coinsMet}
                          onClick={() => {
                            soundFX.playSuccess();
                            onBuildExpansion(
                              plot.id,
                              plot.costCoins,
                              plot.id === 'eastern_observatory' ? 100 : 40
                            );
                            showToast(`Pembangunan ${plot.name} selesai!`);
                          }}
                          className={`min-h-[42px] w-full px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 ${
                            casesMet && coinsMet
                              ? 'bg-[#6E4021] hover:bg-[#522E16] text-[#FFF8E6] cursor-pointer'
                              : 'bg-[#EADAB8] text-[#6E4021]/60 cursor-not-allowed'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                          <span>
                            {!casesMet
                              ? `Tuntaskan ${plot.requiredCases} Kasus Terlebih Dahulu`
                              : !coinsMet
                                ? `Butuh ${plot.costCoins} Koin Daun`
                                : `Bangun Fasilitas · ${plot.costCoins} Koin`}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 13. SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-[#FFFDF7] border-2 border-[#9E7344] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#2C6E63]">
                    A Cozy Fantasy Adventure · Informasi Game
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                    Kalarma Village
                  </h3>
                  <p className="text-xs text-[#2D2926]/80 mt-0.5">
                    Apoteker {avatar.name} ({rankInfo.current.title}) · {completedCount}/{totalCasesCount} kasus klinik selesai · Tersimpan otomatis di peramban.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onOpenLearningMode();
                  }}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Mode Belajar Farmasi</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FFFDF7] border-2 border-[#C8A46D] rounded-xl p-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-display font-bold text-xl text-[#2D2926]">
                      <CloudSun className="w-5 h-5 text-[#D97706]" />
                      <span>Cuaca &amp; Siklus Waktu 3D</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {WEATHER_ORDER.map((w) => {
                        const active = weather === w;
                        return (
                          <button
                            key={w}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onChangeWeather(w);
                            }}
                            className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                              active
                                ? 'bg-[#FF5A5F] text-white border-[#4A2B14]'
                                : 'bg-[#FAF4E4] text-[#4A2B14] border-[#C8A46D] hover:bg-[#FFE8A3]'
                            }`}
                          >
                            {WEATHER_INFO[w].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onStepTime();
                      }}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border border-[#6E4021] text-[#3E210F] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Lanjutkan Fase Waktu</span>
                    </button>
                    <button
                      type="button"
                      onClick={onToggleMute}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF4E4] border border-[#8B572A] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-[#DC2626]" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-[#2C6E63]" />
                      )}
                      <span>{isMuted ? 'Suara: Mati' : 'Suara: Aktif'}</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-[#EADAB8] space-y-2">
                    <div className="flex items-center gap-2 font-display font-bold text-lg text-[#2D2926]">
                      <Monitor className="w-4 h-4 text-[#2C6E63]" />
                      <span>Kualitas Grafis 3D (Laptop 8 GB)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onChangeGraphicsQuality('low');
                        }}
                        className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                          graphicsQuality === 'low'
                            ? 'bg-[#2C6E63] text-white border-[#16302B]'
                            : 'bg-[#FAF4E4] text-[#4A2B14] border-[#C8A46D]'
                        }`}
                      >
                        <div>Low (Hemat RAM)</div>
                        <div className="text-[10px] font-normal opacity-80">Shadow &amp; vegetasi ringan</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onChangeGraphicsQuality('medium');
                        }}
                        className={`min-h-[42px] px-3 py-1.5 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                          graphicsQuality === 'medium'
                            ? 'bg-[#2C6E63] text-white border-[#16302B]'
                            : 'bg-[#FAF4E4] text-[#4A2B14] border-[#C8A46D]'
                        }`}
                      >
                        <div>Medium (Standar)</div>
                        <div className="text-[10px] font-normal opacity-80">Soft shadow &amp; cahaya penuh</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FFFDF7] border-2 border-[#C8A46D] rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#9A5016]">
                      <Lightbulb className="w-4 h-4" />
                      <span>{dailyTipTitle}</span>
                    </div>
                    <h4 className="font-display font-bold text-2xl text-[#2D2926]">
                      {dailyTipDrugName}
                    </h4>
                    <p className="text-xs text-[#2D2926]/85 leading-relaxed">{dailyTipFact}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#EADAB8]">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onChangeFormularyFocusId(dailyTipDrugId);
                          onChangeTab('formulary');
                        }}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#E8EFEA] hover:bg-[#D1E5D9] border border-[#2C6E63] text-[#1F4A42] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Buka di Buku Obat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onClose();
                          onReturnToTitle();
                        }}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF4E4] hover:bg-[#FFE8A3] border border-[#8B572A] text-[#4A2B14] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Home className="w-4 h-4" />
                        <span>Layar Pembuka</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EADAB8]">
                      <span className="text-xs text-[#6E4021]">Reset seluruh progres save lokal</span>
                      {!confirmReset ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setConfirmReset(true);
                          }}
                          className="min-h-[36px] px-3 py-1 rounded-lg bg-[#FFF5F5] border border-[#DC2626] text-[#B91C1C] text-xs font-bold cursor-pointer"
                        >
                          Reset Save
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              onResetSave();
                              setConfirmReset(false);
                              showToast('Save lokal telah dikembalikan ke awal.');
                            }}
                            className="min-h-[36px] px-3 py-1 rounded-lg bg-[#DC2626] text-white text-xs font-bold cursor-pointer"
                          >
                            Hapus Permanen
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmReset(false)}
                            className="min-h-[36px] px-3 py-1 rounded-lg bg-[#FAF4E4] border border-[#8B572A] text-xs font-bold cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
