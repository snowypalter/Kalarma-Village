import React from "react";

type Props = {
  onStart: () => void;
  onContinue?: () => void;
  onSettings?: () => void;
};

export default function KalarmaVillageOpening({
  onStart,
  onContinue,
  onSettings,
}: Props) {
  return (
    <main className="kv-opening">
      <div className="kv-art" aria-hidden="true" />
      <div className="kv-vignette" aria-hidden="true" />

      <header className="kv-brand">
        <div className="kv-eyebrow">A COZY FANTASY ADVENTURE</div>
        <h1>Kalarma <span>Village</span></h1>
        <p>Grow your garden. Cast your line. Find your story.</p>
      </header>

      <section className="kv-actions" aria-label="Main menu">
        <button className="kv-primary" onClick={onStart}>
          <span className="kv-button-icon">✦</span>
          MULAI PETUALANGAN
        </button>
        {onContinue && (
          <button className="kv-secondary" onClick={onContinue}>
            LANJUTKAN PERMAINAN
          </button>
        )}
        {onSettings && (
          <button className="kv-quiet" onClick={onSettings}>
            ⚙ Pengaturan
          </button>
        )}
      </section>

      <footer className="kv-footer">
        <span>HERBAL LIFE · FARMING · FISHING · ADVENTURE</span>
        <span>© KALARMA VILLAGE</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Fredoka:wght@400;500;600;700&display=swap');

        .kv-opening {
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 100svh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #fff9e9;
          background: #214b37;
          font-family: 'Baloo 2', 'Trebuchet MS', sans-serif;
        }
        .kv-art, .kv-vignette {
          position: absolute;
          inset: 0;
          z-index: -2;
        }
        .kv-art {
          background-image: url('/images/kalarma-village-opening.jpg');
          background-size: cover;
          background-position: center 55%;
          transform: scale(1.015);
          animation: kv-arrive 1.1s ease-out both;
        }
        .kv-vignette {
          z-index: -1;
          background:
            linear-gradient(180deg, rgba(13,43,35,.55) 0%, rgba(13,43,35,.10) 36%, rgba(13,43,35,.12) 56%, rgba(13,36,27,.68) 100%),
            linear-gradient(90deg, rgba(10,35,29,.20), transparent 70%);
        }
        .kv-brand {
          width: min(900px, 94%);
          margin: clamp(28px, 7vh, 78px) auto 0;
          text-align: center;
          text-shadow: 0 4px 18px rgba(17,45,32,.55);
        }
        .kv-eyebrow {
          display: inline-block;
          padding: 5px 16px;
          border: 1px solid rgba(255,245,210,.75);
          border-radius: 999px;
          background: rgba(37,83,57,.42);
          color: #fff0bb;
          font: 700 11px/1.4 'Fredoka', sans-serif;
          letter-spacing: .22em;
        }
        .kv-brand h1 {
          margin: 8px 0 0;
          color: #fff7dc;
          font: 800 clamp(54px, 10vw, 112px)/.94 'Baloo 2', sans-serif;
          letter-spacing: -.055em;
          -webkit-text-stroke: 1px rgba(91,75,40,.24);
          filter: drop-shadow(0 5px 0 rgba(84,57,30,.35));
        }
        .kv-brand h1 span {
          display: block;
          color: #ffe39a;
          font-size: .72em;
          letter-spacing: .015em;
        }
        .kv-brand p {
          margin: 12px 0 0;
          font: 600 clamp(13px, 2vw, 19px)/1.4 'Fredoka', sans-serif;
          color: #fff9e9;
          letter-spacing: .04em;
        }
        .kv-actions {
          width: min(340px, 86vw);
          display: grid;
          gap: 10px;
          margin: auto auto clamp(66px, 11vh, 116px);
        }
        .kv-actions button {
          min-height: 52px;
          border-radius: 17px;
          cursor: pointer;
          font: 700 16px 'Fredoka', sans-serif;
          letter-spacing: .035em;
          transition: transform .16s ease, filter .16s ease;
        }
        .kv-actions button:hover { transform: translateY(-3px); filter: brightness(1.08); }
        .kv-actions button:active { transform: translateY(1px) scale(.99); }
        .kv-primary {
          border: 3px solid #fff0b6;
          color: #56391e;
          background: linear-gradient(180deg, #ffe58b, #efa93e);
          box-shadow: 0 6px 0 #a9682d, 0 12px 25px rgba(20,42,27,.3), inset 0 2px 0 #fff8d9;
        }
        .kv-button-icon { margin-right: 9px; color: #9a5b24; }
        .kv-secondary {
          border: 2px solid rgba(255,245,218,.9);
          color: #fff9e9;
          background: rgba(35,75,53,.76);
          box-shadow: 0 4px 0 rgba(22,48,36,.65);
          backdrop-filter: blur(8px);
        }
        .kv-quiet {
          min-height: 40px !important;
          border: 0;
          color: #fff9e9;
          background: rgba(23,53,41,.38);
          text-shadow: 0 2px 4px #183526;
        }
        .kv-footer {
          position: absolute;
          right: 18px;
          bottom: 12px;
          left: 18px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(255,247,222,.9);
          font: 600 10px 'Fredoka', sans-serif;
          letter-spacing: .12em;
          text-shadow: 0 2px 5px #183526;
        }
        @keyframes kv-arrive {
          from { opacity: .65; transform: scale(1.06); }
          to { opacity: 1; transform: scale(1.015); }
        }
        @media (max-width: 650px) {
          .kv-art { background-position: 52% center; }
          .kv-brand { margin-top: 8vh; }
          .kv-brand h1 { font-size: clamp(48px, 15vw, 76px); }
          .kv-actions { margin-bottom: 14vh; }
          .kv-footer { font-size: 8px; letter-spacing: .06em; }
        }
        @media (prefers-reduced-motion: reduce) {
          .kv-art { animation: none; }
          .kv-actions button { transition: none; }
        }
      `}</style>
    </main>
  );
}
