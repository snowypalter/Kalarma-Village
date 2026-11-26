import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FORMULARY_DATA } from '../data/formulary';
import { DrugMonograph } from '../types/pharmacy';
import { soundFX } from '../utils/sound';

interface FormularyBookProps {
  initialDrugId?: string | null;
}

const CATEGORIES: Array<'Semua' | DrugMonograph['category']> = [
  'Semua',
  'Antibiotik',
  'Antihipertensi',
  'Antidiabetes',
  'Saluran Cerna',
  'Suportif',
  'Herbal Terstandar',
];

export const FormularyBook: React.FC<FormularyBookProps> = ({ initialDrugId = null }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'Semua' | DrugMonograph['category']>('Semua');
  const [selectedId, setSelectedId] = useState<string>(initialDrugId || FORMULARY_DATA[0].id);

  useEffect(() => {
    if (!initialDrugId) return;
    const exists = FORMULARY_DATA.some((item) => item.id === initialDrugId);
    if (exists) {
      setCategory('Semua');
      setQuery('');
      setSelectedId(initialDrugId);
    }
  }, [initialDrugId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FORMULARY_DATA.filter((item) => {
      const catOk = category === 'Semua' || item.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.genericClass.toLowerCase().includes(q) ||
        item.mechanism.toLowerCase().includes(q) ||
        item.indications.some((ind) => ind.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  const activeMonograph =
    filtered.find((f) => f.id === selectedId) || filtered[0] || FORMULARY_DATA[0];

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Header */}
      <div className="v18-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="v18-kicker mb-1.5">
              Buku Saku Formularium &amp; Herbarium Desa
            </span>
            <h2 className="font-display font-bold text-3xl text-[#2D2926]">
              Katalog Obat Modern &amp; Tanaman Obat
            </h2>
          </div>

          <div className="relative w-full sm:w-96 md:w-80">
            <Search className="w-4 h-4 text-[#2D2926] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama obat, gejala, atau penyakit..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 border-2 border-[#2D2926] bg-[#F2EFEB] text-xs sm:text-sm text-[#2D2926] placeholder:text-[#2D2926]/50 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 bg-[#F2EFEB] border-2 border-[#2D2926] p-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setCategory(cat);
              }}
              className={`min-h-[44px] px-2.5 sm:px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all flex-1 sm:flex-initial min-w-[100px] sm:min-w-auto cursor-pointer ${
                category === cat
                  ? 'bg-[#FF5A5F] text-white border-2 border-[#2D2926] shadow-[3px_3px_0px_#2D2926]'
                  : 'bg-white text-[#2D2926] border-2 border-transparent hover:border-[#2D2926]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Master-Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="v18-card-sm p-6 text-center text-sm text-[#2D2926]/70">
              Tidak ditemukan monografi yang cocok dengan kata kunci &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = activeMonograph.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedId(item.id);
                  }}
                  className={`w-full text-left p-4 sm:p-5 transition-all min-h-[52px] sm:min-h-[48px] cursor-pointer ${
                    isSelected
                      ? 'v18-card-sm bg-[#FFD166]/45'
                      : 'bg-white border-2 border-[#2D2926]/25 hover:border-[#2D2926]'
                  }`}
                >
                  <div className="font-mono text-[10px] sm:text-[11px] font-bold uppercase text-[#FF5A5F] mb-0.5">
                    {item.category} · {item.genericClass}
                  </div>
                  <div className="font-display font-bold text-lg sm:text-xl text-[#2D2926]">{item.name}</div>
                  <div className="text-xs text-[#2D2926]/70 mt-1 line-clamp-1">
                    Indikasi: {item.indications.join(', ')}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Monograph Detail */}
        {filtered.length > 0 && (
          <div className="lg:col-span-7 v18-card p-5 sm:p-6 space-y-4">
            <div className="pb-4 border-b-2 border-dashed border-[#2D2926]/20">
              <span className="v18-kicker mb-2">
                {activeMonograph.category} · {activeMonograph.genericClass}
              </span>
              <h3 className="font-display font-bold text-3xl text-[#2D2926] mt-1">
                {activeMonograph.name}
              </h3>
              <p className="text-xs font-medium text-[#2D2926]/70 mt-1">
                Indikasi Utama: {activeMonograph.indications.join(' · ')}
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#2C6E63] mb-1">
                  Mekanisme Kerja
                </h4>
                <p className="text-[#2D2926]/90 leading-relaxed">{activeMonograph.mechanism}</p>
              </div>

              <div>
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#D97706] mb-1">
                  Interaksi Obat Penting
                </h4>
                <p className="text-[#2D2926]/90 leading-relaxed">{activeMonograph.interactions}</p>
              </div>

              <div>
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-[#FF5A5F] mb-1">
                  Efek Samping &amp; Kewaspadaan
                </h4>
                <p className="text-[#2D2926]/90 leading-relaxed">{activeMonograph.sideEffects}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-[#F2EFEB] border-2 border-[#2D2926]">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#2D2926]/70 mb-1">
                    Kategori Kehamilan FDA / Fitofarmaka
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#2D2926]">
                    {activeMonograph.pregnancyCategory}
                  </div>
                </div>
                <div className="p-3.5 bg-[#F2EFEB] border-2 border-[#2D2926]">
                  <div className="font-mono text-[11px] font-bold uppercase text-[#2D2926]/70 mb-1">
                    Stabilitas &amp; Penyimpanan
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#2D2926]">
                    {activeMonograph.storageNote}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
