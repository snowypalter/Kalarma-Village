import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ArrowRight, SearchCheck } from 'lucide-react';
import { AVATARS, CHARACTERS } from '../data/characters';
import { AvatarId, CaseScenario, ScreeningOption } from '../types/pharmacy';
import { soundFX } from '../utils/sound';
import { CharacterPortrait } from './CharacterPortrait';

interface ClinicalScreeningProps {
  scenario: CaseScenario;
  selectedAvatar: AvatarId;
  onPassScreening: () => void;
  onBackToMap: () => void;
}

export const ClinicalScreening: React.FC<ClinicalScreeningProps> = ({
  scenario,
  selectedAvatar,
  onPassScreening,
  onBackToMap,
}) => {
  const [chosen, setChosen] = useState<ScreeningOption | null>(null);
  const avatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0];
  const patient = CHARACTERS[scenario.patientId];

  const handleSelect = (opt: ScreeningOption) => {
    setChosen(opt);
    if (opt.isCorrect) {
      soundFX.playSuccess();
    } else {
      soundFX.playError();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="v18-card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div>
          <span className="v18-kicker mb-1.5">
            Tahap 2 · Meja Skrining Klinis · {patient.name} ({patient.species})
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#2D2926]">
            {scenario.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onBackToMap();
          }}
          className="v18-btn min-h-[44px] px-4 py-2 bg-white hover:bg-[#FFD166] text-xs font-bold uppercase tracking-wider text-[#2D2926] whitespace-nowrap cursor-pointer"
        >
          Kembali ke Peta Desa
        </button>
      </div>

      {/* 2-Column Prescription Inspection & Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Prescription & Patient Vitals Sheet */}
        <div className="lg:col-span-5 v18-card p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#2D2926]/20">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  {scenario.prescription.isSelfMedication ? 'Catatan Triase Swamedikasi' : 'Lembar Resep Klinik'}
                </div>
                <div className="font-display font-bold text-xl text-[#2D2926]">
                  {scenario.prescription.prescriber}
                </div>
              </div>
              <span className="font-mono text-xs font-bold bg-[#FFD166] border-2 border-[#2D2926] px-2 py-0.5 text-[#2D2926]">
                RM-{scenario.id.slice(-4).toUpperCase()}
              </span>
            </div>

            {/* Patient Vitals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm bg-[#F2EFEB] p-3.5 border-2 border-[#2D2926]">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#2D2926]/65 block">Usia &amp; Berat</span>
                <span className="font-bold text-[#2D2926] tabular-nums">
                  {scenario.prescription.patientVitals.age} · {scenario.prescription.patientVitals.weight}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#2D2926]/65 block">Suhu &amp; Tensi</span>
                <span className="font-mono font-bold text-[#2D2926] tabular-nums">
                  {scenario.prescription.patientVitals.temp} · {scenario.prescription.patientVitals.bp}
                </span>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="font-mono text-[10px] uppercase text-[#2D2926]/65 block">Riwayat Alergi</span>
                <span className="font-bold text-[#2D2926]">{scenario.prescription.patientVitals.allergy}</span>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="font-mono text-[10px] uppercase text-[#2D2926]/65 block">Kondisi &amp; Obat Penyerta</span>
                <span className="font-bold text-[#2D2926]">{scenario.prescription.patientVitals.comorbid}</span>
              </div>
            </div>

            {/* Prescription Items */}
            <div>
              <div className="font-mono text-xs font-bold uppercase text-[#2D2926] mb-2">
                Isi Permintaan / Resep:
              </div>
              <ul className="space-y-2">
                {scenario.prescription.items.map((item, idx) => (
                  <li
                    key={idx}
                    className="font-mono text-xs sm:text-sm bg-[#FFD166]/30 text-[#2D2926] p-3 border-2 border-[#2D2926]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-[#2D2926]/80 leading-relaxed">
              Catatan Klinis: {scenario.prescription.clinicalNote}
            </p>
          </div>

          {/* Tobi Special Ability Hint */}
          {avatar.interactionReveal && (
            <div className="p-3.5 bg-[#FFD166] border-2 border-[#2D2926] text-xs text-[#2D2926] flex items-start gap-2.5">
              <SearchCheck className="w-4 h-4 text-[#2D2926] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5">
                  Kaca Pembesar Tobi Aktif
                </span>
                {scenario.tobiHint}
              </div>
            </div>
          )}
        </div>

        {/* Right: Clinical Screening Options & Feedback */}
        <div className="lg:col-span-7 v18-card p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-2xl text-[#2D2926]">
              {scenario.screeningPrompt}
            </h3>

            <div className="space-y-3">
              {scenario.screeningOptions.map((opt) => {
                const isSelected = chosen?.id === opt.id;
                let style = 'bg-white border-2 border-[#2D2926]/25 hover:border-[#2D2926]';
                if (isSelected) {
                  style = opt.isCorrect
                    ? 'bg-[#E8EFEA] border-[3px] border-[#2C6E63] shadow-[4px_4px_0px_#2D2926]'
                    : 'bg-[#FF5A5F]/15 border-[3px] border-[#FF5A5F] shadow-[4px_4px_0px_#2D2926]';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left p-4 sm:p-5 transition-all min-h-[52px] sm:min-h-[48px] cursor-pointer ${style}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display font-bold text-lg sm:text-xl text-[#2D2926]">
                          {opt.label}
                        </div>
                        <p className="text-xs sm:text-sm text-[#2D2926]/75 mt-1 leading-relaxed">{opt.detail}</p>
                      </div>
                      {isSelected && (
                        <span className="shrink-0 mt-0.5">
                          {opt.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-[#2C6E63]" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-[#FF5A5F]" />
                          )}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mentor Feedback Card */}
          {chosen ? (
            <div
              className={`p-4 border-[2.5px] border-[#2D2926] flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                chosen.isCorrect ? 'bg-[#E8EFEA]' : 'bg-[#FF5A5F]/15'
              }`}
            >
              <CharacterPortrait
                characterId={chosen.feedbackSpeaker}
                emotion={chosen.feedbackEmotion}
                size={68}
              />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs font-bold uppercase text-[#2D2926] mb-1">
                  {CHARACTERS[chosen.feedbackSpeaker].name} ·{' '}
                  {chosen.isCorrect ? 'Skrining Lolos' : 'Perlu Evaluasi Ulang'}
                </div>
                <p className="text-xs sm:text-sm text-[#2D2926] leading-relaxed">
                  {chosen.feedbackText}
                </p>
              </div>
              {chosen.isCorrect && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playSuccess();
                    onPassScreening();
                  }}
                  className="v18-btn min-h-[44px] px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#EB494E] text-white font-display font-bold text-lg inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Masuk Arena Terapi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-[#F2EFEB] border-2 border-dashed border-[#2D2926]/25 text-xs text-[#2D2926]/75">
              Pilih satu keputusan klinis di atas untuk memvalidasi resep dan membuka Arena Benteng Terapi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
