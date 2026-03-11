import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, Sun, Moon, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../ThemeProvider";
import { getRoleIcon } from "./AppSidebar";

interface AppHeaderProps {
    t: any;
    isDark: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ t, isDark }) => {
    const { user, logout } = useAuth();
    const { language, setLanguage } = useLanguage();
    const { toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    const handleLogout = () => { logout(); navigate("/login"); };

    return (
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
                        {getRoleIcon(user?.role, t.primary, 14)}
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
};
