import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Bell,
  Lock,
  Globe,
  Moon,
  Sun,
  Shield,
  Trash2,
  Save,
  ChevronRight,
  Mail,
  Smartphone,
  CreditCard,
  Book,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../components/ThemeProvider";
import { lightPageTheme, darkPageTheme } from "../utils/appTheme";

// Simple Toggle Component dengan warna HIJAU
const Toggle: React.FC<{
  enabled: boolean;
  onChange: () => void;
  label?: string;
}> = ({ enabled, onChange, label }) => {
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      style={{
        backgroundColor: enabled ? theme.primary : "#374151", // HIJAU atau abu
      }}
    >
      <motion.span
        className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg"
        animate={{
          x: enabled ? 30 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
    </button>
  );
};

export const SettingsPage: React.FC = () => {
  const { language } = useLanguage();
  const { theme: colorTheme } = useTheme();
  const theme = colorTheme === "dark" ? darkPageTheme : lightPageTheme;

  // States
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    transaction: true,
    newsletter: false,
  });

  const [darkMode, setDarkMode] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert(language === "id" ? "Password tidak cocok!" : "Passwords don't match!");
      return;
    }
    if (newPassword.length < 6) {
      alert(
        language === "id"
          ? "Password minimal 6 karakter"
          : "Password must be at least 6 characters"
      );
      return;
    }
    alert(language === "id" ? "Password berhasil diubah!" : "Password changed successfully!");
    setShowChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>
          {language === "id" ? "Pengaturan" : "Settings"}
        </h1>
        <p style={{ color: theme.textSecondary }}>
          {language === "id"
            ? "Kelola preferensi dan keamanan akun Anda"
            : "Manage your account preferences and security"}
        </p>
      </div>

      {/* ============ NOTIFIKASI ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${theme.secondary}20` }}>
            <Bell className="w-6 h-6" style={{ color: theme.secondary }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              {language === "id" ? "Notifikasi" : "Notifications"}
            </h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {language === "id"
                ? "Kelola preferensi notifikasi Anda"
                : "Manage your notification preferences"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Email Notifications */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ backgroundColor: `${theme.border}30` }}
          >
            <div className="flex items-center gap-3 flex-1">
              <Mail className="w-5 h-5" style={{ color: theme.textMuted }} />
              <div className="flex-1">
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  {language === "id" ? "Notifikasi Email" : "Email Notifications"}
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Terima update via email" : "Receive updates via email"}
                </p>
              </div>
            </div>
            <Toggle
              enabled={notifications.email}
              onChange={() => handleToggleNotification("email")}
            />
          </div>

          {/* Push Notifications */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ backgroundColor: `${theme.border}30` }}
          >
            <div className="flex items-center gap-3 flex-1">
              <Smartphone className="w-5 h-5" style={{ color: theme.textMuted }} />
              <div className="flex-1">
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  {language === "id" ? "Push Notification" : "Push Notifications"}
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Notifikasi di browser" : "Browser notifications"}
                </p>
              </div>
            </div>
            <Toggle
              enabled={notifications.push}
              onChange={() => handleToggleNotification("push")}
            />
          </div>

          {/* Transaction Notifications */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ backgroundColor: `${theme.border}30` }}
          >
            <div className="flex items-center gap-3 flex-1">
              <CreditCard className="w-5 h-5" style={{ color: theme.textMuted }} />
              <div className="flex-1">
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  {language === "id" ? "Transaksi" : "Transactions"}
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  {language === "id"
                    ? "Notifikasi setiap transaksi"
                    : "Notify on every transaction"}
                </p>
              </div>
            </div>
            <Toggle
              enabled={notifications.transaction}
              onChange={() => handleToggleNotification("transaction")}
            />
          </div>

          {/* Newsletter */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ backgroundColor: `${theme.border}30` }}
          >
            <div className="flex items-center gap-3 flex-1">
              <Book className="w-5 h-5" style={{ color: theme.textMuted }} />
              <div className="flex-1">
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  Newsletter
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Berita dan tips mingguan" : "Weekly news and tips"}
                </p>
              </div>
            </div>
            <Toggle
              enabled={notifications.newsletter}
              onChange={() => handleToggleNotification("newsletter")}
            />
          </div>
        </div>
      </motion.div>

      {/* ============ TAMPILAN ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${theme.primary}20` }}>
            {darkMode ? (
              <Moon className="w-6 h-6" style={{ color: theme.primary }} />
            ) : (
              <Sun className="w-6 h-6" style={{ color: theme.primary }} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              {language === "id" ? "Tampilan" : "Appearance"}
            </h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {language === "id" ? "Sesuaikan tampilan aplikasi" : "Customize app appearance"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Dark Mode */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ backgroundColor: `${theme.border}30` }}
          >
            <div className="flex items-center gap-3 flex-1">
              {darkMode ? (
                <Moon className="w-5 h-5" style={{ color: theme.textMuted }} />
              ) : (
                <Sun className="w-5 h-5" style={{ color: theme.textMuted }} />
              )}
              <div className="flex-1">
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  {language === "id" ? "Mode Gelap" : "Dark Mode"}
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  {language === "id"
                    ? darkMode
                      ? "Menggunakan tema gelap"
                      : "Menggunakan tema terang"
                    : darkMode
                    ? "Using dark theme"
                    : "Using light theme"}
                </p>
              </div>
            </div>
            <Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>

          {/* Language */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ backgroundColor: `${theme.border}30` }}
          >
            <div className="flex items-center gap-3 flex-1">
              <Globe className="w-5 h-5" style={{ color: theme.textMuted }} />
              <div className="flex-1">
                <p className="font-medium" style={{ color: theme.textPrimary }}>
                  {language === "id" ? "Bahasa" : "Language"}
                </p>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  {language === "id" ? "Pilih bahasa aplikasi" : "Select app language"}
                </p>
              </div>
            </div>
            <select
              value={language}
              className="px-4 py-2 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
            >
              <option value="id">🇮🇩 Indonesia</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* ============ KEAMANAN ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6"
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${theme.primary}20` }}>
            <Shield className="w-6 h-6" style={{ color: theme.primary }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              {language === "id" ? "Keamanan" : "Security"}
            </h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {language === "id" ? "Kelola keamanan akun Anda" : "Manage your account security"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Change Password */}
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white hover:bg-opacity-5"
            style={{ backgroundColor: `${theme.border}30` }}
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5" style={{ color: theme.textMuted }} />
              <span className="font-medium" style={{ color: theme.textPrimary }}>
                {language === "id" ? "Ubah Password" : "Change Password"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: theme.textMuted }} />
          </button>

          {/* Password Change Form */}
          <AnimatePresence>
            {showChangePassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 p-4 rounded-xl"
                style={{
                  backgroundColor: `${theme.primary}10`,
                  border: `1px solid ${theme.primary}30`,
                }}
              >
                {/* Current Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    {language === "id" ? "Password Saat Ini" : "Current Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.border}`,
                        color: theme.textPrimary,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-5 h-5" style={{ color: theme.textMuted }} />
                      ) : (
                        <Eye className="w-5 h-5" style={{ color: theme.textMuted }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    {language === "id" ? "Password Baru" : "New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.border}`,
                        color: theme.textPrimary,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5" style={{ color: theme.textMuted }} />
                      ) : (
                        <Eye className="w-5 h-5" style={{ color: theme.textMuted }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textSecondary }}
                  >
                    {language === "id" ? "Konfirmasi Password Baru" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.border}`,
                        color: theme.textPrimary,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" style={{ color: theme.textMuted }} />
                      ) : (
                        <Eye className="w-5 h-5" style={{ color: theme.textMuted }} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 px-4 py-2 rounded-xl font-medium transition-colors"
                    style={{
                      backgroundColor: theme.border,
                      color: theme.textPrimary,
                    }}
                  >
                    {language === "id" ? "Batal" : "Cancel"}
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 px-4 py-2 rounded-xl font-medium text-white transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    }}
                  >
                    {language === "id" ? "Ubah Password" : "Change Password"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2FA */}
          <button
            className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white hover:bg-opacity-5"
            style={{ backgroundColor: `${theme.border}30` }}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" style={{ color: theme.textMuted }} />
              <span className="font-medium" style={{ color: theme.textPrimary }}>
                {language === "id" ? "Autentikasi 2 Faktor" : "Two-Factor Authentication"}
              </span>
            </div>
            <span
              className="px-3 py-1 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: "rgba(251, 191, 36, 0.1)",
                color: "#fbbf24",
              }}
            >
              {language === "id" ? "Nonaktif" : "Inactive"}
            </span>
          </button>
        </div>
      </motion.div>

      {/* ============ DANGER ZONE ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6"
        style={{
          backgroundColor: theme.bgCard,
          border: "1px solid rgba(239, 68, 68, 0.5)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              {language === "id" ? "Zona Bahaya" : "Danger Zone"}
            </h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {language === "id"
                ? "Tindakan permanen pada akun"
                : "Permanent actions on your account"}
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 rounded-xl font-medium transition-colors hover:bg-red-500 hover:bg-opacity-20"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
            }}
          >
            {language === "id" ? "Hapus Akun" : "Delete Account"}
          </button>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <p className="font-medium mb-2 text-red-400">
                {language === "id" ? "⚠️ Apakah Anda yakin?" : "⚠️ Are you sure?"}
              </p>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                {language === "id"
                  ? "Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen."
                  : "This action cannot be undone. All your data will be permanently deleted."}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors"
                style={{
                  backgroundColor: theme.border,
                  color: theme.textPrimary,
                }}
              >
                {language === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                onClick={() => alert(language === "id" ? "Akun dihapus" : "Account deleted")}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                {language === "id" ? "Ya, Hapus Akun Saya" : "Yes, Delete My Account"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ============ SAVE BUTTON ============ */}
      <div className="flex justify-end gap-3">
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{
                backgroundColor: `${theme.secondary}20`,
                color: theme.secondary,
              }}
            >
              <Check className="w-5 h-5" />
              <span className="font-medium">
                {language === "id" ? "Perubahan tersimpan!" : "Changes saved!"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          }}
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Save className="w-5 h-5" />
              </motion.div>
              {language === "id" ? "Menyimpan..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {language === "id" ? "Simpan Perubahan" : "Save Changes"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
