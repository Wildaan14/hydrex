import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        // Reload the page and clear error state
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#0b0f1a", // dark theme bg
                    color: "#e8edf5",
                    padding: 20,
                    fontFamily: "'Space Grotesk', sans-serif"
                }}>
                    <div style={{
                        backgroundColor: "#141927", // dark theme card
                        padding: 40,
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.06)",
                        maxWidth: 500,
                        width: "100%",
                        textAlign: "center",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                    }}>
                        <AlertTriangle size={64} color="#ef4444" style={{ margin: "0 auto 20px" }} />
                        <h1 style={{ fontSize: 24, marginBottom: 12, fontWeight: 700 }}>Terjadi Kesalahan</h1>
                        <p style={{ color: "#7c8db5", marginBottom: 30, lineHeight: 1.6 }}>
                            Aplikasi mengalami masalah / tertutup tak terduga. Silakan muat ulang halaman ini untuk memulihkan sesi Anda.
                        </p>
                        <button
                            onClick={this.handleReset}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                backgroundColor: "#06d6a0", // primary color
                                color: "#141927",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: 8,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "opacity 0.2s"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                            <RefreshCw size={18} />
                            Muat Ulang Halaman
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
