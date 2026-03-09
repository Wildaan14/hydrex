import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Plus,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  User,
  Tag,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Megaphone,
  X,
  Send,
  Image as ImageIcon,
  Paperclip,
  ThumbsUp,
  Reply,
  Pin,
  Share2,
  Bookmark,
  CheckCircle,
  ArrowUp,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

// Types
interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  createdAt: string;
  isPinned?: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: "image" | "file";
  size: string;
  url: string;
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  likes: number;
  createdAt: string;
  isLiked?: boolean;
  isBestAnswer?: boolean;
  attachments?: Attachment[];
}

interface Category {
  id: string;
  nameId: string;
  nameEn: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

// Categories dengan warna HYDREX
const categories: Category[] = [
  { id: "all", nameId: "Semua", nameEn: "All", icon: <MessageSquare className="w-4 h-4" />, color: "#10b981", count: 128 },
  { id: "discussion", nameId: "Diskusi Umum", nameEn: "General Discussion", icon: <MessageCircle className="w-4 h-4" />, color: "#10b981", count: 45 },
  { id: "question", nameId: "Pertanyaan", nameEn: "Questions", icon: <HelpCircle className="w-4 h-4" />, color: "#fbbf24", count: 32 },
  { id: "suggestion", nameId: "Saran", nameEn: "Suggestions", icon: <Lightbulb className="w-4 h-4" />, color: "#1f6feb", count: 18 },
  { id: "announcement", nameId: "Pengumuman", nameEn: "Announcements", icon: <Megaphone className="w-4 h-4" />, color: "#ef4444", count: 8 },
  { id: "guide", nameId: "Panduan", nameEn: "Guides", icon: <BookOpen className="w-4 h-4" />, color: "#a855f7", count: 15 },
  { id: "trending", nameId: "Trending", nameEn: "Trending", icon: <TrendingUp className="w-4 h-4" />, color: "#ec4899", count: 10 },
];

// Sample Posts
const samplePosts: ForumPost[] = [
  {
    id: "1",
    title: "Bagaimana cara menghitung water footprint untuk industri manufaktur?",
    content: "Saya sedang mencoba menghitung water footprint untuk pabrik tekstil kami. Apa saja faktor yang perlu dipertimbangkan dan apakah ada panduan khusus untuk industri tekstil di Indonesia?",
    author: { name: "Ahmad Rizky", avatar: "A", role: "Company" },
    category: "question",
    tags: ["water footprint", "manufaktur", "tekstil"],
    likes: 24,
    replies: 8,
    views: 156,
    createdAt: "2 jam lalu",
    isPinned: true,
  },
  {
    id: "2",
    title: "[Pengumuman] Update Fitur Kalkulator Air v2.0",
    content: "Kami dengan bangga mengumumkan peluncuran Kalkulator Air versi 2.0 dengan fitur peta interaktif dan metodologi IPCC 2019!",
    author: { name: "HYDREX Team", avatar: "C", role: "Admin" },
    category: "announcement",
    tags: ["update", "kalkulator", "fitur baru"],
    likes: 89,
    replies: 23,
    views: 542,
    createdAt: "1 hari lalu",
    isPinned: true,
  },
  {
    id: "3",
    title: "Saran: Tambahkan fitur export laporan ke PDF",
    content: "Akan sangat membantu jika ada fitur untuk export laporan konsumsi dan water stock ke format PDF yang bisa langsung digunakan untuk pelaporan ke stakeholder.",
    author: { name: "Sarah Dewi", avatar: "S", role: "Individual" },
    category: "suggestion",
    tags: ["saran", "fitur", "pdf", "laporan"],
    likes: 45,
    replies: 12,
    views: 234,
    createdAt: "3 hari lalu",
    isLiked: true,
  },
  {
    id: "4",
    title: "Panduan Lengkap: Memulai Trading Water Credit di HYDREX",
    content: "Panduan step-by-step untuk memulai jual beli water credit di marketplace HYDREX. Cocok untuk pemula yang baru mengenal water trading.",
    author: { name: "Budi Santoso", avatar: "B", role: "Verified Expert" },
    category: "guide",
    tags: ["panduan", "trading", "pemula", "marketplace"],
    likes: 112,
    replies: 34,
    views: 1205,
    createdAt: "1 minggu lalu",
  },
];

const sampleReplies: ForumReply[] = [
  {
    id: "r1",
    postId: "1",
    content: "Untuk industri tekstil, faktor utama yang perlu dihitung meliputi: 1) Konsumsi energi listrik untuk mesin produksi, 2) Penggunaan bahan bakar untuk boiler, 3) Konsumsi dari proses pewarnaan, 4) Transportasi bahan baku dan produk jadi. Saya sarankan menggunakan metodologi GHG Protocol untuk perhitungan yang lebih akurat.",
    author: { name: "Dr. Eko Prasetyo", avatar: "E", role: "Verified Expert" },
    likes: 18,
    createdAt: "1 jam lalu",
    isBestAnswer: true,
  },
  {
    id: "r2",
    postId: "1",
    content: "Setuju dengan Dr. Eko. Tambahan, jangan lupa menghitung scope 3 consumption juga, terutama dari supply chain dan penggunaan produk oleh konsumen.",
    author: { name: "Linda Wijaya", avatar: "L", role: "Company" },
    likes: 8,
    createdAt: "45 menit lalu",
  },
];

// Main Component
export const ForumPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [posts, setPosts] = useState(samplePosts);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "unanswered">("latest");

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (sortBy === "popular") return b.likes - a.likes;
    if (sortBy === "unanswered") return a.replies - b.replies;
    return 0;
  });

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 };
      }
      return post;
    }));
  };

  const handleSavePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, isSaved: !post.isSaved };
      }
      return post;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: theme.textPrimary }}>
            <MessageSquare className="w-8 h-8" style={{ color: theme.primary }} />
            {language === "id" ? "Forum Diskusi" : "Discussion Forum"}
          </h1>
          <p style={{ color: theme.textSecondary }}>
            {language === "id" 
              ? "Diskusikan dan bagikan pengetahuan dengan komunitas HYDREX" 
              : "Discuss and share knowledge with the HYDREX community"}
          </p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 hover:shadow-lg transition-all"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          }}
        >
          <Plus className="w-5 h-5" />
          {language === "id" ? "Buat Postingan" : "New Post"}
        </button>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: theme.textMuted }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder=""
            className="w-full pl-16 pr-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              color: theme.textPrimary,
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("latest")}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              sortBy === "latest" ? "ring-2 ring-blue-500" : ""
            }`}
            style={{
              backgroundColor: sortBy === "latest" ? theme.primary : theme.bgCard,
              color: sortBy === "latest" ? "#fff" : theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            {language === "id" ? "Terbaru" : "Latest"}
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              sortBy === "popular" ? "ring-2 ring-blue-500" : ""
            }`}
            style={{
              backgroundColor: sortBy === "popular" ? theme.primary : theme.bgCard,
              color: sortBy === "popular" ? "#fff" : theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            {language === "id" ? "Populer" : "Popular"}
          </button>
          <button
            onClick={() => setSortBy("unanswered")}
            className={`px-4 py-3 rounded-xl font-medium transition-all ${
              sortBy === "unanswered" ? "ring-2 ring-blue-500" : ""
            }`}
            style={{
              backgroundColor: sortBy === "unanswered" ? theme.primary : theme.bgCard,
              color: sortBy === "unanswered" ? "#fff" : theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            {language === "id" ? "Belum Terjawab" : "Unanswered"}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="overflow-x-auto mt-4 mb-6">
        <div className="flex gap-3 pb-2">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isActive ? "ring-2 shadow-lg" : ""
                }`}
                style={{
                  backgroundColor: isActive ? category.color : theme.bgCard,
                  color: isActive ? "#fff" : theme.textSecondary,
                  border: `1px solid ${isActive ? category.color : theme.border}`,
                  ...(isActive && { boxShadow: `0 0 0 2px ${category.color}` }),
                }}
              >
                <span style={{ color: isActive ? "#fff" : category.color }}>
                  {category.icon}
                </span>
                <span>{language === "id" ? category.nameId : category.nameEn}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                  }}
                >
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
              onClick={() => setSelectedPost(post)}
            >
              {/* Post Header */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}30, ${theme.secondary}30)`,
                    color: theme.primary,
                  }}
                >
                  {post.author.avatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Author & Time */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold" style={{ color: theme.textPrimary }}>
                      {post.author.name}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: post.author.role === "Admin" ? "rgba(239, 68, 68, 0.1)" : "rgba(30, 136, 229, 0.1)",
                        color: post.author.role === "Admin" ? "#ef4444" : theme.primary,
                      }}
                    >
                      {post.author.role}
                    </span>
                    <span className="text-sm" style={{ color: theme.textMuted }}>
                      • {post.createdAt}
                    </span>
                    {post.isPinned && (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: theme.secondary }}>
                        <Pin className="w-3 h-3" />
                        {language === "id" ? "Disematkan" : "Pinned"}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg font-bold mb-2 hover:text-blue-400 transition-colors"
                    style={{ color: theme.textPrimary }}
                  >
                    {post.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: theme.textSecondary }}>
                    {post.content}
                  </p>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: "rgba(30, 136, 229, 0.1)",
                          color: theme.primary,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikePost(post.id);
                      }}
                      className="flex items-center gap-1 hover:text-red-400 transition-colors"
                      style={{ color: post.isLiked ? "#ef4444" : theme.textMuted }}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                      <span>{post.likes}</span>
                    </button>
                    <div className="flex items-center gap-1" style={{ color: theme.textMuted }}>
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.replies}</span>
                    </div>
                    <div className="flex items-center gap-1" style={{ color: theme.textMuted }}>
                      <Eye className="w-4 h-4" />
                      <span>{post.views}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSavePost(post.id);
                      }}
                      className="ml-auto hover:text-blue-400 transition-colors"
                      style={{ color: post.isSaved ? theme.primary : theme.textMuted }}
                    >
                      <Bookmark className={`w-4 h-4 ${post.isSaved ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-blue-400 transition-colors"
                      style={{ color: theme.textMuted }}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-12 text-center"
            style={{ border: `2px dashed ${theme.border}` }}
          >
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}10)`,
                border: `1px solid ${theme.primary}20`,
              }}
            >
              <MessageSquare className="w-9 h-9" style={{ color: theme.primary }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
              {language === "id" ? "Belum Ada Diskusi" : "No Discussions Yet"}
            </h3>
            <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: theme.textSecondary }}>
              {language === "id"
                ? "Jadilah yang pertama memulai diskusi! Bagikan pengetahuan Anda dengan komunitas HYDREX."
                : "Be the first to start a discussion! Share your knowledge with the HYDREX community."}
            </p>
            <button
              onClick={() => setShowNewPost(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 flex items-center gap-2 mx-auto"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            >
              <Plus className="w-4 h-4" />
              {language === "id" ? "Buat Postingan Pertama" : "Create First Post"}
            </button>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <NewPostModal
        isOpen={showNewPost}
        onClose={() => setShowNewPost(false)}
        onSubmit={(data) => {
          const newPost: ForumPost = {
            id: String(Date.now()),
            title: data.title,
            content: data.content,
            category: data.category,
            tags: data.tags,
            author: { name: user?.name || "User", avatar: user?.name?.charAt(0) || "U", role: "Individual" },
            likes: 0,
            replies: 0,
            views: 0,
            createdAt: language === "id" ? "Baru saja" : "Just now",
            attachments: data.attachments,
          };
          setPosts([newPost, ...posts]);
        }}
        language={language}
      />

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        replies={sampleReplies.filter(r => r.postId === selectedPost?.id)}
        language={language}
      />
    </div>
  );
};

// ==================== NEW POST MODAL ====================

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; category: string; tags: string[]; attachments?: Attachment[] }) => void;
  language: string;
}

const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose, onSubmit, language }) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("discussion");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const newAttachment: Attachment = {
        id: String(Date.now() + Math.random()),
        name: file.name,
        type: isImage ? "image" : "file",
        size: (file.size / 1024).toFixed(2) + " KB",
        url: URL.createObjectURL(file),
      };
      setAttachments([...attachments, newAttachment]);
    });
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title, content, category, tags, attachments });
    // Reset form
    setTitle("");
    setContent("");
    setCategory("discussion");
    setTags([]);
    setAttachments([]);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
            {language === "id" ? "Buat Postingan Baru" : "Create New Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-6 h-6" style={{ color: theme.textSecondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              {language === "id" ? "Kategori" : "Category"}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
            >
              {categories.filter(c => c.id !== "all").map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {language === "id" ? cat.nameId : cat.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              {language === "id" ? "Judul" : "Title"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === "id" ? "Masukkan judul postingan..." : "Enter post title..."}
              className="w-full px-4 py-3 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              {language === "id" ? "Konten" : "Content"}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === "id" ? "Tulis konten postingan Anda..." : "Write your post content..."}
              rows={8}
              className="w-full px-4 py-3 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              {language === "id" ? "Tag" : "Tags"}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder={language === "id" ? "Tambah tag..." : "Add tag..."}
                className="flex-1 px-4 py-2 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: theme.bgDark,
                  border: `1px solid ${theme.border}`,
                  color: theme.textPrimary,
                }}
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl font-medium text-white"
                style={{ backgroundColor: theme.primary }}
              >
                {language === "id" ? "Tambah" : "Add"}
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
                    style={{
                      backgroundColor: "rgba(30, 136, 229, 0.1)",
                      color: theme.primary,
                    }}
                  >
                    #{tag}
                    <button
                      onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.textSecondary }}>
              {language === "id" ? "Lampiran (opsional)" : "Attachments (optional)"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              style={{
                backgroundColor: theme.bgDark,
                border: `2px dashed ${theme.border}`,
                color: theme.textSecondary,
              }}
            >
              <Upload className="w-5 h-5" />
              {language === "id" ? "Unggah File atau Gambar" : "Upload File or Image"}
            </button>
            
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      backgroundColor: theme.bgDark,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {att.type === "image" ? (
                      <ImageIcon className="w-5 h-5" style={{ color: theme.primary }} />
                    ) : (
                      <FileText className="w-5 h-5" style={{ color: theme.secondary }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: theme.textPrimary }}>
                        {att.name}
                      </p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>
                        {att.size}
                      </p>
                    </div>
                    <button
                      onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))}
                      className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-6"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium transition-colors hover:bg-white/5"
            style={{
              backgroundColor: theme.bgDark,
              color: theme.textSecondary,
            }}
          >
            {language === "id" ? "Batal" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
          >
            <Send className="w-5 h-5" />
            {language === "id" ? "Posting" : "Post"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== POST DETAIL MODAL ====================

interface PostDetailModalProps {
  post: ForumPost | null;
  onClose: () => void;
  replies: ForumReply[];
  language: string;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose, replies, language }) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  const [replyContent, setReplyContent] = useState("");

  if (!post) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
            {language === "id" ? "Detail Diskusi" : "Discussion Detail"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-6 h-6" style={{ color: theme.textSecondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Post */}
          <div>
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}30, ${theme.secondary}30)`,
                  color: theme.primary,
                }}
              >
                {post.author.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg" style={{ color: theme.textPrimary }}>
                    {post.author.name}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: post.author.role === "Admin" ? "rgba(239, 68, 68, 0.1)" : "rgba(30, 136, 229, 0.1)",
                      color: post.author.role === "Admin" ? "#ef4444" : theme.primary,
                    }}
                  >
                    {post.author.role}
                  </span>
                </div>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  {post.createdAt}
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-3" style={{ color: theme.textPrimary }}>
              {post.title}
            </h3>

            <p className="mb-4" style={{ color: theme.textSecondary }}>
              {post.content}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: "rgba(30, 136, 229, 0.1)",
                    color: theme.primary,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
              <button className="flex items-center gap-2 hover:text-red-400 transition-colors" style={{ color: theme.textMuted }}>
                <Heart className="w-5 h-5" />
                <span>{post.likes}</span>
              </button>
              <div className="flex items-center gap-2" style={{ color: theme.textMuted }}>
                <MessageCircle className="w-5 h-5" />
                <span>{post.replies}</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: theme.textMuted }}>
                <Eye className="w-5 h-5" />
                <span>{post.views}</span>
              </div>
            </div>
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4" style={{ color: theme.textPrimary }}>
                {replies.length} {language === "id" ? "Balasan" : "Replies"}
              </h4>
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: reply.isBestAnswer ? "rgba(67, 160, 71, 0.1)" : theme.bgDark,
                      border: `1px solid ${reply.isBestAnswer ? theme.secondary : theme.border}`,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary}30, ${theme.secondary}30)`,
                          color: theme.primary,
                        }}
                      >
                        {reply.author.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium" style={{ color: theme.textPrimary }}>
                            {reply.author.name}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-lg text-xs font-medium"
                            style={{
                              backgroundColor: "rgba(30, 136, 229, 0.1)",
                              color: theme.primary,
                            }}
                          >
                            {reply.author.role}
                          </span>
                          {reply.isBestAnswer && (
                            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: theme.secondary }}>
                              <CheckCircle className="w-3 h-3" />
                              {language === "id" ? "Jawaban Terbaik" : "Best Answer"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: theme.textMuted }}>
                          {reply.createdAt}
                        </p>
                      </div>
                    </div>

                    <p style={{ color: theme.textSecondary }}>
                      {reply.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-sm hover:text-red-400 transition-colors" style={{ color: theme.textMuted }}>
                        <Heart className="w-4 h-4" />
                        <span>{reply.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm hover:text-blue-400 transition-colors" style={{ color: theme.textMuted }}>
                        <Reply className="w-4 h-4" />
                        <span>{language === "id" ? "Balas" : "Reply"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply Form */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: theme.textPrimary }}>
              {language === "id" ? "Tulis Balasan" : "Write a Reply"}
            </h4>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={language === "id" ? "Tulis balasan Anda..." : "Write your reply..."}
              rows={4}
              className="w-full px-4 py-3 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
              style={{
                backgroundColor: theme.bgDark,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
            />
            <button
              className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 hover:shadow-lg transition-all"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              }}
            >
              <Send className="w-5 h-5" />
              {language === "id" ? "Kirim Balasan" : "Send Reply"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ForumPage;
