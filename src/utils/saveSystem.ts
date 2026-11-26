import { AvatarId, WeatherType } from '../types/pharmacy';

export const SAVE_STORAGE_KEY = 'kalarma_village_save_v1';
export const CURRENT_SAVE_VERSION = 5;

export type GraphicsQuality = 'low' | 'medium';

export interface CaughtFishRecord {
  count: number;
  bestCm: number;
}

export interface DailyQuestProgress {
  dateKey: string;
  casesDone: number;
  herbsHarvested: number;
  fishCaught: number;
  shopActions: number;
  claimedIds: string[];
}

export function getLocalDateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const DEFAULT_BUILDING_LEVELS: Record<string, number> = {
  clinic: 1,
  garden: 1,
  pond: 1,
  shop: 1,
  boutique: 1,
};

export function createDefaultDailyQuest(dateKey: string = getLocalDateKey()): DailyQuestProgress {
  return {
    dateKey,
    casesDone: 0,
    herbsHarvested: 0,
    fishCaught: 0,
    shopActions: 0,
    claimedIds: [],
  };
}

export interface KalarmaSaveData {
  version: number;
  hasStarted: boolean;
  selectedAvatar: AvatarId;
  xp: number;
  completedCases: string[];
  weather: WeatherType;
  isMuted: boolean;
  graphicsQuality: GraphicsQuality;
  coins: number;
  equippedSkinId: string | null;
  unlockedSkinIds: string[];
  equippedOutfitId: string | null;
  unlockedOutfitIds: string[];
  equippedAccessoryId: string | null;
  unlockedAccessoryIds: string[];
  inventory: Record<string, number>;
  discoveredHerbs: string[];
  caughtFish: Record<string, CaughtFishRecord>;
  buildingLevels: Record<string, number>;
  unlockedExpansions: string[];
  claimedAchievements: string[];
  dailyQuest: DailyQuestProgress;
  lastSavedAt: string;
}

export const DEFAULT_INVENTORY: Record<string, number> = {
  meniran_leaf: 3,
  temulawak_root: 2,
  wooden_bait: 4,
  clinical_spuit: 1,
};

export const DEFAULT_SAVE_DATA: KalarmaSaveData = {
  version: CURRENT_SAVE_VERSION,
  hasStarted: false,
  selectedAvatar: AvatarId.SALI,
  xp: 0,
  completedCases: [],
  weather: WeatherType.CERAH_HANGAT,
  isMuted: false,
  graphicsQuality: 'medium',
  coins: 120,
  equippedSkinId: 'skin_apothecary',
  unlockedSkinIds: ['skin_apothecary'],
  equippedOutfitId: 'classic_coat',
  unlockedOutfitIds: ['classic_coat'],
  equippedAccessoryId: null,
  unlockedAccessoryIds: ['acc_round_glasses'],
  inventory: { ...DEFAULT_INVENTORY },
  discoveredHerbs: ['meniran', 'temulawak'],
  caughtFish: {},
  buildingLevels: { ...DEFAULT_BUILDING_LEVELS },
  unlockedExpansions: [],
  claimedAchievements: [],
  dailyQuest: createDefaultDailyQuest(),
  lastSavedAt: new Date(0).toISOString(),
};

const VALID_AVATARS = new Set<string>(Object.values(AvatarId));
const VALID_WEATHERS = new Set<string>(Object.values(WeatherType));
const UPGRADABLE_BUILDINGS = ['clinic', 'garden', 'pond', 'shop', 'boutique'] as const;

export function migrateSaveData(raw: unknown): KalarmaSaveData {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_SAVE_DATA,
      inventory: { ...DEFAULT_INVENTORY },
      caughtFish: {},
      buildingLevels: { ...DEFAULT_BUILDING_LEVELS },
      dailyQuest: createDefaultDailyQuest(),
    };
  }
  const obj = raw as Record<string, unknown>;

  const selectedAvatar =
    typeof obj.selectedAvatar === 'string' && VALID_AVATARS.has(obj.selectedAvatar)
      ? (obj.selectedAvatar as AvatarId)
      : DEFAULT_SAVE_DATA.selectedAvatar;

  const weather =
    typeof obj.weather === 'string' && VALID_WEATHERS.has(obj.weather)
      ? (obj.weather as WeatherType)
      : DEFAULT_SAVE_DATA.weather;

  const xp =
    typeof obj.xp === 'number' && Number.isFinite(obj.xp) && obj.xp >= 0
      ? Math.floor(obj.xp)
      : DEFAULT_SAVE_DATA.xp;

  const completedCases = Array.isArray(obj.completedCases)
    ? Array.from(new Set(obj.completedCases.filter((id): id is string => typeof id === 'string')))
    : [];

  const isMuted = typeof obj.isMuted === 'boolean' ? obj.isMuted : DEFAULT_SAVE_DATA.isMuted;
  const graphicsQuality: GraphicsQuality =
    obj.graphicsQuality === 'low' || obj.graphicsQuality === 'medium'
      ? obj.graphicsQuality
      : DEFAULT_SAVE_DATA.graphicsQuality;

  const hasStarted =
    typeof obj.hasStarted === 'boolean'
      ? obj.hasStarted
      : xp > 0 || completedCases.length > 0;

  const coins =
    typeof obj.coins === 'number' && Number.isFinite(obj.coins) && obj.coins >= 0
      ? Math.floor(obj.coins)
      : DEFAULT_SAVE_DATA.coins;

  const unlockedSkinIds = Array.isArray(obj.unlockedSkinIds)
    ? Array.from(
        new Set([
          'skin_apothecary',
          ...obj.unlockedSkinIds.filter((id): id is string => typeof id === 'string'),
        ])
      )
    : [...DEFAULT_SAVE_DATA.unlockedSkinIds];

  const equippedSkinId =
    obj.equippedSkinId === null
      ? null
      : typeof obj.equippedSkinId === 'string' && unlockedSkinIds.includes(obj.equippedSkinId)
        ? obj.equippedSkinId
        : 'skin_apothecary';

  const unlockedOutfitIds = Array.isArray(obj.unlockedOutfitIds)
    ? Array.from(
        new Set([
          'classic_coat',
          ...obj.unlockedOutfitIds.filter((id): id is string => typeof id === 'string'),
        ])
      )
    : [...DEFAULT_SAVE_DATA.unlockedOutfitIds];

  const equippedOutfitId =
    obj.equippedOutfitId === null
      ? null
      : typeof obj.equippedOutfitId === 'string' && unlockedOutfitIds.includes(obj.equippedOutfitId)
        ? obj.equippedOutfitId
        : 'classic_coat';

  const unlockedAccessoryIds = Array.isArray(obj.unlockedAccessoryIds)
    ? Array.from(
        new Set([
          'acc_round_glasses',
          ...obj.unlockedAccessoryIds.filter((id): id is string => typeof id === 'string'),
        ])
      )
    : [...DEFAULT_SAVE_DATA.unlockedAccessoryIds];

  const equippedAccessoryId =
    obj.equippedAccessoryId === null
      ? null
      : typeof obj.equippedAccessoryId === 'string' &&
          unlockedAccessoryIds.includes(obj.equippedAccessoryId)
        ? obj.equippedAccessoryId
        : null;

  const inventory: Record<string, number> =
    obj.inventory && typeof obj.inventory === 'object' && !Array.isArray(obj.inventory)
      ? Object.entries(obj.inventory as Record<string, unknown>).reduce<Record<string, number>>(
          (acc, [key, val]) => {
            if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
              acc[key] = Math.floor(val);
            }
            return acc;
          },
          {}
        )
      : { ...DEFAULT_INVENTORY };

  const discoveredHerbs = Array.isArray(obj.discoveredHerbs)
    ? Array.from(
        new Set([
          ...DEFAULT_SAVE_DATA.discoveredHerbs,
          ...obj.discoveredHerbs.filter((id): id is string => typeof id === 'string'),
        ])
      )
    : [...DEFAULT_SAVE_DATA.discoveredHerbs];

  const caughtFish: Record<string, CaughtFishRecord> = {};
  if (obj.caughtFish && typeof obj.caughtFish === 'object' && !Array.isArray(obj.caughtFish)) {
    for (const [fishId, rec] of Object.entries(obj.caughtFish as Record<string, unknown>)) {
      if (rec && typeof rec === 'object') {
        const r = rec as Record<string, unknown>;
        const count =
          typeof r.count === 'number' && Number.isFinite(r.count) && r.count > 0
            ? Math.floor(r.count)
            : 0;
        const bestCm =
          typeof r.bestCm === 'number' && Number.isFinite(r.bestCm) && r.bestCm > 0
            ? Math.round(r.bestCm * 10) / 10
            : 0;
        if (count > 0) {
          caughtFish[fishId] = { count, bestCm };
        }
      }
    }
  }

  const buildingLevels: Record<string, number> = { ...DEFAULT_BUILDING_LEVELS };
  if (
    obj.buildingLevels &&
    typeof obj.buildingLevels === 'object' &&
    !Array.isArray(obj.buildingLevels)
  ) {
    const rawLevels = obj.buildingLevels as Record<string, unknown>;
    for (const bId of UPGRADABLE_BUILDINGS) {
      const val = rawLevels[bId];
      if (typeof val === 'number' && Number.isFinite(val)) {
        buildingLevels[bId] = Math.min(3, Math.max(1, Math.floor(val)));
      }
    }
  }

  const unlockedExpansions = Array.isArray(obj.unlockedExpansions)
    ? Array.from(new Set(obj.unlockedExpansions.filter((id): id is string => typeof id === 'string')))
    : [];

  const claimedAchievements = Array.isArray(obj.claimedAchievements)
    ? Array.from(
        new Set(obj.claimedAchievements.filter((id): id is string => typeof id === 'string'))
      )
    : [];

  const todayKey = getLocalDateKey();
  let dailyQuest = createDefaultDailyQuest(todayKey);
  if (obj.dailyQuest && typeof obj.dailyQuest === 'object' && !Array.isArray(obj.dailyQuest)) {
    const dq = obj.dailyQuest as Record<string, unknown>;
    if (dq.dateKey === todayKey) {
      const toSafeCount = (v: unknown) =>
        typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
      dailyQuest = {
        dateKey: todayKey,
        casesDone: toSafeCount(dq.casesDone),
        herbsHarvested: toSafeCount(dq.herbsHarvested),
        fishCaught: toSafeCount(dq.fishCaught),
        shopActions: toSafeCount(dq.shopActions),
        claimedIds: Array.isArray(dq.claimedIds)
          ? Array.from(new Set(dq.claimedIds.filter((id): id is string => typeof id === 'string')))
          : [],
      };
    }
  }

  return {
    version: CURRENT_SAVE_VERSION,
    hasStarted,
    selectedAvatar,
    xp,
    completedCases,
    weather,
    isMuted,
    graphicsQuality,
    coins,
    equippedSkinId,
    unlockedSkinIds,
    equippedOutfitId,
    unlockedOutfitIds,
    equippedAccessoryId,
    unlockedAccessoryIds,
    inventory,
    discoveredHerbs,
    caughtFish,
    buildingLevels,
    unlockedExpansions,
    claimedAchievements,
    dailyQuest,
    lastSavedAt:
      typeof obj.lastSavedAt === 'string' ? obj.lastSavedAt : new Date().toISOString(),
  };
}

export function loadGameSave(): KalarmaSaveData {
  if (typeof window === 'undefined') {
    return {
      ...DEFAULT_SAVE_DATA,
      inventory: { ...DEFAULT_INVENTORY },
      caughtFish: {},
      buildingLevels: { ...DEFAULT_BUILDING_LEVELS },
      dailyQuest: createDefaultDailyQuest(),
    };
  }
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_SAVE_DATA,
        inventory: { ...DEFAULT_INVENTORY },
        caughtFish: {},
        buildingLevels: { ...DEFAULT_BUILDING_LEVELS },
        dailyQuest: createDefaultDailyQuest(),
      };
    }
    const parsed = JSON.parse(raw);
    return migrateSaveData(parsed);
  } catch {
    return {
      ...DEFAULT_SAVE_DATA,
      inventory: { ...DEFAULT_INVENTORY },
      caughtFish: {},
      buildingLevels: { ...DEFAULT_BUILDING_LEVELS },
      dailyQuest: createDefaultDailyQuest(),
    };
  }
}

export function persistGameSave(
  data: Omit<KalarmaSaveData, 'version' | 'lastSavedAt'>
): KalarmaSaveData {
  const payload: KalarmaSaveData = {
    ...data,
    version: CURRENT_SAVE_VERSION,
    lastSavedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }
  return payload;
}

export function hasSavedAdventure(save: KalarmaSaveData): boolean {
  return (
    save.hasStarted ||
    save.xp > 0 ||
    save.completedCases.length > 0 ||
    save.unlockedExpansions.length > 0 ||
    Object.values(save.buildingLevels).some((lvl) => lvl > 1) ||
    save.dailyQuest.claimedIds.length > 0 ||
    Object.keys(save.caughtFish).length > 0
  );
}
