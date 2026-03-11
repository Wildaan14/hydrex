import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, ShoppingCart, Zap } from "lucide-react";

interface HomeHeroProps {
    user: any;
    language: string;
    theme: any;
    getGreeting: () => string;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ user, language, theme, getGreeting }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-bg rounded-2xl overflow-hidden"
            style={{ minHeight: "180px", position: "relative" }}
        >
            {/* Grid overlay for texture */}
            <div className="grid-overlay absolute inset-0" />

            {/* Content */}
            <div className="relative z-10 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div>
                    {/* Platform badge */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="feature-pill text-xs py-1 px-3">
                            <Droplets className="w-3.5 h-3.5 inline mr-1" />
                            Water Credit Platform
                        </span>
                        <span
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}
                        >
                            🟢 {language === "id" ? "Aktif" : "Active"}
                        </span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5 leading-tight">
                        {getGreeting()},{" "}
                        <span style={{ color: "#6ee7b7" }}>{user?.name?.split(" ")[0]}</span>! 👋
                    </h1>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {language === "id"
                            ? "Berikut ringkasan aktivitas kredit air Anda hari ini"
                            : "Here's your water credit activity summary for today"}
                    </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3">
                    <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            color: "white",
                            backdropFilter: "blur(8px)",
                        }}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {language === "id" ? "Beli Kredit Air" : "Buy Water Credits"}
                    </Link>
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 text-white"
                        style={{
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                            boxShadow: "0 4px 16px rgba(5,150,105,0.4)",
                        }}
                    >
                        <Zap className="w-4 h-4" />
                        {language === "id" ? "Buat Proyek" : "New Project"}
                    </Link>
                </div>
            </div>

            {/* Decorative orbs */}
            <div
                className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full opacity-20 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`,
                    filter: "blur(20px)",
                }}
            />
            <div
                className="absolute bottom-[-30px] left-[30%] w-48 h-48 rounded-full opacity-15 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, ${theme.secondary} 0%, transparent 70%)`,
                    filter: "blur(30px)",
                }}
            />
        </motion.div>
    );
};
