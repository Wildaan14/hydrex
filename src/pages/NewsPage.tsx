import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Calendar,
  User,
  Clock,
  TrendingUp,
  ExternalLink,
  Search,
  Filter,
  X,
  Eye,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowUpRight,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";
import { newsEduData } from "../data/newsEduData";

interface NewsItem {
  id: string;
  title: {
    id: string;
    en: string;
  };
  excerpt: {
    id: string;
    en: string;
  };
  category: {
    id: string;
    en: string;
  };
  author: string;
  date: string;
  readTime: {
    id: string;
    en: string;
  };
  featured: boolean;
  imageUrl: string;
  sourceUrl: string;
  sourceName: string;
  views?: number;
}

const rawNews = newsEduData["📰 News & Articles"] || [];

const newsItems: NewsItem[] = rawNews.map((item: any, index: number) => ({
  id: item["Article ID"] || String(index),
  title: {
    id: item["Title"],
    en: item["Title"],
  },
  excerpt: {
    id: item["Summary / Excerpt"],
    en: item["Summary / Excerpt"],
  },
  category: {
    id: item["Category"],
    en: item["Category"],
  },
  author: item["Author"] || "Editorial",
  date: item["Publish Date"] || new Date().toISOString().split("T")[0],
  readTime: {
    id: "3 menit",
    en: "3 min",
  },
  featured: index < 1, // Make the first one featured
  imageUrl: item["Cover Image URL"] || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
  sourceUrl: item["URL (Free Access)"] || "#",
  sourceName: item["Publisher / Source"] || "HydrEx",
  views: Math.floor(Math.random() * 1000) + 100,
}));

const categories = {
  id: ["Semua", "Kebijakan", "Proyek", "Industri", "Teknologi", "Konservasi"],
  en: ["All", "Policy", "Project", "Industry", "Technology", "Conservation"],
};

export const NewsPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const isAdmin = user?.role === "admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    language === "id" ? "Semua" : "All",
  );

  useEffect(() => {
    setSelectedCategory(language === "id" ? "Semua" : "All");
  }, [language]);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    titleId: "",
    titleEn: "",
    excerptId: "",
    excerptEn: "",
    category: "Kebijakan",
    author: "",
    sourceUrl: "",
    sourceName: "",
    imageUrl: "",
  });
  const [localNews, setLocalNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("hydrex-news-v1");
    let initialNews = [...newsItems];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Avoid duplicates if they exist in both
        const storedIds = new Set(parsed.map((n: NewsItem) => n.id));
        initialNews = [...parsed, ...newsItems.filter(n => !storedIds.has(n.id))];
      } catch (e) {
        console.error("Failed to parse news", e);
      }
    }
    setLocalNews(initialNews);
  }, []);

  const toggleSaveArticle = (id: string) => {
    setSavedArticles((prev) =>
      prev.includes(id)
        ? prev.filter((articleId) => articleId !== id)
        : [...prev, id],
    );
  };

  const handleUploadNews = () => {
    const newItem: NewsItem = {
      id: String(Date.now()),
      title: {
        id: uploadForm.titleId,
        en: uploadForm.titleEn || uploadForm.titleId,
      },
      excerpt: {
        id: uploadForm.excerptId,
        en: uploadForm.excerptEn || uploadForm.excerptId,
      },
      category: { id: uploadForm.category, en: uploadForm.category },
      author: uploadForm.author,
      date: new Date().toISOString().split("T")[0],
      readTime: { id: "3 menit", en: "3 min" },
      featured: false,
      imageUrl:
        uploadForm.imageUrl ||
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
      sourceUrl: uploadForm.sourceUrl,
      sourceName: uploadForm.sourceName,
      views: 0,
    };
    setLocalNews((prev) => [newItem, ...prev]);
    setShowUploadModal(false);
    setUploadForm({
      titleId: "",
      titleEn: "",
      excerptId: "",
      excerptEn: "",
      category: "Kebijakan",
      author: "",
      sourceUrl: "",
      sourceName: "",
      imageUrl: "",
    });
  };

  const handleDeleteNews = (id: string) => {
    setLocalNews((prev) => prev.filter((n) => n.id !== id));
    setSavedArticles((prev) => prev.filter((articleId) => articleId !== id));
  };

  const filteredNews = localNews.filter((news) => {
    const matchesSearch =
      news.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.excerpt[language].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === (language === "id" ? "Semua" : "All") ||
      news.category[language] === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews.filter((n) => n.featured);
  const regularNews = filteredNews.filter((n) => !n.featured);

  const openArticle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareArticle = async (news: NewsItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title[language],
          text: news.excerpt[language],
          url: news.sourceUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  const t = {
    title: language === "id" ? "Berita & Artikel" : "News & Articles",
    subtitle:
      language === "id"
        ? "Informasi terbaru seputar pasar air dan keberlanjutan"
        : "Latest information about water market and sustainability",
    articles: language === "id" ? "Artikel" : "Articles",
    filter: language === "id" ? "Filter" : "Filter",
    readMore: language === "id" ? "Baca di" : "Read on",
    noNews: language === "id" ? "Tidak ada berita ditemukan" : "No news found",
    tryAgain:
      language === "id"
        ? "Coba ubah kata kunci pencarian atau filter kategori"
        : "Try changing search keywords or category filter",
    saved: language === "id" ? "Artikel Tersimpan" : "Saved Articles",
  };

  return (
    <div
      className="min-h-screen p-6 space-y-6"
      style={{ backgroundColor: theme.bgDark }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold flex items-center gap-3"
              style={{ color: theme.textPrimary }}
            >
              <Newspaper className="w-8 h-8" style={{ color: theme.primary }} />
              {t.title}
            </h1>
            <p className="mt-2" style={{ color: theme.textSecondary }}>
              {t.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadModal(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm text-white"
                style={{ backgroundColor: theme.secondary }}
              >
                <Plus className="w-4 h-4" />
                {language === "id" ? "Upload Berita" : "Upload News"}
              </motion.button>
            )}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            >
              <TrendingUp
                className="w-5 h-5"
                style={{ color: theme.secondary }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: theme.textPrimary }}
              >
                {localNews.length} {t.articles}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 rounded-xl outline-none transition-all"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" style={{ color: theme.textMuted }} />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all"
            style={{
              backgroundColor: showFilters ? theme.primary : theme.bgCard,
              border: `1px solid ${showFilters ? theme.primary : theme.border}`,
              color: showFilters ? theme.textPrimary : theme.textSecondary,
            }}
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">{t.filter}</span>
          </button>
        </div>

        {/* Category Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2"
            >
              {categories[language].map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor:
                      selectedCategory === category
                        ? theme.primary
                        : theme.bgCard,
                    border: `1px solid ${
                      selectedCategory === category
                        ? theme.primary
                        : theme.border
                    }`,
                    color:
                      selectedCategory === category
                        ? theme.textPrimary
                        : theme.textSecondary,
                  }}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Featured Article */}
      <AnimatePresence>
        {featuredNews.map((news) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative rounded-3xl overflow-hidden group cursor-pointer"
            onClick={() => openArticle(news.sourceUrl)}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={news.imageUrl}
                alt={news.title[language]}
                className="w-full h-full object-cover"
              />
              {/* Dark Gradient Overlay - Extra Dark */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.95) 100%)",
                }}
              />
              {/* Blue-Green Gradient Overlay */}
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}DD, ${theme.secondary}DD)`,
                }}
              />
            </div>

            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 bg-white/30 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                  ⭐ {news.category[language]}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveArticle(news.id);
                    }}
                    className="p-2 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
                  >
                    {savedArticles.includes(news.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-white" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareArticle(news);
                    }}
                    className="p-2 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNews(news.id);
                      }}
                      className="p-2 rounded-lg bg-red-500/60 backdrop-blur-sm hover:bg-red-600/80 transition-all"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">
                {news.title[language]}
              </h2>
              <p className="text-white text-lg mb-6 leading-relaxed">
                {news.excerpt[language]}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-white">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {news.author}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(news.date).toLocaleDateString(
                      language === "id" ? "id-ID" : "en-US",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {news.readTime[language]}
                  </span>
                  {news.views && (
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {news.views.toLocaleString()} views
                    </span>
                  )}
                </div>

                <motion.button
                  whileHover={{ gap: "12px" }}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  {t.readMore} {news.sourceName}
                  <ExternalLink className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* News Grid */}
      {regularNews.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
              onClick={() => openArticle(news.sourceUrl)}
            >
              {/* Image with Overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={news.imageUrl}
                  alt={news.title[language]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Dark Overlay for Better Text Readability */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
                  }}
                />
                {/* Category Badge on Image */}
                <div className="absolute top-3 left-3">
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm"
                    style={{
                      backgroundColor: `${theme.primary}CC`,
                      color: "white",
                    }}
                  >
                    {news.category[language]}
                  </span>
                </div>
                {/* Save & Delete Buttons on Image */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveArticle(news.id);
                    }}
                    className="p-2 rounded-lg bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
                  >
                    {savedArticles.includes(news.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-white" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-white" />
                    )}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNews(news.id);
                      }}
                      className="p-2 rounded-lg bg-red-500/70 backdrop-blur-sm hover:bg-red-600/90 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3
                  className="font-bold text-lg mb-3 leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors"
                  style={{ color: theme.textPrimary }}
                >
                  {news.title[language]}
                </h3>

                {/* Excerpt */}
                <p
                  className="text-sm mb-4 line-clamp-3 leading-relaxed"
                  style={{ color: theme.textSecondary }}
                >
                  {news.excerpt[language]}
                </p>

                {/* Footer */}
                <div
                  className="flex items-center justify-between text-xs pt-4"
                  style={{ borderTop: `1px solid ${theme.border}` }}
                >
                  <div className="space-y-1">
                    <div
                      className="flex items-center gap-2"
                      style={{ color: theme.textMuted }}
                    >
                      <Calendar className="w-3 h-3" />
                      {new Date(news.date).toLocaleDateString(
                        language === "id" ? "id-ID" : "en-US",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}
                    </div>
                    <div
                      className="flex items-center gap-2"
                      style={{ color: theme.textMuted }}
                    >
                      <Clock className="w-3 h-3" />
                      {news.readTime[language]}
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <ArrowUpRight
                      className="w-5 h-5"
                      style={{ color: theme.primary }}
                    />
                  </motion.div>
                </div>

                {/* Source */}
                <div className="mt-3 flex items-center gap-2">
                  <ExternalLink
                    className="w-3 h-3"
                    style={{ color: theme.textMuted }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.textMuted }}
                  >
                    {news.sourceName}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-14 text-center"
          style={{ border: `2px dashed ${theme.border}` }}
        >
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}10)`,
              border: `1px solid ${theme.primary}20`,
            }}
          >
            <Newspaper className="w-9 h-9" style={{ color: theme.primary }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
            {language === "id" ? "Belum Ada Berita" : "No Articles Yet"}
          </h3>
          <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: theme.textSecondary }}>
            {language === "id"
              ? "Berita dan artikel terbaru seputar water credit akan muncul di sini."
              : "Latest news and articles about water credits will appear here."}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
              {language === "id" ? "Upload Berita" : "Upload Article"}
            </button>
          )}
        </motion.div>
      )}

      {/* Saved Articles Section */}
      {savedArticles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <BookmarkCheck
              className="w-6 h-6"
              style={{ color: theme.secondary }}
            />
            <h2
              className="text-2xl font-bold"
              style={{ color: theme.textPrimary }}
            >
              {t.saved} ({savedArticles.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {savedArticles.map((articleId) => {
              const article = localNews.find((n) => n.id === articleId);
              if (!article) return null;
              return (
                <motion.button
                  key={articleId}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => openArticle(article.sourceUrl)}
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                  }}
                >
                  {article.title[language].substring(0, 40)}...
                  <ExternalLink
                    className="w-4 h-4"
                    style={{ color: theme.primary }}
                  />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

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
                <div className="flex items-center justify-between">
                  <h2
                    className="text-xl font-bold flex items-center gap-2"
                    style={{ color: theme.textPrimary }}
                  >
                    <Upload
                      className="w-5 h-5"
                      style={{ color: theme.secondary }}
                    />
                    {language === "id"
                      ? "Upload Berita Baru"
                      : "Upload New Article"}
                  </h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-1 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" style={{ color: theme.textMuted }} />
                  </button>
                </div>

                {[
                  {
                    label:
                      language === "id"
                        ? "Judul (Indonesia)"
                        : "Title (Indonesian)",
                    key: "titleId",
                    required: true,
                  },
                  {
                    label:
                      language === "id" ? "Judul (English)" : "Title (English)",
                    key: "titleEn",
                  },
                  {
                    label:
                      language === "id"
                        ? "Ringkasan (Indonesia)"
                        : "Excerpt (Indonesian)",
                    key: "excerptId",
                    required: true,
                    multiline: true,
                  },
                  {
                    label:
                      language === "id"
                        ? "Ringkasan (English)"
                        : "Excerpt (English)",
                    key: "excerptEn",
                    multiline: true,
                  },
                  {
                    label:
                      language === "id"
                        ? "Penulis / Sumber"
                        : "Author / Source",
                    key: "author",
                    required: true,
                  },
                  {
                    label: language === "id" ? "Nama Sumber" : "Source Name",
                    key: "sourceName",
                    required: true,
                  },
                  { label: "URL Artikel", key: "sourceUrl", required: true },
                  {
                    label:
                      language === "id"
                        ? "URL Gambar (opsional)"
                        : "Image URL (optional)",
                    key: "imageUrl",
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
                        rows={3}
                        value={(uploadForm as any)[key]}
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
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
                          setUploadForm((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
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

                <div>
                  <label
                    className="block text-sm mb-1 font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    {language === "id" ? "Kategori" : "Category"}
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none text-sm"
                    style={{
                      backgroundColor: theme.bgDark,
                      border: `1px solid ${theme.border}`,
                      color: theme.textPrimary,
                    }}
                  >
                    {[
                      "Kebijakan",
                      "Proyek",
                      "Industri",
                      "Teknologi",
                      "Konservasi",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

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
                    onClick={handleUploadNews}
                    disabled={
                      !uploadForm.titleId ||
                      !uploadForm.excerptId ||
                      !uploadForm.author ||
                      !uploadForm.sourceName ||
                      !uploadForm.sourceUrl
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

export default NewsPage;
