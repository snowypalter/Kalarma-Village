import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { QUIZ_QUESTIONS } from '../data/quiz';
import { EmotionType } from '../types/pharmacy';
import { soundFX } from '../utils/sound';
import { CharacterPortrait } from './CharacterPortrait';

export const ClinicalQuiz: React.FC = () => {
  const [mode, setMode] = useState<'pre' | 'post'>('pre');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const total = QUIZ_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;

  const currentScore = QUIZ_QUESTIONS.reduce(
    (acc, q) => (answers[q.id] === q.correctOptionId ? acc + 1 : acc),
    0
  );

  const handleSubmit = () => {
    soundFX.playSuccess();
    setSubmitted(true);
    if (mode === 'pre') {
      setPreScore(currentScore);
    } else {
      setPostScore(currentScore);
    }
  };

  const switchMode = (nextMode: 'pre' | 'post') => {
    soundFX.playClick();
    setMode(nextMode);
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Pre/Post Comparison */}
      <div className="v18-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="v18-kicker mb-1.5">
            Evaluasi Klinis Gaya UKMPPAI · 6 Studi Kasus Terapan
          </span>
          <h2 className="font-display font-bold text-3xl text-[#2D2926]">
            Pre-Test &amp; Post-Test · Kalarma Village
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[#F2EFEB] border-2 border-[#2D2926] p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => switchMode('pre')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                mode === 'pre'
                  ? 'bg-[#FF5A5F] text-white border-2 border-[#2D2926] shadow-[3px_3px_0px_#2D2926]'
                  : 'bg-white text-[#2D2926] border-2 border-transparent hover:border-[#2D2926]/40'
              }`}
            >
              Pre-Test {preScore !== null ? `(${preScore}/${total})` : ''}
            </button>
            <button
              type="button"
              onClick={() => switchMode('post')}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                mode === 'post'
                  ? 'bg-[#FF5A5F] text-white border-2 border-[#2D2926] shadow-[3px_3px_0px_#2D2926]'
                  : 'bg-white text-[#2D2926] border-2 border-transparent hover:border-[#2D2926]/40'
              }`}
            >
              Post-Test {postScore !== null ? `(${postScore}/${total})` : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Automatic Score Comparison Banner */}
      {(preScore !== null || postScore !== null) && (
        <div className="v18-card-sm bg-[#FFD166] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 font-mono tabular-nums">
            <div>
              <span className="text-xs font-bold uppercase text-[#2D2926]/75 block font-sans">
                Skor Pre-Test
              </span>
              <span className="text-xl font-bold text-[#2D2926]">
                {preScore !== null
                  ? `${Math.round((preScore / total) * 100)}% (${preScore}/${total})`
                  : 'Belum dikerjakan'}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-[#2D2926]/75 block font-sans">
                Skor Post-Test
              </span>
              <span className="text-xl font-bold text-[#2C6E63]">
                {postScore !== null
                  ? `${Math.round((postScore / total) * 100)}% (${postScore}/${total})`
                  : 'Belum dikerjakan'}
              </span>
            </div>
            {preScore !== null && postScore !== null && (
              <div>
                <span className="text-xs font-bold uppercase text-[#2D2926]/75 block font-sans">
                  Peningkatan Kompetensi
                </span>
                <span
                  className={`text-xl font-bold ${
                    postScore >= preScore ? 'text-[#2C6E63]' : 'text-[#FF5A5F]'
                  }`}
                >
                  {postScore - preScore >= 0 ? '+' : ''}
                  {Math.round(((postScore - preScore) / total) * 100)}%
                </span>
              </div>
            )}
          </div>

          {preScore !== null && mode === 'pre' && submitted && (
            <button
              type="button"
              onClick={() => switchMode('post')}
              className="v18-btn min-h-[44px] px-4 py-2 bg-[#2D2926] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3F3A36] whitespace-nowrap cursor-pointer"
            >
              Lanjut ke Post-Test
            </button>
          )}
        </div>
      )}

      {/* 6 Clinical Questions */}
      <div className="space-y-5">
        {QUIZ_QUESTIONS.map((q, idx) => {
          const picked = answers[q.id];
          const isCorrect = picked === q.correctOptionId;
          const mentor = CHARACTERS[q.mentorSpeaker];

          return (
            <div key={q.id} className="v18-card p-5 space-y-4">
              <div>
                <span className="v18-kicker mb-2">
                  Soal {idx + 1} dari {total} · {q.topic}
                </span>
                <p className="text-sm sm:text-base font-semibold text-[#2D2926] leading-relaxed">
                  {q.stem}
                </p>
              </div>

              <div className="space-y-2.5">
                {q.options.map((opt) => {
                  const selected = picked === opt.id;
                  const correctOpt = opt.id === q.correctOptionId;

                  let style = 'bg-[#F2EFEB] border-2 border-[#2D2926]/20 hover:border-[#2D2926]';
                  if (submitted) {
                    if (correctOpt) {
                      style = 'bg-[#E8EFEA] border-[2.5px] border-[#2C6E63] shadow-[3px_3px_0px_#2D2926]';
                    } else if (selected && !correctOpt) {
                      style = 'bg-[#FF5A5F]/15 border-[2.5px] border-[#FF5A5F]';
                    }
                  } else if (selected) {
                    style = 'bg-[#FFD166]/45 border-[2.5px] border-[#2D2926] shadow-[3px_3px_0px_#2D2926]';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={submitted}
                      onClick={() => {
                        soundFX.playClick();
                        setAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                      }}
                      className={`w-full text-left p-4 sm:p-3.5 transition-all min-h-[52px] sm:min-h-[48px] flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${style}`}
                    >
                      <span className="text-xs sm:text-sm text-[#2D2926]">
                        <span className="font-mono font-bold mr-2 uppercase">{opt.id}.</span>
                        {opt.text}
                      </span>
                      {submitted && correctOpt && (
                        <CheckCircle2 className="w-4 h-4 text-[#2C6E63] shrink-0" />
                      )}
                      {submitted && selected && !correctOpt && (
                        <XCircle className="w-4 h-4 text-[#FF5A5F] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mentor Clinical Rationale after submission */}
              {submitted && (
                <div
                  className={`p-4 border-2 border-[#2D2926] flex items-start gap-3 ${
                    isCorrect ? 'bg-[#E8EFEA]' : 'bg-[#FFD166]/35'
                  }`}
                >
                  <CharacterPortrait
                    characterId={q.mentorSpeaker}
                    emotion={isCorrect ? EmotionType.PROUD : EmotionType.SERIOUS}
                    size={54}
                  />
                  <div className="text-xs sm:text-sm text-[#2D2926] leading-relaxed">
                    <div className="font-bold mb-0.5">
                      Pembahasan {mentor.name} ·{' '}
                      {isCorrect ? 'Jawaban Anda Benar' : 'Koreksi Klinis'}
                    </div>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Reset Action Bar */}
      <div className="v18-card flex flex-wrap items-center justify-between gap-3 p-4">
        <span className="text-xs sm:text-sm text-[#2D2926] font-mono font-bold tabular-nums">
          Terjawab: {answeredCount} / {total} soal ({mode === 'pre' ? 'Pre-Test' : 'Post-Test'})
        </span>

        {!submitted ? (
          <button
            type="button"
            disabled={answeredCount < total}
            onClick={handleSubmit}
            className="v18-btn min-h-[44px] px-6 py-2.5 bg-[#FF5A5F] hover:bg-[#EB494E] disabled:opacity-45 text-white font-display font-bold text-lg whitespace-nowrap cursor-pointer"
          >
            Selesaikan &amp; Nilai {mode === 'pre' ? 'Pre-Test' : 'Post-Test'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => switchMode(mode)}
            className="v18-btn min-h-[44px] px-5 py-2.5 bg-white hover:bg-[#FFD166] text-[#2D2926] font-bold uppercase text-xs tracking-wider inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi {mode === 'pre' ? 'Pre-Test' : 'Post-Test'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
