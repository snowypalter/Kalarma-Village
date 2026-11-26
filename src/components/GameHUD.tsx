import React from 'react';
import {
  Award,
  Backpack,
  BookOpen,
  Clock,
  CloudSun,
  Coins,
  GraduationCap,
  Map as MapIcon,
  ScrollText,
  Settings,
  Sprout,
  Stethoscope,
  Store,
  User,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { AVATARS, WEATHER_INFO } from '../data/characters';
import { AvatarId, WeatherType } from '../types/pharmacy';
import { RpgTabId } from './VillageRpgShell';

export type HudActionPage = RpgTabId | 'home' | 'learn' | 'clinic';

interface GameHUDProps {
  selectedAvatar: AvatarId;
  xp: number;
  coins: number;
  rankTitle: string;
  completedCount: number;
  totalCases: number;
  weather: WeatherType;
  isMuted: boolean;
  claimableDailyCount?: number;
  dailyTipTitle: string;
  dailyTipDrugName: string;
  onNavigate: (page: HudActionPage) => void;
  onCycleWeather: () => void;
  onStepTime: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMute: () => void;
}

const LeafAccentSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 20" fill="none" aria-hidden="true" className={className}>
    <path
      d="M3 15C3 8 9 3 18 4C16 11 11 16 3 15Z"
      fill="#76B947"
      stroke="#2E561D"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M5 14C9 10 12 8 16 5" stroke="#2E561D" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const GameHUD: React.FC<GameHUDProps> = ({
  selectedAvatar,
  xp,
  coins,
  rankTitle,
  completedCount,
  totalCases,
  weather,
  isMuted,
  claimableDailyCount = 0,
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

  // Clean 3-tile Left Rail (Adventure & Exploration)
  const leftItems: {
    page: HudActionPage;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      page: 'quest',
      label: 'Jurnal',
      icon: <ScrollText className="w-5 h-5 text-[#FFE59E]" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      page: 'map',
      label: 'Peta',
      icon: <MapIcon className="w-5 h-5 text-[#A7F3D0]" />,
    },
    {
      page: 'inventory',
      label: 'Tas',
      icon: <Backpack className="w-5 h-5 text-[#FDE68A]" />,
    },
  ];

  // Clean 3-tile Right Rail (Clinic, Encyclopedia, Village Trade)
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
      page: 'herbal',
      label: 'Herbal',
      icon: <Sprout className="w-5 h-5 text-[#86EFAC]" />,
    },
    {
      page: 'shop',
      label: 'Toko',
      icon: <Store className="w-5 h-5 text-[#FFD166]" />,
    },
  ];

  // Bottom Structured 5-Realm RPG Dock (1-2 clicks to all 13 RPG modules)
  const bottomItems: {
    page: HudActionPage;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { page: 'profile', label: 'Karakter', icon: <User className="w-4 h-4 sm:w-5 sm:h-5" /> },
    {
      page: claimableDailyCount > 0 ? 'daily' : 'quest',
      label: 'Misi & Peta',
      icon: <ScrollText className="w-4 h-4 sm:w-5 sm:h-5" />,
      badge: claimableDailyCount > 0 ? claimableDailyCount : undefined,
    },
    { page: 'fishing', label: 'Koleksi', icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { page: 'achievement', label: 'Prestasi', icon: <Award className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { page: 'upgrade', label: 'Desa', icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between pt-safe pb-safe px-safe sm:pt-3.5 sm:pb-3.5 sm:px-3.5 select-none">
      {/* TOP BAR: Player Crest + Core RPG Stats + Compact Utility Strip */}
      <header className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <div className="flex items-center justify-between gap-2 w-full sm:w-auto sm:flex-1 min-w-0">
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="ask-wood-pill relative min-h-[42px] sm:min-h-[46px] pr-3 pl-1 py-0.5 sm:py-1 flex items-center gap-2 cursor-pointer min-w-0 shrink"
              title="Buka Profil Karakter & Wardrobe"
            >
              <LeafAccentSvg className="hidden sm:block absolute -top-1.5 -left-1.5 w-5 h-4 pointer-events-none" />
              <img
                src={avatar.imagePath}
                alt={avatar.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#FFD166] object-cover bg-[#F2EFEB] shrink-0"
              />
              <div className="text-left leading-tight min-w-0">
                <div className="font-display font-bold text-base sm:text-lg text-[#FFF8E6] leading-none truncate">
                  {avatar.name}
                </div>
                <div className="font-sans text-[10px] font-semibold tracking-wide text-[#FFD166] truncate max-w-[100px] sm:max-w-[150px]">
                  {rankTitle}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="hidden lg:inline-flex ask-wood-pill min-h-[40px] px-3.5 py-1.5 text-xs font-display font-bold tracking-wide items-center gap-1.5 cursor-pointer shrink-0"
              title="Pusatkan Kamera ke Alun-Alun Kalarma Village"
            >
              <span className="text-[#FFE39A]">Kalarma Village</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="hidden sm:inline-flex ask-wood-pill min-h-[40px] px-3 py-1.5 text-xs font-mono font-bold tabular-nums items-center gap-1.5 cursor-pointer shrink-0"
              title="Saldo Koin Daun (Buka Toko Desa)"
            >
              <Coins className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>{coins}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('quest')}
              className="hidden md:inline-flex ask-wood-pill min-h-[40px] px-3 py-1.5 text-xs font-mono font-bold tabular-nums items-center gap-1.5 cursor-pointer shrink-0"
              title="Progres Pasien Sembuh"
            >
              <span className="text-[#86EFAC]">♥</span>
              <span>
                {completedCount}/{totalCases}
              </span>
              <span aria-hidden="true" className="text-[#E8BC74]/70">
                ·
              </span>
              <span className="text-[#FFD166]">{xp} XP</span>
            </button>
          </div>

          {/* Right Utility Strip */}
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
              title="Pengaturan Desa & Grafis"
              aria-label="Buka menu pengaturan"
            >
              <Settings className="w-4 h-4 text-[#FFD166]" />
            </button>
          </div>
        </div>

        {/* Mobile Compact Stats Strip */}
        <div className="pointer-events-auto flex sm:hidden items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="ask-wood-pill min-h-[34px] px-2.5 py-0.5 text-xs font-mono font-bold tabular-nums inline-flex items-center gap-1 cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-[#FFD166]" />
            <span>{coins}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('quest')}
            className="ask-wood-pill min-h-[34px] px-2.5 py-0.5 text-xs font-mono font-bold tabular-nums inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="text-[#86EFAC]">♥</span>
            <span>
              {completedCount}/{totalCases}
            </span>
          </button>

          <span className="ask-wood-pill min-h-[34px] px-2.5 py-0.5 text-xs font-mono font-bold tabular-nums inline-flex items-center gap-1">
            <span className="text-[#FFD166]">★</span>
            <span>{xp} XP</span>
          </span>
        </div>
      </header>

      {/* MIDDLE ROW: Uncluttered 3-Tile Wooden Quick Rails */}
      <div className="flex-1 relative min-h-0 flex items-start justify-between pt-2 sm:pt-4">
        <aside className="pointer-events-auto flex flex-col gap-2" aria-label="Navigasi Petualangan">
          {leftItems.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              className="ask-wood-tile relative w-[56px] sm:w-[70px] min-h-[50px] sm:min-h-[60px] px-1 py-1 sm:py-1.5 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer"
            >
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 rounded-full bg-[#FF5A5F] border-2 border-[#FFF8E6] text-[9px] sm:text-[10px] font-mono font-extrabold text-white flex items-center justify-center tabular-nums">
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

        <aside className="pointer-events-auto flex flex-col gap-2" aria-label="Navigasi Desa">
          {rightItems.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              className="ask-wood-tile w-[56px] sm:w-[70px] min-h-[50px] sm:min-h-[60px] px-1 py-1 sm:py-1.5 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer"
            >
              <span className="scale-90 sm:scale-100">{item.icon}</span>
              <span className="font-sans text-[10px] sm:text-[11px] font-bold tracking-tight leading-none text-[#FFF8E6] whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </aside>
      </div>

      {/* BOTTOM DOCK: Compact Daily Clinical Tip + 5 Structured Wooden Menu Buttons */}
      <div className="flex flex-col items-center gap-2">
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
          <span className="font-sans text-[11px] font-bold bg-[#6E4021] text-[#FFF8E6] px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shrink-0">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Mode Belajar</span>
          </span>
        </button>

        <nav
          aria-label="Navigasi Utama Dalam Game"
          className="pointer-events-auto w-full max-w-xl grid grid-cols-5 gap-1 sm:gap-2.5"
        >
          {bottomItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.page)}
              className="ask-wood-tile relative min-h-[48px] sm:min-h-[56px] px-0.5 sm:px-1 py-1 sm:py-1.5 flex flex-col items-center justify-center gap-0.5 sm:gap-1 cursor-pointer"
            >
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#16A34A] border-2 border-[#FFF8E6] text-[9px] font-mono font-extrabold text-white flex items-center justify-center tabular-nums">
                  {item.badge}
                </span>
              )}
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
