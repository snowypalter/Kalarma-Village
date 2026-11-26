import { WeatherType } from '../types/pharmacy';
import { CaughtFishRecord } from '../utils/saveSystem';

export interface WardrobeSkin {
  id: string;
  themeKey: 'adventurer' | 'apothecary' | 'gardener' | 'fisher' | 'festival' | 'seasonal';
  name: string;
  categoryLabel: string;
  priceCoins: number;
  requiredXp: number;
  swatchHex: string;
  trimHex: string;
  perkSummary: string;
  description: string;
}

export const WARDROBE_SKINS: WardrobeSkin[] = [
  {
    id: 'skin_apothecary',
    themeKey: 'apothecary',
    name: 'Kostum Apoteker',
    categoryLabel: 'Tema Klinik Resmi',
    priceCoins: 0,
    requiredXp: 0,
    swatchHex: '#FAF4E4',
    trimHex: '#2C6E63',
    perkSummary: 'Tampilan klasik apoteker Klinik Desa Asklepios dengan jas rapi dan lencana daun.',
    description:
      'Setelan jas apoteker krem berkerah zamrud lengkap dengan tas selempang obat dan kerah klinis.',
  },
  {
    id: 'skin_adventurer',
    themeKey: 'adventurer',
    name: 'Kostum Petualang',
    categoryLabel: 'Tema Penjelajah Rimba',
    priceCoins: 85,
    requiredXp: 0,
    swatchHex: '#4E7A45',
    trimHex: '#C68B45',
    perkSummary: 'Tampilan penjelajah tangguh lengkap dengan tunik rimba, ransel kulit, dan syal ekspedisi.',
    description:
      'Tunik hijau rimba dengan sabuk kompas kuningan, jubah bahu pelindung, dan tas perlengkapan lapangan.',
  },
  {
    id: 'skin_gardener',
    themeKey: 'gardener',
    name: 'Kostum Berkebun',
    categoryLabel: 'Tema Botani & Kebun',
    priceCoins: 95,
    requiredXp: 0,
    swatchHex: '#639E55',
    trimHex: '#E5BD67',
    perkSummary: 'Tampilan ahli kebun herbal lengkap dengan celemek botani dan topi anyaman jerami.',
    description:
      'Celemek berkebun hijau sage dengan saku bibit tanaman obat dan topi jerami berhias daun segar.',
  },
  {
    id: 'skin_fisher',
    themeKey: 'fisher',
    name: 'Kostum Nelayan',
    categoryLabel: 'Tema Dermaga Selatan',
    priceCoins: 105,
    requiredXp: 80,
    swatchHex: '#2E6799',
    trimHex: '#E8BC74',
    perkSummary: 'Tampilan pemancing tenang di kolam selatan dengan rompi tahan air dan topi nelayan.',
    description:
      'Rompi biru sungai berkerah hangat, topi bundar pelindung matahari, serta lencana kail kayu.',
  },
  {
    id: 'skin_festival',
    themeKey: 'festival',
    name: 'Kostum Festival',
    categoryLabel: 'Tema Perayaan Desa',
    priceCoins: 145,
    requiredXp: 180,
    swatchHex: '#B83B45',
    trimHex: '#F7C948',
    perkSummary: 'Busana perayaan tahunan Kalarma Village berhias bordir emas dan ornamen lentera.',
    description:
      'Haori merah marun bermotif daun emas dengan sabuk obi lebar dan hiasan lentera hangat.',
  },
  {
    id: 'skin_seasonal',
    themeKey: 'seasonal',
    name: 'Kostum Musiman',
    categoryLabel: 'Tema Musim Pancaroba',
    priceCoins: 175,
    requiredXp: 280,
    swatchHex: '#5B4B8A',
    trimHex: '#F5E6CA',
    perkSummary: 'Mantel tebal berlapis bulu lembut untuk menghadapi angin pancaroba dan kabut malam.',
    description:
      'Mantel musim dingin bernuansa lembayung hangat dengan kerah bulu krem dan syal rajut tebal.',
  },
];

export interface WardrobeOutfit {
  id: string;
  name: string;
  slotLabel: string;
  priceCoins: number;
  requiredXp: number;
  swatchHex: string;
  trimHex: string;
  perkSummary: string;
  description: string;
}

export const WARDROBE_OUTFITS: WardrobeOutfit[] = [
  {
    id: 'classic_coat',
    name: 'Jas Apoteker Klasik',
    slotLabel: 'Busana Standar',
    priceCoins: 0,
    requiredXp: 0,
    swatchHex: '#FAF4E4',
    trimHex: '#2C6E63',
    perkSummary: 'Seragam resmi Klinik Desa Asklepios yang nyaman dipakai sepanjang hari.',
    description:
      'Jas linen krem berkerah rapi dengan saku catatan dosis dan pin daun hijau desa.',
  },
  {
    id: 'adventurer_jerkin',
    name: 'Rompi Penjelajah Kalarma',
    slotLabel: 'Busana Petualang',
    priceCoins: 75,
    requiredXp: 0,
    swatchHex: '#4F7742',
    trimHex: '#D8A24A',
    perkSummary: 'Ringan dipakai berjalan cepat menyusuri jembatan sungai dan lereng barat.',
    description:
      'Rompi kulit lembut hijau hutan dengan jubah bahu pendek dan sabuk pengait tas.',
  },
  {
    id: 'botanist_cloak',
    name: 'Mantel Botani Mbah Sekar',
    slotLabel: 'Busana Berkebun',
    priceCoins: 80,
    requiredXp: 0,
    swatchHex: '#3B826E',
    trimHex: '#FFD166',
    perkSummary: 'Bonus suasana kebun herbal & cocok dipakai saat panen fitofarmaka.',
    description:
      'Jubah hijau lumut berlapis katun tipis dengan sulaman daun meniran emas di bagian bahu.',
  },
  {
    id: 'river_angler_vest',
    name: 'Rompi Penjaga Dermaga',
    slotLabel: 'Busana Nelayan',
    priceCoins: 95,
    requiredXp: 100,
    swatchHex: '#2563EB',
    trimHex: '#E8BC74',
    perkSummary: 'Dilengkapi kantong umpan anti-lembap untuk memancing di Kolam Selatan.',
    description:
      'Rompi biru telaga dengan saku kulit tahan air yang biasa dipakai pemancing Kalarma.',
  },
  {
    id: 'festival_haori',
    name: 'Haori Lentera Senja',
    slotLabel: 'Busana Festival',
    priceCoins: 135,
    requiredXp: 160,
    swatchHex: '#B93844',
    trimHex: '#FDE68A',
    perkSummary: 'Busana perayaan desa dengan potongan lengan lebar dan sabuk kain keemasan.',
    description:
      'Luaran kain tenun merah hangat berpadu ikat pinggang emas untuk festival lentera desa.',
  },
  {
    id: 'twilight_alchemist',
    name: 'Jubah Alkemis Senja',
    slotLabel: 'Busana Lanjutan',
    priceCoins: 160,
    requiredXp: 250,
    swatchHex: '#9A3412',
    trimHex: '#FDE68A',
    perkSummary: 'Simbol ketekunan meracik obat rasional dan pengawasan efek samping.',
    description:
      'Mantel hangat warna kayu mahoni dengan ikat pinggang tembaga dan kantong lumpang mini.',
  },
  {
    id: 'seasonal_parka',
    name: 'Mantel Kabut Musiman',
    slotLabel: 'Busana Musiman',
    priceCoins: 185,
    requiredXp: 320,
    swatchHex: '#5A4A82',
    trimHex: '#F8EFE0',
    perkSummary: 'Menjaga kehangatan tubuh saat bertugas ronda malam di cuaca Kabut Dingin.',
    description:
      'Parka hangat berlapis kerah bulu krem dan mantel pendek penahan angin bukit.',
  },
  {
    id: 'grand_apothecary',
    name: 'Regalia Tabib Agung',
    slotLabel: 'Busana Kehormatan',
    priceCoins: 260,
    requiredXp: 500,
    swatchHex: '#16302B',
    trimHex: '#FFD166',
    perkSummary: 'Lambang kehormatan tertinggi bagi apoteker pelindung warga Kalarma Village.',
    description:
      'Jubah zamrud gelap berhias bordir daun keemasan dan medali kehormatan desa.',
  },
];

export interface WardrobeAccessory {
  id: string;
  name: string;
  slotLabel: string;
  priceCoins: number;
  requiredXp: number;
  swatchHex: string;
  description: string;
}

export const WARDROBE_ACCESSORIES: WardrobeAccessory[] = [
  {
    id: 'acc_round_glasses',
    name: 'Kacamata Kuningan',
    slotLabel: 'Aksesoris Wajah',
    priceCoins: 0,
    requiredXp: 0,
    swatchHex: '#D99B38',
    description: 'Bingkai kacamata bundar klasik untuk ketelitian membaca resep dan dosis.',
  },
  {
    id: 'acc_straw_hat',
    name: 'Topi Jerami Kebun',
    slotLabel: 'Aksesoris Kepala',
    priceCoins: 55,
    requiredXp: 0,
    swatchHex: '#D9B675',
    description: 'Topi anyaman lebar berhias pita hijau untuk menemani panen di Kebun Herbal.',
  },
  {
    id: 'acc_angler_hat',
    name: 'Topi Pemancing Sungai',
    slotLabel: 'Aksesoris Kepala',
    priceCoins: 65,
    requiredXp: 50,
    swatchHex: '#2E6799',
    description: 'Topi bundar tahan gerimis dengan pin kail kecil di bagian tepi.',
  },
  {
    id: 'acc_explorer_bag',
    name: 'Ransel Petualang Kulit',
    slotLabel: 'Aksesoris Punggung',
    priceCoins: 75,
    requiredXp: 0,
    swatchHex: '#7D4927',
    description: 'Ransel kanvas dan kulit dengan gulungan tikar kecil untuk ekspedisi desa.',
  },
  {
    id: 'acc_herb_crown',
    name: 'Mahkota Daun & Bunga',
    slotLabel: 'Aksesoris Kepala',
    priceCoins: 85,
    requiredXp: 100,
    swatchHex: '#76B947',
    description: 'Rangkaian daun meniran dan bunga liar merah muda di atas telinga.',
  },
  {
    id: 'acc_knit_scarf',
    name: 'Syal Rajut Musiman',
    slotLabel: 'Aksesoris Leher',
    priceCoins: 90,
    requiredXp: 140,
    swatchHex: '#C84B52',
    description: 'Syal rajut wol hangat dengan ujung menjuntai untuk angin pancaroba.',
  },
  {
    id: 'acc_festival_mask',
    name: 'Topeng Rubah Festival',
    slotLabel: 'Aksesoris Kepala',
    priceCoins: 115,
    requiredXp: 200,
    swatchHex: '#F7EFE2',
    description: 'Topeng kayu ukir tradisional yang disematkan di sisi kepala saat festival.',
  },
  {
    id: 'acc_apothecary_lantern',
    name: 'Lentera Apoteker Mini',
    slotLabel: 'Aksesoris Tangan',
    priceCoins: 130,
    requiredXp: 260,
    swatchHex: '#FDE68A',
    description: 'Lentera kuningan hangat yang menerangi langkah saat patroli malam.',
  },
];

export interface HerbalEncyclopediaEntry {
  id: string;
  itemId: string;
  formularyId?: string;
  name: string;
  latinName: string;
  category: string;
  habitat: string;
  activeCompounds: string;
  clinicalUse: string;
  caution: string;
  bestWeather: WeatherType;
  harvestCoinsValue: number;
}

export const HERBAL_ENCYCLOPEDIA: HerbalEncyclopediaEntry[] = [
  {
    id: 'meniran',
    itemId: 'meniran_leaf',
    formularyId: 'meniran',
    name: 'Meniran Hijau',
    latinName: 'Phyllanthus niruri',
    category: 'Fitofarmaka Imunomodulator',
    habitat: 'Petak Lembap Barat · Kebun Mbah Sekar',
    activeCompounds: 'Filantin, hipofilantin, flavonoid kuersetin',
    clinicalUse:
      'Membantu memodulasi sistem imun tubuh pada pemulihan ISPA, faringitis viral, dan kelelahan.',
    caution: 'Waspada bila pasien menggunakan obat imunosupresan atau memiliki autoimun aktif.',
    bestWeather: WeatherType.CERAH_HANGAT,
    harvestCoinsValue: 18,
  },
  {
    id: 'temulawak',
    itemId: 'temulawak_root',
    formularyId: 'temulawak',
    name: 'Temulawak Rimpang',
    latinName: 'Curcuma xanthorrhiza',
    category: 'Obat Herbal Terstandar (OHT)',
    habitat: 'Petak Tanah Gembur · Kebun Mbah Sekar',
    activeCompounds: 'Kurkuminoid, xanthorrhizol, minyak atsiri',
    clinicalUse:
      'Hepatoprotektor alami, meredakan ketidaknyamanan dispepsia ringan, serta membantu nafsu makan.',
    caution: 'Konsultasikan bila dikonsumsi bersamaan dengan antikoagulan atau pasien batu empedu.',
    bestWeather: WeatherType.CERAH_HANGAT,
    harvestCoinsValue: 22,
  },
  {
    id: 'jahe_merah',
    itemId: 'red_ginger',
    name: 'Jahe Merah Hangat',
    latinName: 'Zingiber officinale var. rubrum',
    category: 'Jamu Penghangat & Pencernaan',
    habitat: 'Lereng Berbatu Selatan · Kebun Mbah Sekar',
    activeCompounds: 'Gingerol, shogaol, zingeron',
    clinicalUse:
      'Meredakan rasa mual ringan, tenggorokan gatal akibat pancaroba, dan kembung.',
    caution: 'Hindari dosis pekat sebelum operasi atau bersama pengencer darah dosis tinggi.',
    bestWeather: WeatherType.ANGIN_PANCAROBA,
    harvestCoinsValue: 20,
  },
  {
    id: 'pegagan',
    itemId: 'pegagan_leaf',
    name: 'Daun Pegagan',
    latinName: 'Centella asiatica',
    category: 'Herbal Pemulihan Jaringan',
    habitat: 'Tepi Sumur Batu · Kebun Mbah Sekar',
    activeCompounds: 'Asiatikosida, madekasosida, triterpenoid',
    clinicalUse:
      'Mendukung penyembuhan jaringan kulit superfisial serta melancarkan mikrosirkulasi tepi.',
    caution: 'Batasi konsumsi oral jangka panjang > 6 minggu tanpa evaluasi tenaga kesehatan.',
    bestWeather: WeatherType.HUJAN_LEMBAP,
    harvestCoinsValue: 24,
  },
  {
    id: 'jambu_biji',
    itemId: 'guava_leaf',
    name: 'Pucuk Daun Jambu Biji',
    latinName: 'Psidium guajava',
    category: 'Herbal Saluran Cerna',
    habitat: 'Pagar Timur Kebun Herbal',
    activeCompounds: 'Tanin, kuersetin, polifenol',
    clinicalUse:
      'Membantu mengurangi frekuensi diare non-spesifik ringan pendamping rehidrasi oral.',
    caution: 'Jangan menunda rujukan antibiotik/oralit bila muncul dehidrasi berat atau demam tinggi.',
    bestWeather: WeatherType.HUJAN_LEMBAP,
    harvestCoinsValue: 16,
  },
  {
    id: 'kumis_kucing',
    itemId: 'cat_whiskers',
    name: 'Kumis Kucing',
    latinName: 'Orthosiphon aristatus',
    category: 'Herbal Diuretik Alami',
    habitat: 'Terace Utara Dekat Kincir',
    activeCompounds: 'Sinensetin, orthosifonin, garam kalium',
    clinicalUse:
      'Membantu melancarkan pengeluaran urine ringan sebagai pendamping hidrasi yang cukup.',
    caution: 'Tidak untuk penderita gagal ginjal berat atau pembatasan cairan ketat.',
    bestWeather: WeatherType.KABUT_MALAM,
    harvestCoinsValue: 25,
  },
];

export interface FishingSpeciesEntry {
  id: string;
  itemId: string;
  name: string;
  rarity: 'Umum' | 'Langka' | 'Istimewa';
  minCm: number;
  maxCm: number;
  preferredWeather: WeatherType;
  sellCoins: number;
  habitatNote: string;
}

export const FISHING_SPECIES: FishingSpeciesEntry[] = [
  {
    id: 'nila_mata_air',
    itemId: 'fish_nila',
    name: 'Nila Mata Air',
    rarity: 'Umum',
    minCm: 16,
    maxCm: 28,
    preferredWeather: WeatherType.CERAH_HANGAT,
    sellCoins: 18,
    habitatNote: 'Sering berenang di air dangkal dekat tiang dermaga saat siang cerah.',
  },
  {
    id: 'koi_kalarma',
    itemId: 'fish_koi',
    name: 'Koi Jingga Kalarma',
    rarity: 'Langka',
    minCm: 24,
    maxCm: 42,
    preferredWeather: WeatherType.CERAH_HANGAT,
    sellCoins: 36,
    habitatNote: 'Ikan hias sungai yang suka berputar di bawah lentera kayu dermaga.',
  },
  {
    id: 'lele_lumut',
    itemId: 'fish_lele',
    name: 'Lele Lumut Batu',
    rarity: 'Umum',
    minCm: 20,
    maxCm: 35,
    preferredWeather: WeatherType.HUJAN_LEMBAP,
    sellCoins: 22,
    habitatNote: 'Aktif mencari makan di dekat batu berlumut ketika gerimis atau hujan turun.',
  },
  {
    id: 'gurami_teratai',
    itemId: 'fish_gurami',
    name: 'Gurami Daun Teratai',
    rarity: 'Langka',
    minCm: 26,
    maxCm: 48,
    preferredWeather: WeatherType.ANGIN_PANCAROBA,
    sellCoins: 42,
    habitatNote: 'Berlindung di bawah bantalan teratai hijau di tengah kolam selatan.',
  },
  {
    id: 'udang_kristal',
    itemId: 'fish_udang',
    name: 'Udang Kristal Jernih',
    rarity: 'Langka',
    minCm: 8,
    maxCm: 15,
    preferredWeather: WeatherType.HUJAN_LEMBAP,
    sellCoins: 30,
    habitatNote: 'Penanda ekosistem kolam desa bersih dan bebas limbah obat.',
  },
  {
    id: 'belut_senja',
    itemId: 'fish_belut',
    name: 'Belut Emas Senja',
    rarity: 'Istimewa',
    minCm: 38,
    maxCm: 65,
    preferredWeather: WeatherType.KABUT_MALAM,
    sellCoins: 65,
    habitatNote: 'Muncul perlahan saat kabut malam turun menyelimuti permukaan air.',
  },
];

export interface InventoryItemDef {
  id: string;
  name: string;
  category: 'Herbal' | 'Ikan' | 'Perlengkapan' | 'Racikan';
  sellCoins: number;
  description: string;
  usableAction?: 'brew_tonic' | 'restore_clinic_note' | 'bait';
}

export const INVENTORY_CATALOG: Record<string, InventoryItemDef> = {
  meniran_leaf: {
    id: 'meniran_leaf',
    name: 'Daun Meniran Segar',
    category: 'Herbal',
    sellCoins: 18,
    description: 'Bahan dasar fitofarmaka peningkat daya tahan tubuh dari Kebun Mbah Sekar.',
    usableAction: 'brew_tonic',
  },
  temulawak_root: {
    id: 'temulawak_root',
    name: 'Rimpang Temulawak',
    category: 'Herbal',
    sellCoins: 22,
    description: 'Rimpang keemasan pelindung fungsi hati dan kenyamanan lambung.',
    usableAction: 'brew_tonic',
  },
  red_ginger: {
    id: 'red_ginger',
    name: 'Rimpang Jahe Merah',
    category: 'Herbal',
    sellCoins: 20,
    description: 'Menghangatkan tenggorokan saat angin pancaroba melanda desa.',
  },
  pegagan_leaf: {
    id: 'pegagan_leaf',
    name: 'Daun Pegagan Tepi Sumur',
    category: 'Herbal',
    sellCoins: 24,
    description: 'Daun herbal pendukung regenerasi jaringan dan sirkulasi tepi.',
  },
  guava_leaf: {
    id: 'guava_leaf',
    name: 'Pucuk Daun Jambu',
    category: 'Herbal',
    sellCoins: 16,
    description: 'Sediaan tradisional pendamping rehidrasi untuk gangguan cerna ringan.',
  },
  cat_whiskers: {
    id: 'cat_whiskers',
    name: 'Daun Kumis Kucing',
    category: 'Herbal',
    sellCoins: 25,
    description: 'Herbal diuretik ringan untuk menjaga kesehatan saluran kemih.',
  },
  immun_tonic: {
    id: 'immun_tonic',
    name: 'Eliksir Imun Asklepios',
    category: 'Racikan',
    sellCoins: 48,
    description:
      'Ramuan racikan Meniran + Temulawak. Dapat digunakan untuk meraih +25 XP studi klinis atau dijual di Toko.',
    usableAction: 'restore_clinic_note',
  },
  wooden_bait: {
    id: 'wooden_bait',
    name: 'Umpan Pelet Alami',
    category: 'Perlengkapan',
    sellCoins: 6,
    description: 'Digunakan setiap kali melempar kail di Dermaga Kolam Pemancingan.',
    usableAction: 'bait',
  },
  herbal_seed_pack: {
    id: 'herbal_seed_pack',
    name: 'Paket Bibit Kebun',
    category: 'Perlengkapan',
    sellCoins: 12,
    description: 'Memperkaya panen tanaman obat baru di Kebun Herbal Mbah Sekar.',
  },
  clinical_spuit: {
    id: 'clinical_spuit',
    name: 'Spuit Oral Kalibrasi 5 mL',
    category: 'Perlengkapan',
    sellCoins: 15,
    description: 'Alat ukur presisi resep sirup anak agar dosis tepat hingga 0,1 mL.',
  },
  fish_nila: {
    id: 'fish_nila',
    name: 'Nila Mata Air',
    category: 'Ikan',
    sellCoins: 18,
    description: 'Tangkapan segar dari Kolam Pemancingan Selatan.',
  },
  fish_koi: {
    id: 'fish_koi',
    name: 'Koi Jingga Kalarma',
    category: 'Ikan',
    sellCoins: 36,
    description: 'Ikan koi cerah bernilai tinggi di pasar desa.',
  },
  fish_lele: {
    id: 'fish_lele',
    name: 'Lele Lumut Batu',
    category: 'Ikan',
    sellCoins: 22,
    description: 'Ikan tangkapan cuaca hujan dengan sisik licin abu-kehijauan.',
  },
  fish_gurami: {
    id: 'fish_gurami',
    name: 'Gurami Daun Teratai',
    category: 'Ikan',
    sellCoins: 42,
    description: 'Gurami besar penghuni teratai kolam desa.',
  },
  fish_udang: {
    id: 'fish_udang',
    name: 'Udang Kristal Jernih',
    category: 'Ikan',
    sellCoins: 30,
    description: 'Udang bening indikator mata air desa yang sehat.',
  },
  fish_belut: {
    id: 'fish_belut',
    name: 'Belut Emas Senja',
    category: 'Ikan',
    sellCoins: 65,
    description: 'Tangkapan langka yang hanya keluar saat kabut malam.',
  },
};

export interface ShopItem {
  id: string;
  itemId: string;
  name: string;
  category: 'Perlengkapan' | 'Herbal' | 'Racikan';
  priceCoins: number;
  quantityGranted: number;
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'buy_bait_3',
    itemId: 'wooden_bait',
    name: 'Umpan Pelet Alami (3 pcs)',
    category: 'Perlengkapan',
    priceCoins: 20,
    quantityGranted: 3,
    description: 'Bekal memancing di Dermaga Kolam Selatan untuk mengisi Koleksi Ikan.',
  },
  {
    id: 'buy_seed_2',
    itemId: 'herbal_seed_pack',
    name: 'Paket Bibit Kebun Herbal (2 pcs)',
    category: 'Perlengkapan',
    priceCoins: 30,
    quantityGranted: 2,
    description: 'Menumbuhkan varietas tanaman obat langka saat panen di Kebun Herbal.',
  },
  {
    id: 'buy_meniran',
    itemId: 'meniran_leaf',
    name: 'Daun Meniran Kering Terstandar',
    category: 'Herbal',
    priceCoins: 24,
    quantityGranted: 1,
    description: 'Simpanan daun meniran siap racik untuk Eliksir Imun Asklepios.',
  },
  {
    id: 'buy_temulawak',
    itemId: 'temulawak_root',
    name: 'Rimpang Temulawak Pilihan',
    category: 'Herbal',
    priceCoins: 28,
    quantityGranted: 1,
    description: 'Rimpang pilihan berkualitas untuk racikan hepatoprotektor.',
  },
  {
    id: 'buy_spuit',
    itemId: 'clinical_spuit',
    name: 'Spuit Oral Kalibrasi 5 mL',
    category: 'Perlengkapan',
    priceCoins: 35,
    quantityGranted: 1,
    description: 'Perlengkapan standar konseling dosis pediatrik di Klinik Desa.',
  },
  {
    id: 'buy_tonic',
    itemId: 'immun_tonic',
    name: 'Eliksir Imun Asklepios Siap Pakai',
    category: 'Racikan',
    priceCoins: 60,
    quantityGranted: 1,
    description: 'Sediaan racik lengkap dari Apotek Guru Lios (+25 XP bila digunakan).',
  },
];

export interface ExpansionPlotDef {
  id: string;
  name: string;
  zoneLabel: string;
  costCoins: number;
  requiredCases: number;
  perkLabel: string;
  description: string;
}

export const EXPANSION_PLOTS: ExpansionPlotDef[] = [
  {
    id: 'botanical_pavilion',
    name: 'Paviliun Pengeringan Herbal',
    zoneLabel: 'Kebun Herbal Barat',
    costCoins: 90,
    requiredCases: 1,
    perkLabel: '+1 herbal tambahan setiap panen kebun',
    description:
      'Rumah kaca bambu terbuka di tepi kebun Mbah Sekar untuk mengeringkan simplisia tanaman obat.',
  },
  {
    id: 'south_pier_upgrade',
    name: 'Lampu Lentera & Kursi Dermaga',
    zoneLabel: 'Kolam Pemancingan Selatan',
    costCoins: 110,
    requiredCases: 2,
    perkLabel: 'Peluang lebih besar menangkap ikan Langka & Istimewa',
    description:
      'Memperpanjang dermaga kayu dan menambah lentera pemikat ikan di perairan selatan.',
  },
  {
    id: 'clinic_herb_wing',
    name: 'Sayap Konseling & Peracikan Cepat',
    zoneLabel: 'Klinik Desa Asklepios',
    costCoins: 150,
    requiredCases: 4,
    perkLabel: '+15 Koin Daun tambahan setiap kali menyembuhkan pasien',
    description:
      'Ruang konseling kayu hangat dengan rak formularium dan timbangan digital presisi.',
  },
  {
    id: 'eastern_observatory',
    name: 'Paviliun Botani Kavling Timur',
    zoneLabel: 'Area Perluasan Lahan Timur',
    costCoins: 220,
    requiredCases: 6,
    perkLabel: 'Membuka seluruh proyek perluasan & +100 XP Kehormatan Desa',
    description:
      'Mengubah lahan kavling timur menjadi pusat edukasi apoteker muda dan taman komunitas.',
  },
];

export interface AchievementCheckContext {
  completedCases: number;
  xp: number;
  discoveredHerbs: number;
  uniqueFishCaught: number;
  totalFishCaught: number;
  unlockedOutfits: number;
  unlockedExpansions: number;
  upgradedBuildings: number;
}

export interface VillageAchievementDef {
  id: string;
  title: string;
  category: 'Klinik' | 'Herbal' | 'Pancing' | 'Desa';
  description: string;
  rewardCoins: number;
  targetLabel: string;
  progressValue: (ctx: AchievementCheckContext) => number;
  targetValue: number;
}

export const VILLAGE_ACHIEVEMENTS: VillageAchievementDef[] = [
  {
    id: 'ach_first_case',
    title: 'Langkah Perdana Apoteker',
    category: 'Klinik',
    description: 'Menuntaskan kasus pasien pertama di Klinik Desa Asklepios.',
    rewardCoins: 45,
    targetLabel: '1 Kasus',
    progressValue: (ctx) => ctx.completedCases,
    targetValue: 1,
  },
  {
    id: 'ach_five_cases',
    title: 'Penjaga Kesehatan Kalarma',
    category: 'Klinik',
    description: 'Berhasil menyembuhkan 5 warga desa dengan terapi rasional.',
    rewardCoins: 90,
    targetLabel: '5 Kasus',
    progressValue: (ctx) => ctx.completedCases,
    targetValue: 5,
  },
  {
    id: 'ach_herbal_catalog',
    title: 'Ahli Botani Mbah Sekar',
    category: 'Herbal',
    description: 'Mengumpulkan dan mengenali seluruh 6 jenis tanaman di Ensiklopedia Herbal.',
    rewardCoins: 80,
    targetLabel: '6 Herbal',
    progressValue: (ctx) => ctx.discoveredHerbs,
    targetValue: 6,
  },
  {
    id: 'ach_angler_start',
    title: 'Pemancing Tenang Dermaga',
    category: 'Pancing',
    description: 'Menangkap 3 spesies ikan berbeda di Kolam Pemancingan Selatan.',
    rewardCoins: 75,
    targetLabel: '3 Spesies',
    progressValue: (ctx) => ctx.uniqueFishCaught,
    targetValue: 3,
  },
  {
    id: 'ach_wardrobe_collector',
    title: 'Kolektor Busana Apoteker',
    category: 'Desa',
    description: 'Memiliki minimal 3 busana berbeda di Lemari Kostum Karakter.',
    rewardCoins: 70,
    targetLabel: '3 Busana',
    progressValue: (ctx) => ctx.unlockedOutfits,
    targetValue: 3,
  },
  {
    id: 'ach_village_builder',
    title: 'Arsitek Kalarma Village',
    category: 'Desa',
    description: 'Menyelesaikan minimal 2 proyek pembangunan di Manajemen Perluasan Lahan.',
    rewardCoins: 110,
    targetLabel: '2 Proyek',
    progressValue: (ctx) => ctx.unlockedExpansions,
    targetValue: 2,
  },
  {
    id: 'ach_building_master',
    title: 'Renovator Desa Kalarma',
    category: 'Desa',
    description: 'Meningkatkan minimal 2 bangunan desa ke Level 2 atau lebih tinggi.',
    rewardCoins: 100,
    targetLabel: '2 Bangunan',
    progressValue: (ctx) => ctx.upgradedBuildings,
    targetValue: 2,
  },
];

export type UpgradableBuildingId = 'clinic' | 'garden' | 'pond' | 'shop' | 'boutique';

export interface BuildingUpgradeTier {
  level: 2 | 3;
  title: string;
  costCoins: number;
  requiredCases: number;
  bonusXp: number;
  perkSummary: string;
}

export interface BuildingUpgradeDef {
  id: UpgradableBuildingId;
  name: string;
  zoneLabel: string;
  baseSummary: string;
  tiers: [BuildingUpgradeTier, BuildingUpgradeTier];
}

export const BUILDING_UPGRADES: BuildingUpgradeDef[] = [
  {
    id: 'clinic',
    name: 'Klinik Desa Asklepios',
    zoneLabel: 'Zona Medis Utama',
    baseSummary: 'Level 1: Meja triase standar dan konseling pasien desa.',
    tiers: [
      {
        level: 2,
        title: 'Ruang Racik Steril & Konseling Privat',
        costCoins: 100,
        requiredCases: 1,
        bonusXp: 35,
        perkSummary: '+15 Koin Daun & +15 XP ekstra setiap menuntaskan kasus pasien.',
      },
      {
        level: 3,
        title: 'Pusat Farmasi Klinis Terakreditasi',
        costCoins: 190,
        requiredCases: 4,
        bonusXp: 70,
        perkSummary: '+30 Koin Daun & +30 XP ekstra setiap menuntaskan kasus pasien.',
      },
    ],
  },
  {
    id: 'garden',
    name: 'Kebun Herbal Mbah Sekar',
    zoneLabel: 'Kebun Botani Barat',
    baseSummary: 'Level 1: 6 petak tanaman obat dengan sumur batu alami.',
    tiers: [
      {
        level: 2,
        title: 'Sistem Irigasi Bambu & Kompos',
        costCoins: 85,
        requiredCases: 1,
        bonusXp: 30,
        perkSummary: '+1 hasil panen herbal & +4 XP tambahan setiap panen di kebun.',
      },
      {
        level: 3,
        title: 'Rumah Kaca Fitofarmaka Unggul',
        costCoins: 170,
        requiredCases: 3,
        bonusXp: 60,
        perkSummary: '+2 hasil panen herbal & +8 XP tambahan setiap panen di kebun.',
      },
    ],
  },
  {
    id: 'pond',
    name: 'Kolam Pemancingan Selatan',
    zoneLabel: 'Dermaga Kayu Selatan',
    baseSummary: 'Level 1: Dermaga pemancingan standar tepi kolam desa.',
    tiers: [
      {
        level: 2,
        title: 'Pelampung Kayu & Umpan Wangi',
        costCoins: 90,
        requiredCases: 1,
        bonusXp: 30,
        perkSummary: 'Peluang ikan Langka/Istimewa naik + Bonus +6 Koin per tangkapan.',
      },
      {
        level: 3,
        title: 'Gazebo Pemancing & Lentera Air',
        costCoins: 175,
        requiredCases: 3,
        bonusXp: 60,
        perkSummary: 'Peluang ikan Istimewa maksimal + Bonus +14 Koin per tangkapan.',
      },
    ],
  },
  {
    id: 'shop',
    name: 'Toko & Apotek Guru Lios',
    zoneLabel: 'Pasar Logistik Timur',
    baseSummary: 'Level 1: Kios jual-beli umpan, bibit, dan hasil panen desa.',
    tiers: [
      {
        level: 2,
        title: 'Gudang Logistik & Timbangan Digital',
        costCoins: 95,
        requiredCases: 2,
        bonusXp: 35,
        perkSummary: 'Diskon 10% harga beli barang & harga jual panen/ikan naik +15%.',
      },
      {
        level: 3,
        title: 'Balai Niaga Apoteker Kalarma',
        costCoins: 180,
        requiredCases: 5,
        bonusXp: 70,
        perkSummary: 'Diskon 20% harga beli barang & harga jual panen/ikan naik +30%.',
      },
    ],
  },
  {
    id: 'boutique',
    name: 'Butik Busana & Wardrobe',
    zoneLabel: 'Studio Jahit Kalarma',
    baseSummary: 'Level 1: Ruang coba 360° untuk skin, busana, dan aksesoris.',
    tiers: [
      {
        level: 2,
        title: 'Meja Pola & Pewarna Kain Alami',
        costCoins: 85,
        requiredCases: 2,
        bonusXp: 30,
        perkSummary: 'Diskon 10% Koin Daun untuk membuka seluruh Skin, Busana & Aksesoris.',
      },
      {
        level: 3,
        title: 'Atelier Adibusana Kerajaan Rimba',
        costCoins: 165,
        requiredCases: 5,
        bonusXp: 65,
        perkSummary: 'Diskon 20% Koin Daun untuk membuka seluruh Skin, Busana & Aksesoris.',
      },
    ],
  },
];

export function getClinicUpgradeBonus(clinicLevel: number): { bonusCoins: number; bonusXp: number } {
  if (clinicLevel >= 3) return { bonusCoins: 30, bonusXp: 30 };
  if (clinicLevel >= 2) return { bonusCoins: 15, bonusXp: 15 };
  return { bonusCoins: 0, bonusXp: 0 };
}

export function getGardenUpgradeBonus(gardenLevel: number): { extraYield: number; extraXp: number } {
  if (gardenLevel >= 3) return { extraYield: 2, extraXp: 8 };
  if (gardenLevel >= 2) return { extraYield: 1, extraXp: 4 };
  return { extraYield: 0, extraXp: 0 };
}

export function getPondUpgradeBonus(pondLevel: number): { rareWeightBonus: number; coinBonus: number } {
  if (pondLevel >= 3) return { rareWeightBonus: 3, coinBonus: 14 };
  if (pondLevel >= 2) return { rareWeightBonus: 1, coinBonus: 6 };
  return { rareWeightBonus: 0, coinBonus: 0 };
}

export function getShopTradeModifiers(shopLevel: number): {
  discountRate: number;
  sellBonusRate: number;
} {
  if (shopLevel >= 3) return { discountRate: 0.2, sellBonusRate: 0.3 };
  if (shopLevel >= 2) return { discountRate: 0.1, sellBonusRate: 0.15 };
  return { discountRate: 0, sellBonusRate: 0 };
}

export function getBoutiqueDiscountRate(boutiqueLevel: number): number {
  if (boutiqueLevel >= 3) return 0.2;
  if (boutiqueLevel >= 2) return 0.1;
  return 0;
}

export function applyDiscountPrice(basePrice: number, discountRate: number): number {
  if (basePrice <= 0 || discountRate <= 0) return basePrice;
  return Math.max(1, Math.round(basePrice * (1 - discountRate)));
}

export function applySellBonusPrice(baseSell: number, sellBonusRate: number): number {
  if (baseSell <= 0 || sellBonusRate <= 0) return baseSell;
  return Math.max(baseSell, Math.round(baseSell * (1 + sellBonusRate)));
}

export interface DailyQuestDef {
  id: string;
  title: string;
  category: 'Klinik' | 'Herbal' | 'Pancing' | 'Apotek';
  description: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  metricKey: 'casesDone' | 'herbsHarvested' | 'fishCaught' | 'shopActions';
  actionTab: 'quest' | 'herbal' | 'fishing' | 'inventory';
  actionLabel: string;
}

export const DAILY_QUESTS: DailyQuestDef[] = [
  {
    id: 'dq_clinic_case',
    title: 'Pelayanan Pasien Harian',
    category: 'Klinik',
    description: 'Selesaikan minimal 1 penanganan pasien di Klinik Desa Asklepios hari ini.',
    target: 1,
    rewardCoins: 45,
    rewardXp: 30,
    metricKey: 'casesDone',
    actionTab: 'quest',
    actionLabel: 'Buka Kasus',
  },
  {
    id: 'dq_herbal_harvest',
    title: 'Panen Simplisia Segar',
    category: 'Herbal',
    description: 'Panen 2 tanaman obat dari petak Kebun Herbal Mbah Sekar hari ini.',
    target: 2,
    rewardCoins: 35,
    rewardXp: 25,
    metricKey: 'herbsHarvested',
    actionTab: 'herbal',
    actionLabel: 'Ke Kebun',
  },
  {
    id: 'dq_pond_fishing',
    title: 'Pancingan Mata Air Selatan',
    category: 'Pancing',
    description: 'Tangkap 2 ikan sungai di Dermaga Kolam Pemancingan hari ini.',
    target: 2,
    rewardCoins: 35,
    rewardXp: 25,
    metricKey: 'fishCaught',
    actionTab: 'fishing',
    actionLabel: 'Memancing',
  },
  {
    id: 'dq_pharmacy_ops',
    title: 'Logistik & Peracikan Apotek',
    category: 'Apotek',
    description: 'Lakukan 2 aktivitas racik eliksir, jual/beli di Toko, atau upgrade bangunan hari ini.',
    target: 2,
    rewardCoins: 30,
    rewardXp: 25,
    metricKey: 'shopActions',
    actionTab: 'inventory',
    actionLabel: 'Buka Tas & Racik',
  },
];

export function countTotalFish(caughtFish: Record<string, CaughtFishRecord>): number {
  return Object.values(caughtFish).reduce((sum, rec) => sum + rec.count, 0);
}
