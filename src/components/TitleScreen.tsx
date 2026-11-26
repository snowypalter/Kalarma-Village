import React, { useEffect, useState } from 'react';
import {
  Check,
  CloudSun,
  GraduationCap,
  Info,
  Monitor,
  RotateCcw,
  Settings,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AVATARS, WEATHER_INFO } from '../data/characters';
import { AvatarId, WeatherType } from '../types/pharmacy';
import { GraphicsQuality } from '../utils/saveSystem';
import { soundFX } from '../utils/sound';
import { KalarmaVillageOpening } from './KalarmaVillageOpening';

interface TitleScreenProps {
  selectedAvatar: AvatarId;
  onSelectAvatar: (id: AvatarId) => void;
  hasSavedProgress: boolean;
  savedXp: number;
  savedCasesCount: number;
  totalCasesCount: number;
  weather: WeatherType;
  onChangeWeather: (weather: WeatherType) => void;
  onStartNew: () => void;
  onContinue: () => void;
  onResetSave: () => void;
  onOpenLearnMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  graphicsQuality: GraphicsQuality;
  onChangeGraphicsQuality: (quality: GraphicsQuality) => void;
}

const WEATHER_ORDER: WeatherType[] = [
  WeatherType.CERAH_HANGAT,
  WeatherType.HUJAN_LEMBAP,
  WeatherType.ANGIN_PANCAROBA,
  WeatherType.KABUT_MALAM,
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedAvatar,
  onSelectAvatar,
  hasSavedProgress,
  savedXp,
  savedCasesCount,
  totalCasesCount,
  weather,
  onChangeWeather,
  onStartNew,
  onContinue,
  onResetSave,
  onOpenLearnMode,
  isMuted,
  onToggleMute,
  graphicsQuality,
  onChangeGraphicsQuality,
}) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const activeAvatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAvatarModal) setShowAvatarModal(false);
        if (showSettingsModal) {
          setShowSettingsModal(false);
          setConfirmReset(false);
        }
        return;
      }
      if (!showAvatarModal && !showSettingsModal && (e.code === 'Enter' || e.code === 'Space')) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'BUTTON') {
          e.preventDefault();
          soundFX.playSuccess();
          if (hasSavedProgress) {
            onContinue();
          } else {
            onStartNew();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasSavedProgress, onContinue, onStartNew, showAvatarModal, showSettingsModal]);

  return (
    <>
      <KalarmaVillageOpening
        activeAvatar={activeAvatar}
        hasSavedProgress={hasSavedProgress}
        savedXp={savedXp}
        savedCasesCount={savedCasesCount}
        totalCasesCount={totalCasesCount}
        weather={weather}
        isMuted={isMuted}
        onStart={onStartNew}
        onContinue={onContinue}
        onOpenAvatar={() => setShowAvatarModal(true)}
        onSettings={() => {
          setConfirmReset(false);
          setShowSettingsModal(true);
        }}
        onToggleMute={onToggleMute}
      />

      {/* Modal Pilih Karakter Apoteker */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-50 bg-[#2A160B]/75 flex items-center justify-center p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Pilih Karakter Apoteker Kalarma Village"
        >
          <div className="w-full max-w-3xl max-h-[88dvh] bg-[#FAF4E4] border-[3.5px] border-[#6E4021] rounded-2xl shadow-[0_10px_0_#432512] flex flex-col overflow-hidden text-[#3E2414]">
            <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-b from-[#9B6334] to-[#744522] border-b-[3px] border-[#4A2B14] text-[#FFF8E6] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#FFD166] shrink-0" />
                <div>
                  <h2 className="font-display font-bold text-2xl leading-none">
                    Pilih Karakter · Kalarma Village
                  </h2>
                  <p className="text-xs text-[#FFE8B3] mt-0.5">
                    Setiap apoteker muda memiliki keahlian klinis unik di Meja Skrining &amp; Arena
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-[#5C3419] hover:bg-[#FF5A5F] border-2 border-[#E6B66B] text-[#FFF8E6] inline-flex items-center justify-center cursor-pointer"
                aria-label="Tutup pilihan karakter"
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

      {/* Modal Pengaturan & Profil Game dari Opening */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 z-50 bg-[#2A160B]/75 flex items-center justify-center p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Pengaturan Kalarma Village"
        >
          <div className="w-full max-w-2xl max-h-[88dvh] bg-[#FAF4E4] border-[3.5px] border-[#6E4021] rounded-2xl shadow-[0_10px_0_#432512] flex flex-col overflow-hidden text-[#3E2414]">
            <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-b from-[#9B6334] to-[#744522] border-b-[3px] border-[#4A2B14] text-[#FFF8E6] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-[#FFD166] shrink-0" />
                <div>
                  <h2 className="font-display font-bold text-2xl leading-none">
                    Pengaturan · Kalarma Village
                  </h2>
                  <p className="text-xs text-[#FFE8B3] mt-0.5">
                    A Cozy Fantasy Adventure · Audio, Cuaca &amp; Data Tersimpan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  setConfirmReset(false);
                }}
                className="min-h-[40px] min-w-[40px] rounded-xl bg-[#5C3419] hover:bg-[#FF5A5F] border-2 border-[#E6B66B] text-[#FFF8E6] inline-flex items-center justify-center cursor-pointer"
                aria-label="Tutup pengaturan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* Info Game */}
              <div className="v18-card-sm p-4 bg-white space-y-2.5">
                <div className="flex items-center gap-2 font-display font-bold text-xl text-[#2D2926]">
                  <Info className="w-5 h-5 text-[#2C6E63]" />
                  <span>Kalarma Village — A Cozy Fantasy Adventure</span>
                </div>
                <p className="text-xs text-[#2D2926]/80 leading-relaxed">
                  Game petualangan desa 3D isometrik dan simulasi edukasi farmasi klinis. Rawat warga desa di Klinik Desa Asklepios, pelajari dosis pediatrik, interaksi obat, formularium, dan uji kompetensi apoteker.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setShowSettingsModal(false);
                    onOpenLearnMode();
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#E8EFEA] hover:bg-[#D1E5D9] border-2 border-[#2C6E63] text-xs font-bold text-[#1F4A42] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Buka Mode Belajar Farmasi</span>
                </button>
              </div>

              {/* Audio & Cuaca */}
              <div className="v18-card-sm p-4 bg-white space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display font-bold text-lg text-[#2D2926]">
                      Efek Suara &amp; Musik Alam
                    </div>
                    <p className="text-xs text-[#2D2926]/70">
                      Atur audio antarmuka dan suasana desa 3D
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF4E4] border-2 border-[#6E4021] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-[#FF5A5F]" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#2C6E63]" />
                    )}
                    <span>{isMuted ? 'Suara: Mati' : 'Suara: Aktif'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#2D2926]/10 space-y-2">
                  <div className="flex items-center gap-1.5 font-display font-bold text-lg text-[#2D2926]">
                    <CloudSun className="w-4 h-4 text-[#D97706]" />
                    <span>Cuaca Awal Desa</span>
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
                          className={`min-h-[40px] px-3 py-1.5 rounded-xl border-2 text-xs font-bold text-left cursor-pointer ${
                            active
                              ? 'bg-[#FF5A5F] text-white border-[#2D2926]'
                              : 'bg-[#F2EFEB] text-[#2D2926] border-[#2D2926]/25 hover:bg-[#FFD166]/40'
                          }`}
                        >
                          {WEATHER_INFO[w].label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2D2926]/10 space-y-2">
                  <div className="flex items-center gap-1.5 font-display font-bold text-lg text-[#2D2926]">
                    <Monitor className="w-4 h-4 text-[#2C6E63]" />
                    <span>Kualitas Grafis 3D (Optimasi Laptop 8 GB)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onChangeGraphicsQuality('low');
                      }}
                      className={`min-h-[42px] px-3 py-1.5 rounded-xl border-2 text-xs font-bold text-left cursor-pointer ${
                        graphicsQuality === 'low'
                          ? 'bg-[#2C6E63] text-white border-[#2D2926]'
                          : 'bg-[#F2EFEB] text-[#2D2926] border-[#2D2926]/25 hover:bg-[#E8EFEA]'
                      }`}
                    >
                      <div>Low (Hemat RAM)</div>
                      <div className="text-[10px] font-normal opacity-80">
                        Shadow ringan, vegetasi ringkas
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onChangeGraphicsQuality('medium');
                      }}
                      className={`min-h-[42px] px-3 py-1.5 rounded-xl border-2 text-xs font-bold text-left cursor-pointer ${
                        graphicsQuality === 'medium'
                          ? 'bg-[#2C6E63] text-white border-[#2D2926]'
                          : 'bg-[#F2EFEB] text-[#2D2926] border-[#2D2926]/25 hover:bg-[#E8EFEA]'
                      }`}
                    >
                      <div>Medium (Seimbang)</div>
                      <div className="text-[10px] font-normal opacity-80">
                        Soft shadow, pencahayaan penuh
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Management */}
              <div className="v18-card-sm p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-display font-bold text-lg text-[#2D2926]">
                    Penyimpanan Progres Lokal
                  </div>
                  <p className="text-xs text-[#2D2926]/75">
                    {hasSavedProgress
                      ? `Tersimpan: ${savedCasesCount}/${totalCasesCount} kasus selesai · ${savedXp} XP · Avatar ${activeAvatar.name}`
                      : 'Belum ada progres petualangan tersimpan.'}
                  </p>
                </div>

                {hasSavedProgress &&
                  (!confirmReset ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setConfirmReset(true);
                      }}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FFF5F5] hover:bg-[#FEE2E2] border-2 border-[#DC2626] text-xs font-bold text-[#B91C1C] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Save</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          onResetSave();
                          setConfirmReset(false);
                        }}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#DC2626] text-white text-xs font-bold cursor-pointer"
                      >
                        Konfirmasi Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#F2EFEB] border border-[#2D2926]/30 text-xs font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
