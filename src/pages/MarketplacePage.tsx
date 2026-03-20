import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Star,
  MapPin,
  Calendar,
  Shield,
  Droplets,
  X,
  Plus,
  Minus,
  CheckCircle,
  FileText,
  CreditCard,
  Building2,
  Wallet,
  Bitcoin,
  Download,
  Eye,
  TrendingUp,
  Award,
  Clock,
  Trash2,
  BadgeCheck,
  DollarSign,
  Package,
  Receipt,
  Leaf,
  Factory,
  ArrowRightLeft,
  BarChart3,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  useMarketplace,
  WaterListing,
  CommunityListing,
  CorporateListing,
  CertificationStandard,
  PaymentMethod,
  Contract,
  Transaction,
  ListingCategory,
  isCommunityListing,
  isCorporateListing,
} from "../context/MarketplaceContext";
import { useProjects } from "../context/ProjectContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

// Semantic colors — same in both modes
const semanticColors = {
  community: "#10b981", // green - for community/conservation
  corporate: "#8b5cf6", // purple - for corporate/quota trading
};

// ============================================================================
// CURRENCY HELPERS
// ============================================================================
const IDR_TO_USD = 16000;

const formatUSD = (usdAmount: number): string => {
  if (usdAmount < 0.01) return `$${usdAmount.toFixed(4)}`;
  if (usdAmount < 1) return `$${usdAmount.toFixed(3)}`;
  if (usdAmount < 1000) return `$${usdAmount.toFixed(2)}`;
  return `$${(usdAmount / 1000).toFixed(2)}K`;
};

const formatUSDFull = (usdAmount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdAmount);
};

// ============================================================================
// CERTIFICATION BADGE COLORS
// ============================================================================
const certificationColors: Record<
  string,
  { bg: string; text: string }
> = {
  "Gold Standard": { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  "Verra VCS": { bg: "bg-blue-500/10", text: "text-blue-400" },
  "Verra VCS + CCBS": { bg: "bg-blue-500/10", text: "text-blue-400" },
  "Verra VCS + CCB": { bg: "bg-blue-500/10", text: "text-blue-400" },
  "Plan Vivo": { bg: "bg-purple-500/10", text: "text-purple-400" },
  "Plan Vivo Standard": { bg: "bg-purple-500/10", text: "text-purple-400" },
  "Gold Standard GS4GG": { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  "AWS": { bg: "bg-green-500/10", text: "text-green-400" },
  "ISO 14046": { bg: "bg-orange-500/10", text: "text-orange-400" },
  "ISO 14046 + VWBA": { bg: "bg-orange-500/10", text: "text-orange-400" },
  default: { bg: "bg-slate-500/10", text: "text-slate-400" }
};

const getCertColor = (cert: string) => {
  if (!cert) return certificationColors.default;
  // Try exact match or close match
  const match = Object.keys(certificationColors).find(k => cert.includes(k) && k !== 'default');
  return match ? certificationColors[match] : certificationColors.default;
};

// ============================================================================
// CATEGORY BADGE - community vs corporate
// ============================================================================
const CategoryBadge: React.FC<{
  category: ListingCategory;
  language: "id" | "en";
}> = ({ category, language }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  if (category === "community") {
    return (
      <div
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: `${theme.community}20`,
          color: theme.community,
        }}
      >
        <Leaf className="w-3 h-3" />
        {language === "id" ? "Konservasi" : "Community"}
      </div>
    );
  }
  return (
    <div
      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: `${theme.corporate}20`,
        color: theme.corporate,
      }}
    >
      <Factory className="w-3 h-3" />
      {language === "id" ? "Kuota Korporat" : "Corporate Quota"}
    </div>
  );
};

// ============================================================================
// MAIN MARKETPLACE PAGE
// ============================================================================
export const MarketplacePage: React.FC = () => {
  const { language } = useLanguage();
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const {
    listings,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getListingById,
    createTransaction,
    transactions,
    certificates,
    getCertificateByTransaction,
    contracts,
    wcpaDocuments,
    getContractByTransaction,
    downloadContract,
    downloadWCPA,
    downloadCertificate,
    getMarketplaceStats,
  } = useMarketplace();

  const { getProject } = useProjects();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | ListingCategory>(
    "all",
  );
  const [filterCertification, setFilterCertification] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "price_low" | "price_high" | "credits" | "rating"
  >("credits");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showListingDetail, setShowListingDetail] = useState(false);
  const [selectedListing, setSelectedListing] = useState<WaterListing | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<
    "marketplace" | "transactions" | "certificates" | "contracts"
  >("marketplace");

  const stats = getMarketplaceStats();

  // Filter and sort listings
  const filteredListings = listings
    .filter((listing) => {
      const matchesSearch =
        listing.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.province
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || listing.listingCategory === filterCategory;
      const matchesCertification =
        filterCertification === "all" ||
        (isCommunityListing(listing) &&
          listing.certificationStandard === filterCertification);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesCertification &&
        listing.status === "active"
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.pricePerTon - b.pricePerTon;
        case "price_high":
          return b.pricePerTon - a.pricePerTon;
        case "credits":
          return b.availableCredits - a.availableCredits;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const handleAddToCart = (listingId: string, quantity: number) => {
    const success = addToCart(listingId, quantity);
    if (success) {
      alert(
        language === "id"
          ? "✅ Ditambahkan ke keranjang!"
          : "✅ Added to cart!",
      );
    } else {
      alert(
        language === "id" ? "❌ Stok tidak mencukupi" : "❌ Insufficient stock",
      );
    }
  };

  const handleCheckout = (paymentMethod: PaymentMethod) => {
    const transaction = createTransaction(paymentMethod, {
      name: "Current User",
      email: "user@email.com",
    });
    if (transaction) {
      setShowCheckout(false);
      setShowCart(false);
      alert(
        language === "id"
          ? `✅ Transaksi berhasil!\n\nID: ${transaction.id}\nTotal: ${formatUSDFull(transaction.total)}\n\nKontrak, WCPA, dan Sertifikat telah dibuat.`
          : `✅ Transaction successful!\n\nID: ${transaction.id}\nTotal: ${formatUSDFull(transaction.total)}\n\nContract, WCPA, and Certificate have been created.`,
      );
      setActiveTab("contracts");
    }
  };

  const cartTotal = getCartTotal();

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: theme.bgDark }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
            style={{
              backgroundColor: `${theme.primary}20`,
              border: `1px solid ${theme.primary}40`,
            }}
          >
            <ShoppingCart
              className="w-4 h-4"
              style={{ color: theme.primary }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: theme.primary }}
            >
              {language === "id" ? "Marketplace" : "Marketplace"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: theme.textPrimary }}
              >
                {language === "id"
                  ? "Water Credit Marketplace"
                  : "Water Credit Marketplace"}
              </h1>
              <p style={{ color: theme.textSecondary }}>
                {language === "id"
                  ? "Beli dan jual water credit terverifikasi — komunitas & korporat"
                  : "Buy and sell verified water credits — community & corporate"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCart(true)}
                className="relative px-8 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                {language === "id" ? "Keranjang" : "Cart"}
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5">
          {[
            {
              icon: <Package className="w-5 h-5" />,
              label: language === "id" ? "Total Listing" : "Total Listings",
              value: stats.totalListings,
              color: theme.primary,
            },
            {
              icon: <Leaf className="w-5 h-5" />,
              label: language === "id" ? "Listing Komunitas" : "Community",
              value: stats.communityListings,
              color: theme.community,
            },
            {
              icon: <Factory className="w-5 h-5" />,
              label: language === "id" ? "Listing Korporat" : "Corporate",
              value: stats.corporateListings,
              color: theme.corporate,
            },
            {
              icon: <Droplets className="w-5 h-5" />,
              label:
                language === "id" ? "Kredit Tersedia" : "Credits Available",
              value: `${(stats.totalCreditsAvailable / 1000).toFixed(1)}K m³`,
              color: theme.secondary,
            },
            {
              icon: <Receipt className="w-5 h-5" />,
              label: language === "id" ? "Total Transaksi" : "Transactions",
              value: stats.totalTransactions,
              color: "#f59e0b",
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              label: language === "id" ? "Kredit Terjual" : "Credits Sold",
              value: `${(stats.totalCreditsSold / 1000).toFixed(1)}K m³`,
              color: "#10b981",
            },
            {
              icon: <DollarSign className="w-5 h-5" />,
              label: language === "id" ? "Harga Rata-rata" : "Avg Price",
              value: formatUSD(stats.averagePrice),
              color: "#8b5cf6",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="rounded-xl p-5"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                {React.cloneElement(stat.icon, {
                  style: { color: stat.color },
                })}
              </div>
              <p
                className="text-2xl font-bold mb-1"
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

        {/* Tabs */}
        <div className="border-b" style={{ borderColor: theme.border }}>
          <div className="flex gap-2 overflow-x-auto">
            {[
              {
                id: "marketplace",
                label: language === "id" ? "Marketplace" : "Marketplace",
                icon: ShoppingCart,
              },
              {
                id: "transactions",
                label: language === "id" ? "Transaksi Saya" : "My Transactions",
                icon: Receipt,
              },
              {
                id: "certificates",
                label:
                  language === "id" ? "Sertifikat Saya" : "My Certificates",
                icon: Award,
              },
              {
                id: "contracts",
                label:
                  language === "id"
                    ? "Kontrak & Dokumen"
                    : "Contracts & Documents",
                icon: FileText,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="px-4 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap"
                style={{
                  backgroundColor:
                    activeTab === tab.id ? theme.bgCard : "transparent",
                  color:
                    activeTab === tab.id ? theme.primary : theme.textSecondary,
                  borderBottom:
                    activeTab === tab.id
                      ? `2px solid ${theme.primary}`
                      : "2px solid transparent",
                }}
              >
                {React.createElement(tab.icon, { className: "w-4 h-4" })}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* MARKETPLACE TAB */}
        {activeTab === "marketplace" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={
                    language === "id" ? "Cari proyek..." : "Search projects..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl placeholder:text-gray-400 focus:outline-none"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="px-4 py-3 rounded-xl focus:outline-none"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                  }}
                >
                  <option value="all">
                    {language === "id" ? "Semua Kategori" : "All Categories"}
                  </option>
                  <option value="community">
                    {language === "id"
                      ? "Komunitas / Konservasi"
                      : "Community / Conservation"}
                  </option>
                  <option value="corporate">
                    {language === "id"
                      ? "Korporat / Kuota Air"
                      : "Corporate / Water Quota"}
                  </option>
                </select>

                {/* Certification Filter — hanya relevan untuk community */}
                {filterCategory !== "corporate" && (
                  <select
                    value={filterCertification}
                    onChange={(e) => setFilterCertification(e.target.value)}
                    className="px-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: theme.bgCard,
                      border: `1px solid ${theme.border}`,
                      color: theme.textPrimary,
                    }}
                  >
                    <option value="all">
                      {language === "id" ? "Semua Standar" : "All Standards"}
                    </option>
                    <option value="Gold Standard">Gold Standard</option>
                    <option value="Verra VCS">Verra VCS</option>
                    <option value="Plan Vivo">Plan Vivo</option>
                    <option value="AWS">AWS</option>
                    <option value="ISO 14046">ISO 14046</option>
                  </select>
                )}

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 rounded-xl focus:outline-none"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    color: theme.textPrimary,
                  }}
                >
                  <option value="credits">
                    {language === "id" ? "Kredit Terbanyak" : "Most Credits"}
                  </option>
                  <option value="price_low">
                    {language === "id" ? "Harga Terendah" : "Lowest Price"}
                  </option>
                  <option value="price_high">
                    {language === "id" ? "Harga Tertinggi" : "Highest Price"}
                  </option>
                  <option value="rating">
                    {language === "id" ? "Rating Tertinggi" : "Highest Rating"}
                  </option>
                </select>
              </div>
            </div>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-12 text-center"
                style={{ backgroundColor: theme.bgCard, border: `2px dashed ${theme.border}` }}
              >
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}10)`,
                    border: `1px solid ${theme.primary}20`,
                  }}
                >
                  <Package className="w-9 h-9" style={{ color: theme.primary }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
                  {language === "id" ? "Belum Ada Listing" : "No Listings Yet"}
                </h3>
                <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: theme.textSecondary }}>
                  {language === "id"
                    ? "Proyek terverifikasi yang didaftarkan ke marketplace akan muncul di sini. Daftarkan proyek Anda sekarang."
                    : "Verified projects listed to the marketplace will appear here. Register your project now."}
                </p>
                <button
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                >
                  {language === "id" ? "Daftarkan Proyek" : "Register Project"}
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {filteredListings.map((listing, idx) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    index={idx}
                    language={language}
                    onView={() => {
                      setSelectedListing(listing);
                      setShowListingDetail(true);
                    }}
                    onAddToCart={(quantity) =>
                      handleAddToCart(listing.id, quantity)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "transactions" && (
          <TransactionsTab transactions={transactions} language={language} />
        )}

        {activeTab === "certificates" && (
          <CertificatesTab
            certificates={certificates}
            transactions={transactions}
            language={language}
            onDownloadCertificate={downloadCertificate}
          />
        )}

        {activeTab === "contracts" && (
          <ContractsTab
            contracts={contracts}
            language={language}
            onDownloadContract={downloadContract}
            onDownloadWCPA={downloadWCPA}
            onDownloadCertificate={downloadCertificate}
            getProject={getProject}
          />
        )}
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        getListingById={getListingById}
        removeFromCart={removeFromCart}
        updateCartQuantity={updateCartQuantity}
        clearCart={clearCart}
        cartTotal={cartTotal}
        language={language}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartTotal={cartTotal}
        language={language}
        onConfirm={handleCheckout}
      />

      {/* Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          isOpen={showListingDetail}
          onClose={() => {
            setShowListingDetail(false);
            setSelectedListing(null);
          }}
          language={language}
          onAddToCart={(quantity) =>
            handleAddToCart(selectedListing.id, quantity)
          }
          getProject={getProject}
        />
      )}
    </div>
  );
};

// ============================================================================
// LISTING CARD
// ============================================================================
interface ListingCardProps {
  listing: WaterListing;
  index: number;
  language: "id" | "en";
  onView: () => void;
  onAddToCart: (quantity: number) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  index,
  language,
  onView,
  onAddToCart,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const [quantity, setQuantity] = useState(listing.minimumPurchase || 100);

  const accentColor =
    listing.listingCategory === "community" ? theme.community : theme.corporate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="rounded-xl overflow-hidden cursor-pointer"
      style={{
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Cover Image */}
      <div className="h-48 overflow-hidden relative" onClick={onView}>
        <img
          src={listing.coverImage}
          alt={listing.projectName}
          className="w-full h-full object-cover transition-transform hover:scale-110"
        />
        {/* Category ribbon */}
        <div className="absolute top-3 left-3">
          <CategoryBadge
            category={listing.listingCategory}
            language={language}
          />
        </div>
        {/* Corporate: trading intent badge */}
        {isCorporateListing(listing) && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor:
                listing.tradingIntent === "sell" ? "#10b98130" : "#ef444430",
              color: listing.tradingIntent === "sell" ? "#10b981" : "#ef4444",
            }}
          >
            <ArrowRightLeft className="w-3 h-3" />
            {listing.tradingIntent === "sell"
              ? language === "id"
                ? "Jual Surplus"
                : "Sell Surplus"
              : language === "id"
                ? "Beli Kuota"
                : "Buy Quota"}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3
              className="text-lg font-bold mb-1 line-clamp-1"
              style={{ color: theme.textPrimary }}
            >
              {listing.projectName}
            </h3>
            <div
              className="flex items-center gap-2 text-sm mb-2"
              style={{ color: theme.textMuted }}
            >
              <MapPin className="w-4 h-4" />
              <span>{listing.location.province}</span>
            </div>
          </div>
          {listing.sellerVerified && (
            <BadgeCheck className="w-5 h-5 text-blue-500" />
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {/* Community: certification badge */}
          {isCommunityListing(listing) && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getCertColor(listing.certificationStandard).bg} ${getCertColor(listing.certificationStandard).text}`}
            >
              {listing.certificationStandard}
            </span>
          )}
          {/* Corporate: industry badge */}
          {isCorporateListing(listing) && (
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${theme.corporate}15`,
                color: theme.corporate,
              }}
            >
              {listing.companyIndustry}
            </span>
          )}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span
              className="text-sm font-semibold"
              style={{ color: theme.textPrimary }}
            >
              {listing.rating}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: theme.textSecondary }}>
              {language === "id" ? "Tersedia" : "Available"}
            </span>
            <span className="font-semibold" style={{ color: accentColor }}>
              {listing.availableCredits.toLocaleString()} m³
            </span>
          </div>
          {/* Corporate: show surplus/deficit */}
          {isCorporateListing(listing) && (
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: theme.textSecondary }}>
                {language === "id" ? "Surplus/Defisit" : "Surplus/Deficit"}
              </span>
              <span
                className="font-semibold"
                style={{
                  color: listing.surplusDeficit >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {listing.surplusDeficit >= 0 ? "+" : ""}
                {listing.surplusDeficit.toLocaleString()} m³
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: theme.textSecondary }}>
              {language === "id" ? "Harga" : "Price"}
            </span>
            <span className="text-xl font-bold" style={{ color: accentColor }}>
              {formatUSD(listing.pricePerTon)}
              <span
                className="text-xs font-normal ml-1"
                style={{ color: theme.textMuted }}
              >
                /m³
              </span>
            </span>
          </div>
        </div>

        {/* Quantity + Buttons */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setQuantity(
                  Math.max(listing.minimumPurchase || 1, quantity - 100),
                )
              }
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ backgroundColor: theme.bgDark }}
            >
              <Minus className="w-4 h-4" style={{ color: theme.textPrimary }} />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    listing.minimumPurchase || 1,
                    parseInt(e.target.value) || 0,
                  ),
                )
              }
              className="flex-1 px-4 py-2 rounded-lg text-center font-semibold focus:outline-none"
              style={{
                backgroundColor: theme.bgDark,
                color: theme.textPrimary,
              }}
            />
            <button
              onClick={() =>
                setQuantity(Math.min(listing.availableCredits, quantity + 100))
              }
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ backgroundColor: theme.bgDark }}
            >
              <Plus className="w-4 h-4" style={{ color: theme.textPrimary }} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.bgDark,
                color: theme.textSecondary,
              }}
            >
              <Eye className="w-4 h-4" />
              {language === "id" ? "Detail" : "Details"}
            </button>
            <button
              onClick={() => onAddToCart(quantity)}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              <ShoppingCart className="w-4 h-4" />
              {language === "id" ? "Tambah" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// TRANSACTIONS TAB
// ============================================================================
const TransactionsTab: React.FC<{
  transactions: Transaction[];
  language: "id" | "en";
}> = ({ transactions, language }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  if (transactions.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-xl"
        style={{ backgroundColor: theme.bgCard }}
      >
        <Receipt
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: theme.textMuted }}
        />
        <p className="text-lg" style={{ color: theme.textSecondary }}>
          {language === "id" ? "Belum ada transaksi" : "No transactions yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction, idx) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="rounded-xl p-6"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: theme.textPrimary }}
              >
                {language === "id" ? "Transaksi" : "Transaction"} #
                {transaction.id}
              </h3>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                {new Date(transaction.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor:
                  transaction.paymentStatus === "completed"
                    ? "#10b98120"
                    : "#f59e0b20",
                color:
                  transaction.paymentStatus === "completed"
                    ? "#10b981"
                    : "#f59e0b",
              }}
            >
              {transaction.paymentStatus}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {transaction.items.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme.bgDark }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {item.listingCategory === "community" ? (
                    <Leaf
                      className="w-3.5 h-3.5"
                      style={{ color: theme.community }}
                    />
                  ) : (
                    <Factory
                      className="w-3.5 h-3.5"
                      style={{ color: theme.corporate }}
                    />
                  )}
                  <p
                    className="font-semibold"
                    style={{ color: theme.textPrimary }}
                  >
                    {item.projectName}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: theme.textSecondary }}>
                    {item.quantity.toLocaleString()} m³ ×{" "}
                    {formatUSD(item.pricePerTon)}
                    {item.listingCategory === "corporate" &&
                      item.tradingIntent && (
                        <span className="ml-2 text-xs opacity-70">
                          ({item.tradingIntent === "sell" ? "Surplus" : "Quota"}
                          )
                        </span>
                      )}
                  </span>
                  <span className="font-bold" style={{ color: theme.primary }}>
                    {formatUSDFull(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between text-lg font-bold">
              <span style={{ color: theme.textPrimary }}>
                {language === "id" ? "Total" : "Total"}
              </span>
              <span style={{ color: theme.primary }}>
                {formatUSDFull(transaction.total)}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// CERTIFICATES TAB
// ============================================================================
const CertificatesTab: React.FC<{
  certificates: any[];
  transactions: Transaction[];
  language: "id" | "en";
  onDownloadCertificate: (transactionId: string) => void;
}> = ({ certificates, transactions, language, onDownloadCertificate }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  if (certificates.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-xl"
        style={{ backgroundColor: theme.bgCard }}
      >
        <Award
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: theme.textMuted }}
        />
        <p className="text-lg" style={{ color: theme.textSecondary }}>
          {language === "id" ? "Belum ada sertifikat" : "No certificates yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {certificates.map((certificate, idx) => {
        const transaction = transactions.find(
          (t) => t.id === certificate.transactionId,
        );

        return (
          <motion.div
            key={certificate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl p-6"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${theme.primary}20` }}
                >
                  <Award className="w-6 h-6" style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: theme.textPrimary }}
                  >
                    {language === "id"
                      ? "Sertifikat Water Credit"
                      : "Water Credit Certificate"}
                  </h3>
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    {certificate.id}
                  </p>
                </div>
              </div>
              {certificate.blockchainVerified && (
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#10b98120" }}
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold text-green-500">
                    Blockchain Verified
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Total Kredit" : "Total Credits"}
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: theme.primary }}
                >
                  {certificate.totalCredits.toLocaleString()} m³
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Pemilik" : "Owner"}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {certificate.buyerName}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Tanggal Terbit" : "Issued Date"}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {new Date(certificate.issuedAt).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                  Blockchain TX
                </p>
                <p
                  className="font-mono text-xs truncate"
                  style={{ color: theme.textSecondary }}
                >
                  {certificate.blockchainTxHash?.substring(0, 16)}...
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {certificate.credits.map((credit: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-lg flex items-start gap-3"
                  style={{ backgroundColor: theme.bgDark }}
                >
                  {credit.listingCategory === "community" ? (
                    <Leaf
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: theme.community }}
                    />
                  ) : (
                    <Factory
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: theme.corporate }}
                    />
                  )}
                  <div>
                    <p
                      className="font-semibold mb-1"
                      style={{ color: theme.textPrimary }}
                    >
                      {credit.projectName}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      {credit.quantity.toLocaleString()} m³
                      {credit.listingCategory === "community" &&
                        credit.certificationStandard &&
                        ` • ${credit.certificationStandard}`}
                      {credit.listingCategory === "community" &&
                        credit.vintageYear &&
                        ` • ${credit.vintageYear}`}
                      {credit.listingCategory === "corporate" &&
                        credit.companyIndustry &&
                        ` • ${credit.companyIndustry}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onDownloadCertificate(certificate.transactionId)}
              className="w-full px-4 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#10b981" }}
            >
              <Download className="w-5 h-5" />
              {language === "id"
                ? "Download Sertifikat PDF"
                : "Download Certificate PDF"}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================================================
// CONTRACTS TAB
// ============================================================================
const ContractsTab: React.FC<{
  contracts: Contract[];
  language: "id" | "en";
  onDownloadContract: (contractId: string) => void;
  onDownloadWCPA: (contractId: string) => void;
  onDownloadCertificate: (transactionId: string) => void;
  getProject: (projectId: string) => any;
}> = ({
  contracts,
  language,
  onDownloadContract,
  onDownloadWCPA,
  onDownloadCertificate,
  getProject,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  if (contracts.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-xl"
        style={{ backgroundColor: theme.bgCard }}
      >
        <FileText
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: theme.textMuted }}
        />
        <p className="text-lg mb-2" style={{ color: theme.textSecondary }}>
          {language === "id" ? "Belum ada kontrak" : "No contracts yet"}
        </p>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          {language === "id"
            ? "Lakukan pembelian untuk mendapatkan kontrak water credit"
            : "Make a purchase to get water credit contracts"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blockchain banner */}
      <div
        className="p-4 rounded-xl border-l-4"
        style={{
          backgroundColor: `${theme.primary}10`,
          borderColor: theme.primary,
        }}
      >
        <div className="flex items-start gap-3">
          <CheckCircle
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: theme.primary }}
          />
          <div>
            <h4
              className="font-semibold mb-1"
              style={{ color: theme.textPrimary }}
            >
              {language === "id"
                ? "Blockchain Verified"
                : "Blockchain Verified"}
            </h4>
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              {language === "id"
                ? "Semua kontrak dan transaksi tercatat di blockchain untuk transparansi dan keamanan penuh."
                : "All contracts and transactions are recorded on blockchain for full transparency and security."}
            </p>
          </div>
        </div>
      </div>

      {contracts.map((contract, idx) => {
        const project = getProject(contract.projectId);
        const accentColor =
          contract.listingCategory === "community"
            ? theme.community
            : theme.corporate;

        return (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl p-6"
            style={{
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {contract.listingCategory === "community" ? (
                    <Leaf
                      className="w-6 h-6"
                      style={{ color: theme.community }}
                    />
                  ) : (
                    <Factory
                      className="w-6 h-6"
                      style={{ color: theme.corporate }}
                    />
                  )}
                  <h3
                    className="text-xl font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    {contract.projectName}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    {language === "id" ? "Kontrak" : "Contract"} #{contract.id}
                  </p>
                  <CategoryBadge
                    category={contract.listingCategory}
                    language={language}
                  />
                  {contract.listingCategory === "corporate" &&
                    contract.tradingIntent && (
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor:
                            contract.tradingIntent === "sell"
                              ? `${theme.community}20`
                              : "#ef444420",
                          color:
                            contract.tradingIntent === "sell"
                              ? theme.community
                              : "#ef4444",
                        }}
                      >
                        {contract.tradingIntent === "sell"
                          ? language === "id"
                            ? "Jual Surplus"
                            : "Sell Surplus"
                          : language === "id"
                            ? "Beli Kuota"
                            : "Buy Quota"}
                      </span>
                    )}
                </div>
              </div>
              <span
                className="px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor:
                    contract.status === "active" ? "#10b98120" : "#94a3b820",
                  color: contract.status === "active" ? "#10b981" : "#94a3b8",
                }}
              >
                {contract.status === "active"
                  ? "✅ Active"
                  : contract.status === "completed"
                    ? "✓ Completed"
                    : "Cancelled"}
              </span>
            </div>

            {/* Grid info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p
                  className="text-xs mb-1 flex items-center gap-1"
                  style={{ color: theme.textMuted }}
                >
                  <Calendar className="w-3 h-3" />
                  {language === "id" ? "Tanggal" : "Date"}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {contract.date}
                </p>
              </div>
              <div>
                <p
                  className="text-xs mb-1 flex items-center gap-1"
                  style={{ color: theme.textMuted }}
                >
                  <MapPin className="w-3 h-3" />
                  {language === "id" ? "Lokasi" : "Location"}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {contract.province}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Penjual" : "Seller"}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {contract.seller}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Pembeli" : "Buyer"}
                </p>
                <p
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {contract.buyer}
                </p>
              </div>
            </div>

            {/* Amount info */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl mb-6"
              style={{ backgroundColor: theme.bgDark }}
            >
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                  {language === "id"
                    ? "Jumlah Water Credit"
                    : "Water Credit Amount"}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: accentColor }}
                >
                  {contract.quantity.toLocaleString()} m³
                </p>
              </div>
              <div>
                <p
                  className="text-xs mb-1 flex items-center gap-1"
                  style={{ color: theme.textMuted }}
                >
                  <DollarSign className="w-3 h-3" />
                  {language === "id" ? "Harga per m³" : "Price per m³"}
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {formatUSD(contract.pricePerCredit)}
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Total Nilai" : "Total Amount"}
                </p>
                <p className="text-2xl font-bold" style={{ color: "#10b981" }}>
                  {formatUSDFull(contract.totalAmount)}
                </p>
              </div>
            </div>

            {/* Community specific */}
            {contract.listingCategory === "community" && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: theme.textMuted }}
                  >
                    {language === "id"
                      ? "Standar Sertifikasi"
                      : "Certification Standard"}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: theme.textPrimary }}
                  >
                    {contract.certificationStandard || "-"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: theme.textMuted }}
                  >
                    {language === "id" ? "Metodologi" : "Methodology"}
                  </p>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: theme.textPrimary }}
                  >
                    {contract.methodology || "-"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: theme.textMuted }}
                  >
                    Verifier
                  </p>
                  <p
                    className="font-semibold flex items-center gap-1"
                    style={{ color: theme.textPrimary }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {contract.verifier}
                  </p>
                </div>
                {contract.blockchainTxHash && (
                  <div>
                    <p
                      className="text-xs mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      Blockchain TX
                    </p>
                    <p
                      className="font-mono text-xs truncate"
                      style={{ color: theme.textSecondary }}
                    >
                      {contract.blockchainTxHash}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Corporate specific */}
            {contract.listingCategory === "corporate" && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: theme.textMuted }}
                  >
                    {language === "id" ? "Industri" : "Industry"}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: theme.textPrimary }}
                  >
                    {contract.companyIndustry || "-"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: theme.textMuted }}
                  >
                    {language === "id" ? "Tipe Perdagangan" : "Trading Type"}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: theme.textPrimary }}
                  >
                    {contract.tradingIntent === "sell"
                      ? language === "id"
                        ? "Jual Surplus Kuota"
                        : "Sell Quota Surplus"
                      : language === "id"
                        ? "Beli Kuota Tambahan"
                        : "Buy Additional Quota"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: theme.textMuted }}
                  >
                    Verifier
                  </p>
                  <p
                    className="font-semibold flex items-center gap-1"
                    style={{ color: theme.textPrimary }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {contract.verifier}
                  </p>
                </div>
                {contract.blockchainTxHash && (
                  <div>
                    <p
                      className="text-xs mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      Blockchain TX
                    </p>
                    <p
                      className="font-mono text-xs truncate"
                      style={{ color: theme.textSecondary }}
                    >
                      {contract.blockchainTxHash}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Project link */}
            {project && (
              <div
                className="mb-6 p-4 rounded-lg"
                style={{
                  backgroundColor: `${theme.secondary}10`,
                  border: `1px solid ${theme.secondary}30`,
                }}
              >
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Detail Proyek" : "Project Details"}
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  <strong style={{ color: theme.textPrimary }}>
                    {language === "id" ? "Deskripsi:" : "Description:"}
                  </strong>{" "}
                  {project.description.substring(0, 200)}...
                </p>
              </div>
            )}

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onDownloadContract(contract.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: theme.primary }}
              >
                <Download className="w-4 h-4" />
                {language === "id"
                  ? "Download Kontrak PDF"
                  : "Download Contract PDF"}
              </button>
              <button
                onClick={() => onDownloadWCPA(contract.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: theme.secondary }}
              >
                <Download className="w-4 h-4" />
                {language === "id" ? "Download WCPA" : "Download WCPA"}
              </button>
              <button
                onClick={() => onDownloadCertificate(contract.transactionId)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#10b981" }}
              >
                <Award className="w-4 h-4" />
                {language === "id"
                  ? "Download Sertifikat"
                  : "Download Certificate"}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ============================================================================
// CART MODAL
// ============================================================================
const CartModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  getListingById: (id: string) => WaterListing | undefined;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: any;
  language: "id" | "en";
  onCheckout: () => void;
}> = ({
  isOpen,
  onClose,
  cart,
  getListingById,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  cartTotal,
  language,
  onCheckout,
}) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                <ShoppingCart className="w-6 h-6 inline mr-2" />
                {language === "id" ? "Keranjang Belanja" : "Shopping Cart"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                <X className="w-6 h-6" style={{ color: theme.textSecondary }} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: theme.textMuted }}
                />
                <p style={{ color: theme.textSecondary }}>
                  {language === "id"
                    ? "Keranjang Anda kosong"
                    : "Your cart is empty"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item: any) => {
                  const listing = getListingById(item.listingId);
                  if (!listing) return null;

                  return (
                    <div
                      key={item.listingId}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: theme.bgDark }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {listing.listingCategory === "community" ? (
                              <Leaf
                                className="w-4 h-4"
                                style={{ color: theme.community }}
                              />
                            ) : (
                              <Factory
                                className="w-4 h-4"
                                style={{ color: theme.corporate }}
                              />
                            )}
                            <h3
                              className="font-bold"
                              style={{ color: theme.textPrimary }}
                            >
                              {listing.projectName}
                            </h3>
                          </div>
                          <p
                            className="text-sm"
                            style={{ color: theme.textSecondary }}
                          >
                            {formatUSD(item.pricePerTon)} ×{" "}
                            {item.quantity.toLocaleString()} m³
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.listingId)}
                          className="p-2 rounded-lg hover:bg-white/5"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.listingId,
                                item.quantity - 100,
                              )
                            }
                            className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ backgroundColor: theme.bgCard }}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span
                            className="font-semibold"
                            style={{ color: theme.textPrimary }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.listingId,
                                item.quantity + 100,
                              )
                            }
                            className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ backgroundColor: theme.bgCard }}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span
                          className="text-lg font-bold"
                          style={{ color: theme.primary }}
                        >
                          {formatUSDFull(item.quantity * item.pricePerTon)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t" style={{ borderColor: theme.border }}>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: theme.textSecondary }}>Subtotal</span>
                  <span style={{ color: theme.textPrimary }}>
                    {formatUSDFull(cartTotal.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: theme.textSecondary }}>
                    {language === "id" ? "Biaya Layanan" : "Service Fee"} (2.5%)
                  </span>
                  <span style={{ color: theme.textPrimary }}>
                    {formatUSDFull(cartTotal.serviceFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: theme.textSecondary }}>
                    {language === "id" ? "PPN (11%)" : "Tax (11%)"}
                  </span>
                  <span style={{ color: theme.textPrimary }}>
                    {formatUSDFull(cartTotal.tax)}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between text-xl font-bold pt-2 border-t"
                  style={{ borderColor: theme.border }}
                >
                  <span style={{ color: theme.textPrimary }}>Total</span>
                  <span style={{ color: theme.primary }}>
                    {formatUSDFull(cartTotal.total)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clearCart}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: theme.bgDark,
                    color: theme.textSecondary,
                  }}
                >
                  {language === "id" ? "Kosongkan" : "Clear Cart"}
                </button>
                <button
                  onClick={onCheckout}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  }}
                >
                  {language === "id" ? "Checkout" : "Checkout"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// CHECKOUT MODAL
// ============================================================================
const CheckoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cartTotal: any;
  language: "id" | "en";
  onConfirm: (paymentMethod: PaymentMethod) => void;
}> = ({ isOpen, onClose, cartTotal, language, onConfirm }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("bank_transfer");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-xl max-w-md w-full"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="p-6">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: theme.textPrimary }}
            >
              {language === "id"
                ? "Pilih Metode Pembayaran"
                : "Select Payment Method"}
            </h2>

            <div className="space-y-3 mb-6">
              {[
                {
                  value: "bank_transfer",
                  label: "Transfer Bank",
                  icon: Building2,
                },
                { value: "e_wallet", label: "E-Wallet", icon: Wallet },
                {
                  value: "credit_card",
                  label: "Kartu Kredit",
                  icon: CreditCard,
                },
                { value: "crypto", label: "Cryptocurrency", icon: Bitcoin },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() =>
                    setPaymentMethod(method.value as PaymentMethod)
                  }
                  className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all ${paymentMethod === method.value ? "ring-2" : ""}`}
                  style={{
                    backgroundColor:
                      paymentMethod === method.value
                        ? `${theme.primary}20`
                        : theme.bgDark,
                    borderColor:
                      paymentMethod === method.value
                        ? theme.primary
                        : "transparent",
                  }}
                >
                  {React.createElement(method.icon, {
                    className: "w-5 h-5",
                    style: { color: theme.primary },
                  })}
                  <span
                    className="font-semibold"
                    style={{ color: theme.textPrimary }}
                  >
                    {method.label}
                  </span>
                  {paymentMethod === method.value && (
                    <CheckCircle
                      className="w-5 h-5 ml-auto"
                      style={{ color: theme.primary }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: theme.bgDark }}
            >
              <div className="flex items-center justify-between text-xl font-bold">
                <span style={{ color: theme.textPrimary }}>Total</span>
                <span style={{ color: theme.primary }}>
                  {formatUSDFull(cartTotal.total)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: theme.bgDark,
                  color: theme.textSecondary,
                }}
              >
                {language === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                onClick={() => onConfirm(paymentMethod)}
                className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
              >
                {language === "id"
                  ? "Konfirmasi Pembayaran"
                  : "Confirm Payment"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// LISTING DETAIL MODAL
// ============================================================================
const ListingDetailModal: React.FC<{
  listing: WaterListing;
  isOpen: boolean;
  onClose: () => void;
  language: "id" | "en";
  onAddToCart: (quantity: number) => void;
  getProject: (projectId: string) => any;
}> = ({ listing, isOpen, onClose, language, onAddToCart, getProject }) => {
  const { theme: colorTheme } = useTheme();
  const theme = { ...(colorTheme === "dark" ? darkPageTheme : lightPageTheme), ...semanticColors };
  const [quantity, setQuantity] = useState(listing.minimumPurchase || 100);
  const project = listing.projectId ? getProject(listing.projectId) : null;
  const accentColor =
    listing.listingCategory === "community" ? theme.community : theme.corporate;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: theme.bgCard,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: theme.textPrimary }}
                >
                  {listing.projectName}
                </h2>
                <div className="flex items-center gap-2">
                  <CategoryBadge
                    category={listing.listingCategory}
                    language={language}
                  />
                  {/* Community: certification */}
                  {isCommunityListing(listing) && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getCertColor(listing.certificationStandard).bg} ${getCertColor(listing.certificationStandard).text}`}
                    >
                      {listing.certificationStandard}
                    </span>
                  )}
                  {/* Corporate: trading intent */}
                  {isCorporateListing(listing) && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor:
                          listing.tradingIntent === "sell"
                            ? "#10b98120"
                            : "#ef444420",
                        color:
                          listing.tradingIntent === "sell"
                            ? "#10b981"
                            : "#ef4444",
                      }}
                    >
                      <ArrowRightLeft className="w-3 h-3 inline mr-1" />
                      {listing.tradingIntent === "sell"
                        ? language === "id"
                          ? "Jual Surplus Kuota"
                          : "Sell Quota Surplus"
                        : language === "id"
                          ? "Beli Kuota Tambahan"
                          : "Buy Additional Quota"}
                    </span>
                  )}
                  {listing.sellerVerified && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500">
                      <BadgeCheck className="w-4 h-4" />
                      <span className="text-xs font-semibold">
                        Verified Seller
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                <X className="w-6 h-6" style={{ color: theme.textSecondary }} />
              </button>
            </div>

            {/* Cover image */}
            <img
              src={listing.coverImage}
              alt={listing.projectName}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Tersedia" : "Available"}
                </p>
                <p className="text-xl font-bold" style={{ color: accentColor }}>
                  {listing.availableCredits.toLocaleString()} m³
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Harga" : "Price"}
                </p>
                <p className="text-xl font-bold" style={{ color: accentColor }}>
                  {formatUSD(listing.pricePerTon)}
                  <span
                    className="text-xs font-normal ml-1"
                    style={{ color: theme.textMuted }}
                  >
                    /m³
                  </span>
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  Rating
                </p>
                <p
                  className="text-xl font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  ⭐ {listing.rating} ({listing.reviewCount})
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.bgDark }}
              >
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Min. Pembelian" : "Min. Purchase"}
                </p>
                <p
                  className="text-xl font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {listing.minimumPurchase} m³
                </p>
              </div>
            </div>

            {/* Corporate extra info */}
            {isCorporateListing(listing) && (
              <div
                className="mb-6 p-4 rounded-lg"
                style={{
                  backgroundColor: `${theme.corporate}10`,
                  border: `1px solid ${theme.corporate}30`,
                }}
              >
                <h3
                  className="text-sm font-semibold mb-3 flex items-center gap-2"
                  style={{ color: theme.corporate }}
                >
                  <BarChart3 className="w-4 h-4" />
                  {language === "id" ? "Data Kuota Air" : "Water Quota Data"}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p
                      className="text-xs mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      {language === "id"
                        ? "Kuota Dialokasikan"
                        : "Allocated Quota"}
                    </p>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: theme.textPrimary }}
                    >
                      {listing.currentWaterQuota.toLocaleString()} m³/yr
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      {language === "id"
                        ? "Konsumsi Aktual"
                        : "Actual Consumption"}
                    </p>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: theme.textPrimary }}
                    >
                      {listing.actualConsumption.toLocaleString()} m³/yr
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      {language === "id"
                        ? "Surplus/Defisit"
                        : "Surplus/Deficit"}
                    </p>
                    <p
                      className="font-bold text-sm"
                      style={{
                        color:
                          listing.surplusDeficit >= 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {listing.surplusDeficit >= 0 ? "+" : ""}
                      {listing.surplusDeficit.toLocaleString()} m³
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs" style={{ color: theme.textMuted }}>
                    {language === "id"
                      ? "Status Kepatuhan:"
                      : "Compliance Status:"}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        listing.complianceStatus === "compliant"
                          ? "#10b98120"
                          : listing.complianceStatus === "at_risk"
                            ? "#f59e0b20"
                            : "#ef444420",
                      color:
                        listing.complianceStatus === "compliant"
                          ? "#10b981"
                          : listing.complianceStatus === "at_risk"
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  >
                    {listing.complianceStatus === "compliant"
                      ? "✅ Compliant"
                      : listing.complianceStatus === "at_risk"
                        ? "⚠️ At Risk"
                        : "❌ Non-Compliant"}
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: theme.textPrimary }}
              >
                {language === "id" ? "Deskripsi" : "Description"}
              </h3>
              <p style={{ color: theme.textSecondary, lineHeight: "1.6" }}>
                {listing.projectDescription}
              </p>
            </div>

            {/* Community: project link from ProjectContext */}
            {project && (
              <div
                className="mb-6 p-4 rounded-lg"
                style={{
                  backgroundColor: `${theme.primary}10`,
                  border: `1px solid ${theme.primary}30`,
                }}
              >
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme.primary }}
                >
                  {language === "id"
                    ? "Informasi Proyek"
                    : "Project Information"}
                </h3>
                <p
                  className="text-sm mb-2"
                  style={{ color: theme.textSecondary }}
                >
                  <strong>
                    {language === "id" ? "Metodologi:" : "Methodology:"}
                  </strong>{" "}
                  {project.methodology}
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  <strong>
                    {language === "id"
                      ? "Status Verifikasi:"
                      : "Verification Status:"}
                  </strong>{" "}
                  {project.verificationStatus === "verified"
                    ? "✅ Terverifikasi"
                    : "⏳ Dalam Proses"}
                </p>
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() =>
                    setQuantity(
                      Math.max(listing.minimumPurchase || 1, quantity - 100),
                    )
                  }
                  className="w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                  style={{ backgroundColor: theme.bgDark }}
                >
                  <Minus
                    className="w-5 h-5"
                    style={{ color: theme.textPrimary }}
                  />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(
                        listing.minimumPurchase || 1,
                        parseInt(e.target.value) || 0,
                      ),
                    )
                  }
                  className="flex-1 px-4 py-3 rounded-lg text-center text-xl font-bold focus:outline-none"
                  style={{
                    backgroundColor: theme.bgDark,
                    color: theme.textPrimary,
                  }}
                />
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(listing.availableCredits, quantity + 100),
                    )
                  }
                  className="w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                  style={{ backgroundColor: theme.bgDark }}
                >
                  <Plus
                    className="w-5 h-5"
                    style={{ color: theme.textPrimary }}
                  />
                </button>
              </div>
              <div className="text-right">
                <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Total Harga" : "Total Price"}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: accentColor }}
                >
                  {formatUSDFull(quantity * listing.pricePerTon)}
                </p>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={() => {
                onAddToCart(quantity);
                onClose();
              }}
              className="w-full px-6 py-4 rounded-xl font-bold text-white text-lg transition-all hover:opacity-90 flex items-center justify-center gap-3"
              style={{ backgroundColor: accentColor }}
            >
              <ShoppingCart className="w-6 h-6" />
              {language === "id" ? "Tambahkan ke Keranjang" : "Add to Cart"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarketplacePage;
