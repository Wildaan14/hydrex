import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FolderKanban,
  Calculator,
  MessageSquare,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  Zap,
  Award,
  Droplets,
  Satellite,
  Activity,
  BarChart3,
  Users,
  Factory,
  CheckCircle,
  Package,
  MessageCircle,
  Eye,
  Leaf,
  Blocks,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useProjects } from "../context/ProjectContext";
import { useMarketplace } from "../context/MarketplaceContext";
import { useESG } from "../context/ESGContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

const companyLogoPath = "/company-logo.png";

// ============================================================================
// HELPERS
// ============================================================================
const relativeTime = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
};

const relativeTimeEn = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
};

const getESGScoreColor = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;

  // ── Context hooks ─────────────────────────────────────────────────────────
  const {
    getAllProjects,
    projects: ctxProjects,
    getStatistics,
  } = useProjects();
  const allProjects = useMemo(
    () => (getAllProjects ? getAllProjects() : ctxProjects),
    [getAllProjects, ctxProjects],
  );
  const projectStats = getStatistics(
    user?.role === "admin" ? undefined : user?.email,
  );

  const { listings, transactions, getMarketplaceStats } = useMarketplace();
  const marketStats = getMarketplaceStats();

  const { esgScorings } = useESG();

  // ── Derived data ──────────────────────────────────────────────────────────

  // Projects
  const myProjects =
    user?.role === "admin"
      ? allProjects
      : allProjects.filter((p) => p.ownerEmail === user?.email);
  const activeListings = listings.filter((l) => l.status === "active");
  const verifiedProjects = allProjects.filter(
    (p) => p.verificationStatus === "verified",
  );

  // Total water credits from my projects
  const totalWaterCredits = myProjects.reduce(
    (sum, p) => sum + p.waterData.estimatedCredits,
    0,
  );
  const verifiedCredits = myProjects.reduce(
    (sum, p) => sum + p.waterData.verifiedCredits,
    0,
  );

  // ESG — latest/best score for current user's company
  const myESGScorings = esgScorings.filter(
    (s) =>
      myProjects.some((p) => p.id === s.projectId) || esgScorings.length > 0,
  );
  const latestESG =
    myESGScorings.length > 0
      ? myESGScorings.reduce((best, curr) =>
          curr.overallScore > best.overallScore ? curr : best,
        )
      : null;
  const avgESGScore =
    myESGScorings.length > 0
      ? Math.round(
          myESGScorings.reduce((s, e) => s + e.overallScore, 0) /
            myESGScorings.length,
        )
      : null;

  // Recent activity: merge blockchain records + transactions
  const blockchainActivity = allProjects
    .flatMap((p) =>
      (p.blockchainRecords || []).map((r) => ({
        id: r.txHash,
        type: "blockchain" as const,
        title: language === "id" ? "Blockchain" : "Blockchain",
        desc: `${r.action} — ${p.title}`,
        time: r.timestamp,
        status: "success" as const,
        amount: null as string | null,
      })),
    )
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 3);

  // Transaction type uses `paymentStatus`, NOT `status` — fixes TS2339
  const txActivity = transactions.slice(0, 3).map((t) => {
    const isDone = (t as any).paymentStatus === "completed";
    return {
      id: t.id,
      type: "transaction" as const,
      title: language === "id" ? "Transaksi" : "Transaction",
      desc: `${t.id} — ${(t as any).items?.length ?? 0} item`,
      time: (t as any).createdAt ?? new Date().toISOString(),
      status: (isDone ? "success" : "pending") as "success" | "pending",
      amount: isDone
        ? `+${(t as any).items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) ?? 0} m³`
        : (null as string | null),
    };
  });

  const recentActivity = [...blockchainActivity, ...txActivity]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 3);

  // ── Greeting ──────────────────────────────────────────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === "id" ? "Selamat Pagi" : "Good Morning";
    if (hour < 17)
      return language === "id" ? "Selamat Siang" : "Good Afternoon";
    return language === "id" ? "Selamat Malam" : "Good Evening";
  };

  // ── Stats cards (live data) ───────────────────────────────────────────────
  const stats = [
    {
      label: language === "id" ? "Total Kredit Air" : "Total Water Credits",
      value:
        totalWaterCredits > 0
          ? totalWaterCredits.toLocaleString()
          : marketStats.totalCreditsAvailable > 0
            ? `${(marketStats.totalCreditsAvailable / 1000).toFixed(1)}K`
            : "0",
      unit: "m³",
      change:
        verifiedCredits > 0
          ? `${Math.round((verifiedCredits / Math.max(totalWaterCredits, 1)) * 100)}% verified`
          : language === "id"
            ? "Belum ada"
            : "None yet",
      trend: "up" as const,
      icon: <Droplets className="w-5 h-5" />,
      color: theme.secondary,
    },
    {
      label: language === "id" ? "Listing Aktif" : "Active Listings",
      value: activeListings.length.toString(),
      unit: language === "id" ? "listing" : "listings",
      change:
        marketStats.totalTransactions > 0
          ? `${marketStats.totalTransactions} tx`
          : language === "id"
            ? "Belum ada transaksi"
            : "No transactions yet",
      trend: "up" as const,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "#8b5cf6",
    },
    {
      label: language === "id" ? "Proyek Aktif" : "Active Projects",
      value: projectStats.activeProjects.toString(),
      unit: `/ ${projectStats.totalProjects} total`,
      change:
        projectStats.pendingVerifications > 0
          ? `${projectStats.pendingVerifications} pending`
          : language === "id"
            ? "Semua up to date"
            : "All up to date",
      trend: (projectStats.pendingVerifications > 0 ? "down" : "up") as
        | "up"
        | "down",
      icon: <Zap className="w-5 h-5" />,
      color: theme.primary,
    },
    {
      label: language === "id" ? "Skor ESG" : "ESG Score",
      value:
        avgESGScore !== null
          ? avgESGScore.toString()
          : latestESG
            ? latestESG.overallScore.toString()
            : "—",
      unit: avgESGScore !== null ? (language === "id" ? "poin" : "pts") : "",
      change: latestESG
        ? latestESG.grade
        : language === "id"
          ? "Belum dihitung"
          : "Not yet scored",
      trend: (avgESGScore !== null && avgESGScore >= 65 ? "up" : "down") as
        | "up"
        | "down",
      icon: <Award className="w-5 h-5" />,
      color: "#f59e0b",
    },
  ];

  // ── Quick Access (same links as original, with live stat labels) ──────────
  const quickAccess = [
    {
      name: "Marketplace",
      nameEn: "Marketplace",
      desc:
        language === "id"
          ? "Jual & beli kredit air"
          : "Buy & sell water credits",
      path: "/marketplace",
      icon: <ShoppingCart className="w-6 h-6" />,
      stat:
        activeListings.length > 0
          ? `${activeListings.length} active listings`
          : language === "id"
            ? "Belum ada listing"
            : "No listings yet",
      gradient: `linear-gradient(135deg, ${theme.primary}30, ${theme.primaryLight}30)`,
      iconColor: theme.primary,
    },
    {
      name: "Proyek",
      nameEn: "Projects",
      desc: language === "id" ? "Kelola proyek air" : "Manage water projects",
      path: "/projects",
      icon: <FolderKanban className="w-6 h-6" />,
      stat:
        projectStats.totalProjects > 0
          ? `${projectStats.activeProjects} active / ${projectStats.totalProjects} total`
          : language === "id"
            ? "Belum ada proyek"
            : "No projects yet",
      gradient:
        "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))",
      iconColor: "#8b5cf6",
    },
    {
      name: "ESG Scoring",
      nameEn: "ESG Scoring",
      desc:
        language === "id"
          ? "Nilai keberlanjutan ESG"
          : "Sustainability ESG scoring",
      path: "/esg",
      icon: <Award className="w-6 h-6" />,
      stat:
        esgScorings.length > 0
          ? `${esgScorings.length} scoring${esgScorings.length > 1 ? "s" : ""}`
          : language === "id"
            ? "Mulai scoring"
            : "Start scoring",
      gradient:
        "linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(251, 191, 36, 0.3))",
      iconColor: "#f59e0b",
    },
    {
      name: "MRV Dashboard",
      nameEn: "MRV Dashboard",
      desc:
        language === "id"
          ? "Monitoring & verifikasi"
          : "Monitoring & verification",
      path: "/mrv",
      icon: <Satellite className="w-6 h-6" />,
      stat:
        verifiedProjects.length > 0
          ? `${verifiedProjects.length} verified`
          : language === "id"
            ? "Real-time"
            : "Real-time",
      gradient: `linear-gradient(135deg, ${theme.secondary}30, ${theme.secondaryLight}30)`,
      iconColor: theme.secondary,
    },
    {
      name: "Kalkulator",
      nameEn: "Calculator",
      desc:
        language === "id" ? "Hitung jejak air" : "Calculate water footprint",
      path: "/calculator",
      icon: <Calculator className="w-6 h-6" />,
      stat: "Real-time",
      gradient: `linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))`,
      iconColor: "#22c55e",
    },
    {
      name: "Forum",
      nameEn: "Forum",
      desc: language === "id" ? "Diskusi & berbagi" : "Discuss & share",
      path: "/forum",
      icon: <MessageSquare className="w-6 h-6" />,
      stat: "128 topics",
      gradient:
        "linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(244, 114, 182, 0.3))",
      iconColor: "#ec4899",
    },
  ];

  // ── Progress calculation ──────────────────────────────────────────────────
  const ANNUAL_TARGET = 15_000;
  const achievedCredits =
    verifiedCredits > 0 ? verifiedCredits : totalWaterCredits;
  const progressPct = Math.min(
    Math.round((achievedCredits / ANNUAL_TARGET) * 100),
    100,
  );

  return (
    <div className="space-y-6 pb-8">

      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-bg rounded-2xl overflow-hidden"
        style={{ minHeight: "180px" }}
      >
        {/* Grid overlay for texture */}
        <div className="grid-overlay absolute inset-0" />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            {/* Platform badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="feature-pill text-xs py-1 px-3">
                <Droplets className="w-3.5 h-3.5" />
                Water Credit Platform
              </span>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}
              >
                🟢 {language === "id" ? "Aktif" : "Active"}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5 leading-tight">
              {getGreeting()},{" "}
              <span style={{ color: "#6ee7b7" }}>{user?.name?.split(" ")[0]}</span>! 👋
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              {language === "id"
                ? "Berikut ringkasan aktivitas kredit air Anda hari ini"
                : "Here's your water credit activity summary for today"}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                backdropFilter: "blur(8px)",
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              {language === "id" ? "Beli Kredit Air" : "Buy Water Credits"}
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: "0 4px 16px rgba(5,150,105,0.4)",
              }}
            >
              <Zap className="w-4 h-4" />
              {language === "id" ? "Buat Proyek" : "New Project"}
            </Link>
          </div>
        </div>

        {/* Decorative orbs */}
        <div
          className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />
        <div
          className="absolute bottom-[-30px] left-[30%] w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${theme.secondary} 0%, transparent 70%)`,
            filter: "blur(30px)",
          }}
        />
      </motion.div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="stat-card p-5"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="p-2.5 rounded-xl"
                style={{
                  backgroundColor: `${stat.color}18`,
                  color: stat.color,
                  boxShadow: `0 0 12px ${stat.color}20`,
                }}
              >
                {stat.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  stat.trend === "up"
                    ? "text-green-500 bg-green-500/10"
                    : "text-red-400 bg-red-500/10"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <p className="text-xs mb-1 font-medium" style={{ color: theme.textMuted }}>
              {stat.label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-2xl font-extrabold"
                style={{ color: theme.textPrimary }}
              >
                {stat.value}
              </span>
              <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
                {stat.unit}
              </span>
            </div>
            {/* Bottom accent bar */}
            <div
              className="mt-3 h-0.5 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${stat.color}60, transparent)`,
              }}
            />
          </motion.div>
        ))}
      </div>


      {/* ── Platform Overview — live cross-module stats (NEW) ─────────── */}
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h2
          className="text-base font-semibold mb-4 flex items-center gap-2"
          style={{ color: theme.textPrimary }}
        >
          <Activity className="w-4 h-4" style={{ color: theme.secondary }} />
          {language === "id" ? "Ringkasan Platform" : "Platform Overview"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              icon: <Package className="w-4 h-4" />,
              color: theme.primary,
              label: language === "id" ? "Total Listing" : "Total Listings",
              value: marketStats.totalListings,
            },
            {
              icon: <Leaf className="w-4 h-4" />,
              color: "#22c55e",
              label: language === "id" ? "Komunitas" : "Community",
              value: marketStats.communityListings ?? 0,
            },
            {
              icon: <Factory className="w-4 h-4" />,
              color: "#f59e0b",
              label: language === "id" ? "Korporat" : "Corporate",
              value: marketStats.corporateListings ?? 0,
            },
            {
              icon: <FolderKanban className="w-4 h-4" />,
              color: "#8b5cf6",
              label: language === "id" ? "Total Proyek" : "Total Projects",
              value: projectStats.totalProjects,
            },
            {
              icon: <CheckCircle className="w-4 h-4" />,
              color: "#22c55e",
              label: language === "id" ? "Terverifikasi" : "Verified",
              value: verifiedProjects.length,
            },
            {
              icon: <Award className="w-4 h-4" />,
              color: "#f59e0b",
              label: language === "id" ? "ESG Scoring" : "ESG Scorings",
              value: esgScorings.length,
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * idx }}
              className="rounded-xl p-3 flex flex-col gap-1"
              style={{
                backgroundColor: `${item.color}10`,
                border: `1px solid ${item.color}20`,
              }}
            >
              <div style={{ color: item.color }}>{item.icon}</div>
              <p
                className="text-xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                {item.value}
              </p>
              <p
                className="text-xs leading-tight"
                style={{ color: theme.textMuted }}
              >
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Quick Access (6 cards) + Recent Activity ──────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <div className="lg:col-span-2 space-y-4">
          <h2
            className="text-lg font-semibold"
            style={{ color: theme.textPrimary }}
          >
            {language === "id" ? "Akses Cepat" : "Quick Access"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickAccess.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
              >
                <Link
                  to={item.path}
                  className="block rounded-2xl p-5 transition-all group hover:scale-[1.02]"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: item.gradient,
                        color: item.iconColor,
                      }}
                    >
                      {item.icon}
                    </div>
                    <ArrowUpRight
                      className="w-5 h-5 transition-colors"
                      style={{ color: theme.textMuted }}
                    />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-1"
                    style={{ color: theme.textPrimary }}
                  >
                    {language === "id" ? item.name : item.nameEn}
                  </h3>
                  <p
                    className="text-sm mb-3"
                    style={{ color: theme.textSecondary }}
                  >
                    {item.desc}
                  </p>
                  <span
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: theme.textMuted,
                    }}
                  >
                    {item.stat}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-semibold"
              style={{ color: theme.textPrimary }}
            >
              {language === "id" ? "Aktivitas Terbaru" : "Recent Activity"}
            </h2>
            <Link
              to="/mrv"
              className="text-sm hover:opacity-80 flex items-center gap-1"
              style={{ color: theme.primary }}
            >
              {language === "id" ? "Lihat Semua" : "View All"}
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div
            className="rounded-2xl divide-y"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderColor: theme.border,
            }}
          >
            {recentActivity.length === 0
              ? /* fallback ke hardcoded dari original kalau belum ada aktivitas */
                [
                  {
                    title: language === "id" ? "Pembelian" : "Purchase",
                    desc: "Water credit from Kalimantan Watershed Project",
                    time: language === "id" ? "2 jam lalu" : "2 hours ago",
                    amount: "+500 m³",
                    status: "success",
                  },
                  {
                    title: language === "id" ? "Verifikasi" : "Verification",
                    desc: "Sulawesi Water Conservation Project verified",
                    time: language === "id" ? "5 jam lalu" : "5 hours ago",
                    amount: null,
                    status: "success",
                  },
                  {
                    title: language === "id" ? "Pending" : "Pending",
                    desc: "Waiting for transfer approval",
                    time: language === "id" ? "1 hari lalu" : "1 day ago",
                    amount: "-200 m³",
                    status: "pending",
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 flex items-start gap-3"
                    style={{ borderColor: theme.border }}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        activity.status === "success"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {activity.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium"
                        style={{ color: theme.textPrimary }}
                      >
                        {activity.title}
                      </p>
                      <p
                        className="text-sm truncate"
                        style={{ color: theme.textSecondary }}
                      >
                        {activity.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock
                          className="w-3 h-3"
                          style={{ color: theme.textMuted }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: theme.textMuted }}
                        >
                          {activity.time}
                        </span>
                        {activity.amount && (
                          <span
                            className={`text-xs font-medium ${
                              activity.amount.startsWith("+")
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {activity.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              : recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 flex items-start gap-3"
                    style={{ borderColor: theme.border }}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        activity.status === "success"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {activity.type === "blockchain" ? (
                        <Blocks className="w-4 h-4" />
                      ) : activity.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium"
                        style={{ color: theme.textPrimary }}
                      >
                        {activity.title}
                      </p>
                      <p
                        className="text-sm truncate"
                        style={{ color: theme.textSecondary }}
                      >
                        {activity.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock
                          className="w-3 h-3"
                          style={{ color: theme.textMuted }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: theme.textMuted }}
                        >
                          {language === "id"
                            ? relativeTime(activity.time)
                            : relativeTimeEn(activity.time)}
                        </span>
                        {activity.amount && (
                          <span
                            className={`text-xs font-medium ${
                              activity.amount.startsWith("+")
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {activity.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>

          {/* Recent Forum Posts (from ForumPage samplePosts) */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <h3
                className="font-semibold text-sm flex items-center gap-2"
                style={{ color: theme.textPrimary }}
              >
                <MessageCircle
                  className="w-4 h-4"
                  style={{ color: "#ec4899" }}
                />
                {language === "id" ? "Diskusi Terbaru" : "Latest Discussions"}
              </h3>
              <Link
                to="/forum"
                className="text-xs hover:opacity-80"
                style={{ color: theme.primary }}
              >
                {language === "id" ? "Forum →" : "Forum →"}
              </Link>
            </div>
            {[
              {
                title:
                  "Bagaimana cara menghitung water footprint untuk industri manufaktur?",
                titleEn:
                  "How to calculate water footprint for manufacturing industry?",
                replies: 8,
                views: 156,
                tag: "question",
              },
              {
                title: "[Pengumuman] Update Fitur Kalkulator Air v2.0",
                titleEn: "[Announcement] Water Calculator Feature Update v2.0",
                replies: 23,
                views: 542,
                tag: "announcement",
              },
              {
                title:
                  "Panduan Lengkap: Memulai Trading Water Credit di HYDREX",
                titleEn:
                  "Complete Guide: Getting Started with Water Credit Trading",
                replies: 34,
                views: 1205,
                tag: "guide",
              },
            ].map((post, idx) => (
              <Link
                key={idx}
                to="/forum"
                className="block rounded-lg p-3 hover:bg-white/5 transition-colors"
                style={{ border: `1px solid ${theme.border}` }}
              >
                <p
                  className="text-xs font-medium line-clamp-2 mb-1.5"
                  style={{ color: theme.textPrimary }}
                >
                  {language === "id" ? post.title : post.titleEn}
                </p>
                <div
                  className="flex items-center gap-3 text-xs"
                  style={{ color: theme.textMuted }}
                >
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.replies}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.views}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      backgroundColor:
                        post.tag === "question"
                          ? "#fbbf2420"
                          : post.tag === "announcement"
                            ? "#ef444420"
                            : "#a855f720",
                      color:
                        post.tag === "question"
                          ? "#fbbf24"
                          : post.tag === "announcement"
                            ? "#ef4444"
                            : "#a855f7",
                    }}
                  >
                    {post.tag}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Progress Section (original + live data) ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-6"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: theme.textPrimary }}
            >
              <Target className="w-5 h-5" style={{ color: theme.secondary }} />
              {language === "id"
                ? "Progress Konservasi Air"
                : "Water Conservation Progress"}
            </h2>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              {language === "id"
                ? `Target tahunan: ${ANNUAL_TARGET.toLocaleString()} m³`
                : `Annual target: ${ANNUAL_TARGET.toLocaleString()} m³`}
            </p>
          </div>
          <Link
            to="/mrv"
            className="text-sm flex items-center gap-1 hover:opacity-80"
            style={{ color: theme.primary }}
          >
            {language === "id" ? "Lihat Detail" : "View Details"}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: theme.textSecondary }}>
              {language === "id" ? "Tercapai" : "Achieved"}
            </span>
            <span className="font-medium" style={{ color: theme.textPrimary }}>
              {achievedCredits.toLocaleString()} /{" "}
              {ANNUAL_TARGET.toLocaleString()} m³ ({progressPct}%)
            </span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
              }}
            />
          </div>
        </div>

        {/* Milestones (original) + live project stats below */}
        <div
          className="grid grid-cols-3 gap-4 mt-6 pt-6"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <div className="text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: theme.secondary }}
            >
              {projectStats.totalProjects}
            </p>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
              {language === "id" ? "Total Proyek" : "Total Projects"}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: theme.secondary }}
            >
              {verifiedProjects.length}
            </p>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
              {language === "id" ? "Terverifikasi" : "Verified"}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-2xl font-bold"
              style={{
                color:
                  projectStats.pendingVerifications > 0 ? "#f59e0b" : "#22c55e",
              }}
            >
              {projectStats.pendingVerifications}
            </p>
            <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
              {language === "id"
                ? "Menunggu Verifikasi"
                : "Pending Verification"}
            </p>
          </div>
        </div>

        {/* ESG summary strip (only when data exists) */}
        {esgScorings.length > 0 && (
          <div
            className="mt-4 pt-4 flex items-center gap-4 flex-wrap"
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" style={{ color: "#f59e0b" }} />
              <span className="text-sm" style={{ color: theme.textSecondary }}>
                {language === "id" ? "Rata-rata ESG:" : "Avg ESG:"}
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  color: getESGScoreColor(avgESGScore ?? 0),
                }}
              >
                {avgESGScore ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: theme.primary }} />
              <span className="text-sm" style={{ color: theme.textSecondary }}>
                {language === "id" ? "Eligible:" : "Eligible:"}
              </span>
              <span className="text-sm font-bold" style={{ color: "#22c55e" }}>
                {esgScorings.filter((s) => s.status === "eligible").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: "#f59e0b" }} />
              <span className="text-sm" style={{ color: theme.textSecondary }}>
                {language === "id" ? "Conditional:" : "Conditional:"}
              </span>
              <span className="text-sm font-bold" style={{ color: "#f59e0b" }}>
                {esgScorings.filter((s) => s.status === "conditional").length}
              </span>
            </div>
            <Link
              to="/esg"
              className="ml-auto text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 hover:opacity-80 transition-all"
              style={{
                backgroundColor: `${theme.primary}20`,
                color: theme.primary,
                border: `1px solid ${theme.primary}30`,
              }}
            >
              {language === "id" ? "Lihat ESG →" : "View ESG →"}
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── Company Logo Footer (original) ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center items-center py-8"
      >
        <div className="text-center">
          <p className="text-xs mb-4" style={{ color: theme.textMuted }}>
            {language === "id" ? "Didukung oleh" : "Powered by"}
          </p>
          <img
            src={companyLogoPath}
            alt="Company Logo"
            className="h-12 md:h-16 w-auto mx-auto opacity-60 hover:opacity-100 transition-opacity"
            style={{ filter: "grayscale(20%)" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
