import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle,
  Clock,
  FileText,
  Globe,
  Shield,
  ExternalLink,
  Droplets,
  BarChart3,
  Box,
  Database,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  useProjects,
  Project,
  VerificationStatus,
} from "../context/ProjectContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

const verificationColors: Record<
  VerificationStatus,
  { bg: string; text: string; label: string; labelEn: string }
> = {
  not_started: {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    label: "Belum Dimulai",
    labelEn: "Not Started",
  },
  pending: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    label: "Menunggu Verifikasi",
    labelEn: "Pending",
  },
  under_review: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    label: "Sedang Direview",
    labelEn: "Under Review",
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
};

// Leaflet Map Component
const ProjectMap: React.FC<{
  projects: Project[];
  onSelectProject: (p: Project) => void;
}> = ({ projects, onSelectProject }) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const mapContainerId = "mrv-map-container";
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let map: any = null;
    let L: any = null;
    let markersLayer: any = null;

    const initMap = () => {
      L = (window as any).L;
      if (!L) {
        console.log("Leaflet not loaded yet");
        return;
      }

      const container = document.getElementById(mapContainerId);
      if (!container) {
        console.log("Map container not found");
        return;
      }

      // Remove existing map instance if it exists
      if ((container as any)._leaflet_id) {
        const existingMap = (window as any).existingMRVMap;
        if (existingMap) {
          existingMap.remove();
          (window as any).existingMRVMap = null;
        }
      }

      // Create map and store ref for cleanup
      map = L.map(mapContainerId, {
        center: [-2.5, 118],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
      });

      // Add tile layer based on current theme
      const tileStyle = colorTheme === "dark" ? "dark_all" : "light_all";
      L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/${tileStyle}/{z}/{x}/{y}{r}.png`,
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 18,
        },
      ).addTo(map);

      (window as any).existingMRVMap = map;

      // Create a layer group for markers
      markersLayer = L.layerGroup().addTo(map);

      console.log(`📍 Initializing map with ${projects.length} projects`);

      // Add markers for each project
      let validProjectCount = 0;
      projects.forEach((project) => {
        if (
          !project.location?.coordinates?.lat ||
          !project.location?.coordinates?.lng
        ) {
          console.log(`⚠️ Project ${project.title} missing coordinates`);
          return;
        }

        validProjectCount++;

        const color =
          project.verificationStatus === "verified"
            ? "#22c55e"
            : project.verificationStatus === "rejected"
              ? "#ef4444"
              : project.verificationStatus === "pending" ||
                  project.verificationStatus === "under_review"
                ? "#eab308"
                : "#3b82f6";

        // Create custom icon
        const icon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 3px 10px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        });

        try {
          const marker = L.marker(
            [
              project.location.coordinates.lat,
              project.location.coordinates.lng,
            ],
            { icon },
          ).addTo(markersLayer);

          // Popup content
          const popupContent = `
            <div style="min-width: 220px; padding: 5px;">
              <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                ${project.title}
              </h4>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                📍 ${project.location.province}
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                📐 ${project.areaHectares.toLocaleString()} Hektar
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
                🌱 ${project.waterData.estimatedCredits.toLocaleString()} m³
              </div>
              <div style="
                display: inline-block;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                background-color: ${project.verificationStatus === "verified" ? "#dcfce7" : "#fef3c7"};
                color: ${project.verificationStatus === "verified" ? "#166534" : "#92400e"};
              ">
                ${project.verificationStatus === "verified" ? "✓ Terverifikasi" : "⏳ Menunggu"}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on("click", () => {
            console.log("Project clicked:", project.title);
            onSelectProject(project);
          });

          // Draw area polygon if available
          if (
            (project.location as any).polygon &&
            (project.location as any).polygon.length > 0
          ) {
            L.polygon((project.location as any).polygon, {
              color: color,
              fillColor: color,
              fillOpacity: 0.15,
              weight: 2,
            }).addTo(markersLayer);
          }

          console.log(`✅ Added marker for: ${project.title}`);
        } catch (error) {
          console.error(`❌ Error adding marker for ${project.title}:`, error);
        }
      });

      console.log(`✅ Successfully added ${validProjectCount} markers to map`);
      setMapReady(true);
    };

    // Load Leaflet
    const loadLeaflet = () => {
      // Add CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        css.crossOrigin = "";
        document.head.appendChild(css);
      }

      // Add JS
      if (!(window as any).L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
        script.onload = () => {
          setTimeout(initMap, 200);
        };
        document.head.appendChild(script);
      } else {
        setTimeout(initMap, 100);
      }
    };

    loadLeaflet();

    return () => {
      if (markersLayer) {
        markersLayer.clearLayers();
      }
      if (map) {
        map.remove();
      }
    };
  }, [projects, onSelectProject, colorTheme]);

  return (
    <div className="relative w-full h-full">
      <div
        id={mapContainerId}
        className="w-full h-full"
        style={{ backgroundColor: theme.bgDark, minHeight: "400px" }}
      />
      {!mapReady && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: theme.bgDark }}
        >
          <div className="text-center">
            <RefreshCw
              className="w-8 h-8 animate-spin mx-auto mb-2"
              style={{ color: theme.primary }}
            />
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Loading map...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const MRVDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const { projects, getAllProjects } = useProjects();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Calculate MRV statistics — use getAllProjects to get all from context
  const allProjects = getAllProjects ? getAllProjects() : projects;
  const mrvStats = {
    totalConsumption: allProjects.reduce(
      (sum, p) => sum + p.waterData.estimatedCredits,
      0,
    ),
    verifiedProjects: allProjects.filter(
      (p) => p.verificationStatus === "verified",
    ).length,
    pendingVerification: allProjects.filter(
      (p) =>
        p.verificationStatus === "pending" ||
        p.verificationStatus === "not_started" ||
        p.verificationStatus === "under_review",
    ).length,
    dataAccuracy:
      allProjects.length > 0
        ? Math.round(
            (allProjects.filter((p) => p.verificationStatus === "verified")
              .length /
              allProjects.length) *
              100 *
              10,
          ) / 10
        : 98.5,
  };

  // Get all blockchain records sorted by date — live from all projects
  const allBlockchainRecords = allProjects
    .flatMap((p) =>
      (p.blockchainRecords || []).map((r) => ({
        ...r,
        projectTitle: p.title,
        projectId: p.id,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ color: theme.textPrimary }}
        >
          MRV Dashboard
        </h1>
        <p style={{ color: theme.textSecondary }}>
          {language === "id"
            ? "Monitoring, Reporting, and Verification sistem air Anda"
            : "Monitoring, Reporting, and Verification for your water system"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: <Activity className="w-5 h-5" />,
            label:
              language === "id"
                ? "Total Konsumsi Termonitor"
                : "Total Monitored Consumption",
            value: mrvStats.totalConsumption.toLocaleString(),
            unit: "m³",
            color: theme.secondary,
          },
          {
            icon: <CheckCircle className="w-5 h-5" />,
            label:
              language === "id" ? "Proyek Terverifikasi" : "Verified Projects",
            value: mrvStats.verifiedProjects,
            unit: language === "id" ? "proyek" : "projects",
            color: "#22c55e",
          },
          {
            icon: <Clock className="w-5 h-5" />,
            label:
              language === "id"
                ? "Menunggu Verifikasi"
                : "Pending Verification",
            value: mrvStats.pendingVerification,
            unit: language === "id" ? "proyek" : "projects",
            color: "#f59e0b",
          },
          {
            icon: <FileText className="w-5 h-5" />,
            label: language === "id" ? "Akurasi Data" : "Data Accuracy",
            value: mrvStats.dataAccuracy,
            unit: "%",
            color: theme.primary,
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl p-4"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              className="p-2 rounded-lg w-fit mb-3"
              style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className="text-2xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                {stat.value}
              </span>
              <span className="text-sm" style={{ color: theme.textMuted }}>
                {stat.unit}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content - Map and Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div
            className="p-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <h2
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: theme.textPrimary }}
            >
              <Globe className="w-5 h-5" style={{ color: theme.primary }} />
              {language === "id"
                ? "Peta Lokasi Proyek"
                : "Project Location Map"}
            </h2>
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: theme.textSecondary }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#22c55e" }}
                ></span>
                Verified
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#eab308" }}
                ></span>
                Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#3b82f6" }}
                ></span>
                New
              </span>
            </div>
          </div>
          <div className="h-[400px]" style={{ isolation: "isolate" }}>
            <ProjectMap
              projects={allProjects}
              onSelectProject={setSelectedProject}
            />
          </div>
        </div>

        {/* Sector Distribution */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div
            className="p-4"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <h2
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: theme.textPrimary }}
            >
              <BarChart3 className="w-5 h-5" style={{ color: theme.primary }} />
              {language === "id" ? "Distribusi Proyek" : "Project Distribution"}
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {[
              {
                type: "Reforestasi",
                typeEn: "Reforestation",
                count: allProjects.filter(
                  (p) => p.projectType === "reforestation",
                ).length,
                color: "#22c55e",
              },
              {
                type: "Konservasi",
                typeEn: "Conservation",
                count: allProjects.filter(
                  (p) => p.projectType === "conservation",
                ).length,
                color: "#3b82f6",
              },
              {
                type: "Mangrove",
                typeEn: "Mangrove",
                count: allProjects.filter((p) => p.projectType === "mangrove")
                  .length,
                color: "#06b6d4",
              },
              {
                type: "Agroforestri",
                typeEn: "Agroforestry",
                count: allProjects.filter(
                  (p) => p.projectType === "agroforestry",
                ).length,
                color: "#f59e0b",
              },
              {
                type: "Lainnya",
                typeEn: "Others",
                count: allProjects.filter((p) =>
                  ["renewable", "efficiency", "waste"].includes(p.projectType),
                ).length,
                color: "#8b5cf6",
              },
            ].map((item, idx) => {
              const percentage =
                allProjects.length > 0
                  ? (item.count / allProjects.length) * 100
                  : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      {language === "id" ? item.type : item.typeEn}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: theme.textPrimary }}
                    >
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: theme.border }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Water Summary */}
          <div
            className="p-4"
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: theme.textSecondary }}
            >
              {language === "id" ? "Ringkasan Air" : "Water Summary"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Total Estimasi" : "Total Estimated"}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {allProjects
                    .reduce((sum, p) => sum + p.waterData.estimatedCredits, 0)
                    .toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  m³
                </p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Total Terverifikasi" : "Total Verified"}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: theme.secondary }}
                >
                  {allProjects
                    .reduce((sum, p) => sum + p.waterData.verifiedCredits, 0)
                    .toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  m³
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Records & Project List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Blockchain Records */}
        <div
          className="rounded-xl"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div
            className="p-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <h2
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: theme.textPrimary }}
            >
              <Box className="w-5 h-5" style={{ color: theme.primary }} />
              {language === "id" ? "Riwayat Blockchain" : "Blockchain History"}
            </h2>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Live
            </span>
          </div>
          <div
            className="max-h-[400px] overflow-y-auto divide-y"
            style={{ borderColor: theme.border }}
          >
            {allBlockchainRecords.length === 0 ? (
              <div className="p-8 text-center">
                <Database
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: theme.textMuted }}
                />
                <p style={{ color: theme.textSecondary }}>
                  {language === "id"
                    ? "Belum ada catatan blockchain"
                    : "No blockchain records yet"}
                </p>
              </div>
            ) : (
              allBlockchainRecords.map((record, idx) => (
                <div
                  key={idx}
                  className="p-4"
                  style={{ borderColor: theme.border }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          record.action === "verified"
                            ? "bg-green-500/10 text-green-400"
                            : record.action === "credited"
                              ? "bg-blue-500/10 text-blue-400"
                              : record.action === "updated"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {record.action}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p
                    className="text-sm font-medium mb-1"
                    style={{ color: theme.textPrimary }}
                  >
                    {record.projectTitle}
                  </p>
                  <div className="flex items-center gap-2">
                    <code
                      className="text-[10px] px-2 py-1 rounded font-mono truncate flex-1"
                      style={{
                        backgroundColor: theme.bgDark,
                        color: theme.textMuted,
                      }}
                    >
                      {record.txHash}
                    </code>
                    <button
                      className="p-1 rounded hover:bg-white/5"
                      title="View on Explorer"
                    >
                      <ExternalLink
                        className="w-3.5 h-3.5"
                        style={{ color: theme.textMuted }}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project List */}
        <div
          className="rounded-xl"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div
            className="p-4"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <h2
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: theme.textPrimary }}
            >
              <Shield className="w-5 h-5" style={{ color: theme.primary }} />
              {language === "id" ? "Daftar Proyek" : "Project List"}
            </h2>
          </div>
          <div
            className="max-h-[400px] overflow-y-auto divide-y"
            style={{ borderColor: theme.border }}
          >
            {allProjects.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <p style={{ color: theme.textSecondary }}>
                  {language === "id" ? "Belum ada proyek" : "No projects yet"}
                </p>
              </div>
            ) : (
              allProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4"
                  style={{ borderColor: theme.border }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${theme.secondary}20` }}
                    >
                      <Droplets
                        className="w-6 h-6"
                        style={{ color: theme.secondary }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-medium truncate"
                        style={{ color: theme.textPrimary }}
                      >
                        {project.title}
                      </h4>
                      <p
                        className="text-sm flex items-center gap-1"
                        style={{ color: theme.textMuted }}
                      >
                        <MapPin className="w-3 h-3" />
                        {project.location.province} •{" "}
                        {project.areaHectares.toLocaleString()} Ha
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${verificationColors[project.verificationStatus].bg} ${verificationColors[project.verificationStatus].text}`}
                        >
                          {language === "id"
                            ? verificationColors[project.verificationStatus]
                                .label
                            : verificationColors[project.verificationStatus]
                                .labelEn}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: theme.textMuted }}
                        >
                          {project.waterData.estimatedCredits.toLocaleString()}{" "}
                          m³
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Verifications Table */}
      <div
        className="rounded-xl"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div
          className="p-4"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <h2
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: theme.textPrimary }}
          >
            <CheckCircle
              className="w-5 h-5"
              style={{ color: theme.secondary }}
            />
            {language === "id" ? "Verifikasi Terbaru" : "Recent Verifications"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                <th
                  className="text-left p-4 text-sm font-medium"
                  style={{ color: theme.textMuted }}
                >
                  {language === "id" ? "Proyek" : "Project"}
                </th>
                <th
                  className="text-left p-4 text-sm font-medium"
                  style={{ color: theme.textMuted }}
                >
                  {language === "id" ? "Tanggal" : "Date"}
                </th>
                <th
                  className="text-left p-4 text-sm font-medium"
                  style={{ color: theme.textMuted }}
                >
                  {language === "id" ? "Aksi" : "Action"}
                </th>
                <th
                  className="text-left p-4 text-sm font-medium"
                  style={{ color: theme.textMuted }}
                >
                  {language === "id" ? "Dilakukan Oleh" : "Performed By"}
                </th>
              </tr>
            </thead>
            <tbody style={{ borderColor: theme.border }}>
              {allProjects
                .flatMap((p) =>
                  (p.verificationHistory || []).map((v) => ({
                    ...v,
                    projectTitle: p.title,
                  })),
                )
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .slice(0, 10)
                .map((verification, idx) => (
                  <tr
                    key={idx}
                    className="border-t"
                    style={{ borderColor: theme.border }}
                  >
                    <td className="p-4">
                      <div
                        className="font-medium"
                        style={{ color: theme.textPrimary }}
                      >
                        {verification.projectTitle}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className="text-xs font-mono"
                        style={{ color: theme.textSecondary }}
                      >
                        {new Date(verification.date).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className="text-sm"
                        style={{ color: theme.textSecondary }}
                      >
                        {verification.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className="text-xs font-mono"
                        style={{ color: theme.textMuted }}
                      >
                        {verification.performedBy || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              {allProjects.flatMap((p) => p.verificationHistory || [])
                .length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center"
                    style={{ color: theme.textMuted }}
                  >
                    {language === "id"
                      ? "Belum ada riwayat verifikasi"
                      : "No verification history yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MRVDashboardPage;
