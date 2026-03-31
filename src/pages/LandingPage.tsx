import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, TrendingUp, ShieldCheck, BarChart3, Leaf, Globe, ArrowRight, CheckCircle2, Mail, Phone, MapPin, Globe2, Building2, Users } from "lucide-react";

export const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"en" | "id">("en");
  const [activeProjectTab, setActiveProjectTab] = useState<"community" | "corporate">("community");
  const [dynamicProjects, setDynamicProjects] = useState<any[]>([]);
  const [formState, setFormState] = useState({ companyName: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('hydrex-projects-v2') || '[]');
      if (stored && stored.length > 0) {
        const coms = stored.filter((p:any) => p.category === 'community').slice(0,3);
        const corps = stored.filter((p:any) => p.category === 'corporate').slice(0,3);
        const mapped = [...coms, ...corps].map((p:any) => {
           const isCorp = p.category === 'corporate';
           return {
              type: p.category,
              name: p.title,
              location: p.location?.regency ? `${p.location.regency}, ${p.location.province}` : p.location?.province,
              industry: p.corporateData?.industry || 'Manufacturing',
              impact: isCorp 
                       ? `${p.corporateData?.surplusDeficit >= 0 ? 'Surplus' : 'Deficit'}: ${Math.abs(p.corporateData?.surplusDeficit || 0).toLocaleString()} m³`
                       : `${Number(p.waterData?.estimatedCredits || 0).toLocaleString()} m³/yr`,
              status: p.status === 'verified' ? (isCorp ? 'Approved Quota' : 'Verified / Active') : (isCorp ? 'Pending Compliance' : 'Under Verification'),
              img: p.coverImage
           };
        });
        setDynamicProjects(mapped);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: null, msg: "" });

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (data.success) {
        setFormStatus({ type: 'success', msg: data.message });
        setFormState({ companyName: "", email: "", message: "" });
      } else {
        setFormStatus({ type: 'error', msg: data.message || "Something went wrong." });
      }
    } catch (error) {
      setFormStatus({ type: 'error', msg: "Connection failed. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = {
    en: {
      nav: { about: "About", solutions: "Solutions", projects: "Projects", contact: "Contact", signin: "Sign In" },
      hero: {
        badge: "Next-Gen Conservation Platform",
        title: "Water Credit",
        subtitle: "Intelligence Exchange",
        desc: "Building scalable infrastructure for trackable, verified, and economically viable water conservation.",
        btn1: "Discover More",
        btn2: "Our Solutions"
      },
      about: {
        title: "About HydrEx",
        heading: "Bridging the Gap for Global Sustainability",
        desc: "We are an innovative exchange connecting local community-based water conservation initiatives (such as spring reforestation and rainwater harvesting) with global corporations seeking 'Water Credits' to achieve their ESG targets.",
        desc2: "Through the adoption of Blockchain technology and a decentralized database architecture, HydrEx guarantees absolute transparency from upstream to downstream. Every cubic meter of water is certified with a tamper-proof audit trail.",
        points: ["Transparent & Anti Double-Counting", "High Precision MRV Validated Offsets", "Instant Impact Funding for Crisis Areas"]
      },
      solutions: {
        title: "Platform Solutions",
        heading: "Core Ecosystem Features",
        desc: "Comprehensive enterprise-grade solutions to track, verify, and transact water conservation credits securely and accurately.",
        cards: [
          { label: "MRV Project Certification", desc: "Rigorous Monitoring, Reporting, and Verification standards to ensure traceability and eliminate double-counting." },
          { label: "Water Credit Trading", desc: "A secure marketplace connecting local developers with global buyers, ensuring high liquidity and fair pricing." },
          { label: "Water Calculator", desc: "Automated tools to calculate your corporate operational water footprint and recommend necessary offset volumes." },
          { label: "Real-time Dashboard", desc: "Monitor project performance live with IoT sensor integration directly fed into an immutable blockchain ledger." },
          { label: "ESG Scoring & Reporting", desc: "Dedicated corporate reporting modules to meet global Environmental, Social, and Governance compliance." },
          { label: "Global Standards", desc: "Internationally recognized framework, audited by independent Verification Bodies (VVB)." },
        ]
      },
      projects: {
        title: "Featured Projects",
        heading: "Live Market Intelligence",
        desc: "Explore top-tier verified water conservation initiatives and corporate offset programs extracted right from our master data records.",
        communityTab: "Community Initiatives (Supply)",
        corporateTab: "Corporate Quotas (Demand)",
        metrics: {
          location: "Location: ",
          industry: "Industry: ",
          impact: "Net Impact: ",
          status: "Status: "
        },
        items: [
          // Community
          { type: 'community', name: "East Kalimantan Wetland & Peatland", location: "Kutai Kartanegara, Indonesia", impact: "85,000 m³/yr", status: "Under Verification", img: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&q=85" },
          { type: 'community', name: "Citarum Hulu Drip Irrigation", location: "Bandung, Indonesia", impact: "42,000 m³/yr", status: "Active Participant", img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=85" },
          { type: 'community', name: "Bali Subak Traditional Irrigation", location: "Tabanan, Indonesia", impact: "22,000 m³/yr", status: "Active Participant", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=85" },
          // Corporate
          { type: 'corporate', name: "PT Semen Gresik Water Efficiency", industry: "Cement Manufacturing", impact: "Surplus: 850,000 m³ (Seller)", status: "Approved Quota", img: "https://images.unsplash.com/photo-1581093458791-9d09c8a3a7b6?w=800&q=85" },
          { type: 'corporate', name: "Danone AQUA Water Stewardship", industry: "Food & Beverage", impact: "Deficit: -320,000 m³ (Buyer)", status: "Pending Compliance", img: "https://images.unsplash.com/photo-1533483595632-c5f0e57a1936?w=800&q=85" },
          { type: 'corporate', name: "PT Krakatau Steel Reduction", industry: "Iron & Steel Production", impact: "Surplus: 3,100,000 m³ (Seller)", status: "Approved Quota", img: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=85" }
        ]
      },
      contact: {
        title: "Get In Touch",
        heading: "Ready to Collaborate?",
        desc: "Elevate your corporate sustainability portfolio. Our platform is designed for multinationals and governments to discover the most valid green assets.",
        email: "hydrex@gmail.com",
        phone: "+62 811-9999-0000",
        address: "Jakarta Selatan, Indonesia",
        formHeading: "Schedule an Exclusive Demo",
        fName: "Company Name",
        fEmail: "Business Email",
        fMsg: "Describe your specific needs",
        fSend: "Send Request",
      }
    },
    id: {
      nav: { about: "Tentang", solutions: "Solusi", projects: "Proyek", contact: "Kontak", signin: "Masuk" },
      hero: {
        badge: "Platform Konservasi Generasi Baru",
        title: "Water Credit",
        subtitle: "Intelligence Exchange",
        desc: "Infrastruktur pelestarian air yang dapat diukur, diverifikasi, dan dinilai secara ekonomi untuk masa depan yang berkelanjutan.",
        btn1: "Pelajari Lebih Lanjut",
        btn2: "Solusi Kami"
      },
      about: {
        title: "Tentang HydrEx",
        heading: "Menjembatani Konservasi Air Lokal dan Pasar Global",
        desc: "Kami adalah bursa interaktif yang menghubungkan inisiatif konservasi air berbasis komunitas (seperti reboisasi mata air dan panen hujan) dengan korporasi raksasa yang membutuhkan 'Kredit Air' untuk mencapai target kelestarian (ESG) mereka.",
        desc2: "Melalui teknologi Blockchain, HydrEx menjamin transparansi absolut dari hulu ke hilir. Setiap meter kubik air tersertifikasi dengan jejak audit yang tidak bisa dipalsukan.",
        points: ["Transparan & Anti Pencatatan Ganda", "Perhitungan Offset Presisi Tervalidasi MRV", "Dampak Pendanaan Langsung ke Area Krisis"]
      },
      solutions: {
        title: "Solusi Platform",
        heading: "Fitur Utama Ekosistem",
        desc: "Layanan tingkat enterprise yang komprehensif untuk melacak, memverifikasi, dan mentransaksikan kredit konservasi air secara aman dan akurat.",
        cards: [
          { label: "Sertifikasi Proyek MRV", desc: "Standar ketat untuk Monitoring, Reporting, dan Verification guna memastikan keterlacakan dan menghilangkan penghitungan ganda." },
          { label: "Perdagangan Kredit Air", desc: "Marketplace aman untuk menghubungkan pengembang lokal dengan pembeli global, menjamin likuiditas dan harga adil." },
          { label: "Kalkulator Air", desc: "Alat otomatis untuk menghitung jejak air operasional perusahaan Anda dan merekomendasikan volume offset." },
          { label: "Dasbor Pemantauan Real-time", desc: "Pantau performa proyek langsung (live) menggunakan sensor IoT yang terhubung ke buku besar blockchain tak terubah." },
          { label: "Penilaian & Pelaporan ESG", desc: "Modul pelaporan khusus korporasi untuk memenuhi kepatuhan Lingkungan, Sosial, dan Tata Kelola global." },
          { label: "Standar Global Berpengawasan", desc: "Kerangka kerja bertaraf internasional yang terus diaudit oleh badan verifikasi independen (VVB)." },
        ]
      },
      projects: {
        title: "Proyek Unggulan",
        heading: "Aktivitas Pasar Langsung",
        desc: "Jelajahi inisiatif konservasi air terverifikasi dan program offset korporat berskala besar yang kami sarikan langsung dari Master Data kami.",
        communityTab: "Inisiatif Komunitas (Supply)",
        corporateTab: "Kuota Korporat (Demand)",
        metrics: {
          location: "Lokasi: ",
          industry: "Industri: ",
          impact: "Dampak Netto: ",
          status: "Status: "
        },
        items: [
          // Community
          { type: 'community', name: "Restorasi Gambut Kutai Kartanegara", location: "Kutai Kartanegara, Indonesia", impact: "85.000 m³/tahun", status: "Dalam Verifikasi", img: "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&q=85" },
          { type: 'community', name: "Efisiensi Irigasi Tetes Citarum Hulu", location: "Bandung, Indonesia", impact: "42.000 m³/tahun", status: "Aktif Berjalan", img: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=85" },
          { type: 'community', name: "Efisiensi Irigasi Subak Bali", location: "Tabanan, Indonesia", impact: "22.000 m³/tahun", status: "Aktif Berjalan", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=85" },
          // Corporate
          { type: 'corporate', name: "Efisiensi Air PT Semen Gresik", industry: "Manufaktur Semen", impact: "Surplus: 850.000 m³ (Penjual)", status: "Kuota Disetujui", img: "https://images.unsplash.com/photo-1581093458791-9d09c8a3a7b6?w=800&q=85" },
          { type: 'corporate', name: "Danone AQUA Water Stewardship", industry: "Makanan & Minuman", impact: "Defisit: -320.000 m³ (Pembeli)", status: "Wajib Beli Offset", img: "https://images.unsplash.com/photo-1533483595632-c5f0e57a1936?w=800&q=85" },
          { type: 'corporate', name: "Reduksi Air PT Krakatau Steel", industry: "Produksi Besi & Baja", impact: "Surplus: 3.100.000 m³ (Penjual)", status: "Kuota Disetujui", img: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=85" }
        ]
      },
      contact: {
        title: "Hubungi Kami",
        heading: "Siap Berkolaborasi Bersama?",
        desc: "Tingkatkan portfolio keberlanjutan perusahaan Anda. Platform ini didesain khusus untuk institusi dalam mencari sumber daya hijau yang paling valid.",
        email: "hydrex@gmail.com",
        phone: "+62 811-9999-0000",
        address: "Jakarta Selatan, Indonesia",
        formHeading: "Jadwalkan Demo Eksklusif",
        fName: "Nama Perusahaan",
        fEmail: "Email Perusahaan",
        fMsg: "Jelaskan kebutuhan spesifik Anda",
        fSend: "Kirim Permintaan",
      }
    }
  };

  const current = t[lang];

  return (
    <div className="bg-[#f8fafc] font-sans selection:bg-emerald-500/30 overflow-x-hidden text-slate-800" style={{ backgroundColor: "#f8fafc" }}>
      
      {/* ----------------- NAVBAR (SLIMMER WHITE SOLID BAR) ----------------- */}
      <nav 
        className={`fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-2 md:py-3 md:px-12 transition-all duration-300 z-50`}
        style={{ backgroundColor: "#ffffff", borderBottom: scrolled ? "1px solid #e2e8f0" : "none", boxShadow: scrolled ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none" }}
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <img src="/logo.png" alt="HydrEx" className="h-8 md:h-10 w-auto object-contain" style={{ minWidth: "32px" }} />
          <span className="text-xl md:text-2xl font-black tracking-widest text-[#0f172a]" style={{ fontFamily: "'Orbitron', sans-serif", color: "#0f172a" }}>
            HYDR<span style={{ color: "#059669" }}>EX</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          <a href="#about" onClick={(e) => scrollToSection(e, 'about')} style={{ color: "#334155", fontWeight: "bold" }} className="hover:text-emerald-600 transition-colors">{current.nav.about}</a>
          <a href="#solution" onClick={(e) => scrollToSection(e, 'solution')} style={{ color: "#334155", fontWeight: "bold" }} className="hover:text-emerald-600 transition-colors">{current.nav.solutions}</a>
          <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')} style={{ color: "#334155", fontWeight: "bold" }} className="hover:text-emerald-600 transition-colors">{current.nav.projects}</a>
          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} style={{ color: "#334155", fontWeight: "bold" }} className="hover:text-emerald-600 transition-colors">{current.nav.contact}</a>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setLang(lang === "en" ? "id" : "en")}
            className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded border border-slate-300 hover:bg-slate-100 transition-colors font-bold text-slate-700 text-sm md:text-base"
            style={{ borderColor: "#cbd5e1", color: "#334155" }}
          >
            <Globe2 className="w-4 h-4" />
            {lang.toUpperCase()}
          </button>
          
          <Link 
            to="/login"
            className="px-6 py-2 md:px-8 md:py-2.5 rounded-full text-sm md:text-base font-black transition-all transform hover:-translate-y-0.5"
            style={{ fontFamily: "'Space Grotesk', sans-serif", backgroundColor: "#059669", color: "#ffffff", boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)" }}
          >
            {current.nav.signin}
          </Link>
        </div>
      </nav>

      {/* ----------------- HERO SECTION ----------------- */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-12 w-full text-center">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundImage: 'url("/images/20-08-28-1852_original.webp")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute inset-0 bg-slate-950/70 bg-gradient-to-b from-transparent to-slate-950/90"></div>
        </div>

        <div className="relative z-10 w-full px-6 flex flex-col items-center justify-center h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={lang}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center w-full max-w-5xl"
            >
              <div className="inline-flex items-center justify-center gap-3 px-8 py-3 rounded-full mb-8 backdrop-blur-md" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.5)" }}>
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "#34d399" }}></span>
                <span className="text-sm font-black tracking-widest uppercase shadow-sm" style={{ color: "#a7f3d0", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {current.hero.badge}
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight drop-shadow-2xl mb-4" style={{ color: "#ffffff", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
                {current.hero.title}
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 drop-shadow-xl" style={{ color: "#e2e8f0", textShadow: "0 4px 15px rgba(0,0,0,0.8)" }}>
                {current.hero.subtitle}
              </h2>

              <p className="text-xl md:text-2xl font-semibold mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-lg" style={{ color: "#f8fafc", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>
                {current.hero.desc}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center w-full">
                <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="px-10 py-4 rounded-full font-black text-lg transition-transform hover:scale-105 flex items-center justify-center gap-3 w-full sm:w-auto" style={{ backgroundColor: "#10b981", color: "#022c22", boxShadow: "0 4px 20px rgba(16,185,129,0.5)" }}>
                  {current.hero.btn1}
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#solution" onClick={(e) => scrollToSection(e, 'solution')} className="px-10 py-4 rounded-full font-black text-lg transition-transform hover:scale-105 flex items-center justify-center w-full sm:w-auto" style={{ backgroundColor: "rgba(0,0,0,0.4)", color: "#ffffff", border: "2px solid rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}>
                  {current.hero.btn2}
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ----------------- ABOUT SECTION ----------------- */}
      <section id="about" className="py-20 md:py-32 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[40px] p-10 md:p-16"
            style={{ border: "1px solid #f1f5f9", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)" }}
          >
            <h2 className="text-base font-black tracking-widest uppercase mb-4 text-center" style={{ color: "#059669" }}>{current.about.title}</h2>
            <h3 className="text-4xl md:text-5xl font-black mb-10 text-center leading-tight" style={{ color: "#0f172a" }}>{current.about.heading}</h3>
            
            <p className="text-xl font-medium mb-8 leading-relaxed text-center max-w-4xl mx-auto" style={{ color: "#475569" }}>
              {current.about.desc}
            </p>
            <p className="text-xl font-medium mb-16 leading-relaxed text-center max-w-4xl mx-auto" style={{ color: "#475569" }}>
              {current.about.desc2}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              {current.about.points.map((pt, i) => (
                <div key={i} className="p-8 rounded-3xl" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <CheckCircle2 className="w-10 h-10 mb-6" style={{ color: "#10b981" }} />
                  <h4 className="text-xl font-bold" style={{ color: "#1e293b" }}>{pt}</h4>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ----------------- SOLUTIONS (FEATURES) SECTION ----------------- */}
      <section id="solution" className="py-20 md:py-32 flex flex-col justify-center" style={{ backgroundColor: "#f1f5f9" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-base font-black tracking-widest uppercase mb-4" style={{ color: "#059669" }}>{current.solutions.title}</h2>
            <h3 className="text-4xl md:text-5xl font-black mb-6" style={{ color: "#0f172a" }}>{current.solutions.heading}</h3>
            <p className="text-xl font-medium" style={{ color: "#475569" }}>{current.solutions.desc}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {current.solutions.cards.map((f, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-[30px] p-8 md:p-10 transition-all hover:-translate-y-2 group"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-colors" style={{ backgroundColor: "#ecfdf5" }}>
                  {[<ShieldCheck/>, <TrendingUp/>, <Droplets/>, <BarChart3/>, <Leaf/>, <Globe/>][idx % 6]}
                </div>
                <h4 className="text-2xl font-black mb-4" style={{ color: "#0f172a" }}>{f.label}</h4>
                <p className="text-lg leading-relaxed font-medium" style={{ color: "#475569" }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- FEATURED PROJECTS AREA ----------------- */}
      <section id="projects" className="py-20 md:py-32 flex flex-col justify-center" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-base font-black tracking-widest uppercase mb-4" style={{ color: "#059669" }}>{current.projects.title}</h2>
            <h3 className="text-4xl md:text-5xl font-black mb-6" style={{ color: "#0f172a" }}>{current.projects.heading}</h3>
            <p className="text-xl font-medium mb-10" style={{ color: "#475569" }}>{current.projects.desc}</p>
            
            <div className="inline-flex rounded-full p-1" style={{ backgroundColor: "#f1f5f9" }}>
              <button 
                onClick={() => setActiveProjectTab("community")}
                className={`px-6 py-3 rounded-full font-bold text-sm md:text-base transition-colors ${activeProjectTab === "community" ? "" : "hover:text-emerald-700"}`}
                style={{ 
                  backgroundColor: activeProjectTab === "community" ? "#ffffff" : "transparent",
                  color: activeProjectTab === "community" ? "#0f172a" : "#64748b",
                  boxShadow: activeProjectTab === "community" ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none"
                }}
              >
                {current.projects.communityTab}
              </button>
              <button 
                onClick={() => setActiveProjectTab("corporate")}
                className={`px-6 py-3 rounded-full font-bold text-sm md:text-base transition-colors ${activeProjectTab === "corporate" ? "" : "hover:text-emerald-700"}`}
                style={{ 
                  backgroundColor: activeProjectTab === "corporate" ? "#ffffff" : "transparent",
                  color: activeProjectTab === "corporate" ? "#0f172a" : "#64748b",
                  boxShadow: activeProjectTab === "corporate" ? "0 4px 6px -1px rgba(0,0,0,0.05)" : "none"
                }}
              >
                {current.projects.corporateTab}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeProjectTab + lang}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-3 gap-8"
            >
              { (dynamicProjects.length > 0 ? dynamicProjects : current.projects.items).filter(item => item.type === activeProjectTab).map((proj, idx) => (
                <div key={idx} className="rounded-[30px] overflow-hidden transition-all hover:-translate-y-2 flex flex-col h-full" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}>
                  <div className="h-44 w-full relative shrink-0">
                    <img src={proj.img} alt={proj.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#0f172a" }}>
                      {proj.status}
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                    <h4 className="text-xl font-black mb-4 min-h-[3.5rem]" style={{ color: "#0f172a" }}>{proj.name}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm font-medium" style={{ color: "#475569" }}>
                        {activeProjectTab === "community" ? <MapPin className="w-4 h-4 text-emerald-500" /> : <Building2 className="w-4 h-4 text-blue-500" />}
                        <span>{activeProjectTab === "community" ? current.projects.metrics.location : current.projects.metrics.industry} <b>{(proj as any).location || (proj as any).industry}</b></span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium" style={{ color: "#475569" }}>
                        <Droplets className="w-4 h-4 text-emerald-500" />
                        <span>{current.projects.metrics.impact} <b className="text-emerald-600">{proj.impact}</b></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ----------------- CONTACT SECTION ----------------- */}
      <section id="contact" className="py-20 md:py-32 flex items-center justify-center relative" style={{ backgroundColor: "#0f172a" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            
            <div>
              <h2 className="text-base font-black tracking-widest uppercase mb-4" style={{ color: "#34d399" }}>{current.contact.title}</h2>
              <h3 className="text-4xl md:text-5xl font-black mb-6 leading-tight" style={{ color: "#ffffff" }}>{current.contact.heading}</h3>
              <p className="text-xl mb-12 font-medium leading-relaxed" style={{ color: "#94a3b8" }}>
                {current.contact.desc}
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#1e293b" }}>
                    <Mail className="w-8 h-8" style={{ color: "#34d399" }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: "#ffffff" }}>Email</p>
                    <p className="text-lg" style={{ color: "#94a3b8" }}>{current.contact.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#1e293b" }}>
                    <Phone className="w-8 h-8" style={{ color: "#34d399" }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: "#ffffff" }}>Phone</p>
                    <p className="text-lg" style={{ color: "#94a3b8" }}>{current.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#1e293b" }}>
                    <MapPin className="w-8 h-8" style={{ color: "#34d399" }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: "#ffffff" }}>Headquarters</p>
                    <p className="text-lg" style={{ color: "#94a3b8" }}>{current.contact.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[40px] p-10 md:p-14" style={{ backgroundColor: "#ffffff", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
              <h4 className="text-3xl font-black mb-10" style={{ color: "#0f172a" }}>{current.contact.formHeading}</h4>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-bold uppercase mb-3" style={{ color: "#475569" }}>{current.contact.fName}</label>
                  <input 
                    type="text" 
                    name="companyName"
                    required
                    value={formState.companyName}
                    onChange={handleFormChange}
                    placeholder="Grup Konservasi Internasional" 
                    className="w-full rounded-2xl px-6 py-4 font-medium transition-all focus:ring-2 focus:ring-emerald-500 outline-none" 
                    style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-3" style={{ color: "#475569" }}>{current.contact.fEmail}</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleFormChange}
                    placeholder="ceo@company.com" 
                    className="w-full rounded-2xl px-6 py-4 font-medium transition-all focus:ring-2 focus:ring-emerald-500 outline-none" 
                    style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-3" style={{ color: "#475569" }}>{current.contact.fMsg}</label>
                  <textarea 
                    name="message"
                    required
                    value={formState.message}
                    onChange={handleFormChange}
                    rows={4} 
                    className="w-full rounded-2xl px-6 py-4 font-medium resize-none transition-all focus:ring-2 focus:ring-emerald-500 outline-none" 
                    style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
                  ></textarea>
                </div>
                
                {formStatus.type && (
                  <div className={`p-4 rounded-xl text-sm font-bold ${formStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {formStatus.msg}
                  </div>
                )}

                <button 
                  disabled={isSubmitting}
                  className="w-full font-black text-xl py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: "#10b981", color: "#ffffff", boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       Processing...
                    </span>
                  ) : current.contact.fSend}
                </button>
              </form>
            </div>
            
          </div>

          {/* FOOTER */}
          <div className="mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="HydrEx" className="w-8 h-8 object-contain" style={{ filter: "grayscale(100%)", opacity: 0.5 }} />
              <span className="font-bold tracking-widest text-base" style={{ color: "#94a3b8" }}>HYDREX &copy; 2026. All rights reserved.</span>
            </div>
            <div className="flex gap-8 text-base font-bold" style={{ color: "#64748b" }}>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
