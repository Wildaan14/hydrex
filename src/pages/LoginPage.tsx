import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Droplets,
  ShieldCheck,
  BarChart3,
  Globe,
  Leaf,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

const logoPath = "/logo.png";

const features = [
  { icon: <Droplets className="w-4 h-4" />, label: "Water Credits" },
  { icon: <ShieldCheck className="w-4 h-4" />, label: "Verified & Secure" },
  { icon: <BarChart3 className="w-4 h-4" />, label: "ESG Reporting" },
  { icon: <Globe className="w-4 h-4" />, label: "Global Standards" },
  { icon: <Leaf className="w-4 h-4" />, label: "Sustainability" },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    const res = await login(email, password);

    if (res.success) {
      navigate("/home");
    } else {
      setError(res.message || "Invalid email or password");
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: theme.bgDark }}
    >
      {/* ===== Left Side — Login Form ===== */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.primaryGlow} 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, ${theme.secondaryGlow} 0%, transparent 50%)`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="HYDREX" className="w-10 h-10" style={{ objectFit: "contain" }} />
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", color: theme.textPrimary }}>HYDREX</p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
              Welcome back
            </h1>
            <p style={{ color: theme.textSecondary, fontFamily: "'Space Grotesk', sans-serif" }}>
              Sign in to your HYDREX account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: theme.textSecondary, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: colorTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  border: `1.5px solid ${theme.border}`,
                  color: theme.textPrimary,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primaryGlow}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: theme.textSecondary, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-12 py-3 rounded-xl text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: colorTheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                    border: `1.5px solid ${theme.border}`,
                    color: theme.textPrimary,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primaryGlow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: theme.textMuted }}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: theme.primary }}
                />
                <span className="text-sm" style={{ color: theme.textSecondary }}>
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: theme.primary }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white hover:opacity-90 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: `0 4px 16px ${theme.primaryGlow}`,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center mt-7 text-sm" style={{ color: theme.textSecondary }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color: theme.primary }}
            >
              Create account
            </Link>
          </p>


        </motion.div>
      </div>

      {/* ===== Right Side — Hero Panel ===== */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 35%, #1e3a8a 100%)" }}
      >
        {/* Grid overlay */}
        <div className="grid-overlay absolute inset-0" />

        {/* Animated orbs */}
        <div
          className="absolute top-[10%] right-[10%] w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)",
            filter: "blur(30px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[10%] left-[5%] w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />

        <div className="relative z-10 text-center text-white max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <img
              src={logoPath}
              alt="HYDREX Logo"
              className="h-36 w-auto mx-auto"
              style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }}
            />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-3xl font-extrabold mb-2"
          >
            Hydrological Resource
            <br />
            <span style={{ color: "#6ee7b7" }}>Exchange</span>
          </motion.h2>

          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-sm mb-8"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Platform kredit air terintegrasi untuk keberlanjutan Indonesia
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {features.map((f, i) => (
              <span key={i} className="feature-pill">
                {f.icon}
                {f.label}
              </span>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-10 grid grid-cols-3 gap-4"
          >
            {[
              { value: "AWS", label: "Standard" },
              { value: "ISO", label: "14046" },
              { value: "100%", label: "Terverifikasi" },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl py-3 px-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <p className="text-lg font-bold" style={{ color: "#6ee7b7" }}>
                  {item.value}
                </p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
