import React, { useState } from 'react';
import {
  Music,
  PawPrint,
  Play,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { VILLAGE_BACKGROUND as MASTER_VILLAGE_BACKGROUND } from '../data/characters';
import { AvatarProfile, WeatherType } from '../types/pharmacy';
import { villageAmbientAudio } from '../utils/ambientAudio';
import { soundFX } from '../utils/sound';

const VILLAGE_BACKGROUND = MASTER_VILLAGE_BACKGROUND;

export interface KalarmaVillageOpeningProps {
  activeAvatar: AvatarProfile;
  hasSavedProgress: boolean;
  savedXp: number;
  savedCasesCount: number;
  totalCasesCount: number;
  weather: WeatherType;
  isMuted: boolean;
  onStart: () => void;
  onContinue: () => void;
  onOpenAvatar: () => void;
  onSettings: () => void;
  onToggleMute: () => void;
}

const LeafCornerSvg: React.FC<{ className?: string; flip?: boolean }> = ({
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

export const KalarmaVillageOpening: React.FC<KalarmaVillageOpeningProps> = ({
  activeAvatar,
  hasSavedProgress,
  savedXp,
  savedCasesCount,
  totalCasesCount,
  weather,
  isMuted,
  onStart,
  onContinue,
  onOpenAvatar,
  onSettings,
  onToggleMute,
}) => {
  const [ambientMuted, setAmbientMuted] = useState(() => villageAmbientAudio.isLocalMuted());
  const [noSaveHint, setNoSaveHint] = useState(false);

  const handleToggleAmbient = () => {
    soundFX.playClick();
    const next = !ambientMuted;
    setAmbientMuted(next);
    villageAmbientAudio.setLocalMuted(next);
    if (!next) {
      villageAmbientAudio.start(weather);
    }
  };

  const handleContinueClick = () => {
    if (hasSavedProgress) {
      soundFX.playSuccess();
      onContinue();
    } else {
      soundFX.playClick();
      setNoSaveHint(true);
      window.setTimeout(() => setNoSaveHint(false), 3000);
    }
  };

  return (
    <main className="relative isolate w-full h-[100dvh] overflow-hidden bg-[#528E4E] text-[#FFF9E9] select-none pt-safe pb-safe">
      {/* Single Master Background Image across Mobile, Tablet, and Desktop with Breakpoint Focal Points */}
      <img
        src={VILLAGE_BACKGROUND}
        alt="Pemandangan Kalarma Village bersama lima sahabat hewan chibi dan klinik herbal"
        className="absolute inset-0 -z-20 w-full h-full object-cover object-[35%_58%] sm:object-[42%_54%] lg:object-center"
      />

      {/* Atmospheric Edge Vignettes (Top & Bottom UI Legibility Scrims, Zero Obstruction to Center Scene) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(18,44,30,0.28)_0%,transparent_28%,transparent_58%,rgba(14,34,22,0.72)_100%)] sm:bg-[linear-gradient(180deg,rgba(20,48,34,0.18)_0%,transparent_38%,transparent_65%,rgba(16,38,24,0.34)_100%)]"
      />

      {/* TOP-RIGHT: Circular Wooden Music & Sound Controls */}
      <div className="absolute top-3.5 right-3.5 sm:top-6 sm:right-7 z-20 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleToggleAmbient}
          aria-label={ambientMuted ? 'Nyalakan musik alam desa' : 'Matikan musik alam desa'}
          title={ambientMuted ? 'Musik Alam: Mati' : 'Musik Alam: Aktif'}
          className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full border-[3px] border-[#4A2610] bg-gradient-to-b from-[#CA8446] via-[#A9652D] to-[#7D441B] shadow-[0_5px_0_#43210C,0_10px_18px_rgba(0,0,0,0.28),inset_0_2px_0_rgba(255,236,188,0.55)] flex items-center justify-center cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          <LeafCornerSvg className="w-4 h-3.5 sm:w-5 sm:h-4 absolute -bottom-1 -left-1.5" />
          <Music
            className={`w-4 h-4 sm:w-6 sm:h-6 ${
              ambientMuted ? 'text-[#FCA5A5]' : 'text-[#FFF4D2]'
            }`}
          />
          {ambientMuted && (
            <span className="absolute w-6 sm:w-7 h-0.5 bg-[#FF5A5F] rotate-45 rounded-full shadow" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Nyalakan efek suara' : 'Matikan efek suara'}
          title={isMuted ? 'Suara: Mati' : 'Suara: Aktif'}
          className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full border-[3px] border-[#4A2610] bg-gradient-to-b from-[#CA8446] via-[#A9652D] to-[#7D441B] shadow-[0_5px_0_#43210C,0_10px_18px_rgba(0,0,0,0.28),inset_0_2px_0_rgba(255,236,188,0.55)] flex items-center justify-center cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          <LeafCornerSvg className="w-4 h-3.5 sm:w-5 sm:h-4 absolute -bottom-1 -right-1.5" flip />
          {isMuted ? (
            <VolumeX className="w-4 h-4 sm:w-6 sm:h-6 text-[#FCA5A5]" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-6 sm:h-6 text-[#FFF4D2]" />
          )}
        </button>
      </div>

      {/* TOP-LEFT: Single Wooden & Leaf Logo Plaque */}
      <header className="relative z-10 pt-3.5 sm:pt-7 pl-4 sm:pl-10 lg:pl-14 pr-28 sm:pr-44 max-w-[660px] animate-fade-rise">
        <div className="relative inline-flex flex-col items-center">
          {/* Decorative Leaf Clusters */}
          <LeafCornerSvg className="w-8 h-6 sm:w-12 sm:h-9 absolute -top-2.5 -left-3 sm:-top-3 sm:-left-4 z-20" />
          <LeafCornerSvg
            className="w-8 h-6 sm:w-12 sm:h-9 absolute -top-2.5 -right-3 sm:-top-3 sm:-right-4 z-20"
            flip
          />
          <LeafCornerSvg className="w-7 h-5 sm:w-11 sm:h-8 absolute -bottom-1.5 -left-2.5 sm:-bottom-2 sm:-left-3 z-20" />
          <LeafCornerSvg
            className="w-7 h-5 sm:w-11 sm:h-8 absolute -bottom-1.5 -right-2.5 sm:-bottom-2 sm:-right-3 z-20"
            flip
          />

          {/* Main Wooden Logo Plaque */}
          <div className="relative px-5 sm:px-10 py-2.5 sm:py-4 rounded-[22px] sm:rounded-[26px] border-[3.5px] sm:border-[4px] border-[#4D2911] bg-gradient-to-b from-[#BA773C] via-[#9C5C28] to-[#7B4318] shadow-[0_6px_0_#43210C,0_14px_28px_rgba(20,38,24,0.38),inset_0_3px_0_rgba(255,232,175,0.45)] text-center">
            <h1 className="font-display font-extrabold text-[clamp(28px,6vw,64px)] leading-[0.92] tracking-[-0.02em] text-[#FFF7DA] drop-shadow-[0_3px_0_#4D2911]">
              Kalarma
              <span className="inline-block ml-2 sm:block sm:ml-0 text-[#FFE89E]">Village</span>
            </h1>

            <span
              aria-hidden="true"
              className="hidden sm:inline-flex w-8 h-8 rounded-full bg-[#FFE28A] border-2 border-[#593012] items-center justify-center text-[#8B4C1D] shadow-sm absolute bottom-3 left-6"
            >
              <PawPrint className="w-4 h-4 fill-current" />
            </span>
          </div>

          {/* Tagline Wooden Ribbon */}
          <div className="-mt-2 relative z-10 px-4 sm:px-7 py-1 sm:py-1.5 rounded-full border-[2.5px] sm:border-[3px] border-[#4D2911] bg-gradient-to-b from-[#D59150] to-[#AD6A30] shadow-[0_4px_0_#43210C,inset_0_2px_0_rgba(255,241,204,0.5)] inline-flex items-center gap-1.5 sm:gap-2">
            <PawPrint className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFF4D2]/90" />
            <span className="font-display font-bold text-[11px] sm:text-base tracking-wide text-[#FFF9E6] drop-shadow-[0_1px_1px_rgba(67,33,12,0.8)] whitespace-nowrap">
              A Cozy Fantasy Adventure
            </span>
            <PawPrint className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFF4D2]/90" />
          </div>
        </div>
      </header>

      {/* BOTTOM-LEFT: Gentle Cozy Tagline (Desktop & Tablet) */}
      <div className="hidden sm:block absolute left-6 lg:left-10 bottom-4 z-10 pointer-events-none">
        <p className="font-display font-bold text-sm lg:text-base text-[#FFFBE8] drop-shadow-[0_2px_6px_rgba(18,38,22,0.9)]">
          Jelajahi, Belajar, dan Bersantai di Kalarma Village!
        </p>
      </div>

      {/* MENU UTAMA: Compact Bottom Dock on Portrait Mobile -> Right-Hand Stack on Tablet/Desktop */}
      <nav
        aria-label="Menu Utama Kalarma Village"
        className="absolute inset-x-3 bottom-3.5 sm:inset-x-auto sm:right-7 lg:right-12 sm:bottom-8 z-20 sm:w-[300px] lg:w-[325px] grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-2.5 animate-fade-rise"
      >
        {noSaveHint && (
          <div
            role="status"
            className="col-span-2 sm:col-span-1 px-3.5 py-2 rounded-xl bg-[#2A160B]/92 border-2 border-[#FFE39A] text-[#FFF8E6] font-sans text-xs font-semibold text-center shadow-lg"
          >
            Belum ada data tersimpan. Klik Mulai Petualangan!
          </div>
        )}

        {/* 1. Mulai Petualangan */}
        <button
          type="button"
          onClick={() => {
            soundFX.playSuccess();
            onStart();
          }}
          className="col-span-2 sm:col-span-1 group relative min-h-[50px] sm:min-h-[58px] px-4 sm:px-5 py-2 sm:py-2.5 rounded-[16px] sm:rounded-[18px] border-[3px] border-[#5E3313] bg-gradient-to-b from-[#FFE586] via-[#F7C24C] to-[#E3982B] shadow-[0_5px_0_#7D4518,0_12px_22px_rgba(18,36,22,0.38),inset_0_2px_0_#FFF8D2] text-[#4B270E] font-display font-extrabold text-base sm:text-xl tracking-wide flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer transition-transform hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5"
        >
          <LeafCornerSvg className="w-6 h-4 sm:w-7 sm:h-5 absolute -top-2 -left-2" />
          <LeafCornerSvg className="w-6 h-4 sm:w-7 sm:h-5 absolute -bottom-2 -right-2" flip />
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFF7D6]/90 border-2 border-[#7D4518] flex items-center justify-center shrink-0">
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#9B541D] text-[#9B541D] ml-0.5" />
          </span>
          <span>Mulai Petualangan</span>
        </button>

        {/* 2. Lanjutkan Permainan */}
        <button
          type="button"
          onClick={handleContinueClick}
          className={`col-span-2 sm:col-span-1 relative min-h-[44px] sm:min-h-[52px] px-4 sm:px-5 py-1.5 sm:py-2 rounded-[14px] sm:rounded-[16px] border-[3px] border-[#4A2610] bg-gradient-to-b from-[#BD793F] via-[#9C5C28] to-[#7B4318] shadow-[0_4px_0_#43210C,0_10px_18px_rgba(18,36,22,0.32),inset_0_2px_0_rgba(255,232,175,0.42)] text-[#FFF9E6] font-display font-bold text-sm sm:text-lg tracking-wide flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer transition-transform hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 ${
            !hasSavedProgress ? 'opacity-90' : ''
          }`}
        >
          <LeafCornerSvg className="w-5 h-3.5 sm:w-6 sm:h-4 absolute -top-1.5 -right-2" flip />
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE39A] shrink-0" />
          <span>Lanjutkan Permainan</span>
          {hasSavedProgress && (
            <span className="ml-auto font-mono text-[10px] font-bold bg-[#3E210F]/75 border border-[#FFE39A]/50 text-[#FFE39A] px-2 py-0.5 rounded-full tabular-nums">
              {savedCasesCount}/{totalCasesCount} · {savedXp}XP
            </span>
          )}
        </button>

        {/* 3. Pilih Karakter */}
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onOpenAvatar();
          }}
          className="col-span-1 relative min-h-[44px] sm:min-h-[52px] px-3 sm:px-5 py-1.5 sm:py-2 rounded-[14px] sm:rounded-[16px] border-[3px] border-[#4A2610] bg-gradient-to-b from-[#BD793F] via-[#9C5C28] to-[#7B4318] shadow-[0_4px_0_#43210C,0_10px_18px_rgba(18,36,22,0.32),inset_0_2px_0_rgba(255,232,175,0.42)] text-[#FFF9E6] font-display font-bold text-sm sm:text-lg tracking-wide flex items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer transition-transform hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5"
        >
          <LeafCornerSvg className="w-5 h-3.5 sm:w-6 sm:h-4 absolute -bottom-1.5 -left-2" />
          <img
            src={activeAvatar.imagePath}
            alt={activeAvatar.name}
            referrerPolicy="no-referrer"
            className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-[#FFE39A] object-cover bg-[#F2EFEB] shrink-0"
          />
          <span className="truncate">Pilih Karakter</span>
          <span className="hidden sm:inline-block ml-auto font-mono text-[10px] font-bold bg-[#3E210F]/70 text-[#FFE39A] px-2 py-0.5 rounded-full">
            {activeAvatar.name}
          </span>
        </button>

        {/* 4. Pengaturan */}
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onSettings();
          }}
          className="col-span-1 relative min-h-[44px] sm:min-h-[52px] px-3 sm:px-5 py-1.5 sm:py-2 rounded-[14px] sm:rounded-[16px] border-[3px] border-[#4A2610] bg-gradient-to-b from-[#BD793F] via-[#9C5C28] to-[#7B4318] shadow-[0_4px_0_#43210C,0_10px_18px_rgba(18,36,22,0.32),inset_0_2px_0_rgba(255,232,175,0.42)] text-[#FFF9E6] font-display font-bold text-sm sm:text-lg tracking-wide flex items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer transition-transform hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5"
        >
          <LeafCornerSvg className="w-5 h-3.5 sm:w-6 sm:h-4 absolute -bottom-1.5 -right-2" flip />
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE39A] shrink-0" />
          <span>Pengaturan</span>
        </button>
      </nav>
    </main>
  );
};

export default KalarmaVillageOpening;
