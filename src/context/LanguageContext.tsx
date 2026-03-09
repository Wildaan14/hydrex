import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Language = "id" | "en";

interface Translations {
  [key: string]: {
    id: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { id: "Beranda", en: "Home" },
  marketplace: { id: "Marketplace", en: "Marketplace" },
  projects: { id: "Proyek", en: "Projects" },
  calculator: { id: "Kalkulator", en: "Calculator" },
  forum: { id: "Forum", en: "Forum" },
  news: { id: "Berita", en: "News" },
  reports: { id: "Laporan", en: "Reports" },
  mrvDashboard: { id: "MRV Dashboard", en: "MRV Dashboard" },
  esgScoring: { id: "ESG Scoring", en: "ESG Scoring" },
  adminPanel: { id: "Admin Panel", en: "Admin Panel" },

  // Auth
  login: { id: "Masuk", en: "Login" },
  logout: { id: "Keluar", en: "Logout" },
  register: { id: "Daftar", en: "Register" },
  email: { id: "Email", en: "Email" },
  password: { id: "Kata Sandi", en: "Password" },
  confirmPassword: { id: "Konfirmasi Kata Sandi", en: "Confirm Password" },
  name: { id: "Nama", en: "Name" },
  fullName: { id: "Nama Lengkap", en: "Full Name" },

  // User
  profile: { id: "Profil", en: "Profile" },
  settings: { id: "Pengaturan", en: "Settings" },
  myProfile: { id: "Profil Saya", en: "My Profile" },

  // Roles
  administrator: { id: "Administrator", en: "Administrator" },
  company: { id: "Perusahaan", en: "Company" },
  individual: { id: "Individual", en: "Individual" },

  // Common
  search: { id: "Cari", en: "Search" },
  save: { id: "Simpan", en: "Save" },
  cancel: { id: "Batal", en: "Cancel" },
  delete: { id: "Hapus", en: "Delete" },
  edit: { id: "Edit", en: "Edit" },
  add: { id: "Tambah", en: "Add" },
  create: { id: "Buat", en: "Create" },
  submit: { id: "Kirim", en: "Submit" },
  back: { id: "Kembali", en: "Back" },
  next: { id: "Selanjutnya", en: "Next" },
  previous: { id: "Sebelumnya", en: "Previous" },
  loading: { id: "Memuat...", en: "Loading..." },
  noData: { id: "Tidak ada data", en: "No data" },

  // Calculator
  waterFootprint: { id: "Jejak Air", en: "Water Footprint" },
  waterStock: { id: "Stok Air", en: "Water Resources" },
  waterCredit: { id: "Kredit Air", en: "Water Credit" },
  consumptionCategory: {
    id: "Kategori Konsumsi Air",
    en: "Consumption Category",
  },
  landType: { id: "Tipe Lahan", en: "Land Type" },
  area: { id: "Luas", en: "Area" },
  calculate: { id: "Hitung", en: "Calculate" },
  result: { id: "Hasil", en: "Result" },
  totalConsumption: { id: "Total Konsumsi Air", en: "Total Consumption" },
  totalStock: { id: "Total Stok", en: "Total Stock" },

  // Consumption Categories
  electricity: { id: "Listrik", en: "Electricity" },
  naturalGas: { id: "Gas Alam", en: "Natural Gas" },
  fuel: { id: "Bahan Bakar", en: "Fuel" },
  water: { id: "Air", en: "Water" },
  waste: { id: "Limbah", en: "Waste" },
  transportation: { id: "Transportasi", en: "Transportation" },
  airTravel: { id: "Penerbangan", en: "Air Travel" },
  accommodation: { id: "Akomodasi", en: "Accommodation" },
  food: { id: "Makanan", en: "Food" },

  // Land Types
  tropicalRainforest: { id: "Hutan Hujan Tropis", en: "Tropical Rainforest" },
  mangrove: { id: "Hutan Mangrove", en: "Mangrove Forest" },
  peatland: { id: "Lahan Gambut", en: "Peatland" },
  drylandForest: { id: "Hutan Dataran Kering", en: "Dryland Forest" },
  wetland: { id: "Lahan Basah", en: "Wetland" },
  grassland: { id: "Padang Rumput", en: "Grassland" },
  cropland: { id: "Lahan Pertanian", en: "Cropland" },
  settlement: { id: "Pemukiman", en: "Settlement" },
  otherLand: { id: "Lahan Lainnya", en: "Other Land" },

  // Levels
  low: { id: "Rendah", en: "Low" },
  medium: { id: "Sedang", en: "Medium" },
  high: { id: "Tinggi", en: "High" },
  veryHigh: { id: "Sangat Tinggi", en: "Very High" },

  // Map
  selectAreaOnMap: { id: "Pilih area di peta", en: "Select area on map" },
  drawPolygon: { id: "Gambar Poligon", en: "Draw Polygon" },
  drawRectangle: { id: "Gambar Persegi", en: "Draw Rectangle" },
  quickLocation: { id: "Lokasi Cepat", en: "Quick Location" },

  // Help
  needHelp: { id: "Butuh Bantuan?", en: "Need Help?" },
  contactSupport: { id: "Hubungi Support", en: "Contact Support" },
  supportTeam: { id: "Tim support 24/7", en: "24/7 Support Team" },

  // ── NRECA Model ──
  nreca_tab_params: { id: "⚙️ Parameter Model", en: "⚙️ Model Parameters" },
  nreca_tab_data: { id: "📋 Data Hujan & PET", en: "📋 Rainfall & PET Data" },
  nreca_tab_results: {
    id: "📊 Hasil & Statistik",
    en: "📊 Results & Statistics",
  },
  nreca_tab_charts: { id: "📈 Grafik Kalibrasi", en: "📈 Calibration Charts" },
  nreca_reset: { id: "Reset", en: "Reset" },
  nreca_params_title: {
    id: "Parameter Kalibrasi NRECA",
    en: "NRECA Calibration Parameters",
  },
  nreca_params_subtitle: {
    id: "PSUB · GWF · Cr · Simpanan Awal · Luas DAS",
    en: "PSUB · GWF · Cr · Initial Storage · Catchment Area",
  },
  nreca_params_main: { id: "Parameter Utama", en: "Main Parameters" },
  nreca_psub_hint: {
    id: "0.3 = tanah kedap air  |  0.9 = sangat permeabel",
    en: "0.3 = impervious soil  |  0.9 = highly permeable",
  },
  nreca_gwf_hint: {
    id: "0.2 = kedap (baseflow lambat)  |  0.8 = sangat lulus air (baseflow cepat)",
    en: "0.2 = slow baseflow  |  0.8 = fast baseflow",
  },
  nreca_cr_label: {
    id: "Cr — Koef. Reduksi Evapotranspirasi",
    en: "Cr — ET Reduction Coefficient",
  },
  nreca_cr_hint: {
    id: "Faktor koreksi PET berdasarkan kemiringan lahan",
    en: "PET correction factor based on land slope",
  },
  nreca_run_btn: { id: "▶ Jalankan Model NRECA", en: "▶ Run NRECA Model" },
  nreca_results_title: {
    id: "Hasil & Statistik Kalibrasi",
    en: "Calibration Results & Statistics",
  },
  nreca_results_subtitle: {
    id: "Rerata · Min · Max · NSE · Korelasi Pearson",
    en: "Mean · Min · Max · NSE · Pearson Correlation",
  },
  nreca_charts_subtitle: {
    id: "Time Series · Kurva Durasi · Moisture Storage · GW Storage",
    en: "Time Series · Duration Curve · Moisture Storage · GW Storage",
  },
  nreca_chart_timeseries_title: {
    id: "KALIBRASI TIME SERIES — DEBIT (M³/S)",
    en: "CALIBRATION TIME SERIES — STREAMFLOW (M³/S)",
  },
  nreca_chart_timeseries_xaxis: {
    id: "Waktu (Bulan–Tahun)",
    en: "Time (Month–Year)",
  },
  nreca_chart_timeseries_yaxis: {
    id: "Debit Q (m³/s) — laju aliran air tiap detik",
    en: "Streamflow Q (m³/s) — flow rate per second",
  },
  nreca_chart_duration_title: {
    id: "KURVA DURASI DEBIT — KALIBRASI",
    en: "FLOW DURATION CURVE — CALIBRATION",
  },
  nreca_chart_duration_xaxis: {
    id: "Probabilitas Terlampaui P (0–1)",
    en: "Exceedance Probability P (0–1)",
  },
  nreca_chart_duration_yaxis: {
    id: "Debit Q (m³/s)",
    en: "Streamflow Q (m³/s)",
  },
  nreca_chart_duration_tip: {
    id: "💡 P=0.05 → debit terlampaui 5% waktu (banjir)  ·  P=0.95 → debit terlampaui 95% waktu (kemarau)",
    en: "💡 P=0.05 → flow exceeded 5% of time (flood)  ·  P=0.95 → flow exceeded 95% of time (dry season)",
  },
  nreca_rekap_title: {
    id: "Rekap Probabilitas Debit",
    en: "Flow Duration Summary",
  },
  nreca_rekap_subtitle: {
    id: "Debit pada berbagai probabilitas terlampaui — untuk perencanaan teknis & hidrologi",
    en: "Streamflow at key exceedance probabilities — for engineering & hydrology planning",
  },
  nreca_rekap_col_prob: { id: "Probabilitas", en: "Exceedance Probability" },
  nreca_rekap_col_qobs: { id: "Q Obs (m³/s)", en: "Q Obs (m³/s)" },
  nreca_rekap_col_qmodel: { id: "Q Model (m³/s)", en: "Q Model (m³/s)" },
  nreca_rekap_col_use: { id: "Kegunaan", en: "Use Case" },
  nreca_rekap_method_note: {
    id: "📌 Metode: Weibull plotting position — P = m/(n+1) dimana m = peringkat dari besar ke kecil, n = jumlah data",
    en: "📌 Method: Weibull plotting position — P = m/(n+1) where m = rank (descending) and n = total data points",
  },
  nreca_rekap_q95_use: {
    id: "PLTA / Pembangkit Listrik Tenaga Air",
    en: "Hydropower (dependable flow)",
  },
  nreca_rekap_q90_use: {
    id: "Air Domestik & Industri",
    en: "Domestic & Industrial Supply",
  },
  nreca_rekap_q80_use: { id: "Irigasi", en: "Irrigation" },
  nreca_rekap_q60_use: {
    id: "Perencanaan Bendungan / Waduk",
    en: "Dam / Reservoir Design",
  },
  nreca_rekap_q50_use: {
    id: "Ketersediaan Air Rata-Rata Tahunan",
    en: "Mean Annual Flow Availability",
  },
  nreca_rekap_q40_use: {
    id: "Analisis Banjir (Batas Bawah)",
    en: "Flood Analysis (Lower Bound)",
  },
  nreca_rekap_q20_use: {
    id: "Analisis Banjir (Desain)",
    en: "Flood Analysis (Design)",
  },
  nreca_nse_formula_title: { id: "Formula NSE", en: "NSE Formula" },
  nreca_nse_class_title: {
    id: "Klasifikasi NSE (Moriasi et al.)",
    en: "NSE Classification (Moriasi et al.)",
  },
  nreca_metric_guide_title: {
    id: "Panduan Singkatan & Metrik",
    en: "Abbreviations & Metrics Guide",
  },
  nreca_axis_xaxis: { id: "Sumbu X", en: "X-axis" },
  nreca_axis_yaxis: { id: "Sumbu Y", en: "Y-axis" },
  nreca_calib_very_good: {
    id: "Kalibrasi: SANGAT BAIK ✓",
    en: "Calibration: VERY GOOD ✓",
  },
  nreca_calib_good: { id: "Kalibrasi: BAIK ✓", en: "Calibration: GOOD ✓" },
  nreca_calib_satisfactory: {
    id: "Kalibrasi: CUKUP — perlu penyesuaian parameter",
    en: "Calibration: SATISFACTORY — parameter adjustment needed",
  },
  nreca_calib_unsatisfactory: {
    id: "Kalibrasi: KURANG BAIK — sesuaikan PSUB, GWF, Cr",
    en: "Calibration: UNSATISFACTORY — adjust PSUB, GWF, Cr",
  },
  nreca_no_obs: {
    id: "Masukkan data observasi untuk menghitung NSE",
    en: "Enter observed data to compute NSE",
  },
  nreca_run_first: {
    id: "Jalankan model NRECA untuk melihat hasil",
    en: "Run the NRECA model to view results",
  },
  nreca_mean_obs: { id: "Rerata Data Obs", en: "Mean Observed Data" },
  nreca_mean_model: { id: "Rerata Model", en: "Mean Model" },
  nreca_corr_coef: { id: "Koef. Korelasi (r)", en: "Correlation Coef. (r)" },
  nreca_min_data_model: { id: "Min Data / Model", en: "Min Data / Model" },
  nreca_max_data_model: { id: "Max Data / Model", en: "Max Data / Model" },
  nreca_nom_formula: { id: "Nom = 100 + 0.2·Ra", en: "Nom = 100 + 0.2·Ra" },
  nreca_table_title: {
    id: "Tabel Hasil Lengkap (21 Kolom)",
    en: "Full Results Table (21 Columns)",
  },
  nreca_table_subtitle: {
    id: "Semua variabel antara model NRECA per bulan",
    en: "All NRECA model intermediate variables per month",
  },
  nreca_table_show: { id: "Tampilkan", en: "Show" },
  nreca_table_hide: { id: "Sembunyikan", en: "Hide" },
  // Metric Guide Descriptions
  nreca_metric_nse_desc: {
    id: "Mengukur seberapa baik model mereproduksi data observasi. Semakin mendekati 1 = semakin baik. NSE = 1 berarti model sempurna.",
    en: "Measures how well the model reproduces observed data. Closer to 1 = better. NSE = 1 means perfect model.",
  },
  nreca_metric_nse_range: {
    id: "Terbaik: mendekati 1",
    en: "Best: close to 1",
  },
  nreca_metric_r_desc: {
    id: "Mengukur kekuatan hubungan linear antara debit model dan observasi. Berkisar dari -1 hingga 1.",
    en: "Measures the linear correlation between modeled and observed streamflow. Ranges from -1 to 1.",
  },
  nreca_metric_r_range: { id: "Terbaik: mendekati 1", en: "Best: close to 1" },
  nreca_metric_qcomp_desc: {
    id: "Debit yang dihasilkan oleh model NRECA berdasarkan parameter kalibrasi dan data hujan-PET.",
    en: "Streamflow computed by the NRECA model based on calibration parameters and rainfall-PET input.",
  },
  nreca_metric_qcomp_range: {
    id: "Bandingkan dengan Qobs",
    en: "Compare with Qobs",
  },
  nreca_metric_qobs_desc: {
    id: "Debit hasil pengukuran lapangan di pos AWLR atau stasiun hidrologi. Digunakan sebagai acuan kalibrasi.",
    en: "Observed streamflow measured at a gauging station. Used as the calibration reference.",
  },
  nreca_metric_qobs_range: {
    id: "Data referensi lapangan",
    en: "Field reference data",
  },
  nreca_metric_pet_desc: {
    id: "Evapotranspirasi potensial (mm): jumlah air yang bisa menguap jika air tersedia cukup. Dikalikan faktor koreksi Cr.",
    en: "Potential Evapotranspiration (mm): water that could evaporate if supply is unlimited. Multiplied by correction factor Cr.",
  },
  nreca_metric_pet_range: {
    id: "Input model, satuan mm",
    en: "Model input, unit mm",
  },
  nreca_metric_aet_desc: {
    id: "Evapotranspirasi aktual (mm): bagian dari PET yang benar-benar terjadi, bergantung pada kelembaban tanah (STOR_RATIO).",
    en: "Actual Evapotranspiration (mm): portion of PET that actually occurs, depending on soil moisture (STOR_RATIO).",
  },
  nreca_metric_aet_range: { id: "AET ≤ PET selalu", en: "AET ≤ PET always" },
  nreca_metric_psub_desc: {
    id: "Fraksi kelebihan air yang masuk ke reservoir air tanah. Sisanya (1−PSUB) menjadi aliran langsung.",
    en: "Fraction of excess moisture that recharges the groundwater reservoir. Remainder (1−PSUB) becomes direct runoff.",
  },
  nreca_metric_psub_range: {
    id: "0 – 1 (umumnya 0.5–0.9)",
    en: "0 – 1 (typically 0.5–0.9)",
  },
  nreca_metric_gwf_desc: {
    id: "Fraksi simpanan air tanah yang keluar sebagai baseflow setiap bulan. Nilai kecil = air tanah lambat keluar.",
    en: "Fraction of groundwater storage that exits as baseflow each month. Small = slow baseflow release.",
  },
  nreca_metric_gwf_range: {
    id: "0 – 1 (umumnya 0.1–0.3)",
    en: "0 – 1 (typically 0.1–0.3)",
  },
  nreca_metric_nom_desc: {
    id: "Nom = 100 + 0.2×Ra adalah kapasitas simpanan tanah nominal (mm). Ra = rata-rata curah hujan tahunan (mm).",
    en: "Nom = 100 + 0.2×Ra is the nominal soil storage capacity (mm). Ra = mean annual rainfall (mm).",
  },
  nreca_metric_nom_range: {
    id: "Dihitung otomatis dari Ra",
    en: "Auto-calculated from Ra",
  },
  nreca_metric_cr_desc: {
    id: "Koefisien pengali untuk menyesuaikan PET ke kondisi DAS lokal. Nilai < 1 = PET efektif lebih rendah.",
    en: "Multiplication factor to adjust PET to local watershed conditions. Value < 1 = lower effective PET.",
  },
  nreca_metric_cr_range: {
    id: "0.5 – 1.2 (umumnya ≈ 0.8)",
    en: "0.5 – 1.2 (typically ≈ 0.8)",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hydrex-language");
      return (saved as Language) || "id";
    }
    return "id";
  });

  useEffect(() => {
    localStorage.setItem("hydrex-language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
