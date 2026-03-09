import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  CheckCircle, 
  Mail,
  Shield,
  Clock
} from "lucide-react";
import { useAuth, UserRole } from "../context/AuthContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

// Logo path
const logoPath = "/logo.png";

type Step = "select-type" | "fill-data" | "verify-email";
type AccountType = "user" | "company";

// Fungsi untuk generate random 6-digit code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;

  const [step, setStep] = useState<Step>("select-type");
  const [accountType, setAccountType] = useState<AccountType>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  
  // Email verification states
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    setStep("fill-data");
  };

  const handleBack = () => {
    if (step === "verify-email") {
      setStep("fill-data");
    } else {
      setStep("select-type");
    }
    setError("");
  };

  const handleContinueToVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi input
    if (!name.trim()) {
      setError("Silakan masukkan nama lengkap Anda");
      return;
    }
    if (!email.trim()) {
      setError("Silakan masukkan alamat email Anda");
      return;
    }
    if (!email.includes("@")) {
      setError("Silakan masukkan alamat email yang valid");
      return;
    }
    if (password.length < 6) {
      setError("Password harus minimal 6 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }
    if (!agreeTerms) {
      setError("Silakan setujui syarat dan ketentuan");
      return;
    }

    setIsVerifying(true);
    try {
      const role: UserRole = accountType === "company" ? "company" : "user";
      const res = await register(name, email, password, role);

      if (res.success) {
        setStep("verify-email");
      } else {
        setError(res.message || "Email sudah terdaftar. Silakan gunakan email lain.");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: theme.bgDark }}
    >
      {/* Kiri - Formulir Pendaftaran */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Langkah Proses */}
          <div className="flex items-center gap-2 mb-8">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0"
                style={{ 
                  backgroundColor: step !== "select-type" ? theme.primary : theme.primary 
                }}
              >
                {step !== "select-type" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  "1"
                )}
              </div>
              <span
                className="text-xs md:text-sm font-medium whitespace-nowrap"
                style={{
                  color: step === "select-type" ? theme.textPrimary : theme.primary,
                }}
              >
                Pilih Tipe
              </span>
            </div>

            {/* Divider 1 */}
            <div
              className="flex-1 h-0.5 min-w-[20px]"
              style={{ backgroundColor: theme.border }}
            >
              <div
                className="h-full transition-all"
                style={{
                  backgroundColor: theme.primary,
                  width: step !== "select-type" ? "100%" : "0%",
                }}
              />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                style={{
                  backgroundColor: step === "verify-email" ? theme.primary : 
                                  step === "fill-data" ? theme.primary : theme.bgCard,
                  color: step === "fill-data" || step === "verify-email" ? "white" : theme.textMuted,
                  border: step === "fill-data" || step === "verify-email" ? "none" : `1px solid ${theme.border}`,
                }}
              >
                {step === "verify-email" ? <CheckCircle className="w-5 h-5" /> : "2"}
              </div>
              <span
                className="text-xs md:text-sm font-medium whitespace-nowrap"
                style={{
                  color: step === "fill-data" || step === "verify-email" ? theme.textPrimary : theme.textMuted,
                }}
              >
                Data Anda
              </span>
            </div>

            {/* Divider 2 */}
            <div
              className="flex-1 h-0.5 min-w-[20px]"
              style={{ backgroundColor: theme.border }}
            >
              <div
                className="h-full transition-all"
                style={{
                  backgroundColor: theme.primary,
                  width: step === "verify-email" ? "100%" : "0%",
                }}
              />
            </div>

            {/* Step 3 - Email Verification */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                style={{
                  backgroundColor: step === "verify-email" ? theme.primary : theme.bgCard,
                  color: step === "verify-email" ? "white" : theme.textMuted,
                  border: step === "verify-email" ? "none" : `1px solid ${theme.border}`,
                }}
              >
                3
              </div>
              <span
                className="text-xs md:text-sm font-medium whitespace-nowrap"
                style={{
                  color: step === "verify-email" ? theme.textPrimary : theme.textMuted,
                }}
              >
                Verifikasi
              </span>
            </div>
          </div>

          {/* Pesan Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl flex items-center gap-3"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Langkah 1: Pilih Tipe Akun */}
          {step === "select-type" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <img src={logoPath} alt="Logo HYDREX" className="h-16 w-auto" />
              </div>

              <div className="text-center mb-8">
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ color: theme.textPrimary }}
                >
                  Buat Akun
                </h2>
                <p style={{ color: theme.textSecondary }}>
                  Pilih tipe akun untuk memulai
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleSelectType("user")}
                  className="w-full p-6 rounded-2xl text-left group transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.secondary;
                    e.currentTarget.style.backgroundColor = `${theme.secondary}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.backgroundColor = theme.bgCard;
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-xl transition-colors"
                      style={{
                        backgroundColor: `${theme.secondary}20`,
                        color: theme.secondary,
                      }}
                    >
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        Individu
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: theme.textSecondary }}
                      >
                        Untuk penggunaan pribadi, melacak jejak air Anda dan
                        mengimbangi konsumsi
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectType("company")}
                  className="w-full p-6 rounded-2xl text-left group transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.primary;
                    e.currentTarget.style.backgroundColor = `${theme.primary}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.backgroundColor = theme.bgCard;
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-xl transition-colors"
                      style={{
                        backgroundColor: `${theme.primary}20`,
                        color: theme.primary,
                      }}
                    >
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold mb-1"
                        style={{ color: theme.textPrimary }}
                      >
                        Perusahaan
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: theme.textSecondary }}
                      >
                        Untuk bisnis, kelola kredit air perusahaan dan
                        laporan ESG
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <p
                className="text-center mt-8"
                style={{ color: theme.textSecondary }}
              >
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="font-medium hover:opacity-80"
                  style={{ color: theme.primary }}
                >
                  Masuk
                </Link>
              </p>
            </motion.div>
          )}

          {/* Langkah 2: Isi Data */}
          {step === "fill-data" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
                style={{ color: theme.textSecondary }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Kembali</span>
              </button>

              <div className="mb-6">
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: theme.textPrimary }}
                >
                  Lengkapi Profil Anda
                </h2>
                <p style={{ color: theme.textSecondary }}>
                  Isi data Anda untuk membuat akun{" "}
                  <span style={{ color: accountType === "company" ? theme.primary : theme.secondary }}>
                    {accountType === "company" ? "Perusahaan" : "Individu"}
                  </span>{" "}
                  Anda
                </p>
              </div>

              <form onSubmit={handleContinueToVerification} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: theme.bgCard,
                      border: `1px solid ${theme.border}`,
                    }}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: theme.bgCard,
                      border: `1px solid ${theme.border}`,
                    }}
                    placeholder="email@contoh.com"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: theme.bgCard,
                      border: `1px solid ${theme.border}`,
                    }}
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    Konfirmasi Kata Sandi
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: theme.bgCard,
                      border: `1px solid ${theme.border}`,
                    }}
                    placeholder="Konfirmasi kata sandi"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded accent-blue-500"
                  />
                  <span className="text-sm" style={{ color: theme.textSecondary }}>
                    Saya setuju dengan{" "}
                    <Link
                      to="/terms"
                      className="font-medium group-hover:opacity-80"
                      style={{ color: theme.primary }}
                    >
                      Syarat dan Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link
                      to="/privacy"
                      className="font-medium group-hover:opacity-80"
                      style={{ color: theme.primary }}
                    >
                      Kebijakan Privasi
                    </Link>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Lanjutkan ke Verifikasi
                      <Mail className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p
                className="text-center mt-6"
                style={{ color: theme.textSecondary }}
              >
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="font-medium hover:opacity-80"
                  style={{ color: theme.primary }}
                >
                  Masuk
                </Link>
              </p>
            </motion.div>
          )}

          {/* Langkah 3: Verifikasi Email */}
          {step === "verify-email" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
                style={{ color: theme.textSecondary }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Kembali</span>
              </button>

              <div className="text-center mb-8">
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`,
                  }}
                >
                  <Mail className="w-10 h-10" style={{ color: theme.primary }} />
                </div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: theme.textPrimary }}
                >
                  Verifikasi Email
                </h2>
                <p className="mb-1" style={{ color: theme.textSecondary }}>
                  Kami telah mengirim kode verifikasi ke
                </p>
                <p className="font-medium" style={{ color: theme.primary }}>
                  {email}
                </p>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="w-full mt-6 py-3 px-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                }}
              >
                Ke Halaman Login
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Kanan - Ilustrasi */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center p-8"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}15, ${theme.secondary}15)`,
        }}
      >
        <div className="max-w-lg text-center">
          <div className="mb-8">
            <img src={logoPath} alt="Logo HYDREX" className="h-24 w-auto mx-auto" />
          </div>
          <h3
            className="text-3xl font-bold mb-4"
            style={{ color: theme.textPrimary }}
          >
            Bergabunglah dengan HYDREX
          </h3>
          <p className="text-lg mb-8" style={{ color: theme.textSecondary }}>
            Platform perdagangan kredit air terpercaya untuk masa depan yang
            lebih hijau
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div
              className="p-6 rounded-2xl"
              style={{ backgroundColor: theme.bgCard }}
            >
              <h4
                className="text-3xl font-bold mb-2"
                style={{ color: theme.primary }}
              >
                10K+
              </h4>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                Pengguna Aktif
              </p>
            </div>
            <div
              className="p-6 rounded-2xl"
              style={{ backgroundColor: theme.bgCard }}
            >
              <h4
                className="text-3xl font-bold mb-2"
                style={{ color: theme.secondary }}
              >
                500+
              </h4>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                Proyek Air
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
