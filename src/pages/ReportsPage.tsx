import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Download,
  Eye,
  Trash2,
  Filter,
  Calendar,
  Leaf,
  Award,
  FileSpreadsheet,
  FileBadge,
  Clock,
  CheckCircle,
  X,
  FileCheck,
  AlertCircle,
  Building2,
  Target,
  TrendingUp,
  BarChart3,
  Factory,
  Users,
  ArrowRightLeft,
  Droplets,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

// ── Types ────────────────────────────────────────────────────────────────────

interface Report {
  id: string;
  projectName: string;
  projectType: string;
  reportType: "emission" | "certificate" | "esg" | "mrv" | "audit";
  description: string;
  date: string;
  size: string;
  status: "ready" | "generating" | "failed";
  period?: string;
  generatedBy: string;
  location: string;
  credits?: number;
  // Extended — disesuaikan dengan ProjectsPage
  projectStatus?:
    | "draft"
    | "pending"
    | "under_verification"
    | "verified"
    | "rejected"
    | "running"
    | "completed";
  category?: "community" | "corporate";
  industry?: string;
  surplusDeficit?: number;
  tradingIntent?: "sell" | "buy";
}

// ── Report type config (original, tidak diubah) ───────────────────────────────

const reportTypeConfig: Record<
  string,
  {
    bg: string;
    text: string;
    icon: React.ReactNode;
    label: string;
    labelEn: string;
  }
> = {
  emission: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    icon: <Leaf className="w-4 h-4" />,
    label: "Konsumsi",
    labelEn: "Emission",
  },
  certificate: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    icon: <FileBadge className="w-4 h-4" />,
    label: "Sertifikat",
    labelEn: "Certificate",
  },
  esg: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    icon: <Award className="w-4 h-4" />,
    label: "ESG",
    labelEn: "ESG",
  },
  mrv: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    icon: <FileCheck className="w-4 h-4" />,
    label: "MRV",
    labelEn: "MRV",
  },
  audit: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    icon: <FileSpreadsheet className="w-4 h-4" />,
    label: "Audit",
    labelEn: "Audit",
  },
};

// ── Project status config — sama persis dengan ProjectsPage statusColors ─────

const projectStatusConfig: Record<
  string,
  { bg: string; text: string; border: string; label: string; labelEn: string }
> = {
  draft: {
    bg: "rgba(107,114,128,0.1)",
    text: "#9ca3af",
    border: "rgba(107,114,128,0.2)",
    label: "Draft",
    labelEn: "Draft",
  },
  pending: {
    bg: "rgba(251,191,36,0.1)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.2)",
    label: "Menunggu Review",
    labelEn: "Pending Review",
  },
  under_verification: {
    bg: "rgba(59,130,246,0.1)",
    text: "#60a5fa",
    border: "rgba(59,130,246,0.2)",
    label: "Dalam Verifikasi",
    labelEn: "Under Verification",
  },
  verified: {
    bg: "rgba(34,197,94,0.1)",
    text: "#4ade80",
    border: "rgba(34,197,94,0.2)",
    label: "Terverifikasi",
    labelEn: "Verified",
  },
  rejected: {
    bg: "rgba(239,68,68,0.1)",
    text: "#f87171",
    border: "rgba(239,68,68,0.2)",
    label: "Ditolak",
    labelEn: "Rejected",
  },
  running: {
    bg: "rgba(6,182,212,0.1)",
    text: "#22d3ee",
    border: "rgba(6,182,212,0.2)",
    label: "Berjalan",
    labelEn: "Running",
  },
  completed: {
    bg: "rgba(168,85,247,0.1)",
    text: "#c084fc",
    border: "rgba(168,85,247,0.2)",
    label: "Selesai",
    labelEn: "Completed",
  },
};

// ── Main Component ────────────────────────────────────────────────────────────

export const ReportsPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const { getAllProjects, getProjectsByOwner } = useProjects();
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<
    "all" | "community" | "corporate"
  >("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const isAdmin = user?.role === "admin";

  // ── Build reports — SEMUA project (semua 7 status), sesuai dengan ProjectsPage ──
  const reports = useMemo<Report[]>(() => {
    const allProjects = isAdmin
      ? getAllProjects()
      : getProjectsByOwner(user?.email || "");

    const projectReports: Report[] = allProjects.flatMap((p) => {
      const isCorp = (p as any).category === "corporate";
      const cd = (p as any).corporateData;
      const isAccepted = ["verified", "running", "completed"].includes(
        p.status,
      );
      const isActive = [
        "under_verification",
        "verified",
        "running",
        "completed",
      ].includes(p.status);

      const base = {
        projectType: p.projectType,
        date:
          p.startDate || p.createdAt || new Date().toISOString().split("T")[0],
        size: "—",
        period: new Date(p.startDate || p.createdAt || Date.now())
          .getFullYear()
          .toString(),
        generatedBy: p.ownerCompany || p.owner,
        location: p.location?.province || "—",
        credits:
          p.waterData?.verifiedCredits ||
          p.waterData?.estimatedCredits ||
          undefined,
        projectStatus: p.status as Report["projectStatus"],
        category: ((p as any).category || "community") as
          | "community"
          | "corporate",
        industry: cd?.industry,
        surplusDeficit: cd?.surplusDeficit,
        tradingIntent: cd?.tradingIntent,
      };

      const rows: Report[] = [];

      // MRV report — untuk semua proyek (semua status)
      rows.push({
        ...base,
        id: `rpt-mrv-${p.id}`,
        projectName: p.title,
        reportType: "mrv",
        description: p.description || `Laporan MRV untuk proyek ${p.title}`,
        status: isAccepted ? "ready" : "generating",
      });

      // Certificate — hanya untuk proyek verified/running/completed
      if (isAccepted) {
        rows.push({
          ...base,
          id: `rpt-cert-${p.id}`,
          projectName: p.title,
          reportType: "certificate",
          description: `Sertifikat water credit terverifikasi — ${p.title}`,
          status: "ready",
        });
      }

      // Emission report — proyek komunitas yang sudah aktif/diterima
      if (!isCorp && isActive) {
        rows.push({
          ...base,
          id: `rpt-emission-${p.id}`,
          projectName: p.title,
          reportType: "emission",
          description: `Laporan konsumsi & konservasi air — ${p.title}`,
          status: isAccepted ? "ready" : "generating",
        });
      }

      // Audit report — proyek korporat yang sudah aktif/diterima
      if (isCorp && isActive) {
        rows.push({
          ...base,
          id: `rpt-audit-${p.id}`,
          projectName: p.title,
          reportType: "audit",
          description: cd?.industry
            ? `Laporan audit kuota air — ${cd.industry} — ${p.title}`
            : `Laporan audit kuota air — ${p.title}`,
          status: isAccepted ? "ready" : "generating",
          credits: Math.abs(cd?.surplusDeficit ?? 0) || base.credits,
        });
      }

      return rows;
    });

    // Merge dengan laporan manual user
    return [...projectReports, ...userReports];
  }, [getAllProjects, getProjectsByOwner, user?.email, isAdmin, userReports]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredReports = reports.filter((r) => {
    const matchType = filterType === "all" || r.reportType === filterType;
    const matchCat = filterCategory === "all" || r.category === filterCategory;
    const matchStatus =
      filterStatus === "all" || r.projectStatus === filterStatus;
    return matchType && matchCat && matchStatus;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalReports = reports.length;
  const readyReports = reports.filter((r) => r.status === "ready").length;
  const thisMonthReports = reports.filter((r) => {
    const d = new Date(r.date);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;
  const reportTypes = new Set(reports.map((r) => r.reportType)).size;

  // ── Handlers (original, tidak diubah) ─────────────────────────────────────
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowPreviewModal(true);
  };

  const handleDeleteReport = (reportId: string) => {
    if (
      window.confirm(
        language === "id" ? "Hapus laporan ini?" : "Delete this report?",
      )
    ) {
      // Only allow deleting user-created reports (not project-derived ones)
      setUserReports((prev) => prev.filter((r) => r.id !== reportId));
    }
  };

  const handleCreateReport = (newReport: Omit<Report, "id">) => {
    const report: Report = { ...newReport, id: `rpt-user-${Date.now()}` };
    setUserReports((prev) => [report, ...prev]);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header (original) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: theme.textPrimary }}
          >
            {language === "id" ? "Laporan Proyek" : "Project Reports"}
          </h1>
          <p style={{ color: theme.textSecondary }}>
            {language === "id"
              ? "Kelola laporan air untuk setiap proyek yang terdaftar"
              : "Manage water reports for each registered project"}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 hover:shadow-lg transition-all"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          }}
        >
          <Plus className="w-5 h-5" />
          {language === "id" ? "Buat Laporan" : "Create Report"}
        </button>
      </div>

      {/* Stats Cards (original — 4 kartu, tidak dihapus) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl p-6"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "rgba(30, 136, 229, 0.1)" }}
            >
              <FileText className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                {language === "id" ? "Total Laporan" : "Total Reports"}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                {totalReports}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl p-6"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "rgba(67, 160, 71, 0.1)" }}
            >
              <CheckCircle
                className="w-6 h-6"
                style={{ color: theme.secondary }}
              />
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                {language === "id" ? "Siap" : "Ready"}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                {readyReports}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl p-6"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
            >
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                {language === "id" ? "Bulan Ini" : "This Month"}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                {thisMonthReports}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl p-6"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "rgba(168, 85, 247, 0.1)" }}
            >
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                {language === "id" ? "Tipe Laporan" : "Report Types"}
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                {reportTypes}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter — original report-type filter + NEW category & status filters */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Row 1 — Report Type (original, tidak diubah) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter
            className="w-4 h-4 flex-shrink-0"
            style={{ color: theme.textMuted }}
          />
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${filterType === "all" ? "ring-2 ring-blue-500" : ""}`}
            style={{
              backgroundColor:
                filterType === "all" ? theme.primary : theme.bgDark,
              color: filterType === "all" ? "#fff" : theme.textSecondary,
            }}
          >
            {language === "id" ? "Semua Tipe" : "All Types"}
          </button>
          {Object.entries(reportTypeConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filterType === key ? "ring-2 ring-blue-500" : ""}`}
              style={{
                backgroundColor:
                  filterType === key ? theme.primary : theme.bgDark,
                color: filterType === key ? "#fff" : theme.textSecondary,
              }}
            >
              {config.icon}
              {language === "id" ? config.label : config.labelEn}
            </button>
          ))}
        </div>

        {/* Row 2 — Category & Status filters (NEW — sesuai ProjectsPage) */}
        <div
          className="flex items-center gap-2 flex-wrap pt-1"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          {/* Category */}
          <span
            className="text-xs font-medium flex-shrink-0"
            style={{ color: theme.textMuted }}
          >
            {language === "id" ? "Kategori:" : "Category:"}
          </span>
          {(["all", "community", "corporate"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  filterCategory === cat
                    ? cat === "community"
                      ? "rgba(34,197,94,0.2)"
                      : cat === "corporate"
                        ? "rgba(245,158,11,0.2)"
                        : `${theme.primary}20`
                    : theme.bgDark,
                color:
                  filterCategory === cat
                    ? cat === "community"
                      ? "#4ade80"
                      : cat === "corporate"
                        ? "#fbbf24"
                        : theme.primary
                    : theme.textSecondary,
                border: `1px solid ${
                  filterCategory === cat
                    ? cat === "community"
                      ? "rgba(34,197,94,0.3)"
                      : cat === "corporate"
                        ? "rgba(245,158,11,0.3)"
                        : `${theme.primary}40`
                    : "transparent"
                }`,
              }}
            >
              {cat === "community" && <Users className="w-3 h-3" />}
              {cat === "corporate" && <Factory className="w-3 h-3" />}
              {cat === "all"
                ? language === "id"
                  ? "Semua"
                  : "All"
                : cat === "community"
                  ? language === "id"
                    ? "Komunitas"
                    : "Community"
                  : language === "id"
                    ? "Korporat"
                    : "Corporate"}
            </button>
          ))}

          {/* Separator */}
          <span className="mx-1 text-xs" style={{ color: theme.border }}>
            |
          </span>

          {/* Status (7 status dari ProjectsPage) */}
          <span
            className="text-xs font-medium flex-shrink-0"
            style={{ color: theme.textMuted }}
          >
            {language === "id" ? "Status:" : "Status:"}
          </span>
          <button
            onClick={() => setFilterStatus("all")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor:
                filterStatus === "all" ? `${theme.primary}20` : theme.bgDark,
              color:
                filterStatus === "all" ? theme.primary : theme.textSecondary,
              border: `1px solid ${filterStatus === "all" ? `${theme.primary}40` : "transparent"}`,
            }}
          >
            {language === "id" ? "Semua" : "All"}
          </button>
          {Object.entries(projectStatusConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={{
                backgroundColor: filterStatus === key ? cfg.bg : theme.bgDark,
                color: filterStatus === key ? cfg.text : theme.textSecondary,
                border: `1px solid ${filterStatus === key ? cfg.border : "transparent"}`,
              }}
            >
              {language === "id" ? cfg.label : cfg.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List (original table, kolom Location diganti Project Status, tambah info korporat) */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-12 gap-4 p-4 font-medium text-sm"
          style={{
            backgroundColor: theme.bgDark,
            color: theme.textMuted,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div className="col-span-4">
            {language === "id" ? "Nama Proyek" : "Project Name"}
          </div>
          <div className="col-span-2">
            {language === "id" ? "Tipe" : "Type"}
          </div>
          <div className="col-span-2">
            {language === "id" ? "Status Proyek" : "Project Status"}
          </div>
          <div className="col-span-2">
            {language === "id" ? "Tanggal" : "Date"}
          </div>
          <div className="col-span-1">
            {language === "id" ? "Ukuran" : "Size"}
          </div>
          <div className="col-span-1 text-center">
            {language === "id" ? "Aksi" : "Actions"}
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y" style={{ borderColor: theme.border }}>
          <AnimatePresence>
            {filteredReports.map((report, index) => {
              const typeConfig = reportTypeConfig[report.reportType];
              const projStatus = report.projectStatus
                ? projectStatusConfig[report.projectStatus]
                : null;
              const isCorp = report.category === "corporate";

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  {/* Project Info + category badge */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${typeConfig.bg}`}
                      style={{ backgroundColor: theme.bgDark }}
                    >
                      {typeConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p
                          className="font-semibold truncate"
                          style={{ color: theme.textPrimary }}
                        >
                          {report.projectName}
                        </p>
                        {/* Category badge — sesuai ProjectsPage */}
                        <span
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                          style={{
                            backgroundColor: isCorp
                              ? "rgba(245,158,11,0.15)"
                              : "rgba(34,197,94,0.15)",
                            color: isCorp ? "#fbbf24" : "#4ade80",
                          }}
                        >
                          {isCorp ? (
                            <Factory className="w-2.5 h-2.5" />
                          ) : (
                            <Users className="w-2.5 h-2.5" />
                          )}
                          {isCorp
                            ? language === "id"
                              ? "Korporat"
                              : "Corporate"
                            : language === "id"
                              ? "Komunitas"
                              : "Community"}
                        </span>
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: theme.textMuted }}
                      >
                        {report.projectType}
                        {/* Corporate: surplus/defisit + industry + trading intent (sesuai ProjectsPage) */}
                        {isCorp && report.surplusDeficit !== undefined
                          ? ` • ${report.surplusDeficit >= 0 ? "+" : ""}${report.surplusDeficit.toLocaleString()} m³`
                          : report.credits
                            ? ` • ${report.credits.toLocaleString()} m³`
                            : ""}
                        {isCorp && report.industry
                          ? ` • ${report.industry}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Report Type Badge (original) */}
                  <div className="col-span-2 flex items-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}
                    >
                      {language === "id"
                        ? typeConfig.label
                        : typeConfig.labelEn}
                    </span>
                  </div>

                  {/* Project Status Badge — sesuai ProjectsPage statusColors */}
                  <div className="col-span-2 flex items-center">
                    {projStatus ? (
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: projStatus.bg,
                          color: projStatus.text,
                          border: `1px solid ${projStatus.border}`,
                        }}
                      >
                        {language === "id"
                          ? projStatus.label
                          : projStatus.labelEn}
                      </span>
                    ) : (
                      <span
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        —
                      </span>
                    )}
                  </div>

                  {/* Date (original) */}
                  <div className="col-span-2 flex items-center">
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: theme.textPrimary }}
                      >
                        {new Date(report.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {report.period && (
                        <p
                          className="text-xs"
                          style={{ color: theme.textMuted }}
                        >
                          {report.period}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Size (original) */}
                  <div className="col-span-1 flex items-center">
                    <p
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      {report.size}
                    </p>
                  </div>

                  {/* Actions (original) */}
                  <div className="col-span-1 flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title={language === "id" ? "Lihat" : "View"}
                    >
                      <Eye
                        className="w-4 h-4"
                        style={{ color: theme.primary }}
                      />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title={language === "id" ? "Unduh" : "Download"}
                    >
                      <Download
                        className="w-4 h-4"
                        style={{ color: theme.secondary }}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title={language === "id" ? "Hapus" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty state (original) */}
        {filteredReports.length === 0 && (
          <div className="p-12 text-center">
            <FileText
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: theme.textMuted }}
            />
            <p
              className="text-lg font-medium mb-2"
              style={{ color: theme.textPrimary }}
            >
              {language === "id" ? "Belum Ada Laporan" : "No Reports Yet"}
            </p>
            <p style={{ color: theme.textMuted }}>
              {language === "id"
                ? "Laporan akan muncul setelah proyek Anda disetujui oleh admin"
                : "Reports will appear once your projects are approved by admin"}
            </p>
          </div>
        )}
      </div>

      {/* Modals (original) */}
      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateReport}
        language={language}
      />
      <ReportPreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        language={language}
      />
    </div>
  );
};

// ==================== CREATE REPORT MODAL (original, tidak diubah) ====================

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<Report, "id">) => void;
  language: string;
}

const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const [projectName, setProjectName] = useState("");
  const [type, setType] = useState<Report["reportType"]>("emission");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!projectName.trim()) return;
    onSubmit({
      projectName: projectName.trim(),
      projectType: "General",
      reportType: type,
      description: description || `Laporan ${type} untuk ${projectName}`,
      date: new Date().toISOString().split("T")[0],
      size: "—",
      status: "ready",
      period: period || undefined,
      generatedBy: "Manual",
      location: "—",
    });
    setProjectName("");
    setType("emission");
    setPeriod("");
    setDescription("");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: theme.textPrimary }}
          >
            {language === "id" ? "Buat Laporan Baru" : "Create New Report"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.textSecondary }}
            >
              {language === "id" ? "Nama Proyek" : "Project Name"}
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
              }}
              placeholder={
                language === "id"
                  ? "Masukkan nama proyek"
                  : "Enter project name"
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.textSecondary }}
            >
              {language === "id" ? "Tipe Laporan" : "Report Type"}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(reportTypeConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setType(key as Report["reportType"])}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${type === key ? "ring-2 ring-blue-500" : ""}`}
                  style={{
                    backgroundColor: theme.bgDark,
                    border: `1px solid ${type === key ? theme.primary : theme.border}`,
                  }}
                >
                  <span className={type === key ? "text-white" : config.text}>
                    {config.icon}
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: type === key ? theme.textPrimary : theme.textMuted,
                    }}
                  >
                    {language === "id" ? config.label : config.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.textSecondary }}
            >
              {language === "id" ? "Periode" : "Period"}
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
              }}
              placeholder="Q4 2024, November 2024, etc."
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.textSecondary }}
            >
              {language === "id" ? "Deskripsi" : "Description"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
              }}
              placeholder={
                language === "id"
                  ? "Deskripsi laporan (opsional)"
                  : "Report description (optional)"
              }
            />
          </div>
        </div>

        <div
          className="flex gap-3 p-6"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium transition-colors"
            style={{ backgroundColor: theme.bgDark, color: theme.textPrimary }}
          >
            {language === "id" ? "Batal" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!projectName.trim()}
            className="flex-1 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
          >
            {language === "id" ? "Buat Laporan" : "Create Report"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== REPORT PREVIEW MODAL (original + extended corporateData) ====================

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  language: string;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  report,
  language,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  if (!isOpen || !report) return null;

  const typeConfig = reportTypeConfig[report.reportType];
  const projStatus = report.projectStatus
    ? projectStatusConfig[report.projectStatus]
    : null;
  const isCorp = report.category === "corporate";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Modal Header (original + category badge) */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${typeConfig.bg}`}
              style={{ backgroundColor: theme.bgDark }}
            >
              {typeConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {report.projectName}
                </h2>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: isCorp
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(34,197,94,0.15)",
                    color: isCorp ? "#fbbf24" : "#4ade80",
                  }}
                >
                  {isCorp ? (
                    <Factory className="w-3 h-3" />
                  ) : (
                    <Users className="w-3 h-3" />
                  )}
                  {isCorp
                    ? language === "id"
                      ? "Korporat"
                      : "Corporate"
                    : language === "id"
                      ? "Komunitas"
                      : "Community"}
                </span>
              </div>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                {new Date(report.date).toLocaleDateString()} • {report.size}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Report Info Grid (original 4 cell + status + optional corporateData) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tipe Laporan (original) */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Tipe Laporan" : "Report Type"}
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}
                >
                  {typeConfig.icon}
                  {language === "id" ? typeConfig.label : typeConfig.labelEn}
                </span>
              </div>

              {/* Status Proyek — sesuai ProjectsPage */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Status Proyek" : "Project Status"}
                </p>
                {projStatus ? (
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: projStatus.bg,
                      color: projStatus.text,
                      border: `1px solid ${projStatus.border}`,
                    }}
                  >
                    {language === "id" ? projStatus.label : projStatus.labelEn}
                  </span>
                ) : (
                  <p
                    className="font-medium"
                    style={{ color: theme.textPrimary }}
                  >
                    —
                  </p>
                )}
              </div>

              {/* Tipe Proyek (original) */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Tipe Proyek" : "Project Type"}
                </p>
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  {report.projectType}
                </p>
              </div>

              {/* Lokasi (original) */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Lokasi" : "Location"}
                </p>
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  {report.location}
                </p>
              </div>

              {/* Periode (original) */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Periode" : "Period"}
                </p>
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  {report.period || "-"}
                </p>
              </div>

              {/* Dibuat oleh */}
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Dibuat oleh" : "Generated by"}
                </p>
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  {report.generatedBy}
                </p>
              </div>

              {/* Kredit air (original) */}
              {report.credits && (
                <div
                  className="p-4 rounded-xl col-span-2"
                  style={{
                    backgroundColor: "rgba(67, 160, 71, 0.1)",
                    border: `1px solid rgba(67, 160, 71, 0.2)`,
                  }}
                >
                  <p
                    className="text-sm mb-1"
                    style={{ color: theme.textMuted }}
                  >
                    {language === "id" ? "Total Kredit" : "Total Credits"}
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: theme.secondary }}
                  >
                    {report.credits.toLocaleString()} m³
                  </p>
                </div>
              )}

              {/* Corporate data block — sesuai ProjectsPage corporateData */}
              {isCorp &&
                (report.surplusDeficit !== undefined ||
                  report.industry ||
                  report.tradingIntent) && (
                  <div
                    className="p-4 rounded-xl col-span-2"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.08)",
                      border: `1px solid rgba(245,158,11,0.2)`,
                    }}
                  >
                    <p
                      className="text-sm font-semibold flex items-center gap-2 mb-3"
                      style={{ color: "#fbbf24" }}
                    >
                      <Factory className="w-4 h-4" />
                      {language === "id" ? "Data Korporat" : "Corporate Data"}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {report.surplusDeficit !== undefined && (
                        <div>
                          <p
                            className="text-xs mb-1"
                            style={{ color: theme.textMuted }}
                          >
                            {language === "id"
                              ? "Surplus / Defisit"
                              : "Surplus / Deficit"}
                          </p>
                          <p
                            className="text-lg font-bold"
                            style={{
                              color:
                                report.surplusDeficit >= 0
                                  ? "#4ade80"
                                  : "#f87171",
                            }}
                          >
                            {report.surplusDeficit >= 0 ? "+" : ""}
                            {report.surplusDeficit.toLocaleString()} m³
                          </p>
                        </div>
                      )}
                      {report.tradingIntent && (
                        <div>
                          <p
                            className="text-xs mb-1"
                            style={{ color: theme.textMuted }}
                          >
                            {language === "id"
                              ? "Tujuan Trading"
                              : "Trading Intent"}
                          </p>
                          <span
                            className="px-2 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1"
                            style={{
                              backgroundColor:
                                report.tradingIntent === "sell"
                                  ? "rgba(34,197,94,0.15)"
                                  : "rgba(96,165,250,0.15)",
                              color:
                                report.tradingIntent === "sell"
                                  ? "#4ade80"
                                  : "#60a5fa",
                            }}
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            {report.tradingIntent === "sell"
                              ? language === "id"
                                ? "Jual"
                                : "Sell"
                              : language === "id"
                                ? "Beli"
                                : "Buy"}
                          </span>
                        </div>
                      )}
                      {report.industry && (
                        <div>
                          <p
                            className="text-xs mb-1"
                            style={{ color: theme.textMuted }}
                          >
                            {language === "id" ? "Industri" : "Industry"}
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{ color: theme.textPrimary }}
                          >
                            {report.industry}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Description (original) */}
            <div>
              <h3
                className="font-semibold mb-2"
                style={{ color: theme.textPrimary }}
              >
                {language === "id" ? "Deskripsi" : "Description"}
              </h3>
              <p style={{ color: theme.textSecondary }}>{report.description}</p>
            </div>

            {/* Preview Placeholder (original) */}
            <div
              className="rounded-xl p-12 text-center"
              style={{
                backgroundColor: theme.bgDark,
                border: `2px dashed ${theme.border}`,
              }}
            >
              <FileText
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: theme.textMuted }}
              />
              <p
                className="font-medium mb-1"
                style={{ color: theme.textPrimary }}
              >
                {language === "id" ? "Preview Dokumen" : "Document Preview"}
              </p>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                {language === "id"
                  ? "Klik tombol unduh untuk melihat laporan lengkap"
                  : "Click download button to view full report"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer (original) */}
        <div
          className="flex gap-3 p-6"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium transition-colors"
            style={{ backgroundColor: theme.bgDark, color: theme.textPrimary }}
          >
            {language === "id" ? "Tutup" : "Close"}
          </button>
          <button
            className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
          >
            <Download className="w-4 h-4" />
            {language === "id" ? "Unduh Laporan" : "Download Report"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReportsPage;
