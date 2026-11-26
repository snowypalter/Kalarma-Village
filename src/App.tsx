import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CloudSun,
  Compass,
  GraduationCap,
  Home,
  Lightbulb,
  Lock,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CalculatorSuite } from './components/CalculatorSuite';
import { CharacterPortrait } from './components/CharacterPortrait';
import { ClinicalQuiz } from './components/ClinicalQuiz';
import { ClinicalScreening } from './components/ClinicalScreening';
import { FormularyBook } from './components/FormularyBook';
import { GameHUD, HudActionPage } from './components/GameHUD';
import { LearningModeModal } from './components/LearningModeModal';
import { TherapyDefenseCanvas } from './components/TherapyDefenseCanvas';
import { TitleScreen } from './components/TitleScreen';
import { VillageDiorama3D } from './components/VillageDiorama3D';
import { VisualNovelDialog } from './components/VisualNovelDialog';
import { CASES } from './data/cases';
import { AVATARS, CHARACTERS, VILLAGE_KEY_ART, WEATHER_INFO, getRankForXp } from './data/characters';
import { FORMULARY_DATA } from './data/formulary';
import {
  AvatarId,
  CaseScenario,
  CaseStage,
  CharacterId,
  EmotionType,
  WeatherType,
} from './types/pharmacy';
import { soundFX } from './utils/sound';

const NPC_LIST: CharacterId[] = [
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

const ALL_EMOTIONS: { id: EmotionType; label: string }[] = [
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

type InGameOverlay =
  | 'quest'
  | 'medals'
  | 'formulary'
  | 'calculator'
  | 'quiz'
  | 'character'
  | 'settings';

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
    description: 'Menuntaskan 1 kasus klinis perdana di Desa Asklepios.',
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
  const [showTitle, setShowTitle] = useState(true);
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(AvatarId.SALI);
  const [weather, setWeather] = useState<WeatherType>(WeatherType.CERAH_HANGAT);
  const [xp, setXp] = useState(0);
  const [completedCases, setCompletedCases] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  // Case RPG State Machine
  const [caseStage, setCaseStage] = useState<CaseStage>(CaseStage.VILLAGE_HUB);
  const [activeCase, setActiveCase] = useState<CaseScenario | null>(null);
  const [lastStars, setLastStars] = useState<number>(3);
  const [counselingDone, setCounselingDone] = useState(false);
  const [newlyUnlockedMedal, setNewlyUnlockedMedal] = useState<PharmacistMedal | null>(null);
  const [dashboardCelebrateMedalId, setDashboardCelebrateMedalId] = useState<
    PharmacistMedal['id'] | null
  >(null);

  // HUD 3D Controls & Unified In-Game Overlays
  const [activeOverlay, setActiveOverlay] = useState<InGameOverlay | null>(null);
  const [timeStepTrigger, setTimeStepTrigger] = useState(0);
  const [zoomTrigger, setZoomTrigger] = useState<{ dir: 1 | -1; seq: number }>({ dir: 1, seq: 0 });
  const [focusHubTrigger, setFocusHubTrigger] = useState(0);
  const [formularyFocusId, setFormularyFocusId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [previewEmotion, setPreviewEmotion] = useState<EmotionType>(EmotionType.HAPPY);

  useEffect(() => {
    const checkDayRollover = () => {
      const now = new Date();
      setCurrentDate((prev) =>
        prev.getFullYear() === now.getFullYear() &&
        prev.getMonth() === now.getMonth() &&
        prev.getDate() === now.getDate()
          ? prev
          : now
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
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLearnModal) setShowLearnModal(false);
        else if (activeOverlay) setActiveOverlay(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showLearnModal, activeOverlay]);

  const dailyClinicalTip = getDailyClinicalTip(currentDate);
  const avatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];
  const rankInfo = getRankForXp(xp);
  const totalCasesCount = CASES.length;
  const completedCount = completedCases.length;
  const unlockedMedals = PHARMACIST_MEDALS.filter((m) => completedCount >= m.requiredCases);
  const highestMedal = unlockedMedals[unlockedMedals.length - 1] ?? null;
  const nextMedal = PHARMACIST_MEDALS.find((m) => completedCount < m.requiredCases) ?? null;
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

  useEffect(() => {
    if (
      !dashboardCelebrateMedalId ||
      caseStage !== CaseStage.VILLAGE_HUB ||
      activeOverlay !== 'medals'
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      setDashboardCelebrateMedalId(null);
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [dashboardCelebrateMedalId, caseStage, activeOverlay]);

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

  const handleVictory = (stars: number) => {
    setLastStars(stars);
    setCaseStage(CaseStage.COUNSELING);
    if (activeCase && !completedCases.includes(activeCase.id)) {
      const nextCount = completedCases.length + 1;
      const earnedNow = PHARMACIST_MEDALS.find((m) => m.requiredCases === nextCount) ?? null;
      setNewlyUnlockedMedal(earnedNow);
      if (earnedNow) {
        setDashboardCelebrateMedalId(earnedNow.id);
      }
      setCompletedCases((prev) => [...prev, activeCase.id]);
      setXp((prev) => prev + activeCase.xpReward);
    } else if (activeCase) {
      setNewlyUnlockedMedal(null);
      setXp((prev) => prev + 40);
    }
  };

  const handleHudNavigate = (page: HudActionPage) => {
    soundFX.playClick();
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
          setActiveOverlay('quiz');
        }}
        onStartPlay={() => {
          setShowLearnModal(false);
          setShowTitle(false);
        }}
      />
    );
  };

  if (showTitle) {
    return (
      <>
        <TitleScreen
          selectedAvatar={selectedAvatar}
          onSelectAvatar={setSelectedAvatar}
          onStart={() => setShowTitle(false)}
          onOpenLearnMode={() => setShowLearnModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
        {renderLearningModal()}
      </>
    );
  }

  const overlayTitleMap: Record<InGameOverlay, { title: string; subtitle: string; icon: React.ReactNode }> = {
    quest: {
      title: `Daftar Pasien & Misi Triase (${completedCount}/${totalCasesCount})`,
      subtitle: 'Pilih warga atau langsung klik karakter bertanda seru (!) di diorama 3D',
      icon: <Compass className="w-5 h-5" />,
    },
    medals: {
      title: 'Medali Apoteker & Progres Karier',
      subtitle: `Pangkat: ${rankInfo.current.title} · ${xp} XP`,
      icon: <Trophy className="w-5 h-5" />,
    },
    formulary: {
      title: 'Buku Saku Formularium & Herbarium Desa',
      subtitle: 'Panduan mekanisme kerja, interaksi obat, dan stabilitas penyimpanan',
      icon: <BookOpen className="w-5 h-5" />,
    },
    calculator: {
      title: 'Kalkulator Farmasi Klinis',
      subtitle: 'Hitung dosis anak (mg/kgBB), tetes infus (TPM), dan bersihan kreatinin',
      icon: <Calculator className="w-5 h-5" />,
    },
    quiz: {
      title: 'Evaluasi Klinis Pre-Test & Post-Test',
      subtitle: 'Uji ketajaman skrining interaksi obat dan stewardship antibiotik',
      icon: <ClipboardCheck className="w-5 h-5" />,
    },
    character: {
      title: `Apoteker & ${NPC_LIST.length} Tokoh Desa`,
      subtitle: 'Ganti apoteker pendamping atau lihat 6 ekspresi dinamis warga desa',
      icon: <Users className="w-5 h-5" />,
    },
    settings: {
      title: 'Menu Desa, Cuaca & Tips Klinis Harian',
      subtitle: 'Atur iklim epidemiologi 3D, fase waktu, suara, dan fakta pustaka harian',
      icon: <Settings className="w-5 h-5" />,
    },
  };

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
                          setActiveOverlay('medals');
                        }
                        setNewlyUnlockedMedal(null);
                      }}
                      className="v18-btn min-h-[44px] px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#EB494E] text-white font-display font-bold text-lg whitespace-nowrap cursor-pointer"
                    >
                      Kembali ke Desa 3D Asklepios
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
        weather={weather}
        onChangeWeather={setWeather}
        completedCases={completedCases}
        activeCaseId={activeCase?.id ?? null}
        onSelectCase={handleSelectCase}
        timeStepTrigger={timeStepTrigger}
        zoomTrigger={zoomTrigger}
        focusHubTrigger={focusHubTrigger}
      />

      {/* Unified Cozy In-Game HUD Holding All Icons, Tools & Navigation */}
      <GameHUD
        selectedAvatar={selectedAvatar}
        xp={xp}
        rankTitle={rankInfo.current.title}
        completedCount={completedCount}
        totalCases={totalCasesCount}
        unlockedMedalsCount={unlockedMedals.length}
        totalMedalsCount={PHARMACIST_MEDALS.length}
        weather={weather}
        isMuted={isMuted}
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

      {/* Unified In-Game Panel Modals (Keeps Game Screen Completely Zero-Scroll) */}
      {activeOverlay && (
        <div
          className="fixed inset-0 z-40 bg-[#2A160B]/70 flex items-center justify-center p-2.5 sm:p-5 pb-safe"
          role="dialog"
          aria-modal="true"
          aria-label={overlayTitleMap[activeOverlay].title}
        >
          <div className="w-full max-w-5xl max-h-[95dvh] sm:max-h-[90dvh] bg-[#FAF4E4] border-[3.5px] border-[#6E4021] rounded-2xl shadow-[0_12px_0_#432512,0_20px_38px_rgba(0,0,0,0.45)] flex flex-col overflow-y-auto text-[#2D2926]">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 bg-gradient-to-b from-[#9B6334] to-[#744522] border-b-[3px] border-[#4A2B14] text-[#FFF8E6] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFD166] border-2 border-[#4A2B14] text-[#4A2B14] flex items-center justify-center shrink-0">
                  {overlayTitleMap[activeOverlay].icon}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-xl sm:text-2xl leading-none truncate">
                    {overlayTitleMap[activeOverlay].title}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#FFE8B3] mt-0.5 truncate">
                    {overlayTitleMap[activeOverlay].subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveOverlay(null);
                }}
                className="min-h-[42px] min-w-[42px] rounded-xl bg-[#5C3419] hover:bg-[#FF5A5F] border-2 border-[#E6B66B] text-[#FFF8E6] inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                aria-label="Tutup panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F2EFEB]">
              {/* OVERLAY 1: DAFTAR PASIEN / QUEST */}
              {activeOverlay === 'quest' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {CASES.map((c) => {
                      const patient = CHARACTERS[c.patientId];
                      const isDone = completedCases.includes(c.id);
                      const isActiveMission = !isDone && activeCase?.id === c.id;
                      const matchesWeather = c.recommendedWeather === weather;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCase(c)}
                          className={`v18-card-sm text-left p-4 transition-transform hover:-translate-y-0.5 flex flex-col justify-between gap-3 cursor-pointer ${
                            isActiveMission
                              ? 'bg-[#FFD166]/30'
                              : isDone
                                ? 'bg-white/90'
                                : 'bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#2D2926]/75 mb-2">
                              <span className="truncate">
                                {patient.name} ({patient.species}) · {c.difficulty}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 border border-[#2D2926] shrink-0 ${
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
                                    ? 'Aktif'
                                    : matchesWeather
                                      ? 'Prioritas Cuaca'
                                      : 'Menunggu'}
                              </span>
                            </div>
                            <h3 className="font-display font-bold text-xl text-[#FF5A5F] leading-snug">
                              {c.title}
                            </h3>
                            <p className="text-xs text-[#2D2926]/75 mt-1.5 leading-relaxed line-clamp-2">
                              {c.summary}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t-2 border-dashed border-[#2D2926]/15 text-xs font-bold text-[#2D2926]">
                            <span className="truncate pr-2">{c.diagnosis}</span>
                            <span className="font-mono tabular-nums bg-[#FFD166] px-2 py-0.5 border border-[#2D2926] shrink-0">
                              +{c.xpReward} XP
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* OVERLAY 2: MEDALI APOTEKER */}
              {activeOverlay === 'medals' && (
                <div className="space-y-5">
                  <div className="v18-card-sm p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-display font-bold text-2xl text-[#2D2926]">
                        {highestMedal ? `Pencapaian: ${highestMedal.title}` : 'Mulai Perjalanan Medali'}
                      </div>
                      <p className="text-xs sm:text-sm text-[#2D2926]/75">
                        {nextMedal
                          ? `${nextMedal.requiredCases - completedCount} kasus lagi untuk membuka Medali ${nextMedal.tier} (${nextMedal.title}).`
                          : 'Luar biasa! Seluruh 4 Medali Apoteker dan 10 pasien desa telah dituntaskan.'}
                      </p>
                    </div>
                    <div className="sm:w-64 shrink-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono font-bold tabular-nums">
                        <span>PROGRES KASUS</span>
                        <span>
                          {completedCount}/{totalCasesCount} ({overallProgressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-[#F2EFEB] border-2 border-[#2D2926] overflow-hidden">
                        <div
                          className="h-full bg-[#FF5A5F] transition-all duration-500"
                          style={{ width: `${overallProgressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PHARMACIST_MEDALS.map((medal) => {
                      const unlocked = completedCount >= medal.requiredCases;
                      const isCelebrating = unlocked && dashboardCelebrateMedalId === medal.id;
                      const pct = Math.min(
                        100,
                        Math.round((completedCount / medal.requiredCases) * 100)
                      );

                      return (
                        <div
                          key={medal.id}
                          className={`p-4 flex flex-col justify-between gap-3 transition-all ${
                            unlocked
                              ? `v18-card-sm ${medal.cardBg} ${
                                  isCelebrating ? 'ring-4 ring-[#FFD166]' : ''
                                }`
                              : 'bg-[#FAF4E4] border-2 border-dashed border-[#2D2926]/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <MedalEmblem
                              medal={medal}
                              unlocked={unlocked}
                              size={46}
                              celebrate={isCelebrating}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`font-mono text-[11px] font-bold uppercase tracking-wider ${
                                    unlocked ? medal.accentText : 'text-[#2D2926]/55'
                                  }`}
                                >
                                  {medal.tier}
                                </span>
                                {unlocked ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#2C6E63] shrink-0" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-[#2D2926]/40 shrink-0" />
                                )}
                              </div>
                              <div className="font-display font-bold text-lg text-[#2D2926] leading-tight truncate mt-0.5">
                                {medal.title}
                              </div>
                              <p className="text-xs text-[#2D2926]/75 mt-1 leading-snug">
                                {medal.description}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono font-bold tabular-nums text-[#2D2926]/75">
                              <span>{unlocked ? 'DIRAIH' : 'TARGET KASUS'}</span>
                              <span>
                                {Math.min(completedCount, medal.requiredCases)}/{medal.requiredCases}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-white border border-[#2D2926] overflow-hidden">
                              <div
                                className="h-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: unlocked ? medal.ringColor : '#2D2926',
                                  opacity: unlocked ? 1 : 0.25,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* OVERLAY 3: BUKU FORMULARIUM */}
              {activeOverlay === 'formulary' && <FormularyBook initialDrugId={formularyFocusId} />}

              {/* OVERLAY 4: KALKULATOR FARMASI */}
              {activeOverlay === 'calculator' && <CalculatorSuite />}

              {/* OVERLAY 5: QUIZ EVALUASI */}
              {activeOverlay === 'quiz' && <ClinicalQuiz />}

              {/* OVERLAY 6: GANTI AVATAR & 15 TOKOH */}
              {activeOverlay === 'character' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                        Pilih Apoteker Pendamping (Aktif di Dunia 3D)
                      </h3>
                      <span className="font-mono text-xs font-bold bg-[#FFD166] border-2 border-[#2D2926] px-2.5 py-1 tabular-nums">
                        {xp} XP · {xpProgressPct}% ke Pangkat Berikutnya
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {AVATARS.map((av) => {
                        const selected = av.id === selectedAvatar;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setSelectedAvatar(av.id);
                            }}
                            className={`text-left p-3.5 rounded-xl border-[2.5px] transition-all flex items-start gap-3 cursor-pointer ${
                              selected
                                ? 'bg-[#FFE8A3] border-[#6E4021] shadow-[0_4px_0_#6E4021]'
                                : 'bg-white border-[#C8A46D] hover:bg-[#FFFDF7]'
                            }`}
                          >
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#6E4021] bg-[#F2EFEB] shrink-0">
                              <img
                                src={av.imagePath}
                                alt={av.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              {selected && (
                                <span className="absolute top-1 right-1 w-4 h-4 rounded bg-[#2C6E63] text-white flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-display font-bold text-xl leading-none text-[#2D2926]">
                                {av.name}
                              </div>
                              <div className="font-mono text-[10px] font-bold text-[#9A5016] mt-0.5">
                                {av.species} · {av.title}
                              </div>
                              <p className="text-[11px] text-[#4A2B14]/85 mt-1 leading-snug">
                                {av.bonusDetail}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t-2 border-dashed border-[#2D2926]/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                        {NPC_LIST.length} Mentor &amp; Warga Desa Asklepios
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_EMOTIONS.map((em) => (
                          <button
                            key={em.id}
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setPreviewEmotion(em.id);
                            }}
                            className={`min-h-[34px] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer ${
                              previewEmotion === em.id
                                ? 'bg-[#FF5A5F] text-white border-2 border-[#2D2926]'
                                : 'bg-white text-[#2D2926] border-2 border-[#2D2926]/25'
                            }`}
                          >
                            {em.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {NPC_LIST.map((npcId) => {
                        const char = CHARACTERS[npcId];
                        return (
                          <div
                            key={npcId}
                            className="v18-card-sm p-3.5 flex items-start gap-3 bg-white"
                          >
                            <CharacterPortrait characterId={npcId} emotion={previewEmotion} size={60} />
                            <div className="min-w-0">
                              <div className="font-mono text-[10px] font-bold uppercase text-[#2D2926]/65">
                                {char.group === 'mentor' ? 'Tenaga Medis' : 'Warga Desa'} ·{' '}
                                {char.species}
                              </div>
                              <div className="font-display font-bold text-xl text-[#FF5A5F] leading-tight">
                                {char.name}
                              </div>
                              <div className="text-[11px] font-bold text-[#2D2926]/80">{char.role}</div>
                              <p className="text-xs text-[#2D2926]/75 mt-1 leading-snug">{char.bio}</p>
                              {char.personality && (
                                <p className="text-[11px] text-[#2C6E63] font-medium mt-1.5 leading-snug">
                                  <span className="font-bold">Kepribadian:</span> {char.personality}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* OVERLAY 7: MENU DESA, CUACA, AUDIO & TIPS HARIAN */}
              {activeOverlay === 'settings' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cuaca & Waktu */}
                    <div className="v18-card-sm p-4 bg-white space-y-3">
                      <div className="flex items-center gap-2 font-display font-bold text-xl text-[#2D2926]">
                        <CloudSun className="w-5 h-5 text-[#FF5A5F]" />
                        <span>Cuaca &amp; Siklus Waktu Desa 3D</span>
                      </div>
                      <p className="text-xs text-[#2D2926]/75">
                        Cuaca memengaruhi prioritas kasus warga dan efek gelombang kuman di benteng terapi:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {WEATHER_ORDER.map((w) => {
                          const active = weather === w;
                          return (
                            <button
                              key={w}
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setWeather(w);
                              }}
                              className={`min-h-[42px] px-3 py-2 rounded-xl border-2 text-xs font-bold text-left cursor-pointer transition-all ${
                                active
                                  ? 'bg-[#FF5A5F] text-white border-[#2D2926]'
                                  : 'bg-[#F2EFEB] text-[#2D2926] border-[#2D2926]/30 hover:bg-[#FFD166]/40'
                              }`}
                            >
                              {WEATHER_INFO[w].label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setTimeStepTrigger((n) => n + 1);
                          }}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FFD166] border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Lanjutkan Fase Waktu</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleMute}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border-2 border-[#2D2926] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-[#FF5A5F]" /> : <Volume2 className="w-4 h-4 text-[#2C6E63]" />}
                          <span>{isMuted ? 'Suara: Mati' : 'Suara: Aktif'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Tips Klinis Harian */}
                    <div className="v18-card-sm p-4 bg-white flex flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase text-[#B45309]">
                          <Lightbulb className="w-4 h-4" />
                          <span>Tips Klinis Harian · {dailyClinicalTip.formattedDate}</span>
                        </div>
                        <div className="font-display font-bold text-2xl text-[#FF5A5F]">
                          {dailyClinicalTip.monograph.name}
                        </div>
                        <div className="font-mono text-[10px] font-bold uppercase text-[#2C6E63]">
                          Fokus: {dailyClinicalTip.focusLabel}
                        </div>
                        <p className="text-xs sm:text-sm text-[#2D2926]/85 leading-relaxed">
                          {dailyClinicalTip.factText}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setFormularyFocusId(dailyClinicalTip.monograph.id);
                            setActiveOverlay('formulary');
                          }}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#E8EFEA] hover:bg-[#D1E5D9] border-2 border-[#2C6E63] text-xs font-bold text-[#1F4A42] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Buka di Buku Obat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setActiveOverlay(null);
                            setShowTitle(true);
                          }}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF4E4] hover:bg-[#FFD166] border-2 border-[#6E4021] text-xs font-bold text-[#4A2B14] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Home className="w-4 h-4" />
                          <span>Ke Layar Pembuka</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {renderLearningModal()}
    </div>
  );
}
