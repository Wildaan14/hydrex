import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "id" | "en";

interface Translations {
  // Loading
  loading_title: string;
  loading_subtitle: string;

  // Header
  search_placeholder: string;
  login: string;
  home: string;
  services: string;
  news: string;
  data: string;
  info: string;
  marketplace: string;
  projects: string;
  calculator: string;
  reports: string;

  // Hero Section
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_description: string;
  hero_features: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_main_services: string;
  hero_services_desc: string;

  // Service Categories
  service_water_tracking: string;
  service_water_tracking_desc: string;
  service_water_credit: string;
  service_water_credit_desc: string;
  service_water_offset: string;
  service_water_offset_desc: string;
  service_water_report: string;
  service_water_report_desc: string;
  service_water_audit: string;
  service_water_audit_desc: string;

  // Trust Points
  trust_certified: string;
  trust_certified_desc: string;
  trust_transparent: string;
  trust_transparent_desc: string;
  trust_verified: string;
  trust_verified_desc: string;

  // Quick Access
  quick_access_badge: string;
  quick_access_title: string;
  quick_access_desc: string;
  start_now: string;
  estimated_time: string;
  completed_today: string;
  services_completed: string;
  average_response: string;
  satisfaction_rate: string;
  online_services: string;
  popular_label: string;

  // Water Calculator
  calculator_badge: string;
  calculator_title: string;
  calculator_desc: string;
  water_stock: string;
  water_credit: string;
  land_area: string;
  land_cover_type: string;
  land_cover_primary_forest: string;
  land_cover_secondary_forest: string;
  land_cover_mangrove: string;
  tree_count: string;
  forest_type: string;
  forest_tropical: string;
  forest_temperate: string;
  forest_boreal: string;
  annual_emission: string;
  offset_target: string;
  project_type: string;
  project_reforestation: string;
  project_renewable: string;
  project_efficiency: string;
  total_water_stock: string;
  equivalent_to: string;
  water_per_hectare: string;
  water_per_tree: string;
  environmental_impact: string;
  impact_description: string;
  positive: string;
  impact_1: string;
  cars_year: string;
  impact_2: string;
  oxygen_year: string;
  credits_needed: string;
  credits: string;
  offset_amount: string;
  total_cost: string;
  cost_per_credit: string;
  alternative_solution: string;
  alternative_description: string;
  recommended: string;
  plant_trees: string;
  trees: string;
  hectares: string;
  est_cost: string;
  one_time: string;
  start_project: string;
  purchase_credits: string;

  // Services by Sector
  persona_title: string;
  persona_desc: string;
  persona_forestry: string;
  persona_agriculture: string;
  persona_energy: string;
  persona_industry: string;

  // News Section
  news_title: string;
  news_desc: string;
  news_tab: string;
  announcements_tab: string;
  news_scholarship_title: string;
  news_scholarship_desc: string;
  category_education: string;
  news_app_title: string;
  news_app_desc: string;
  news_festival_title: string;
  news_festival_desc: string;
  category_culture: string;
  announce_holiday_title: string;
  announce_holiday_desc: string;
  announce_infrastructure_title: string;
  announce_infrastructure_desc: string;
  announce_health_title: string;
  announce_health_desc: string;

  // Sample News
  news_forest_title: string;
  news_forest_desc: string;
  news_market_title: string;
  news_market_desc: string;
  news_technology_title: string;
  news_technology_desc: string;

  // Sample Announcements
  announce_regulation_title: string;
  announce_regulation_desc: string;
  announce_project_title: string;
  announce_project_desc: string;
  announce_report_title: string;
  announce_report_desc: string;

  // Agenda Section
  agenda_title: string;
  agenda_desc: string;
  view_all_agenda: string;
  agenda_meeting_title: string;
  meeting_type: string;
  officials_participants: string;
  agenda_dialog_title: string;
  public_dialog_type: string;
  public_officials_participants: string;
  agenda_smart_city_title: string;
  public_event_type: string;
  all_citizens_participants: string;

  // Transparency Section
  transparency_badge: string;
  transparency_title_1: string;
  transparency_title_2: string;
  transparency_desc: string;
  transparency_features: string;

  // Transparency Widgets
  financial_report: string;
  financial_desc: string;
  total_budget: string;
  budget_2025: string;
  budget_desc: string;
  development: string;
  e_report: string;
  e_report_desc: string;
  reports_received: string;
  open_data: string;
  open_data_desc: string;
  datasets: string;
  progress: string;
  budget_distributed: string;
  projects_completed: string;

  // Portal
  portal_title: string;
  portal_desc: string;
  water_sequestered: string;
  projects_active: string;
  transparency_score: string;
  access_portal: string;

  // Testimonials
  testimonials_title: string;
  testimonials_desc: string;
  testimonials_cta_1: string;
  testimonials_cta_2: string;
  testimonials_question: string;

  // Priority and Category Labels
  priority_important: string;
  priority_info: string;
  category_forest: string;
  category_technology: string;
  category_policy: string;

  // Footer Accessibility
  accessibility: string;
  text_size: string;
  display_mode: string;
  light: string;
  dark: string;
  language: string;

  // Footer Links
  contact_us: string;
  main_services: string;
  information: string;
  transparency: string;
  social_media: string;
  privacy_policy: string;
  terms_conditions: string;
  sitemap: string;
  copyright: string;
  disability_support: string;
  access_guide: string;

  // MRV Dashboard
  mrv_dashboard_badge: string;
  mrv_dashboard_title: string;
  mrv_dashboard_desc: string;
  mrv_module_summary: string;
  mrv_module_baseline: string;
  mrv_module_stock: string;
  mrv_module_mitigation: string;
  mrv_module_nek: string;
  mrv_module_economic: string;
  mrv_module_compliance: string;
  mrv_water_stock: string;
  mrv_emission_reduction: string;
  mrv_water_units: string;
  mrv_economic_value: string;
  mrv_total_area: string;
  mrv_monitoring_period: string;
  mrv_certifications: string;
  mrv_project_status: string;
  mrv_baseline_title: string;
  mrv_location: string;
  mrv_coordinates: string;
  mrv_ecosystem_distribution: string;
  mrv_ecosystem_details: string;
  mrv_ecosystem_type: string;
  mrv_area: string;
  mrv_percentage: string;
  mrv_map_placeholder: string;
  mrv_map_desc: string;
  mrv_stock_title: string;
  mrv_initial_stock: string;
  mrv_current_stock: string;
  mrv_stock_trend: string;
  mrv_actual_stock: string;
  mrv_target_stock: string;
  mrv_methodology: string;
  mrv_water_fraction: string;
  mrv_conversion_factor: string;
  mrv_emission_source: string;
  mrv_allometric: string;
  mrv_mitigation_title: string;
  mrv_gross_er: string;
  mrv_net_er: string;
  mrv_after_deductions: string;
  mrv_deductions: string;
  mrv_leakage: string;
  mrv_uncertainty: string;
  mrv_buffer: string;
  mrv_total_deductions: string;
  mrv_calculation: string;
  mrv_nek_title: string;
  mrv_potential_spe: string;
  mrv_verified_spe: string;
  mrv_issued_spe: string;
  mrv_stage: string;
  mrv_srnppi: string;
  mrv_registration_number: string;
  mrv_registration_date: string;
  mrv_project_category: string;
  mrv_vintage_year: string;
  mrv_economic_title: string;
  mrv_current_price: string;
  mrv_total_value: string;
  mrv_potential_value: string;
  mrv_units_status: string;
  mrv_sold: string;
  mrv_offset: string;
  mrv_available: string;
  mrv_price_scenarios: string;
  mrv_low_price: string;
  mrv_medium_price: string;
  mrv_high_price: string;
  mrv_recent_transactions: string;
  mrv_completed: string;
  mrv_compliance_title: string;
  mrv_srnppi_status: string;
  mrv_double_counting: string;
  mrv_blockchain_protected: string;
  mrv_buffer_permanence: string;
  mrv_required: string;
  mrv_held: string;
  mrv_fulfilled: string;
  mrv_reporting_obligation: string;
  mrv_frequency: string;
  mrv_next_deadline: string;
  mrv_reversal_risk: string;
  mrv_fire_risk: string;
  mrv_logging_risk: string;
  mrv_policy_risk: string;
  mrv_overall_risk: string;
  mrv_maintenance_obligation: string;
  mrv_period: string;
  mrv_start_date: string;
  mrv_end_date: string;
  mrv_active_certifications: string;
  mrv_valid_until: string;
  mrv_download_report: string;
  mrv_share_stakeholders: string;

  // NRECA Model
  nreca_tab_params: string;
  nreca_tab_data: string;
  nreca_tab_results: string;
  nreca_tab_charts: string;
  nreca_reset: string;
  nreca_params_title: string;
  nreca_params_subtitle: string;
  nreca_params_main: string;
  nreca_psub_hint: string;
  nreca_gwf_hint: string;
  nreca_cr_label: string;
  nreca_cr_hint: string;
  nreca_run_btn: string;
  nreca_results_title: string;
  nreca_results_subtitle: string;
  nreca_charts_subtitle: string;
  nreca_chart_timeseries_title: string;
  nreca_chart_timeseries_xaxis: string;
  nreca_chart_timeseries_yaxis: string;
  nreca_chart_duration_title: string;
  nreca_chart_duration_xaxis: string;
  nreca_chart_duration_yaxis: string;
  nreca_chart_duration_tip: string;
  nreca_rekap_title: string;
  nreca_rekap_subtitle: string;
  nreca_rekap_col_prob: string;
  nreca_rekap_col_qobs: string;
  nreca_rekap_col_qmodel: string;
  nreca_rekap_col_use: string;
  nreca_rekap_method_note: string;
  nreca_rekap_q95_use: string;
  nreca_rekap_q90_use: string;
  nreca_rekap_q80_use: string;
  nreca_rekap_q60_use: string;
  nreca_rekap_q50_use: string;
  nreca_rekap_q40_use: string;
  nreca_rekap_q20_use: string;
  nreca_nse_formula_title: string;
  nreca_nse_class_title: string;
  nreca_metric_guide_title: string;
  nreca_axis_xaxis: string;
  nreca_axis_yaxis: string;
  nreca_calib_very_good: string;
  nreca_calib_good: string;
  nreca_calib_satisfactory: string;
  nreca_calib_unsatisfactory: string;
  nreca_no_obs: string;
  nreca_run_first: string;
  nreca_mean_obs: string;
  nreca_mean_model: string;
  nreca_corr_coef: string;
  nreca_min_data_model: string;
  nreca_max_data_model: string;
  nreca_nom_formula: string;
  nreca_table_title: string;
  nreca_table_subtitle: string;
  nreca_table_show: string;
  nreca_table_hide: string;

  // NRECA Metric Guide Descriptions
  nreca_metric_nse_desc: string;
  nreca_metric_nse_range: string;
  nreca_metric_r_desc: string;
  nreca_metric_r_range: string;
  nreca_metric_qcomp_desc: string;
  nreca_metric_qcomp_range: string;
  nreca_metric_qobs_desc: string;
  nreca_metric_qobs_range: string;
  nreca_metric_pet_desc: string;
  nreca_metric_pet_range: string;
  nreca_metric_aet_desc: string;
  nreca_metric_aet_range: string;
  nreca_metric_psub_desc: string;
  nreca_metric_psub_range: string;
  nreca_metric_gwf_desc: string;
  nreca_metric_gwf_range: string;
  nreca_metric_nom_desc: string;
  nreca_metric_nom_range: string;
  nreca_metric_cr_desc: string;
  nreca_metric_cr_range: string;
}

const translations: Record<Language, Translations> = {
  id: {
    // Loading
    loading_title: "Memuat Konten...",
    loading_subtitle: "Mohon tunggu sebentar",

    // Header
    search_placeholder: "Cari layanan air...",
    login: "Masuk",
    home: "Beranda",
    services: "Layanan",
    news: "Berita",
    data: "Data",
    info: "Info",
    marketplace: "Marketplace",
    projects: "Proyek",
    calculator: "Kalkulator",
    reports: "Laporan",

    // Hero Section
    hero_badge: "🌱 Sistem Air Tersertifikasi Indonesia",
    hero_title_1: "Platform Air",
    hero_title_2: "Terpercaya Indonesia",
    hero_description:
      "Kelola, perdagangkan, dan pantau kredit air Anda dengan sistem MRV berbasis blockchain yang transparan dan tersertifikasi sesuai regulasi NEK Indonesia",
    hero_features: "MRV • Blockchain • SRN-PPI",
    hero_cta_primary: "Mulai Sekarang",
    hero_cta_secondary: "Pelajari Lebih Lanjut",
    hero_main_services: "Layanan Utama",
    hero_services_desc: "Solusi lengkap manajemen air untuk Indonesia",

    // Service Categories
    service_water_tracking: "Pelacakan Air",
    service_water_tracking_desc:
      "Pantau stok air real-time dengan teknologi satelit dan AI",
    service_water_credit: "Kredit Air",
    service_water_credit_desc:
      "Perdagangkan kredit air tersertifikasi di marketplace blockchain",
    service_water_offset: "Offset Air",
    service_water_offset_desc:
      "Program offset untuk mencapai target net-zero consumption",
    service_water_report: "Laporan Air",
    service_water_report_desc:
      "Laporan MRV lengkap sesuai standar NEK dan internasional",
    service_water_audit: "Audit Air",
    service_water_audit_desc:
      "Verifikasi dan validasi proyek air oleh auditor tersertifikasi",

    // Trust Points
    trust_certified: "Tersertifikasi NEK",
    trust_certified_desc: "Sesuai regulasi Nilai Ekonomi Air Indonesia",
    trust_transparent: "Transparansi Penuh",
    trust_transparent_desc: "Semua transaksi tercatat di blockchain",
    trust_verified: "Terverifikasi Pihak Ketiga",
    trust_verified_desc: "Diaudit oleh lembaga independen tersertifikasi",

    // Quick Access
    quick_access_badge: "Akses Cepat",
    quick_access_title: "Layanan Populer",
    quick_access_desc:
      "Akses langsung ke layanan air yang paling banyak digunakan",
    start_now: "Mulai Sekarang",
    estimated_time: "Estimasi Waktu",
    completed_today: "Diselesaikan Hari Ini",
    services_completed: "Layanan Diselesaikan",
    average_response: "Waktu Respon Rata-rata",
    satisfaction_rate: "Tingkat Kepuasan",
    online_services: "Layanan Online",
    popular_label: "Populer",

    // Water Calculator
    calculator_badge: "Kalkulator Air HYDREX",
    calculator_title: "Kalkulator Air Indonesia",
    calculator_desc:
      "Hitung stok air, kredit, dan nilai ekonomi dengan standar Indonesia",
    water_stock: "Stok Air",
    water_credit: "Kredit Air",
    land_area: "Luas Lahan",
    land_cover_type: "Jenis Tutupan Lahan",
    land_cover_primary_forest: "Hutan Primer",
    land_cover_secondary_forest: "Hutan Sekunder",
    land_cover_mangrove: "Mangrove",
    tree_count: "Jumlah Pohon",
    forest_type: "Jenis Hutan",
    forest_tropical: "Tropis",
    forest_temperate: "Sedang",
    forest_boreal: "Boreal",
    annual_emission: "Konsumsi Tahunan",
    offset_target: "Target Offset",
    project_type: "Jenis Proyek",
    project_reforestation: "Reboisasi",
    project_renewable: "Energi Terbarukan",
    project_efficiency: "Efisiensi Energi",
    total_water_stock: "Total Stok Air",
    equivalent_to: "Setara dengan",
    water_per_hectare: "Air per Hektar",
    water_per_tree: "Air per Pohon",
    environmental_impact: "Dampak Lingkungan",
    impact_description: "Kontribusi terhadap NDC Indonesia",
    positive: "Positif",
    impact_1: "Menghilangkan konsumsi dari",
    cars_year: "mobil/tahun",
    impact_2: "Menghasilkan",
    oxygen_year: "kg O₂/tahun",
    credits_needed: "Kredit yang Dibutuhkan",
    credits: "kredit",
    offset_amount: "Jumlah offset",
    total_cost: "Estimasi Biaya",
    cost_per_credit: "Harga per Kredit",
    alternative_solution: "Solusi Bagi Hasil",
    alternative_description: "Investasi jangka panjang dengan bagi hasil",
    recommended: "Direkomendasikan",
    plant_trees: "Tanam pohon",
    trees: "pohon",
    hectares: "hektar",
    est_cost: "Estimasi investasi",
    one_time: "(dengan bagi hasil)",
    start_project: "Mulai Proyek",
    purchase_credits: "Beli Kredit di Marketplace",

    // Services by Sector
    persona_title: "Solusi untuk Setiap Sektor",
    persona_desc:
      "Layanan HYDREX yang disesuaikan dengan kebutuhan ekosistem dan regulasi Indonesia",
    persona_forestry: "Kehutanan",
    persona_agriculture: "Pertanian",
    persona_energy: "Energi",
    persona_industry: "Industri",

    // News Section
    news_title: "Berita Pasar Air Indonesia",
    news_desc:
      "Berita terkini seputar pasar air, regulasi NEK, dan proyek offsetting air di Indonesia",
    news_tab: "📰 Berita",
    announcements_tab: "📢 Pengumuman",
    news_scholarship_title: "Beasiswa Air untuk Mahasiswa Indonesia",
    news_scholarship_desc:
      "Mendukung generasi profesional pasar air berikutnya di Indonesia",
    category_education: "Pendidikan",
    news_app_title: "HYDREX Luncurkan Aplikasi Mobile",
    news_app_desc:
      "Akses layanan air HYDREX kapan saja dan di mana saja melalui aplikasi mobile kami",
    news_festival_title: "Festival Air & Lingkungan 2025",
    news_festival_desc: "Merayakan aksi iklim dan inovasi air di Indonesia",
    category_culture: "Budaya",
    announce_holiday_title: "Liburan Kebijakan Air 2025",
    announce_holiday_desc: "Pengumuman liburan kebijakan air untuk tahun 2025",
    announce_infrastructure_title: "Pengembangan Infrastruktur Air",
    announce_infrastructure_desc:
      "Pengumuman pengembangan infrastruktur air untuk tahun 2025",
    announce_health_title: "Health Sector Water Initiatives",
    announce_health_desc:
      "New water offset programs in Indonesia's health sector",

    // Sample News
    news_forest_title: "Proyek REDD+ Kalimantan Tengah Diluncurkan",
    news_forest_desc:
      "Program Reducing Consumption from Deforestation and Forest Degradation menargetkan 500 ribu ha...",
    news_market_title: "Harga Kredit Air Indonesia Naik 30% di Q1 2025",
    news_market_desc:
      "Pasar air domestik menunjukkan pertumbuhan signifikan dengan integrasi SRN-PPI...",
    news_technology_title: "HYDREX Luncurkan Fitur MRV Berbasis AI dan Satelit",
    news_technology_desc:
      "Monitoring stok air real-time menggunakan teknologi Sentinel-2 dan machine learning...",

    // Sample Announcements
    announce_regulation_title: "Implementasi NEK dan Integrasi SRN-PPI",
    announce_regulation_desc:
      "Pemerintah perkuat regulasi Nilai Ekonomi Air untuk pasar air Indonesia...",
    announce_project_title: "Pembukaan Marketplace Kredit Air HYDREX",
    announce_project_desc:
      "Marketplace air terintegrasi blockchain untuk transparansi penuh...",
    announce_report_title: "Laporan NDC Indonesia: Target Unconditional 29%",
    announce_report_desc:
      "Capaian penurunan konsumsi nasional dan kontribusi proyek air...",

    // Agenda Section
    agenda_title: "Agenda Aksi Iklim Indonesia",
    agenda_desc:
      "Acara dan konferensi terkait aksi iklim, manajemen air, dan ekonomi hijau di Indonesia",
    view_all_agenda: "Lihat Semua Agenda",
    agenda_meeting_title: "Rapat Koordinasi Implementasi NEK 2025",
    meeting_type: "Rapat Koordinasi",
    officials_participants: "Pejabat Pemda & Kementerian",
    agenda_dialog_title: "Dialog Publik: Pasar Air untuk Masyarakat",
    public_dialog_type: "Dialog Publik",
    public_officials_participants: "Masyarakat Umum & Pejabat",
    agenda_smart_city_title: "Sosialisasi Smart City & Green Economy",
    public_event_type: "Acara Publik",
    all_citizens_participants: "Seluruh Masyarakat",

    // Transparency Section
    transparency_badge: "Transparansi Blockchain",
    transparency_title_1: "Data Air Terverifikasi",
    transparency_title_2: "& Transparan",
    transparency_desc:
      "Setiap transaksi air tercatat di blockchain untuk mencegah double counting dan menjamin integritas data",
    transparency_features: "MRV • Blockchain • Integrasi SRN-PPI",

    // Transparency Widgets
    financial_report: "Laporan Keuangan",
    financial_desc: "Laporan alokasi anggaran dan transparansi keuangan",
    total_budget: "Total Anggaran",
    budget_2025: "APBN 2025",
    budget_desc: "Alokasi anggaran untuk pembangunan nasional",
    development: "Pembangunan",
    e_report: "Laporan Elektronik",
    e_report_desc: "Sistem pelaporan elektronik terintegrasi",
    reports_received: "Laporan Diterima",
    open_data: "Data Terbuka",
    open_data_desc: "Akses data publik dan dataset terbuka",
    datasets: "Dataset",
    progress: "Progress",
    budget_distributed: "Anggaran Tersalurkan",
    projects_completed: "Proyek Selesai",

    // Portal
    portal_title: "Dashboard HYDREX Real-time",
    portal_desc:
      "Akses data stok air, kredit air, dan proyek air Indonesia dalam satu dashboard interaktif",
    water_sequestered: "Air Terserap",
    projects_active: "Proyek Aktif",
    transparency_score: "Skor Transparansi",
    access_portal: "Akses Dashboard",

    // Testimonials
    testimonials_title: "Testimoni Stakeholder & Partner",
    testimonials_desc:
      "Pengalaman pemerintah daerah, koperasi, masyarakat adat, dan perusahaan dalam program manajemen air",
    testimonials_cta_1: "Tulis Testimoni",
    testimonials_cta_2: "Daftar Jadi Mitra",
    testimonials_question: "Ingin bergabung dengan program air?",

    // Priority and Category Labels
    priority_important: "Penting",
    priority_info: "Info",
    category_forest: "Kehutanan",
    category_technology: "Teknologi",
    category_policy: "Kebijakan",

    // Footer Accessibility
    accessibility: "Aksesibilitas",
    text_size: "Ukuran Teks",
    display_mode: "Mode Tampilan",
    light: "Terang",
    dark: "Gelap",
    language: "Bahasa",

    // Footer Links
    contact_us: "Hubungi HYDREX",
    main_services: "Layanan Utama",
    information: "Informasi",
    transparency: "Transparansi",
    social_media: "Media Sosial",
    privacy_policy: "Kebijakan Privasi",
    terms_conditions: "Syarat & Ketentuan",
    sitemap: "Peta Situs",
    copyright: "2025 HYDREX - Hydrological Resource Exchange.",
    disability_support: "Dukungan Disabilitas",
    access_guide: "Panduan Akses",

    // MRV Dashboard
    mrv_dashboard_badge: "Dashboard MRV HYDREX",
    mrv_dashboard_title: "Dashboard MRV HYDREX",
    mrv_dashboard_desc:
      "Akses data MRV, proyek, dan laporan air dalam satu dashboard interaktif",
    mrv_module_summary: "Ringkasan",
    mrv_module_baseline: "Baseline",
    mrv_module_stock: "Stok Air",
    mrv_module_mitigation: "Mitigasi",
    mrv_module_nek: "NEK",
    mrv_module_economic: "Nilai Ekonomi",
    mrv_module_compliance: "Kepatuhan",
    mrv_water_stock: "Stok Air",
    mrv_emission_reduction: "Penurunan Konsumsi",
    mrv_water_units: "Unit Air",
    mrv_economic_value: "Nilai Ekonomi",
    mrv_total_area: "Total Area",
    mrv_monitoring_period: "Periode Monitoring",
    mrv_certifications: "Sertifikasi",
    mrv_project_status: "Status Proyek",
    mrv_baseline_title: "Baseline",
    mrv_location: "Lokasi",
    mrv_coordinates: "Koordinat",
    mrv_ecosystem_distribution: "Distribusi Ekosistem",
    mrv_ecosystem_details: "Detail Ekosistem",
    mrv_ecosystem_type: "Jenis Ekosistem",
    mrv_area: "Luas",
    mrv_percentage: "Persentase",
    mrv_map_placeholder: "Peta",
    mrv_map_desc: "Peta interaktif untuk melihat distribusi ekosistem",
    mrv_stock_title: "Stok Air",
    mrv_initial_stock: "Stok Awal",
    mrv_current_stock: "Stok Saat Ini",
    mrv_stock_trend: "Tren Stok",
    mrv_actual_stock: "Stok Aktual",
    mrv_target_stock: "Target Stok",
    mrv_methodology: "Metodologi",
    mrv_water_fraction: "Fraksi Air",
    mrv_conversion_factor: "Faktor Konversi",
    mrv_emission_source: "Sumber Konsumsi",
    mrv_allometric: "Allometrik",
    mrv_mitigation_title: "Mitigasi",
    mrv_gross_er: "Penurunan Konsumsi Bruto",
    mrv_net_er: "Penurunan Konsumsi Neto",
    mrv_after_deductions: "Setelah Deduksi",
    mrv_deductions: "Deduksi",
    mrv_leakage: "Kebocoran",
    mrv_uncertainty: "Ketidakpastian",
    mrv_buffer: "Buffer",
    mrv_total_deductions: "Total Deduksi",
    mrv_calculation: "Perhitungan",
    mrv_nek_title: "NEK",
    mrv_potential_spe: "Potensi SPE",
    mrv_verified_spe: "SPE Terverifikasi",
    mrv_issued_spe: "SPE Terbit",
    mrv_stage: "Tahapan",
    mrv_srnppi: "SRN-PPI",
    mrv_registration_number: "Nomor Registrasi",
    mrv_registration_date: "Tanggal Registrasi",
    mrv_project_category: "Kategori Proyek",
    mrv_vintage_year: "Tahun Vintage",
    mrv_economic_title: "Nilai Ekonomi",
    mrv_current_price: "Harga Saat Ini",
    mrv_total_value: "Total Nilai",
    mrv_potential_value: "Nilai Potensial",
    mrv_units_status: "Status Unit",
    mrv_sold: "Terjual",
    mrv_offset: "Offset",
    mrv_available: "Tersedia",
    mrv_price_scenarios: "Skenario Harga",
    mrv_low_price: "Harga Rendah",
    mrv_medium_price: "Harga Menengah",
    mrv_high_price: "Harga Tinggi",
    mrv_recent_transactions: "Transaksi Terbaru",
    mrv_completed: "Selesai",
    mrv_compliance_title: "Kepatuhan",
    mrv_srnppi_status: "Status SRN-PPI",
    mrv_double_counting: "Double Counting",
    mrv_blockchain_protected: "Dilindungi Blockchain",
    mrv_buffer_permanence: "Buffer Permanensi",
    mrv_required: "Dibutuhkan",
    mrv_held: "Dipegang",
    mrv_fulfilled: "Terpenuhi",
    mrv_reporting_obligation: "Kewajiban Pelaporan",
    mrv_frequency: "Frekuensi",
    mrv_next_deadline: "Tenggat Berikutnya",
    mrv_reversal_risk: "Risiko Pembalikan",
    mrv_fire_risk: "Risiko Kebakaran",
    mrv_logging_risk: "Risiko Pembalakan",
    mrv_policy_risk: "Risiko Kebijakan",
    mrv_overall_risk: "Risiko Keseluruhan",
    mrv_maintenance_obligation: "Kewajiban Pemeliharaan",
    mrv_period: "Periode",
    mrv_start_date: "Tanggal Mulai",
    mrv_end_date: "Tanggal Selesai",
    mrv_active_certifications: "Sertifikasi Aktif",
    mrv_valid_until: "Berlaku Hingga",
    mrv_download_report: "Unduh Laporan",
    mrv_share_stakeholders: "Bagikan ke Stakeholder",

    // NRECA Model
    nreca_tab_params: "⚙️ Parameter Model",
    nreca_tab_data: "📋 Data Hujan & PET",
    nreca_tab_results: "📊 Hasil & Statistik",
    nreca_tab_charts: "📈 Grafik Kalibrasi",
    nreca_reset: "Reset",
    nreca_params_title: "Parameter Kalibrasi NRECA",
    nreca_params_subtitle: "PSUB · GWF · Cr · Simpanan Awal · Luas DAS",
    nreca_params_main: "Parameter Utama",
    nreca_psub_hint: "0.3 = tanah kedap air  |  0.9 = sangat permeabel",
    nreca_gwf_hint:
      "0.2 = kedap (baseflow lambat)  |  0.8 = sangat lulus air (baseflow cepat)",
    nreca_cr_label: "Cr — Koef. Reduksi Evapotranspirasi",
    nreca_cr_hint: "Faktor koreksi PET berdasarkan kemiringan lahan",
    nreca_run_btn: "▶ Jalankan Model NRECA",
    nreca_results_title: "Hasil & Statistik Kalibrasi",
    nreca_results_subtitle: "Rerata · Min · Max · NSE · Korelasi Pearson",
    nreca_charts_subtitle:
      "Time Series · Kurva Durasi · Moisture Storage · GW Storage",
    nreca_chart_timeseries_title: "KALIBRASI TIME SERIES — DEBIT (M³/S)",
    nreca_chart_timeseries_xaxis: "Sumbu X: Waktu (Bulan–Tahun)",
    nreca_chart_timeseries_yaxis:
      "Sumbu Y: Debit Q (m³/s) — laju aliran air tiap detik",
    nreca_chart_duration_title: "KURVA DURASI DEBIT — KALIBRASI",
    nreca_chart_duration_xaxis: "Sumbu X: Probabilitas Terlampaui P (0–1)",
    nreca_chart_duration_yaxis: "Sumbu Y: Debit Q (m³/s)",
    nreca_chart_duration_tip:
      "💡 P=0.05 → debit terlampaui 5% waktu (banjir)  ·  P=0.95 → debit terlampaui 95% waktu (kemarau)",
    nreca_rekap_title: "Rekap Probabilitas Debit",
    nreca_rekap_subtitle:
      "Debit pada berbagai probabilitas terlampaui — digunakan untuk perencanaan teknis & hidrologi",
    nreca_rekap_col_prob: "Probabilitas",
    nreca_rekap_col_qobs: "Q Obs (m³/s)",
    nreca_rekap_col_qmodel: "Q Model (m³/s)",
    nreca_rekap_col_use: "Kegunaan",
    nreca_rekap_method_note:
      "📌 Metode: Weibull plotting position — P = m/(n+1) dimana m = peringkat dari besar ke kecil, n = jumlah data",
    nreca_rekap_q95_use: "PLTA / Pembangkit Listrik Tenaga Air",
    nreca_rekap_q90_use: "Air Domestik & Industri",
    nreca_rekap_q80_use: "Irigasi",
    nreca_rekap_q60_use: "Perencanaan Bendungan / Waduk",
    nreca_rekap_q50_use: "Ketersediaan Air Rata-Rata Tahunan",
    nreca_rekap_q40_use: "Analisis Banjir (Batas Bawah)",
    nreca_rekap_q20_use: "Analisis Banjir (Desain)",
    nreca_nse_formula_title: "Formula NSE",
    nreca_nse_class_title: "Klasifikasi NSE (Moriasi et al.)",
    nreca_metric_guide_title: "Panduan Singkatan & Metrik",
    nreca_axis_xaxis: "Sumbu X",
    nreca_axis_yaxis: "Sumbu Y",
    nreca_calib_very_good: "Kalibrasi: SANGAT BAIK ✓",
    nreca_calib_good: "Kalibrasi: BAIK ✓",
    nreca_calib_satisfactory: "Kalibrasi: CUKUP — perlu penyesuaian parameter",
    nreca_calib_unsatisfactory:
      "Kalibrasi: KURANG BAIK — sesuaikan PSUB, GWF, Cr",
    nreca_no_obs: "Masukkan data observasi untuk menghitung NSE",
    nreca_run_first: "Jalankan model NRECA untuk melihat hasil",
    nreca_mean_obs: "Rerata Data Obs",
    nreca_mean_model: "Rerata Model",
    nreca_corr_coef: "Koef. Korelasi (r)",
    nreca_min_data_model: "Min Data / Model",
    nreca_max_data_model: "Max Data / Model",
    nreca_nom_formula: "Nom = 100 + 0.2·Ra",
    nreca_table_title: "Tabel Hasil Lengkap (21 Kolom)",
    nreca_table_subtitle: "Semua variabel antara model NRECA per bulan",
    nreca_table_show: "Tampilkan",
    nreca_table_hide: "Sembunyikan",

    // NRECA Metric Guide Descriptions
    nreca_metric_nse_desc:
      "Mengukur seberapa baik model mereproduksi data observasi. Semakin mendekati 1 = semakin baik. NSE = 1 berarti model sempurna.",
    nreca_metric_nse_range: "Terbaik: mendekati 1",
    nreca_metric_r_desc:
      "Mengukur kekuatan hubungan linear antara debit model dan observasi. Berkisar dari -1 hingga 1.",
    nreca_metric_r_range: "Terbaik: mendekati 1",
    nreca_metric_qcomp_desc:
      "Debit yang dihasilkan oleh model NRECA berdasarkan parameter kalibrasi dan data hujan-PET.",
    nreca_metric_qcomp_range: "Bandingkan dengan Qobs",
    nreca_metric_qobs_desc:
      "Debit hasil pengukuran lapangan di pos AWLR atau stasiun hidrologi. Digunakan sebagai acuan kalibrasi.",
    nreca_metric_qobs_range: "Data referensi lapangan",
    nreca_metric_pet_desc:
      "Evapotranspirasi potensial (mm): jumlah air yang bisa menguap jika air tersedia cukup. Dikalikan faktor koreksi Cr.",
    nreca_metric_pet_range: "Input model, satuan mm",
    nreca_metric_aet_desc:
      "Evapotranspirasi aktual (mm): bagian dari PET yang benar-benar terjadi, bergantung pada kelembaban tanah (STOR_RATIO).",
    nreca_metric_aet_range: "AET ≤ PET selalu",
    nreca_metric_psub_desc:
      "Fraksi kelebihan air yang masuk ke reservoir air tanah (groundwater). Sisanya (1−PSUB) menjadi aliran langsung.",
    nreca_metric_psub_range: "0 – 1 (umumnya 0.5–0.9)",
    nreca_metric_gwf_desc:
      "Fraksi simpanan air tanah yang keluar sebagai baseflow setiap bulan. Nilai kecil = air tanah lambat keluar.",
    nreca_metric_gwf_range: "0 – 1 (umumnya 0.1–0.3)",
    nreca_metric_nom_desc:
      "Nom = 100 + 0.2×Ra adalah kapasitas simpanan tanah nominal (mm). Ra = rata-rata curah hujan tahunan (mm).",
    nreca_metric_nom_range: "Dihitung otomatis dari Ra",
    nreca_metric_cr_desc:
      "Koefisien pengali untuk menyesuaikan PET ke kondisi DAS lokal. Nilai < 1 = PET efektif lebih rendah.",
    nreca_metric_cr_range: "0.5 – 1.2 (umumnya ≈ 0.8)",
  },
  en: {
    // Loading
    loading_title: "Loading Content...",
    loading_subtitle: "Please wait a moment",

    // Header
    search_placeholder: "Search water services...",
    login: "Login",
    home: "Home",
    services: "Services",
    news: "News",
    data: "Data",
    info: "Info",
    marketplace: "Marketplace",
    projects: "Projects",
    calculator: "Calculator",
    reports: "Reports",

    // Hero Section
    hero_badge: "🌱 Indonesia's Certified Water System",
    hero_title_1: "Indonesia's Trusted",
    hero_title_2: "Water Platform",
    hero_description:
      "Manage, trade, and monitor your water credits with blockchain-based MRV system that's transparent and certified according to Indonesia's NEK regulations",
    hero_features: "MRV • Blockchain • SRN-PPI",
    hero_cta_primary: "Get Started",
    hero_cta_secondary: "Learn More",
    hero_main_services: "Main Services",
    hero_services_desc: "Complete water management solutions for Indonesia",

    // Service Categories
    service_water_tracking: "Water Tracking",
    service_water_tracking_desc:
      "Monitor real-time water stocks with satellite technology and AI",
    service_water_credit: "Water Credits",
    service_water_credit_desc:
      "Trade certified water credits on blockchain marketplace",
    service_water_offset: "Water Conservation",
    service_water_offset_desc:
      "Offset programs to achieve net-zero consumption targets",
    service_water_report: "Water Reports",
    service_water_report_desc:
      "Complete MRV reports according to NEK and international standards",
    service_water_audit: "Water Audit",
    service_water_audit_desc:
      "Verification and validation of water projects by certified auditors",

    // Trust Points
    trust_certified: "NEK Certified",
    trust_certified_desc:
      "Compliant with Indonesia's Water Economic Value regulations",
    trust_transparent: "Full Transparency",
    trust_transparent_desc: "All transactions recorded on blockchain",
    trust_verified: "Third-party Verified",
    trust_verified_desc: "Audited by certified independent institutions",

    // Quick Access
    quick_access_badge: "Quick Access",
    quick_access_title: "Popular Services",
    quick_access_desc: "Direct access to the most used water services",
    start_now: "Start Now",
    estimated_time: "Estimated Time",
    completed_today: "Completed Today",
    services_completed: "Services Completed",
    average_response: "Average Response Time",
    satisfaction_rate: "Satisfaction Rate",
    online_services: "Online Services",
    popular_label: "Popular",

    // Water Calculator
    calculator_badge: "HYDREX Water Calculator",
    calculator_title: "Indonesia Water Calculator",
    calculator_desc:
      "Calculate water stock, credits, and economic value with Indonesia standards",
    water_stock: "Water Resources",
    water_credit: "Water Credit",
    land_area: "Land Area",
    land_cover_type: "Land Cover Type",
    land_cover_primary_forest: "Primary Forest",
    land_cover_secondary_forest: "Secondary Forest",
    land_cover_mangrove: "Mangrove",
    tree_count: "Tree Count",
    forest_type: "Forest Type",
    forest_tropical: "Tropical",
    forest_temperate: "Temperate",
    forest_boreal: "Boreal",
    annual_emission: "Annual Emission",
    offset_target: "Offset Target",
    project_type: "Project Type",
    project_reforestation: "Reforestation",
    project_renewable: "Renewable Energy",
    project_efficiency: "Energy Efficiency",
    total_water_stock: "Total Water Resources",
    equivalent_to: "Equivalent to",
    water_per_hectare: "Water per Hectare",
    water_per_tree: "Water per Tree",
    environmental_impact: "Environmental Impact",
    impact_description: "Contribution to Indonesia's NDC",
    positive: "Positive",
    impact_1: "Removes consumption from",
    cars_year: "cars/year",
    impact_2: "Produces",
    oxygen_year: "kg O₂/year",
    credits_needed: "Credits Needed",
    credits: "credits",
    offset_amount: "Offset amount",
    total_cost: "Estimated Cost",
    cost_per_credit: "Price per Credit",
    alternative_solution: "Profit-Sharing Solution",
    alternative_description: "Long-term investment with revenue sharing",
    recommended: "Recommended",
    plant_trees: "Plant trees",
    trees: "trees",
    hectares: "hectares",
    est_cost: "Estimated investment",
    one_time: "(with profit-sharing)",
    start_project: "Start Project",
    purchase_credits: "Buy Credits on Marketplace",

    // Services by Sector
    persona_title: "Solutions for Every Sector",
    persona_desc:
      "HYDREX services tailored to Indonesia's ecosystem needs and regulations",
    persona_forestry: "Forestry",
    persona_agriculture: "Agriculture",
    persona_energy: "Energy",
    persona_industry: "Industry",

    // News Section
    news_title: "Indonesia Water Market Updates",
    news_desc:
      "Latest news about water market, NEK regulations, and water offsetting projects in Indonesia",
    news_tab: "📰 News",
    announcements_tab: "📢 Announcements",
    news_scholarship_title: "Water Scholarships for Indonesian Students",
    news_scholarship_desc:
      "Supporting the next generation of water market professionals in Indonesia",
    category_education: "Education",
    news_app_title: "HYDREX Launches Mobile App for Water Management",
    news_app_desc:
      "New app enables users to track water credits and projects on-the-go",
    news_festival_title: "2025 Water & Environment Festival",
    news_festival_desc:
      "Celebrating climate action and water innovation in Indonesia",
    category_culture: "Culture",
    announce_holiday_title: "Liburan Kebijakan Air 2025",
    announce_holiday_desc: "Pengumuman liburan kebijakan air untuk tahun 2025",
    announce_infrastructure_title: "Pengembangan Infrastruktur Air",
    announce_infrastructure_desc:
      "Pengumuman pengembangan infrastruktur air untuk tahun 2025",
    announce_health_title: "Health Sector Water Initiatives",
    announce_health_desc:
      "New water offset programs in Indonesia's health sector",

    // Sample News
    news_forest_title: "Central Kalimantan REDD+ Project Launched",
    news_forest_desc:
      "Reducing Consumption from Deforestation and Forest Degradation program targeting 500K ha...",
    news_market_title: "Indonesia Water Credit Prices Up 30% in Q1 2025",
    news_market_desc:
      "Domestic water market shows significant growth with SRN-PPI integration...",
    news_technology_title: "HYDREX Launches AI and Satellite-based MRV Feature",
    news_technology_desc:
      "Real-time water stock monitoring using Sentinel-2 technology and machine learning...",

    // Sample Announcements
    announce_regulation_title: "NEK Implementation and SRN-PPI Integration",
    announce_regulation_desc:
      "Government strengthens Water Economic Value regulations for Indonesia's water market...",
    announce_project_title: "Opening of HYDREX Water Credit Marketplace",
    announce_project_desc:
      "Blockchain-integrated water marketplace for full transparency...",
    announce_report_title: "Indonesia's NDC Report: 29% Unconditional Target",
    announce_report_desc:
      "National emission reduction achievements and water project contributions...",

    // Agenda Section
    agenda_title: "Indonesia Climate Action Agenda",
    agenda_desc:
      "Events and conferences about climate action, water management, and green economy in Indonesia",
    view_all_agenda: "View All Agenda",
    agenda_meeting_title: "NEK 2025 Implementation Coordination Meeting",
    meeting_type: "Coordination Meeting",
    officials_participants: "Local Government & Ministry Officials",
    agenda_dialog_title: "Public Dialogue: Water Market for Communities",
    public_dialog_type: "Public Dialogue",
    public_officials_participants: "General Public & Officials",
    agenda_smart_city_title: "Smart City & Green Economy Socialization",
    public_event_type: "Public Event",
    all_citizens_participants: "All Citizens",

    // Transparency Section
    transparency_badge: "Blockchain Transparency",
    transparency_title_1: "Verified",
    transparency_title_2: "& Transparent Water Data",
    transparency_desc:
      "Every water transaction is recorded on blockchain to prevent double counting and ensure data integrity",
    transparency_features: "MRV • Blockchain • SRN-PPI Integration",

    // Transparency Widgets
    financial_report: "Financial Report",
    financial_desc: "Budget allocation and financial transparency report",
    total_budget: "Total Budget",
    budget_2025: "Budget 2025",
    budget_desc: "Budget allocation for national development",
    development: "Development",
    e_report: "E-Report",
    e_report_desc: "Integrated electronic reporting system",
    reports_received: "Reports Received",
    open_data: "Open Data",
    open_data_desc: "Public data access and open datasets",
    datasets: "Datasets",
    progress: "Progress",
    budget_distributed: "Budget Distributed",
    projects_completed: "Projects Completed",

    // Portal
    portal_title: "Real-time HYDREX Dashboard",
    portal_desc:
      "Access water stock data, water credits, and Indonesia's water projects in one interactive dashboard",
    water_sequestered: "Water Sequestered",
    projects_active: "Active Projects",
    transparency_score: "Transparency Score",
    access_portal: "Access Dashboard",

    // Testimonials
    testimonials_title: "Stakeholder & Partner Testimonials",
    testimonials_desc:
      "Experiences of local governments, cooperatives, indigenous communities, and companies in water management programs",
    testimonials_cta_1: "Write Testimonial",
    testimonials_cta_2: "Register as Partner",
    testimonials_question: "Want to join the water program?",

    // Priority and Category Labels
    priority_important: "Important",
    priority_info: "Info",
    category_forest: "Forestry",
    category_technology: "Technology",
    category_policy: "Policy",

    // Footer Accessibility
    accessibility: "Accessibility",
    text_size: "Text Size",
    display_mode: "Display Mode",
    light: "Light",
    dark: "Dark",
    language: "Language",

    // Footer Links
    contact_us: "Contact HYDREX",
    main_services: "Main Services",
    information: "Information",
    transparency: "Transparency",
    social_media: "Social Media",
    privacy_policy: "Privacy Policy",
    terms_conditions: "Terms & Conditions",
    sitemap: "Site Map",
    copyright: "2025 HYDREX - Hydrological Resource Exchange.",
    disability_support: "Dukungan Disabilitas",
    access_guide: "Panduan Akses",

    // MRV Dashboard
    mrv_dashboard_badge: "HYDREX MRV Dashboard",
    mrv_dashboard_title: "HYDREX MRV Dashboard",
    mrv_dashboard_desc:
      "Access MRV data, projects, and water reports in one interactive dashboard",
    mrv_module_summary: "Summary",
    mrv_module_baseline: "Baseline",
    mrv_module_stock: "Water Resources",
    mrv_module_mitigation: "Mitigation",
    mrv_module_nek: "NEK",
    mrv_module_economic: "Economic Value",
    mrv_module_compliance: "Compliance",
    mrv_water_stock: "Water Resources",
    mrv_emission_reduction: "Emission Reduction",
    mrv_water_units: "Water Units",
    mrv_economic_value: "Economic Value",
    mrv_total_area: "Total Area",
    mrv_monitoring_period: "Monitoring Period",
    mrv_certifications: "Certifications",
    mrv_project_status: "Project Status",
    mrv_baseline_title: "Baseline",
    mrv_location: "Location",
    mrv_coordinates: "Coordinates",
    mrv_ecosystem_distribution: "Ecosystem Distribution",
    mrv_ecosystem_details: "Ecosystem Details",
    mrv_ecosystem_type: "Ecosystem Type",
    mrv_area: "Area",
    mrv_percentage: "Percentage",
    mrv_map_placeholder: "Map",
    mrv_map_desc: "Interactive map to view ecosystem distribution",
    mrv_stock_title: "Water Resources",
    mrv_initial_stock: "Initial Stock",
    mrv_current_stock: "Current Stock",
    mrv_stock_trend: "Stock Trend",
    mrv_actual_stock: "Actual Stock",
    mrv_target_stock: "Target Stock",
    mrv_methodology: "Methodology",
    mrv_water_fraction: "Water Fraction",
    mrv_conversion_factor: "Conversion Factor",
    mrv_emission_source: "Emission Source",
    mrv_allometric: "Allometric",
    mrv_mitigation_title: "Mitigation",
    mrv_gross_er: "Gross Emission Reduction",
    mrv_net_er: "Net Emission Reduction",
    mrv_after_deductions: "After Deductions",
    mrv_deductions: "Deductions",
    mrv_leakage: "Leakage",
    mrv_uncertainty: "Uncertainty",
    mrv_buffer: "Buffer",
    mrv_total_deductions: "Total Deductions",
    mrv_calculation: "Calculation",
    mrv_nek_title: "NEK",
    mrv_potential_spe: "Potential SPE",
    mrv_verified_spe: "Verified SPE",
    mrv_issued_spe: "Issued SPE",
    mrv_stage: "Stage",
    mrv_srnppi: "SRN-PPI",
    mrv_registration_number: "Registration Number",
    mrv_registration_date: "Registration Date",
    mrv_project_category: "Project Category",
    mrv_vintage_year: "Vintage Year",
    mrv_economic_title: "Economic Value",
    mrv_current_price: "Current Price",
    mrv_total_value: "Total Value",
    mrv_potential_value: "Potential Value",
    mrv_units_status: "Units Status",
    mrv_sold: "Sold",
    mrv_offset: "Offset",
    mrv_available: "Available",
    mrv_price_scenarios: "Price Scenarios",
    mrv_low_price: "Low Price",
    mrv_medium_price: "Medium Price",
    mrv_high_price: "High Price",
    mrv_recent_transactions: "Recent Transactions",
    mrv_completed: "Completed",
    mrv_compliance_title: "Compliance",
    mrv_srnppi_status: "SRN-PPI Status",
    mrv_double_counting: "Double Counting",
    mrv_blockchain_protected: "Blockchain Protected",
    mrv_buffer_permanence: "Buffer Permanence",
    mrv_required: "Required",
    mrv_held: "Held",
    mrv_fulfilled: "Fulfilled",
    mrv_reporting_obligation: "Reporting Obligation",
    mrv_frequency: "Frequency",
    mrv_next_deadline: "Next Deadline",
    mrv_reversal_risk: "Reversal Risk",
    mrv_fire_risk: "Fire Risk",
    mrv_logging_risk: "Logging Risk",
    mrv_policy_risk: "Policy Risk",
    mrv_overall_risk: "Overall Risk",
    mrv_maintenance_obligation: "Maintenance Obligation",
    mrv_period: "Period",
    mrv_start_date: "Start Date",
    mrv_end_date: "End Date",
    mrv_active_certifications: "Active Certifications",
    mrv_valid_until: "Valid Until",
    mrv_download_report: "Download Report",
    mrv_share_stakeholders: "Share with Stakeholders",

    // NRECA Model
    nreca_tab_params: "⚙️ Model Parameters",
    nreca_tab_data: "📋 Rainfall & PET Data",
    nreca_tab_results: "📊 Results & Statistics",
    nreca_tab_charts: "📈 Calibration Charts",
    nreca_reset: "Reset",
    nreca_params_title: "NRECA Calibration Parameters",
    nreca_params_subtitle: "PSUB · GWF · Cr · Initial Storage · Catchment Area",
    nreca_params_main: "Main Parameters",
    nreca_psub_hint: "0.3 = impervious soil  |  0.9 = highly permeable",
    nreca_gwf_hint: "0.2 = slow baseflow  |  0.8 = fast baseflow",
    nreca_cr_label: "Cr — ET Reduction Coefficient",
    nreca_cr_hint: "PET correction factor based on land slope",
    nreca_run_btn: "▶ Run NRECA Model",
    nreca_results_title: "Calibration Results & Statistics",
    nreca_results_subtitle: "Mean · Min · Max · NSE · Pearson Correlation",
    nreca_charts_subtitle:
      "Time Series · Duration Curve · Moisture Storage · GW Storage",
    nreca_chart_timeseries_title: "CALIBRATION TIME SERIES — STREAMFLOW (M³/S)",
    nreca_chart_timeseries_xaxis: "X-axis: Time (Month–Year)",
    nreca_chart_timeseries_yaxis:
      "Y-axis: Streamflow Q (m³/s) — flow rate per second",
    nreca_chart_duration_title: "FLOW DURATION CURVE — CALIBRATION",
    nreca_chart_duration_xaxis: "X-axis: Exceedance Probability P (0–1)",
    nreca_chart_duration_yaxis: "Y-axis: Streamflow Q (m³/s)",
    nreca_chart_duration_tip:
      "💡 P=0.05 → flow exceeded 5% of time (flood)  ·  P=0.95 → flow exceeded 95% of time (dry season)",
    nreca_rekap_title: "Flow Duration Summary",
    nreca_rekap_subtitle:
      "Streamflow at key exceedance probabilities — used for engineering & hydrology planning",
    nreca_rekap_col_prob: "Exceedance Probability",
    nreca_rekap_col_qobs: "Q Obs (m³/s)",
    nreca_rekap_col_qmodel: "Q Model (m³/s)",
    nreca_rekap_col_use: "Use Case",
    nreca_rekap_method_note:
      "📌 Method: Weibull plotting position — P = m/(n+1) where m = rank (descending) and n = total data points",
    nreca_rekap_q95_use: "Hydropower (dependable flow)",
    nreca_rekap_q90_use: "Domestic & Industrial Supply",
    nreca_rekap_q80_use: "Irrigation",
    nreca_rekap_q60_use: "Dam / Reservoir Design",
    nreca_rekap_q50_use: "Mean Annual Flow Availability",
    nreca_rekap_q40_use: "Flood Analysis (Lower Bound)",
    nreca_rekap_q20_use: "Flood Analysis (Design)",
    nreca_nse_formula_title: "NSE Formula",
    nreca_nse_class_title: "NSE Classification (Moriasi et al.)",
    nreca_metric_guide_title: "Abbreviations & Metrics Guide",
    nreca_axis_xaxis: "X-axis",
    nreca_axis_yaxis: "Y-axis",
    nreca_calib_very_good: "Calibration: VERY GOOD ✓",
    nreca_calib_good: "Calibration: GOOD ✓",
    nreca_calib_satisfactory:
      "Calibration: SATISFACTORY — parameter adjustment needed",
    nreca_calib_unsatisfactory:
      "Calibration: UNSATISFACTORY — adjust PSUB, GWF, Cr",
    nreca_no_obs: "Enter observed data to compute NSE",
    nreca_run_first: "Run the NRECA model to view results",
    nreca_mean_obs: "Mean Observed Data",
    nreca_mean_model: "Mean Model",
    nreca_corr_coef: "Correlation Coef. (r)",
    nreca_min_data_model: "Min Data / Model",
    nreca_max_data_model: "Max Data / Model",
    nreca_nom_formula: "Nom = 100 + 0.2·Ra",
    nreca_table_title: "Full Results Table (21 Columns)",
    nreca_table_subtitle: "All NRECA model intermediate variables per month",
    nreca_table_show: "Show",
    nreca_table_hide: "Hide",

    // NRECA Metric Guide Descriptions
    nreca_metric_nse_desc:
      "Measures how well the model reproduces observed data. Closer to 1 = better. NSE = 1 means perfect model.",
    nreca_metric_nse_range: "Best: close to 1",
    nreca_metric_r_desc:
      "Measures the linear correlation between modeled and observed streamflow. Ranges from -1 to 1.",
    nreca_metric_r_range: "Best: close to 1",
    nreca_metric_qcomp_desc:
      "Streamflow computed by the NRECA model based on calibration parameters and rainfall-PET input.",
    nreca_metric_qcomp_range: "Compare with Qobs",
    nreca_metric_qobs_desc:
      "Observed streamflow measured at a gauging station. Used as the calibration reference.",
    nreca_metric_qobs_range: "Field reference data",
    nreca_metric_pet_desc:
      "Potential Evapotranspiration (mm): water that could evaporate if supply is unlimited. Multiplied by correction factor Cr.",
    nreca_metric_pet_range: "Model input, unit mm",
    nreca_metric_aet_desc:
      "Actual Evapotranspiration (mm): portion of PET that actually occurs, depending on soil moisture (STOR_RATIO).",
    nreca_metric_aet_range: "AET ≤ PET always",
    nreca_metric_psub_desc:
      "Fraction of excess moisture that recharges the groundwater reservoir. Remainder (1−PSUB) becomes direct runoff.",
    nreca_metric_psub_range: "0 – 1 (typically 0.5–0.9)",
    nreca_metric_gwf_desc:
      "Fraction of groundwater storage that exits as baseflow each month. Small = slow baseflow release.",
    nreca_metric_gwf_range: "0 – 1 (typically 0.1–0.3)",
    nreca_metric_nom_desc:
      "Nom = 100 + 0.2×Ra is the nominal soil storage capacity (mm). Ra = mean annual rainfall (mm).",
    nreca_metric_nom_range: "Auto-calculated from Ra",
    nreca_metric_cr_desc:
      "Multiplication factor to adjust PET to local watershed conditions. Value < 1 = lower effective PET.",
    nreca_metric_cr_range: "0.5 – 1.2 (typically ≈ 0.8)",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("id");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["id", "en"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      setLanguage("id");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
