import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "./ThemeProvider";
import { AppSidebar } from "./layout/AppSidebar";
import { AppHeader } from "./layout/AppHeader";

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
  const { theme: colorTheme, toggleTheme } = useTheme();

  const t = colorTheme === "dark" ? dark : light;
  const isDark = colorTheme === "dark";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarW = collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;

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
        <AppSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
          t={t}
          HEADER_H={HEADER_H}
        />
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
          <AppHeader t={t} isDark={isDark} />
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
              <AppSidebar
                mobile
                collapsed={false}
                setCollapsed={setCollapsed}
                setMobileOpen={setMobileOpen}
                t={t}
                HEADER_H={HEADER_H}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
