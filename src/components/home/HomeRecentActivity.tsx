import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, AlertCircle, Clock, Blocks } from "lucide-react";

interface HomeRecentActivityProps {
    recentActivity: any[];
    language: string;
    theme: any;
}

export const HomeRecentActivity: React.FC<HomeRecentActivityProps> = ({ recentActivity, language, theme }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2
                    className="text-lg font-semibold"
                    style={{ color: theme.textPrimary }}
                >
                    {language === "id" ? "Aktivitas Terbaru" : "Recent Activity"}
                </h2>
                <Link
                    to="/mrv"
                    className="text-sm hover:opacity-80 flex items-center gap-1"
                    style={{ color: theme.primary }}
                >
                    {language === "id" ? "Lihat Semua" : "View All"}
                    <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>
            <div
                className="rounded-2xl divide-y"
                style={{
                    backgroundColor: theme.bgCard,
                    border: `1px solid ${theme.border}`,
                    borderColor: theme.border,
                }}
            >
                {recentActivity.length === 0
                    ? [
                        {
                            title: language === "id" ? "Pembelian" : "Purchase",
                            desc: "Water credit from Kalimantan Watershed Project",
                            time: language === "id" ? "2 jam lalu" : "2 hours ago",
                            amount: "+500 m³",
                            status: "success",
                        },
                        {
                            title: language === "id" ? "Verifikasi" : "Verification",
                            desc: "Sulawesi Water Conservation Project verified",
                            time: language === "id" ? "5 jam lalu" : "5 hours ago",
                            amount: null,
                            status: "success",
                        },
                        {
                            title: language === "id" ? "Pending" : "Pending",
                            desc: "Waiting for transfer approval",
                            time: language === "id" ? "1 hari lalu" : "1 day ago",
                            amount: "-200 m³",
                            status: "pending",
                        },
                    ].map((activity, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="p-4 flex items-start gap-3"
                            style={{ borderColor: theme.border }}
                        >
                            <div
                                className={`p-2 rounded-lg ${activity.status === "success"
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-yellow-500/10 text-yellow-400"
                                    }`}
                            >
                                {activity.status === "success" ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <AlertCircle className="w-4 h-4" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="font-medium"
                                    style={{ color: theme.textPrimary }}
                                >
                                    {activity.title}
                                </p>
                                <p
                                    className="text-sm truncate"
                                    style={{ color: theme.textSecondary }}
                                >
                                    {activity.desc}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock
                                        className="w-3 h-3"
                                        style={{ color: theme.textMuted }}
                                    />
                                    <span
                                        className="text-xs"
                                        style={{ color: theme.textMuted }}
                                    >
                                        {activity.time}
                                    </span>
                                    {activity.amount && (
                                        <span
                                            className={`text-xs font-medium ${activity.amount.startsWith("+")
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                                }`}
                                        >
                                            {activity.amount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                    : recentActivity.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="p-4 flex items-start gap-3"
                            style={{ borderColor: theme.border }}
                        >
                            <div
                                className={`p-2 rounded-lg ${activity.status === "success"
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-yellow-500/10 text-yellow-400"
                                    }`}
                            >
                                {activity.type === "blockchain" ? (
                                    <Blocks className="w-4 h-4" />
                                ) : activity.status === "success" ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <AlertCircle className="w-4 h-4" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="font-medium"
                                    style={{ color: theme.textPrimary }}
                                >
                                    {activity.title}
                                </p>
                                <p
                                    className="text-sm truncate"
                                    style={{ color: theme.textSecondary }}
                                >
                                    {activity.desc}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock
                                        className="w-3 h-3"
                                        style={{ color: theme.textMuted }}
                                    />
                                    {/* Menggunakan relative time utility external, for now just show timestamp string or formatted date */}
                                    <span
                                        className="text-xs"
                                        style={{ color: theme.textMuted }}
                                    >
                                        {new Date(activity.time).toLocaleDateString()}
                                    </span>
                                    {activity.amount && (
                                        <span
                                            className={`text-xs font-medium ${activity.amount.startsWith("+")
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                                }`}
                                        >
                                            {activity.amount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
            </div>
        </div>
    );
};
