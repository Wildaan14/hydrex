import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingCart,
  FolderKanban,
  Calculator,
  MessageSquare,
  Newspaper,
  GraduationCap,
  FileText,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  Building2,
  Crown,
  Globe,
  TrendingUp,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "./ThemeProvider";

interface NavItem {
  name: string;
  nameEn: string;
  path: string;
  icon: React.ReactNode;
  roles?: ("admin" | "user" | "company")[];
}

const navItems: NavItem[] = [
  { name: "Beranda", nameEn: "Home", path: "/home", icon: <Home size={17} /> },
  { name: "Marketplace", nameEn: "Marketplace", path: "/marketplace", icon: <ShoppingCart size={17} /> },
  { name: "Proyek", nameEn: "Projects", path: "/projects", icon: <FolderKanban size={17} /> },
  { name: "Kalkulator", nameEn: "Calculator", path: "/calculator", icon: <Calculator size={17} /> },
  { name: "Forum", nameEn: "Forum", path: "/forum", icon: <MessageSquare size={17} /> },
  { name: "Berita", nameEn: "News", path: "/news", icon: <Newspaper size={17} /> },
  { name: "Edukasi", nameEn: "Education", path: "/education", icon: <GraduationCap size={17} /> },
  { name: "Laporan", nameEn: "Reports", path: "/reports", icon: <FileText size={17} /> },
  { name: "MRV Dashboard", nameEn: "MRV Dashboard", path: "/mrv-dashboard", icon: <BarChart3 size={17} />, roles: ["admin", "company"] },
  { name: "ESG Scoring", nameEn: "ESG Scoring", path: "/esg-scoring", icon: <TrendingUp size={17} />, roles: ["admin", "company"] },
  { name: "Admin Panel", nameEn: "Admin", path: "/admin", icon: <Shield size={17} />, roles: ["admin"] },
];

// ── Design tokens ────────────────────────────────────────────────────────────
const dark = {
  primary: "#06d6a0",        // vibrant teal-green
  primaryGlow: "rgba(6,214,160,0.15)",
  bg: "#0b0f1a",             // very deep navy
  sidebar: "#0f1523",        // slightly lighter navy
  sidebarBorder: "rgba(255,255,255,0.05)",
  header: "rgba(11,15,26,0.85)",
  card: "#141927",
  border: "rgba(255,255,255,0.06)",
  text: "#e8edf5",
  textSub: "#7c8db5",
  textMuted: "#3d4f72",
  active: "rgba(6,214,160,0.1)",
  hover: "rgba(255,255,255,0.04)",
  accent: "#4a6cf7",         // blue accent
};
const light = {
  primary: "#059669",
  primaryGlow: "rgba(5,150,105,0.12)",
  bg: "#f0f4f8",
  sidebar: "#ffffff",
  sidebarBorder: "rgba(0,0,0,0.06)",
  header: "rgba(255,255,255,0.9)",
  card: "#ffffff",
  border: "rgba(0,0,0,0.07)",
  text: "#0f172a",
  textSub: "#5a6882",
  textMuted: "#9ba8c0",
  active: "rgba(5,150,105,0.08)",
  hover: "rgba(0,0,0,0.03)",
  accent: "#2563eb",
};

const SIDEBAR_FULL = 216;
const SIDEBAR_MINI = 56;
const HEADER_H = 60;

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme: colorTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const t = colorTheme === "dark" ? dark : light;
  const isDark = colorTheme === "dark";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const sidebarW = collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;

  const handleLogout = () => { logout(); navigate("/login"); };

  const filteredItems = navItems.filter(
    (i) => !i.roles || (user && i.roles.includes(user.role))
  );

  const getRoleIcon = (sz = 14) => {
    if (user?.role === "admin") return <Crown size={sz} style={{ color: "#f59e0b" }} />;
    if (user?.role === "company") return <Building2 size={sz} style={{ color: "#60a5fa" }} />;
    return <User size={sz} style={{ color: t.primary }} />;
  };

  // ── Sidebar content ──────────────────────────────────────────────────────
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col" style={{ height: "100%" }}>

      {/* Logo row */}
      <div
        className="flex items-center flex-shrink-0"
        style={{
          height: HEADER_H,
          paddingLeft: collapsed && !mobile ? 12 : 16,
          paddingRight: 12,
          borderBottom: `1px solid ${t.sidebarBorder}`,
        }}
      >
        <Link
          to="/home"
          onClick={mobile ? () => setMobileOpen(false) : undefined}
          className="flex items-center gap-2.5 min-w-0 flex-1"
          style={{ textDecoration: "none" }}
        >
          {/* Use logo.png from public */}
          <img
            src="/logo.png"
            alt="HYDREX"
            style={{
              width: 28,
              height: 28,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          {(!collapsed || mobile) && (
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.08em",
                color: t.text,
                lineHeight: 1,
              }}
            >
              HYDREX
            </span>
          )}
        </Link>

        {/* Collapse toggle — desktop only */}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md transition-opacity"
            style={{ color: t.textMuted, opacity: 0.7 }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        )}

        {/* Mobile close */}
        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="flex-shrink-0 p-1 rounded-md"
            style={{ color: t.textMuted }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ overflowX: "hidden" }}>
        {filteredItems.map((item) => {
          const active = location.pathname === item.path;
          const label = language === "id" ? item.name : item.nameEn;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={mobile ? () => setMobileOpen(false) : undefined}
              title={collapsed && !mobile ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "1px 8px",
                padding: "8px 10px",
                borderRadius: 8,
                textDecoration: "none",
                color: active ? t.primary : t.textSub,
                backgroundColor: active ? t.active : "transparent",
                fontWeight: active ? 600 : 400,
                fontSize: 13.5,
                fontFamily: "'Space Grotesk', sans-serif",
                justifyContent: collapsed && !mobile ? "center" : "flex-start",
                transition: "background 0.15s, color 0.15s",
                position: "relative",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = t.hover;
                  (e.currentTarget as HTMLElement).style.color = t.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = t.textSub;
                }
              }}
            >
              {active && (!collapsed || mobile) && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 18,
                    borderRadius: "0 3px 3px 0",
                    backgroundColor: t.primary,
                  }}
                />
              )}
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {(!collapsed || mobile) && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="flex-shrink-0 py-1.5 px-2"
        style={{ borderTop: `1px solid ${t.sidebarBorder}` }}
      >
        {[
          { to: "/settings", label: language === "id" ? "Pengaturan" : "Settings", icon: <Settings size={17} /> },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={mobile ? () => setMobileOpen(false) : undefined}
            title={collapsed && !mobile ? item.label : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              textDecoration: "none",
              color: t.textMuted,
              fontSize: 13.5,
              fontFamily: "'Space Grotesk', sans-serif",
              justifyContent: collapsed && !mobile ? "center" : "flex-start",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = t.hover;
              (e.currentTarget as HTMLElement).style.color = t.textSub;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = t.textMuted;
            }}
          >
            {item.icon}
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          title={collapsed && !mobile ? (language === "id" ? "Keluar" : "Logout") : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            color: "#ef4444",
            fontSize: 13.5,
            fontFamily: "'Space Grotesk', sans-serif",
            justifyContent: collapsed && !mobile ? "center" : "flex-start",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
        >
          <LogOut size={17} />
          {(!collapsed || mobile) && <span>{language === "id" ? "Keluar" : "Logout"}</span>}
        </button>
      </div>
    </div>
  );

  // ── Header content ──────────────────────────────────────────────────────
  const HeaderContent = () => (
    <div className="flex items-center gap-1 ml-auto">
      {/* Language */}
      <div className="relative">
        <button
          onClick={() => { setLangMenuOpen(!langMenuOpen); setUserMenuOpen(false); }}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 10px", borderRadius: 8,
            color: t.textSub, fontSize: 12, fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em",
            background: "none", border: "none", cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = t.hover}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
        >
          <Globe size={15} />
          <span className="hidden sm:block">{language}</span>
        </button>
        {langMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
            <div
              style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)",
                width: 140, borderRadius: 12, overflow: "hidden", zIndex: 50, padding: "4px 0",
                backgroundColor: t.card, border: `1px solid ${t.border}`,
                boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.1)",
              }}
            >
              {[{ val: "id", label: "🇮🇩 Indonesia" }, { val: "en", label: "🇺🇸 English" }].map(l => (
                <button
                  key={l.val}
                  onClick={() => { setLanguage(l.val as any); setLangMenuOpen(false); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 14px", fontSize: 13,
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: language === l.val ? t.primary : t.textSub,
                    backgroundColor: language === l.val ? t.active : "transparent",
                    border: "none", cursor: "pointer",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Theme */}
      <button
        onClick={toggleTheme}
        style={{
          padding: 8, borderRadius: 8, color: t.textSub,
          background: "none", border: "none", cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = t.hover}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications */}
      <button
        style={{
          position: "relative", padding: 8, borderRadius: 8, color: t.textSub,
          background: "none", border: "none", cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = t.hover}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
      >
        <Bell size={16} />
        <span style={{
          position: "absolute", top: 6, right: 6, width: 6, height: 6,
          borderRadius: "50%", backgroundColor: t.primary,
        }} />
      </button>

      {/* User */}
      <div style={{ position: "relative", marginLeft: 2 }}>
        <button
          onClick={() => { setUserMenuOpen(!userMenuOpen); setLangMenuOpen(false); }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px 5px 6px", borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: "none", cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = t.hover}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
        >
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: `linear-gradient(135deg, ${t.primary}25, ${t.accent}25)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {getRoleIcon(14)}
          </div>
          <span className="hidden sm:block" style={{
            fontSize: 13, fontWeight: 600, color: t.text,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {user?.name?.split(" ")[0]}
          </span>
          <ChevronDown size={12} style={{ color: t.textMuted }} className="hidden sm:block" />
        </button>

        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)",
              width: 210, borderRadius: 16, overflow: "hidden", zIndex: 50,
              backgroundColor: t.card, border: `1px solid ${t.border}`,
              boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.7)" : "0 8px 32px rgba(0,0,0,0.12)",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: t.text, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 2 }}>{user?.name}</p>
                <p style={{ fontSize: 12, color: t.textMuted }}>{user?.email}</p>
              </div>
              <div style={{ padding: 6 }}>
                {[
                  { to: "/profile", label: language === "id" ? "Profil Saya" : "My Profile", icon: <User size={15} /> },
                  { to: "/settings", label: language === "id" ? "Pengaturan" : "Settings", icon: <Settings size={15} /> },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", borderRadius: 8, textDecoration: "none",
                      color: t.textSub, fontSize: 13,
                      fontFamily: "'Space Grotesk', sans-serif",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = t.hover; (e.currentTarget as HTMLElement).style.color = t.text; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = t.textSub; }}
                  >
                    {item.icon}<span>{item.label}</span>
                  </Link>
                ))}
                <div style={{ margin: "4px 0", borderTop: `1px solid ${t.border}` }} />
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "8px 12px", borderRadius: 8, fontSize: 13,
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "#ef4444", background: "none", border: "none", cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239,68,68,0.08)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                >
                  <LogOut size={15} /><span>{language === "id" ? "Keluar" : "Logout"}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: t.bg, display: "flex" }}>

      {/* ── Fixed Desktop Sidebar (hidden on < md) ── */}
      <motion.div
        animate={{ width: sidebarW }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className="hidden md:flex flex-col flex-shrink-0"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: sidebarW,
          backgroundColor: t.sidebar,
          borderRight: `1px solid ${t.sidebarBorder}`,
          zIndex: 40,
          overflow: "hidden",
        }}
      >
        <SidebarContent />
      </motion.div>

      {/* ── Main wrapper (pushes right of sidebar) ── */}
      <motion.div
        animate={{ paddingLeft: sidebarW }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className="hidden md:flex flex-col flex-1 min-w-0"
        style={{ paddingLeft: sidebarW }}
      >
        {/* Desktop Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            height: HEADER_H,
            backgroundColor: t.header,
            borderBottom: `1px solid ${t.border}`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <HeaderContent />
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </div>
      </motion.div>

      {/* ── Mobile Layout ── */}
      <div className="flex flex-col flex-1 md:hidden" style={{ minWidth: 0 }}>
        {/* Mobile Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            height: HEADER_H,
            backgroundColor: t.header,
            borderBottom: `1px solid ${t.border}`,
            backdropFilter: "blur(20px)",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
            paddingRight: 12,
            gap: 8,
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{ padding: 8, borderRadius: 8, color: t.textSub, background: "none", border: "none", cursor: "pointer" }}
          >
            <Menu size={20} />
          </button>
          <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/logo.png" alt="HYDREX" style={{ width: 24, height: 24, objectFit: "contain" }} />
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 12, color: t.text, letterSpacing: "0.08em" }}>HYDREX</span>
          </Link>
          <div style={{ flex: 1 }} />
          <button onClick={toggleTheme} style={{ padding: 8, borderRadius: 8, color: t.textSub, background: "none", border: "none", cursor: "pointer" }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button style={{ position: "relative", padding: 8, borderRadius: 8, color: t.textSub, background: "none", border: "none", cursor: "pointer" }}>
            <Bell size={16} />
            <span style={{ position: "absolute", top: 7, right: 7, width: 5, height: 5, borderRadius: "50%", backgroundColor: t.primary }} />
          </button>
        </div>
        {/* Mobile page content */}
        <div style={{ flex: 1, padding: 16 }}>
          <Outlet />
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 50 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -SIDEBAR_FULL }} animate={{ x: 0 }} exit={{ x: -SIDEBAR_FULL }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              style={{
                position: "fixed", left: 0, top: 0, bottom: 0, width: SIDEBAR_FULL,
                backgroundColor: t.sidebar,
                borderRight: `1px solid ${t.sidebarBorder}`,
                zIndex: 60,
              }}
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
