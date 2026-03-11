import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface HomePlatformOverviewProps {
    overviewItems: any[];
    language: string;
    theme: any;
}

export const HomePlatformOverview: React.FC<HomePlatformOverviewProps> = ({ overviewItems, language, theme }) => {
    return (
        <div
            className="rounded-2xl p-5"
            style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.border}`,
            }}
        >
            <h2
                className="text-base font-semibold mb-4 flex items-center gap-2"
                style={{ color: theme.textPrimary }}
            >
                <Activity className="w-4 h-4" style={{ color: theme.secondary }} />
                {language === "id" ? "Ringkasan Platform" : "Platform Overview"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {overviewItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * idx }}
                        className="rounded-xl p-3 flex flex-col gap-1"
                        style={{
                            backgroundColor: `${item.color}10`,
                            border: `1px solid ${item.color}20`,
                        }}
                    >
                        <div style={{ color: item.color }}>{item.icon}</div>
                        <p
                            className="text-xl font-bold"
                            style={{ color: theme.textPrimary }}
                        >
                            {item.value}
                        </p>
                        <p
                            className="text-xs leading-tight"
                            style={{ color: theme.textMuted }}
                        >
                            {item.label}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
