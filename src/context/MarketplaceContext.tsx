import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ==================== TYPES ====================

export type ListingCategory = "community" | "corporate";

// Disesuaikan dengan ProjectContext
export type CertificationStandard =
  | "Gold Standard"
  | "Verra VCS"
  | "Plan Vivo"
  | "AWS"
  | "ISO 14046";

export type CommunityProjectType =
  | "reforestation"
  | "conservation"
  | "mangrove"
  | "renewable"
  | "efficiency"
  | "waste"
  | "agroforestry";

export type CorporateProjectType =
  | "water_quota_trading"
  | "efficiency_improvement"
  | "wastewater_management";

export type ListingStatus = "active" | "sold" | "pending" | "expired";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";
export type PaymentMethod =
  | "bank_transfer"
  | "e_wallet"
  | "crypto"
  | "credit_card";

// ==================== BASE LISTING FIELDS (shared) ====================

interface BaseListingFields {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerType: "company" | "organization" | "individual";
  sellerVerified: boolean;
  projectId?: string;
  projectName: string;
  projectDescription: string;
  location: {
    province: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  availableCredits: number;
  totalCredits: number;
  pricePerTon: number;
  minimumPurchase: number;
  isVerified: boolean;
  verificationDate?: string;
  verificationBody?: string;
  registryLink?: string;
  serialNumberPrefix?: string;
  coverImage: string;
  galleryImages: string[];
  documents: { name: string; url: string; type: string }[];
  rating: number;
  totalSold: number;
  reviewCount: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  featured: boolean;
  promoted: boolean;
}

// ==================== COMMUNITY LISTING ====================

export interface CommunityListing extends BaseListingFields {
  listingCategory: "community";
  projectType: CommunityProjectType;
  certificationStandard: CertificationStandard;
  methodology: string;
  vintageYear: number;
}

// ==================== CORPORATE LISTING ====================

export interface CorporateListing extends BaseListingFields {
  listingCategory: "corporate";
  projectType: CorporateProjectType;
  companyIndustry: string;
  companySize: "small" | "medium" | "large";
  tradingIntent: "sell" | "buy";
  currentWaterQuota: number;
  actualConsumption: number;
  surplusDeficit: number;
  complianceStatus: "compliant" | "non_compliant" | "at_risk";
  lastAuditDate?: string;
  quotaExpiryDate?: string;
}

// ==================== UNION TYPE ====================

export type WaterListing = CommunityListing | CorporateListing;

// Type guards
export const isCommunityListing = (l: WaterListing): l is CommunityListing =>
  l.listingCategory === "community";
export const isCorporateListing = (l: WaterListing): l is CorporateListing =>
  l.listingCategory === "corporate";

// ==================== INPUT TYPE FOR addListing ====================
// Pisahkan Omit per tipe agar TypeScript resolve union dengan benar

type OmitMeta<T> = Omit<
  T,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "rating"
  | "totalSold"
  | "reviewCount"
>;

export type NewCommunityListing = OmitMeta<CommunityListing>;
export type NewCorporateListing = OmitMeta<CorporateListing>;
export type NewListing = NewCommunityListing | NewCorporateListing;

// ==================== CART ====================

export interface CartItem {
  listingId: string;
  listingCategory: ListingCategory;
  quantity: number;
  pricePerTon: number;
  addedAt: string;
}

// ==================== TRANSACTION ====================

export interface Transaction {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  items: {
    listingId: string;
    listingCategory: ListingCategory;
    projectName: string;
    sellerName: string;
    quantity: number;
    pricePerTon: number;
    subtotal: number;
    certificationStandard?: CertificationStandard;
    vintageYear?: number;
    tradingIntent?: "sell" | "buy";
    companyIndustry?: string;
  }[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: TransactionStatus;
  paymentDate?: string;
  paymentProof?: string;
  certificateId?: string;
  certificateUrl?: string;
  serialNumbers?: string[];
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

// ==================== CERTIFICATE ====================

export interface Certificate {
  id: string;
  transactionId: string;
  buyerName: string;
  buyerEmail: string;
  credits: {
    listingCategory: ListingCategory;
    projectName: string;
    quantity: number;
    serialNumbers: string[];
    certificationStandard?: CertificationStandard;
    vintageYear?: number;
    tradingIntent?: "sell" | "buy";
    companyIndustry?: string;
  }[];
  totalCredits: number;
  issuedAt: string;
  validUntil?: string;
  qrCode?: string;
  blockchainVerified: boolean;
  blockchainTxHash?: string;
}

// ==================== CONTRACT ====================

export interface Contract {
  id: string;
  transactionId: string;
  projectId: string;
  projectName: string;
  listingCategory: ListingCategory;
  seller: string;
  buyer: string;
  province: string;
  date: string;
  quantity: number;
  pricePerCredit: number;
  totalAmount: number;
  certificationStandard?: CertificationStandard;
  methodology?: string;
  tradingIntent?: "sell" | "buy";
  companyIndustry?: string;
  verifier: string;
  status: "active" | "completed" | "cancelled";
  blockchainTxHash?: string;
}

export interface WCPADocument {
  id: string;
  contractId: string;
  transactionId: string;
  projectName: string;
  issuedAt: string;
  validUntil?: string;
}

// ==================== HELPERS ====================

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const generateBlockchainTx = () =>
  `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("")}`;

// ==================== CONTEXT TYPE ====================

interface MarketplaceContextType {
  listings: WaterListing[];
  getListingById: (id: string) => WaterListing | undefined;
  addListing: (listing: NewListing) => WaterListing;
  updateListing: (id: string, updates: Partial<WaterListing>) => void;
  getCommunityListings: () => CommunityListing[];
  getCorporateListings: () => CorporateListing[];
  cart: CartItem[];
  addToCart: (listingId: string, quantity: number) => boolean;
  removeFromCart: (listingId: string) => void;
  updateCartQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => {
    subtotal: number;
    serviceFee: number;
    tax: number;
    total: number;
    totalCredits: number;
  };
  transactions: Transaction[];
  createTransaction: (
    paymentMethod: PaymentMethod,
    buyerInfo: { name: string; email: string },
  ) => Transaction | null;
  getTransactionById: (id: string) => Transaction | undefined;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  contracts: Contract[];
  wcpaDocuments: WCPADocument[];
  getContractByTransaction: (transactionId: string) => Contract | undefined;
  downloadContract: (contractId: string) => void;
  downloadWCPA: (contractId: string) => void;
  downloadCertificate: (transactionId: string) => void;
  certificates: Certificate[];
  getCertificateByTransaction: (
    transactionId: string,
  ) => Certificate | undefined;
  getMarketplaceStats: () => {
    totalListings: number;
    communityListings: number;
    corporateListings: number;
    totalCreditsAvailable: number;
    totalTransactions: number;
    totalCreditsSold: number;
    averagePrice: number;
  };
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(
  undefined,
);

const STORAGE_KEYS = {
  listings: "hydrex-marketplace-listings-v2",
  cart: "hydrex-marketplace-cart-v2",
  transactions: "hydrex-marketplace-transactions-v2",
  certificates: "hydrex-marketplace-certificates-v2",
  contracts: "hydrex-marketplace-contracts-v2",
  wcpaDocuments: "hydrex-marketplace-wcpa-v2",
};

const getStored = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

const setStored = <T,>(key: string, value: T) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }
  }
};

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [listings, setListings] = useState<WaterListing[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [wcpaDocuments, setWcpaDocuments] = useState<WCPADocument[]>([]);

  useEffect(() => {
    const storedListings = getStored<WaterListing[] | null>(
      STORAGE_KEYS.listings,
      null,
    );
    const hasLegacyData =
      storedListings &&
      Array.isArray(storedListings) &&
      storedListings.some(
        (l: any) => !("listingCategory" in l) || /^listing-00[1-6]$/.test(l.id),
      );

    if (hasLegacyData || !storedListings) {
      setListings([]);
      setStored(STORAGE_KEYS.listings, []);
    } else {
      setListings(storedListings);
    }

    setCart(getStored(STORAGE_KEYS.cart, []));
    setTransactions(getStored(STORAGE_KEYS.transactions, []));
    setCertificates(getStored(STORAGE_KEYS.certificates, []));
    setContracts(getStored(STORAGE_KEYS.contracts, []));
    setWcpaDocuments(getStored(STORAGE_KEYS.wcpaDocuments, []));
  }, []);

  useEffect(() => {
    setStored(STORAGE_KEYS.listings, listings);
  }, [listings]);
  useEffect(() => {
    setStored(STORAGE_KEYS.cart, cart);
  }, [cart]);
  useEffect(() => {
    setStored(STORAGE_KEYS.transactions, transactions);
  }, [transactions]);
  useEffect(() => {
    setStored(STORAGE_KEYS.certificates, certificates);
  }, [certificates]);
  useEffect(() => {
    setStored(STORAGE_KEYS.contracts, contracts);
  }, [contracts]);
  useEffect(() => {
    setStored(STORAGE_KEYS.wcpaDocuments, wcpaDocuments);
  }, [wcpaDocuments]);

  // ==================== LISTINGS ====================

  const getListingById = (id: string) => listings.find((l) => l.id === id);

  const getCommunityListings = (): CommunityListing[] =>
    listings.filter(isCommunityListing);

  const getCorporateListings = (): CorporateListing[] =>
    listings.filter(isCorporateListing);

  const addListing = (listingData: NewListing): WaterListing => {
    const meta = {
      id: `listing-${generateId()}`,
      status: "active" as ListingStatus,
      rating: 0,
      totalSold: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    const newListing = { ...listingData, ...meta } as WaterListing;
    setListings((prev) => [...prev, newListing]);
    return newListing;
  };

  const updateListing = (id: string, updates: Partial<WaterListing>) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? ({
              ...l,
              ...updates,
              updatedAt: new Date().toISOString().split("T")[0],
            } as WaterListing)
          : l,
      ),
    );
  };

  // ==================== CART ====================

  const addToCart = (listingId: string, quantity: number): boolean => {
    const listing = getListingById(listingId);
    if (!listing || listing.availableCredits < quantity) return false;

    setCart((prev) => {
      const existing = prev.find((item) => item.listingId === listingId);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > listing.availableCredits) return prev;
        return prev.map((item) =>
          item.listingId === listingId
            ? { ...item, quantity: newQuantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          listingId,
          listingCategory: listing.listingCategory,
          quantity,
          pricePerTon: listing.pricePerTon,
          addedAt: new Date().toISOString(),
        },
      ];
    });
    return true;
  };

  const removeFromCart = (listingId: string) => {
    setCart((prev) => prev.filter((item) => item.listingId !== listingId));
  };

  const updateCartQuantity = (listingId: string, quantity: number) => {
    const listing = getListingById(listingId);
    if (!listing || quantity > listing.availableCredits || quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.listingId === listingId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.quantity * item.pricePerTon,
      0,
    );
    const serviceFee = subtotal * 0.025;
    const tax = subtotal * 0.11;
    const total = subtotal + serviceFee + tax;
    const totalCredits = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, serviceFee, tax, total, totalCredits };
  };

  // ==================== TRANSACTIONS ====================

  const createTransaction = (
    paymentMethod: PaymentMethod,
    buyerInfo: { name: string; email: string },
  ): Transaction | null => {
    if (cart.length === 0) return null;

    const { subtotal, serviceFee, tax, total } = getCartTotal();

    const items: Transaction["items"] = cart.map((item) => {
      const listing = getListingById(item.listingId)!;
      const base = {
        listingId: item.listingId,
        listingCategory: item.listingCategory,
        projectName: listing.projectName,
        sellerName: listing.sellerName,
        quantity: item.quantity,
        pricePerTon: item.pricePerTon,
        subtotal: item.quantity * item.pricePerTon,
      };
      if (isCommunityListing(listing)) {
        return {
          ...base,
          certificationStandard: listing.certificationStandard,
          vintageYear: listing.vintageYear,
        };
      } else {
        return {
          ...base,
          tradingIntent: listing.tradingIntent,
          companyIndustry: listing.companyIndustry,
        };
      }
    });

    const txHash = generateBlockchainTx();

    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      buyerId: `user-${Date.now()}`,
      buyerName: buyerInfo.name,
      buyerEmail: buyerInfo.email,
      items,
      subtotal,
      serviceFee,
      tax,
      total,
      paymentMethod,
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      blockchainTxHash: txHash,
      blockchainBlockNumber: Math.floor(18000000 + Math.random() * 1000000),
    };

    setTransactions((prev) => [...prev, transaction]);

    cart.forEach((item) => {
      const listing = getListingById(item.listingId);
      if (listing) {
        updateListing(item.listingId, {
          availableCredits: listing.availableCredits - item.quantity,
          totalSold: listing.totalSold + item.quantity,
        });
      }
    });

    const certificate: Certificate = {
      id: `CERT-${Date.now()}`,
      transactionId: transaction.id,
      buyerName: buyerInfo.name,
      buyerEmail: buyerInfo.email,
      credits: items.map((item) => {
        const listing = getListingById(item.listingId);
        const serial =
          listing?.serialNumberPrefix ||
          (item.listingCategory === "community" ? "WCC" : "WCQ");
        return {
          listingCategory: item.listingCategory,
          projectName: item.projectName,
          quantity: item.quantity,
          serialNumbers: Array.from(
            { length: Math.min(item.quantity, 5) },
            (_, i) => `${serial}-${String(i + 1).padStart(6, "0")}`,
          ),
          certificationStandard: item.certificationStandard,
          vintageYear: item.vintageYear,
          tradingIntent: item.tradingIntent,
          companyIndustry: item.companyIndustry,
        };
      }),
      totalCredits: items.reduce((sum, item) => sum + item.quantity, 0),
      issuedAt: new Date().toISOString(),
      blockchainVerified: true,
      blockchainTxHash: txHash,
    };

    setCertificates((prev) => [...prev, certificate]);

    const newContracts: Contract[] = items.map((item) => {
      const listing = getListingById(item.listingId);
      return {
        id: `CTR-${Date.now()}-${item.listingId}`,
        transactionId: transaction.id,
        projectId: listing?.projectId || "",
        projectName: item.projectName,
        listingCategory: item.listingCategory,
        seller: item.sellerName,
        buyer: buyerInfo.name,
        province: listing?.location.province || "",
        date: new Date().toISOString().split("T")[0],
        quantity: item.quantity,
        pricePerCredit: item.pricePerTon,
        totalAmount: item.subtotal,
        certificationStandard: item.certificationStandard,
        methodology:
          listing && isCommunityListing(listing)
            ? listing.methodology
            : undefined,
        tradingIntent: item.tradingIntent,
        companyIndustry: item.companyIndustry,
        verifier: listing?.verificationBody || "Verified Body",
        status: "active",
        blockchainTxHash: txHash,
      };
    });
    setContracts((prev) => [...prev, ...newContracts]);

    const newWCPAs: WCPADocument[] = newContracts.map((c) => ({
      id: `WCPA-${Date.now()}-${c.id}`,
      contractId: c.id,
      transactionId: transaction.id,
      projectName: c.projectName,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      ).toISOString(),
    }));
    setWcpaDocuments((prev) => [...prev, ...newWCPAs]);

    clearCart();
    return transaction;
  };

  const getTransactionById = (id: string) =>
    transactions.find((t) => t.id === id);

  const updateTransactionStatus = (id: string, status: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              paymentStatus: status,
              completedAt:
                status === "completed"
                  ? new Date().toISOString()
                  : t.completedAt,
            }
          : t,
      ),
    );
  };

  const getCertificateByTransaction = (transactionId: string) =>
    certificates.find((c) => c.transactionId === transactionId);

  const getContractByTransaction = (transactionId: string) =>
    contracts.find((c) => c.transactionId === transactionId);

  // ── PDF helpers ────────────────────────────────────────────────────────────
  const IDR_TO_USD = 16000;
  const fmtUSD = (idr: number) => {
    const usd = idr / IDR_TO_USD;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(usd);
  };
  const openPDF = (html: string, filename: string) => {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.document.title = filename;
      win.print();
    }, 600);
  };

  // ── Download Contract PDF ───────────────────────────────────────────────────
  const downloadContract = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;
    const isCorp = contract.listingCategory === "corporate";
    const accentColor = isCorp ? "#8b5cf6" : "#10b981";
    const categoryLabel = isCorp
      ? "Corporate Water Quota"
      : "Community Water Credit";
    const extraRows = isCorp
      ? `<tr><td>Trading Intent</td><td>${contract.tradingIntent?.toUpperCase() || "-"}</td></tr>
         <tr><td>Industry</td><td>${contract.companyIndustry || "-"}</td></tr>`
      : `<tr><td>Certification Standard</td><td>${contract.certificationStandard || "-"}</td></tr>
         <tr><td>Methodology</td><td>${contract.methodology || "-"}</td></tr>`;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Contract - ${contract.id}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Inter', Arial, sans-serif; background:#fff; color:#1a1a2e; }
      .page { width:210mm; min-height:297mm; margin:0 auto; padding:14mm 16mm; }
      /* Header */
      .header { display:flex; align-items:center; justify-content:space-between; padding-bottom:12px; border-bottom:3px solid ${accentColor}; margin-bottom:20px; }
      .logo-area { display:flex; align-items:center; gap:10px; }
      .logo-box { width:44px; height:44px; background:linear-gradient(135deg,#1e88e5,${accentColor}); border-radius:10px; display:flex; align-items:center; justify-content:center; }
      .logo-box svg { width:26px; height:26px; fill:none; stroke:#fff; stroke-width:2; }
      .brand { font-size:22px; font-weight:800; color:#0c1220; letter-spacing:-0.5px; }
      .brand span { color:${accentColor}; }
      .doc-type { text-align:right; }
      .doc-type h2 { font-size:15px; font-weight:700; color:#0c1220; text-transform:uppercase; letter-spacing:1px; }
      .doc-type .badge { display:inline-block; margin-top:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; background:${accentColor}22; color:${accentColor}; border:1px solid ${accentColor}44; }
      /* Contract ID strip */
      .contract-strip { background:#f0f4ff; border-radius:8px; padding:10px 14px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; }
      .contract-strip .label { font-size:10px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
      .contract-strip .value { font-size:11px; color:#0c1220; font-weight:600; font-family:monospace; }
      /* Section title */
      .section-title { font-size:11px; font-weight:700; color:${accentColor}; text-transform:uppercase; letter-spacing:1px; margin:16px 0 8px; padding-bottom:4px; border-bottom:1px solid ${accentColor}33; }
      /* Info table */
      table.info { width:100%; border-collapse:collapse; }
      table.info tr { border-bottom:1px solid #f1f5f9; }
      table.info td { padding:7px 8px; font-size:12px; }
      table.info td:first-child { color:#64748b; font-weight:600; width:38%; }
      table.info td:last-child { color:#1a1a2e; font-weight:500; }
      /* Amount highlight */
      .amount-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin:14px 0; }
      .amount-box { background:#f8fafc; border-radius:10px; padding:12px 14px; border-left:4px solid ${accentColor}; }
      .amount-box .alabel { font-size:10px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
      .amount-box .avalue { font-size:18px; font-weight:800; color:${accentColor}; }
      .amount-box .avalue.green { color:#10b981; }
      /* Blockchain */
      .blockchain { background:#0c1220; border-radius:8px; padding:10px 14px; margin-top:14px; }
      .blockchain .blabel { font-size:10px; color:#64748b; font-weight:600; text-transform:uppercase; }
      .blockchain .bvalue { font-size:10px; color:#60a5fa; font-family:monospace; word-break:break-all; margin-top:3px; }
      /* Footer */
      .footer { margin-top:24px; padding-top:14px; border-top:2px solid #e2e8f0; display:flex; justify-content:space-between; align-items:flex-end; }
      .footer .seal { text-align:center; }
      .seal-circle { width:70px; height:70px; border-radius:50%; border:2.5px dashed ${accentColor}; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:${accentColor}; text-align:center; line-height:1.3; }
      .footer-note { font-size:9px; color:#94a3b8; text-align:right; }
      @media print { .page { padding:10mm 12mm; } }
    </style></head>
    <body><div class="page">
      <div class="header">
        <div class="logo-area">
          <div class="logo-box">
            <svg viewBox="0 0 24 24"><path d="M12 2C6 2 3 8 3 12s3 10 9 10 9-4 9-10S18 2 12 2z"/><path d="M12 6v12M8 10l4-4 4 4"/></svg>
          </div>
          <div>
            <div class="brand">Hyd<span>rEx</span></div>
            <div style="font-size:10px;color:#64748b;">Hydrological Resource Exchange</div>
          </div>
        </div>
        <div class="doc-type">
          <h2>Water Credit Contract</h2>
          <span class="badge">${categoryLabel}</span>
        </div>
      </div>

      <div class="contract-strip">
        <div><div class="label">Contract ID</div><div class="value">${contract.id}</div></div>
        <div><div class="label">Date</div><div class="value">${contract.date}</div></div>
        <div><div class="label">Status</div><div class="value">${contract.status.toUpperCase()}</div></div>
      </div>

      <div class="section-title">Parties Involved</div>
      <table class="info">
        <tr><td>Project Name</td><td>${contract.projectName}</td></tr>
        <tr><td>Seller</td><td>${contract.seller}</td></tr>
        <tr><td>Buyer</td><td>${contract.buyer}</td></tr>
        <tr><td>Location / Province</td><td>${contract.province}</td></tr>
      </table>

      <div class="section-title">Transaction Details</div>
      <div class="amount-grid">
        <div class="amount-box"><div class="alabel">Water Credits</div><div class="avalue">${contract.quantity.toLocaleString()} m³</div></div>
        <div class="amount-box"><div class="alabel">Price per m³</div><div class="avalue">${fmtUSD(contract.pricePerCredit)}</div></div>
        <div class="amount-box"><div class="alabel">Total Amount</div><div class="avalue green">${fmtUSD(contract.totalAmount)}</div></div>
      </div>

      <div class="section-title">${isCorp ? "Corporate Details" : "Certification Details"}</div>
      <table class="info">${extraRows}
        <tr><td>Verifier</td><td>${contract.verifier}</td></tr>
      </table>

      ${contract.blockchainTxHash ? `<div class="blockchain"><div class="blabel">Blockchain Transaction Hash</div><div class="bvalue">${contract.blockchainTxHash}</div></div>` : ""}

      <div class="footer">
        <div class="seal"><div class="seal-circle">OFFICIAL<br>DOCUMENT</div><div style="font-size:9px;color:#64748b;margin-top:4px;">HydrEx Platform</div></div>
        <div class="footer-note">
          This contract is electronically generated and verified by HydrEx.<br>
          Document generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        </div>
      </div>
    </div></body></html>`;

    openPDF(html, `HydrEx-Contract-${contract.id}.pdf`);
  };

  // ── Download WCPA PDF ───────────────────────────────────────────────────────
  const downloadWCPA = (contractId: string) => {
    const wcpa = wcpaDocuments.find((w) => w.contractId === contractId);
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;
    const isCorp = contract.listingCategory === "corporate";
    const accentColor = isCorp ? "#8b5cf6" : "#0891b2";
    const issuedDate = wcpa?.issuedAt
      ? new Date(wcpa.issuedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-GB");
    const validDate = wcpa?.validUntil
      ? new Date(wcpa.validUntil).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "N/A";

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>WCPA - ${contractId}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Inter', Arial, sans-serif; background:#fff; color:#1a1a2e; }
      .page { width:210mm; min-height:297mm; margin:0 auto; padding:14mm 16mm; }
      .header { display:flex; align-items:center; justify-content:space-between; padding-bottom:12px; border-bottom:3px solid ${accentColor}; margin-bottom:20px; }
      .brand { font-size:22px; font-weight:800; color:#0c1220; }
      .brand span { color:${accentColor}; }
      .doc-title { text-align:right; }
      .doc-title h2 { font-size:14px; font-weight:700; text-transform:uppercase; color:#0c1220; letter-spacing:1px; }
      .doc-title p { font-size:11px; color:#64748b; margin-top:3px; }
      /* Highlight banner */
      .banner { background:linear-gradient(135deg,${accentColor}18,${accentColor}08); border:1px solid ${accentColor}33; border-radius:12px; padding:16px 20px; margin-bottom:20px; text-align:center; }
      .banner h3 { font-size:16px; font-weight:800; color:${accentColor}; margin-bottom:4px; }
      .banner p { font-size:11px; color:#64748b; }
      /* Dates row */
      .dates-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px; }
      .date-box { background:#f8fafc; border-radius:8px; padding:12px 14px; border-top:3px solid ${accentColor}; text-align:center; }
      .date-box .dlabel { font-size:10px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
      .date-box .dvalue { font-size:14px; font-weight:700; color:#0c1220; }
      /* Info table */
      .section-title { font-size:11px; font-weight:700; color:${accentColor}; text-transform:uppercase; letter-spacing:1px; margin:16px 0 8px; padding-bottom:4px; border-bottom:1px solid ${accentColor}33; }
      table.info { width:100%; border-collapse:collapse; }
      table.info tr { border-bottom:1px solid #f1f5f9; }
      table.info td { padding:7px 8px; font-size:12px; }
      table.info td:first-child { color:#64748b; font-weight:600; width:38%; }
      table.info td:last-child { color:#1a1a2e; font-weight:500; }
      /* Amount */
      .amount-box { background:#f8fafc; border-radius:10px; padding:14px 18px; border-left:4px solid #10b981; margin:14px 0; display:flex; justify-content:space-between; align-items:center; }
      .amount-box .alabel { font-size:11px; color:#64748b; font-weight:600; }
      .amount-box .avalue { font-size:22px; font-weight:800; color:#10b981; }
      /* Terms */
      .terms { background:#f8fafc; border-radius:8px; padding:14px 16px; margin-top:16px; }
      .terms h4 { font-size:11px; font-weight:700; color:#0c1220; margin-bottom:8px; text-transform:uppercase; }
      .terms ul { padding-left:16px; }
      .terms li { font-size:11px; color:#475569; line-height:1.6; margin-bottom:3px; }
      /* Footer */
      .footer { margin-top:24px; padding-top:14px; border-top:2px solid #e2e8f0; display:flex; justify-content:space-between; align-items:flex-end; }
      .seal-circle { width:70px; height:70px; border-radius:50%; border:2.5px dashed ${accentColor}; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; color:${accentColor}; text-align:center; line-height:1.3; }
      .footer-note { font-size:9px; color:#94a3b8; text-align:right; }
      @media print { .page { padding:10mm 12mm; } }
    </style></head>
    <body><div class="page">
      <div class="header">
        <div>
          <div class="brand">Hyd<span>rEx</span></div>
          <div style="font-size:10px;color:#64748b;">Hydrological Resource Exchange</div>
        </div>
        <div class="doc-title">
          <h2>Water Credit Purchase Agreement</h2>
          <p>WCPA — Official Document</p>
        </div>
      </div>

      <div class="banner">
        <h3>Water Credit Purchase Agreement (WCPA)</h3>
        <p>${contract.listingCategory === "community" ? "Community Water Credit Transaction" : "Corporate Water Quota Transaction"} • Ref: ${wcpa?.id || contractId}</p>
      </div>

      <div class="dates-row">
        <div class="date-box"><div class="dlabel">Issued Date</div><div class="dvalue">${issuedDate}</div></div>
        <div class="date-box"><div class="dlabel">Valid Until</div><div class="dvalue">${validDate}</div></div>
      </div>

      <div class="section-title">Agreement Parties</div>
      <table class="info">
        <tr><td>Project Name</td><td>${contract.projectName}</td></tr>
        <tr><td>Seller / Provider</td><td>${contract.seller}</td></tr>
        <tr><td>Buyer / Recipient</td><td>${contract.buyer}</td></tr>
        <tr><td>Province / Location</td><td>${contract.province}</td></tr>
        <tr><td>Category</td><td>${contract.listingCategory === "community" ? "Community Water Credit" : "Corporate Water Quota"}</td></tr>
        <tr><td>Reference Contract</td><td style="font-family:monospace;font-size:10px;">${contractId}</td></tr>
      </table>

      <div class="amount-box">
        <div><div class="alabel">Water Credits Transferred</div></div>
        <div class="avalue">${contract.quantity.toLocaleString()} m³</div>
      </div>

      <div class="terms">
        <h4>Agreement Terms & Conditions</h4>
        <ul>
          <li>The buyer acknowledges receipt of the water credits listed above as specified in the contract.</li>
          <li>Water credits are issued and verified by the HydrEx platform in accordance with applicable water credit standards.</li>
          <li>This agreement is binding upon both parties from the issued date until the validity expiry.</li>
          <li>Any disputes shall be resolved in accordance with the HydrEx platform policies and applicable law.</li>
          <li>Credits transferred under this agreement may not be re-sold or transferred without prior authorization.</li>
        </ul>
      </div>

      <div class="footer">
        <div style="text-align:center"><div class="seal-circle">WCPA<br>VERIFIED</div><div style="font-size:9px;color:#64748b;margin-top:4px;">HydrEx Platform</div></div>
        <div class="footer-note">
          This WCPA is electronically issued and verified by HydrEx.<br>
          Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        </div>
      </div>
    </div></body></html>`;

    openPDF(html, `HydrEx-WCPA-${contractId}.pdf`);
  };

  // ── Download Certificate PDF ────────────────────────────────────────────────
  const downloadCertificate = (transactionId: string) => {
    const cert = getCertificateByTransaction(transactionId);
    if (!cert) return;
    const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const hasCommunity = cert.credits.some(
      (c) => c.listingCategory === "community",
    );
    const accentColor = hasCommunity ? "#10b981" : "#8b5cf6";

    const creditRows = cert.credits
      .map(
        (c) => `
      <div class="credit-item">
        <div class="credit-header">
          <span class="cat-badge" style="background:${c.listingCategory === "community" ? "#10b98122" : "#8b5cf622"};color:${c.listingCategory === "community" ? "#10b981" : "#8b5cf6"};">
            ${c.listingCategory === "community" ? "Community" : "Corporate"}
          </span>
          <strong style="font-size:13px;">${c.projectName}</strong>
        </div>
        <div class="credit-meta">
          <span><b>${c.quantity.toLocaleString()} m³</b> transferred</span>
          ${c.certificationStandard ? `<span>${c.certificationStandard}</span>` : ""}
          ${c.vintageYear ? `<span>Vintage ${c.vintageYear}</span>` : ""}
          ${c.tradingIntent ? `<span>Intent: ${c.tradingIntent.toUpperCase()}</span>` : ""}
          ${c.companyIndustry ? `<span>${c.companyIndustry}</span>` : ""}
        </div>
        ${c.serialNumbers?.length ? `<div class="serials"><span class="slabel">Serial Numbers:</span> ${c.serialNumbers.join(" • ")}</div>` : ""}
      </div>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Certificate - ${cert.id}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Inter', Arial, sans-serif; background:#fff; color:#1a1a2e; }
      .page { width:210mm; min-height:297mm; margin:0 auto; padding:14mm 16mm; position:relative; overflow:hidden; }
      /* Decorative background ring */
      .bg-ring { position:absolute; top:-60px; right:-60px; width:280px; height:280px; border-radius:50%; border:40px solid ${accentColor}08; z-index:0; }
      .bg-ring2 { position:absolute; bottom:-80px; left:-80px; width:320px; height:320px; border-radius:50%; border:50px solid #1e88e508; z-index:0; }
      .content { position:relative; z-index:1; }
      /* Header */
      .header { display:flex; align-items:center; justify-content:space-between; padding-bottom:14px; border-bottom:3px solid ${accentColor}; margin-bottom:22px; }
      .brand-block { display:flex; align-items:center; gap:10px; }
      .logo-box { width:46px; height:46px; background:linear-gradient(135deg,#1e88e5,${accentColor}); border-radius:12px; display:flex; align-items:center; justify-content:center; }
      .logo-box svg { width:28px; height:28px; fill:none; stroke:#fff; stroke-width:2; }
      .brand { font-size:22px; font-weight:900; color:#0c1220; }
      .brand span { color:${accentColor}; }
      .cert-label { text-align:right; }
      .cert-label h2 { font-size:13px; font-weight:700; text-transform:uppercase; color:#0c1220; letter-spacing:1.5px; }
      .cert-label p { font-size:10px; color:#64748b; margin-top:2px; }
      /* Hero area */
      .hero { text-align:center; padding:22px 0 18px; border-bottom:1px dashed #e2e8f0; margin-bottom:22px; }
      .hero-title { font-size:24px; font-weight:900; color:#0c1220; text-transform:uppercase; letter-spacing:2px; margin-bottom:6px; }
      .hero-sub { font-size:12px; color:#64748b; margin-bottom:18px; }
      .confirms { font-size:11px; color:#94a3b8; margin-bottom:6px; font-style:italic; }
      .big-number { font-size:48px; font-weight:900; color:${accentColor}; line-height:1; }
      .big-unit { font-size:16px; font-weight:700; color:${accentColor}; }
      .hero-buyer { font-size:14px; font-weight:700; color:#0c1220; margin-top:10px; }
      .hero-buyer span { color:${accentColor}; }
      /* Credit items */
      .section-title { font-size:11px; font-weight:700; color:${accentColor}; text-transform:uppercase; letter-spacing:1px; margin:0 0 10px; padding-bottom:4px; border-bottom:1px solid ${accentColor}33; }
      .credit-item { background:#f8fafc; border-radius:10px; padding:12px 14px; margin-bottom:10px; border-left:4px solid ${accentColor}; }
      .credit-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
      .cat-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; }
      .credit-meta { display:flex; gap:12px; flex-wrap:wrap; font-size:11px; color:#475569; margin-bottom:4px; }
      .credit-meta b { color:#1a1a2e; }
      .serials { font-size:10px; color:#94a3b8; margin-top:3px; font-family:monospace; }
      .slabel { font-weight:600; color:#64748b; }
      /* Cert ID row */
      .cert-meta { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin:16px 0; }
      .meta-box { background:#f0f4ff; border-radius:8px; padding:10px 12px; text-align:center; }
      .meta-box .mlabel { font-size:9px; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
      .meta-box .mvalue { font-size:11px; color:#0c1220; font-weight:700; word-break:break-all; font-family:monospace; }
      /* Blockchain */
      .blockchain { background:#0c1220; border-radius:8px; padding:10px 14px; margin:12px 0; }
      .blockchain .blabel { font-size:9px; color:#64748b; font-weight:600; text-transform:uppercase; }
      .blockchain .bvalue { font-size:9px; color:#60a5fa; font-family:monospace; word-break:break-all; margin-top:3px; }
      /* Footer */
      .footer { margin-top:20px; padding-top:14px; border-top:2px solid #e2e8f0; display:flex; justify-content:space-between; align-items:flex-end; }
      .seal-outer { text-align:center; }
      .seal-circle { width:76px; height:76px; border-radius:50%; border:3px solid ${accentColor}; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:800; color:${accentColor}; text-align:center; line-height:1.3; background:${accentColor}0a; text-transform:uppercase; letter-spacing:0.5px; }
      .footer-note { font-size:9px; color:#94a3b8; text-align:right; line-height:1.6; }
      @media print { .page { padding:10mm 12mm; } }
    </style></head>
    <body><div class="page">
      <div class="bg-ring"></div>
      <div class="bg-ring2"></div>
      <div class="content">

        <div class="header">
          <div class="brand-block">
            <div class="logo-box">
              <svg viewBox="0 0 24 24"><path d="M12 2C6 2 3 8 3 12s3 10 9 10 9-4 9-10S18 2 12 2z"/><path d="M12 6v12M8 10l4-4 4 4"/></svg>
            </div>
            <div>
              <div class="brand">Hyd<span>rEx</span></div>
              <div style="font-size:10px;color:#64748b;">Hydrological Resource Exchange</div>
            </div>
          </div>
          <div class="cert-label">
            <h2>Water Credit Certificate</h2>
            <p>Official Verification Document</p>
          </div>
        </div>

        <div class="hero">
          <div class="hero-title">Water Credit Certificate</div>
          <div class="hero-sub">This certificate confirms that the following water credits have been officially purchased and transferred</div>
          <div class="confirms">Total Water Credits Transferred</div>
          <div class="big-number">${cert.totalCredits.toLocaleString()}</div>
          <div class="big-unit">m³ (cubic meters)</div>
          <div class="hero-buyer">Issued to: <span>${cert.buyerName}</span></div>
        </div>

        <div class="section-title">Credit Details</div>
        ${creditRows}

        <div class="cert-meta">
          <div class="meta-box"><div class="mlabel">Certificate ID</div><div class="mvalue">${cert.id}</div></div>
          <div class="meta-box"><div class="mlabel">Transaction ID</div><div class="mvalue">${cert.transactionId}</div></div>
          <div class="meta-box"><div class="mlabel">Issue Date</div><div class="mvalue" style="font-family:inherit;font-size:12px;">${issuedDate}</div></div>
        </div>

        ${cert.blockchainTxHash ? `<div class="blockchain"><div class="blabel">✓ Blockchain Verified — Transaction Hash</div><div class="bvalue">${cert.blockchainTxHash}</div></div>` : ""}

        <div class="footer">
          <div class="seal-outer">
            <div class="seal-circle">Verified<br>Water<br>Credit</div>
            <div style="font-size:9px;color:#64748b;margin-top:5px;">HydrEx Platform</div>
          </div>
          <div class="footer-note">
            This certificate is electronically issued by HydrEx Platform.<br>
            Blockchain Verified: ${cert.blockchainVerified ? "Yes ✓" : "No"}<br>
            Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>

      </div>
    </div></body></html>`;

    openPDF(html, `HydrEx-Certificate-${cert.id}.pdf`);
  };

  const getMarketplaceStats = () => {
    const activeListings = listings.filter((l) => l.status === "active");
    return {
      totalListings: activeListings.length,
      communityListings: activeListings.filter(isCommunityListing).length,
      corporateListings: activeListings.filter(isCorporateListing).length,
      totalCreditsAvailable: listings.reduce(
        (sum, l) => sum + l.availableCredits,
        0,
      ),
      totalTransactions: transactions.length,
      totalCreditsSold: listings.reduce((sum, l) => sum + l.totalSold, 0),
      averagePrice:
        listings.length > 0
          ? listings.reduce((sum, l) => sum + l.pricePerTon, 0) /
            listings.length
          : 0,
    };
  };

  return (
    <MarketplaceContext.Provider
      value={{
        listings,
        getListingById,
        addListing,
        updateListing,
        getCommunityListings,
        getCorporateListings,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        transactions,
        createTransaction,
        getTransactionById,
        updateTransactionStatus,
        contracts,
        wcpaDocuments,
        getContractByTransaction,
        downloadContract,
        downloadWCPA,
        downloadCertificate,
        certificates,
        getCertificateByTransaction,
        getMarketplaceStats,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
};

export default MarketplaceContext;
