import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HomeStatsRowProps {
    stats: any[];
    theme: any;
}

export const HomeStatsRow: React.FC<HomeStatsRowProps> = ({ stats, theme }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="stat-card p-5 rounded-2xl"
                    style={{
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.border}`,
                    }}
                >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                        <div
                            className="p-2.5 rounded-xl"
                            style={{
                                backgroundColor: `${stat.color}18`,
                                color: stat.color,
                                boxShadow: `0 0 12px ${stat.color}20`,
                            }}
                        >
                            {stat.icon}
                        </div>
                        <div
                            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${stat.trend === "up"
                                    ? "text-green-500 bg-green-500/10"
                                    : "text-red-400 bg-red-500/10"
                                }`}
                        >
                            {stat.trend === "up" ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{stat.change}</span>
                        </div>
                    </div>
                    <p className="text-xs mb-1 font-medium" style={{ color: theme.textMuted }}>
                        {stat.label}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                        <span
                            className="text-2xl font-extrabold"
                            style={{ color: theme.textPrimary }}
                        >
                            {stat.value}
                        </span>
                        <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
                            {stat.unit}
                        </span>
                    </div>
                    {/* Bottom accent bar */}
                    <div
                        className="mt-3 h-0.5 rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${stat.color}60, transparent)`,
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
};
