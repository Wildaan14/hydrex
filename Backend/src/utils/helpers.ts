// Generate unique ID
export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate blockchain transaction hash
export const generateTxHash = (): string => {
  return `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("")}`;
};

// Format currency
export const formatCurrency = (
  amount: number,
  currency: string = "USD",
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Calculate service fee (2.5%)
export const calculateServiceFee = (subtotal: number): number => {
  return subtotal * 0.025;
};

// Calculate tax (11%)
export const calculateTax = (subtotal: number): number => {
  return subtotal * 0.11;
};

// Paginate
export const paginate = (
  page: number,
  limit: number,
): { skip: number; limit: number } => {
  return {
    skip: (page - 1) * limit,
    limit: limit,
  };
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate serial numbers for water credits
export const generateSerialNumbers = (
  prefix: string,
  quantity: number,
  maxDisplay: number = 5,
): string[] => {
  const serials: string[] = [];
  const displayCount = Math.min(quantity, maxDisplay);

  for (let i = 0; i < displayCount; i++) {
    serials.push(`${prefix}-${String(i + 1).padStart(6, "0")}`);
  }

  return serials;
};

// Status badge colors
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    // Project status
    draft: "#94a3b8",
    pending: "#f59e0b",
    under_verification: "#3b82f6",
    verified: "#22c55e",
    rejected: "#ef4444",
    running: "#10b981",
    completed: "#8b5cf6",
    // Listing status
    active: "#22c55e",
    sold: "#8b5cf6",
    expired: "#94a3b8",
    // Transaction status
    processing: "#3b82f6",
    cancelled: "#ef4444",
    refunded: "#f59e0b",
    // ESG status
    eligible: "#22c55e",
    conditional: "#f59e0b",
    not_eligible: "#ef4444",
  };

  return colors[status] || "#94a3b8";
};

// Default verification steps
export const createDefaultVerificationSteps = () => [
  {
    id: 1,
    name: "Upload Dokumen Proyek",
    nameEn: "Project Document Upload",
    status: "completed" as const,
    description:
      "Dokumen PDD, Baseline Study, dan dokumen pendukung telah diupload",
    descriptionEn: "PDD, Baseline Study, and supporting documents uploaded",
    verifier: "HydrEx Platform",
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: 2,
    name: "Screening Administratif",
    nameEn: "Administrative Screening",
    status: "active" as const,
    description:
      "Platform melakukan review kelengkapan dokumen dan kesesuaian kategori",
    descriptionEn:
      "Platform reviews document completeness and category compliance",
  },
  {
    id: 3,
    name: "Validasi oleh VVB",
    nameEn: "Validation by VVB",
    status: "pending" as const,
    description:
      "Validation & Verification Body melakukan validasi metodologi dan baseline",
    descriptionEn: "VVB validates methodology and baseline assessment",
  },
  {
    id: 4,
    name: "Verifikasi Lapangan",
    nameEn: "Field Verification",
    status: "pending" as const,
    description: "Kunjungan lapangan dan verifikasi kondisi aktual proyek",
    descriptionEn: "Field visit and actual project condition verification",
  },
  {
    id: 5,
    name: "Sertifikasi & Registry",
    nameEn: "Certification & Registry",
    status: "pending" as const,
    description: "Penerbitan water credit dan pencatatan di registry",
    descriptionEn: "Water credit issuance and registry recording",
  },
];
