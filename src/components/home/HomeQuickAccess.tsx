import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface HomeQuickAccessProps {
    quickAccess: any[];
    language: string;
    theme: any;
}

export const HomeQuickAccess: React.FC<HomeQuickAccessProps> = ({ quickAccess, language, theme }) => {
    return (
        <div className="lg:col-span-2 space-y-4">
            <h2
                className="text-lg font-semibold"
                style={{ color: theme.textPrimary }}
            >
                {language === "id" ? "Akses Cepat" : "Quick Access"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
                {quickAccess.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.08 }}
                    >
                        <Link
                            to={item.path}
                            className="block rounded-2xl p-5 transition-all group hover:scale-[1.02]"
                            style={{
                                backgroundColor: theme.bgCard,
                                border: `1px solid ${theme.border}`,
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="p-3 rounded-xl"
                                    style={{
                                        background: item.gradient,
                                        color: item.iconColor,
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <ArrowUpRight
                                    className="w-5 h-5 transition-colors"
                                    style={{ color: theme.textMuted }}
                                />
                            </div>
                            <h3
                                className="text-lg font-semibold mb-1"
                                style={{ color: theme.textPrimary }}
                            >
                                {language === "id" ? item.name : item.nameEn}
                            </h3>
                            <p
                                className="text-sm mb-3"
                                style={{ color: theme.textSecondary }}
                            >
                                {item.desc}
                            </p>
                            <span
                                className="text-xs px-2 py-1 rounded-lg"
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    color: theme.textMuted,
                                }}
                            >
                                {item.stat}
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
