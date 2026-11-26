import React from 'react';
import {
  Award,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Clock,
  CloudSun,
  Compass,
  GraduationCap,
  Home,
  ScrollText,
  Settings,
  Stethoscope,
  Users,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { AVATARS, WEATHER_INFO } from '../data/characters';
import { AvatarId, WeatherType } from '../types/pharmacy';

export type HudActionPage =
  | 'home'
  | 'quest'
  | 'learn'
  | 'medals'
  | 'clinic'
  | 'formulary'
  | 'calculator'
  | 'quiz'
  | 'character'
  | 'settings';

interface GameHUDProps {
  selectedAvatar: AvatarId;
  xp: number;
  rankTitle: string;
  completedCount: number;
  totalCases: number;
  unlockedMedalsCount: number;
  totalMedalsCount: number;
  weather: WeatherType;
  isMuted: boolean;
  dailyTipTitle: string;
  dailyTipDrugName: string;
  onNavigate: (page: HudActionPage) => void;
  onCycleWeather: () => void;
  onStepTime: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  selectedAvatar,
  xp,
  rankTitle,
  completedCount,
  totalCases,
  unlockedMedalsCount,
  totalMedalsCount,
  weather,
  isMuted,
  dailyTipTitle,
  dailyTipDrugName,
  onNavigate,
  onCycleWeather,
  onStepTime,
  onZoomIn,
  onZoomOut,
  onToggleMute,
}) => {
  const avatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];
  const pendingCount = Math.max(0, totalCases - completedCount);

  const leftItems: {
    page: HudActionPage;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      page: 'quest',
      label: 'Pasien',
      icon: <ScrollText className="w-5 h-5 text-[#FFE59E]" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      page: 'learn',
      label: 'Belajar',
      icon: <GraduationCap className="w-5 h-5 text-[#A7F3D0]" />,
    },
    {
      page: 'medals',
      label: 'Medali',
      icon: <Award className="w-5 h-5 text-[#FFD166]" />,
    },
  ];

  const rightItems: {
    page: HudActionPage;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      page: 'clinic',
      label: 'Klinik',
      icon: <Stethoscope className="w-5 h-5 text-[#FCA5A5]" />,
    },
    {
      page: 'formulary',
      label: 'Buku Obat',
      icon: <BookOpen className="w-5 h-5 text-[#FDE68A]" />,
    },
    {
      page: 'calculator',
      label: 'Kalkulator',
      icon: <Calculator className="w-5 h-5 text-[#BAE6FD]" />,
    },
    {
      page: 'quiz',
      label: 'Quiz',
      icon: <ClipboardCheck className="w-5 h-5 text-[#C4B5FD]" />,
    },
  ];

  const bottomItems: {
    page: HudActionPage;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { page: 'home', label: 'Beranda', icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { page: 'character', label: 'Karakter', icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { page: 'quest', label: 'Peta Kasus', icon: <Compass className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { page: 'learn', label: 'Belajar', icon: <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { page: 'settings', label: 'Menu', icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between pt-safe pb-safe px-safe sm:pt-3.5 sm:pb-3.5 sm:px-3.5 select-none">
      {/* TOP BAR: Responsive Two-Row Mobile Stack (<sm) -> Single-Row Desktop/Tablet (sm+) */}
      <header className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        {/* Top Row: Avatar Crest + (Desktop inline stats) + Quick Utility Controls */}
        <div className="flex items-center justify-between gap-2 w-full sm:w-auto sm:flex-1 min-w-0">
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('character')}
              className="ask-wood-pill min-h-[40px] sm:min-h-[44px] pr-2.5 pl-1 py-0.5 sm:py-1 flex items-center gap-1.5 sm:gap-2 cursor-pointer min-w-0 shrink"
              title="Ganti Avatar & Lihat Profil Tokoh"
            >
              <img
                src={avatar.imagePath}
                alt={avatar.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-[#FFD166] object-cover bg-[#F2EFEB] shrink-0"
              />
              <div className="text-left leading-tight min-w-0">
                <div className="font-display font-bold text-base sm:text-lg text-[#FFF8E6] leading-none truncate">
                  {avatar.name}
                </div>
                <div className="font-sans text-[10px] font-semibold tracking-wide text-[#FFD166] truncate max-w-[96px] sm:max-w-[140px]">
                  {rankTitle}
                </div>
              </div>
            </button>

            {/* Desktop/Tablet Inline Stat Pills */}
            <button
              type="button"
              onClick={() => onNavigate('quest')}
              className="hidden sm:inline-flex ask-wood-pill min-h-[40px] px-3 py-1.5 text-xs font-sans font-bold tabular-nums items-center gap-1.5 cursor-pointer shrink-0"
              title="Progres Pasien Sembuh"
            >
              <span className="text-[#86EFAC]">♥</span>
              <span>
                {completedCount}/{totalCases}
              </span>
            </button>

            <div className="hidden sm:inline-flex ask-wood-pill min-h-[40px] px-3 py-1.5 text-xs font-sans font-bold tabular-nums items-center gap-1 shrink-0">
              <span className="text-[#FFD166]">★</span>
              <span>{xp} XP</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('medals')}
              className="hidden md:inline-flex ask-wood-pill min-h-[40px] px-3 py-1.5 text-xs font-sans font-bold tabular-nums items-center gap-1.5 cursor-pointer shrink-0"
              title="Lihat Medali Apoteker"
            >
              <Award className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>
                {unlockedMedalsCount}/{totalMedalsCount}
              </span>
            </button>
          </div>

          {/* Right Utility Controls (Compact 36px on mobile so it never overlaps Avatar Crest) */}
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onCycleWeather}
              className="ask-wood-pill min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:px-3 p-1.5 text-[11px] sm:text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              title={`Cuaca: ${WEATHER_INFO[weather].label} (Ketuk untuk ubah)`}
              aria-label="Ubah cuaca desa"
            >
              <CloudSun className="w-4 h-4 text-[#FFD166]" />
              <span className="hidden lg:inline">{WEATHER_INFO[weather].label.split(' ')[0]}</span>
            </button>

            <button
              type="button"
              onClick={onStepTime}
              className="ask-wood-pill min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] p-1.5 sm:p-2 inline-flex items-center justify-center cursor-pointer"
              title="Lanjutkan waktu (Pagi / Siang / Senja / Malam)"
              aria-label="Ubah waktu desa"
            >
              <Clock className="w-4 h-4 text-[#FDE68A]" />
            </button>

            <button
              type="button"
              onClick={onZoomIn}
              className="hidden sm:inline-flex ask-wood-pill min-h-[40px] min-w-[40px] p-2 items-center justify-center cursor-pointer"
              title="Perbesar kamera 3D"
              aria-label="Perbesar kamera"
            >
              <ZoomIn className="w-4 h-4 text-[#FFF8E6]" />
            </button>

            <button
              type="button"
              onClick={onZoomOut}
              className="hidden sm:inline-flex ask-wood-pill min-h-[40px] min-w-[40px] p-2 items-center justify-center cursor-pointer"
              title="Perkecil kamera 3D"
              aria-label="Perkecil kamera"
            >
              <ZoomOut className="w-4 h-4 text-[#FFF8E6]" />
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className="ask-wood-pill min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] p-1.5 sm:p-2 inline-flex items-center justify-center cursor-pointer"
              title={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
              aria-label={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#FCA5A5]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#86EFAC]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="ask-wood-pill min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] p-1.5 sm:p-2 inline-flex items-center justify-center cursor-pointer"
              title="Menu & Pengaturan"
              aria-label="Buka menu pengaturan"
            >
              <Settings className="w-4 h-4 text-[#FFD166]" />
            </button>
          </div>
        </div>

        {/* Mobile-Only Second Tier Stats Strip (Guarantees Zero Overlap on 320px–430px iOS/Android) */}
        <div className="pointer-events-auto flex sm:hidden items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('quest')}
            className="ask-wood-pill min-h-[36px] px-2.5 py-1 text-xs font-sans font-bold tabular-nums inline-flex items-center gap-1 cursor-pointer"
            title="Progres Pasien Sembuh"
          >
            <span className="text-[#86EFAC]">♥</span>
            <span>
              {completedCount}/{totalCases}
            </span>
          </button>

          <div className="ask-wood-pill min-h-[36px] px-2.5 py-1 text-xs font-sans font-bold tabular-nums inline-flex items-center gap-1">
            <span className="text-[#FFD166]">★</span>
            <span>{xp} XP</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('medals')}
            className="ask-wood-pill min-h-[36px] px-2.5 py-1 text-xs font-sans font-bold tabular-nums inline-flex items-center gap-1 cursor-pointer"
            title="Lihat Medali Apoteker"
          >
            <Award className="w-3.5 h-3.5 text-[#FFD166]" />
            <span>
              {unlockedMedalsCount}/{totalMedalsCount}
            </span>
          </button>
        </div>
      </header>

      {/* MIDDLE ROW: Left & Right Floating Cozy Action Rails */}
      <div className="flex-1 relative min-h-0 flex items-start justify-between pt-2 sm:pt-4">
        {/* Left Action Rail */}
        <aside className="pointer-events-auto flex flex-col gap-1.5 sm:gap-2" aria-label="Menu Cepat Kiri">
          {leftItems.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              className="ask-wood-tile relative w-[54px] sm:w-[70px] min-h-[48px] sm:min-h-[60px] px-1 py-1 sm:py-1.5 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer"
            >
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 rounded-full bg-[#FF5A5F] border-2 border-[#FFF8E6] text-[9px] sm:text-[10px] font-sans font-extrabold text-white flex items-center justify-center tabular-nums">
                  {item.badge}
                </span>
              )}
              <span className="scale-90 sm:scale-100">{item.icon}</span>
              <span className="font-sans text-[10px] sm:text-[11px] font-bold tracking-tight leading-none text-[#FFF8E6] whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </aside>

        {/* Right Action Rail */}
        <aside className="pointer-events-auto flex flex-col gap-1.5 sm:gap-2" aria-label="Menu Cepat Kanan">
          {rightItems.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              className="ask-wood-tile w-[54px] sm:w-[70px] min-h-[48px] sm:min-h-[60px] px-1 py-1 sm:py-1.5 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer"
            >
              <span className="scale-90 sm:scale-100">{item.icon}</span>
              <span className="font-sans text-[10px] sm:text-[11px] font-bold tracking-tight leading-none text-[#FFF8E6] whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </aside>
      </div>

      {/* BOTTOM SECTION: Compact Daily Tip Banner (md+) + Cozy 5-Button Navigation Dock */}
      <div className="flex flex-col items-center gap-2">
        {/* Parchment Mission / Daily Clinical Tip Pill (Desktop & Tablet so it never covers mobile joystick) */}
        <button
          type="button"
          onClick={() => onNavigate('learn')}
          className="hidden md:flex pointer-events-auto max-w-md w-full px-4 py-2 rounded-xl bg-[#F6DFAE]/95 hover:bg-[#FFF0C9] border-[2.5px] border-[#8B572A] shadow-[0_4px_0_#59351F] items-center justify-between gap-3 text-[#4A2B14] transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="text-left min-w-0 flex-1">
            <div className="font-sans text-[10px] font-extrabold uppercase tracking-wider text-[#9A5016] truncate">
              {dailyTipTitle}
            </div>
            <div className="font-display font-bold text-lg text-[#2D2926] leading-tight truncate">
              {dailyTipDrugName}
            </div>
          </div>
          <span className="font-sans text-[11px] font-bold bg-[#6E4021] text-[#FFF8E6] px-3 py-1.5 rounded-lg shrink-0">
            Mode Belajar →
          </span>
        </button>

        {/* Bottom Cozy Wooden Dock (5 main navigation actions) */}
        <nav
          aria-label="Navigasi Utama Dalam Game"
          className="pointer-events-auto w-full max-w-xl grid grid-cols-5 gap-1 sm:gap-2.5"
        >
          {bottomItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.page)}
              className="ask-wood-tile min-h-[48px] sm:min-h-[56px] px-0.5 sm:px-1 py-1 sm:py-1.5 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer"
            >
              <span className="text-[#FFD166]">{item.icon}</span>
              <span className="font-sans text-[10px] sm:text-xs font-bold tracking-tight leading-none text-[#FFF8E6] truncate max-w-full">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
