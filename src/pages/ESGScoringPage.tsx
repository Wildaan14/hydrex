/**
 * ============================================================================
 * HYDREX WATER CREDIT — ESG SCORING PAGE (FULL REBUILD v5.0)
 * ============================================================================
 * Features:
 *  ✅ Per-project ESG cards with inline status badges (Eligible/Conditional/Not Eligible)
 *  ✅ Project detail drawer with full E/S/G breakdown
 *  ✅ Heatmap indicator view (red/yellow/green per indicator)
 *  ✅ Score trend history chart (per project)
 *  ✅ Gate check status panel
 *  ✅ Evidence completeness tracker
 *  ✅ Red flags / key risks display
 *  ✅ "Fill ESG Data" button linking to ESGFormModal
 *  ✅ ESG badge shows on project (for marketplace integration)
 *  ✅ Download ESG Sheet / Due Diligence Pack (PDF stub)
 *  ✅ Bilingual ID/EN
 *  ✅ Responsive layout
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Target,
  Calendar,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Shield,
  Globe,
  Droplets,
  Zap,
  Heart,
  Scale,
  FileText,
  Download,
  RefreshCw,
  Clock,
  Star,
  Plus,
  X,
  Leaf,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  MapPin,
  Activity,
  Recycle,
  GraduationCap,
  ExternalLink,
  Edit,
  Layers,
  Search, // ← ADDED
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useESG, ESGScoring, ESGIndicator } from "../context/ESGContext";
import { useProjects } from "../context/ProjectContext";
import { ESGFormModal } from "../components/ESGFormModal";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

// Semantic colors (same in both modes)
const semanticColors = {
  danger: "#ef4444",
  warning: "#f59e0b",
  success: "#22c55e",
  purple: "#a855f7",
};

const ESG_PILLAR_COLORS = {
  E: "#22c55e",
  S: "#3b82f6",
  G: "#a855f7",
};

// ============================================================================
// HELPERS
// ============================================================================
const getGradeColor = (grade: string) => {
  if (grade?.startsWith("A")) return "#22c55e";
  if (grade?.startsWith("B")) return "#3b82f6";
  if (grade?.startsWith("C")) return "#f59e0b";
  return "#ef4444";
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "eligible":
      return {
        label: "Eligible",
        labelId: "Layak",
        color: "#22c55e",
        bg: "#22c55e15",
        icon: CheckCircle,
      };
    case "conditional":
      return {
        label: "Conditional",
        labelId: "Bersyarat",
        color: "#f59e0b",
        bg: "#f59e0b15",
        icon: AlertTriangle,
      };
    case "not_eligible":
      return {
        label: "Not Eligible",
        labelId: "Tidak Layak",
        color: "#ef4444",
        bg: "#ef444415",
        icon: AlertCircle,
      };
    default:
      return {
        label: "Pending",
        labelId: "Menunggu",
        color: "#94a3b8",
        bg: "#94a3b815",
        icon: Clock,
      };
  }
};

const getRatingBand = (score: number, lang: string) => {
  if (score >= 80)
    return {
      band: "A",
      desc: lang === "id" ? "Siap dipasarkan luas" : "Ready for broad market",
    };
  if (score >= 65)
    return {
      band: "BBB",
      desc:
        lang === "id"
          ? "OK, ada perbaikan minor"
          : "Good, minor improvements needed",
    };
  if (score >= 50)
    return {
      band: "BB",
      desc:
        lang === "id"
          ? "Risiko sedang (buyer hati-hati)"
          : "Medium risk (buyer caution)",
    };
  return {
    band: "B",
    desc:
      lang === "id"
        ? "Risiko tinggi / tidak direkomendasikan"
        : "High risk / not recommended",
  };
};

const INDICATOR_ICONS: Record<string, React.ReactNode> = {
  E1: <Droplets className="w-4 h-4" />,
  E2: <BarChart3 className="w-4 h-4" />,
  E3: <Activity className="w-4 h-4" />,
  E4: <Shield className="w-4 h-4" />,
  E5: <Leaf className="w-4 h-4" />,
  E6: <Zap className="w-4 h-4" />,
  S1: <Users className="w-4 h-4" />,
  S2: <Globe className="w-4 h-4" />,
  S3: <Heart className="w-4 h-4" />,
  S4: <Shield className="w-4 h-4" />,
  S5: <Star className="w-4 h-4" />,
  G1: <FileText className="w-4 h-4" />,
  G2: <Building2 className="w-4 h-4" />,
  G3: <Scale className="w-4 h-4" />,
  G4: <Layers className="w-4 h-4" />,
  G5: <Target className="w-4 h-4" />,
  G6: <Clock className="w-4 h-4" />,
};

// ============================================================================
// MINI CHART — score trend sparkline (SVG)
// ============================================================================
const ScoreSparkline: React.FC<{
  history: ESGScoring["history"];
  color: string;
}> = ({ history, color }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  if (!history || history.length < 2)
    return (
      <div
        className="flex items-center gap-1 text-xs"
        style={{ color: theme.textMuted }}
      >
        <Minus className="w-3 h-3" />
        <span>No trend data</span>
      </div>
    );

  const scores = history.map((h) => h.overallScore);
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 100);
  const w = 80,
    h = 28;
  const xStep = w / (scores.length - 1);

  const pts = scores
    .map((s, i) => {
      const x = i * xStep;
      const y = h - ((s - min) / (max - min + 1)) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const last = history[history.length - 1].overallScore;
  const prev = history[history.length - 2].overallScore;
  const diff = last - prev;

  return (
    <div className="flex items-center gap-2">
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {scores.map((s, i) => (
          <circle
            key={i}
            cx={i * xStep}
            cy={h - ((s - min) / (max - min + 1)) * (h - 4) - 2}
            r="2"
            fill={color}
          />
        ))}
      </svg>
      <span
        className="text-xs font-medium"
        style={{
          color:
            diff > 0
              ? theme.success
              : diff < 0
                ? theme.danger
                : theme.textMuted,
        }}
      >
        {diff > 0 ? "+" : ""}
        {diff}
      </span>
    </div>
  );
};

// ============================================================================
// INDICATOR HEATMAP TILE
// ============================================================================
const IndicatorTile: React.FC<{ ind: ESGIndicator; onClick: () => void }> = ({
  ind,
  onClick,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const color = getScoreColor(ind.score);
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
      style={{
        backgroundColor: `${color}12`,
        border: `1px solid ${color}30`,
        minWidth: 64,
      }}
    >
      <div style={{ color }}>
        {INDICATOR_ICONS[ind.id] || <Activity className="w-4 h-4" />}
      </div>
      <div className="mt-1.5 text-sm font-bold" style={{ color }}>
        {ind.score}
      </div>
      <div
        className="text-xs mt-0.5 font-semibold"
        style={{ color: theme.textMuted }}
      >
        {ind.id}
      </div>
      <div
        className="mt-1 w-full h-1 rounded-full"
        style={{ backgroundColor: `${color}20` }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${ind.score}%`, backgroundColor: color }}
        />
      </div>
    </button>
  );
};

// ============================================================================
// GATE CHECK PANEL
// ============================================================================
const GateCheckPanel: React.FC<{
  gateChecks: ESGScoring["gateChecks"];
  language: string;
}> = ({ gateChecks, language }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const items = [
    {
      key: "hasBaseline",
      labelId: "Dokumen baseline ada",
      labelEn: "Baseline document available",
    },
    {
      key: "hasMRVPlan",
      labelId: "MRV Plan tersedia",
      labelEn: "MRV Plan available",
    },
    {
      key: "hasPermits",
      labelId: "Perizinan minimal ada",
      labelEn: "Minimum permits available",
    },
    {
      key: "hasGrievanceMechanism",
      labelId: "Mekanisme keluhan tersedia",
      labelEn: "Grievance mechanism available",
    },
    {
      key: "noMajorConflicts",
      labelId: "Tidak ada konflik sosial besar",
      labelEn: "No major social conflicts",
    },
  ];
  const passedCount = items.filter((i) => (gateChecks as any)[i.key]).length;
  const allPassed = passedCount === items.length;

  return (
    <div
      className="rounded-xl p-4 space-y-2.5"
      style={{
        backgroundColor: allPassed ? `${theme.success}08` : `${theme.danger}08`,
        border: `1px solid ${allPassed ? theme.success : theme.danger}20`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <p
          className="text-sm font-semibold"
          style={{ color: theme.textSecondary }}
        >
          {language === "id"
            ? "Gate Checks (Syarat Wajib)"
            : "Gate Checks (Mandatory Requirements)"}
        </p>
        <span
          className="text-xs font-bold"
          style={{ color: allPassed ? theme.success : theme.danger }}
        >
          {passedCount}/{items.length}
        </span>
      </div>
      {items.map((item) => {
        const passed = (gateChecks as any)[item.key];
        return (
          <div key={item.key} className="flex items-center gap-2.5">
            {passed ? (
              <CheckCircle
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: theme.success }}
              />
            ) : (
              <AlertCircle
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: theme.danger }}
              />
            )}
            <span
              className="text-xs"
              style={{ color: passed ? theme.textSecondary : theme.danger }}
            >
              {language === "id" ? item.labelId : item.labelEn}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// ESG PROJECT CARD
// ============================================================================
const ESGProjectCard: React.FC<{
  scoring: ESGScoring;
  language: string;
  onOpen: () => void;
  onEdit: () => void;
}> = ({ scoring, language, onOpen, onEdit }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const statusConfig = getStatusConfig(scoring.status);
  const StatusIcon = statusConfig.icon;
  const ratingBand = getRatingBand(scoring.overallScore, language);
  const gradeColor = getGradeColor(scoring.grade);
  const isCorporate = scoring.projectCategory === "corporate";
  const catColor = isCorporate ? "#8b5cf6" : "#10b981";
  const catLabel = isCorporate
    ? language === "id"
      ? "Corporate"
      : "Corporate"
    : language === "id"
      ? "Community"
      : "Community";
  const CatIcon = isCorporate ? Building2 : Leaf;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold truncate mb-1"
              style={{ color: theme.textPrimary }}
            >
              {scoring.projectTitle}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category badge */}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: `${catColor}18`, color: catColor }}
              >
                <CatIcon className="w-3 h-3" />
                {catLabel}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                }}
              >
                <StatusIcon className="w-3 h-3" />
                {language === "id" ? statusConfig.labelId : statusConfig.label}
              </span>
              <span className="text-xs" style={{ color: theme.textMuted }}>
                v{scoring.version}
              </span>
              {scoring.marketplaceVisibility && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${theme.primary}15`,
                    color: theme.primary,
                  }}
                >
                  <Globe className="w-2.5 h-2.5" />
                  Marketplace
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <div
              className="text-3xl font-black"
              style={{ color: getScoreColor(scoring.overallScore) }}
            >
              {scoring.overallScore}
            </div>
            <div
              className="text-xs px-2 py-0.5 rounded font-bold"
              style={{ backgroundColor: `${gradeColor}20`, color: gradeColor }}
            >
              {scoring.grade} · {ratingBand.band}
            </div>
          </div>
        </div>

        {/* Pillar Scores */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {
              label: "E",
              score: scoring.eScore,
              color: ESG_PILLAR_COLORS.E,
              desc: "50%",
            },
            {
              label: "S",
              score: scoring.sScore,
              color: ESG_PILLAR_COLORS.S,
              desc: "25%",
            },
            {
              label: "G",
              score: scoring.gScore,
              color: ESG_PILLAR_COLORS.G,
              desc: "25%",
            },
          ].map((p) => (
            <div
              key={p.label}
              className="text-center p-2.5 rounded-xl"
              style={{ backgroundColor: `${p.color}10` }}
            >
              <div className="text-xl font-bold" style={{ color: p.color }}>
                {p.score}
              </div>
              <div
                className="text-xs font-semibold mt-0.5"
                style={{ color: p.color }}
              >
                Pilar {p.label}
              </div>
              <div className="text-xs" style={{ color: theme.textMuted }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Score Bars */}
        <div className="space-y-1.5 mb-4">
          {[
            { label: "E", score: scoring.eScore, color: ESG_PILLAR_COLORS.E },
            { label: "S", score: scoring.sScore, color: ESG_PILLAR_COLORS.S },
            { label: "G", score: scoring.gScore, color: ESG_PILLAR_COLORS.G },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <span
                className="text-xs w-4"
                style={{ color: p.color, fontWeight: 700 }}
              >
                {p.label}
              </span>
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: theme.border }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.score}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              </div>
              <span
                className="text-xs w-6 text-right"
                style={{ color: p.color }}
              >
                {p.score}
              </span>
            </div>
          ))}
        </div>

        {/* Evidence & Trend Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <FileText
                className="w-3 h-3"
                style={{ color: theme.textMuted }}
              />
              <span className="text-xs" style={{ color: theme.textMuted }}>
                Evidence:{" "}
                <span
                  style={{
                    color:
                      scoring.evidenceCompleteness >= 80
                        ? theme.success
                        : scoring.evidenceCompleteness >= 50
                          ? theme.warning
                          : theme.danger,
                  }}
                >
                  {scoring.evidenceCompleteness}%
                </span>
              </span>
            </div>
          </div>
          <ScoreSparkline
            history={scoring.history}
            color={getScoreColor(scoring.overallScore)}
          />
        </div>

        {/* Red Flags */}
        {scoring.keyRedFlags.length > 0 && (
          <div
            className="mt-3 pt-3"
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            {scoring.keyRedFlags.slice(0, 2).map((flag, i) => (
              <div key={i} className="flex items-center gap-1.5 mt-1">
                <AlertTriangle
                  className="w-3 h-3 flex-shrink-0"
                  style={{ color: theme.danger }}
                />
                <span className="text-xs" style={{ color: theme.danger }}>
                  {flag}
                </span>
              </div>
            ))}
            {scoring.keyRedFlags.length > 2 && (
              <span
                className="text-xs mt-1 block"
                style={{ color: theme.textMuted }}
              >
                +{scoring.keyRedFlags.length - 2} more flags
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex" style={{ borderTop: `1px solid ${theme.border}` }}>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors hover:bg-white/5"
          style={{
            color: theme.primary,
            borderRight: `1px solid ${theme.border}`,
          }}
        >
          <Edit className="w-3.5 h-3.5" />
          {language === "id" ? "Edit Data ESG" : "Edit ESG Data"}
        </button>
        <button
          onClick={onOpen}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors hover:bg-white/5"
          style={{ color: theme.textSecondary }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
          {language === "id" ? "Detail" : "Details"}
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ESG DETAIL DRAWER
// ============================================================================
const ESGDetailDrawer: React.FC<{
  scoring: ESGScoring;
  language: string;
  onClose: () => void;
  onEdit: () => void;
}> = ({ scoring, language, onClose, onEdit }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const [activeTab, setActiveTab] = useState<
    "overview" | "heatmap" | "history" | "gates" | "risks"
  >("overview");
  const [selectedIndicator, setSelectedIndicator] =
    useState<ESGIndicator | null>(null);
  const statusConfig = getStatusConfig(scoring.status);
  const StatusIcon = statusConfig.icon;
  const ratingBand = getRatingBand(scoring.overallScore, language);

  const eIndicators = scoring.indicators.filter((i) => i.category === "E");
  const sIndicators = scoring.indicators.filter((i) => i.category === "S");
  const gIndicators = scoring.indicators.filter((i) => i.category === "G");

  const tabs = [
    { id: "overview", label: language === "id" ? "Ringkasan" : "Overview" },
    { id: "heatmap", label: language === "id" ? "Heatmap" : "Heatmap" },
    { id: "history", label: language === "id" ? "Riwayat" : "History" },
    { id: "gates", label: language === "id" ? "Gate Checks" : "Gate Checks" },
    { id: "risks", label: language === "id" ? "Risiko" : "Risks" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="w-full max-w-xl h-full flex flex-col overflow-hidden"
        style={{
          backgroundColor: theme.bgCard,
          borderLeft: `1px solid ${theme.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          className="p-5"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2
                className="font-bold text-lg truncate"
                style={{ color: theme.textPrimary }}
              >
                {scoring.projectTitle}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {/* Category badge */}
                {(() => {
                  const isCorp = scoring.projectCategory === "corporate";
                  const cc = isCorp ? "#8b5cf6" : "#10b981";
                  const cl = isCorp
                    ? language === "id"
                      ? "Corporate"
                      : "Corporate"
                    : language === "id"
                      ? "Community"
                      : "Community";
                  const CI = isCorp ? Building2 : Leaf;
                  return (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${cc}18`, color: cc }}
                    >
                      <CI className="w-3 h-3" />
                      {cl}
                    </span>
                  );
                })()}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.color,
                  }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {language === "id"
                    ? statusConfig.labelId
                    : statusConfig.label}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded font-bold"
                  style={{
                    backgroundColor: `${getGradeColor(scoring.grade)}20`,
                    color: getGradeColor(scoring.grade),
                  }}
                >
                  Grade {scoring.grade} · {ratingBand.band}
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>
                  v{scoring.version}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                title={language === "id" ? "Edit Data ESG" : "Edit ESG Data"}
              >
                <Edit className="w-4 h-4" style={{ color: theme.primary }} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
              >
                <X className="w-4 h-4" style={{ color: theme.textMuted }} />
              </button>
            </div>
          </div>
        </div>

        {/* Score Hero */}
        <div
          className="p-5 grid grid-cols-4 gap-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <div
            className="col-span-1 flex flex-col items-center justify-center p-3 rounded-2xl"
            style={{
              backgroundColor: `${getScoreColor(scoring.overallScore)}10`,
              border: `1px solid ${getScoreColor(scoring.overallScore)}20`,
            }}
          >
            <div
              className="text-4xl font-black"
              style={{ color: getScoreColor(scoring.overallScore) }}
            >
              {scoring.overallScore}
            </div>
            <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
              Overall
            </div>
          </div>
          {[
            { label: "E", score: scoring.eScore, color: ESG_PILLAR_COLORS.E },
            { label: "S", score: scoring.sScore, color: ESG_PILLAR_COLORS.S },
            { label: "G", score: scoring.gScore, color: ESG_PILLAR_COLORS.G },
          ].map((p) => (
            <div
              key={p.label}
              className="flex flex-col items-center justify-center p-3 rounded-xl"
              style={{ backgroundColor: `${p.color}10` }}
            >
              <div className="text-2xl font-bold" style={{ color: p.color }}>
                {p.score}
              </div>
              <div
                className="text-xs mt-0.5 font-semibold"
                style={{ color: p.color }}
              >
                {p.label}
              </div>
              <div
                className="w-full mt-1.5 h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: `${p.color}20` }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${p.score}%`, backgroundColor: p.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="flex gap-0 overflow-x-auto"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0"
              style={{
                color: activeTab === tab.id ? theme.primary : theme.textMuted,
                borderBottom: `2px solid ${activeTab === tab.id ? theme.primary : "transparent"}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {/* Rating Band */}
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: `${getScoreColor(scoring.overallScore)}10`,
                      border: `1px solid ${getScoreColor(scoring.overallScore)}20`,
                    }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: getScoreColor(scoring.overallScore) }}
                    >
                      {ratingBand.band} Rating Band
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: theme.textSecondary }}
                    >
                      {ratingBand.desc}
                    </p>
                    <p
                      className="text-xs mt-2"
                      style={{ color: theme.textMuted }}
                    >
                      {language === "id"
                        ? "Terakhir diperbarui"
                        : "Last updated"}
                      :{" "}
                      {new Date(scoring.updatedAt).toLocaleDateString(
                        language === "id" ? "id-ID" : "en-US",
                      )}
                      {scoring.lastReviewedBy &&
                        ` · Oleh ${scoring.lastReviewedBy}`}
                    </p>
                  </div>

                  {/* Evidence Completeness */}
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: theme.bgDark }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p
                        className="text-sm font-medium"
                        style={{ color: theme.textSecondary }}
                      >
                        Evidence Completeness
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: getScoreColor(scoring.evidenceCompleteness),
                        }}
                      >
                        {scoring.evidenceCompleteness}%
                      </p>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: theme.border }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scoring.evidenceCompleteness}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: getScoreColor(
                            scoring.evidenceCompleteness,
                          ),
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        {scoring.verifiedEvidence}/{scoring.totalEvidence}{" "}
                        {language === "id"
                          ? "dokumen terverifikasi"
                          : "documents verified"}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        {
                          scoring.indicators.filter(
                            (i) => i.status === "complete",
                          ).length
                        }
                        /{scoring.indicators.length}{" "}
                        {language === "id"
                          ? "indikator lengkap"
                          : "indicators complete"}
                      </span>
                    </div>
                  </div>

                  {/* Pillar Breakdown - E */}
                  {[
                    {
                      cat: "E",
                      label: "Environmental",
                      labelId: "Lingkungan (E)",
                      color: ESG_PILLAR_COLORS.E,
                      score: scoring.eScore,
                      indicators: eIndicators,
                      weight: "50%",
                    },
                    {
                      cat: "S",
                      label: "Social",
                      labelId: "Sosial (S)",
                      color: ESG_PILLAR_COLORS.S,
                      score: scoring.sScore,
                      indicators: sIndicators,
                      weight: "25%",
                    },
                    {
                      cat: "G",
                      label: "Governance",
                      labelId: "Tata Kelola (G)",
                      color: ESG_PILLAR_COLORS.G,
                      score: scoring.gScore,
                      indicators: gIndicators,
                      weight: "25%",
                    },
                  ].map((pillar) => (
                    <div
                      key={pillar.cat}
                      className="rounded-xl overflow-hidden"
                      style={{ border: `1px solid ${pillar.color}20` }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ backgroundColor: `${pillar.color}10` }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="text-lg font-black"
                            style={{ color: pillar.color }}
                          >
                            {pillar.score}
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: pillar.color }}
                            >
                              {language === "id"
                                ? pillar.labelId
                                : pillar.label}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: theme.textMuted }}
                            >
                              Bobot {pillar.weight}
                            </p>
                          </div>
                        </div>
                        <div
                          className="w-16 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: `${pillar.color}20` }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pillar.score}%`,
                              backgroundColor: pillar.color,
                            }}
                          />
                        </div>
                      </div>
                      <div className="px-4 py-2 space-y-2">
                        {pillar.indicators.map((ind) => (
                          <div key={ind.id} className="flex items-center gap-2">
                            <div
                              style={{ color: getScoreColor(ind.score) }}
                              className="flex-shrink-0"
                            >
                              {INDICATOR_ICONS[ind.id]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-xs truncate"
                                  style={{ color: theme.textSecondary }}
                                >
                                  {language === "id" ? ind.name : ind.nameEn}
                                </span>
                                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                                  <span
                                    className="text-xs font-bold"
                                    style={{ color: getScoreColor(ind.score) }}
                                  >
                                    {ind.score}
                                  </span>
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        ind.status === "complete"
                                          ? theme.success
                                          : ind.status === "incomplete"
                                            ? theme.warning
                                            : theme.danger,
                                    }}
                                  />
                                </div>
                              </div>
                              <div
                                className="mt-0.5 h-1 rounded-full overflow-hidden"
                                style={{ backgroundColor: theme.border }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${ind.score}%`,
                                    backgroundColor: getScoreColor(ind.score),
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* HEATMAP TAB */}
              {activeTab === "heatmap" && (
                <div className="space-y-5">
                  {[
                    {
                      cat: "E",
                      label:
                        language === "id"
                          ? "Environmental — Pilar E (50%)"
                          : "Environmental — Pillar E (50%)",
                      color: ESG_PILLAR_COLORS.E,
                      indicators: eIndicators,
                    },
                    {
                      cat: "S",
                      label:
                        language === "id"
                          ? "Social — Pilar S (25%)"
                          : "Social — Pillar S (25%)",
                      color: ESG_PILLAR_COLORS.S,
                      indicators: sIndicators,
                    },
                    {
                      cat: "G",
                      label:
                        language === "id"
                          ? "Governance — Pilar G (25%)"
                          : "Governance — Pillar G (25%)",
                      color: ESG_PILLAR_COLORS.G,
                      indicators: gIndicators,
                    },
                  ].map((pillar) => (
                    <div key={pillar.cat}>
                      <p
                        className="text-xs font-semibold mb-2"
                        style={{ color: pillar.color }}
                      >
                        {pillar.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pillar.indicators.map((ind) => (
                          <IndicatorTile
                            key={ind.id}
                            ind={ind}
                            onClick={() =>
                              setSelectedIndicator(
                                selectedIndicator?.id === ind.id ? null : ind,
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {selectedIndicator && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl"
                      style={{
                        backgroundColor: theme.bgDark,
                        border: `1px solid ${getScoreColor(selectedIndicator.score)}30`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              color: getScoreColor(selectedIndicator.score),
                            }}
                          >
                            {INDICATOR_ICONS[selectedIndicator.id]}
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: theme.textPrimary }}
                            >
                              {selectedIndicator.id} —{" "}
                              {language === "id"
                                ? selectedIndicator.name
                                : selectedIndicator.nameEn}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: theme.textMuted }}
                            >
                              {language === "id" ? "Bobot" : "Weight"}:{" "}
                              {selectedIndicator.weight}% · Status:{" "}
                              <span
                                style={{
                                  color:
                                    selectedIndicator.status === "complete"
                                      ? theme.success
                                      : selectedIndicator.status ===
                                          "incomplete"
                                        ? theme.warning
                                        : theme.danger,
                                }}
                              >
                                {selectedIndicator.status}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div
                          className="text-2xl font-black"
                          style={{
                            color: getScoreColor(selectedIndicator.score),
                          }}
                        >
                          {selectedIndicator.score}
                        </div>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden mt-2"
                        style={{ backgroundColor: theme.border }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${selectedIndicator.score}%`,
                            backgroundColor: getScoreColor(
                              selectedIndicator.score,
                            ),
                          }}
                        />
                      </div>
                      <p
                        className="text-xs mt-2"
                        style={{ color: theme.textMuted }}
                      >
                        {language === "id"
                          ? "Terakhir diperbarui"
                          : "Last updated"}
                        :{" "}
                        {new Date(
                          selectedIndicator.lastUpdated,
                        ).toLocaleDateString()}
                      </p>
                    </motion.div>
                  )}
                  {/* Legend */}
                  <div className="flex items-center gap-4 pt-2">
                    {[
                      { color: theme.success, label: "≥80 (Baik)" },
                      { color: theme.primary, label: "65–79 (OK)" },
                      { color: theme.warning, label: "50–64 (Risiko)" },
                      { color: theme.danger, label: "<50 (Kritis)" },
                    ].map((l) => (
                      <div key={l.color} className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: l.color }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: theme.textMuted }}
                        >
                          {l.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HISTORY TAB */}
              {activeTab === "history" && (
                <div className="space-y-3">
                  {scoring.history.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: theme.textMuted }}
                      />
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        {language === "id"
                          ? "Belum ada riwayat perubahan skor"
                          : "No score change history yet"}
                      </p>
                    </div>
                  ) : (
                    scoring.history
                      .slice()
                      .reverse()
                      .map((h, i) => (
                        <div
                          key={h.id}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: theme.bgDark }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p
                                className="text-xs"
                                style={{ color: theme.textMuted }}
                              >
                                {new Date(h.date).toLocaleDateString(
                                  language === "id" ? "id-ID" : "en-US",
                                )}
                              </p>
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: theme.textMuted }}
                              >
                                {language === "id" ? "Oleh" : "By"}:{" "}
                                {h.changedBy}
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className="text-xl font-bold"
                                style={{ color: getScoreColor(h.overallScore) }}
                              >
                                {h.overallScore}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: getGradeColor(h.grade) }}
                              >
                                {h.grade}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mb-2">
                            {[
                              {
                                label: "E",
                                score: h.eScore,
                                color: ESG_PILLAR_COLORS.E,
                              },
                              {
                                label: "S",
                                score: h.sScore,
                                color: ESG_PILLAR_COLORS.S,
                              },
                              {
                                label: "G",
                                score: h.gScore,
                                color: ESG_PILLAR_COLORS.G,
                              },
                            ].map((p) => (
                              <span
                                key={p.label}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${p.color}15`,
                                  color: p.color,
                                }}
                              >
                                {p.label}:{p.score}
                              </span>
                            ))}
                          </div>
                          {h.reason && (
                            <p
                              className="text-xs italic"
                              style={{ color: theme.textMuted }}
                            >
                              {h.reason}
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* GATE CHECKS TAB */}
              {activeTab === "gates" && (
                <div className="space-y-4">
                  <GateCheckPanel
                    gateChecks={scoring.gateChecks}
                    language={language}
                  />
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: theme.bgDark }}
                  >
                    <p
                      className="text-sm font-semibold mb-3"
                      style={{ color: theme.textSecondary }}
                    >
                      {language === "id"
                        ? "Tentang Gate Checks"
                        : "About Gate Checks"}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: theme.textMuted }}
                    >
                      {language === "id"
                        ? "Gate checks adalah syarat wajib minimum sebelum skor ESG dihitung. Jika salah satu gate gagal, proyek akan berstatus Not Eligible terlepas dari skor numerik yang tinggi sekalipun. Lengkapi data ESG untuk memenuhi semua gate."
                        : "Gate checks are mandatory minimum requirements before ESG scores are calculated. If any gate fails, the project will be Not Eligible regardless of numerical score. Complete ESG data to satisfy all gates."}
                    </p>
                  </div>
                </div>
              )}

              {/* RISKS TAB */}
              {activeTab === "risks" && (
                <div className="space-y-3">
                  {scoring.keyRedFlags.length === 0 &&
                  scoring.risks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle
                        className="w-8 h-8 mx-auto mb-2"
                        style={{ color: theme.success }}
                      />
                      <p className="text-sm" style={{ color: theme.success }}>
                        {language === "id"
                          ? "Tidak ada red flags yang terdeteksi"
                          : "No red flags detected"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {scoring.keyRedFlags.map((flag, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl"
                          style={{
                            backgroundColor: `${theme.danger}10`,
                            border: `1px solid ${theme.danger}20`,
                          }}
                        >
                          <AlertTriangle
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: theme.danger }}
                          />
                          <p
                            className="text-sm"
                            style={{ color: theme.danger }}
                          >
                            {flag}
                          </p>
                        </div>
                      ))}
                      {scoring.risks.map((risk) => (
                        <div
                          key={risk.id}
                          className="p-4 rounded-xl"
                          style={{
                            backgroundColor: theme.bgDark,
                            border: `1px solid ${risk.level === "critical" ? theme.danger : risk.level === "high" ? theme.warning : theme.border}`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p
                              className="text-sm font-medium"
                              style={{ color: theme.textPrimary }}
                            >
                              {language === "id" ? risk.title : risk.titleEn}
                            </p>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  risk.level === "critical"
                                    ? `${theme.danger}20`
                                    : risk.level === "high"
                                      ? `${theme.warning}20`
                                      : `${theme.primary}20`,
                                color:
                                  risk.level === "critical"
                                    ? theme.danger
                                    : risk.level === "high"
                                      ? theme.warning
                                      : theme.primary,
                              }}
                            >
                              {risk.level}
                            </span>
                          </div>
                          <p
                            className="text-xs"
                            style={{ color: theme.textMuted }}
                          >
                            {language === "id"
                              ? risk.description
                              : risk.descriptionEn}
                          </p>
                          {risk.mitigation && (
                            <p
                              className="text-xs mt-2 italic"
                              style={{ color: theme.success }}
                            >
                              {language === "id" ? "Mitigasi" : "Mitigation"}:{" "}
                              {language === "id"
                                ? risk.mitigation
                                : risk.mitigationEn}
                            </p>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Drawer Footer Actions */}
        <div
          className="p-4 flex gap-2"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: `${theme.primary}15`,
              color: theme.primary,
            }}
            onClick={() => {
              const text = `ESG REPORT — ${scoring.projectTitle}\nGrade: ${scoring.grade} | Score: ${scoring.overallScore} | Status: ${scoring.status}\nE: ${scoring.eScore} | S: ${scoring.sScore} | G: ${scoring.gScore}\nEvidence: ${scoring.evidenceCompleteness}%\n\nGenerated by Hydrex Water Credit Platform`;
              const blob = new Blob([text], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `ESG-${scoring.projectTitle.replace(/\s/g, "_")}.txt`;
              a.click();
            }}
          >
            <Download className="w-3.5 h-3.5" />
            {language === "id" ? "Download ESG Sheet" : "Download ESG Sheet"}
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: `${theme.success}15`,
              color: theme.success,
            }}
            onClick={onEdit}
          >
            <Edit className="w-3.5 h-3.5" />
            {language === "id" ? "Edit Data" : "Edit Data"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// EMPTY STATE — project without ESG
// ============================================================================
const NoESGCard: React.FC<{
  project: {
    id: string;
    title: string;
    type?: string;
    location?: string;
    category?: "community" | "corporate";
  };
  language: string;
  onStart: () => void;
}> = ({ project, language, onStart }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const isCorporate = project.category === "corporate";
  const catColor = isCorporate ? "#8b5cf6" : "#10b981";
  const catLabel = isCorporate
    ? language === "id"
      ? "Corporate"
      : "Corporate"
    : language === "id"
      ? "Community"
      : "Community";
  const CatIcon = isCorporate ? Building2 : Leaf;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col items-center text-center"
      style={{
        backgroundColor: theme.bgCard,
        border: `2px dashed ${theme.border}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${theme.primary}15` }}
      >
        <Layers className="w-5 h-5" style={{ color: theme.primary }} />
      </div>
      {/* Category badge */}
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-2"
        style={{ backgroundColor: `${catColor}18`, color: catColor }}
      >
        <CatIcon className="w-3 h-3" />
        {catLabel}
      </span>
      <p
        className="font-semibold text-sm mb-1"
        style={{ color: theme.textPrimary }}
      >
        {project.title}
      </p>
      <p className="text-xs mb-4" style={{ color: theme.textMuted }}>
        {language === "id"
          ? "Belum ada data ESG. Isi form ESG untuk mendapatkan skor dan status kelayakan proyek ini."
          : "No ESG data yet. Fill the ESG form to get the score and eligibility status for this project."}
      </p>
      <button
        onClick={onStart}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
        }}
      >
        <Plus className="w-3.5 h-3.5" />
        {language === "id" ? "Mulai Input Data ESG" : "Start ESG Data Entry"}
      </button>
    </div>
  );
};

// ============================================================================
// STATS OVERVIEW BAR
// ============================================================================
const StatsBar: React.FC<{ scorings: ESGScoring[]; language: string }> = ({
  scorings,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const eligible = scorings.filter((s) => s.status === "eligible").length;
  const conditional = scorings.filter((s) => s.status === "conditional").length;
  const notEligible = scorings.filter(
    (s) => s.status === "not_eligible",
  ).length;
  const pending = scorings.filter((s) => s.status === "pending").length;
  const avgScore =
    scorings.length > 0
      ? Math.round(
          scorings.reduce((a, s) => a + s.overallScore, 0) / scorings.length,
        )
      : 0;

  const stats = [
    {
      label: language === "id" ? "Total Proyek ESG" : "Total ESG Projects",
      value: scorings.length,
      color: theme.primary,
      icon: Layers,
    },
    {
      label: language === "id" ? "Eligible" : "Eligible",
      value: eligible,
      color: theme.success,
      icon: CheckCircle,
    },
    {
      label: language === "id" ? "Bersyarat" : "Conditional",
      value: conditional,
      color: theme.warning,
      icon: AlertTriangle,
    },
    {
      label: language === "id" ? "Tidak Layak" : "Not Eligible",
      value: notEligible,
      color: theme.danger,
      icon: AlertCircle,
    },
    {
      label: language === "id" ? "Rata-rata Skor" : "Avg. Score",
      value: avgScore,
      color: theme.purple,
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="p-4 rounded-2xl"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              <span className="text-xs" style={{ color: theme.textMuted }}>
                {s.label}
              </span>
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// MAIN PAGE
// ============================================================================
const ESGScoringPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const {
    esgScorings,
    getESGScoringByProject,
    notifyMarketplace,
    recalculateAllScores,
  } = useESG();
  const { projects } = useProjects();

  const [filter, setFilter] = useState<
    "all" | "eligible" | "conditional" | "not_eligible" | "pending"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "community" | "corporate"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScoring, setSelectedScoring] = useState<ESGScoring | null>(
    null,
  );
  const [showFormModal, setShowFormModal] = useState(false);
  const [formProject, setFormProject] = useState<{
    id: string;
    title: string;
    type?: string;
    location?: string;
    category?: "community" | "corporate";
  } | null>(null);

  // Helper: convert Project.location object → display string
  const locationToString = (loc: any): string => {
    if (!loc) return "";
    if (typeof loc === "string") return loc;
    const parts = [loc.village, loc.district, loc.regency, loc.province].filter(
      Boolean,
    );
    return parts.join(", ");
  };
  const [showFramework, setShowFramework] = useState(false);

  // Projects that either have ESG or are approved/certified
  const relevantProjects = projects.filter((p) =>
    ["approved", "under_verification", "verified", "certified"].includes(
      p.status,
    ),
  );
  const projectsWithoutESG = relevantProjects.filter(
    (p) => !getESGScoringByProject(p.id),
  );

  // Filtered scorings
  const filteredScorings = esgScorings.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (categoryFilter !== "all" && s.projectCategory !== categoryFilter)
      return false;
    if (
      searchQuery &&
      !s.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleOpenForm = (proj: {
    id: string;
    title: string;
    type?: string;
    location?: string;
    category?: "community" | "corporate";
  }) => {
    setFormProject(proj);
    setShowFormModal(true);
  };

  // Accepts a Project object (location is object, type is union) → normalizes to string
  const handleOpenFormFromProject = (p: {
    id: string;
    title: string;
    type?: any;
    location?: any;
    category?: any;
  }) => {
    handleOpenForm({
      id: p.id,
      title: p.title,
      type: p.type ? String(p.type) : undefined,
      location: locationToString(p.location),
      category: p.category === "corporate" ? "corporate" : "community",
    });
  };

  const handleFormSuccess = (esgId: string) => {
    setShowFormModal(false);
    setFormProject(null);
    // Auto-notify marketplace if eligible
    const scoring = esgScorings.find((s) => s.id === esgId);
    if (scoring?.status === "eligible") {
      notifyMarketplace(esgId);
    }
  };

  const filterButtons = [
    { key: "all", label: language === "id" ? "Semua" : "All" },
    { key: "eligible", label: language === "id" ? "Eligible" : "Eligible" },
    {
      key: "conditional",
      label: language === "id" ? "Bersyarat" : "Conditional",
    },
    {
      key: "not_eligible",
      label: language === "id" ? "Tidak Layak" : "Not Eligible",
    },
    { key: "pending", label: language === "id" ? "Menunggu" : "Pending" },
  ];

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: theme.bgDark }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: theme.textPrimary }}
          >
            ESG Scoring
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            {language === "id"
              ? "Penilaian kelayakan proyek berdasarkan pilar Environmental, Social & Governance"
              : "Project eligibility assessment based on Environmental, Social & Governance pillars"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFramework(!showFramework)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{
              backgroundColor: `${theme.purple}15`,
              color: theme.purple,
            }}
          >
            <Info className="w-3.5 h-3.5" />
            {language === "id" ? "Framework" : "Framework"}
          </button>
          <button
            onClick={recalculateAllScores}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{
              backgroundColor: `${theme.primary}15`,
              color: theme.primary,
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {language === "id" ? "Recalculate" : "Recalculate"}
          </button>
        </div>
      </div>

      {/* Framework Info (collapsible) */}
      <AnimatePresence>
        {showFramework && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div
              className="p-5 rounded-2xl"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {language === "id"
                    ? "Framework & Metodologi"
                    : "Framework & Methodology"}
                </h3>
                <button onClick={() => setShowFramework(false)}>
                  <X className="w-4 h-4" style={{ color: theme.textMuted }} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {[
                  {
                    label:
                      language === "id"
                        ? "Bobot E (Environmental)"
                        : "E Weight (Environmental)",
                    value: "50%",
                    color: ESG_PILLAR_COLORS.E,
                  },
                  {
                    label:
                      language === "id"
                        ? "Bobot S (Social)"
                        : "S Weight (Social)",
                    value: "25%",
                    color: ESG_PILLAR_COLORS.S,
                  },
                  {
                    label:
                      language === "id"
                        ? "Bobot G (Governance)"
                        : "G Weight (Governance)",
                    value: "25%",
                    color: ESG_PILLAR_COLORS.G,
                  },
                ].map((w) => (
                  <div
                    key={w.label}
                    className="p-3 rounded-xl text-center"
                    style={{ backgroundColor: `${w.color}10` }}
                  >
                    <p
                      className="text-2xl font-black"
                      style={{ color: w.color }}
                    >
                      {w.value}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: theme.textMuted }}
                    >
                      {w.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  {
                    band: "A (80–100)",
                    desc:
                      language === "id"
                        ? "Siap dipasarkan luas"
                        : "Ready for broad market",
                    color: theme.success,
                  },
                  {
                    band: "BBB (65–79)",
                    desc:
                      language === "id"
                        ? "OK, ada perbaikan minor"
                        : "Good, minor improvements needed",
                    color: theme.primary,
                  },
                  {
                    band: "BB (50–64)",
                    desc:
                      language === "id"
                        ? "Risiko sedang (buyer hati-hati)"
                        : "Medium risk (buyer caution)",
                    color: theme.warning,
                  },
                  {
                    band: "B (<50)",
                    desc:
                      language === "id"
                        ? "Risiko tinggi / tidak direkomendasikan"
                        : "High risk / not recommended",
                    color: theme.danger,
                  },
                ].map((r) => (
                  <div key={r.band} className="flex items-center gap-3">
                    <span
                      className="font-bold text-sm w-28 flex-shrink-0"
                      style={{ color: r.color }}
                    >
                      {r.band}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      {r.desc}
                    </span>
                  </div>
                ))}
              </div>
              <p
                className="text-xs mt-4 pt-3"
                style={{
                  color: theme.textMuted,
                  borderTop: `1px solid ${theme.border}`,
                }}
              >
                {language === "id"
                  ? "Selaras dengan: GRI 303 (Water), ISO 14046, TCFD/ISSB IFRS S1-S2, Alliance for Water Stewardship (AWS), IFC Performance Standards"
                  : "Aligned with: GRI 303 (Water), ISO 14046, TCFD/ISSB IFRS S1-S2, Alliance for Water Stewardship (AWS), IFC Performance Standards"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      <div className="mb-6">
        <StatsBar scorings={esgScorings} language={language} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={
              language === "id" ? "Cari proyek..." : "Search projects..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm pl-9 outline-none"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              color: theme.textPrimary,
            }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {/* Category filter */}
          {[
            {
              key: "all",
              label: language === "id" ? "Semua Kategori" : "All Categories",
              color: theme.textMuted,
            },
            { key: "community", label: "Community", color: "#10b981" },
            { key: "corporate", label: "Corporate", color: "#8b5cf6" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setCategoryFilter(btn.key as any)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  categoryFilter === btn.key ? `${btn.color}20` : theme.bgCard,
                border: `1px solid ${categoryFilter === btn.key ? btn.color : theme.border}`,
                color: categoryFilter === btn.key ? btn.color : theme.textMuted,
              }}
            >
              {btn.label}
            </button>
          ))}
          <div
            style={{ width: 1, backgroundColor: theme.border, margin: "0 2px" }}
          />
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key as any)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  filter === btn.key ? `${theme.primary}20` : theme.bgCard,
                border: `1px solid ${filter === btn.key ? theme.primary : theme.border}`,
                color: filter === btn.key ? theme.primary : theme.textMuted,
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Without ESG */}
      {projectsWithoutESG.length > 0 && (
        <div className="mb-6">
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: theme.warning }}
          >
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
            {language === "id"
              ? `${projectsWithoutESG.length} proyek aktif belum memiliki data ESG`
              : `${projectsWithoutESG.length} active project(s) missing ESG data`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsWithoutESG.map((p) => (
              <NoESGCard
                key={p.id}
                project={{
                  id: p.id,
                  title: p.title,
                  type: p.projectType ? String(p.projectType) : undefined,
                  location: locationToString(p.location),
                  category:
                    (p as any).category === "corporate"
                      ? "corporate"
                      : "community",
                }}
                language={language}
                onStart={() => handleOpenFormFromProject(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ESG Scored Projects */}
      {filteredScorings.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: theme.textMuted }}
          />
          <p
            className="text-base font-semibold mb-1"
            style={{ color: theme.textSecondary }}
          >
            {language === "id"
              ? "Belum ada penilaian ESG"
              : "No ESG assessments yet"}
          </p>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {language === "id"
              ? "Proyek yang sudah diinput dan disetujui akan muncul di sini setelah data ESG diisi."
              : "Approved projects will appear here after ESG data is filled in."}
          </p>
        </div>
      ) : (
        <>
          {filteredScorings.length > 0 && (
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: theme.textSecondary }}
            >
              {language === "id"
                ? `${filteredScorings.length} penilaian ESG`
                : `${filteredScorings.length} ESG assessments`}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScorings.map((scoring) => (
              <ESGProjectCard
                key={scoring.id}
                scoring={scoring}
                language={language}
                onOpen={() => setSelectedScoring(scoring)}
                onEdit={() =>
                  handleOpenForm({
                    id: scoring.projectId,
                    title: scoring.projectTitle,
                  })
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedScoring && (
          <ESGDetailDrawer
            scoring={selectedScoring}
            language={language}
            onClose={() => setSelectedScoring(null)}
            onEdit={() => {
              handleOpenForm({
                id: selectedScoring.projectId,
                title: selectedScoring.projectTitle,
              });
              setSelectedScoring(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ESG Form Modal */}
      <AnimatePresence>
        {showFormModal && formProject && (
          <ESGFormModal
            projectId={formProject.id}
            projectTitle={formProject.title}
            projectType={formProject.type}
            location={formProject.location}
            onClose={() => {
              setShowFormModal(false);
              setFormProject(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ESGScoringPage;
