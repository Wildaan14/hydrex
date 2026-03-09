// pages/AdminPage.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  FolderKanban,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  XCircle,
} from "lucide-react";
import { useProjects } from "../context/ProjectContext";
import { useMarketplace } from "../context/MarketplaceContext";
import { useLanguage } from "../context/LanguageContext";

export const AdminPage: React.FC = () => {
  const { language } = useLanguage();
  const { getAllProjects, approveProject, rejectProject } = useProjects();
  const { listings, getMarketplaceStats } = useMarketplace();

  const allProjects = getAllProjects();

  // Compute stats from real data
  const totalProjects = allProjects.length;
  const activeProjects = allProjects.filter((p) =>
    ["running", "verified", "under_verification"].includes(p.status),
  ).length;
  const pendingProjects = allProjects.filter((p) => p.status === "pending");
  const totalVolume = listings.reduce(
    (sum, l) => sum + l.availableCredits * l.pricePerTon,
    0,
  );

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`;
    return `Rp ${value.toFixed(0)}`;
  };

  const stats = [
    {
      label: language === "id" ? "Total Proyek" : "Total Projects",
      value: totalProjects.toString(),
      change:
        language === "id"
          ? `${pendingProjects.length} menunggu review`
          : `${pendingProjects.length} pending review`,
      icon: <FolderKanban className="w-5 h-5" />,
      color: "blue",
    },
    {
      label: language === "id" ? "Proyek Aktif" : "Active Projects",
      value: activeProjects.toString(),
      change:
        language === "id"
          ? `${allProjects.filter((p) => p.status === "verified").length} terverifikasi`
          : `${allProjects.filter((p) => p.status === "verified").length} verified`,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "cyan",
    },
    {
      label: language === "id" ? "Pending Approval" : "Pending Approval",
      value: pendingProjects.length.toString(),
      change: language === "id" ? "Perlu review" : "Needs review",
      icon: <Clock className="w-5 h-5" />,
      color: "amber",
    },
    {
      label: language === "id" ? "Volume Marketplace" : "Marketplace Volume",
      value: formatCurrency(totalVolume),
      change:
        language === "id"
          ? `${listings.length} listing aktif`
          : `${listings.length} active listings`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === "id" ? "Admin Panel" : "Admin Panel"}
          </h1>
          <p className="text-muted-foreground">
            {language === "id"
              ? "Kelola platform dan monitor aktivitas"
              : "Manage platform and monitor activity"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div
              className={`p-2 rounded-lg w-fit mb-3 ${
                stat.color === "blue"
                  ? "bg-blue-500/10 text-blue-500"
                  : stat.color === "cyan"
                    ? "bg-cyan-500/10 text-cyan-500"
                    : stat.color === "amber"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-purple-500/10 text-purple-500"
              }`}
            >
              {stat.icon}
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            {language === "id" ? "Menunggu Persetujuan" : "Pending Approvals"}
          </h3>
          <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-sm font-medium">
            {pendingProjects.length} {language === "id" ? "pending" : "pending"}
          </span>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
            <p className="font-medium text-foreground">
              {language === "id"
                ? "Tidak ada yang perlu di-review"
                : "Nothing to review"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "id"
                ? "Semua proyek telah diproses"
                : "All projects have been processed"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingProjects.map((project) => (
              <div
                key={project.id}
                className="p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {project.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {project.ownerCompany || project.owner} •{" "}
                      {project.location.province}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "id" ? "Diajukan" : "Submitted"}:{" "}
                      {project.startDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const notes =
                        language === "id"
                          ? "Disetujui oleh Admin"
                          : "Approved by Admin";
                      approveProject(project.id, "admin", notes);
                    }}
                    className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {language === "id" ? "Setuju" : "Approve"}
                  </button>
                  <button
                    onClick={() => {
                      const reason =
                        language === "id"
                          ? "Ditolak oleh Admin"
                          : "Rejected by Admin";
                      rejectProject(project.id, "admin", reason);
                    }}
                    className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    {language === "id" ? "Tolak" : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Projects Overview */}
      {allProjects.length > 0 && (
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">
              {language === "id" ? "Semua Proyek" : "All Projects"}
            </h3>
          </div>
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {allProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {project.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.ownerCompany || project.owner} •{" "}
                      {project.location.province}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    project.status === "verified" ||
                    project.status === "running"
                      ? "bg-green-500/10 text-green-500"
                      : project.status === "pending"
                        ? "bg-amber-500/10 text-amber-500"
                        : project.status === "rejected"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {project.status === "pending"
                    ? language === "id"
                      ? "Menunggu"
                      : "Pending"
                    : project.status === "verified"
                      ? language === "id"
                        ? "Terverifikasi"
                        : "Verified"
                      : project.status === "running"
                        ? language === "id"
                          ? "Berjalan"
                          : "Running"
                        : project.status === "rejected"
                          ? language === "id"
                            ? "Ditolak"
                            : "Rejected"
                          : project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marketplace Listings Overview */}
      {listings.length > 0 && (
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              {language === "id"
                ? "Listing Marketplace"
                : "Marketplace Listings"}
            </h3>
            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium">
              {listings.length} {language === "id" ? "aktif" : "active"}
            </span>
          </div>
          <div className="divide-y divide-border max-h-64 overflow-y-auto">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <ShoppingCart className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {listing.projectName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {listing.sellerName} •{" "}
                      {listing.availableCredits.toLocaleString()} m³
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  Rp {listing.pricePerTon.toLocaleString()}/m³
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
