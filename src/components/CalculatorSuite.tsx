import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { soundFX } from '../utils/sound';
import { CharacterPortrait } from './CharacterPortrait';
import { EmotionType } from '../types/pharmacy';

type CalcSubTab = 'pediatric' | 'infusion' | 'pk' | 'compounding';

export const CalculatorSuite: React.FC = () => {
  const [subTab, setSubTab] = useState<CalcSubTab>('pediatric');

  // 1. Pediatric state
  const [pedWeight, setPedWeight] = useState(18);
  const [pedHeight, setPedHeight] = useState(108);
  const [pedAge, setPedAge] = useState(5);
  const [pedMgPerKg, setPedMgPerKg] = useState(40);
  const [pedFreq, setPedFreq] = useState(3);
  const [adultDose, setAdultDose] = useState(500);

  const pedDailyDose = pedWeight * pedMgPerKg;
  const pedPerTake = pedDailyDose / Math.max(1, pedFreq);
  const bsaMosteller = Math.sqrt((pedHeight * pedWeight) / 3600);
  const bsaDose = (bsaMosteller / 1.73) * adultDose;
  const youngDose = (pedAge / (pedAge + 12)) * adultDose;

  // 2. Infusion & Reconstitution state
  const [infVol, setInfVol] = useState(500);
  const [infHours, setInfHours] = useState(4);
  const [vialMg, setVialMg] = useState(1000);
  const [diluentMl, setDiluentMl] = useState(10);
  const [neededMg, setNeededMg] = useState(500);

  const mlPerHour = infVol / Math.max(0.25, infHours);
  const tpmMakro = (infVol * 20) / Math.max(1, infHours * 60);
  const tpmMikro = (infVol * 60) / Math.max(1, infHours * 60);
  const vialConc = vialMg / Math.max(0.5, diluentMl);
  const volumeToDraw = neededMg / Math.max(0.01, vialConc);

  // 3. PK & Clinical state
  const [pkAge, setPkAge] = useState(58);
  const [pkWeight, setPkWeight] = useState(65);
  const [pkHeight, setPkHeight] = useState(166);
  const [pkScr, setPkScr] = useState(1.1);
  const [pkSex, setPkSex] = useState<'male' | 'female'>('male');

  const baseCrCl = ((140 - pkAge) * pkWeight) / (72 * Math.max(0.2, pkScr));
  const crCl = pkSex === 'female' ? baseCrCl * 0.85 : baseCrCl;
  const bmi = pkWeight / Math.pow(Math.max(0.5, pkHeight / 100), 2);
  const heightInches = pkHeight / 2.54;
  const ibwBase = pkSex === 'male' ? 50 : 45.5;
  const ibw = ibwBase + 2.3 * Math.max(0, heightInches - 60);

  // 4. Compounding state
  const [hlbTarget, setHlbTarget] = useState(12);
  const [hlbHigh, setHlbHigh] = useState(15); // Tween 80
  const [hlbLow, setHlbLow] = useState(4.3); // Span 80
  const [emulsifierTotalG, setEmulsifierTotalG] = useState(10);
  const [c1, setC1] = useState(96);
  const [c2, setC2] = useState(70);
  const [v2, setV2] = useState(100);

  const denomHlb = Math.max(0.1, hlbHigh - hlbLow);
  const fracHigh = Math.min(1, Math.max(0, (hlbTarget - hlbLow) / denomHlb));
  const fracLow = 1 - fracHigh;
  const gramTween = fracHigh * emulsifierTotalG;
  const gramSpan = fracLow * emulsifierTotalG;
  const v1Needed = (v2 * c2) / Math.max(0.01, c1);

  const liosTips: Record<CalcSubTab, string> = {
    pediatric:
      'Guru Lios: Pastikan dosis mg/kgBB/hari tidak melampaui dosis maksimum dewasa. Untuk anak < 12 tahun, cek juga rasio BSA Mosteller bila obat memiliki indeks terapi sempit.',
    infusion:
      'Guru Lios: Selang makro standar memakai faktor tetes 20 tetes/mL, sedangkan mikro memakai 60 tetes/mL (sehingga TPM Mikro secara numerik sama dengan mL/jam!).',
    pk: 'Guru Lios: Bila hasil CrCl Cockcroft-Gault < 30 mL/menit, segera periksa penyesuaian dosis obat yang diekskresi ginjal seperti Metformin atau Vankomisin.',
    compounding:
      'Guru Lios: Dalam mencampur surfaktan Tween 80 (HLB 15) dan Span 80 (HLB 4,3), gunakan metode aligasi untuk mencapai HLB butuh fase minyak secara presisi.',
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="v18-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="v18-kicker mb-1.5">
            Suite Kalkulator Farmasi Terpadu · Real-Time
          </span>
          <h2 className="font-display font-bold text-3xl text-[#2D2926]">
            Kalkulator Klinis &amp; Peracikan Apotek
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 bg-[#F2EFEB] border-2 border-[#2D2926] p-1.5">
          {[
            { id: 'pediatric' as CalcSubTab, label: 'Dosis Anak' },
            { id: 'infusion' as CalcSubTab, label: 'Infus & Rekonstitusi' },
            { id: 'pk' as CalcSubTab, label: 'Farmakokinetik' },
            { id: 'compounding' as CalcSubTab, label: 'Compounding' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSubTab(tab.id);
              }}
              className={`min-h-[44px] px-2.5 sm:px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all flex-1 sm:flex-initial min-w-[120px] sm:min-w-auto cursor-pointer ${
                subTab === tab.id
                  ? 'bg-[#FF5A5F] text-white border-2 border-[#2D2926] shadow-[3px_3px_0px_#2D2926]'
                  : 'bg-white text-[#2D2926] border-2 border-transparent hover:border-[#2D2926]/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guru Lios Guidance Strip */}
      <div className="v18-card-sm bg-[#FFD166]/45 p-4 flex items-center gap-4">
        <CharacterPortrait characterId="lios" emotion={EmotionType.THINKING} size={60} />
        <p className="text-xs sm:text-sm font-medium text-[#2D2926] leading-relaxed">
          {liosTips[subTab]}
        </p>
      </div>

      {/* Sub-Tab 1: Dosis Anak */}
      {subTab === 'pediatric' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 v18-card p-5 space-y-4">
            <h3 className="font-display font-bold text-2xl text-[#2D2926]">Parameter Pasien Anak</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3 text-xs">
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Berat Badan (kg)</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={pedWeight}
                  onChange={(e) => setPedWeight(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Tinggi Badan (cm)</span>
                <input
                  type="number"
                  min={40}
                  max={190}
                  value={pedHeight}
                  onChange={(e) => setPedHeight(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Usia Anak (tahun)</span>
                <input
                  type="number"
                  min={1}
                  max={17}
                  value={pedAge}
                  onChange={(e) => setPedAge(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Dosis (mg/kgBB/hari)</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={pedMgPerKg}
                  onChange={(e) => setPedMgPerKg(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Frekuensi (kali/hari)</span>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={pedFreq}
                  onChange={(e) => setPedFreq(Number(e.target.value) || 1)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Dosis Dewasa Acuan (mg)</span>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={adultDose}
                  onChange={(e) => setAdultDose(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="v18-card-sm p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  Berdasarkan Berat Badan
                </div>
                <div className="font-mono font-bold text-2xl text-[#2D2926] mt-2 tabular-nums">
                  {pedDailyDose.toFixed(0)} mg/hari
                </div>
                <div className="font-mono text-sm text-[#2C6E63] font-bold mt-1 tabular-nums">
                  {pedPerTake.toFixed(1)} mg / kali minum
                </div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#2D2926]/15 font-mono text-[11px] text-[#2D2926]/70">
                Dosis = BB × mg/kgBB/hari
              </div>
            </div>

            <div className="v18-card-sm p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  BSA Mosteller
                </div>
                <div className="font-mono font-bold text-2xl text-[#2D2926] mt-2 tabular-nums">
                  {bsaMosteller.toFixed(2)} m²
                </div>
                <div className="font-mono text-sm text-[#2C6E63] font-bold mt-1 tabular-nums">
                  Dosis: {bsaDose.toFixed(1)} mg
                </div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#2D2926]/15 font-mono text-[11px] text-[#2D2926]/70">
                BSA = √((TB × BB) / 3600)
              </div>
            </div>

            <div className="v18-card-sm p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  Rumus Young (1–12 th)
                </div>
                <div className="font-mono font-bold text-2xl text-[#2D2926] mt-2 tabular-nums">
                  {youngDose.toFixed(1)} mg
                </div>
                <div className="font-mono text-sm text-[#2D2926]/70 mt-1 tabular-nums">
                  {((pedAge / (pedAge + 12)) * 100).toFixed(0)}% dosis dewasa
                </div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#2D2926]/15 font-mono text-[11px] text-[#2D2926]/70">
                Dosis = (Usia / (Usia + 12)) × DD
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Infus & Rekonstitusi */}
      {subTab === 'infusion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 v18-card p-5 space-y-4">
            <h3 className="font-display font-bold text-2xl text-[#2D2926]">Parameter Infus &amp; Vial</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Volume Infus (mL)</span>
                <input
                  type="number"
                  min={10}
                  max={3000}
                  value={infVol}
                  onChange={(e) => setInfVol(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Durasi Habis (jam)</span>
                <input
                  type="number"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={infHours}
                  onChange={(e) => setInfHours(Number(e.target.value) || 0.5)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Kekuatan Vial (mg)</span>
                <input
                  type="number"
                  min={50}
                  max={5000}
                  value={vialMg}
                  onChange={(e) => setVialMg(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Pelarut Rekonstitusi (mL)</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={diluentMl}
                  onChange={(e) => setDiluentMl(Number(e.target.value) || 1)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="col-span-2 block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Dosis Dibutuhkan Pasien (mg)</span>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={neededMg}
                  onChange={(e) => setNeededMg(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="v18-card-sm p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  Laju Infus Makro (20 tetes/mL)
                </div>
                <div className="font-mono font-bold text-3xl text-[#2D2926] mt-2 tabular-nums">
                  {Math.round(tpmMakro)} TPM
                </div>
                <div className="font-mono text-xs text-[#2D2926]/70 mt-1 tabular-nums">
                  Tepat: {tpmMakro.toFixed(2)} tetes/menit · {mlPerHour.toFixed(1)} mL/jam
                </div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#2D2926]/15 font-mono text-[11px] text-[#2D2926]/70">
                TPM = (Vol × 20) / (Jam × 60)
              </div>
            </div>

            <div className="v18-card-sm p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  Laju Infus Mikro (60 tetes/mL)
                </div>
                <div className="font-mono font-bold text-3xl text-[#2D2926] mt-2 tabular-nums">
                  {Math.round(tpmMikro)} TPM
                </div>
                <div className="font-mono text-xs text-[#2D2926]/70 mt-1 tabular-nums">
                  Setara {mlPerHour.toFixed(1)} mL/jam (pompa infus)
                </div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#2D2926]/15 font-mono text-[11px] text-[#2D2926]/70">
                TPM = (Vol × 60) / (Jam × 60)
              </div>
            </div>

            <div className="sm:col-span-2 v18-card-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  Hasil Rekonstitusi Vial
                </div>
                <div className="font-mono font-bold text-2xl text-[#2C6E63] mt-1 tabular-nums">
                  Ambil {volumeToDraw.toFixed(2)} mL larutan
                </div>
                <p className="text-xs text-[#2D2926]/75 mt-1 font-mono tabular-nums">
                  Konsentrasi sediaan = {vialConc.toFixed(1)} mg/mL
                </p>
              </div>
              <div className="font-mono text-xs bg-[#F2EFEB] p-3 border-2 border-[#2D2926] text-[#2D2926]">
                Vol Ambil = Dosis (mg) / (Vial mg / Pelarut mL)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Farmakokinetik & Klinis */}
      {subTab === 'pk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 v18-card p-5 space-y-4">
            <h3 className="font-display font-bold text-2xl text-[#2D2926]">Data Antropometri &amp; Ginjal</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Usia (tahun)</span>
                <input
                  type="number"
                  min={18}
                  max={105}
                  value={pkAge}
                  onChange={(e) => setPkAge(Number(e.target.value) || 18)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Berat Badan (kg)</span>
                <input
                  type="number"
                  min={25}
                  max={200}
                  value={pkWeight}
                  onChange={(e) => setPkWeight(Number(e.target.value) || 25)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Tinggi Badan (cm)</span>
                <input
                  type="number"
                  min={120}
                  max={220}
                  value={pkHeight}
                  onChange={(e) => setPkHeight(Number(e.target.value) || 120)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Kreatinin Serum (mg/dL)</span>
                <input
                  type="number"
                  min={0.3}
                  max={15}
                  step={0.1}
                  value={pkScr}
                  onChange={(e) => setPkScr(Number(e.target.value) || 0.5)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <div className="col-span-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPkSex('male')}
                  className={`flex-1 min-h-[44px] border-2 border-[#2D2926] text-xs font-bold uppercase cursor-pointer ${
                    pkSex === 'male'
                      ? 'bg-[#FF5A5F] text-white shadow-[3px_3px_0px_#2D2926]'
                      : 'bg-[#F2EFEB] text-[#2D2926]'
                  }`}
                >
                  Laki-laki (× 1,0)
                </button>
                <button
                  type="button"
                  onClick={() => setPkSex('female')}
                  className={`flex-1 min-h-[44px] border-2 border-[#2D2926] text-xs font-bold uppercase cursor-pointer ${
                    pkSex === 'female'
                      ? 'bg-[#FF5A5F] text-white shadow-[3px_3px_0px_#2D2926]'
                      : 'bg-[#F2EFEB] text-[#2D2926]'
                  }`}
                >
                  Perempuan (× 0,85)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="v18-card-sm p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  CrCl (Cockcroft-Gault)
                </div>
                <div
                  className={`font-mono font-bold text-2xl mt-2 tabular-nums ${
                    crCl < 30 ? 'text-[#FF5A5F]' : crCl < 60 ? 'text-[#D97706]' : 'text-[#2C6E63]'
                  }`}
                >
                  {crCl.toFixed(1)} mL/mnt
                </div>
                <div className="text-xs text-[#2D2926]/75 mt-1">
                  {crCl < 30
                    ? 'Gangguan ginjal berat'
                    : crCl < 60
                      ? 'Penurunan fungsi ginjal sedang'
                      : 'Fungsi ginjal baik'}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#2D2926]/15 font-mono text-[11px] text-[#2D2926]/70">
                ((140 − Usia) × BB) / (72 × SCr)
              </div>
            </div>

            <div className="v18-card-sm p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  Indeks Massa Tubuh (BMI)
                </div>
                <div className="font-mono font-bold text-2xl text-[#2D2926] mt-2 tabular-nums">
                  {bmi.toFixed(1)} kg/m²
                </div>
                <div className="text-xs text-[#2D2926]/75 mt-1">
                  {bmi < 18.5
                    ? 'Berat badan kurang'
                    : bmi < 25
                      ? 'Normal'
                      : bmi < 30
                        ? 'Kelebihan berat badan'
                        : 'Obesitas'}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#2D2926]/15 font-mono text-[11px] text-[#2D2926]/70">
                BMI = BB (kg) / TB² (m²)
              </div>
            </div>

            <div className="v18-card-sm p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase text-[#FF5A5F]">
                  Berat Badan Ideal (IBW)
                </div>
                <div className="font-mono font-bold text-2xl text-[#2D2926] mt-2 tabular-nums">
                  {ibw.toFixed(1)} kg
                </div>
                <div className="text-xs text-[#2D2926]/75 mt-1">Acuan dosis obat hidrofilik</div>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-dashed border-[#2D2926]/15 font-mono text-[11px] text-[#2D2926]/70">
                Devine: {pkSex === 'male' ? '50' : '45,5'} + 2,3 × (Inci − 60)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Compounding */}
      {subTab === 'compounding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* HLB Calculator */}
          <div className="v18-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-2xl text-[#2D2926]">
                Rasio Emulgator HLB (Tween &amp; Span)
              </h3>
              <Calculator className="w-5 h-5 text-[#FF5A5F]" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">HLB Target Emulsi</span>
                <input
                  type="number"
                  step={0.1}
                  value={hlbTarget}
                  onChange={(e) => setHlbTarget(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Total Emulgator (gram)</span>
                <input
                  type="number"
                  step={0.5}
                  value={emulsifierTotalG}
                  onChange={(e) => setEmulsifierTotalG(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">HLB Tween 80</span>
                <input
                  type="number"
                  step={0.1}
                  value={hlbHigh}
                  onChange={(e) => setHlbHigh(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">HLB Span 80</span>
                <input
                  type="number"
                  step={0.1}
                  value={hlbLow}
                  onChange={(e) => setHlbLow(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
            </div>
            <div className="p-4 bg-[#FFD166]/45 border-2 border-[#2D2926] font-mono text-sm space-y-1 tabular-nums">
              <div className="font-bold text-[#2D2926]">
                Tween 80: {gramTween.toFixed(2)} g ({(fracHigh * 100).toFixed(1)}%)
              </div>
              <div className="font-bold text-[#2C6E63]">
                Span 80: {gramSpan.toFixed(2)} g ({(fracLow * 100).toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* Dilution V1.C1 = V2.C2 */}
          <div className="v18-card p-5 space-y-4">
            <h3 className="font-display font-bold text-2xl text-[#2D2926]">
              Pengenceran Kadar (V1 · C1 = V2 · C2)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Kadar Awal C1 (%)</span>
                <input
                  type="number"
                  value={c1}
                  onChange={(e) => setC1(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Kadar Target C2 (%)</span>
                <input
                  type="number"
                  value={c2}
                  onChange={(e) => setC2(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-bold text-[#2D2926]/80 block mb-1">Volume Akhir V2 (mL)</span>
                <input
                  type="number"
                  value={v2}
                  onChange={(e) => setV2(Number(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3 border-2 border-[#2D2926] bg-[#F2EFEB] focus:bg-white font-mono tabular-nums"
                />
              </label>
            </div>
            <div className="p-4 bg-[#FFD166]/45 border-2 border-[#2D2926] font-mono text-sm space-y-1 tabular-nums">
              <div className="font-bold text-[#2D2926]">
                Ambil Larutan Pekat (V1): {v1Needed.toFixed(2)} mL
              </div>
              <div className="font-bold text-[#2C6E63]">
                Tambahkan Pelarut (ad V2): {Math.max(0, v2 - v1Needed).toFixed(2)} mL
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
