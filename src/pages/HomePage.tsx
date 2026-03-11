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
  Target,
  Zap,
  Award,
  Droplets,
  Satellite,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useProjects } from "../context/ProjectContext";
import { useMarketplace } from "../context/MarketplaceContext";
import { useESG } from "../context/ESGContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

// Import smaller page components
import { HomeHero } from "../components/home/HomeHero";
import { HomeStatsRow } from "../components/home/HomeStatsRow";
import { HomePlatformOverview } from "../components/home/HomePlatformOverview";
import { HomeQuickAccess } from "../components/home/HomeQuickAccess";
import { HomeRecentActivity } from "../components/home/HomeRecentActivity";

const companyLogoPath = "/company-logo.png";

const getESGScoreColor = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
};

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

  // ── Quick Access ──────────────────────────────────────────────────────────
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

  // ── Platform Overview ───────────────────────────────────────────
  const overviewItems = [
    { icon: <ShoppingCart className="w-4 h-4" />, color: theme.primary, label: language === "id" ? "Total Listing" : "Total Listings", value: marketStats.totalListings },
    { icon: <Droplets className="w-4 h-4" />, color: "#22c55e", label: language === "id" ? "Komunitas" : "Community", value: marketStats.communityListings ?? 0 },
    { icon: <Award className="w-4 h-4" />, color: "#f59e0b", label: language === "id" ? "Korporat" : "Corporate", value: marketStats.corporateListings ?? 0 },
    { icon: <Zap className="w-4 h-4" />, color: "#8b5cf6", label: language === "id" ? "Total Proyek" : "Total Projects", value: projectStats.totalProjects },
    { icon: <ShoppingCart className="w-4 h-4" />, color: "#22c55e", label: language === "id" ? "Terverifikasi" : "Verified", value: verifiedProjects.length },
    { icon: <Award className="w-4 h-4" />, color: "#f59e0b", label: language === "id" ? "ESG Scoring" : "ESG Scorings", value: esgScorings.length },
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
      {/* ── Extracted Components ── */}
      <HomeHero user={user} language={language} theme={theme} getGreeting={getGreeting} />

      <HomeStatsRow stats={stats} theme={theme} />

      <HomePlatformOverview overviewItems={overviewItems} language={language} theme={theme} />

      <div className="grid lg:grid-cols-3 gap-6">
        <HomeQuickAccess quickAccess={quickAccess} language={language} theme={theme} />
        <HomeRecentActivity recentActivity={recentActivity} language={language} theme={theme} />
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
