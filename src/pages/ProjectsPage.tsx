/**
 * ============================================================================
 * HYDREX WATER CREDIT - PROJECTS PAGE (COMPLETE - SINGLE FILE)
 * ============================================================================
 * Version: 4.0 FINAL
 * ✅ export const ProjectsPage  → fixes ts(2305) in App.tsx
 * ✅ Bilingual ID/EN
 * ✅ RBAC: Admin sees ALL, Company sees OWN
 * ✅ Location picker: autocomplete provinsi + negara
 * ✅ Admin modals: Approve, Reject, Assign VVB, Certify
 * ✅ ProjectDetailModal 5 tabs: Overview, Verification, Team, Documents, History
 * ✅ Compatible dengan ProjectContext.tsx & AuthContext.tsx
 * ✅ No dummy data — semua dari user input
 */

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  FolderKanban,
  Clock,
  Leaf,
  Users,
  MapPin,
  Eye,
  Trash2,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Building2,
  Award,
  Download,
  Circle,
  XCircle,
  Shield,
  ShoppingCart,
  BarChart3,
  Mail,
  Calendar,
  Info,
  UserCheck,
  Ban,
  ExternalLink,
  ChevronDown,
  Factory,
  TrendingUp,
  TrendingDown,
  Droplets,
  ArrowRightLeft,
  Handshake,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  useProjects,
  Project,
  ProjectStatus,
  CertificationStandard,
  Methodology,
  StepStatus,
} from "../context/ProjectContext";
import { useMarketplace } from "../context/MarketplaceContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

// ============================================================================
// CURRENCY CONVERSION HELPER
// ============================================================================
const toIDR = (amount: number, currency: string): number => {
  const rates: Record<string, number> = {
    IDR: 1,
    USD: 16000,
    MYR: 3500,
    SGD: 12000,
    EUR: 17500,
    GBP: 20500,
    AUD: 10500,
    JPY: 107,
    CNY: 2200,
    THB: 460,
    PHP: 280,
    VND: 0.64,
  };
  return amount * (rates[currency] || 1);
};

// ============================================================================
// STATUS COLORS
// ============================================================================
const statusColors: Record<
  ProjectStatus,
  { bg: string; text: string; label: string; labelEn: string }
> = {
  draft: {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    label: "Draft",
    labelEn: "Draft",
  },
  pending: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    label: "Menunggu Review",
    labelEn: "Pending Review",
  },
  under_verification: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    label: "Dalam Verifikasi",
    labelEn: "Under Verification",
  },
  verified: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    label: "Terverifikasi",
    labelEn: "Verified",
  },
  rejected: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Ditolak",
    labelEn: "Rejected",
  },
  running: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    label: "Berjalan",
    labelEn: "Running",
  },
  completed: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    label: "Selesai",
    labelEn: "Completed",
  },
};

// ============================================================================
// STEP STATUS CONFIG
// ============================================================================
const stepStatusConfig: Record<
  StepStatus,
  {
    icon: React.ReactNode;
    color: string;
    bg: string;
    label: string;
    labelEn: string;
  }
> = {
  completed: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: "#22c55e",
    bg: "bg-green-500/10",
    label: "Selesai",
    labelEn: "Completed",
  },
  active: {
    icon: <Clock className="w-5 h-5" />,
    color: "#3b82f6",
    bg: "bg-blue-500/10",
    label: "Sedang Berjalan",
    labelEn: "In Progress",
  },
  pending: {
    icon: <Circle className="w-5 h-5" />,
    color: "#64748b",
    bg: "bg-gray-500/10",
    label: "Belum Dimulai",
    labelEn: "Not Started",
  },
  failed: {
    icon: <XCircle className="w-5 h-5" />,
    color: "#ef4444",
    bg: "bg-red-500/10",
    label: "Gagal",
    labelEn: "Failed",
  },
};

// ============================================================================
// LOCATION DATA
// ============================================================================
interface LocationOption {
  country: string;
  countryEn: string;
  region: string;
  regionEn: string;
}

const makeOpts = (c: string, ce: string, regions: string[]): LocationOption[] =>
  regions.map((r) => ({ country: c, countryEn: ce, region: r, regionEn: r }));

const locationOptions: LocationOption[] = [
  ...makeOpts("Indonesia", "Indonesia", [
    "Aceh",
    "Sumatera Utara",
    "Sumatera Barat",
    "Riau",
    "Jambi",
    "Sumatera Selatan",
    "Bengkulu",
    "Lampung",
    "Kepulauan Bangka Belitung",
    "Kepulauan Riau",
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "DI Yogyakarta",
    "Jawa Timur",
    "Banten",
    "Bali",
    "Nusa Tenggara Barat",
    "Nusa Tenggara Timur",
    "Kalimantan Barat",
    "Kalimantan Tengah",
    "Kalimantan Selatan",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Sulawesi Utara",
    "Sulawesi Tengah",
    "Sulawesi Selatan",
    "Sulawesi Tenggara",
    "Gorontalo",
    "Sulawesi Barat",
    "Maluku",
    "Maluku Utara",
    "Papua",
    "Papua Barat",
    "Papua Selatan",
    "Papua Tengah",
    "Papua Pegunungan",
  ]),
  ...makeOpts("Malaysia", "Malaysia", [
    "Selangor",
    "Kuala Lumpur",
    "Johor",
    "Penang",
    "Sabah",
    "Sarawak",
    "Perak",
    "Pahang",
    "Kelantan",
    "Terengganu",
    "Negeri Sembilan",
    "Melaka",
    "Kedah",
    "Perlis",
  ]),
  {
    country: "Singapura",
    countryEn: "Singapore",
    region: "Singapura",
    regionEn: "Singapore",
  },
  ...makeOpts("Filipina", "Philippines", [
    "Metro Manila",
    "Cebu",
    "Davao",
    "Luzon",
    "Visayas",
    "Mindanao",
  ]),
  ...makeOpts("Vietnam", "Vietnam", [
    "Hanoi",
    "Ho Chi Minh City",
    "Da Nang",
    "Mekong Delta",
  ]),
  ...makeOpts("Thailand", "Thailand", [
    "Bangkok",
    "Chiang Mai",
    "Phuket",
    "Khon Kaen",
    "Pattaya",
  ]),
  ...makeOpts("India", "India", [
    "Maharashtra",
    "Tamil Nadu",
    "Karnataka",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
    "West Bengal",
    "Kerala",
    "Punjab",
  ]),
  ...makeOpts("Australia", "Australia", [
    "New South Wales",
    "Victoria",
    "Queensland",
    "Western Australia",
    "South Australia",
    "Tasmania",
    "Northern Territory",
  ]),
  ...makeOpts("Amerika Serikat", "United States", [
    "California",
    "Texas",
    "Florida",
    "New York",
    "Washington",
    "Oregon",
    "Colorado",
    "Arizona",
    "Georgia",
  ]),
  ...makeOpts("Brasil", "Brazil", [
    "Amazonas",
    "Pará",
    "Mato Grosso",
    "Bahia",
    "São Paulo",
    "Minas Gerais",
  ]),
  ...makeOpts("Tiongkok", "China", [
    "Guangdong",
    "Yunnan",
    "Sichuan",
    "Fujian",
    "Zhejiang",
  ]),
  ...makeOpts("Jepang", "Japan", [
    "Hokkaido",
    "Honshu",
    "Kyushu",
    "Shikoku",
    "Okinawa",
  ]),
  {
    country: "Korea Selatan",
    countryEn: "South Korea",
    region: "Seoul",
    regionEn: "Seoul",
  },
  {
    country: "Korea Selatan",
    countryEn: "South Korea",
    region: "Busan",
    regionEn: "Busan",
  },
  ...makeOpts("Kenya", "Kenya", ["Nairobi", "Mombasa", "Kisumu", "Nakuru"]),
  ...makeOpts("Nigeria", "Nigeria", ["Lagos", "Abuja", "Kano", "Ibadan"]),
  ...makeOpts("Afrika Selatan", "South Africa", [
    "Cape Town",
    "Johannesburg",
    "Durban",
    "Pretoria",
  ]),
  ...makeOpts("Kamboja", "Cambodia", ["Phnom Penh", "Siem Reap", "Battambang"]),
  ...makeOpts("Myanmar", "Myanmar", ["Yangon", "Mandalay", "Naypyidaw"]),
  ...makeOpts("Papua Nugini", "Papua New Guinea", [
    "Port Moresby",
    "Lae",
    "Madang",
  ]),
];

// ============================================================================
// LOCATION SEARCH INPUT
// ============================================================================
interface LocationSearchProps {
  value: string;
  onChange: (country: string, region: string) => void;
  language: "id" | "en";
}

const LocationSearchInput: React.FC<LocationSearchProps> = ({
  value,
  onChange,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered =
    query.length < 1
      ? locationOptions.slice(0, 15)
      : locationOptions
        .filter((o) => {
          const q = query.toLowerCase();
          return (
            o.region.toLowerCase().includes(q) ||
            o.regionEn.toLowerCase().includes(q) ||
            o.country.toLowerCase().includes(q) ||
            o.countryEn.toLowerCase().includes(q)
          );
        })
        .slice(0, 15);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelect = (opt: LocationOption) => {
    const display =
      language === "id"
        ? `${opt.region}, ${opt.country}`
        : `${opt.regionEn}, ${opt.countryEn}`;
    setQuery(display);
    onChange(
      language === "id" ? opt.country : opt.countryEn,
      language === "id" ? opt.region : opt.regionEn,
    );
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: theme.textMuted }}
        />
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={
            language === "id"
              ? "Ketik nama provinsi atau negara..."
              : "Type province or country name..."
          }
          className="w-full pl-9 pr-8 py-3 rounded-lg text-white placeholder:text-gray-500 focus:outline-none"
          style={{
            backgroundColor: theme.bgDark,
            border: `1px solid ${open ? theme.primary : theme.border}`,
            transition: "border-color 0.2s",
          }}
        />
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: theme.textMuted }}
        />
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-full mt-1 rounded-xl overflow-y-auto max-h-56"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm" style={{ color: theme.textMuted }}>
              {language === "id" ? "Tidak ditemukan" : "Not found"}
            </p>
          ) : (
            filtered.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors flex items-center justify-between gap-3"
              >
                <span className="text-sm" style={{ color: theme.textPrimary }}>
                  {language === "id" ? opt.region : opt.regionEn}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: `${theme.primary}20`,
                    color: theme.primary,
                  }}
                >
                  {language === "id" ? opt.country : opt.countryEn}
                </span>
              </button>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// PROJECT CARD
// ============================================================================
interface ProjectCardProps {
  project: Project;
  index: number;
  language: "id" | "en";
  isAdmin: boolean;
  onView: () => void;
  onDelete: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  language,
  isAdmin,
  onView,
  onDelete,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const s = statusColors[project.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="rounded-xl overflow-hidden cursor-pointer group"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.border}`,
      }}
      onClick={onView}
    >
      <div className="h-48 overflow-hidden relative">
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
          >
            {language === "id" ? s.label : s.labelEn}
          </span>
          {project.listedInMarketplace && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              {language === "id" ? "Terdaftar" : "Listed"}
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        <h3
          className="text-base font-bold mb-3 line-clamp-2 leading-snug"
          style={{ color: theme.textPrimary }}
        >
          {project.title}
        </h3>
        <div
          className="flex items-center gap-1.5 text-xs mb-2"
          style={{ color: theme.textMuted }}
        >
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {project.location.province}, {project.location.regency}
          </span>
        </div>
        {isAdmin && (
          <div
            className="flex items-center gap-1.5 text-xs mb-3"
            style={{ color: theme.textMuted }}
          >
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{project.ownerCompany}</span>
          </div>
        )}
        {/* Category badge */}
        <div className="flex items-center gap-2 mb-3">
          {(project as any).category === "corporate" ? (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "#f59e0b20",
                color: "#f59e0b",
                border: "1px solid #f59e0b40",
              }}
            >
              <Factory className="w-3 h-3" />
              {language === "id" ? "Korporat" : "Corporate"}
            </span>
          ) : (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${theme.secondary}20`,
                color: theme.secondary,
                border: `1px solid ${theme.secondary}40`,
              }}
            >
              <Users className="w-3 h-3" />
              {language === "id" ? "Komunitas" : "Community"}
            </span>
          )}
        </div>

        <div className="space-y-3 my-4">
          {(project as any).category === "corporate" &&
            (project as any).corporateData
            ? (() => {
              const cd = (project as any).corporateData;
              const isSell = cd.tradingIntent === "sell";
              return [
                [
                  language === "id" ? "Kuota Air" : "Water Quota",
                  `${cd.currentWaterQuota?.toLocaleString() ?? "-"} m³/thn`,
                  theme.textPrimary,
                ],
                [
                  language === "id" ? "Surplus/Defisit" : "Surplus/Deficit",
                  `${cd.surplusDeficit >= 0 ? "+" : ""}${cd.surplusDeficit?.toLocaleString() ?? "-"} m³`,
                  cd.surplusDeficit >= 0 ? "#22c55e" : "#ef4444",
                ],
                [
                  language === "id" ? "Harga / m³" : "Price / m³",
                  `${project.currency || "IDR"} ${cd.pricePerM3?.toLocaleString() ?? "-"}`,
                  theme.secondary,
                ],
              ].map(([lbl, val, col]: any[], i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm py-0.5"
                >
                  <span style={{ color: theme.textSecondary }}>{lbl}</span>
                  <span className="font-semibold" style={{ color: col }}>
                    {val}
                  </span>
                </div>
              ));
            })()
            : [
              [
                language === "id" ? "Luas Area" : "Area Size",
                `${project.areaHectares.toLocaleString()} ha`,
                theme.textPrimary,
              ],
              [
                language === "id" ? "Est. Kredit" : "Est. Credits",
                `${project.waterData.estimatedCredits.toLocaleString()} m³`,
                theme.primary,
              ],
              [
                language === "id" ? "Harga/m³" : "Price/m³",
                `${project.currency || "IDR"} ${project.waterData.pricePerCredit.toLocaleString()}`,
                theme.secondary,
              ],
            ].map(([lbl, val, col], i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm py-0.5"
              >
                <span style={{ color: theme.textSecondary }}>{lbl}</span>
                <span
                  className="font-semibold"
                  style={{ color: col as string }}
                >
                  {val}
                </span>
              </div>
            ))}
          {(project as any).category === "corporate" &&
            (project as any).corporateData ? (
            <div
              className="text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2"
              style={{ backgroundColor: theme.bgDark }}
            >
              <span
                className="truncate flex items-center gap-1"
                style={{
                  color:
                    (project as any).corporateData?.tradingIntent === "sell"
                      ? "#22c55e"
                      : "#3b82f6",
                }}
              >
                {(project as any).corporateData?.tradingIntent === "sell" ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    {language === "id" ? "Jual Surplus" : "Selling Surplus"}
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    {language === "id" ? "Beli Kuota" : "Buying Quota"}
                  </>
                )}
              </span>
              <span style={{ color: theme.border }}>|</span>
              <span className="truncate" style={{ color: theme.textMuted }}>
                {(project as any).corporateData?.industry || "-"}
              </span>
            </div>
          ) : (
            <div
              className="text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2"
              style={{ backgroundColor: theme.bgDark }}
            >
              <span className="truncate" style={{ color: theme.textMuted }}>
                {project.certificationStandard}
              </span>
              <span style={{ color: theme.border }}>|</span>
              <span className="truncate" style={{ color: theme.textMuted }}>
                {project.methodology.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          )}
        </div>
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: theme.textMuted }}>Progress</span>
            <span style={{ color: theme.primary }}>
              {project.progress || 0}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full"
            style={{ backgroundColor: theme.border }}
          >
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${project.progress || 0}%`,
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
              }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 flex items-center justify-center gap-1.5"
            style={{ backgroundColor: theme.primary, color: "white" }}
          >
            <Eye className="w-4 h-4" />
            {language === "id" ? "Lihat Detail" : "View Details"}
          </button>
          {!isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-3 py-2.5 rounded-lg transition-all hover:bg-red-500/10"
              style={{
                backgroundColor: theme.bgDark,
                color: theme.textMuted,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// UPLOAD PROJECT MODAL
// ============================================================================
interface UploadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  language: "id" | "en";
}

// ============================================================================
// MAP PICKER MODAL — Interactive Leaflet map, single-click to place marker
// ============================================================================
const MapPickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  language: "id" | "en";
}> = ({
  isOpen,
  onClose,
  onSelect,
  initialLat = -2.5,
  initialLng = 118.0,
  language,
}) => {
    const { theme: colorTheme } = useTheme();
    const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [pickedLat, setPickedLat] = useState<number | null>(null);
    const [pickedLng, setPickedLng] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [hasMarker, setHasMarker] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Listen for postMessage from iframe
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MessageEvent) => {
        if (e.data && e.data.type === "MAP_CLICK") {
          setPickedLat(parseFloat(parseFloat(e.data.lat).toFixed(6)));
          setPickedLng(parseFloat(parseFloat(e.data.lng).toFixed(6)));
          setHasMarker(true);
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, [isOpen]);

    // Reset on open
    useEffect(() => {
      if (isOpen) {
        setPickedLat(null);
        setPickedLng(null);
        setHasMarker(false);
        setSearchQuery("");
      }
    }, [isOpen]);

    const handleSearch = async () => {
      if (!searchQuery.trim()) return;
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
          { headers: { "Accept-Language": language === "id" ? "id,en" : "en" } },
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          iframeRef.current?.contentWindow?.postMessage(
            { type: "PAN_TO", lat, lng },
            "*",
          );
        }
      } catch (_) { }
      setIsSearching(false);
    };

    const mapHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%;overflow:hidden}
.leaflet-container{background:#0d1b2a;font-family:sans-serif}
.leaflet-tile-pane{filter:saturate(0.7) brightness(0.8)}
.custom-pin{
  width:0;height:0;
  border-left:14px solid transparent;
  border-right:14px solid transparent;
  border-top:28px solid #1e88e5;
  filter:drop-shadow(0 4px 12px rgba(30,136,229,0.8));
  position:relative;
}
.custom-pin::after{
  content:'';position:absolute;
  width:10px;height:10px;
  background:white;border-radius:50%;
  top:-26px;left:-5px;
  box-shadow:0 0 0 3px rgba(30,136,229,0.4);
}
.pin-pulse{
  position:absolute;
  width:48px;height:48px;
  border-radius:50%;
  border:2px solid #1e88e5;
  top:-48px;left:-24px;
  animation:ripple 1.6s ease-out infinite;
  pointer-events:none;
}
@keyframes ripple{0%{transform:scale(0.4);opacity:1}100%{transform:scale(2.2);opacity:0}}
.coord-tag{
  position:fixed;bottom:12px;left:50%;transform:translateX(-50%);
  background:rgba(10,20,40,0.96);
  border:1px solid #1e3a5f;
  border-radius:12px;
  padding:10px 20px;
  color:#fff;font-family:monospace;font-size:13px;
  display:flex;align-items:center;gap:10px;
  z-index:9999;min-width:320px;justify-content:center;
  box-shadow:0 8px 32px rgba(0,0,0,0.6);
  backdrop-filter:blur(8px);
}
.dot-live{width:8px;height:8px;background:#22c55e;border-radius:50%;
  box-shadow:0 0 8px #22c55e;flex-shrink:0;
  animation:blink 1.2s ease-in-out infinite alternate;}
@keyframes blink{from{opacity:0.4}to{opacity:1}}
.hint-bar{
  position:fixed;top:0;left:0;right:0;z-index:9999;
  background:linear-gradient(90deg,rgba(30,136,229,0.95),rgba(8,145,178,0.95));
  backdrop-filter:blur(4px);
  padding:11px 20px;color:white;
  font-family:sans-serif;font-size:13px;font-weight:500;
  display:flex;align-items:center;justify-content:center;gap:8px;
  letter-spacing:0.01em;
}
.hint-icon{font-size:16px;animation:bounce 1.4s ease infinite}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.leaflet-control-zoom{border:none!important;box-shadow:0 4px 16px rgba(0,0,0,0.4)!important}
.leaflet-control-zoom a{background:#111827!important;color:#94a3b8!important;border-color:#1e3a5f!important;width:32px!important;line-height:32px!important;}
.leaflet-control-zoom a:hover{background:#1e3a5f!important;color:white!important}
</style>
</head>
<body>
<div id="map"></div>
<div id="hint" class="hint-bar">
  <span class="hint-icon">📍</span>
  <span>${language === "id" ? "Klik sekali di peta untuk menandai lokasi proyek • Marker bisa digeser setelah dipasang" : "Click once on the map to mark project location • Marker can be dragged after placed"}</span>
</div>
<div id="coordTag" class="coord-tag" style="display:none">
  <div class="dot-live"></div>
  <span id="coordText">-</span>
</div>
<script>
var map = L.map('map',{zoomControl:true,attributionControl:true}).setView([${initialLat},${initialLng}],5);
map.attributionControl.setPrefix('');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19,
  attribution:'© OpenStreetMap contributors'
}).addTo(map);

var marker=null;

var pinIcon=L.divIcon({
  html:'<div class="custom-pin"><div class="pin-pulse"></div></div>',
  className:'',
  iconSize:[28,28],
  iconAnchor:[14,28],
  popupAnchor:[0,-32]
});

map.on('click',function(e){
  var lat=e.latlng.lat, lng=e.latlng.lng;
  if(marker){map.removeLayer(marker);}
  marker=L.marker([lat,lng],{icon:pinIcon,draggable:true}).addTo(map);
  marker.on('dragend',function(ev){
    var p=ev.target.getLatLng();
    setCoords(p.lat,p.lng);
  });
  setCoords(lat,lng);
  document.getElementById('hint').style.display='none';
});

function setCoords(lat,lng){
  var la=lat.toFixed(6), lo=lng.toFixed(6);
  document.getElementById('coordTag').style.display='flex';
  document.getElementById('coordText').textContent='Lat: '+la+'   Lng: '+lo;
  window.parent.postMessage({type:'MAP_CLICK',lat:parseFloat(la),lng:parseFloat(lo)},'*');
}

window.addEventListener('message',function(e){
  if(e.data&&e.data.type==='PAN_TO'){
    map.setView([e.data.lat,e.data.lng],12);
  }
});
<\/script>
</body>
</html>`;

    const encodedHtml = `data:text/html;charset=utf-8,${encodeURIComponent(mapHtml)}`;

    if (!isOpen) return null;

    return ReactDOM.createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 99999,
            padding: "20px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col rounded-2xl overflow-hidden w-full"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              maxWidth: "1040px",
              height: "90vh",
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(30,136,229,0.15)",
            }}
          >
            {/* ── HEADER ── */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{
                borderBottom: `1px solid ${theme.border}`,
                background: `linear-gradient(135deg, ${theme.bgCard}, rgba(30,136,229,0.06))`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}30, ${theme.secondary}20)`,
                    border: `1px solid ${theme.primary}40`,
                  }}
                >
                  <MapPin className="w-5 h-5" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    {language === "id"
                      ? "Pilih Lokasi Proyek"
                      : "Pick Project Location"}
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: theme.textSecondary }}
                  >
                    {language === "id"
                      ? "Klik sekali di peta → marker muncul & bisa digeser untuk presisi"
                      : "Single click on map → marker appears & can be dragged for precision"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-500/10"
                style={{
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── SEARCH BAR ── */}
            <div
              className="px-6 py-3 flex gap-3 items-center flex-shrink-0"
              style={{
                borderBottom: `1px solid ${theme.border}`,
                backgroundColor: `${theme.bgDark}90`,
              }}
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs flex-shrink-0"
                style={{
                  backgroundColor: `${theme.primary}15`,
                  color: theme.primary,
                  border: `1px solid ${theme.primary}30`,
                }}
              >
                <Search className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {language === "id" ? "Cari Lokasi" : "Search"}
                </span>
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={
                    language === "id"
                      ? "Ketik nama kota / wilayah / nama tempat..."
                      : "Type city name, region, or place name..."
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none transition-all"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                  }}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2 flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  opacity: isSearching || !searchQuery.trim() ? 0.5 : 1,
                  cursor:
                    isSearching || !searchQuery.trim()
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {language === "id" ? "Cari" : "Search"}
              </button>
            </div>

            {/* ── MAP ── */}
            <div className="flex-1 relative overflow-hidden">
              <iframe
                ref={iframeRef}
                src={encodedHtml}
                title="Map Picker"
                className="w-full h-full border-0 block"
                sandbox="allow-scripts allow-same-origin"
              />
              {/* Overlay hint saat belum ada marker */}
              {!hasMarker && (
                <div
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-medium pointer-events-none"
                  style={{
                    background: "rgba(10,20,40,0.9)",
                    border: `1px solid ${theme.primary}50`,
                    color: "white",
                    backdropFilter: "blur(8px)",
                    zIndex: 10,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}
                >
                  <span className="text-base">👆</span>
                  <span style={{ color: theme.textSecondary }}>
                    {language === "id"
                      ? "Klik di peta untuk menempatkan marker"
                      : "Click anywhere on the map to place marker"}
                  </span>
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div
              className="px-6 py-4 flex items-center gap-4 flex-shrink-0"
              style={{
                borderTop: `1px solid ${theme.border}`,
                background: `${theme.bgDark}80`,
              }}
            >
              {/* Koordinat result */}
              <div
                className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: hasMarker
                    ? `${theme.primary}10`
                    : theme.bgDark,
                  border: `1px solid ${hasMarker ? theme.primary + "40" : theme.border}`,
                  transition: "all 0.3s ease",
                }}
              >
                {hasMarker ? (
                  <>
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: "#22c55e",
                        boxShadow: "0 0 10px #22c55e80",
                      }}
                    />
                    <div>
                      <p
                        className="text-xs mb-0.5 font-medium"
                        style={{ color: "#22c55e" }}
                      >
                        ✓{" "}
                        {language === "id"
                          ? "Koordinat Berhasil Ditandai"
                          : "Location Marked Successfully"}
                      </p>
                      <p
                        className="font-mono text-sm font-bold"
                        style={{ color: theme.textPrimary }}
                      >
                        {pickedLat?.toFixed(6)}, {pickedLng?.toFixed(6)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setHasMarker(false);
                        setPickedLat(null);
                        setPickedLng(null);
                      }}
                      className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-red-500/10"
                      style={{
                        color: theme.textMuted,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      {language === "id" ? "Reset" : "Reset"}
                    </button>
                  </>
                ) : (
                  <>
                    <MapPin
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: theme.textMuted }}
                    />
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                      {language === "id"
                        ? "Belum ada koordinat — klik di peta untuk menandai lokasi"
                        : "No coordinates yet — click the map to mark a location"}
                    </p>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/5"
                  style={{
                    backgroundColor: theme.bgDark,
                    color: theme.textSecondary,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {language === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  disabled={!hasMarker}
                  onClick={() => {
                    if (pickedLat !== null && pickedLng !== null) {
                      onSelect(pickedLat, pickedLng);
                      onClose();
                    }
                  }}
                  className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
                  style={{
                    background: hasMarker
                      ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                      : "transparent",
                    color: hasMarker ? "white" : theme.textMuted,
                    border: hasMarker ? "none" : `1px solid ${theme.border}`,
                    cursor: hasMarker ? "pointer" : "not-allowed",
                    opacity: hasMarker ? 1 : 0.45,
                    boxShadow: hasMarker
                      ? `0 4px 20px ${theme.primary}40`
                      : "none",
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  {language === "id" ? "Gunakan Lokasi Ini" : "Use This Location"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body,
    );
  };

// ============================================================================
// ============================================================================
/**
 * ============================================================================
 * AGREEMENT MODAL - COMPLETE FIXED VERSION    </AnimatePresence>,
    document.body
  );
};

// ============================================================================
// ============================================================================
/**
 * ============================================================================
 * AGREEMENT MODAL - COMPLETE FIXED VERSION
 * ============================================================================
 *
 * FIXES:
 * ✅ Scrollable body contains ALL clauses
 * ✅ Checkbox di FOOTER (tidak di dalam scrollable)
 * ✅ Buttons visible
 * ✅ No overlapping
 * ✅ Z-index correct (70)
 *
 * REPLACE entire AgreementModal component (line ~850-1100) dengan code ini!
 */

const AgreementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  language: "id" | "en";
}> = ({ isOpen, onClose, onAgree, language }) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const [checked, setChecked] = useState(false);

  // Reset checkbox when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setChecked(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const agreementClauses = [
    {
      title:
        language === "id" ? "1. Kelayakan Proyek" : "1. Project Eligibility",
      body:
        language === "id"
          ? "Pemohon menyatakan bahwa proyek yang diajukan memiliki jalur yang dapat diukur untuk menghasilkan Volumetric Water Benefits (VWB) sesuai metodologi VWBA 2.0, mengatasi tantangan air bersama yang relevan di wilayah tangkapan, dan memiliki dukungan internal serta tidak bertentangan dengan kepentingan komunitas setempat."
          : "The applicant declares that the submitted project has an established pathway to generate Volumetric Water Benefits (VWB) per VWBA 2.0 methodology, addresses relevant shared water challenges in the catchment area, and has internal buy-in without adversely affecting local community interests.",
    },
    {
      title:
        language === "id"
          ? "2. Addisionalitas & Tanpa Kondisi Proyek"
          : "2. Additionality & Without-Project Conditions",
      body:
        language === "id"
          ? "Proyek memberikan perubahan positif di luar kondisi tanpa-proyek. Kegiatan yang diwajibkan secara hukum oleh sponsor proyek untuk kepatuhan tidak memenuhi syarat untuk VWB, kecuali terdapat addisionalitas dan intensionalitas yang dapat dibuktikan."
          : "The project delivers change beyond without-project conditions. Activities legally required by the project sponsor for compliance do not qualify for VWBs unless demonstrable additionality and intentionality exist.",
    },
    {
      title:
        language === "id"
          ? "3. Rencana Pelacakan & Pelaporan"
          : "3. Tracking & Reporting Plan",
      body:
        language === "id"
          ? "Pemohon berkomitmen untuk menyediakan rencana pelacakan dan pelaporan pasca-implementasi yang mencakup langkah-langkah berkelanjutan untuk memverifikasi bahwa proyek terus berfungsi sesuai desain selama durasi klaim VWB."
          : "The applicant commits to providing a post-implementation tracking and reporting plan that includes sustained measures to verify the project continues to function as designed for the intended duration of VWB claims.",
    },
    {
      title:
        language === "id"
          ? "4. Penilaian Trade-off"
          : "4. Trade-off Assessment",
      body:
        language === "id"
          ? "Pemohon telah melakukan kajian desktop atau konsultasi untuk mengidentifikasi dan meminimalkan trade-off serta konsekuensi tidak disengaja, termasuk dampak terhadap hasil panen petani, aliran dasar sungai, akses air, dan ketahanan ekosistem."
          : "The applicant has conducted a desktop review or consultation to identify and minimize trade-offs and unintended consequences, including impacts on farmer yields, stream base flow, water access, and ecosystem resilience.",
    },
    {
      title:
        language === "id"
          ? "5. Metodologi VWBA yang Digunakan"
          : "5. Applied VWBA Methodology",
      body:
        language === "id"
          ? "Proyek menggunakan salah satu metode perhitungan VWB yang diakui: Curve Number, Withdrawal & Consumption, Volume Provided, Recharge, Volume Captured, Volume Treated, Inundation, Instream Habitat Volume, atau Nonpoint Source Pollution Reduction — sesuai jenis aktivitas proyek."
          : "The project applies one of the recognized VWB calculation methods: Curve Number, Withdrawal & Consumption, Volume Provided, Recharge, Volume Captured, Volume Treated, Inundation, Instream Habitat Volume, or Nonpoint Source Pollution Reduction — aligned to the project activity type.",
    },
    {
      title:
        language === "id"
          ? "6. Hak Platform & Verifikasi"
          : "6. Platform Rights & Verification",
      body:
        language === "id"
          ? "HydrEx berhak melakukan verifikasi administratif dan teknis atas semua proyek yang diajukan. Platform memiliki kewenangan untuk menyetujui, menolak, atau meminta revisi dokumen proyek. Keputusan sertifikasi akhir dilakukan oleh VVB (Validation and Verification Body) independen yang ditunjuk."
          : "HydrEx reserves the right to conduct administrative and technical verification of all submitted projects. The platform has authority to approve, reject, or request revisions to project documents. Final certification is conducted by an appointed independent VVB (Validation and Verification Body).",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl w-full max-w-2xl flex flex-col"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
            maxHeight: "90vh",
          }}
        >
          {/* ==================== HEADER (FIXED) ==================== */}
          <div
            className="flex items-center justify-between p-6 border-b flex-shrink-0"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <FileText
                  className="w-5 h-5"
                  style={{ color: theme.primary }}
                />
              </div>
              <div>
                <h3
                  className="font-bold text-lg"
                  style={{ color: theme.textPrimary }}
                >
                  {language === "id"
                    ? "Surat Perjanjian Proyek"
                    : "Project Agreement Letter"}
                </h3>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {language === "id"
                    ? "Baca dan setujui sebelum mengajukan proyek"
                    : "Read and agree before submitting your project"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
            </button>
          </div>

          {/* ==================== SCROLLABLE BODY ==================== */}
          <div
            className="overflow-y-auto p-6 space-y-4 text-sm leading-relaxed flex-1"
            style={{
              color: theme.textSecondary,
            }}
          >
            {/* Tanggal Pengajuan */}
            <div
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: `${theme.secondary}10`,
                border: `1px solid ${theme.secondary}30`,
              }}
            >
              <Calendar
                className="w-5 h-5 flex-shrink-0"
                style={{ color: theme.secondary }}
              />
              <div className="flex-1">
                <p
                  className="text-xs font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {language === "id"
                    ? "Tanggal Pengajuan:"
                    : "Submission Date:"}
                </p>
                <p
                  className="text-sm font-bold"
                  style={{ color: theme.secondary }}
                >
                  {new Date().toLocaleDateString(
                    language === "id" ? "id-ID" : "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>

            {/* Agreement Clauses */}
            {agreementClauses.map((clause, i) => (
              <div
                key={i}
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: theme.bgDark,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <p
                  className="font-semibold mb-2"
                  style={{ color: theme.textPrimary }}
                >
                  {clause.title}
                </p>
                <p style={{ color: theme.textSecondary }}>{clause.body}</p>
              </div>
            ))}
          </div>

          {/* ==================== FOOTER (FIXED) ==================== */}
          <div
            className="p-6 border-t space-y-4 flex-shrink-0"
            style={{ borderColor: theme.border }}
          >
            {/* Checkbox Agreement */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-500 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm" style={{ color: theme.textSecondary }}>
                {language === "id"
                  ? "Saya telah membaca, memahami, dan menyetujui seluruh ketentuan perjanjian di atas serta menyatakan bahwa informasi yang diberikan adalah benar dan akurat."
                  : "I have read, understood, and agree to all terms of the agreement above, and declare that the information provided is true and accurate."}
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-3 rounded-xl font-semibold transition-all hover:bg-white/5"
                style={{
                  backgroundColor: theme.bgDark,
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {language === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                onClick={onAgree}
                disabled={!checked}
                className="flex-1 px-5 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: checked
                    ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                    : "#374151",
                  opacity: checked ? 1 : 0.5,
                  cursor: checked ? "pointer" : "not-allowed",
                }}
              >
                <CheckCircle className="w-4 h-4" />
                {language === "id"
                  ? "Setuju & Ajukan Proyek"
                  : "Agree & Submit Project"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
// ============================================================================
// UPLOAD PROJECT MODAL — scrollable, full-featured
// ============================================================================
const VWBA_METHODOLOGIES = [
  {
    value: "Wetland & Mangrove Restoration",
    labelId: "Restorasi Wetland & Mangrove",
    labelEn: "Wetland & Mangrove Restoration",
    descId:
      "Restorasi lahan basah dan mangrove untuk meningkatkan kapasitas tangkapan air, kualitas air, dan habitat. Menggunakan metode Volume Captured & Recharge.",
    descEn:
      "Restoration of wetlands and mangroves to enhance water capture capacity, quality, and habitat. Uses Volume Captured & Recharge methods.",
    vwbaMethod: "Volume Captured (D-5) / Recharge (D-4)",
  },
  {
    value: "Avoided Deforestation",
    labelId: "Pencegahan Deforestasi",
    labelEn: "Avoided Deforestation",
    descId:
      "Konservasi hutan untuk mencegah limpasan air dan mempertahankan siklus hidrologi alami. Menggunakan metode Curve Number.",
    descEn:
      "Forest conservation to prevent surface runoff and maintain natural hydrological cycles. Uses Curve Number method.",
    vwbaMethod: "Curve Number (D-1)",
  },
  {
    value: "Sustainable Agriculture",
    labelId: "Pertanian Berkelanjutan",
    labelEn: "Sustainable Agriculture",
    descId:
      "Praktik pertanian terbaik termasuk cover crop, mulsa, reduced till untuk mengurangi limpasan dan polusi nonpoint source.",
    descEn:
      "Agricultural best management practices including cover crops, mulching, reduced tillage to reduce runoff and nonpoint source pollution.",
    vwbaMethod:
      "Curve Number (D-1) / Nonpoint Source Pollution Reduction (D-9)",
  },
  {
    value: "Groundwater Recharge",
    labelId: "Pengisian Air Tanah",
    labelEn: "Groundwater Recharge",
    descId:
      "Sistem infiltrasi dan sumur resapan untuk meningkatkan ketersediaan air tanah. Menggunakan metode Recharge.",
    descEn:
      "Infiltration systems and recharge wells to increase groundwater availability. Uses Recharge method.",
    vwbaMethod: "Recharge (D-4)",
  },
  {
    value: "Irrigation Efficiency",
    labelId: "Efisiensi Irigasi",
    labelEn: "Irrigation Efficiency",
    descId:
      "Peningkatan efisiensi irigasi untuk mengurangi konsumsi air dan meningkatkan ketersediaan air untuk ekosistem.",
    descEn:
      "Irrigation efficiency improvements to reduce water consumption and increase water availability for ecosystems.",
    vwbaMethod: "Withdrawal & Consumption (D-2)",
  },
  {
    value: "Community Water Access",
    labelId: "Akses Air Komunitas",
    labelEn: "Community Water Access",
    descId:
      "Infrastruktur penyediaan air bersih untuk komunitas terpencil. Menggunakan metode Volume Provided.",
    descEn:
      "Clean water supply infrastructure for remote communities. Uses Volume Provided method.",
    vwbaMethod: "Volume Provided (D-3)",
  },
  {
    value: "Floodplain Reconnection",
    labelId: "Koneksi Dataran Banjir",
    labelEn: "Floodplain Reconnection",
    descId:
      "Pemulihan koneksi dataran banjir untuk meningkatkan volume inundasi dan habitat akuatik.",
    descEn:
      "Restoration of floodplain connectivity to increase inundation volume and aquatic habitat.",
    vwbaMethod: "Inundation (D-7)",
  },
  {
    value: "Stormwater Management",
    labelId: "Manajemen Air Hujan",
    labelEn: "Stormwater Management",
    descId:
      "Infrastruktur pengelolaan air hujan (bioretention, kolam retensi) untuk mengurangi risiko banjir dan meningkatkan kualitas air.",
    descEn:
      "Stormwater management infrastructure (bioretention, retention ponds) to reduce flood risk and improve water quality.",
    vwbaMethod: "Volume Captured (D-5)",
  },
  {
    value: "Wastewater Treatment",
    labelId: "Pengolahan Air Limbah",
    labelEn: "Wastewater Treatment",
    descId:
      "Instalasi pengolahan air limbah untuk mengurangi polutan point source dan meningkatkan kualitas air permukaan.",
    descEn:
      "Wastewater treatment facilities to reduce point source pollutants and improve surface water quality.",
    vwbaMethod: "Volume Treated (D-6)",
  },
  {
    value: "Aquatic Habitat Restoration",
    labelId: "Restorasi Habitat Akuatik",
    labelEn: "Aquatic Habitat Restoration",
    descId:
      "Pemulihan habitat akuatik dan aliran instream untuk spesies yang terancam atau endemik.",
    descEn:
      "Restoration of aquatic habitat and instream flows for threatened or endemic species.",
    vwbaMethod: "Instream Habitat Volume (D-8)",
  },
  {
    value: "Other",
    labelId: "Lainnya (Tulis Sendiri)",
    labelEn: "Other (Custom)",
    descId:
      "Metodologi lain yang tidak ada di daftar. Tuliskan secara spesifik di kolom yang tersedia.",
    descEn:
      "Methodology not listed above. Describe your specific methodology in the field provided.",
    vwbaMethod: "Custom / Other",
  },
];

const COUNTRY_PROVINCE_DATA: Record<string, string[]> = {
  Indonesia: [
    "Aceh",
    "Sumatera Utara",
    "Sumatera Barat",
    "Riau",
    "Jambi",
    "Sumatera Selatan",
    "Bengkulu",
    "Lampung",
    "Kepulauan Bangka Belitung",
    "Kepulauan Riau",
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "DI Yogyakarta",
    "Jawa Timur",
    "Banten",
    "Bali",
    "Nusa Tenggara Barat",
    "Nusa Tenggara Timur",
    "Kalimantan Barat",
    "Kalimantan Tengah",
    "Kalimantan Selatan",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Sulawesi Utara",
    "Sulawesi Tengah",
    "Sulawesi Selatan",
    "Sulawesi Tenggara",
    "Gorontalo",
    "Sulawesi Barat",
    "Maluku",
    "Maluku Utara",
    "Papua Barat",
    "Papua",
    "Papua Selatan",
    "Papua Tengah",
    "Papua Pegunungan",
  ],
  Malaysia: [
    "Selangor",
    "Kuala Lumpur",
    "Johor",
    "Penang",
    "Sabah",
    "Sarawak",
    "Perak",
    "Pahang",
    "Kelantan",
    "Terengganu",
    "Negeri Sembilan",
    "Melaka",
    "Kedah",
    "Perlis",
    "Putrajaya",
    "Labuan",
  ],
  Philippines: [
    "Metro Manila",
    "Cebu",
    "Davao",
    "Luzon",
    "Visayas",
    "Mindanao",
    "Palawan",
    "Batangas",
    "Laguna",
    "Cavite",
    "Bulacan",
    "Pampanga",
    "Rizal",
    "Negros",
    "Iloilo",
  ],
  Vietnam: [
    "Hanoi",
    "Ho Chi Minh City",
    "Da Nang",
    "Can Tho",
    "Hai Phong",
    "Mekong Delta",
    "Red River Delta",
    "Central Highlands",
    "Southeast",
    "Northeast",
    "Northwest",
  ],
  Thailand: [
    "Bangkok",
    "Chiang Mai",
    "Phuket",
    "Pattaya",
    "Nonthaburi",
    "Pathum Thani",
    "Chon Buri",
    "Khon Kaen",
    "Nakhon Ratchasima",
    "Songkhla",
    "Udon Thani",
    "Chiang Rai",
    "Nakhon Si Thammarat",
  ],
  Singapore: [
    "Central Region",
    "East Region",
    "North Region",
    "North-East Region",
    "West Region",
  ],
  Cambodia: [
    "Phnom Penh",
    "Siem Reap",
    "Battambang",
    "Kampong Cham",
    "Kandal",
    "Kampong Speu",
    "Kampong Chhnang",
    "Koh Kong",
    "Kampot",
    "Takéo",
  ],
  Myanmar: [
    "Yangon",
    "Mandalay",
    "Naypyidaw",
    "Bago",
    "Sagaing",
    "Magway",
    "Ayeyarwady",
    "Tanintharyi",
    "Chin",
    "Kachin",
    "Kayah",
    "Kayin",
    "Mon",
    "Rakhine",
    "Shan",
  ],
  India: [
    "Maharashtra",
    "Karnataka",
    "Tamil Nadu",
    "Uttar Pradesh",
    "West Bengal",
    "Gujarat",
    "Rajasthan",
    "Andhra Pradesh",
    "Telangana",
    "Kerala",
    "Bihar",
    "Madhya Pradesh",
    "Punjab",
    "Haryana",
    "Uttarakhand",
    "Himachal Pradesh",
    "Odisha",
    "Jharkhand",
    "Chhattisgarh",
    "Assam",
    "Goa",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Tripura",
    "Sikkim",
    "Arunachal Pradesh",
    "Delhi",
    "Chandigarh",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
    "Andaman and Nicobar",
  ],
  Australia: [
    "New South Wales",
    "Victoria",
    "Queensland",
    "Western Australia",
    "South Australia",
    "Tasmania",
    "Australian Capital Territory",
    "Northern Territory",
  ],
  "New Zealand": [
    "Auckland",
    "Wellington",
    "Canterbury",
    "Waikato",
    "Bay of Plenty",
    "Manawatu-Whanganui",
    "Otago",
    "Hawke's Bay",
    "Taranaki",
    "Northland",
    "Marlborough",
    "Nelson",
    "West Coast",
    "Southland",
    "Gisborne",
    "Tasman",
  ],
  Japan: [
    "Tokyo",
    "Osaka",
    "Kanagawa",
    "Aichi",
    "Saitama",
    "Chiba",
    "Hyogo",
    "Fukuoka",
    "Hokkaido",
    "Shizuoka",
    "Hiroshima",
    "Kyoto",
    "Miyagi",
    "Niigata",
    "Nagano",
    "Okinawa",
    "Kumamoto",
  ],
  China: [
    "Beijing",
    "Shanghai",
    "Guangdong",
    "Zhejiang",
    "Jiangsu",
    "Shandong",
    "Sichuan",
    "Fujian",
    "Hubei",
    "Henan",
    "Hunan",
    "Anhui",
    "Liaoning",
    "Shaanxi",
    "Jiangxi",
    "Chongqing",
    "Yunnan",
    "Guizhou",
    "Guangxi",
    "Inner Mongolia",
    "Tibet",
    "Xinjiang",
    "Hainan",
  ],
  Brazil: [
    "São Paulo",
    "Rio de Janeiro",
    "Minas Gerais",
    "Bahia",
    "Paraná",
    "Rio Grande do Sul",
    "Pernambuco",
    "Ceará",
    "Pará",
    "Santa Catarina",
    "Goiás",
    "Maranhão",
    "Amazonas",
    "Espírito Santo",
    "Mato Grosso",
    "Mato Grosso do Sul",
    "Paraíba",
    "Alagoas",
    "Piauí",
    "Rio Grande do Norte",
    "Tocantins",
    "Rondônia",
    "Amapá",
    "Roraima",
    "Acre",
    "Sergipe",
    "Distrito Federal",
  ],
  "United States": [
    "California",
    "Texas",
    "Florida",
    "New York",
    "Illinois",
    "Pennsylvania",
    "Ohio",
    "Georgia",
    "North Carolina",
    "Michigan",
    "New Jersey",
    "Virginia",
    "Washington",
    "Arizona",
    "Massachusetts",
    "Tennessee",
    "Indiana",
    "Missouri",
    "Maryland",
    "Wisconsin",
    "Colorado",
    "Minnesota",
    "South Carolina",
    "Alabama",
    "Louisiana",
    "Kentucky",
    "Oregon",
    "Oklahoma",
    "Connecticut",
    "Nevada",
    "Iowa",
    "Arkansas",
    "Mississippi",
    "Kansas",
    "Utah",
    "Nevada",
    "West Virginia",
    "Nebraska",
    "New Mexico",
    "Hawaii",
    "Alaska",
    "North Dakota",
    "South Dakota",
    "Montana",
    "Wyoming",
    "Vermont",
    "Maine",
    "Idaho",
    "Delaware",
    "New Hampshire",
    "Rhode Island",
  ],
  "United Kingdom": [
    "England",
    "Scotland",
    "Wales",
    "Northern Ireland",
    "London",
    "South East",
    "South West",
    "East of England",
    "East Midlands",
    "West Midlands",
    "Yorkshire and The Humber",
    "North West",
    "North East",
  ],
  Germany: [
    "Bavaria",
    "North Rhine-Westphalia",
    "Baden-Württemberg",
    "Lower Saxony",
    "Hesse",
    "Saxony",
    "Rhineland-Palatinate",
    "Berlin",
    "Schleswig-Holstein",
    "Brandenburg",
    "Saxony-Anhalt",
    "Thuringia",
    "Hamburg",
    "Mecklenburg-Vorpommern",
    "Saarland",
    "Bremen",
  ],
  Netherlands: [
    "North Holland",
    "South Holland",
    "Zeeland",
    "North Brabant",
    "Limburg",
    "Gelderland",
    "Overijssel",
    "Utrecht",
    "Friesland",
    "Groningen",
    "Drenthe",
    "Flevoland",
  ],
  Kenya: [
    "Nairobi",
    "Mombasa",
    "Nakuru",
    "Eldoret",
    "Kisumu",
    "Thika",
    "Malindi",
    "Kitale",
    "Garissa",
    "Kakamega",
    "Nyeri",
    "Meru",
    "Embu",
    "Machakos",
    "Kericho",
  ],
  "South Africa": [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Free State",
    "Northern Cape",
  ],
};

const UploadProjectModal: React.FC<UploadProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  // ── NEW: Category selection step
  const [projectCategory, setProjectCategory] = useState<
    "community" | "corporate" | ""
  >("");
  const [categorySelected, setCategorySelected] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setProjectCategory("");
      setCategorySelected(false);
    }
  }, [isOpen]);

  const blank = {
    title: "",
    projectType: "conservation",
    country: "",
    province: "",
    regency: "",
    areaHectares: 0,
    estimatedCredits: 0,
    pricePerCredit: 0,
    currency: "USD",
    duration: 0,
    methodology: "Wetland & Mangrove Restoration" as Methodology,
    customMethodology: "",
    description: "",
    certificationStandard: "Gold Standard" as CertificationStandard,
    customCertification: "",
    hasThirdPartyVerification: false,
    thirdPartyVerifier: "",
    verificationDate: "",
    submissionDate: new Date().toISOString().split("T")[0],
    coverImageUrl: "", // ← NEW: foto cover proyek
  };
  const [form, setForm] = useState(blank);

  // ── NEW: Corporate form state
  const blankCorporate = {
    currentWaterQuota: 0,
    actualConsumption: 0,
    surplusDeficit: 0,
    tradingIntent: "sell" as "sell" | "buy",
    pricePerM3: 0,
    companySize: "medium" as "small" | "medium" | "large",
    industry: "",
    complianceStatus: "compliant" as "compliant" | "non_compliant" | "at_risk",
    lastAuditDate: "",
    quotaExpiryDate: "",
  };
  const [corporateForm, setCorporateForm] = useState(blankCorporate);
  // Auto-compute surplus/deficit
  const computedSurplus =
    corporateForm.currentWaterQuota - corporateForm.actualConsumption;
  const [selectedCountry, setSelectedCountry] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<
    { name: string; size: string }[]
  >([]);
  const [showMethodInfo, setShowMethodInfo] = useState(false);
  // ← NEW: cover image states
  const [coverMode, setCoverMode] = useState<"url" | "file">("file");
  const [coverPreview, setCoverPreview] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null); // ← NEW

  const selectedMethod = VWBA_METHODOLOGIES.find(
    (m) => m.value === form.methodology,
  );
  const availableProvinces = selectedCountry
    ? COUNTRY_PROVINCE_DATA[selectedCountry] || []
    : [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map((f) => ({
      name: f.name,
      size: (f.size / 1024).toFixed(0) + " KB",
    }));
    setUploadedDocs((prev) => [...prev, ...newDocs]);
  };

  // ← NEW: handle cover image file
  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCoverPreview(dataUrl);
      setForm((prev) => ({ ...prev, coverImageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const [coordMsg, setCoordMsg] = useState("");

  const importCoordinates = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      setCoordMsg(
        language === "id"
          ? "⚠ Masukkan koordinat yang valid"
          : "⚠ Enter valid coordinates",
      );
      setTimeout(() => setCoordMsg(""), 3000);
      return;
    }
    const provinces = [
      { name: "Aceh", country: "Indonesia", lat: 4.695, lng: 96.749 },
      { name: "Sumatera Utara", country: "Indonesia", lat: 2.115, lng: 99.544 },
      { name: "Sumatera Barat", country: "Indonesia", lat: -0.74, lng: 100.8 },
      { name: "Riau", country: "Indonesia", lat: 0.294, lng: 101.705 },
      { name: "Jambi", country: "Indonesia", lat: -1.61, lng: 103.612 },
      {
        name: "Sumatera Selatan",
        country: "Indonesia",
        lat: -3.319,
        lng: 103.914,
      },
      { name: "Lampung", country: "Indonesia", lat: -5.45, lng: 105.266 },
      { name: "DKI Jakarta", country: "Indonesia", lat: -6.211, lng: 106.845 },
      { name: "Jawa Barat", country: "Indonesia", lat: -6.889, lng: 107.64 },
      { name: "Jawa Tengah", country: "Indonesia", lat: -7.15, lng: 110.14 },
      { name: "DI Yogyakarta", country: "Indonesia", lat: -7.797, lng: 110.37 },
      { name: "Jawa Timur", country: "Indonesia", lat: -7.536, lng: 112.239 },
      { name: "Banten", country: "Indonesia", lat: -6.406, lng: 106.064 },
      { name: "Bali", country: "Indonesia", lat: -8.34, lng: 115.092 },
      {
        name: "Nusa Tenggara Barat",
        country: "Indonesia",
        lat: -8.652,
        lng: 117.361,
      },
      {
        name: "Nusa Tenggara Timur",
        country: "Indonesia",
        lat: -8.657,
        lng: 121.079,
      },
      {
        name: "Kalimantan Barat",
        country: "Indonesia",
        lat: 0.131,
        lng: 111.092,
      },
      {
        name: "Kalimantan Tengah",
        country: "Indonesia",
        lat: -1.681,
        lng: 113.382,
      },
      {
        name: "Kalimantan Selatan",
        country: "Indonesia",
        lat: -3.093,
        lng: 115.284,
      },
      {
        name: "Kalimantan Timur",
        country: "Indonesia",
        lat: 0.539,
        lng: 116.419,
      },
      {
        name: "Kalimantan Utara",
        country: "Indonesia",
        lat: 3.07,
        lng: 116.041,
      },
      {
        name: "Sulawesi Utara",
        country: "Indonesia",
        lat: 0.627,
        lng: 123.975,
      },
      {
        name: "Sulawesi Tengah",
        country: "Indonesia",
        lat: -1.43,
        lng: 121.446,
      },
      {
        name: "Sulawesi Selatan",
        country: "Indonesia",
        lat: -3.669,
        lng: 119.974,
      },
      {
        name: "Sulawesi Tenggara",
        country: "Indonesia",
        lat: -4.145,
        lng: 122.174,
      },
      { name: "Maluku", country: "Indonesia", lat: -3.238, lng: 130.145 },
      { name: "Maluku Utara", country: "Indonesia", lat: 1.57, lng: 127.808 },
      { name: "Papua Barat", country: "Indonesia", lat: -1.336, lng: 133.174 },
      { name: "Papua", country: "Indonesia", lat: -4.269, lng: 138.08 },
      { name: "Selangor", country: "Malaysia", lat: 3.073, lng: 101.518 },
      { name: "Kuala Lumpur", country: "Malaysia", lat: 3.14, lng: 101.686 },
      {
        name: "Metro Manila",
        country: "Philippines",
        lat: 14.599,
        lng: 120.984,
      },
      { name: "Hanoi", country: "Vietnam", lat: 21.027, lng: 105.834 },
      {
        name: "Ho Chi Minh City",
        country: "Vietnam",
        lat: 10.823,
        lng: 106.63,
      },
      { name: "Bangkok", country: "Thailand", lat: 13.756, lng: 100.502 },
      { name: "Singapore", country: "Singapore", lat: 1.352, lng: 103.82 },
      {
        name: "New South Wales",
        country: "Australia",
        lat: -33.868,
        lng: 151.209,
      },
      { name: "Victoria", country: "Australia", lat: -37.813, lng: 144.963 },
      {
        name: "California",
        country: "United States",
        lat: 36.778,
        lng: -119.417,
      },
      { name: "London", country: "United Kingdom", lat: 51.507, lng: -0.127 },
    ];
    let closest = provinces[0];
    let minDist = Infinity;
    provinces.forEach((p) => {
      const d = Math.sqrt(
        Math.pow(latNum - p.lat, 2) + Math.pow(lngNum - p.lng, 2),
      );
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    });
    setSelectedCountry(closest.country);
    setForm((prev) => ({
      ...prev,
      country: closest.country,
      province: closest.name,
    }));
    setCoordMsg(`✓ Terdeteksi: ${closest.name}, ${closest.country}`);
    setTimeout(() => setCoordMsg(""), 4000);
  };

  const handleContinue = () => {
    // ── Corporate project submission
    if (projectCategory === "corporate") {
      const errors: string[] = [];
      if (!form.title.trim())
        errors.push(language === "id" ? "• Nama Proyek" : "• Project Name");
      if (!form.country)
        errors.push(language === "id" ? "• Negara" : "• Country");
      if (!form.province)
        errors.push(
          language === "id" ? "• Provinsi/Wilayah" : "• Province/Region",
        );
      if (!corporateForm.industry.trim())
        errors.push(
          language === "id" ? "• Industri Perusahaan" : "• Company Industry",
        );
      if (
        !corporateForm.currentWaterQuota ||
        corporateForm.currentWaterQuota <= 0
      )
        errors.push(
          language === "id"
            ? "• Kuota Air Resmi (m³/tahun)"
            : "• Official Water Quota (m³/yr)",
        );
      if (
        !corporateForm.actualConsumption ||
        corporateForm.actualConsumption < 0
      )
        errors.push(
          language === "id"
            ? "• Konsumsi Air Aktual"
            : "• Actual Water Consumption",
        );
      if (!corporateForm.pricePerM3 || corporateForm.pricePerM3 <= 0)
        errors.push(language === "id" ? "• Harga per m³" : "• Price per m³");
      if (!form.description.trim())
        errors.push(language === "id" ? "• Deskripsi" : "• Description");
      if (errors.length > 0) {
        alert(
          (language === "id"
            ? "⚠️ Mohon lengkapi data berikut:\n\n"
            : "⚠️ Please complete:\n\n") + errors.join("\n"),
        );
        return;
      }
      onSubmit({
        ...form,
        category: "corporate",
        projectType: "water_quota_trading",
        corporateData: {
          ...corporateForm,
          surplusDeficit: computedSurplus,
        },
      });
      return;
    }

    // DEBUG: Log form data
    console.log("=== FORM VALIDATION ===");
    console.log("Title:", form.title);
    console.log("Country:", form.country);
    console.log("Province:", form.province);
    console.log("Regency:", form.regency);
    console.log("Area:", form.areaHectares);
    console.log("Credits:", form.estimatedCredits);
    console.log("Price:", form.pricePerCredit);
    console.log("Duration:", form.duration);
    console.log("Description:", form.description);
    console.log("======================");

    // BYPASS MODE: Jika semua field numerik terisi, langsung submit
    if (
      form.areaHectares > 0 &&
      form.estimatedCredits > 0 &&
      form.pricePerCredit > 0 &&
      form.duration > 0 &&
      form.description.trim()
    ) {
      console.log(
        "✅ BYPASS MODE: Numeric fields filled, submitting to parent...",
      );
      onSubmit({ ...form, category: projectCategory || "community" }); // Ini akan trigger handleUploadProject di parent yang buka agreement modal
      return;
    }

    // Normal validation jika bypass tidak terpenuhi
    const errors: string[] = [];

    if (!form.title.trim()) {
      errors.push(language === "id" ? "• Nama Proyek" : "• Project Title");
    }

    if (!form.country) {
      errors.push(language === "id" ? "• Negara" : "• Country");
    }

    if (!form.province) {
      errors.push(
        language === "id" ? "• Provinsi/Wilayah" : "• Province/Region",
      );
    }

    if (!form.regency.trim()) {
      errors.push(
        language === "id"
          ? "• Kabupaten/Kota/Distrik (SCROLL KE BAWAH UNTUK ISI INI!)"
          : "• Regency/City/District (SCROLL DOWN TO FILL THIS!)",
      );
    }

    if (!form.areaHectares || form.areaHectares <= 0) {
      errors.push(language === "id" ? "• Luas Area (ha)" : "• Area Size (ha)");
    }

    if (!form.estimatedCredits || form.estimatedCredits <= 0) {
      errors.push(
        language === "id"
          ? "• Estimasi Kredit (m³)"
          : "• Estimated Credits (m³)",
      );
    }

    if (!form.pricePerCredit || form.pricePerCredit <= 0) {
      errors.push(
        language === "id" ? "• Harga per m³ (IDR)" : "• Price per m³ (IDR)",
      );
    }

    if (!form.duration || form.duration <= 0) {
      errors.push(
        language === "id"
          ? "• Durasi Proyek (tahun)"
          : "• Project Duration (years)",
      );
    }

    if (!form.description.trim()) {
      errors.push(
        language === "id" ? "• Deskripsi Proyek" : "• Project Description",
      );
    }
    // Validasi verifikasi pihak ketiga
    if (form.hasThirdPartyVerification) {
      if (!form.thirdPartyVerifier?.trim()) {
        errors.push(
          language === "id"
            ? "• Nama Lembaga Verifikator"
            : "• Verifier Organization",
        );
      }
      if (!form.verificationDate) {
        errors.push(
          language === "id" ? "• Tanggal Verifikasi" : "• Verification Date",
        );
      }
    }

    // Jika ada field yang belum diisi, tampilkan pesan detail
    if (errors.length > 0) {
      const errorMessage =
        (language === "id"
          ? "⚠️ Mohon lengkapi data berikut:\n\n"
          : "⚠️ Please complete the following fields:\n\n") +
        errors.join("\n") +
        (language === "id"
          ? "\n\n👆 SCROLL MODAL KE ATAS DAN KE BAWAH untuk melihat semua field!"
          : "\n\n👆 SCROLL THE MODAL UP AND DOWN to see all fields!");

      alert(errorMessage);
      console.error("❌ Validation failed. Missing fields:", errors);
      return;
    }

    // Semua validasi lolos, lanjut submit
    console.log("✅ All fields valid! Submitting to parent...");
    onSubmit({ ...form, category: "community" }); // Submit ke parent untuk buka agreement modal
  };

  if (!isOpen) return null;

  const inp =
    "w-full px-4 py-3 rounded-lg text-white placeholder:text-gray-500 focus:outline-none text-sm";
  const is = {
    backgroundColor: theme.bgDark,
    border: `1px solid ${theme.border}`,
  };
  const lbl = { color: theme.textPrimary };

  // ── STEP 0: Category Selection Screen
  if (!categorySelected) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl w-full max-w-2xl"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between px-6 pt-6 pb-4 border-b"
              style={{ borderColor: theme.border }}
            >
              <div>
                <h2
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ color: theme.textPrimary }}
                >
                  <Upload
                    className="w-5 h-5"
                    style={{ color: theme.primary }}
                  />
                  {language === "id"
                    ? "Pilih Tipe Proyek"
                    : "Select Project Type"}
                </h2>
                <p
                  className="text-xs mt-1"
                  style={{ color: theme.textSecondary }}
                >
                  {language === "id"
                    ? "Pilih kategori proyek yang ingin Anda daftarkan di platform Hydrex"
                    : "Choose the category of project you want to register on Hydrex platform"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 flex-shrink-0"
              >
                <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
              </button>
            </div>

            {/* Cards */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Community Card */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setProjectCategory("community");
                  setCategorySelected(true);
                }}
                className="text-left p-6 rounded-2xl border-2 transition-all"
                style={{
                  backgroundColor: `${theme.secondary}10`,
                  borderColor: theme.secondary + "50",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${theme.secondary}20` }}
                >
                  <Users
                    className="w-7 h-7"
                    style={{ color: theme.secondary }}
                  />
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: theme.textPrimary }}
                >
                  {language === "id" ? "Proyek Komunitas" : "Community Project"}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: theme.textSecondary }}
                >
                  {language === "id"
                    ? "Proyek konservasi dan pengelolaan sumber daya air berbasis komunitas. Cocok untuk restorasi ekosistem, pengelolaan DAS, dan inisiatif air bersih lokal."
                    : "Community-based water resource conservation and management projects. Ideal for ecosystem restoration, watershed management, and local clean water initiatives."}
                </p>
                <div className="space-y-1.5">
                  {[
                    language === "id"
                      ? "✓ Kredit Air (m³) yang dapat diperdagangkan"
                      : "✓ Tradeable Water Credits (m³)",
                    language === "id"
                      ? "✓ Verifikasi standar Gold Standard / Verra VCS"
                      : "✓ Gold Standard / Verra VCS certified",
                    language === "id"
                      ? "✓ Pemberdayaan komunitas & pelatihan"
                      : "✓ Community empowerment & training",
                  ].map((f, i) => (
                    <p
                      key={i}
                      className="text-xs"
                      style={{ color: theme.secondary }}
                    >
                      {f}
                    </p>
                  ))}
                </div>
                <div
                  className="mt-4 flex items-center gap-2 font-semibold text-sm"
                  style={{ color: theme.secondary }}
                >
                  {language === "id" ? "Pilih Komunitas" : "Select Community"}
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </div>
              </motion.button>

              {/* Corporate Card */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setProjectCategory("corporate");
                  setCategorySelected(true);
                }}
                className="text-left p-6 rounded-2xl border-2 transition-all"
                style={{
                  backgroundColor: `#f59e0b10`,
                  borderColor: "#f59e0b50",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#f59e0b20" }}
                >
                  <Factory className="w-7 h-7" style={{ color: "#f59e0b" }} />
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: theme.textPrimary }}
                >
                  {language === "id"
                    ? "Proyek Perusahaan"
                    : "Corporate Project"}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: theme.textSecondary }}
                >
                  {language === "id"
                    ? "Perdagangan limit/kuota air antar perusahaan. Cocok untuk perusahaan yang memiliki surplus kuota air yang ingin dijual, atau membutuhkan tambahan kuota air."
                    : "Water quota/limit trading between companies. For companies with surplus water quota to sell, or needing additional water quota to buy."}
                </p>
                <div className="space-y-1.5">
                  {[
                    language === "id"
                      ? "✓ Jual surplus kuota air ke perusahaan lain"
                      : "✓ Sell water quota surplus to other companies",
                    language === "id"
                      ? "✓ Beli tambahan kuota untuk operasional"
                      : "✓ Buy additional quota for operations",
                    language === "id"
                      ? "✓ Verifikasi kepatuhan & audit lingkungan"
                      : "✓ Compliance verification & environmental audit",
                  ].map((f, i) => (
                    <p key={i} className="text-xs" style={{ color: "#f59e0b" }}>
                      {f}
                    </p>
                  ))}
                </div>
                <div
                  className="mt-4 flex items-center gap-2 font-semibold text-sm"
                  style={{ color: "#f59e0b" }}
                >
                  {language === "id" ? "Pilih Perusahaan" : "Select Corporate"}
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </div>
              </motion.button>
            </div>

            {/* Footer note */}
            <div className="px-6 pb-6">
              <div
                className="p-3.5 rounded-xl flex items-start gap-3"
                style={{
                  backgroundColor: `${theme.primary}12`,
                  border: `1px solid ${theme.primary}30`,
                }}
              >
                <Info
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: theme.primary }}
                />
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {language === "id"
                    ? "Semua proyek wajib melalui proses verifikasi sebelum terdaftar di marketplace. Proyek perusahaan memerlukan bukti alokasi kuota resmi dari pemerintah."
                    : "All projects must undergo verification before being listed on the marketplace. Corporate projects require proof of official government water quota allocation."}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl w-full max-w-3xl flex flex-col"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              maxHeight: "92vh",
            }}
          >
            {/* ── Sticky Header ── */}
            <div
              className="flex items-start justify-between px-6 pt-6 pb-4 border-b flex-shrink-0"
              style={{ borderColor: theme.border }}
            >
              <div>
                <h2
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ color: theme.textPrimary }}
                >
                  <Upload
                    className="w-5 h-5"
                    style={{ color: theme.primary }}
                  />
                  {projectCategory === "corporate"
                    ? language === "id"
                      ? "Upload Proyek Perusahaan"
                      : "Upload Corporate Project"
                    : language === "id"
                      ? "Upload Proyek Komunitas"
                      : "Upload Community Project"}
                </h2>
                <p
                  className="text-xs mt-1"
                  style={{ color: theme.textSecondary }}
                >
                  {projectCategory === "corporate"
                    ? language === "id"
                      ? "Daftarkan kuota/limit air perusahaan Anda untuk diperdagangkan di marketplace"
                      : "Register your company water quota/limit for trading on the marketplace"
                    : language === "id"
                      ? "Proyek akan melalui 5 tahapan verifikasi standar internasional"
                      : "Project will go through 5 international verification stages"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCategorySelected(false);
                      setProjectCategory("");
                    }}
                    className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                      color: theme.primary,
                      border: `1px solid ${theme.primary}30`,
                    }}
                  >
                    ← {language === "id" ? "Ganti Tipe" : "Change Type"}
                  </button>
                  <span
                    className="text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                    style={{
                      backgroundColor:
                        projectCategory === "corporate"
                          ? "#f59e0b20"
                          : `${theme.secondary}20`,
                      color:
                        projectCategory === "corporate"
                          ? "#f59e0b"
                          : theme.secondary,
                      border: `1px solid ${projectCategory === "corporate" ? "#f59e0b40" : theme.secondary + "40"}`,
                    }}
                  >
                    {projectCategory === "corporate" ? (
                      <Factory className="w-3 h-3" />
                    ) : (
                      <Users className="w-3 h-3" />
                    )}
                    {projectCategory === "corporate"
                      ? language === "id"
                        ? "Perusahaan"
                        : "Corporate"
                      : language === "id"
                        ? "Komunitas"
                        : "Community"}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 flex-shrink-0"
              >
                <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
              </button>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
              {/* Notice */}
              <div
                className="p-3.5 rounded-xl flex items-start gap-3"
                style={{
                  backgroundColor:
                    projectCategory === "corporate"
                      ? "#f59e0b12"
                      : `${theme.primary}12`,
                  border: `1px solid ${projectCategory === "corporate" ? "#f59e0b30" : theme.primary + "30"}`,
                }}
              >
                <Info
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{
                    color:
                      projectCategory === "corporate"
                        ? "#f59e0b"
                        : theme.primary,
                  }}
                />
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {projectCategory === "corporate"
                    ? language === "id"
                      ? "Proyek Perusahaan memungkinkan Anda mendaftarkan kuota air resmi perusahaan untuk diperdagangkan. Surplus kuota dapat dijual ke perusahaan lain yang membutuhkan. Semua transaksi diverifikasi berdasarkan dokumen alokasi resmi dari pemerintah daerah dan standar Gold Standard / Plan Vivo."
                      : "Corporate Projects allow you to register your official water quota for trading. Quota surplus can be sold to other companies in need. All transactions are verified based on official government allocation documents and Gold Standard / Plan Vivo standards."
                    : language === "id"
                      ? "Semua proyek wajib memenuhi standar water credit internasional (Gold Standard, Verra VCS, Plan Vivo, AWS, ISO 14046) dan metodologi VWBA 2.0 sebelum dapat diperdagangkan di marketplace."
                      : "All projects must meet international water credit standards (Gold Standard, Verra VCS, Plan Vivo, AWS, ISO 14046) and VWBA 2.0 methodology before being traded on the marketplace."}
                </p>
              </div>
              {/* ══════════════════════════════════════════════════════
                  CORPORATE FORM
              ══════════════════════════════════════════════════════ */}
              {projectCategory === "corporate" && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: "#f59e0b" }}
                    >
                      {language === "id"
                        ? "Informasi Dasar"
                        : "Basic Information"}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Nama Proyek / Program"
                            : "Project / Program Name"}{" "}
                          *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          placeholder={
                            language === "id"
                              ? "Contoh: Program Efisiensi Air PT. Maju Bersama 2025"
                              : "e.g., Water Efficiency Program PT. Maju Bersama 2025"
                          }
                          className={inp}
                          style={is}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block mb-2 text-sm font-semibold"
                            style={lbl}
                          >
                            {language === "id"
                              ? "Industri Perusahaan"
                              : "Company Industry"}{" "}
                            *
                          </label>
                          <select
                            required
                            value={corporateForm.industry}
                            onChange={(e) =>
                              setCorporateForm({
                                ...corporateForm,
                                industry: e.target.value,
                              })
                            }
                            className={inp}
                            style={is}
                          >
                            <option value="">
                              {language === "id"
                                ? "Pilih Industri..."
                                : "Select Industry..."}
                            </option>
                            {[
                              language === "id"
                                ? "Manufaktur"
                                : "Manufacturing",
                              language === "id"
                                ? "Pertanian & Perkebunan"
                                : "Agriculture & Plantation",
                              language === "id" ? "Pertambangan" : "Mining",
                              language === "id"
                                ? "Energi & Utilitas"
                                : "Energy & Utilities",
                              language === "id"
                                ? "Tekstil & Garmen"
                                : "Textile & Garment",
                              language === "id"
                                ? "Makanan & Minuman"
                                : "Food & Beverage",
                              language === "id"
                                ? "Kimia & Petrokimia"
                                : "Chemical & Petrochemical",
                              language === "id"
                                ? "Properti & Konstruksi"
                                : "Property & Construction",
                              language === "id"
                                ? "Pariwisata & Perhotelan"
                                : "Tourism & Hospitality",
                              language === "id"
                                ? "Teknologi & Digital"
                                : "Technology & Digital",
                              language === "id" ? "Lainnya" : "Other",
                            ].map((ind) => (
                              <option key={ind} value={ind}>
                                {ind}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className="block mb-2 text-sm font-semibold"
                            style={lbl}
                          >
                            {language === "id"
                              ? "Ukuran Perusahaan"
                              : "Company Size"}
                          </label>
                          <select
                            value={corporateForm.companySize}
                            onChange={(e) =>
                              setCorporateForm({
                                ...corporateForm,
                                companySize: e.target.value as any,
                              })
                            }
                            className={inp}
                            style={is}
                          >
                            <option value="small">
                              {language === "id"
                                ? "Kecil (< 50 karyawan)"
                                : "Small (< 50 employees)"}
                            </option>
                            <option value="medium">
                              {language === "id"
                                ? "Menengah (50–500 karyawan)"
                                : "Medium (50–500 employees)"}
                            </option>
                            <option value="large">
                              {language === "id"
                                ? "Besar (> 500 karyawan)"
                                : "Large (> 500 employees)"}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Water Quota Data */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: "#f59e0b" }}
                    >
                      {language === "id"
                        ? "Data Kuota Air"
                        : "Water Quota Data"}
                    </p>
                    <div
                      className="p-4 rounded-xl mb-4"
                      style={{
                        backgroundColor: "#f59e0b10",
                        border: "1px solid #f59e0b30",
                      }}
                    >
                      <p className="text-xs" style={{ color: "#f59e0b" }}>
                        <span className="font-semibold">
                          ℹ️ {language === "id" ? "Penting:" : "Important:"}
                        </span>{" "}
                        {language === "id"
                          ? "Masukkan kuota air resmi yang dialokasikan pemerintah untuk perusahaan Anda, serta konsumsi aktual. Platform akan menghitung surplus atau defisit secara otomatis."
                          : "Enter the official water quota allocated by government to your company, and your actual consumption. The platform will automatically calculate surplus or deficit."}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block mb-2 text-sm font-semibold"
                            style={lbl}
                          >
                            {language === "id"
                              ? "Kuota Air Resmi (m³/tahun)"
                              : "Official Water Quota (m³/yr)"}{" "}
                            *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={corporateForm.currentWaterQuota || ""}
                            onChange={(e) =>
                              setCorporateForm({
                                ...corporateForm,
                                currentWaterQuota:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="e.g. 500000"
                            className={inp}
                            style={is}
                          />
                          <p
                            className="text-xs mt-1"
                            style={{ color: theme.textMuted }}
                          >
                            {language === "id"
                              ? "Sesuai dokumen alokasi resmi dari pemerintah daerah"
                              : "Based on official allocation documents from local government"}
                          </p>
                        </div>
                        <div>
                          <label
                            className="block mb-2 text-sm font-semibold"
                            style={lbl}
                          >
                            {language === "id"
                              ? "Konsumsi Aktual (m³/tahun)"
                              : "Actual Consumption (m³/yr)"}{" "}
                            *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={corporateForm.actualConsumption || ""}
                            onChange={(e) =>
                              setCorporateForm({
                                ...corporateForm,
                                actualConsumption:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="e.g. 320000"
                            className={inp}
                            style={is}
                          />
                          <p
                            className="text-xs mt-1"
                            style={{ color: theme.textMuted }}
                          >
                            {language === "id"
                              ? "Konsumsi air riil perusahaan berdasarkan laporan audit terbaru"
                              : "Real company water consumption based on latest audit report"}
                          </p>
                        </div>
                      </div>

                      {/* Auto-computed surplus/deficit */}
                      {(corporateForm.currentWaterQuota > 0 ||
                        corporateForm.actualConsumption > 0) && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl flex items-center gap-4"
                            style={{
                              backgroundColor:
                                computedSurplus >= 0 ? "#22c55e10" : "#ef444410",
                              border: `1px solid ${computedSurplus >= 0 ? "#22c55e40" : "#ef444440"}`,
                            }}
                          >
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor:
                                  computedSurplus >= 0
                                    ? "#22c55e20"
                                    : "#ef444420",
                              }}
                            >
                              {computedSurplus >= 0 ? (
                                <TrendingUp
                                  className="w-6 h-6"
                                  style={{ color: "#22c55e" }}
                                />
                              ) : (
                                <TrendingDown
                                  className="w-6 h-6"
                                  style={{ color: "#ef4444" }}
                                />
                              )}
                            </div>
                            <div>
                              <p
                                className="text-xs font-semibold mb-0.5"
                                style={{
                                  color:
                                    computedSurplus >= 0 ? "#22c55e" : "#ef4444",
                                }}
                              >
                                {computedSurplus >= 0
                                  ? language === "id"
                                    ? "✅ Surplus Kuota Air"
                                    : "✅ Water Quota Surplus"
                                  : language === "id"
                                    ? "⚠️ Defisit Kuota Air"
                                    : "⚠️ Water Quota Deficit"}
                              </p>
                              <p
                                className="text-xl font-bold"
                                style={{
                                  color:
                                    computedSurplus >= 0 ? "#22c55e" : "#ef4444",
                                }}
                              >
                                {computedSurplus >= 0 ? "+" : ""}
                                {computedSurplus.toLocaleString()} m³/tahun
                              </p>
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: theme.textSecondary }}
                              >
                                {computedSurplus >= 0
                                  ? language === "id"
                                    ? "Anda dapat menjual surplus ini ke perusahaan lain"
                                    : "You can sell this surplus to other companies"
                                  : language === "id"
                                    ? "Anda perlu membeli tambahan kuota sebesar ini"
                                    : "You need to purchase this additional quota"}
                              </p>
                            </div>
                          </motion.div>
                        )}

                      {/* Trading Intent */}
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Niat Perdagangan Kuota"
                            : "Quota Trading Intent"}{" "}
                          *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              value: "sell",
                              icon: <TrendingUp className="w-5 h-5" />,
                              label:
                                language === "id"
                                  ? "Jual Surplus"
                                  : "Sell Surplus",
                              desc:
                                language === "id"
                                  ? "Saya ingin menjual kelebihan kuota air saya"
                                  : "I want to sell my water quota surplus",
                              color: "#22c55e",
                            },
                            {
                              value: "buy",
                              icon: <TrendingDown className="w-5 h-5" />,
                              label:
                                language === "id" ? "Beli Kuota" : "Buy Quota",
                              desc:
                                language === "id"
                                  ? "Saya membutuhkan tambahan kuota air"
                                  : "I need additional water quota",
                              color: "#3b82f6",
                            },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setCorporateForm({
                                  ...corporateForm,
                                  tradingIntent: opt.value as any,
                                })
                              }
                              className="p-4 rounded-xl text-left transition-all"
                              style={{
                                backgroundColor:
                                  corporateForm.tradingIntent === opt.value
                                    ? `${opt.color}20`
                                    : theme.bgDark,
                                border: `2px solid ${corporateForm.tradingIntent === opt.value ? opt.color : theme.border}`,
                              }}
                            >
                              <div
                                className="flex items-center gap-2 mb-1"
                                style={{
                                  color:
                                    corporateForm.tradingIntent === opt.value
                                      ? opt.color
                                      : theme.textSecondary,
                                }}
                              >
                                {opt.icon}
                                <span className="font-semibold text-sm">
                                  {opt.label}
                                </span>
                              </div>
                              <p
                                className="text-xs"
                                style={{ color: theme.textMuted }}
                              >
                                {opt.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price per m³ */}
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Harga per m³ yang Ditawarkan"
                            : "Offered Price per m³"}{" "}
                          *
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={form.currency || "IDR"}
                            onChange={(e) =>
                              setForm({ ...form, currency: e.target.value })
                            }
                            className="px-3 py-3 rounded-lg font-semibold text-sm focus:outline-none flex-shrink-0"
                            style={{
                              backgroundColor: "#f59e0b20",
                              border: "1px solid #f59e0b50",
                              color: "#f59e0b",
                              minWidth: "95px",
                            }}
                          >
                            <option value="IDR">🇮🇩 IDR</option>
                            <option value="USD">🇺🇸 USD</option>
                            <option value="MYR">🇲🇾 MYR</option>
                            <option value="SGD">🇸🇬 SGD</option>
                          </select>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={corporateForm.pricePerM3 || ""}
                            onChange={(e) =>
                              setCorporateForm({
                                ...corporateForm,
                                pricePerM3: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder={
                              form.currency === "IDR"
                                ? "e.g. 5000"
                                : "e.g. 0.30"
                            }
                            className={`${inp} flex-1`}
                            style={is}
                          />
                        </div>
                        <p
                          className="text-xs mt-1.5"
                          style={{ color: theme.textMuted }}
                        >
                          {language === "id"
                            ? "Harga ini bisa dinegosiasikan dengan pembeli/penjual di marketplace"
                            : "Price is negotiable with buyers/sellers on the marketplace"}
                        </p>
                      </div>

                      {/* Compliance */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block mb-2 text-sm font-semibold"
                            style={lbl}
                          >
                            {language === "id"
                              ? "Status Kepatuhan Lingkungan"
                              : "Environmental Compliance Status"}
                          </label>
                          <select
                            value={corporateForm.complianceStatus}
                            onChange={(e) =>
                              setCorporateForm({
                                ...corporateForm,
                                complianceStatus: e.target.value as any,
                              })
                            }
                            className={inp}
                            style={is}
                          >
                            <option value="compliant">
                              {language === "id"
                                ? "✅ Patuh (Compliant)"
                                : "✅ Compliant"}
                            </option>
                            <option value="at_risk">
                              {language === "id"
                                ? "⚠️ Berisiko (At Risk)"
                                : "⚠️ At Risk"}
                            </option>
                            <option value="non_compliant">
                              {language === "id"
                                ? "❌ Tidak Patuh"
                                : "❌ Non-Compliant"}
                            </option>
                          </select>
                        </div>
                        <div>
                          <label
                            className="block mb-2 text-sm font-semibold"
                            style={lbl}
                          >
                            {language === "id"
                              ? "Tanggal Audit Terakhir"
                              : "Last Audit Date"}
                          </label>
                          <input
                            type="date"
                            value={corporateForm.lastAuditDate}
                            onChange={(e) =>
                              setCorporateForm({
                                ...corporateForm,
                                lastAuditDate: e.target.value,
                              })
                            }
                            max={new Date().toISOString().split("T")[0]}
                            className={inp}
                            style={is}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Kuota Berlaku Hingga"
                            : "Quota Valid Until"}
                        </label>
                        <input
                          type="date"
                          value={corporateForm.quotaExpiryDate}
                          onChange={(e) =>
                            setCorporateForm({
                              ...corporateForm,
                              quotaExpiryDate: e.target.value,
                            })
                          }
                          className={inp}
                          style={is}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location for corporate */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: "#f59e0b" }}
                    >
                      {language === "id"
                        ? "Lokasi Fasilitas"
                        : "Facility Location"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id" ? "Negara" : "Country"} *
                        </label>
                        <select
                          required
                          value={selectedCountry}
                          onChange={(e) => {
                            setSelectedCountry(e.target.value);
                            setForm({
                              ...form,
                              country: e.target.value,
                              province: "",
                            });
                          }}
                          className={inp}
                          style={is}
                        >
                          <option value="">
                            {language === "id"
                              ? "Pilih Negara..."
                              : "Select Country..."}
                          </option>
                          {Object.keys(COUNTRY_PROVINCE_DATA).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Provinsi / Wilayah"
                            : "Province / Region"}
                        </label>
                        <select
                          value={form.province}
                          onChange={(e) =>
                            setForm({ ...form, province: e.target.value })
                          }
                          className={inp}
                          style={is}
                          disabled={!selectedCountry}
                        >
                          <option value="">
                            {selectedCountry
                              ? language === "id"
                                ? "Pilih Provinsi..."
                                : "Select Province..."
                              : language === "id"
                                ? "Pilih negara dulu"
                                : "Select country first"}
                          </option>
                          {availableProvinces.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label
                        className="block mb-2 text-sm font-semibold"
                        style={lbl}
                      >
                        {language === "id"
                          ? "Kota / Kabupaten"
                          : "City / Regency"}
                      </label>
                      <input
                        type="text"
                        value={form.regency}
                        onChange={(e) =>
                          setForm({ ...form, regency: e.target.value })
                        }
                        placeholder={
                          language === "id"
                            ? "Contoh: Kabupaten Bekasi"
                            : "e.g., Bekasi Regency"
                        }
                        className={inp}
                        style={is}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: "#f59e0b" }}
                    >
                      {language === "id"
                        ? "Deskripsi & Dokumen"
                        : "Description & Documents"}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Deskripsi Program"
                            : "Program Description"}{" "}
                          *
                        </label>
                        <textarea
                          required
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                          placeholder={
                            language === "id"
                              ? "Jelaskan konteks penggunaan air perusahaan, alasan surplus/defisit, rencana efisiensi, dan dampak lingkungan yang diharapkan dari perdagangan kuota ini..."
                              : "Describe your company's water usage context, reason for surplus/deficit, efficiency plans, and expected environmental impact from this quota trading..."
                          }
                          rows={4}
                          className={`${inp} resize-none`}
                          style={is}
                        />
                      </div>
                      {/* Document Upload */}
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Dokumen Pendukung"
                            : "Supporting Documents"}
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:opacity-80"
                          style={{
                            borderColor: "#f59e0b60",
                            backgroundColor: "#f59e0b08",
                          }}
                        >
                          <Upload
                            className="w-5 h-5"
                            style={{ color: "#f59e0b" }}
                          />
                          <p
                            className="text-sm font-semibold"
                            style={{ color: theme.textPrimary }}
                          >
                            {language === "id"
                              ? "Upload Dokumen Pendukung"
                              : "Upload Supporting Documents"}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: theme.textMuted }}
                          >
                            {language === "id"
                              ? "Surat izin kuota air, laporan audit, AMDAL, kontrak alokasi (PDF, DOC, JPG)"
                              : "Water quota permit, audit report, environmental impact assessment, allocation contract (PDF, DOC, JPG)"}
                          </p>
                        </button>
                        {uploadedDocs.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {uploadedDocs.map((doc, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                                style={{
                                  backgroundColor: theme.bgDark,
                                  border: `1px solid ${theme.border}`,
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <FileText
                                    className="w-4 h-4"
                                    style={{ color: "#f59e0b" }}
                                  />
                                  <div>
                                    <p
                                      className="text-xs font-medium"
                                      style={{ color: theme.textPrimary }}
                                    >
                                      {doc.name}
                                    </p>
                                    <p
                                      className="text-xs"
                                      style={{ color: theme.textMuted }}
                                    >
                                      {doc.size}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setUploadedDocs((prev) =>
                                      prev.filter((_, idx) => idx !== i),
                                    )
                                  }
                                  className="p-1 rounded hover:bg-red-500/10"
                                >
                                  <X
                                    className="w-3.5 h-3.5"
                                    style={{ color: theme.textMuted }}
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* ══════════════════════════════════════════════════════
                  COMMUNITY FORM (existing)
              ══════════════════════════════════════════════════════ */}
              {projectCategory === "community" && (
                <div className="space-y-6">
                  {/* Section 1: Basic Info */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: theme.primary }}
                    >
                      {language === "id"
                        ? "Informasi Dasar"
                        : "Basic Information"}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id" ? "Nama Proyek" : "Project Name"} *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          placeholder={
                            language === "id"
                              ? "Contoh: Restorasi Wetland Kalimantan Timur"
                              : "Example: East Kalimantan Wetland Restoration"
                          }
                          className={inp}
                          style={is}
                        />
                      </div>
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Link Proyek (Opsional)"
                            : "Project Link (Optional)"}
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <ExternalLink
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                              style={{ color: theme.textMuted }}
                            />
                            <input
                              type="url"
                              value={projectLink}
                              onChange={(e) => setProjectLink(e.target.value)}
                              placeholder="https://yourproject.org"
                              className={inp}
                              style={{ ...is, paddingLeft: "2.5rem" }}
                            />
                          </div>
                          {projectLink && (
                            <a
                              href={projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-3 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                              style={{
                                backgroundColor: `${theme.primary}20`,
                                color: theme.primary,
                                border: `1px solid ${theme.primary}40`,
                              }}
                            >
                              {language === "id" ? "Buka" : "Open"}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Certification & Methodology */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: theme.primary }}
                    >
                      {language === "id"
                        ? "Sertifikasi & Metodologi VWBA"
                        : "Certification & VWBA Methodology"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Standar Sertifikasi"
                            : "Certification Standard"}{" "}
                          *
                        </label>
                        <select
                          required
                          value={form.certificationStandard as string}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              certificationStandard: e.target
                                .value as CertificationStandard,
                              customCertification: "",
                            })
                          }
                          className={inp}
                          style={is}
                        >
                          <option value="Gold Standard">Gold Standard</option>
                          <option value="Verra VCS">Verra VCS</option>
                          <option value="Plan Vivo">Plan Vivo</option>
                          <option value="AWS">
                            AWS (Alliance for Water Stewardship)
                          </option>
                          <option value="ISO 14046">
                            ISO 14046 Water Footprint
                          </option>
                          <option value="Other">
                            {language === "id"
                              ? "Lainnya (Tulis Sendiri)"
                              : "Other (Custom)"}
                          </option>
                        </select>
                        {(form.certificationStandard as string) === "Other" && (
                          <input
                            type="text"
                            required
                            value={(form as any).customCertification || ""}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                customCertification: e.target.value,
                              } as any)
                            }
                            placeholder={
                              language === "id"
                                ? "Tuliskan standar sertifikasi Anda..."
                                : "Write your certification standard..."
                            }
                            className={`${inp} mt-2`}
                            style={is}
                          />
                        )}
                      </div>
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold flex items-center gap-2"
                          style={lbl}
                        >
                          {language === "id" ? "Metodologi" : "Methodology"} *
                          <button
                            type="button"
                            onClick={() => setShowMethodInfo(!showMethodInfo)}
                            className="px-2 py-0.5 rounded text-xs font-normal transition-all hover:opacity-80"
                            style={{
                              backgroundColor: `${theme.primary}20`,
                              color: theme.primary,
                            }}
                          >
                            {showMethodInfo
                              ? language === "id"
                                ? "Sembunyikan"
                                : "Hide"
                              : language === "id"
                                ? "Info VWBA"
                                : "VWBA Info"}
                          </button>
                        </label>
                        <select
                          required
                          value={form.methodology as string}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              methodology: e.target.value as Methodology,
                              customMethodology: "",
                            } as any)
                          }
                          className={inp}
                          style={is}
                        >
                          {VWBA_METHODOLOGIES.map((m) => (
                            <option key={m.value} value={m.value}>
                              {language === "id" ? m.labelId : m.labelEn}
                            </option>
                          ))}
                        </select>
                        {(form.methodology as string) === "Other" && (
                          <input
                            type="text"
                            required
                            value={(form as any).customMethodology || ""}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                customMethodology: e.target.value,
                              } as any)
                            }
                            placeholder={
                              language === "id"
                                ? "Tuliskan metodologi Anda secara spesifik..."
                                : "Describe your specific methodology..."
                            }
                            className={`${inp} mt-2`}
                            style={is}
                          />
                        )}
                      </div>
                    </div>
                    {/* VWBA Method Info Card */}
                    {showMethodInfo && selectedMethod && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-4 rounded-xl space-y-2"
                        style={{
                          backgroundColor: `${theme.secondary}10`,
                          border: `1px solid ${theme.secondary}30`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Award
                            className="w-4 h-4"
                            style={{ color: theme.secondary }}
                          />
                          <p
                            className="text-xs font-bold"
                            style={{ color: theme.secondary }}
                          >
                            {language === "id"
                              ? "Metode Perhitungan VWBA:"
                              : "VWBA Calculation Method:"}{" "}
                            {selectedMethod.vwbaMethod}
                          </p>
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: theme.textSecondary }}
                        >
                          {language === "id"
                            ? selectedMethod.descId
                            : selectedMethod.descEn}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Section 3: Location */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: theme.primary }}
                    >
                      {language === "id" ? "Lokasi Proyek" : "Project Location"}
                    </p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block mb-2 text-sm font-semibold"
                            style={lbl}
                          >
                            {language === "id" ? "Negara" : "Country"} *
                          </label>
                          <select
                            required
                            value={selectedCountry}
                            onChange={(e) => {
                              setSelectedCountry(e.target.value);
                              setForm({
                                ...form,
                                country: e.target.value,
                                province: "",
                              });
                            }}
                            className={inp}
                            style={is}
                          >
                            <option value="">
                              {language === "id"
                                ? "Pilih Negara..."
                                : "Select Country..."}
                            </option>
                            {Object.keys(COUNTRY_PROVINCE_DATA).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className="block mb-2 text-sm font-semibold"
                            style={lbl}
                          >
                            {language === "id"
                              ? "Provinsi / Wilayah"
                              : "Province / Region"}{" "}
                            *
                          </label>
                          <select
                            required
                            value={form.province}
                            onChange={(e) =>
                              setForm({ ...form, province: e.target.value })
                            }
                            className={inp}
                            style={is}
                            disabled={!selectedCountry}
                          >
                            <option value="">
                              {selectedCountry
                                ? language === "id"
                                  ? "Pilih Provinsi..."
                                  : "Select Province..."
                                : language === "id"
                                  ? "Pilih negara dulu"
                                  : "Select country first"}
                            </option>
                            {availableProvinces.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Kabupaten / Kota / Distrik"
                            : "Regency / City / District"}{" "}
                          *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.regency}
                          onChange={(e) =>
                            setForm({ ...form, regency: e.target.value })
                          }
                          placeholder={
                            language === "id"
                              ? "Contoh: Kutai Kartanegara"
                              : "Example: Kutai Kartanegara"
                          }
                          className={inp}
                          style={is}
                        />
                      </div>
                      {/* Coordinate Picker - Premium Map Design */}
                      <div>
                        <label
                          className="block mb-3 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Koordinat GPS Proyek"
                            : "Project GPS Coordinates"}
                        </label>

                        {/* Coordinate card - shows either empty state or filled state */}
                        {lat && lng ? (
                          /* === FILLED STATE === */
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl overflow-hidden mb-3"
                            style={{ border: `1px solid ${theme.primary}50` }}
                          >
                            {/* Mini map preview header */}
                            <div
                              className="px-4 py-3 flex items-center justify-between"
                              style={{
                                background: `linear-gradient(135deg, ${theme.primary}18, ${theme.secondary}12)`,
                                borderBottom: `1px solid ${theme.primary}30`,
                              }}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{
                                    backgroundColor: `${theme.primary}25`,
                                  }}
                                >
                                  <MapPin
                                    className="w-3.5 h-3.5"
                                    style={{ color: theme.primary }}
                                  />
                                </div>
                                <div>
                                  <p
                                    className="text-xs font-semibold"
                                    style={{ color: "#22c55e" }}
                                  >
                                    ✓{" "}
                                    {language === "id"
                                      ? "Lokasi Berhasil Ditandai"
                                      : "Location Marked"}
                                  </p>
                                  <p
                                    className="font-mono text-sm font-bold mt-0.5"
                                    style={{ color: theme.textPrimary }}
                                  >
                                    {parseFloat(lat).toFixed(6)},{" "}
                                    {parseFloat(lng).toFixed(6)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowMapPicker(true)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 flex items-center gap-1.5"
                                  style={{
                                    backgroundColor: `${theme.primary}20`,
                                    color: theme.primary,
                                    border: `1px solid ${theme.primary}40`,
                                  }}
                                >
                                  <MapPin className="w-3 h-3" />
                                  {language === "id" ? "Ubah" : "Change"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLat("");
                                    setLng("");
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/10"
                                  style={{
                                    color: theme.textMuted,
                                    border: `1px solid ${theme.border}`,
                                  }}
                                >
                                  {language === "id" ? "Hapus" : "Clear"}
                                </button>
                              </div>
                            </div>
                            {/* Coordinate details */}
                            <div
                              className="grid grid-cols-2 divide-x"
                              style={{
                                backgroundColor: theme.bgDark,
                                borderColor: theme.border,
                              }}
                            >
                              <div className="px-4 py-2.5">
                                <p
                                  className="text-xs mb-0.5"
                                  style={{ color: theme.textMuted }}
                                >
                                  Latitude
                                </p>
                                <p
                                  className="font-mono text-sm font-bold"
                                  style={{ color: theme.primary }}
                                >
                                  {parseFloat(lat).toFixed(6)}°
                                </p>
                              </div>
                              <div className="px-4 py-2.5">
                                <p
                                  className="text-xs mb-0.5"
                                  style={{ color: theme.textMuted }}
                                >
                                  Longitude
                                </p>
                                <p
                                  className="font-mono text-sm font-bold"
                                  style={{ color: theme.secondary }}
                                >
                                  {parseFloat(lng).toFixed(6)}°
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          /* === EMPTY STATE === */
                          <button
                            type="button"
                            onClick={() => setShowMapPicker(true)}
                            className="w-full rounded-xl flex flex-col items-center justify-center gap-3 transition-all group hover:border-blue-500/60"
                            style={{
                              border: `2px dashed ${theme.border}`,
                              backgroundColor: `${theme.bgDark}80`,
                              padding: "28px 20px",
                            }}
                          >
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                              style={{
                                background: `linear-gradient(135deg, ${theme.primary}25, ${theme.secondary}15)`,
                                border: `1px solid ${theme.primary}40`,
                              }}
                            >
                              <MapPin
                                className="w-7 h-7"
                                style={{ color: theme.primary }}
                              />
                            </div>
                            <div className="text-center">
                              <p
                                className="font-semibold text-sm mb-1"
                                style={{ color: theme.textPrimary }}
                              >
                                {language === "id"
                                  ? "Pilih Lokasi di Peta"
                                  : "Pick Location on Map"}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: theme.textMuted }}
                              >
                                {language === "id"
                                  ? "Klik untuk membuka peta interaktif • 1 klik = koordinat proyek"
                                  : "Click to open interactive map • 1 click = project coordinates"}
                              </p>
                            </div>
                            <div
                              className="px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                              style={{
                                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                                color: "white",
                              }}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              {language === "id" ? "Buka Peta" : "Open Map"}
                            </div>
                          </button>
                        )}

                        {coordMsg && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs mt-2 font-medium"
                            style={{
                              color: coordMsg.startsWith("✓")
                                ? "#22c55e"
                                : "#f59e0b",
                            }}
                          >
                            {coordMsg}
                          </motion.p>
                        )}
                      </div>

                      {/* TAMBAH SECTION BARU: Verifikasi Pihak Ketiga */}
                      <div className="col-span-2 mt-4">
                        <label
                          className="flex items-center gap-3 cursor-pointer p-4 rounded-xl transition-all hover:bg-white/5"
                          style={{ border: `1px solid ${theme.border}` }}
                        >
                          <input
                            type="checkbox"
                            checked={form.hasThirdPartyVerification || false}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                hasThirdPartyVerification: e.target.checked,
                              })
                            }
                            className="w-5 h-5 accent-blue-500 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <p
                              className="font-semibold text-sm"
                              style={{ color: theme.textPrimary }}
                            >
                              {language === "id"
                                ? "✓ Proyek sudah diverifikasi oleh pihak ketiga"
                                : "✓ Project already verified by third party"}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: theme.textMuted }}
                            >
                              {language === "id"
                                ? "Centang jika proyek Anda sudah memiliki sertifikat/verifikasi dari lembaga independen"
                                : "Check if your project already has certification/verification from independent body"}
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* Third Party Details - Conditional */}
                      {form.hasThirdPartyVerification && (
                        <div
                          className="col-span-2 grid grid-cols-2 gap-4 p-4 rounded-xl mt-2"
                          style={{
                            backgroundColor: `${theme.primary}10`,
                            border: `1px solid ${theme.primary}30`,
                          }}
                        >
                          <div>
                            <label
                              className="block mb-2 text-sm font-semibold"
                              style={lbl}
                            >
                              {language === "id"
                                ? "Nama Lembaga Verifikator"
                                : "Verifier Organization"}{" "}
                              *
                            </label>
                            <input
                              type="text"
                              required={form.hasThirdPartyVerification}
                              value={form.thirdPartyVerifier || ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  thirdPartyVerifier: e.target.value,
                                })
                              }
                              placeholder={
                                language === "id"
                                  ? "Contoh: TÜV SÜD, SGS, Bureau Veritas"
                                  : "e.g., TÜV SÜD, SGS, Bureau Veritas"
                              }
                              className={inp}
                              style={is}
                            />
                          </div>
                          <div>
                            <label
                              className="block mb-2 text-sm font-semibold"
                              style={lbl}
                            >
                              {language === "id"
                                ? "Tanggal Verifikasi"
                                : "Verification Date"}{" "}
                              *
                            </label>
                            <input
                              type="date"
                              required={form.hasThirdPartyVerification}
                              value={form.verificationDate || ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  verificationDate: e.target.value,
                                })
                              }
                              max={new Date().toISOString().split("T")[0]}
                              className={inp}
                              style={is}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 4: Project Metrics */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: theme.primary }}
                    >
                      {language === "id" ? "Data Proyek" : "Project Data"}
                    </p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {
                            key: "areaHectares",
                            label:
                              language === "id"
                                ? "Luas Area (ha)"
                                : "Area Size (ha)",
                            placeholder: "2500",
                            step: "0.01",
                          },
                          {
                            key: "estimatedCredits",
                            label:
                              language === "id"
                                ? "Est. Kredit (m³)"
                                : "Est. Credits (m³)",
                            placeholder: "85000",
                            step: "1",
                          },
                        ].map((f) => (
                          <div key={f.key}>
                            <label
                              className="block mb-2 text-sm font-semibold"
                              style={lbl}
                            >
                              {f.label} *
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              step={f.step}
                              value={(form as any)[f.key] || ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  [f.key]: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder={f.placeholder}
                              className={inp}
                              style={is}
                            />
                          </div>
                        ))}
                      </div>
                      {/* Price with currency selector */}
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id" ? "Harga / m³" : "Price / m³"} *
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={form.currency || "USD"}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                currency: e.target.value,
                                pricePerCredit: 0,
                              })
                            }
                            className="px-3 py-3 rounded-lg font-semibold text-sm focus:outline-none flex-shrink-0"
                            style={{
                              backgroundColor: `${theme.primary}20`,
                              border: `1px solid ${theme.primary}50`,
                              color: theme.primary,
                              minWidth: "95px",
                            }}
                          >
                            <option value="USD">🇺🇸 USD</option>
                            <option value="IDR">🇮🇩 IDR</option>
                            <option value="MYR">🇲🇾 MYR</option>
                            <option value="SGD">🇸🇬 SGD</option>
                            <option value="EUR">🇪🇺 EUR</option>
                            <option value="GBP">🇬🇧 GBP</option>
                            <option value="AUD">🇦🇺 AUD</option>
                            <option value="JPY">🇯🇵 JPY</option>
                            <option value="CNY">🇨🇳 CNY</option>
                            <option value="THB">🇹🇭 THB</option>
                            <option value="PHP">🇵🇭 PHP</option>
                            <option value="VND">🇻🇳 VND</option>
                          </select>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={form.pricePerCredit || ""}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                pricePerCredit: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder={
                              form.currency === "IDR"
                                ? "e.g. 220000"
                                : form.currency === "USD"
                                  ? "e.g. 15.00"
                                  : "e.g. 15.00"
                            }
                            className={`${inp} flex-1`}
                            style={is}
                          />
                        </div>
                        {form.pricePerCredit > 0 && form.currency !== "USD" && (
                          <p
                            className="text-xs mt-1.5"
                            style={{ color: theme.textMuted }}
                          >
                            ≈ USD{" "}
                            {(form.currency === "IDR"
                              ? form.pricePerCredit / 15700
                              : form.currency === "MYR"
                                ? form.pricePerCredit / 4.7
                                : form.currency === "SGD"
                                  ? form.pricePerCredit / 1.35
                                  : form.currency === "EUR"
                                    ? form.pricePerCredit * 1.08
                                    : form.currency === "GBP"
                                      ? form.pricePerCredit * 1.27
                                      : form.currency === "AUD"
                                        ? form.pricePerCredit / 1.55
                                        : form.currency === "JPY"
                                          ? form.pricePerCredit / 150
                                          : form.currency === "CNY"
                                            ? form.pricePerCredit / 7.2
                                            : form.currency === "THB"
                                              ? form.pricePerCredit / 35
                                              : form.currency === "PHP"
                                                ? form.pricePerCredit / 57
                                                : form.currency === "VND"
                                                  ? form.pricePerCredit / 25000
                                                  : form.pricePerCredit
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })}{" "}
                            / m³
                          </p>
                        )}
                        {form.pricePerCredit > 0 && form.currency === "USD" && (
                          <p
                            className="text-xs mt-1.5"
                            style={{ color: theme.textMuted }}
                          >
                            ≈ IDR{" "}
                            {(form.pricePerCredit * 15700).toLocaleString(
                              "id-ID",
                            )}{" "}
                            / m³
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Durasi Proyek (tahun)"
                            : "Project Duration (years)"}{" "}
                          *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={form.duration || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              duration: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder={
                            language === "id" ? "Contoh: 25" : "Example: 25"
                          }
                          className={`${inp} max-w-xs`}
                          style={is}
                        />
                      </div>
                      <div>
                        <label
                          className="block mb-2 text-sm font-semibold"
                          style={lbl}
                        >
                          {language === "id"
                            ? "Deskripsi Proyek"
                            : "Project Description"}{" "}
                          *
                        </label>
                        <textarea
                          required
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                          placeholder={
                            language === "id"
                              ? "Jelaskan tujuan, metodologi VWBA yang digunakan, dampak lingkungan, manfaat sosial, tantangan air bersama yang diatasi, dan rencana pemantauan proyek..."
                              : "Describe the objectives, applied VWBA methodology, environmental impact, social benefits, shared water challenges addressed, and project monitoring plan..."
                          }
                          rows={4}
                          className={`${inp} resize-none`}
                          style={is}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ─────────── Section 5: Foto Cover Proyek ─────────── */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: theme.primary }}
                    >
                      {language === "id"
                        ? "Foto Cover Proyek"
                        : "Project Cover Photo"}
                    </p>

                    {/* Toggle URL / File */}
                    <div className="flex gap-2 mb-4">
                      {(["file", "url"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setCoverMode(mode);
                            if (mode !== coverMode) {
                              setCoverPreview("");
                              setForm((prev) => ({
                                ...prev,
                                coverImageUrl: "",
                              }));
                            }
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            backgroundColor:
                              coverMode === mode ? theme.primary : theme.bgDark,
                            color:
                              coverMode === mode ? "#fff" : theme.textMuted,
                            border: `1px solid ${coverMode === mode ? theme.primary : theme.border}`,
                          }}
                        >
                          {mode === "file"
                            ? language === "id"
                              ? "📁 Upload File"
                              : "📁 Upload File"
                            : language === "id"
                              ? "🔗 Dari URL"
                              : "🔗 From URL"}
                        </button>
                      ))}
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={coverFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverFile}
                    />

                    {coverMode === "file" ? (
                      /* --- Upload File --- */
                      <div>
                        {coverPreview ? (
                          /* Preview */
                          <div
                            className="relative rounded-xl overflow-hidden"
                            style={{ height: 160 }}
                          >
                            <img
                              src={coverPreview}
                              alt="cover"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                              <p className="text-xs text-white font-semibold">
                                {language === "id"
                                  ? "✓ Foto dipilih"
                                  : "✓ Photo selected"}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setCoverPreview("");
                                  setForm((prev) => ({
                                    ...prev,
                                    coverImageUrl: "",
                                  }));
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/80 text-white hover:bg-red-600/80 transition-colors"
                              >
                                <X className="w-3 h-3" />
                                {language === "id" ? "Ganti" : "Change"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Drop zone */
                          <button
                            type="button"
                            onClick={() => coverFileRef.current?.click()}
                            className="w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all hover:opacity-80 cursor-pointer"
                            style={{
                              borderColor: theme.border,
                              backgroundColor: theme.bgDark,
                            }}
                          >
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center"
                              style={{ backgroundColor: `${theme.primary}20` }}
                            >
                              <Upload
                                className="w-7 h-7"
                                style={{ color: theme.primary }}
                              />
                            </div>
                            <div className="text-center">
                              <p
                                className="text-sm font-semibold"
                                style={{ color: theme.textPrimary }}
                              >
                                {language === "id"
                                  ? "Klik untuk upload foto cover"
                                  : "Click to upload cover photo"}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: theme.textMuted }}
                              >
                                JPG, PNG, WebP — maks 5 MB
                              </p>
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* --- URL Input --- */
                      <div className="space-y-3">
                        <input
                          type="url"
                          value={
                            form.coverImageUrl.startsWith("data:")
                              ? ""
                              : form.coverImageUrl
                          }
                          onChange={(e) => {
                            const url = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              coverImageUrl: url,
                            }));
                            setCoverPreview(url);
                          }}
                          placeholder="https://images.unsplash.com/photo-..."
                          className={inp}
                          style={is}
                        />
                        <p
                          className="text-xs"
                          style={{ color: theme.textMuted }}
                        >
                          {language === "id"
                            ? "Paste URL gambar publik (JPG/PNG). Kosongkan untuk pakai foto default."
                            : "Paste a public image URL (JPG/PNG). Leave blank to use default photo."}
                        </p>
                        {/* Live preview URL */}
                        {coverPreview && !coverPreview.startsWith("data:") && (
                          <div
                            className="relative rounded-xl overflow-hidden"
                            style={{ height: 140 }}
                          >
                            <img
                              src={coverPreview}
                              alt="preview"
                              className="w-full h-full object-cover"
                              onError={() => setCoverPreview("")}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <p className="absolute bottom-2 left-3 text-xs text-white font-medium">
                              Preview
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ─────────── Section 6: Document Upload ─────────── */}
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: theme.primary }}
                    >
                      {language === "id" ? "Upload Dokumen" : "Document Upload"}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-3 transition-all hover:opacity-80"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: `${theme.bgDark}`,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${theme.primary}20` }}
                      >
                        <Upload
                          className="w-6 h-6"
                          style={{ color: theme.primary }}
                        />
                      </div>
                      <div className="text-center">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: theme.textPrimary }}
                        >
                          {language === "id"
                            ? "Klik untuk upload dokumen"
                            : "Click to upload documents"}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: theme.textMuted }}
                        >
                          {language === "id"
                            ? "PDD, Studi Baseline, Laporan Lingkungan, Peta (PDF, DOC, XLS, JPG)"
                            : "PDD, Baseline Study, Environmental Report, Maps (PDF, DOC, XLS, JPG)"}
                        </p>
                      </div>
                    </button>
                    {uploadedDocs.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedDocs.map((doc, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                            style={{
                              backgroundColor: theme.bgDark,
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <FileText
                                className="w-4 h-4"
                                style={{ color: theme.primary }}
                              />
                              <div>
                                <p
                                  className="text-xs font-medium"
                                  style={{ color: theme.textPrimary }}
                                >
                                  {doc.name}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: theme.textMuted }}
                                >
                                  {doc.size}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setUploadedDocs((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                )
                              }
                              className="p-1 rounded hover:bg-red-500/10"
                            >
                              <X
                                className="w-3.5 h-3.5"
                                style={{ color: theme.textMuted }}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}{" "}
              {/* end community form */}
            </div>

            {/* ── Sticky Footer ── */}
            <div
              className="px-6 py-4 border-t flex gap-3 flex-shrink-0"
              style={{ borderColor: theme.border }}
            >
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-white/5 text-sm"
                style={{
                  backgroundColor: theme.bgDark,
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {language === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("🔍 DEBUG - Current form state:");
                  console.log("Title:", form.title || "❌ KOSONG!");
                  console.log("Country:", form.country || "❌ KOSONG!");
                  console.log("Province:", form.province || "❌ KOSONG!");
                  console.log("Regency:", form.regency || "❌ KOSONG!");
                  console.log("Area:", form.areaHectares || "❌ KOSONG!");
                  console.log(
                    "Credits:",
                    form.estimatedCredits || "❌ KOSONG!",
                  );
                  console.log("Price:", form.pricePerCredit || "❌ KOSONG!");
                  console.log("Duration:", form.duration || "❌ KOSONG!");
                  console.log("Description:", form.description || "❌ KOSONG!");
                  handleContinue();
                }}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
              >
                <Upload className="w-4 h-4" />
                {language === "id"
                  ? "Lanjut ke Perjanjian"
                  : "Continue to Agreement"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onSelect={(latitude, longitude) => {
          setLat(latitude.toString());
          setLng(longitude.toString());
          // TAMBAH: simpan koordinat ke form
          setForm((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
          setCoordMsg(
            `✓ Koordinat: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          );
          setTimeout(() => setCoordMsg(""), 4000);
        }}
        initialLat={parseFloat(lat) || -0.789}
        initialLng={parseFloat(lng) || 113.921}
        language={language}
      />
    </>
  );
};

// ============================================================================
// DETAIL MODAL — TAB: OVERVIEW
// ============================================================================
type DetailTab = "overview" | "verification" | "team" | "documents" | "history";

const OverviewTab: React.FC<{ project: Project; language: "id" | "en" }> = ({
  project,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  return (
    <div className="space-y-4">
      {/* ── Hero Cover Image ── */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{ height: 230 }}
      >
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Badge marketplace */}
        {project.listedInMarketplace && (
          <div className="absolute top-3 right-3">
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                backgroundColor: "#22c55e25",
                color: "#22c55e",
                border: "1px solid #22c55e50",
              }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {language === "id" ? "Sudah di Marketplace" : "In Marketplace"}
            </span>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white leading-snug">
            {project.title}
          </h3>
          <p className="text-sm text-gray-300 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {project.location.province}
            {project.location.regency ? `, ${project.location.regency}` : ""}
          </p>
        </div>
      </div>

      {/* ── Description ── */}
      {project.description && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: theme.bgDark,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h4
            className="font-semibold text-sm mb-2 flex items-center gap-2"
            style={{ color: theme.textPrimary }}
          >
            <Info className="w-4 h-4" style={{ color: theme.primary }} />
            {language === "id" ? "Deskripsi Proyek" : "Project Description"}
          </h4>
          <p
            className="text-sm leading-relaxed"
            style={{ color: theme.textSecondary }}
          >
            {project.description}
          </p>
        </div>
      )}

      {/* ── Key Metrics 2×2 ── */}
      <div className="grid grid-cols-2 gap-3">
        {(project as any).category === "corporate" &&
          (project as any).corporateData
          ? (() => {
            const cd = (project as any).corporateData;
            return [
              {
                label:
                  language === "id"
                    ? "Kuota Resmi (m³/thn)"
                    : "Official Quota (m³/yr)",
                value: `${cd.currentWaterQuota?.toLocaleString() ?? "-"} m³`,
                color: theme.primary,
                icon: <Droplets className="w-4 h-4" />,
              },
              {
                label:
                  language === "id" ? "Konsumsi Aktual" : "Actual Consumption",
                value: `${cd.actualConsumption?.toLocaleString() ?? "-"} m³`,
                color: "#f59e0b",
                icon: <BarChart3 className="w-4 h-4" />,
              },
              {
                label:
                  language === "id" ? "Surplus / Defisit" : "Surplus / Deficit",
                value: `${cd.surplusDeficit >= 0 ? "+" : ""}${cd.surplusDeficit?.toLocaleString() ?? "-"} m³`,
                color: cd.surplusDeficit >= 0 ? "#22c55e" : "#ef4444",
                icon:
                  cd.surplusDeficit >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  ),
              },
              {
                label: language === "id" ? "Harga / m³" : "Price / m³",
                value: `${project.currency || "IDR"} ${cd.pricePerM3?.toLocaleString() ?? "-"}`,
                color: theme.secondary,
                icon: <ArrowRightLeft className="w-4 h-4" />,
              },
            ].map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{
                  backgroundColor: theme.bgDark,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${m.color}20`, color: m.color }}
                >
                  {m.icon}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs mb-0.5"
                    style={{ color: theme.textMuted }}
                  >
                    {m.label}
                  </p>
                  <p className="text-sm font-bold" style={{ color: m.color }}>
                    {m.value}
                  </p>
                </div>
              </div>
            ));
          })()
          : [
            {
              label: language === "id" ? "Est. Kredit" : "Est. Credits",
              value: `${project.waterData.estimatedCredits.toLocaleString()} m³`,
              color: theme.primary,
              icon: <Leaf className="w-4 h-4" />,
            },
            {
              label: language === "id" ? "Terverifikasi" : "Verified",
              value: `${project.waterData.verifiedCredits.toLocaleString()} m³`,
              color: theme.secondary,
              icon: <CheckCircle className="w-4 h-4" />,
            },
            {
              label: language === "id" ? "Harga / m³" : "Price / m³",
              value: `${project.currency || "IDR"} ${project.waterData.pricePerCredit.toLocaleString()}`,
              color: "#f59e0b",
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              label: language === "id" ? "Luas Area" : "Area Size",
              value: `${project.areaHectares.toLocaleString()} ha`,
              color: "#8b5cf6",
              icon: <MapPin className="w-4 h-4" />,
            },
          ].map((m, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${m.color}20`, color: m.color }}
              >
                {m.icon}
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs mb-0.5"
                  style={{ color: theme.textMuted }}
                >
                  {m.label}
                </p>
                <p className="text-sm font-bold" style={{ color: m.color }}>
                  {m.value}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* ── Info Grid 2-column ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(project as any).category === "corporate" &&
          (project as any).corporateData
          ? (() => {
            const cd = (project as any).corporateData;
            return [
              {
                icon: <Building2 className="w-4 h-4" />,
                l: language === "id" ? "Perusahaan" : "Company",
                v: project.ownerCompany,
                c: "#8b5cf6",
              },
              {
                icon: <Factory className="w-4 h-4" />,
                l: language === "id" ? "Industri" : "Industry",
                v: cd.industry || "-",
                c: "#f59e0b",
              },
              {
                icon: <ArrowRightLeft className="w-4 h-4" />,
                l: language === "id" ? "Niat Perdagangan" : "Trading Intent",
                v:
                  cd.tradingIntent === "sell"
                    ? language === "id"
                      ? "Jual Surplus Kuota"
                      : "Sell Surplus Quota"
                    : language === "id"
                      ? "Beli Tambahan Kuota"
                      : "Buy Additional Quota",
                c: cd.tradingIntent === "sell" ? "#22c55e" : "#3b82f6",
              },
              {
                icon: <Shield className="w-4 h-4" />,
                l: language === "id" ? "Status Kepatuhan" : "Compliance Status",
                v:
                  cd.complianceStatus === "compliant"
                    ? language === "id"
                      ? "Patuh"
                      : "Compliant"
                    : cd.complianceStatus === "at_risk"
                      ? language === "id"
                        ? "Berisiko"
                        : "At Risk"
                      : language === "id"
                        ? "Tidak Patuh"
                        : "Non-Compliant",
                c:
                  cd.complianceStatus === "compliant"
                    ? "#22c55e"
                    : cd.complianceStatus === "at_risk"
                      ? "#f59e0b"
                      : "#ef4444",
              },
              {
                icon: <MapPin className="w-4 h-4" />,
                l: language === "id" ? "Lokasi" : "Location",
                v: `${project.location.province}${project.location.regency ? ", " + project.location.regency : ""}`,
                c: theme.primary,
              },
              {
                icon: <Calendar className="w-4 h-4" />,
                l: language === "id" ? "Kuota Berlaku Hingga" : "Quota Expiry",
                v: cd.quotaExpiryDate || "-",
                c: "#06b6d4",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  backgroundColor: theme.bgDark,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.c}20`, color: item.c }}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    {item.l}
                  </p>
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: theme.textPrimary }}
                  >
                    {item.v}
                  </p>
                </div>
              </div>
            ));
          })()
          : [
            {
              icon: <Building2 className="w-4 h-4" />,
              l: language === "id" ? "Perusahaan" : "Company",
              v: project.ownerCompany,
              c: "#8b5cf6",
            },
            {
              icon: <MapPin className="w-4 h-4" />,
              l: language === "id" ? "Lokasi" : "Location",
              v: `${project.location.province}${project.location.regency ? ", " + project.location.regency : ""}`,
              c: theme.primary,
            },
            {
              icon: <Award className="w-4 h-4" />,
              l: language === "id" ? "Metodologi" : "Methodology",
              v: project.methodology,
              c: theme.secondary,
            },
            {
              icon: <Shield className="w-4 h-4" />,
              l: language === "id" ? "Sertifikasi" : "Certification",
              v: project.certificationStandard,
              c: "#f59e0b",
            },
            {
              icon: <Calendar className="w-4 h-4" />,
              l: language === "id" ? "Tanggal Mulai" : "Start Date",
              v: project.startDate || "-",
              c: "#06b6d4",
            },
            {
              icon: <Clock className="w-4 h-4" />,
              l: language === "id" ? "Durasi" : "Duration",
              v: `${project.creditingPeriodYears} ${language === "id" ? "tahun" : "years"}`,
              c: "#ec4899",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.c}20`, color: item.c }}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {item.l}
                </p>
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: theme.textPrimary }}
                >
                  {item.v}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* ── Progress Bar ── */}
      <div
        className="p-4 rounded-xl"
        style={{
          backgroundColor: theme.bgDark,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex justify-between mb-2.5 text-sm">
          <span style={{ color: theme.textSecondary }}>
            {language === "id" ? "Progress Proyek" : "Project Progress"}
          </span>
          <span className="font-bold" style={{ color: theme.primary }}>
            {project.progress || 0}%
          </span>
        </div>
        <div
          className="h-2.5 rounded-full"
          style={{ backgroundColor: theme.border }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress || 0}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-2.5 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
            }}
          />
        </div>
      </div>

      {/* ── Admin Notes / Rejection Reason ── */}
      {project.adminNotes && (
        <div
          className="p-4 rounded-xl"
          style={{ backgroundColor: "#f59e0b12", border: "1px solid #f59e0b30" }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: "#f59e0b" }}>
            {language === "id" ? "Catatan Admin" : "Admin Notes"}
          </p>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {project.adminNotes}
          </p>
        </div>
      )}
      {project.adminRejectionReason && (
        <div
          className="p-4 rounded-xl"
          style={{ backgroundColor: "#ef444412", border: "1px solid #ef444430" }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: "#ef4444" }}>
            {language === "id" ? "Alasan Penolakan" : "Rejection Reason"}
          </p>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {project.adminRejectionReason}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DETAIL MODAL — TAB: VERIFICATION
// ============================================================================
const VerificationTab: React.FC<{
  project: Project;
  language: "id" | "en";
  isAdmin?: boolean;
  onUpdateStep?: (stepId: number, status: StepStatus) => void;
  onAutoApprove?: () => void;
}> = ({ project, language, isAdmin, onUpdateStep, onAutoApprove }) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const [openDropdownStep, setOpenDropdownStep] = useState<number | null>(null);
  const steps = project.verificationSteps?.length
    ? project.verificationSteps
    : [];
  const done = steps.filter((s) => s.status === "completed").length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  const isAllDone = pct === 100;

  return (
    <div className="space-y-5">
      {/* ── Progress Card ── */}
      <div
        className="p-4 rounded-xl"
        style={{
          backgroundColor: theme.bgDark,
          border: `1px solid ${isAllDone ? "#22c55e40" : theme.border}`,
        }}
      >
        <div className="flex justify-between mb-2">
          <span
            className="font-semibold text-sm"
            style={{ color: theme.textPrimary }}
          >
            {language === "id"
              ? "Progress Verifikasi"
              : "Verification Progress"}
          </span>
          <span
            className="font-bold text-lg"
            style={{ color: isAllDone ? "#22c55e" : theme.primary }}
          >
            {pct}%
          </span>
        </div>
        <div
          className="w-full h-3 rounded-full"
          style={{ backgroundColor: theme.border }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-3 rounded-full"
            style={{
              background: isAllDone
                ? "linear-gradient(90deg, #22c55e, #16a34a)"
                : `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: theme.textSecondary }}>
          {done}/{steps.length}{" "}
          {language === "id" ? "tahapan selesai" : "stages completed"}
        </p>

        {/* 🎉 Auto-approve banner when 100% */}
        {isAllDone && isAdmin && !project.listedInMarketplace && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 rounded-xl flex items-center justify-between gap-3"
            style={{
              backgroundColor: "#22c55e12",
              border: "1px solid #22c55e40",
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "#22c55e" }}
              />
              <div>
                <p className="text-sm font-bold" style={{ color: "#22c55e" }}>
                  {language === "id"
                    ? "Semua tahap selesai!"
                    : "All stages complete!"}
                </p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {language === "id"
                    ? "Proyek siap didaftarkan ke marketplace."
                    : "Project is ready to be listed in marketplace."}
                </p>
              </div>
            </div>
            <button
              onClick={onAutoApprove}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              {language === "id"
                ? "Daftarkan ke Marketplace"
                : "List to Marketplace"}
            </button>
          </motion.div>
        )}

        {project.listedInMarketplace && (
          <div
            className="mt-3 p-3 rounded-xl flex items-center gap-2"
            style={{
              backgroundColor: "#22c55e10",
              border: "1px solid #22c55e30",
            }}
          >
            <ShoppingCart className="w-4 h-4" style={{ color: "#22c55e" }} />
            <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>
              {language === "id"
                ? "✓ Sudah terdaftar di Marketplace"
                : "✓ Already listed in Marketplace"}
            </p>
          </div>
        )}
      </div>

      {/* ── Steps ── */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const cfg = stepStatusConfig[step.status];
          const s = step as any;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${cfg.color}20`,
                    color: cfg.color,
                  }}
                >
                  {cfg.icon}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="w-0.5 flex-1 my-1 min-h-[16px]"
                    style={{
                      backgroundColor:
                        step.status === "completed"
                          ? theme.secondary
                          : theme.border,
                    }}
                  />
                )}
              </div>
              <div
                className="flex-1 p-4 rounded-xl mb-1"
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${step.status === "active" ? theme.primary + "60" : step.status === "completed" ? "#22c55e30" : theme.border}`,
                  boxShadow:
                    step.status === "active"
                      ? `0 0 16px ${theme.primary}15`
                      : "none",
                }}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${cfg.color}20`,
                          color: cfg.color,
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h4
                        className="font-bold text-sm"
                        style={{ color: theme.textPrimary }}
                      >
                        {language === "id"
                          ? s.name || s.title
                          : s.nameEn || s.titleEn || s.title}
                      </h4>
                    </div>
                    <p
                      className="text-xs mt-1.5 ml-7"
                      style={{ color: theme.textSecondary }}
                    >
                      {language === "id"
                        ? s.description || s.descriptionEn
                        : s.descriptionEn || s.description}
                    </p>
                  </div>
                  {/* Admin: Custom Dropdown — Non-admin: Badge */}
                  {isAdmin ? (
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() =>
                          setOpenDropdownStep(
                            openDropdownStep === step.id ? null : step.id,
                          )
                        }
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: `${cfg.color}18`,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}50`,
                          minWidth: "130px",
                        }}
                      >
                        <span className="flex-1 text-left whitespace-nowrap">
                          {language === "id" ? cfg.label : cfg.labelEn}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                      </button>
                      {openDropdownStep === step.id && (
                        <div
                          className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden shadow-xl z-50 min-w-[145px]"
                          style={{
                            backgroundColor: theme.bgCard,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {(
                            [
                              "completed",
                              "active",
                              "pending",
                              "failed",
                            ] as StepStatus[]
                          ).map((st) => {
                            const optCfg = stepStatusConfig[st];
                            return (
                              <button
                                key={st}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-opacity hover:opacity-70"
                                style={{
                                  backgroundColor:
                                    step.status === st
                                      ? `${optCfg.color}18`
                                      : "transparent",
                                  color: optCfg.color,
                                }}
                                onClick={() => {
                                  onUpdateStep?.(step.id, st);
                                  setOpenDropdownStep(null);
                                }}
                              >
                                {optCfg.icon}
                                {language === "id"
                                  ? optCfg.label
                                  : optCfg.labelEn}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
                      style={{
                        backgroundColor: `${cfg.color}18`,
                        color: cfg.color,
                        border: `1px solid ${cfg.color}30`,
                      }}
                    >
                      {cfg.icon}
                      {language === "id" ? cfg.label : cfg.labelEn}
                    </span>
                  )}
                </div>

                {(s.verifier || s.date) && (
                  <div className="flex gap-4 mt-2.5 ml-7 flex-wrap">
                    {s.verifier && (
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {s.verifier}
                      </div>
                    )}
                    {s.date && (
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {s.date}
                      </div>
                    )}
                  </div>
                )}

                {s.notes && (
                  <div
                    className="mt-2.5 ml-7 p-2.5 rounded-lg text-xs"
                    style={{
                      backgroundColor: theme.bgDark,
                      color: theme.textSecondary,
                      borderLeft: `3px solid ${cfg.color}`,
                    }}
                  >
                    {s.notes}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {project.vvbAssigned && (
        <div
          className="p-4 rounded-xl"
          style={{
            backgroundColor: theme.bgDark,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h4
            className="font-semibold text-sm mb-3 flex items-center gap-2"
            style={{ color: theme.textPrimary }}
          >
            <Shield className="w-4 h-4" style={{ color: theme.primary }} />
            {language === "id"
              ? "VVB Verifikator Ditugaskan"
              : "Assigned VVB Verifier"}
          </h4>
          <div className="space-y-2 text-sm">
            <div
              className="flex items-center gap-2"
              style={{ color: theme.textSecondary }}
            >
              <Building2 className="w-4 h-4" style={{ color: theme.primary }} />
              {project.vvbAssigned}
            </div>
            {project.vvbContactEmail && (
              <div
                className="flex items-center gap-2"
                style={{ color: theme.textSecondary }}
              >
                <Mail className="w-4 h-4" style={{ color: theme.primary }} />
                {project.vvbContactEmail}
              </div>
            )}
            {project.vvbVerificationLink && (
              <a
                href={project.vvbVerificationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80"
                style={{ color: theme.primary }}
              >
                <ExternalLink className="w-4 h-4" />
                {language === "id" ? "Lihat Portal VVB" : "View VVB Portal"}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DETAIL MODAL — TAB: TEAM
// ============================================================================
const TeamTab: React.FC<{ project: Project; language: "id" | "en" }> = ({
  project,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const team = project.team || [];
  if (!team.length)
    return (
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: `${theme.primary}20` }}
        >
          <Users className="w-8 h-8" style={{ color: theme.primary }} />
        </div>
        <p className="font-semibold" style={{ color: theme.textPrimary }}>
          {language === "id" ? "Belum Ada Anggota Tim" : "No Team Members Yet"}
        </p>
        <p className="text-sm mt-2" style={{ color: theme.textSecondary }}>
          {language === "id"
            ? "Tim akan ditambahkan setelah proyek diverifikasi."
            : "Team will be added after the project is verified."}
        </p>
      </div>
    );
  return (
    <div className="space-y-3">
      {team.map((m, i) => (
        <motion.div
          key={(m as any).id || i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{
            backgroundColor: theme.bgDark,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              color: "white",
            }}
          >
            {(m.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-sm"
              style={{ color: theme.textPrimary }}
            >
              {m.name}
            </p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              {m.role}
            </p>
            {m.email && (
              <div className="flex items-center gap-1 mt-0.5">
                <Mail
                  className="w-3 h-3 flex-shrink-0"
                  style={{ color: theme.textMuted }}
                />
                <p
                  className="text-xs truncate"
                  style={{ color: theme.textMuted }}
                >
                  {m.email}
                </p>
              </div>
            )}
          </div>
          <CheckCircle
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#22c55e" }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// DETAIL MODAL — TAB: DOCUMENTS
// ============================================================================
const DocumentsTab: React.FC<{ project: Project; language: "id" | "en" }> = ({
  project,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const docs = project.documents || [];
  const certOk = ["verified", "running", "completed"].includes(project.status);

  if (!docs.length && !certOk)
    return (
      <div className="space-y-4">
        <div className="text-center py-10">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${theme.primary}20` }}
          >
            <FileText className="w-8 h-8" style={{ color: theme.primary }} />
          </div>
          <p className="font-semibold" style={{ color: theme.textPrimary }}>
            {language === "id" ? "Belum Ada Dokumen" : "No Documents Yet"}
          </p>
          <p className="text-sm mt-2" style={{ color: theme.textSecondary }}>
            {language === "id"
              ? "Dokumen proyek akan muncul setelah diunggah."
              : "Project documents will appear after being uploaded."}
          </p>
        </div>
      </div>
    );

  const certDocs = [
    {
      type: "contract",
      icon: <FileText className="w-5 h-5" />,
      color: theme.primary,
      title: language === "id" ? "Kontrak Jual Beli" : "Purchase Agreement",
      sub:
        language === "id"
          ? "Kontrak resmi antara penjual & pembeli"
          : "Official contract between seller & buyer",
    },
    {
      type: "wcpa",
      icon: <Shield className="w-5 h-5" />,
      color: "#8b5cf6",
      title: "Water Credit Purchase Agreement (WCPA)",
      sub:
        language === "id"
          ? "Perjanjian pembelian water credit"
          : "International water credit purchase agreement",
    },
    {
      type: "certificate",
      icon: <Award className="w-5 h-5" />,
      color: "#f59e0b",
      title:
        language === "id"
          ? "Sertifikat Water Credit"
          : "Water Credit Certificate",
      sub:
        language === "id"
          ? `Sertifikat ${project.certificationStandard} terverifikasi`
          : `Verified ${project.certificationStandard} certificate`,
    },
  ];

  const dl = (type: string) =>
    alert(
      `${language === "id" ? "Mengunduh" : "Downloading"}: ${type} — ${project.title}`,
    );

  return (
    <div className="space-y-4">
      {docs.length > 0 &&
        docs.map((d, i) => (
          <motion.div
            key={(d as any).id || i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{
              backgroundColor: theme.bgDark,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${theme.primary}20`,
                color: theme.primary,
              }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-sm"
                style={{ color: theme.textPrimary }}
              >
                {d.name}
              </p>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                {d.type} • {d.uploadedAt}
              </p>
            </div>
            {d.url && (
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 hover:opacity-80"
                style={{
                  backgroundColor: `${theme.primary}20`,
                  color: theme.primary,
                }}
              >
                <Download className="w-3.5 h-3.5" />
                {language === "id" ? "Unduh" : "Download"}
              </a>
            )}
          </motion.div>
        ))}

      {!certOk && (
        <div
          className="p-4 rounded-xl flex items-start gap-3"
          style={{
            backgroundColor: "#f59e0b12",
            border: "1px solid #f59e0b30",
          }}
        >
          <AlertCircle
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{ color: "#f59e0b" }}
          />
          <div>
            <p className="font-semibold text-sm" style={{ color: "#f59e0b" }}>
              {language === "id"
                ? "Proyek Belum Terverifikasi"
                : "Project Not Yet Verified"}
            </p>
            <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              {language === "id"
                ? "Kontrak & sertifikat tersedia setelah status Terverifikasi."
                : "Contracts & certificates available after Verified status."}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {certDocs.map((d, i) => (
          <div
            key={d.type}
            className="p-4 rounded-xl flex items-center justify-between gap-3"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${certOk ? d.color + "40" : theme.border}`,
              opacity: certOk ? 1 : 0.55,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${d.color}20`, color: d.color }}
              >
                {d.icon}
              </div>
              <div className="min-w-0">
                <p
                  className="font-semibold text-sm"
                  style={{ color: theme.textPrimary }}
                >
                  {d.title}
                </p>
                <p
                  className="text-xs mt-0.5 line-clamp-1"
                  style={{ color: theme.textSecondary }}
                >
                  {d.sub}
                </p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full mt-1.5 inline-block"
                  style={{
                    backgroundColor: certOk ? "#22c55e20" : "#64748b20",
                    color: certOk ? "#22c55e" : "#64748b",
                  }}
                >
                  {certOk
                    ? language === "id"
                      ? "✓ Tersedia"
                      : "✓ Available"
                    : language === "id"
                      ? "Belum Tersedia"
                      : "Not Available"}
                </span>
              </div>
            </div>
            <button
              onClick={() => certOk && dl(d.type)}
              disabled={!certOk}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: certOk ? `${d.color}20` : theme.bgDark,
                color: certOk ? d.color : theme.textMuted,
                cursor: certOk ? "pointer" : "not-allowed",
                border: `1px solid ${certOk ? d.color + "40" : theme.border}`,
              }}
            >
              <Download className="w-4 h-4" />
              {language === "id" ? "Unduh" : "Download"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// DETAIL MODAL — TAB: HISTORY
// ============================================================================
const HistoryTab: React.FC<{ project: Project; language: "id" | "en" }> = ({
  project,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const history = project.verificationHistory || [];
  if (!history.length)
    return (
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: `${theme.primary}20` }}
        >
          <Clock className="w-8 h-8" style={{ color: theme.primary }} />
        </div>
        <p className="font-semibold" style={{ color: theme.textPrimary }}>
          {language === "id" ? "Belum Ada Riwayat" : "No History Yet"}
        </p>
      </div>
    );
  return (
    <div className="space-y-3">
      {history.map((item, i) => (
        <motion.div
          key={(item as any).id || i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="p-4 rounded-xl border-l-4"
          style={{ backgroundColor: theme.bgDark, borderColor: theme.primary }}
        >
          <div className="flex justify-between items-start mb-1">
            <p
              className="font-semibold text-sm"
              style={{ color: theme.textPrimary }}
            >
              {item.action}
            </p>
            <span
              className="text-xs flex-shrink-0 ml-2"
              style={{ color: theme.textMuted }}
            >
              {new Date(item.date).toLocaleDateString(
                language === "id" ? "id-ID" : "en-US",
              )}
            </span>
          </div>
          <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>
            By: {item.performedBy}
          </p>
          {item.notes && (
            <p className="text-xs" style={{ color: theme.textMuted }}>
              {item.notes}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// PROJECT DETAIL MODAL
// ============================================================================
interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  activeTab: DetailTab;
  setActiveTab: (tab: DetailTab) => void;
  language: "id" | "en";
  isAdmin: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onAssignVVB?: () => void;
  onCertify?: () => void;
  onUpdateStep?: (stepId: number, status: StepStatus) => void;
  onAutoApprove?: () => void;
  onDelete?: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  language,
  isAdmin,
  onApprove,
  onReject,
  onAssignVVB,
  onCertify,
  onUpdateStep,
  onAutoApprove,
  onDelete,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  if (!isOpen) return null;
  const s = statusColors[project.status];

  const tabs = [
    {
      id: "overview" as DetailTab,
      l: "Ringkasan",
      le: "Overview",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "verification" as DetailTab,
      l: "Verifikasi",
      le: "Verification",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: "team" as DetailTab,
      l: "Tim",
      le: "Team",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "documents" as DetailTab,
      l: "Dokumen",
      le: "Documents",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "history" as DetailTab,
      l: "Riwayat",
      le: "History",
      icon: <Clock className="w-4 h-4" />,
    },
  ];

  const content: Record<DetailTab, React.ReactNode> = {
    overview: <OverviewTab project={project} language={language} />,
    verification: (
      <VerificationTab
        project={project}
        language={language}
        isAdmin={isAdmin}
        onUpdateStep={onUpdateStep}
        onAutoApprove={onAutoApprove}
      />
    ),
    team: <TeamTab project={project} language={language} />,
    documents: <DocumentsTab project={project} language={language} />,
    history: <HistoryTab project={project} language={language} />,
  };

  const adminActions = isAdmin
    ? [
      project.status === "pending" && {
        label: language === "id" ? "Setujui" : "Approve",
        icon: <UserCheck className="w-4 h-4" />,
        color: "#22c55e",
        onClick: onApprove,
      },
      (project.status === "pending" ||
        project.status === "under_verification") && {
        label: language === "id" ? "Tolak" : "Reject",
        icon: <Ban className="w-4 h-4" />,
        color: "#ef4444",
        onClick: onReject,
      },
      project.status === "under_verification" &&
      !project.vvbAssigned && {
        label: "Assign VVB",
        icon: <Shield className="w-4 h-4" />,
        color: "#8b5cf6",
        onClick: onAssignVVB,
      },
      project.status === "under_verification" &&
      project.vvbAssigned && {
        label: language === "id" ? "Sertifikasi" : "Certify",
        icon: <Award className="w-4 h-4" />,
        color: "#f59e0b",
        onClick: onCertify,
      },
    ].filter(Boolean)
    : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl w-full flex flex-col overflow-hidden"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
            maxWidth: "680px",
            width: "100%",
            height: "92vh",
            maxHeight: "92vh",
          }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between p-5 flex-shrink-0"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
                >
                  {language === "id" ? s.label : s.labelEn}
                </span>
                {project.listedInMarketplace && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    {language === "id" ? "Di Marketplace" : "In Marketplace"}
                  </span>
                )}
                {isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                    {project.ownerCompany}
                  </span>
                )}
              </div>
              <h2
                className="text-xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                {project.title}
              </h2>
              <p
                className="text-xs mt-0.5 flex items-center gap-1"
                style={{ color: theme.textMuted }}
              >
                <MapPin className="w-3 h-3" />
                {project.location.province}, {project.location.regency}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isAdmin && onDelete && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        language === "id"
                          ? "Hapus proyek ini secara permanen?"
                          : "Permanently delete this project?",
                      )
                    ) {
                      onDelete();
                      onClose();
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                  title={language === "id" ? "Hapus Proyek" : "Delete Project"}
                >
                  <Trash2 className="w-5 h-5" style={{ color: "#ef4444" }} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
              </button>
            </div>
          </div>

          {/* Admin Actions */}
          {adminActions.length > 0 && (
            <div
              className="px-5 py-2.5 flex gap-2 flex-wrap flex-shrink-0 items-center"
              style={{
                borderBottom: `1px solid ${theme.border}`,
                backgroundColor: theme.bgDark,
              }}
            >
              <span className="text-xs mr-1" style={{ color: theme.textMuted }}>
                {language === "id" ? "Aksi Admin:" : "Admin Actions:"}
              </span>
              {(adminActions as any[]).map((a, i) => (
                <button
                  key={i}
                  onClick={a.onClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: `${a.color}20`,
                    color: a.color,
                    border: `1px solid ${a.color}40`,
                  }}
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div
            className="flex gap-1 px-5 py-2.5 flex-shrink-0 overflow-x-auto"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0"
                style={{
                  backgroundColor:
                    activeTab === t.id ? `${theme.primary}20` : "transparent",
                  color:
                    activeTab === t.id ? theme.primary : theme.textSecondary,
                  border: `1px solid ${activeTab === t.id ? theme.primary + "40" : "transparent"}`,
                }}
              >
                {t.icon}
                <span className="hidden sm:inline">
                  {language === "id" ? t.l : t.le}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto p-5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: `${theme.border} transparent`,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {content[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// APPROVE MODAL
// ============================================================================
interface AdminModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (v: string) => void;
  language: "id" | "en";
}

const DEFAULT_CHECKLIST = [
  {
    id: "doc",
    labelId: "Kelengkapan dokumen PDD & Baseline Study",
    labelEn: "PDD & Baseline Study documents complete",
    required: true,
    checked: false,
  },
  {
    id: "method",
    labelId: "Metodologi VWBA sesuai jenis aktivitas proyek",
    labelEn: "VWBA methodology matches project activity type",
    required: true,
    checked: false,
  },
  {
    id: "location",
    labelId: "Lokasi proyek valid dan dapat diverifikasi",
    labelEn: "Project location is valid and verifiable",
    required: true,
    checked: false,
  },
  {
    id: "addl",
    labelId: "Addisionalitas terbukti (bukan kewajiban hukum)",
    labelEn: "Additionality proven (not legally required)",
    required: true,
    checked: false,
  },
  {
    id: "company",
    labelId: "Perusahaan pemohon terverifikasi di platform",
    labelEn: "Applicant company is verified on platform",
    required: true,
    checked: false,
  },
  {
    id: "conflict",
    labelId: "Tidak ada konflik kepentingan komunitas lokal",
    labelEn: "No conflict with local community interests",
    required: false,
    checked: false,
  },
  {
    id: "tracking",
    labelId: "Rencana pelacakan & pelaporan VWB tersedia",
    labelEn: "VWB tracking & reporting plan available",
    required: false,
    checked: false,
  },
  {
    id: "tradeoff",
    labelId: "Kajian trade-off dan dampak lingkungan tersedia",
    labelEn: "Trade-off and environmental impact assessment done",
    required: false,
    checked: false,
  },
];

const ApproveModal: React.FC<AdminModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirm,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState(
    DEFAULT_CHECKLIST.map((c) => ({ ...c })),
  );
  const [editMode, setEditMode] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const toggleItem = (id: string) =>
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)),
    );
  const toggleRequired = (id: string) =>
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, required: !c.required } : c)),
    );
  const removeItem = (id: string) =>
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  const addItem = () => {
    if (!newItemText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      {
        id: `custom_${Date.now()}`,
        labelId: newItemText,
        labelEn: newItemText,
        required: false,
        checked: false,
      },
    ]);
    setNewItemText("");
  };
  const resetChecklist = () =>
    setChecklist(DEFAULT_CHECKLIST.map((c) => ({ ...c })));

  const requiredItems = checklist.filter((c) => c.required);
  const allRequiredDone = requiredItems.every((c) => c.checked);
  const doneCount = checklist.filter((c) => c.checked).length;
  const totalCount = checklist.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl w-full max-w-lg flex flex-col"
          style={{
            backgroundColor: theme.bgCard,
            border: "1px solid #22c55e40",
            maxHeight: "90vh",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 pt-5 pb-4 border-b flex-shrink-0"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#22c55e20" }}
              >
                <UserCheck className="w-5 h-5" style={{ color: "#22c55e" }} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: theme.textPrimary }}>
                  {language === "id" ? "Setujui Proyek" : "Approve Project"}
                </h3>
                <p
                  className="text-xs truncate max-w-[220px]"
                  style={{ color: "#22c55e" }}
                >
                  {project.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: editMode
                    ? `${theme.primary}20`
                    : theme.bgDark,
                  color: editMode ? theme.primary : theme.textMuted,
                  border: `1px solid ${editMode ? theme.primary + "40" : theme.border}`,
                }}
              >
                {editMode
                  ? language === "id"
                    ? "Selesai Edit"
                    : "Done Editing"
                  : language === "id"
                    ? "Atur Checklist"
                    : "Edit Checklist"}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" style={{ color: theme.textMuted }} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            {/* Progress bar */}
            <div
              className="p-3.5 rounded-xl"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: theme.textSecondary }}>
                  {language === "id"
                    ? "Progress Verifikasi"
                    : "Verification Progress"}
                </span>
                <span
                  className="font-bold"
                  style={{ color: allRequiredDone ? "#22c55e" : "#f59e0b" }}
                >
                  {doneCount}/{totalCount}{" "}
                  {language === "id" ? "selesai" : "done"}
                </span>
              </div>
              <div
                className="h-2 rounded-full"
                style={{ backgroundColor: theme.border }}
              >
                <motion.div
                  animate={{
                    width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
                  }}
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    background: allRequiredDone
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : "linear-gradient(90deg, #f59e0b, #d97706)",
                  }}
                />
              </div>
              {!allRequiredDone && (
                <p className="text-xs mt-2" style={{ color: "#f59e0b" }}>
                  ⚠{" "}
                  {language === "id"
                    ? `${requiredItems.filter((c) => !c.checked).length} item wajib belum dicentang`
                    : `${requiredItems.filter((c) => !c.checked).length} required item(s) unchecked`}
                </p>
              )}
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: theme.primary }}
                >
                  {language === "id"
                    ? "Checklist Verifikasi"
                    : "Verification Checklist"}
                </p>
                {editMode && (
                  <button
                    onClick={resetChecklist}
                    className="text-xs px-2 py-1 rounded"
                    style={{ color: "#ef4444", backgroundColor: "#ef444415" }}
                  >
                    {language === "id" ? "Reset" : "Reset"}
                  </button>
                )}
              </div>
              {checklist.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="flex items-start gap-3 p-3 rounded-xl transition-all"
                  style={{
                    backgroundColor: item.checked ? "#22c55e08" : theme.bgDark,
                    border: `1px solid ${item.checked ? "#22c55e30" : theme.border}`,
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => !editMode && toggleItem(item.id)}
                    className="mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: item.checked ? "#22c55e" : "transparent",
                      border: `2px solid ${item.checked ? "#22c55e" : theme.textMuted}`,
                      cursor: editMode ? "default" : "pointer",
                    }}
                  >
                    {item.checked && (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm"
                      style={{
                        color: item.checked
                          ? theme.textPrimary
                          : theme.textSecondary,
                      }}
                    >
                      {language === "id" ? item.labelId : item.labelEn}
                    </p>
                    {item.required && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block"
                        style={{
                          backgroundColor: "#ef444415",
                          color: "#ef4444",
                        }}
                      >
                        {language === "id" ? "Wajib" : "Required"}
                      </span>
                    )}
                  </div>
                  {/* Edit controls */}
                  {editMode && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleRequired(item.id)}
                        className="text-xs px-2 py-1 rounded transition-all"
                        style={{
                          backgroundColor: item.required
                            ? "#ef444415"
                            : "#22c55e15",
                          color: item.required ? "#ef4444" : "#22c55e",
                          border: `1px solid ${item.required ? "#ef444430" : "#22c55e30"}`,
                        }}
                      >
                        {item.required
                          ? language === "id"
                            ? "Opsional"
                            : "Optional"
                          : language === "id"
                            ? "Wajib"
                            : "Required"}
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded hover:bg-red-500/10"
                      >
                        <X
                          className="w-3.5 h-3.5"
                          style={{ color: "#ef4444" }}
                        />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Add new item (edit mode) */}
              {editMode && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                    placeholder={
                      language === "id"
                        ? "Tambah item checklist baru..."
                        : "Add new checklist item..."
                    }
                    className="flex-1 px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none"
                    style={{
                      backgroundColor: theme.bgDark,
                      border: `1px solid ${theme.border}`,
                    }}
                  />
                  <button
                    onClick={addItem}
                    className="px-3 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                    style={{
                      backgroundColor: `${theme.primary}20`,
                      color: theme.primary,
                      border: `1px solid ${theme.primary}40`,
                    }}
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label
                className="block mb-2 text-xs font-bold uppercase tracking-widest"
                style={{ color: theme.primary }}
              >
                {language === "id" ? "Catatan Persetujuan" : "Approval Notes"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={
                  language === "id"
                    ? "Tambahkan catatan untuk perusahaan (opsional)..."
                    : "Add notes for the company (optional)..."
                }
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none resize-none"
                style={{
                  backgroundColor: theme.bgDark,
                  border: `1px solid ${theme.border}`,
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t flex gap-3 flex-shrink-0"
            style={{ borderColor: theme.border }}
          >
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm"
              style={{
                backgroundColor: theme.bgDark,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              {language === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              onClick={() => {
                if (allRequiredDone) {
                  onConfirm(notes);
                  setNotes("");
                  setChecklist(DEFAULT_CHECKLIST.map((c) => ({ ...c })));
                }
              }}
              disabled={!allRequiredDone}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm transition-all"
              style={{
                backgroundColor: allRequiredDone ? "#22c55e" : "#374151",
                opacity: allRequiredDone ? 1 : 0.6,
                cursor: allRequiredDone ? "pointer" : "not-allowed",
              }}
            >
              <UserCheck className="w-4 h-4" />
              {allRequiredDone
                ? language === "id"
                  ? "Setujui Proyek"
                  : "Approve Project"
                : language === "id"
                  ? `${requiredItems.filter((c) => !c.checked).length} item belum selesai`
                  : `${requiredItems.filter((c) => !c.checked).length} item(s) remaining`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// REJECT MODAL
// ============================================================================
const RejectModal: React.FC<AdminModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirm,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const [reason, setReason] = useState("");
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl p-6 max-w-md w-full"
          style={{
            backgroundColor: theme.bgCard,
            border: "1px solid #ef444440",
          }}
        >
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#ef444420" }}
          >
            <Ban className="w-7 h-7" style={{ color: "#ef4444" }} />
          </div>
          <h3
            className="text-xl font-bold text-center mb-1"
            style={{ color: theme.textPrimary }}
          >
            {language === "id" ? "Tolak Proyek?" : "Reject Project?"}
          </h3>
          <p
            className="text-sm text-center mb-5"
            style={{ color: theme.textSecondary }}
          >
            <span className="font-semibold" style={{ color: "#ef4444" }}>
              {project.title}
            </span>
          </p>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={
              language === "id"
                ? "Alasan penolakan (wajib diisi)..."
                : "Rejection reason (required)..."
            }
            className="w-full px-4 py-3 rounded-lg text-white placeholder:text-gray-500 focus:outline-none resize-none mb-4"
            style={{
              backgroundColor: theme.bgDark,
              border: `1px solid ${theme.border}`,
            }}
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-semibold"
              style={{
                backgroundColor: theme.bgDark,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              {language === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              onClick={() => {
                if (reason.trim()) {
                  onConfirm(reason);
                  setReason("");
                }
              }}
              disabled={!reason.trim()}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "#ef4444" }}
            >
              <Ban className="w-4 h-4" />
              {language === "id" ? "Tolak" : "Reject"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// VVB ASSIGN MODAL
// ============================================================================
interface VVBAssignModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (d: { name: string; email: string; link: string }) => void;
  language: "id" | "en";
}

const VVBAssignModal: React.FC<VVBAssignModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirm,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const [form, setForm] = useState({ name: "", email: "", link: "" });
  if (!isOpen) return null;
  const inp =
    "w-full px-4 py-3 rounded-lg text-white placeholder:text-gray-500 focus:outline-none";
  const is = {
    backgroundColor: theme.bgDark,
    border: `1px solid ${theme.border}`,
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl p-6 max-w-md w-full"
          style={{
            backgroundColor: theme.bgCard,
            border: "1px solid #8b5cf640",
          }}
        >
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#8b5cf620" }}
          >
            <Shield className="w-7 h-7" style={{ color: "#8b5cf6" }} />
          </div>
          <h3
            className="text-xl font-bold text-center mb-1"
            style={{ color: theme.textPrimary }}
          >
            {language === "id"
              ? "Tugaskan VVB Verifikator"
              : "Assign VVB Verifier"}
          </h3>
          <p
            className="text-sm text-center mb-5"
            style={{ color: theme.textSecondary }}
          >
            {project.title}
          </p>
          <div className="space-y-3 mb-5">
            {[
              {
                k: "name",
                l:
                  language === "id"
                    ? "Nama Organisasi VVB"
                    : "VVB Organization Name",
                p:
                  language === "id"
                    ? "Contoh: Bureau Veritas"
                    : "Example: Bureau Veritas",
                t: "text",
              },
              {
                k: "email",
                l: language === "id" ? "Email Kontak VVB" : "VVB Contact Email",
                p: "vvb@example.com",
                t: "email",
              },
              {
                k: "link",
                l:
                  language === "id"
                    ? "Link Portal VVB (opsional)"
                    : "VVB Portal Link (optional)",
                p: "https://vvb-portal.com/...",
                t: "url",
              },
            ].map((f) => (
              <div key={f.k}>
                <label
                  className="block mb-1.5 text-sm font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {f.l}
                </label>
                <input
                  type={f.t}
                  required={f.k !== "link"}
                  value={(form as any)[f.k]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                  placeholder={f.p}
                  className={inp}
                  style={is}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-semibold"
              style={{
                backgroundColor: theme.bgDark,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              {language === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              onClick={() => {
                if (form.name && form.email) {
                  onConfirm(form);
                  setForm({ name: "", email: "", link: "" });
                }
              }}
              disabled={!form.name || !form.email}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "#8b5cf6" }}
            >
              <Shield className="w-4 h-4" />
              {language === "id" ? "Tugaskan VVB" : "Assign VVB"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// DELETE CONFIRM MODAL
// ============================================================================
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: "id" | "en";
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl p-6 max-w-sm w-full"
          style={{
            backgroundColor: theme.bgCard,
            border: "1px solid #ef444440",
          }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#ef444420" }}
          >
            <Trash2 className="w-8 h-8" style={{ color: "#ef4444" }} />
          </div>
          <h3
            className="text-xl font-bold text-center mb-2"
            style={{ color: theme.textPrimary }}
          >
            {language === "id" ? "Hapus Proyek?" : "Delete Project?"}
          </h3>
          <p
            className="text-center text-sm mb-4"
            style={{ color: theme.textSecondary }}
          >
            {language === "id"
              ? "Tindakan ini tidak dapat dibatalkan. Semua data proyek akan dihapus permanen."
              : "This action cannot be undone. All project data will be permanently deleted."}
          </p>
          <div
            className="p-3 rounded-xl mb-5 flex items-start gap-2"
            style={{
              backgroundColor: "#ef444415",
              border: "1px solid #ef444430",
            }}
          >
            <AlertCircle
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              style={{ color: "#ef4444" }}
            />
            <p className="text-xs" style={{ color: "#ef4444" }}>
              {language === "id"
                ? "Kredit yang terdaftar di marketplace juga akan ikut dihapus."
                : "Credits listed in the marketplace will also be removed."}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-semibold"
              style={{
                backgroundColor: theme.bgDark,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              {language === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: "#ef4444" }}
            >
              <Trash2 className="w-4 h-4" />
              {language === "id" ? "Hapus" : "Delete"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT  ← ini yang di-import di App.tsx
// ============================================================================
export const ProjectsPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const navigate = useNavigate();

  const {
    getProjectsByOwner,
    getAllProjects,
    addProject,
    deleteProject,
    getStatistics,
    approveProject,
    rejectProject,
    assignVVB,
    certifyProject,
    listInMarketplace,
    updateVerificationStep,
  } = useProjects();

  // ← NEW: untuk auto-add listing ke marketplace saat admin approve
  const { addListing, listings } = useMarketplace();

  useEffect(() => {
    if (user?.role === "user") navigate("/marketplace");
  }, [user, navigate]);

  const isAdmin = user?.role === "admin";
  const projects = isAdmin
    ? getAllProjects()
    : getProjectsByOwner(user?.email || "");
  const stats = getStatistics(isAdmin ? undefined : user?.email);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "community" | "corporate"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVVBModal, setShowVVBModal] = useState(false);

  // Agreement modal - PINDAHKAN KE SINI
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [pendingProjectData, setPendingProjectData] = useState<any>(null);

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.title.toLowerCase().includes(q) ||
      p.location.province.toLowerCase().includes(q) ||
      (isAdmin && p.ownerCompany.toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCategory =
      categoryFilter === "all" || (p as any).category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const handleUploadProject = (data: any) => {
    console.log("📤 Receiving project data from modal:", data);

    // Save data to pending state
    setPendingProjectData(data);

    // Close upload modal
    setShowAddModal(false);

    // Open agreement modal
    console.log("🔄 Opening agreement modal...");
    setShowAgreementModal(true);
  };

  const handleFinalSubmitProject = () => {
    if (!pendingProjectData) {
      console.error("❌ No pending project data!");
      return;
    }

    const data = pendingProjectData;
    console.log("📤 Submitting project data:", data);

    try {
      addProject({
        category: data.category || "community",
        title: data.title || "Untitled Project",
        description: data.description || "",
        projectType:
          data.projectType ||
          (data.category === "corporate"
            ? "water_quota_trading"
            : "conservation"),
        certificationStandard: data.certificationStandard || "Gold Standard",
        methodology: data.methodology || "Wetland & Mangrove Restoration",
        areaHectares: Number(data.areaHectares) || 0,
        ownerEmail: user?.email || "",
        ownerCompany: (user as any)?.company || user?.name || "",
        ownerRole: (user?.role as "admin" | "company") || "company",
        owner: user?.name || "",
        location: {
          province: data.province || "",
          regency: data.regency || "",
          district: "",
          village: "",
          coordinates: {
            lat: data.latitude ? parseFloat(data.latitude) : 0,
            lng: data.longitude ? parseFloat(data.longitude) : 0,
          },
        },
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(
          new Date().setFullYear(
            new Date().getFullYear() + (Number(data.duration) || 25),
          ),
        )
          .toISOString()
          .split("T")[0],
        creditingPeriodYears: Number(data.duration) || 25,
        status: "pending",
        progress: 0,
        waterData: {
          estimatedCredits:
            Number(data.estimatedCredits) ||
            (data.category === "corporate"
              ? data.corporateData?.surplusDeficit || 0
              : 0),
          verifiedCredits: 0,
          baselineConsumption: 0,
          projectConsumption: 0,
          leakageConsumption: 0,
          netReduction: 0,
          pricePerCredit:
            Number(data.pricePerCredit) ||
            (data.category === "corporate"
              ? data.corporateData?.pricePerM3 || 0
              : 0),
          creditsAvailable: 0,
        },
        ...(data.category === "corporate" && data.corporateData
          ? { corporateData: data.corporateData }
          : {}),
        currency: data.currency || "IDR",
        team: [],
        coverImage:
          data.coverImageUrl && data.coverImageUrl.trim()
            ? data.coverImageUrl.trim()
            : data.category === "corporate"
              ? "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800"
              : "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
        galleryImages: [],
        documents: [],
        verificationStatus: "pending",
        listedInMarketplace: false,
        sellerVerified: false,
      });

      console.log("✅ Project added successfully!");
      setShowAgreementModal(false);
      setPendingProjectData(null);

      // Navigate to MRV Dashboard after successful submission
      setTimeout(() => {
        navigate("/mrv");
      }, 300);
    } catch (error) {
      console.error("❌ Error adding project:", error);
      alert(
        language === "id"
          ? "Terjadi kesalahan saat menambahkan proyek. Silakan coba lagi."
          : "An error occurred while adding the project. Please try again.",
      );
    }
  };

  const statCards = [
    {
      icon: <FolderKanban className="w-5 h-5" />,
      label: language === "id" ? "Total Proyek" : "Total Projects",
      value: stats.totalProjects,
      color: theme.primary,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: language === "id" ? "Proyek Aktif" : "Active Projects",
      value: stats.activeProjects,
      color: theme.secondary,
    },
    {
      icon: <Leaf className="w-5 h-5" />,
      label: language === "id" ? "Total Kredit" : "Total Credits",
      value: `${(stats.totalCredits / 1000).toFixed(1)}K m³`,
      color: "#f59e0b",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: language === "id" ? "Tim Terlibat" : "Team Members",
      value: stats.teamMembers,
      color: "#8b5cf6",
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: language === "id" ? "Di Marketplace" : "In Marketplace",
      value: stats.marketplaceListings,
      color: "#10b981",
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      label: language === "id" ? "Pending Verifikasi" : "Pending Verification",
      value: stats.pendingVerifications,
      color: "#ef4444",
    },
  ];

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: theme.bgDark }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
            style={{
              backgroundColor: `${theme.primary}20`,
              border: `1px solid ${theme.primary}40`,
            }}
          >
            <FolderKanban
              className="w-4 h-4"
              style={{ color: theme.primary }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: theme.primary }}
            >
              {isAdmin
                ? language === "id"
                  ? "Admin — Semua Proyek"
                  : "Admin — All Projects"
                : language === "id"
                  ? "Manajemen Proyek"
                  : "Project Management"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className="text-3xl font-bold mb-1"
                style={{ color: theme.textPrimary }}
              >
                {language === "id"
                  ? "Proyek Water Credit"
                  : "Water Credit Projects"}
              </h1>
              <p style={{ color: theme.textSecondary }}>
                {isAdmin
                  ? language === "id"
                    ? "Kelola semua proyek & verifikasi dari semua perusahaan"
                    : "Manage all projects & verification from all companies"
                  : language === "id"
                    ? "Kelola dan pantau proyek water credit perusahaan Anda"
                    : "Manage and monitor your company's water credit projects"}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 shadow-lg flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              }}
            >
              <Plus className="w-5 h-5" />
              {language === "id" ? "Upload Proyek Baru" : "Upload New Project"}
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-xl p-6"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                {React.cloneElement(stat.icon, {
                  style: { color: stat.color },
                })}
              </div>
              <p
                className="text-2xl font-bold mb-1.5"
                style={{ color: theme.textPrimary }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: theme.textSecondary }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-1">
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none text-sm"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-5 py-3.5 rounded-xl text-white focus:outline-none appearance-none cursor-pointer text-sm min-w-[160px]"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <option value="all">
              {language === "id" ? "Semua Tipe" : "All Types"}
            </option>
            <option value="community">
              {language === "id" ? "Komunitas" : "Community"}
            </option>
            <option value="corporate">
              {language === "id" ? "Perusahaan" : "Corporate"}
            </option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-5 py-3.5 rounded-xl text-white focus:outline-none appearance-none cursor-pointer text-sm min-w-[180px]"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <option value="all">
              {language === "id" ? "Semua Status" : "All Status"}
            </option>
            {Object.entries(statusColors).map(([key, { label, labelEn }]) => (
              <option key={key} value={key}>
                {language === "id" ? label : labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* ── Projects Grid / Empty ── */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 rounded-2xl"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <FolderKanban
                className="w-10 h-10"
                style={{ color: theme.primary }}
              />
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: theme.textPrimary }}
            >
              {language === "id" ? "Belum Ada Proyek" : "No Projects Yet"}
            </h3>
            <p
              className="mb-6 max-w-md mx-auto"
              style={{ color: theme.textSecondary }}
            >
              {language === "id"
                ? "Mulai dengan mengupload proyek water credit pertama Anda."
                : "Start by uploading your first water credit project."}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              }}
            >
              <Plus className="w-5 h-5" />
              {language === "id"
                ? "Upload Proyek Pertama"
                : "Upload First Project"}
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx}
                language={language}
                isAdmin={isAdmin}
                onView={() => {
                  setSelectedProject(project);
                  setActiveTab("overview");
                  setShowDetailModal(true);
                }}
                onDelete={() => setShowDeleteConfirm(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <UploadProjectModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
        }}
        onSubmit={handleUploadProject}
        language={language}
      />

      {selectedProject && (
        <>
          <ProjectDetailModal
            project={selectedProject}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedProject(null);
            }}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            language={language}
            isAdmin={isAdmin}
            onApprove={() => setShowApproveModal(true)}
            onReject={() => setShowRejectModal(true)}
            onAssignVVB={() => setShowVVBModal(true)}
            onCertify={() => {
              if (
                window.confirm(
                  language === "id"
                    ? "Sertifikasi proyek ini?"
                    : "Certify this project?",
                )
              ) {
                certifyProject(selectedProject.id, user?.email || "");
                setShowDetailModal(false);
              }
            }}
            onUpdateStep={(stepId, status) => {
              updateVerificationStep(
                selectedProject.id,
                stepId,
                status,
                user?.email || "Admin",
              );
              // Refresh selectedProject so progress bar updates live
              const updated = getAllProjects().find(
                (p) => p.id === selectedProject.id,
              );
              if (updated) setSelectedProject(updated);
            }}
            onDelete={() => setShowDeleteConfirm(selectedProject.id)}
            onAutoApprove={() => {
              const proj = selectedProject;
              approveProject(
                proj.id,
                user?.email || "",
                "All verification steps completed",
              );
              certifyProject(proj.id, user?.email || "");
              const listingId = `ML-${Date.now()}`;
              listInMarketplace(proj.id, listingId);
              // Cek duplikat sebelum add listing
              const alreadyListed = listings.some(
                (l) => l.projectId === proj.id,
              );
              if (!alreadyListed) {
                const _isCorp1 = proj.category === "corporate";
                const _base1 = {
                  projectId: proj.id,
                  sellerId: proj.ownerEmail,
                  sellerName: proj.ownerCompany || proj.owner,
                  sellerType: "company" as const,
                  sellerVerified: true,
                  projectName: proj.title,
                  projectDescription: proj.description,
                  location: {
                    province: proj.location.province,
                    country: "Indonesia",
                    coordinates: proj.location.coordinates,
                  },
                  availableCredits: proj.waterData.estimatedCredits,
                  totalCredits: proj.waterData.estimatedCredits,
                  pricePerTon: toIDR(proj.waterData.pricePerCredit, proj.currency || "IDR"),
                  minimumPurchase: 10,
                  isVerified: true,
                  verificationDate: new Date().toISOString().split("T")[0],
                  verificationBody: proj.vvbAssigned || "HydrEx Platform",
                  serialNumberPrefix: `WC-${proj.id.slice(-6)}`,
                  coverImage: proj.coverImage,
                  galleryImages: proj.galleryImages ?? [],
                  documents: (proj.documents ?? []).map((d) => ({ name: d.name, url: d.url, type: d.type })),
                  featured: false,
                  promoted: false,
                };
                if (_isCorp1) {
                  addListing({
                    ..._base1,
                    listingCategory: "corporate",
                    projectType: (proj.projectType as any) || "water_quota_trading",
                    companyIndustry: proj.corporateData?.industry || "General",
                    companySize: proj.corporateData?.companySize || "medium",
                    tradingIntent: proj.corporateData?.tradingIntent || "sell",
                    currentWaterQuota: proj.corporateData?.currentWaterQuota || 0,
                    actualConsumption: proj.corporateData?.actualConsumption || 0,
                    surplusDeficit: proj.corporateData?.surplusDeficit || 0,
                    complianceStatus: proj.corporateData?.complianceStatus || "compliant",
                    lastAuditDate: proj.corporateData?.lastAuditDate,
                    quotaExpiryDate: proj.corporateData?.quotaExpiryDate,
                  });
                } else {
                  addListing({
                    ..._base1,
                    listingCategory: "community",
                    projectType: (proj.projectType as any) || "conservation",
                    certificationStandard: proj.certificationStandard as any,
                    methodology: proj.methodology || "",
                    vintageYear: new Date().getFullYear(),
                  });
                }
              }
              setShowDetailModal(false);
              setTimeout(() => {
                alert(
                  language === "id"
                    ? "🎉 Semua tahap selesai! Proyek otomatis terdaftar di Marketplace."
                    : "🎉 All stages complete! Project automatically listed in Marketplace.",
                );
              }, 300);
            }}
          />
          <ApproveModal
            project={selectedProject}
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            onConfirm={(notes) => {
              const proj = selectedProject;
              console.log("🚀 Admin approving project:", proj.id);

              // 1. Approve + certify di ProjectContext
              approveProject(proj.id, user?.email || "", notes);
              certifyProject(proj.id, user?.email || "");

              // 2. Tandai listed di ProjectContext
              const listingId = `ML-${Date.now()}`;
              listInMarketplace(proj.id, listingId);

              // 3. Buat WaterListing di MarketplaceContext (cek duplikat)
              const alreadyListedApprove = listings.some(
                (l) => l.projectId === proj.id,
              );
              if (!alreadyListedApprove) {
                const _isCorp2 = proj.category === "corporate";
                const _base2 = {
                  projectId: proj.id,
                  sellerId: proj.ownerEmail,
                  sellerName: proj.ownerCompany || proj.owner,
                  sellerType: "company" as const,
                  sellerVerified: true,
                  projectName: proj.title,
                  projectDescription: proj.description,
                  location: {
                    province: proj.location.province,
                    country: "Indonesia",
                    coordinates: proj.location.coordinates,
                  },
                  availableCredits: proj.waterData.estimatedCredits,
                  totalCredits: proj.waterData.estimatedCredits,
                  pricePerTon: toIDR(proj.waterData.pricePerCredit, proj.currency || "IDR"),
                  minimumPurchase: 10,
                  isVerified: true,
                  verificationDate: new Date().toISOString().split("T")[0],
                  verificationBody: proj.vvbAssigned || "HydrEx Platform",
                  serialNumberPrefix: `WC-${proj.id.slice(-6)}`,
                  coverImage: proj.coverImage,
                  galleryImages: proj.galleryImages ?? [],
                  documents: (proj.documents ?? []).map((d) => ({ name: d.name, url: d.url, type: d.type })),
                  featured: false,
                  promoted: false,
                };
                if (_isCorp2) {
                  addListing({
                    ..._base2,
                    listingCategory: "corporate",
                    projectType: (proj.projectType as any) || "water_quota_trading",
                    companyIndustry: proj.corporateData?.industry || "General",
                    companySize: proj.corporateData?.companySize || "medium",
                    tradingIntent: proj.corporateData?.tradingIntent || "sell",
                    currentWaterQuota: proj.corporateData?.currentWaterQuota || 0,
                    actualConsumption: proj.corporateData?.actualConsumption || 0,
                    surplusDeficit: proj.corporateData?.surplusDeficit || 0,
                    complianceStatus: proj.corporateData?.complianceStatus || "compliant",
                    lastAuditDate: proj.corporateData?.lastAuditDate,
                    quotaExpiryDate: proj.corporateData?.quotaExpiryDate,
                  });
                } else {
                  addListing({
                    ..._base2,
                    listingCategory: "community",
                    projectType: (proj.projectType as any) || "conservation",
                    certificationStandard: proj.certificationStandard as any,
                    methodology: proj.methodology || "",
                    vintageYear: new Date().getFullYear(),
                  });
                }
              }

              console.log(
                "✅ Project approved, certified & listed in marketplace!",
              );
              setShowApproveModal(false);
              setShowDetailModal(false);

              setTimeout(() => {
                alert(
                  language === "id"
                    ? "✅ Proyek berhasil disetujui dan otomatis tampil di Marketplace!"
                    : "✅ Project approved and automatically listed in Marketplace!",
                );
              }, 300);
            }}
            language={language}
          />
          <RejectModal
            project={selectedProject}
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onConfirm={(reason) => {
              rejectProject(selectedProject.id, user?.email || "", reason);
              setShowRejectModal(false);
            }}
            language={language}
          />
          <VVBAssignModal
            project={selectedProject}
            isOpen={showVVBModal}
            onClose={() => setShowVVBModal(false)}
            onConfirm={(d) => {
              assignVVB(selectedProject.id, d.name, d.email, d.link);
              setShowVVBModal(false);
            }}
            language={language}
          />
        </>
      )}

      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => {
          if (showDeleteConfirm) {
            deleteProject(showDeleteConfirm);
            setShowDeleteConfirm(null);
          }
        }}
        language={language}
      />

      {/* Agreement Modal - MOVED HERE dari dalam UploadProjectModal */}
      <AgreementModal
        isOpen={showAgreementModal}
        onClose={() => {
          setShowAgreementModal(false);
          setPendingProjectData(null);
        }}
        onAgree={handleFinalSubmitProject}
        language={language}
      />
    </div>
  );
};

export default ProjectsPage;
