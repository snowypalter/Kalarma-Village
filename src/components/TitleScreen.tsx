import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  GraduationCap,
  Play,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AVATARS, OPENING_CHIBI_LANDSCAPE, OPENING_CHIBI_MOBILE } from '../data/characters';
import { AvatarId } from '../types/pharmacy';
import { soundFX } from '../utils/sound';

interface TitleScreenProps {
  selectedAvatar: AvatarId;
  onSelectAvatar: (id: AvatarId) => void;
  onStart: () => void;
  onOpenLearnMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedAvatar,
  onSelectAvatar,
  onStart,
  onOpenLearnMode,
  isMuted,
  onToggleMute,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const activeAvatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showAvatarModal) {
        if (e.key === 'Escape') setShowAvatarModal(false);
        return;
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        const tag = document.activeElement?.tagName;
        if (tag !== 'BUTTON') {
          e.preventDefault();
          soundFX.playSuccess();
          onStart();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart, showAvatarModal]);

  return (
    <main className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#5D351B] text-[#FFF8E6] flex flex-col justify-between pt-safe pb-safe select-none">
      {/* Full-Viewport Cute Chibi Clinic Artwork (9:16 mobile / 16:9 tablet & desktop) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {!imgErrors['landscape'] ? (
          <img
            src={OPENING_CHIBI_LANDSCAPE}
            alt="Klinik Desa Asklepios bersama apoteker chibi dan sahabat hewan lucu"
            referrerPolicy="no-referrer"
            onError={() => setImgErrors((p) => ({ ...p, landscape: true }))}
            className="hidden sm:block w-full h-full object-cover object-center animate-hero-ken-burns"
          />
        ) : (
          <div className="hidden sm:block w-full h-full bg-gradient-to-br from-[#2C6E63] via-[#5D351B] to-[#2D2926]" />
        )}

        {!imgErrors['mobile'] ? (
          <img
            src={OPENING_CHIBI_MOBILE}
            alt="Klinik Desa Asklepios bersama apoteker chibi dan sahabat hewan lucu"
            referrerPolicy="no-referrer"
            onError={() => setImgErrors((p) => ({ ...p, mobile: true }))}
            className="block sm:hidden w-full h-full object-cover object-top animate-hero-ken-burns"
          />
        ) : (
          <div className="block sm:hidden w-full h-full bg-gradient-to-b from-[#2C6E63] via-[#5D351B] to-[#2D2926]" />
        )}

        {/* Measured Top & Bottom Scrims leaving center cute characters crisp & unobstructed */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#2A160B]/75 via-[#2A160B]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-60 sm:h-52 bg-gradient-to-t from-[#2A160B]/92 via-[#2A160B]/62 to-transparent" />

        {/* Subtle Floating Golden Herb Particles */}
        <span className="absolute left-[18%] bottom-[32%] w-2.5 h-2.5 rounded-full bg-[#FFD166] shadow-[0_0_10px_#FFD166] animate-float-leaf-a" />
        <span className="absolute right-[22%] bottom-[38%] w-2 h-2 rounded-full bg-[#A7F3D0] shadow-[0_0_8px_#A7F3D0] animate-float-leaf-b" />
      </div>

      {/* Top Compact Bar (Unboxed Brand Wordmark + Quick Avatar Badge + Audio) */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-3.5 sm:px-6 pt-1.5 sm:pt-4 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 drop-shadow-[0_2px_6px_rgba(32,16,8,0.85)]">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD166] shrink-0" />
          <div className="leading-none min-w-0">
            <h1 className="font-display font-bold text-xl sm:text-3xl tracking-tight text-[#FFF8E6] leading-none truncate">
              Klinik Desa Asklepios
            </h1>
            <p className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-[#FFD166] mt-0.5 truncate">
              Petualangan Apoteker Muda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setShowAvatarModal(true);
            }}
            className="ask-wood-pill min-h-[38px] sm:min-h-[42px] pl-1 pr-2.5 sm:pl-1.5 sm:pr-3 py-1 inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            title="Pilih Karakter Apoteker"
          >
            <img
              src={activeAvatar.imagePath}
              alt={activeAvatar.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#FFD166] object-cover bg-[#F2EFEB]"
            />
            <span className="font-sans text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap">
              {activeAvatar.name}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="ask-wood-pill min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] p-1.5 sm:p-2 inline-flex items-center justify-center cursor-pointer"
            aria-label={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
            title={isMuted ? 'Suara Mati' : 'Audio Aktif'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#FCA5A5]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#86EFAC]" />
            )}
          </button>
        </div>
      </header>

      {/* Zero-Scroll Bottom Action Dock Over Scene */}
      <section
        aria-label="Menu Pembukaan Game"
        className="relative z-10 w-full max-w-2xl mx-auto px-3 sm:px-6 pb-2.5 sm:pb-6 animate-fade-rise"
      >
        <div className="bg-[#2A160B]/74 backdrop-blur-[3px] border-2 border-[#E8BC74]/50 rounded-2xl px-3.5 py-3 sm:px-5 sm:py-4 shadow-[0_12px_32px_rgba(0,0,0,0.45)] flex flex-col items-center gap-2.5 sm:gap-3">
          <p className="text-center font-sans text-[11.5px] sm:text-sm text-[#FFF8E6]/95 font-medium max-w-xl leading-snug text-balance">
            Rawat 10 pasien unik di desa 3D, kuasai dosis anak &amp; interaksi obat, lalu raih seluruh Medali Apoteker.
          </p>

          {/* Unified Single-Screen Action Grid (Zero Scroll on Phone, Tablet, Laptop & Desktop) */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundFX.playSuccess();
                onStart();
              }}
              className="col-span-2 sm:col-span-2 min-h-[48px] sm:min-h-[52px] px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#3B826E] to-[#23594F] hover:brightness-110 border-[2.5px] border-[#FFD166] shadow-[0_4px_0_#16302B,0_8px_18px_rgba(0,0,0,0.35)] text-white font-sans font-extrabold text-base sm:text-lg tracking-wide inline-flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-[#FFD166] text-[#FFD166]" />
              <span>Mulai Game</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onOpenLearnMode();
              }}
              className="ask-wood-tile min-h-[48px] sm:min-h-[52px] px-3 py-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-[#A7F3D0] shrink-0" />
              <span className="font-sans font-bold text-xs sm:text-[13px] tracking-tight whitespace-nowrap">
                Mode Belajar
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setShowAvatarModal(true);
              }}
              className="ask-wood-tile min-h-[48px] sm:min-h-[52px] px-3 py-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD166] shrink-0" />
              <span className="font-sans font-bold text-xs sm:text-[13px] tracking-tight whitespace-nowrap">
                Pilih Avatar
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Compact Modal Avatar Selector (Keeps Title Screen 100% Zero-Scroll!) */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-50 bg-[#2A160B]/75 flex items-center justify-center p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Pilih Karakter Apoteker Muda"
        >
          <div className="w-full max-w-3xl max-h-[88dvh] bg-[#FAF4E4] border-[3.5px] border-[#6E4021] rounded-2xl shadow-[0_10px_0_#432512] flex flex-col overflow-hidden text-[#3E2414]">
            <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-b from-[#9B6334] to-[#744522] border-b-[3px] border-[#4A2B14] text-[#FFF8E6] flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-2xl leading-none">
                  Pilih Avatar Apoteker Muda
                </h2>
                <p className="text-xs text-[#FFE8B3] mt-0.5">
                  Setiap tokoh memiliki keahlian klinis unik di Meja Skrining &amp; Arena
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-[#5C3419] hover:bg-[#FF5A5F] border-2 border-[#E6B66B] text-[#FFF8E6] inline-flex items-center justify-center cursor-pointer"
                aria-label="Tutup pilihan avatar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AVATARS.map((avatar) => {
                const isSelected = avatar.id === selectedAvatar;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      onSelectAvatar(avatar.id);
                    }}
                    className={`text-left p-3.5 rounded-xl border-[2.5px] transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFE8A3] border-[#6E4021] shadow-[0_4px_0_#6E4021]'
                        : 'bg-[#FFFDF7] border-[#C8A46D] hover:bg-[#FFF6DA]'
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#6E4021] bg-[#F2EFEB] shrink-0">
                      <img
                        src={avatar.imagePath}
                        alt={avatar.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-5 h-5 rounded-md bg-[#2C6E63] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-bold text-2xl leading-none text-[#2D2926]">
                        {avatar.name}
                      </div>
                      <div className="font-mono text-[10px] font-bold uppercase text-[#9A5016] mt-0.5">
                        {avatar.species} · {avatar.title}
                      </div>
                      <p className="text-xs text-[#4A2B14]/85 mt-1 leading-snug">
                        {avatar.bonusDetail}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="px-4 sm:px-6 py-3 bg-[#EFE1C3] border-t-2 border-[#C8A46D] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundFX.playSuccess();
                  setShowAvatarModal(false);
                }}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#2C6E63] hover:bg-[#23594F] border-2 border-[#16302B] text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Gunakan {activeAvatar.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
