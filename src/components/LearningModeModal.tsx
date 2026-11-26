import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Baby,
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  GraduationCap,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { DRUG_FOOD_PRACTICE_CASES } from '../data/cases';
import { CHARACTERS } from '../data/characters';
import { FORMULARY_DATA } from '../data/formulary';
import { EmotionType, ScreeningOption } from '../types/pharmacy';
import { soundFX } from '../utils/sound';
import { CharacterPortrait } from './CharacterPortrait';

interface LearningModeModalProps {
  onClose: () => void;
  onOpenFormulary?: (drugId?: string) => void;
  onOpenQuiz?: () => void;
  onStartPlay?: () => void;
}

type LearnModuleId = 'workflow' | 'drug-food' | 'pediatric' | 'interactions' | 'tips';

interface InteractionTrapCard {
  id: string;
  pair: string;
  severity: string;
  mechanism: string;
  solution: string;
}

const INTERACTION_CARDS: InteractionTrapCard[] = [
  {
    id: 'chelation',
    pair: 'Siprofloksasin + Antasida (Al/Mg) / Susu / Fe',
    severity: 'Interaksi Absorpsi Berat',
    mechanism:
      'Ion logam bermuatan ganda/tiga (Al3+, Mg2+, Ca2+, Fe2+) membentuk kompleks kelat tidak larut di lambung sehingga kadar antibiotik anjlok hingga >75%.',
    solution: 'Beri jeda minum minimal 2 jam sebelum atau 4–6 jam sesudah Antasida atau suplemen mineral.',
  },
  {
    id: 'cyp2c19',
    pair: 'Klopidogrel + Omeprazol',
    severity: 'Interaksi Enzim CYP2C19',
    mechanism:
      'Klopidogrel adalah prodrug yang wajib diaktifkan oleh enzim hati CYP2C19. Omeprazol menghambat CYP2C19 sehingga risiko sumbatan stent jantung meningkat.',
    solution: 'Ganti Omeprazol dengan Pantoprazol yang efek inhibisinya terhadap CYP2C19 jauh lebih minimal.',
  },
  {
    id: 'triple-whammy',
    pair: 'ARB/ACEi + Diuretik + Ibuprofen (NSAID)',
    severity: 'Triple Whammy Ginjal',
    mechanism:
      'Diuretik menurunkan volume cairan, ARB melebarkan arteriol eferen, dan NSAID menyempitkan arteriol aferen ginjal secara bersamaan sehingga memicu gagal ginjal akut.',
    solution: 'Tolak NSAID pada pasien hipertensi berdiuretik dan ganti pereda nyeri yang lebih aman seperti Parasetamol.',
  },
  {
    id: 'stewardship',
    pair: 'Faringitis Viral / GERD + Permintaan Antibiotik',
    severity: 'Jebakan Resistensi',
    mechanism:
      'Infeksi virus dan refluks asam lambung tidak disebabkan bakteri. Pemberian antibiotik memicu resistensi bakteri tanpa menyembuhkan gejala.',
    solution: 'Tolak antibiotik tanpa indikasi; pilih Imunomodulator Meniran, suportif, atau PPI sebelum sarapan.',
  },
];

export const LearningModeModal: React.FC<LearningModeModalProps> = ({
  onClose,
  onOpenFormulary,
  onOpenQuiz,
  onStartPlay,
}) => {
  const [activeModule, setActiveModule] = useState<LearnModuleId>('workflow');
  const [pedWeight, setPedWeight] = useState<number>(18);
  const [pedTargetDose, setPedTargetDose] = useState<number>(45);
  const [pedStrengthMgPer5Ml, setPedStrengthMgPer5Ml] = useState<number>(250);
  const [flippedCardId, setFlippedCardId] = useState<string>(INTERACTION_CARDS[0].id);

  // Self-practice Drug-Food Interaction Lab state
  const [activePracticeIdx, setActivePracticeIdx] = useState(0);
  const [selectedPracticeOptId, setSelectedPracticeOptId] = useState<Record<string, string>>({});
  const [solvedPracticeIds, setSolvedPracticeIds] = useState<string[]>([]);
  const [showPracticeHint, setShowPracticeHint] = useState<Record<string, boolean>>({});

  // Daily rotating clinical tip from FORMULARY_DATA
  const dailyTip = useMemo(() => {
    const now = new Date();
    const dayNumber = Math.floor(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000
    );
    const idx = ((dayNumber % FORMULARY_DATA.length) + FORMULARY_DATA.length) % FORMULARY_DATA.length;
    return FORMULARY_DATA[idx];
  }, []);

  const totalDailyMg = Math.round(pedWeight * pedTargetDose);
  const perDoseMg = Math.round(totalDailyMg / 2);
  const perDoseMl = Number(((perDoseMg / pedStrengthMgPer5Ml) * 5).toFixed(1));
  const kitchenSpoonErrorPct = Math.round(((15 - perDoseMl) / Math.max(0.1, perDoseMl)) * 100);

  const activePractice =
    DRUG_FOOD_PRACTICE_CASES[activePracticeIdx] ?? DRUG_FOOD_PRACTICE_CASES[0];
  const practicePatient = CHARACTERS[activePractice.patientId];
  const currentChosenOptId = selectedPracticeOptId[activePractice.id] ?? null;
  const currentChosenOpt: ScreeningOption | undefined = activePractice.options.find(
    (o) => o.id === currentChosenOptId
  );
  const isPracticeSolved = solvedPracticeIds.includes(activePractice.id);

  const handleSelectPracticeOption = (option: ScreeningOption) => {
    setSelectedPracticeOptId((prev) => ({ ...prev, [activePractice.id]: option.id }));
    if (option.isCorrect) {
      soundFX.playSuccess();
      setSolvedPracticeIds((prev) =>
        prev.includes(activePractice.id) ? prev : [...prev, activePractice.id]
      );
    } else {
      soundFX.playError();
    }
  };

  const tabs: { id: LearnModuleId; label: string; badge?: string; icon: React.ReactNode }[] = [
    { id: 'workflow', label: 'Alur & Kontrol', icon: <Stethoscope className="w-4 h-4" /> },
    {
      id: 'drug-food',
      label: 'Latihan Drug-Food',
      badge: `${solvedPracticeIds.length}/${DRUG_FOOD_PRACTICE_CASES.length}`,
      icon: <UtensilsCrossed className="w-4 h-4" />,
    },
    { id: 'pediatric', label: 'Lab Dosis Anak', icon: <Baby className="w-4 h-4" /> },
    { id: 'interactions', label: 'Detektif Interaksi', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'tips', label: 'Tips & Rumus', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2D2926]/70 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Mode Belajar Akademi Farmasi Kalarma Village"
    >
      <div className="w-full max-w-4xl max-h-[90dvh] bg-[#FAF4E4] border-[3.5px] border-[#6E4021] rounded-2xl shadow-[0_12px_0_#432512,0_20px_38px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden text-[#3E2414]">
        {/* Cozy Wood-Carved Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-b from-[#9B6334] to-[#744522] border-b-[3px] border-[#4A2B14] text-[#FFF8E6] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFD166] border-2 border-[#4A2B14] text-[#4A2B14] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-xl sm:text-2xl leading-none truncate">
                Mode Belajar · Kalarma Village
              </h2>
              <p className="text-[11px] sm:text-xs text-[#FFE8B3] mt-0.5 truncate">
                Pahami alur klinik, hitung dosis pediatrik, dan kenali jebakan interaksi obat sebelum bertugas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="min-h-[42px] min-w-[42px] rounded-xl bg-[#5C3419] hover:bg-[#FF5A5F] border-2 border-[#E6B66B] text-[#FFF8E6] inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            aria-label="Tutup Mode Belajar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Module Switcher */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#EFE1C3] border-b-2 border-[#C8A46D] flex flex-wrap gap-2 shrink-0">
          {tabs.map((tab) => {
            const active = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveModule(tab.id);
                }}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border-2 text-xs font-bold inline-flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#2C6E63] text-white border-[#1A423B] shadow-[0_3px_0_#1A423B]'
                    : 'bg-[#FFFDF7] text-[#4A2B14] border-[#B8894F] hover:bg-[#FFE9B8]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${
                      active ? 'bg-[#FFD166] text-[#2D2926]' : 'bg-[#EFE1C3] text-[#4A2B14]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Inside Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeModule === 'workflow' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    step: '01 · Jelajahi Desa 3D',
                    title: 'Temui Warga Bertanda Seru (!)',
                    desc: 'Gerakkan karakter dengan Analog sentuh, tombol WASD, atau klik langsung warga/tanah di pulau 3D untuk memulai triase.',
                    color: 'bg-[#FFFDF7]',
                  },
                  {
                    step: '02 · Meja Skrining Klinis',
                    title: 'Cek Dosis, Alergi & Interaksi',
                    desc: 'Periksa berat badan (pediatrik mg/kgBB), riwayat obat rutin, dan cuaca desa. Pilih Tobi bila ingin melihat petunjuk kaca pembesar.',
                    color: 'bg-[#FFFDF7]',
                  },
                  {
                    step: '03 · Arena Benteng Terapi',
                    title: 'Pasang Menara & Kalibrasi Infus',
                    desc: 'Pilih menara antibiotik atau Pos Herbal Mbah Sekar sesuai diagnosis. Jangan beri antibiotik pada kasus virus atau GERD!',
                    color: 'bg-[#FFFDF7]',
                  },
                  {
                    step: '04 · Konseling & Medali',
                    title: 'Edukasi Kepulangan & Raih XP',
                    desc: 'Berikan konseling penyimpanan & jeda minum obat. Kumpulkan XP dan buka 4 tingkat Medali Apoteker hingga Apoteker Agung.',
                    color: 'bg-[#FFFDF7]',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`${item.color} p-4 rounded-xl border-2 border-[#C8A46D] shadow-[0_3px_0_#D8BE94] space-y-1.5`}
                  >
                    <div className="font-mono text-[11px] font-bold uppercase text-[#B45309]">
                      {item.step}
                    </div>
                    <h3 className="font-display font-bold text-xl text-[#2D2926] leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A2B14]/85 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#FFE8A3]/60 border-2 border-[#B45309] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <UtensilsCrossed className="w-5 h-5 text-[#9A5016] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[#3E2414] font-medium leading-relaxed">
                    <strong>Latihan Mandiri Baru:</strong> Kuasai 3 skenario klinis <strong>Drug-Food Interaction</strong> (Susu &amp; Kuinolon, Grapefruit &amp; Statin, Teh &amp; Zat Besi) tanpa harus langsung terjun ke misi utama!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setActiveModule('drug-food');
                  }}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#6E4021] hover:bg-[#522E16] text-[#FFF8E6] text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Mulai Latihan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#E8EFEA] border-2 border-[#2C6E63] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#2C6E63] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[#1F4A42] font-medium leading-relaxed">
                    <strong>Tips Kendali:</strong> Semua menu klinik seperti Buku Obat, Kalkulator Farmasi, Quiz Evaluasi, dan Daftar 10 Pasien tersedia langsung lewat ikon HUD kayu di sisi layar tanpa perlu menggulir halaman.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'drug-food' && (
            <div className="space-y-4">
              {/* Self-Practice Scenario Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-mono text-[11px] font-bold uppercase text-[#9A5016]">
                    Latihan Mandiri · Tanpa Memulai Misi Utama
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#2D2926] leading-tight">
                    Simulasi Drug-Food Interaction
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold bg-[#E8EFEA] border-2 border-[#2C6E63] text-[#1F4A42] px-3 py-1 rounded-xl tabular-nums">
                  {solvedPracticeIds.length}/{DRUG_FOOD_PRACTICE_CASES.length} Latihan Tuntas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DRUG_FOOD_PRACTICE_CASES.map((sc, idx) => {
                  const isActive = idx === activePracticeIdx;
                  const solved = solvedPracticeIds.includes(sc.id);
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setActivePracticeIdx(idx);
                      }}
                      className={`text-left p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-[#FFE8A3] border-[#6E4021] shadow-[0_3px_0_#6E4021]'
                          : 'bg-[#FFFDF7] border-[#C8A46D] hover:bg-[#FFF6DA]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] font-bold uppercase text-[#9A5016] truncate">
                          Latihan {idx + 1} · {sc.difficulty}
                        </div>
                        <div className="font-bold text-xs text-[#2D2926] truncate">
                          {sc.drugPair}
                        </div>
                      </div>
                      {solved && <CheckCircle2 className="w-4 h-4 text-[#2C6E63] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Active Scenario Clinical Card */}
              <div className="p-4 rounded-xl bg-[#FFFDF7] border-2 border-[#C8A46D] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CharacterPortrait
                      characterId={activePractice.patientId}
                      emotion={isPracticeSolved ? EmotionType.HAPPY : EmotionType.THINKING}
                      size={56}
                    />
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] font-bold uppercase text-[#B45309]">
                        {activePractice.focusCategory} · {activePractice.subTopic}
                      </div>
                      <h4 className="font-display font-bold text-2xl text-[#2D2926] leading-tight">
                        {activePractice.title}
                      </h4>
                      <div className="text-xs font-medium text-[#684126] mt-0.5">
                        Warga: {practicePatient.name} ({practicePatient.species}) · Makanan:{' '}
                        <strong>{activePractice.foodItem}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setShowPracticeHint((prev) => ({
                        ...prev,
                        [activePractice.id]: !prev[activePractice.id],
                      }));
                    }}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#F7EBD2] hover:bg-[#FFE8A3] border-2 border-[#B8894F] text-xs font-bold text-[#4A2B14] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showPracticeHint[activePractice.id] ? 'Tutup Petunjuk' : 'Petunjuk Tobi'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#F7EBD2]/75 border border-[#C8A46D] space-y-1">
                    <div className="font-mono text-[10px] font-bold uppercase text-[#9A5016]">
                      Situasi Klinis Mandiri
                    </div>
                    <p className="text-[#3E2414] leading-relaxed">{activePractice.vignette}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFF6DA] border border-[#C8A46D] space-y-1">
                    <div className="font-mono text-[10px] font-bold uppercase text-[#9A5016]">
                      Pertanyaan {practicePatient.name}
                    </div>
                    <p className="text-[#3E2414] italic leading-relaxed">
                      “{activePractice.patientQuote}”
                    </p>
                    <div className="pt-1 font-mono text-[10px] font-bold text-[#2C6E63]">
                      Mekanisme: {activePractice.interactionType}
                    </div>
                  </div>
                </div>

                {showPracticeHint[activePractice.id] && (
                  <div className="p-3 rounded-xl bg-[#E8EFEA] border-2 border-[#2C6E63] text-xs text-[#1F4A42] leading-relaxed">
                    {activePractice.tobiHint}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="font-display font-bold text-lg text-[#2D2926]">
                    {activePractice.question}
                  </div>
                  <div className="space-y-2">
                    {activePractice.options.map((opt) => {
                      const picked = currentChosenOptId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectPracticeOption(opt)}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            picked
                              ? opt.isCorrect
                                ? 'bg-[#E8EFEA] border-[#2C6E63] shadow-[0_3px_0_#2C6E63]'
                                : 'bg-[#FFF1F2] border-[#DC2626] shadow-[0_3px_0_#DC2626]'
                              : 'bg-white border-[#C8A46D] hover:bg-[#FFF6DA]'
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm text-[#2D2926] leading-snug">
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-[#4A2B14]/75 mt-1">{opt.detail}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Immediate Mentor Feedback */}
                {currentChosenOpt && (
                  <div
                    className={`p-3.5 rounded-xl border-2 space-y-2.5 ${
                      currentChosenOpt.isCorrect
                        ? 'bg-[#E8EFEA] border-[#2C6E63]'
                        : 'bg-[#FFF1F2] border-[#DC2626]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CharacterPortrait
                        characterId={currentChosenOpt.feedbackSpeaker}
                        emotion={currentChosenOpt.feedbackEmotion}
                        size={48}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[10px] font-bold uppercase text-[#2D2926]/75">
                          Evaluasi {CHARACTERS[currentChosenOpt.feedbackSpeaker].name}
                        </div>
                        <p className="text-xs sm:text-sm text-[#2D2926] leading-relaxed mt-0.5">
                          {currentChosenOpt.feedbackText}
                        </p>
                      </div>
                    </div>

                    {currentChosenOpt.isCorrect && (
                      <div className="pt-2.5 border-t border-[#2C6E63]/25 space-y-2">
                        <div className="flex items-start gap-2 text-xs text-[#1F4A42]">
                          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            <strong>Aturan Waktu Makan:</strong> {activePractice.mealTimingRule}
                          </span>
                        </div>
                        <p className="text-xs text-[#1F4A42]/90 leading-relaxed">
                          <strong>Intisari Klinis:</strong> {activePractice.clinicalPearl}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          {activePractice.relatedFormularyId && onOpenFormulary ? (
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                onOpenFormulary(activePractice.relatedFormularyId);
                              }}
                              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFD166] border-2 border-[#4A2B14] text-xs font-bold text-[#2D2926] inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Lihat Monografi Obat</span>
                            </button>
                          ) : (
                            <span />
                          )}

                          {activePracticeIdx < DRUG_FOOD_PRACTICE_CASES.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setActivePracticeIdx((i) => i + 1);
                              }}
                              className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[#2C6E63] hover:bg-[#23594F] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Latihan Berikutnya</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeModule === 'pediatric' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FFFDF7] border-2 border-[#C8A46D] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                      Simulasi Hitung Dosis Pediatrik (mg/kgBB)
                    </h3>
                    <p className="text-xs text-[#684126]/80">
                      Geser berat badan anak dan dosis target untuk melihat volume akurat spuit oral vs risiko sendok rumah tangga.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold bg-[#FFD166] border-2 border-[#4A2B14] px-2.5 py-1 rounded-lg tabular-nums">
                    BB {pedWeight} kg · {pedTargetDose} mg/kg/hari
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <label className="block p-3 rounded-xl bg-[#F7EBD2] border border-[#C8A46D] space-y-1.5">
                    <span className="font-bold block">Berat Badan Anak: {pedWeight} kg</span>
                    <input
                      type="range"
                      min={8}
                      max={32}
                      step={1}
                      value={pedWeight}
                      onChange={(e) => setPedWeight(Number(e.target.value))}
                      className="w-full accent-[#2C6E63]"
                    />
                  </label>

                  <label className="block p-3 rounded-xl bg-[#F7EBD2] border border-[#C8A46D] space-y-1.5">
                    <span className="font-bold block">Target Dosis: {pedTargetDose} mg/kg/hari</span>
                    <input
                      type="range"
                      min={20}
                      max={90}
                      step={5}
                      value={pedTargetDose}
                      onChange={(e) => setPedTargetDose(Number(e.target.value))}
                      className="w-full accent-[#2C6E63]"
                    />
                  </label>

                  <div className="p-3 rounded-xl bg-[#F7EBD2] border border-[#C8A46D] space-y-1.5">
                    <span className="font-bold block">Kekuatan Sirup (per 5 mL)</span>
                    <div className="flex gap-2">
                      {[125, 250].map((str) => (
                        <button
                          key={str}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setPedStrengthMgPer5Ml(str);
                          }}
                          className={`flex-1 min-h-[36px] rounded-lg border-2 font-mono font-bold cursor-pointer ${
                            pedStrengthMgPer5Ml === str
                              ? 'bg-[#2C6E63] text-white border-[#1A423B]'
                              : 'bg-white text-[#4A2B14] border-[#B8894F]'
                          }`}
                        >
                          {str} mg
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#E8EFEA] border-2 border-[#2C6E63] space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#2C6E63]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>TAKARAN SPUIT ORAL AKURAT (TIAP 12 JAM)</span>
                    </div>
                    <div className="font-display font-bold text-3xl text-[#1F4A42] tabular-nums">
                      {perDoseMl} mL ({perDoseMg} mg)
                    </div>
                    <p className="text-xs text-[#1F4A42]/85">
                      Total {totalDailyMg} mg/hari dibagi 2 kali pemberian menggunakan spuit/gelas takar mL.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FFF1F2] border-2 border-[#DC2626] space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#B91C1C]">
                      <AlertTriangle className="w-4 h-4" />
                      <span>JIKA MEMAKAI SENDOK MAKAN DAPUR (15 mL)</span>
                    </div>
                    <div className="font-display font-bold text-3xl text-[#B91C1C] tabular-nums">
                      {kitchenSpoonErrorPct > 0 ? `+${kitchenSpoonErrorPct}%` : `${kitchenSpoonErrorPct}%`} Selisih Volume
                    </div>
                    <p className="text-xs text-[#7F1D1D]">
                      Sendok dapur tidak terstandar (5–15 mL) dan berisiko besar memicu overdosis atau resistensi pada anak!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'interactions' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-[#4A2B14]/85 font-medium">
                Klik setiap pasangan obat untuk mempelajari mekanisme interaksi klinis dan solusi penggantian rasionalnya:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INTERACTION_CARDS.map((card) => {
                  const selected = flippedCardId === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setFlippedCardId(card.id);
                      }}
                      className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2 ${
                        selected
                          ? 'bg-[#FFFDF7] border-[#2C6E63] shadow-[0_4px_0_#2C6E63]'
                          : 'bg-[#F7EBD2] border-[#C8A46D] hover:bg-[#FFFDF7]'
                      }`}
                    >
                      <div className="font-mono text-[10px] font-bold uppercase text-[#B91C1C]">
                        {card.severity}
                      </div>
                      <div className="font-display font-bold text-xl text-[#2D2926] leading-tight">
                        {card.pair}
                      </div>
                      <p className="text-xs text-[#4A2B14]/85 leading-relaxed">{card.mechanism}</p>
                      <div className="p-2.5 rounded-lg bg-[#E8EFEA] border border-[#2C6E63]/50 text-xs font-bold text-[#1F4A42]">
                        Solusi: {card.solution}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeModule === 'tips' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FFFDF7] border-2 border-[#C8A46D] space-y-2">
                <div className="font-mono text-[11px] font-bold uppercase text-[#B45309]">
                  Tips Klinis Harian · Pustaka Formularium
                </div>
                <h3 className="font-display font-bold text-2xl text-[#FF5A5F]">
                  {dailyTip.name} ({dailyTip.category})
                </h3>
                <p className="text-xs sm:text-sm text-[#4A2B14] leading-relaxed">
                  <strong>Interaksi Utama:</strong> {dailyTip.interactions}
                </p>
                <p className="text-xs sm:text-sm text-[#4A2B14]/85 leading-relaxed">
                  <strong>Penyimpanan:</strong> {dailyTip.storageNote}
                </p>
                {onOpenFormulary && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      onOpenFormulary(dailyTip.id);
                    }}
                    className="mt-1 min-h-[40px] px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#FFC43D] border-2 border-[#4A2B14] text-xs font-bold text-[#2D2926] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Buka di Buku Obat</span>
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#F7EBD2] border-2 border-[#C8A46D] space-y-2">
                <div className="flex items-center gap-2 font-display font-bold text-xl text-[#2D2926]">
                  <Calculator className="w-5 h-5 text-[#2C6E63]" />
                  <span>Rumus Cepat Laju Infus (TPM)</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold bg-[#FFFDF7] p-3 rounded-lg border border-[#C8A46D] tabular-nums">
                  TPM = (Volume Cairan mL × Faktor Tetes) ÷ (Durasi Jam × 60)
                </div>
                <p className="text-xs text-[#4A2B14]/85 leading-relaxed">
                  Faktor tetes <strong>Makro = 20 tetes/mL</strong> (dewasa umum, seperti infus Vankomisin Riko ~42 TPM), sedangkan <strong>Mikro = 60 tetes/mL</strong> untuk kebutuhan tetes halus atau pediatrik.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Modal Action Footer */}
        <div className="px-4 sm:px-6 py-3 bg-[#EFE1C3] border-t-2 border-[#C8A46D] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap gap-2">
            {onOpenQuiz && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onOpenQuiz();
                }}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-[#FFE9B8] border-2 border-[#6E4021] text-xs font-bold text-[#4A2B14] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Uji Pemahaman (Quiz)</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playSuccess();
              if (onStartPlay) onStartPlay();
              else onClose();
            }}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] border-2 border-[#16302B] shadow-[0_3px_0_#16302B] text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{onStartPlay ? 'Masuk ke Klinik 3D' : 'Selesai Belajar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
