export enum MainTab {
  ARENA = 'arena',
  CALCULATOR = 'calculator',
  FORMULARY = 'formulary',
  EVALUATION = 'evaluation',
}

export enum WeatherType {
  CERAH_HANGAT = 'cerah',
  HUJAN_LEMBAP = 'hujan',
  ANGIN_PANCAROBA = 'angin',
  KABUT_MALAM = 'kabut',
}

export enum AvatarId {
  SALI = 'sali',
  KAEL = 'kael',
  MILO = 'milo',
  TOBI = 'tobi',
}

export enum EmotionType {
  HAPPY = 'happy',
  THINKING = 'thinking',
  PANICKED = 'panicked',
  SICK = 'sick',
  PROUD = 'proud',
  SERIOUS = 'serious',
}

export type CharacterId =
  | AvatarId
  | 'lios'
  | 'alia'
  | 'bima'
  | 'sekar'
  | 'hana'
  | 'koko'
  | 'bobi'
  | 'geri'
  | 'mimi'
  | 'nino'
  | 'riko'
  | 'pipi'
  | 'lili'
  | 'cici'
  | 'taro'
  | 'yuna'
  | 'dodo'
  | 'sora';

export enum CaseStage {
  VILLAGE_HUB = 'village_hub',
  DIALOG_INTRO = 'dialog_intro',
  SCREENING = 'screening',
  THERAPY_DEFENSE = 'therapy_defense',
  COUNSELING = 'counseling',
}

export enum TowerId {
  BETA_LAKTAM = 'beta_laktam',
  FLUOROKUINOLON = 'fluorokuinolon',
  MAKROLIDA = 'makrolida',
  VANCOMYCIN_IV = 'vancomycin_iv',
  ARB = 'arb',
  METFORMIN_INSULIN = 'metformin_insulin',
  PPI_ANTASIDA = 'ppi_antasida',
  MENIRAN = 'meniran',
  TEMULAWAK = 'temulawak',
}

export interface AvatarProfile {
  id: AvatarId;
  name: string;
  species: string;
  title: string;
  outfit: string;
  bonusLabel: string;
  bonusDetail: string;
  imagePath: string;
  accentHex: string;
  dosePrecisionBonus: number;
  towerFireRateBonus: number;
  herbalPowerBonus: number;
  interactionReveal: boolean;
}

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  species: string;
  role: string;
  group: 'avatar' | 'mentor' | 'villager';
  primaryColor: string;
  secondaryColor: string;
  accessory: string;
  bio: string;
  personality?: string;
}

export interface DialogLine {
  speakerId: CharacterId;
  emotion: EmotionType;
  text: string;
}

export interface ScreeningOption {
  id: string;
  label: string;
  detail: string;
  isCorrect: boolean;
  feedbackSpeaker: CharacterId;
  feedbackEmotion: EmotionType;
  feedbackText: string;
}

export interface PrescriptionData {
  prescriber: string;
  isSelfMedication: boolean;
  patientVitals: {
    age: string;
    weight: string;
    temp: string;
    bp: string;
    allergy: string;
    comorbid: string;
  };
  items: string[];
  clinicalNote: string;
}

export interface PathogenWaveConfig {
  id: string;
  label: string;
  enemyType: 'coccus' | 'ecoli' | 'mrsa' | 'virus' | 'acid' | 'hypertension' | 'glucose';
  count: number;
  hp: number;
  speed: number;
  spawnInterval: number;
  reward: number;
}

export interface InfusionChallengeConfig {
  enabled: boolean;
  drugName: string;
  volumeMl: number;
  targetHours: number;
  dropFactor: 20 | 60;
  minTpm: number;
  maxTpm: number;
}

export interface CaseScenario {
  id: string;
  patientId: CharacterId;
  title: string;
  diagnosis: string;
  recommendedWeather: WeatherType;
  difficulty: 'Pemula' | 'Menengah' | 'Lanjutan';
  mapPosition: { xPercent: number; yPercent: number };
  summary: string;
  introDialogs: DialogLine[];
  prescription: PrescriptionData;
  screeningPrompt: string;
  tobiHint: string;
  screeningOptions: ScreeningOption[];
  isNonAntibioticCase: boolean;
  recommendedTowers: TowerId[];
  allowedTowers: TowerId[];
  startingEnergy: number;
  organName: string;
  waves: PathogenWaveConfig[];
  infusionConfig: InfusionChallengeConfig;
  counselingDialogs: DialogLine[];
  clinicalPearl: string;
  xpReward: number;
}

export interface PracticeCaseScenario {
  id: string;
  focusCategory: 'Drug-Food Interaction';
  subTopic: string;
  patientId: CharacterId;
  title: string;
  difficulty: 'Pemula' | 'Menengah' | 'Lanjutan';
  drugPair: string;
  foodItem: string;
  interactionType: string;
  mealTimingRule: string;
  vignette: string;
  patientQuote: string;
  tobiHint: string;
  question: string;
  options: ScreeningOption[];
  clinicalPearl: string;
  relatedFormularyId?: string;
}

export interface TowerDefinition {
  id: TowerId;
  name: string;
  shortName: string;
  category: 'modern' | 'herbal';
  cost: number;
  range: number;
  fireRate: number;
  damage: number;
  color: string;
  targetType: string;
  description: string;
  isAntibiotic: boolean;
  toxicityWeight: number;
}

export interface DrugMonograph {
  id: string;
  name: string;
  genericClass: string;
  category: 'Antibiotik' | 'Antihipertensi' | 'Antidiabetes' | 'Saluran Cerna' | 'Suportif' | 'Herbal Terstandar';
  mechanism: string;
  indications: string[];
  interactions: string;
  sideEffects: string;
  pregnancyCategory: string;
  storageNote: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  mentorSpeaker: CharacterId;
  explanation: string;
}
