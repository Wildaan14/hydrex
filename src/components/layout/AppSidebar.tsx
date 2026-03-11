import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
    X,
    ChevronLeft,
    ChevronRight,
    User,
    Building2,
    Crown,
    TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../ThemeProvider";

export const getRoleIcon = (role?: string, primaryColor?: string, sz = 14) => {
    if (role === "admin") return <Crown size={sz} style={{ color: "#f59e0b" }} />;
    if (role === "company") return <Building2 size={sz} style={{ color: "#60a5fa" }} />;
    return <User size={sz} style={{ color: primaryColor }} />;
};

interface NavItem {
    name: string;
    nameEn: string;
    path: string;
    icon: React.ReactNode;
    roles?: ("admin" | "user" | "company" | "individual" | "vvb")[];
}

const navItems: NavItem[] = [
    { name: "Beranda", nameEn: "Home", path: "/home", icon: <Home size={17} /> },
    { name: "Marketplace", nameEn: "Marketplace", path: "/marketplace", icon: <ShoppingCart size={17} /> },
    { name: "Proyek", nameEn: "Projects", path: "/projects", icon: <FolderKanban size={17} />, roles: ["admin", "company"] },
    { name: "Kalkulator", nameEn: "Calculator", path: "/calculator", icon: <Calculator size={17} /> },
    { name: "Forum", nameEn: "Forum", path: "/forum", icon: <MessageSquare size={17} /> },
    { name: "Berita", nameEn: "News", path: "/news", icon: <Newspaper size={17} /> },
    { name: "Edukasi", nameEn: "Education", path: "/education", icon: <GraduationCap size={17} /> },
    { name: "Laporan", nameEn: "Reports", path: "/reports", icon: <FileText size={17} /> },
    { name: "MRV Dashboard", nameEn: "MRV Dashboard", path: "/mrv-dashboard", icon: <BarChart3 size={17} />, roles: ["admin", "company"] },
    { name: "ESG Scoring", nameEn: "ESG Scoring", path: "/esg-scoring", icon: <TrendingUp size={17} />, roles: ["admin", "company"] },
    { name: "Admin Panel", nameEn: "Admin", path: "/admin", icon: <Shield size={17} />, roles: ["admin"] },
];

interface AppSidebarProps {
    mobile?: boolean;
    collapsed: boolean;
    setCollapsed: (val: boolean) => void;
    setMobileOpen: (val: boolean) => void;
    t: any;
    HEADER_H: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ mobile = false, collapsed, setCollapsed, setMobileOpen, t, HEADER_H }) => {
    const { user, logout } = useAuth();
    const { language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate("/login"); };

    const filteredItems = navItems.filter(
        (i) => !i.roles || (user && i.roles.includes(user.role))
    );

    return (
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
};
