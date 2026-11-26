import React, { useEffect, useState } from 'react';
import { FastForward, History, ChevronRight, X } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { DialogLine, EmotionType } from '../types/pharmacy';
import { soundFX } from '../utils/sound';
import { CharacterPortrait } from './CharacterPortrait';

interface VisualNovelDialogProps {
  lines: DialogLine[];
  onComplete: () => void;
  completeLabel?: string;
}

const EMOTION_TEXT: Record<EmotionType, string> = {
  [EmotionType.HAPPY]: 'Senang',
  [EmotionType.THINKING]: 'Berpikir',
  [EmotionType.PANICKED]: 'Panik',
  [EmotionType.SICK]: 'Lemas',
  [EmotionType.PROUD]: 'Bangga',
  [EmotionType.SERIOUS]: 'Serius',
};

export const VisualNovelDialog: React.FC<VisualNovelDialogProps> = ({
  lines,
  onComplete,
  completeLabel = 'Lanjut ke Meja Skrining',
}) => {
  const [index, setIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [fastMode, setFastMode] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const current = lines[index] || lines[0];
  const fullText = current?.text || '';
  const isFinishedTyping = charCount >= fullText.length;
  const isLastLine = index >= lines.length - 1;
  const speaker = CHARACTERS[current.speakerId] || CHARACTERS.lios;

  useEffect(() => {
    setIndex(0);
    setCharCount(0);
  }, [lines]);

  useEffect(() => {
    if (!current) return;
    if (charCount >= fullText.length) return;

    const intervalMs = fastMode ? 8 : 22;
    const timer = window.setTimeout(() => {
      setCharCount((prev) => {
        const next = Math.min(fullText.length, prev + (fastMode ? 4 : 1));
        if (next % 6 === 0) {
          soundFX.playDialogBlip((index % 3) * 35);
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearTimeout(timer);
  }, [charCount, fullText, fastMode, current, index]);

  const handleAdvance = () => {
    soundFX.playClick();
    if (!isFinishedTyping) {
      setCharCount(fullText.length);
      return;
    }
    if (!isLastLine) {
      setIndex((i) => i + 1);
      setCharCount(0);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showLog) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'BUTTON' && activeTag !== 'INPUT') {
          e.preventDefault();
          handleAdvance();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="w-full relative">
      {/* Dialog History Drawer/Modal */}
      {showLog && (
        <div
          className="fixed inset-0 z-50 bg-[#2D2926]/60 flex items-end md:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Log Riwayat Dialog"
        >
          <div className="v18-card bg-[#F2EFEB] w-full max-w-2xl max-h-[75vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b-[3px] border-[#2D2926] bg-[#FFD166]">
              <h3 className="font-display font-bold text-xl text-[#2D2926]">
                Riwayat Percakapan Klinik
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowLog(false);
                }}
                className="v18-btn min-h-[40px] min-w-[40px] bg-white inline-flex items-center justify-center text-[#2D2926] hover:bg-[#FF5A5F] hover:text-white cursor-pointer"
                aria-label="Tutup riwayat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 bg-[#F2EFEB]">
              {lines.slice(0, index + 1).map((line, i) => {
                const sp = CHARACTERS[line.speakerId] || CHARACTERS.lios;
                return (
                  <div
                    key={`${line.speakerId}-${i}`}
                    className="v18-card-sm flex items-start gap-3 p-3 bg-white"
                  >
                    <CharacterPortrait characterId={line.speakerId} emotion={line.emotion} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#2D2926]/70 mb-1">
                        <span className="font-display font-bold text-[#FF5A5F] text-base">{sp.name}</span>
                        <span aria-hidden="true">·</span>
                        <span>{sp.role}</span>
                        <span aria-hidden="true">·</span>
                        <span>{EMOTION_TEXT[line.emotion]}</span>
                      </div>
                      <p className="text-sm text-[#2D2926] leading-relaxed">{line.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Visual Novel Bottom Box */}
      <div className="v18-card p-4 md:p-5 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Dynamic Emotion Portrait */}
          <CharacterPortrait
            characterId={current.speakerId}
            emotion={current.emotion}
            size={92}
            className="shadow-[3px_3px_0px_#2D2926]"
          />

          {/* Dialog Text & Nameplate */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-display font-bold text-2xl text-[#FF5A5F] leading-none">
                  {speaker.name}
                </span>
                <span className="v18-kicker">
                  {speaker.role} · {EMOTION_TEXT[current.emotion]}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#2D2926]/70 tabular-nums">
                {index + 1} / {lines.length}
              </span>
            </div>

            <p className="text-sm md:text-base text-[#2D2926] leading-relaxed min-h-[3.5rem]">
              {fullText.slice(0, charCount)}
              {!isFinishedTyping && (
                <span className="inline-block w-2 h-4 ml-1 bg-[#FF5A5F] align-middle animate-pulse" />
              )}
            </p>

            {/* Touch-Friendly Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t-2 border-dashed border-[#2D2926]/15">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setShowLog(true);
                  }}
                  className="v18-btn min-h-[44px] px-3 py-2 bg-[#F2EFEB] text-xs font-bold uppercase tracking-wider text-[#2D2926] hover:bg-[#FFD166] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <History className="w-4 h-4 text-[#2D2926]" />
                  <span>Log Dialog</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setFastMode((f) => !f);
                  }}
                  className={`v18-btn min-h-[44px] px-3 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    fastMode
                      ? 'bg-[#FFD166] text-[#2D2926]'
                      : 'bg-white text-[#2D2926] hover:bg-[#F2EFEB]'
                  }`}
                >
                  <FastForward className="w-4 h-4" />
                  <span>{fastMode ? 'Teks Cepat Aktif' : 'Percepat Teks'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdvance}
                className="v18-btn min-h-[44px] px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#EB494E] text-white font-display font-bold text-lg inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>
                  {!isFinishedTyping ? 'Tampilkan Penuh' : isLastLine ? completeLabel : 'Lanjut'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
