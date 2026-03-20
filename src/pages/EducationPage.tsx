import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Video,
  Play,
  X,
  Clock,
  Sparkles,
  Youtube,
  FileText,
  GraduationCap,
  TrendingUp,
  Award,
  Lightbulb,
  Target,
  Users,
  Globe,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

interface EducationResource {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  type: "article" | "video";
  category: "basics" | "advanced" | "practical" | "policy";
  duration?: string;
  thumbnail: string;
  url: string;
  source: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

const initialResources: EducationResource[] = [];

const categoryConfig = {
  all: {
    label: "Semua",
    labelEn: "All",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: <Globe className="w-4 h-4" />,
  },
  basics: {
    label: "Dasar",
    labelEn: "Basics",
    color: "text-green-400",
    bg: "bg-green-500/10",
    icon: <BookOpen className="w-4 h-4" />,
  },
  practical: {
    label: "Praktis",
    labelEn: "Practical",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    icon: <Lightbulb className="w-4 h-4" />,
  },
  advanced: {
    label: "Lanjutan",
    labelEn: "Advanced",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  policy: {
    label: "Kebijakan",
    labelEn: "Policy",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    icon: <Award className="w-4 h-4" />,
  },
};

const getCategoryConfig = (cat: string | undefined) => {
  if (!cat) return categoryConfig.basics;
  return categoryConfig[cat as keyof typeof categoryConfig] || categoryConfig.basics;
};

export const EducationPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const isAdmin = user?.role === "admin";

  const [localResources, setLocalResources] = useState<EducationResource[]>([]);

  React.useEffect(() => {
    const stored = localStorage.getItem("hydrex-education-v1");
    if (stored) {
      try {
        setLocalResources(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse education resources", e);
      }
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    titleId: "",
    titleEn: "",
    descriptionId: "",
    descriptionEn: "",
    type: "article" as "article" | "video",
    category: "basics" as EducationResource["category"],
    url: "",
    source: "",
    thumbnail: "",
    duration: "",
    isFeatured: false,
  });

  const handleDeleteResource = (id: string) => {
    setLocalResources((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUploadResource = () => {
    const newItem: EducationResource = {
      id: `edu-${Date.now()}`,
      title: uploadForm.titleId,
      titleEn: uploadForm.titleEn || uploadForm.titleId,
      description: uploadForm.descriptionId,
      descriptionEn: uploadForm.descriptionEn || uploadForm.descriptionId,
      type: uploadForm.type,
      category: uploadForm.category,
      url: uploadForm.url,
      source: uploadForm.source,
      thumbnail:
        uploadForm.thumbnail ||
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600",
      duration: uploadForm.duration || undefined,
      isFeatured: uploadForm.isFeatured,
      isNew: true,
    };
    setLocalResources((prev) => [newItem, ...prev]);
    setShowUploadModal(false);
    setUploadForm({
      titleId: "",
      titleEn: "",
      descriptionId: "",
      descriptionEn: "",
      type: "article",
      category: "basics",
      url: "",
      source: "",
      thumbnail: "",
      duration: "",
      isFeatured: false,
    });
  };

  const openResource = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const filteredResources = localResources.filter((resource) => {
    const title = language === "id" ? resource.title : resource.titleEn;
    const description =
      language === "id" ? resource.description : resource.descriptionEn;
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || resource.category === filterCategory;
    const matchesType = filterType === "all" || resource.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredResources = localResources.filter((r) => r.isFeatured);
  const totalArticles = localResources.filter((r) => r.type === "article").length;
  const totalVideos = localResources.filter((r) => r.type === "video").length;
  const newResources = localResources.filter((r) => r.isNew).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold mb-2 flex items-center gap-3"
            style={{ color: theme.textPrimary }}
          >
            <GraduationCap className="w-8 h-8" style={{ color: theme.primary }} />
            {language === "id" ? "Pusat Edukasi Air" : "Water Education Center"}
          </h1>
          <p style={{ color: theme.textSecondary }}>
            {language === "id"
              ? "Pelajari tentang perubahan iklim, perdagangan air, dan keberlanjutan"
              : "Learn about climate change, water trading, and sustainability"}
          </p>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          {/* Upload Button - Admin Only */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm text-white"
              style={{ backgroundColor: theme.secondary }}
            >
              <Plus className="w-4 h-4" />
              {language === "id" ? "Upload Materi" : "Upload Resource"}
            </motion.button>
          )}

          {/* Stats Summary */}
          <div
            className="px-4 py-2 rounded-xl"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p className="text-xs" style={{ color: theme.textMuted }}>
              {language === "id" ? "Artikel" : "Articles"}
            </p>
            <p className="text-xl font-bold" style={{ color: theme.primary }}>
              {totalArticles}
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p className="text-xs" style={{ color: theme.textMuted }}>
              {language === "id" ? "Video" : "Videos"}
            </p>
            <p className="text-xl font-bold" style={{ color: theme.secondary }}>
              {totalVideos}
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p className="text-xs" style={{ color: theme.textMuted }}>
              {language === "id" ? "Baru" : "New"}
            </p>
            <p className="text-xl font-bold text-green-400">{newResources}</p>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {featuredResources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: theme.primary }} />
            <h3 className="text-xl font-semibold" style={{ color: theme.textPrimary }}>
              {language === "id" ? "✨ Rekomendasi Pilihan" : "✨ Featured Content"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                onClick={() => openResource(resource.url)}
                className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer relative"
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={resource.thumbnail}
                    alt={language === "id" ? resource.title : resource.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  {resource.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-red-500/80 group-hover:scale-110 transition-all">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${getCategoryConfig(resource.category).bg} ${getCategoryConfig(resource.category).color} backdrop-blur-md border border-white/20`}
                    >
                      {language === "id"
                        ? getCategoryConfig(resource.category).label
                        : getCategoryConfig(resource.category).labelEn}
                    </span>
                  </div>
                  {/* Type icon + Delete button */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    {resource.type === "video" ? (
                      <Youtube className="w-6 h-6 text-red-500 drop-shadow-lg" />
                    ) : (
                      <FileText className="w-6 h-6 text-white drop-shadow-lg" />
                    )}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResource(resource.id);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/70 backdrop-blur-sm hover:bg-red-600/90 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h4
                    className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors"
                    style={{ color: theme.textPrimary }}
                  >
                    {language === "id" ? resource.title : resource.titleEn}
                  </h4>
                  <p
                    className="text-sm mb-4 line-clamp-2"
                    style={{ color: theme.textSecondary }}
                  >
                    {language === "id" ? resource.description : resource.descriptionEn}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: theme.primary }}>
                      {resource.source}
                    </span>
                    {resource.duration && (
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        <Clock className="w-3 h-3" />
                        {resource.duration}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="space-y-4">
          {/* Search - no icon, px-6 padding */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === "id"
                ? "Cari materi edukasi..."
                : "Search education materials..."
            }
            className="w-full px-6 py-3 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: theme.bgDark,
              border: `1px solid ${theme.border}`,
            }}
          />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <div className="flex-1">
              <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>
                {language === "id" ? "Kategori" : "Category"}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilterCategory(key)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      filterCategory === key ? "ring-2 ring-blue-500 shadow-lg" : ""
                    }`}
                    style={{
                      backgroundColor:
                        filterCategory === key ? theme.primary : theme.bgDark,
                      color: filterCategory === key ? "#fff" : theme.textSecondary,
                    }}
                  >
                    {config.icon}
                    {language === "id" ? config.label : config.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>
                {language === "id" ? "Tipe" : "Type"}
              </p>
              <div className="flex gap-2">
                {[
                  { key: "all", labelId: "Semua", labelEn: "All", icon: null },
                  {
                    key: "article",
                    labelId: "Artikel",
                    labelEn: "Articles",
                    icon: <FileText className="w-4 h-4" />,
                  },
                  {
                    key: "video",
                    labelId: "Video",
                    labelEn: "Videos",
                    icon: <Video className="w-4 h-4" />,
                  },
                ].map(({ key, labelId, labelEn, icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilterType(key)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      filterType === key ? "ring-2 ring-blue-500" : ""
                    }`}
                    style={{
                      backgroundColor: filterType === key ? theme.primary : theme.bgDark,
                      color: filterType === key ? "#fff" : theme.textSecondary,
                    }}
                  >
                    {icon}
                    {language === "id" ? labelId : labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Resources Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" style={{ color: theme.textPrimary }}>
            {language === "id" ? "📚 Semua Materi" : "📚 All Resources"}
          </h3>
          <span
            className="text-sm px-3 py-1 rounded-lg"
            style={{ backgroundColor: theme.bgDark, color: theme.textMuted }}
          >
            {filteredResources.length}{" "}
            {language === "id" ? "materi" : "resources"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.03, y: -5 }}
                onClick={() => openResource(resource.url)}
                className="group rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer relative"
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={resource.thumbnail}
                    alt={language === "id" ? resource.title : resource.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {resource.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-red-500/80 transition-all">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryConfig(resource.category).bg} ${getCategoryConfig(resource.category).color} backdrop-blur-md`}
                    >
                      {language === "id"
                        ? getCategoryConfig(resource.category).label
                        : getCategoryConfig(resource.category).labelEn}
                    </span>
                    {resource.isNew && (
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 backdrop-blur-md">
                        {language === "id" ? "Baru" : "New"}
                      </span>
                    )}
                  </div>
                  {/* Type icon + Delete button */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {resource.type === "video" ? (
                      <Youtube className="w-5 h-5 text-red-500 drop-shadow-lg" />
                    ) : (
                      <FileText className="w-5 h-5 text-white drop-shadow-lg" />
                    )}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResource(resource.id);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/70 backdrop-blur-sm hover:bg-red-600/90 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4
                    className="font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors"
                    style={{ color: theme.textPrimary }}
                  >
                    {language === "id" ? resource.title : resource.titleEn}
                  </h4>
                  <p
                    className="text-xs mb-3 line-clamp-2"
                    style={{ color: theme.textMuted }}
                  >
                    {language === "id" ? resource.description : resource.descriptionEn}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: theme.textSecondary }}>{resource.source}</span>
                    {resource.duration && (
                      <span
                        className="flex items-center gap-1"
                        style={{ color: theme.textMuted }}
                      >
                        <Clock className="w-3 h-3" />
                        {resource.duration}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen
              className="w-20 h-20 mx-auto mb-4"
              style={{ color: theme.textMuted }}
            />
            <p className="text-xl font-semibold mb-2" style={{ color: theme.textPrimary }}>
              {language === "id" ? "Tidak ada hasil" : "No results found"}
            </p>
            <p style={{ color: theme.textMuted }}>
              {language === "id"
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Try changing filters or search keywords"}
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`,
          border: `1px solid ${theme.border}`,
        }}
      >
        <Target className="w-12 h-12 mx-auto mb-4" style={{ color: theme.primary }} />
        <h3 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>
          {language === "id"
            ? "Mulai Perjalanan Belajar Anda"
            : "Start Your Learning Journey"}
        </h3>
        <p className="mb-6" style={{ color: theme.textSecondary }}>
          {language === "id"
            ? "Bergabunglah dengan ribuan individu dan perusahaan yang berkomitmen untuk masa depan yang lebih berkelanjutan"
            : "Join thousands of individuals and companies committed to a more sustainable future"}
        </p>
        <div className="flex items-center justify-center gap-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ backgroundColor: theme.bgDark }}
          >
            <Users className="w-5 h-5" style={{ color: theme.primary }} />
            <span style={{ color: theme.textPrimary }}>5,000+ Learners</span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ backgroundColor: theme.bgDark }}
          >
            <Award className="w-5 h-5" style={{ color: theme.secondary }} />
            <span style={{ color: theme.textPrimary }}>Expert Content</span>
          </div>
        </div>
      </motion.div>

      {/* Admin Upload Modal */}
      <AnimatePresence>
        {showUploadModal && isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUploadModal(false);
            }}
          >
            <div className="flex min-h-full items-center justify-center p-4 py-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-lg rounded-2xl p-6 space-y-4"
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between">
                  <h2
                    className="text-xl font-bold flex items-center gap-2"
                    style={{ color: theme.textPrimary }}
                  >
                    <Upload className="w-5 h-5" style={{ color: theme.secondary }} />
                    {language === "id" ? "Upload Materi Baru" : "Upload New Resource"}
                  </h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-1 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" style={{ color: theme.textMuted }} />
                  </button>
                </div>

                {/* Form Fields */}
                {[
                  {
                    label: language === "id" ? "Judul (Indonesia)" : "Title (Indonesian)",
                    key: "titleId",
                    required: true,
                  },
                  {
                    label: language === "id" ? "Judul (English)" : "Title (English)",
                    key: "titleEn",
                  },
                  {
                    label: language === "id" ? "Deskripsi (Indonesia)" : "Description (Indonesian)",
                    key: "descriptionId",
                    required: true,
                    multiline: true,
                  },
                  {
                    label: language === "id" ? "Deskripsi (English)" : "Description (English)",
                    key: "descriptionEn",
                    multiline: true,
                  },
                  {
                    label: language === "id" ? "Sumber" : "Source",
                    key: "source",
                    required: true,
                  },
                  { label: "URL", key: "url", required: true },
                  {
                    label: language === "id" ? "URL Thumbnail (opsional)" : "Thumbnail URL (optional)",
                    key: "thumbnail",
                  },
                  {
                    label: language === "id" ? "Durasi (opsional, cth: 10 menit)" : "Duration (optional, e.g.: 10 min)",
                    key: "duration",
                  },
                ].map(({ label, key, required, multiline }) => (
                  <div key={key}>
                    <label
                      className="block text-sm mb-1 font-medium"
                      style={{ color: theme.textSecondary }}
                    >
                      {label}
                      {required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {multiline ? (
                      <textarea
                        rows={2}
                        value={(uploadForm as any)[key]}
                        onChange={(e) =>
                          setUploadForm((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl outline-none resize-none text-sm"
                        style={{
                          backgroundColor: theme.bgDark,
                          border: `1px solid ${theme.border}`,
                          color: theme.textPrimary,
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={(uploadForm as any)[key]}
                        onChange={(e) =>
                          setUploadForm((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl outline-none text-sm"
                        style={{
                          backgroundColor: theme.bgDark,
                          border: `1px solid ${theme.border}`,
                          color: theme.textPrimary,
                        }}
                      />
                    )}
                  </div>
                ))}

                {/* Type */}
                <div>
                  <label className="block text-sm mb-1 font-medium" style={{ color: theme.textSecondary }}>
                    {language === "id" ? "Tipe" : "Type"}
                  </label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        type: e.target.value as "article" | "video",
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none text-sm"
                    style={{
                      backgroundColor: theme.bgDark,
                      border: `1px solid ${theme.border}`,
                      color: theme.textPrimary,
                    }}
                  >
                    <option value="article">{language === "id" ? "Artikel" : "Article"}</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm mb-1 font-medium" style={{ color: theme.textSecondary }}>
                    {language === "id" ? "Kategori" : "Category"}
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        category: e.target.value as EducationResource["category"],
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none text-sm"
                    style={{
                      backgroundColor: theme.bgDark,
                      border: `1px solid ${theme.border}`,
                      color: theme.textPrimary,
                    }}
                  >
                    <option value="basics">{language === "id" ? "Dasar" : "Basics"}</option>
                    <option value="practical">{language === "id" ? "Praktis" : "Practical"}</option>
                    <option value="advanced">{language === "id" ? "Lanjutan" : "Advanced"}</option>
                    <option value="policy">{language === "id" ? "Kebijakan" : "Policy"}</option>
                  </select>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={uploadForm.isFeatured}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, isFeatured: e.target.checked }))
                    }
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  <label htmlFor="isFeatured" className="text-sm" style={{ color: theme.textSecondary }}>
                    {language === "id" ? "Tampilkan di Rekomendasi Pilihan" : "Show in Featured Content"}
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 py-2 rounded-xl font-medium text-sm"
                    style={{
                      backgroundColor: theme.bgDark,
                      border: `1px solid ${theme.border}`,
                      color: theme.textSecondary,
                    }}
                  >
                    {language === "id" ? "Batal" : "Cancel"}
                  </button>
                  <button
                    onClick={handleUploadResource}
                    disabled={
                      !uploadForm.titleId ||
                      !uploadForm.descriptionId ||
                      !uploadForm.source ||
                      !uploadForm.url
                    }
                    className="flex-1 py-2 rounded-xl font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: theme.secondary }}
                  >
                    {language === "id" ? "Publikasikan" : "Publish"}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EducationPage;
