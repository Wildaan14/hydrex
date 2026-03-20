import React, { Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import { MarketplaceProvider } from "./context/MarketplaceContext";
import { ESGProvider } from "./context/ESGContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";

import { HelmetProvider, Helmet } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { Loader2 } from "lucide-react";

// Non-lazy for critical initial load pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { LandingPage } from "./pages/LandingPage";

// Lazy loading pages for better performance
const HomePage = React.lazy(() => import("./pages/HomePage"));
const MarketplacePage = React.lazy(() => import("./pages/MarketplacePage").then(module => ({ default: module.MarketplacePage })));
const ProjectsPage = React.lazy(() => import("./pages/ProjectsPage").then(module => ({ default: module.ProjectsPage })));
const CalculatorPage = React.lazy(() => import("./pages/CalculatorPage"));
const ForumPage = React.lazy(() => import("./pages/ForumPage").then(module => ({ default: module.ForumPage })));
const NewsPage = React.lazy(() => import("./pages/NewsPage").then(module => ({ default: module.NewsPage })));
const EducationPage = React.lazy(() => import("./pages/EducationPage").then(module => ({ default: module.EducationPage })));
const ReportsPage = React.lazy(() => import("./pages/ReportsPage").then(module => ({ default: module.ReportsPage })));
const MRVDashboardPage = React.lazy(() => import("./pages/MRVDashboardPage").then(module => ({ default: module.MRVDashboardPage })));
const ESGScoringPage = React.lazy(() => import("./pages/ESGScoringPage"));
const AdminPage = React.lazy(() => import("./pages/AdminPage").then(module => ({ default: module.AdminPage })));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage").then(module => ({ default: module.ProfilePage })));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage").then(module => ({ default: module.SettingsPage })));
const WaterPricingRegulations = React.lazy(() => import("./pages/WaterPricingRegulations"));

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disables automatic refetching on window focus
      retry: 2, // Retries failed requests up to 2 times
      staleTime: 5 * 60 * 1000, // Data is considered stale after 5 minutes
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
    <p className="text-gray-500 font-medium font-orbitron tracking-widest text-sm">LOADING...</p>
  </div>
);

const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-center w-full">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100 dark:border-red-900">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          {error.message || "An unexpected error occurred while rendering the page."}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors focus:ring-4 focus:ring-emerald-500/20"
        >
          Try again
        </button>
      </div>
    </div>
  );
};


function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ProjectProvider>
                <MarketplaceProvider>
                  <ESGProvider>
                    <HashRouter>
                      <Helmet>
                        <title>HydrEx | Water Credit Platform</title>
                        <meta name="description" content="HydrEx is a comprehensive platform for managing, trading, and tracking water credits with built-in MRV and ESG scoring." />
                      </Helmet>
                      {/* Outer Error Boundary catches app-level rendering errors */}
                      <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Routes>
                          {/* ==================== PUBLIC ROUTES ==================== */}
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route path="/verify-email" element={<VerifyEmailPage />} />

                          {/* ==================== PROTECTED ROUTES WITH LAYOUT ==================== */}
                          <Route element={<AppLayout />}>
                            {/* HOME - All authenticated users */}
                            <Route
                              path="/home"
                              element={
                                <ProtectedRoute
                                  allowedRoles={["admin", "company", "user", "individual", "vvb"]}
                                >
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Dashboard | HydrEx</title></Helmet>
                                    <HomePage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* ==================== MAIN MENU ==================== */}

                            {/* MARKETPLACE - All users */}
                            <Route
                              path="/marketplace"
                              element={
                                <ProtectedRoute
                                  allowedRoles={["admin", "company", "user", "individual", "vvb"]}
                                >
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Marketplace | HydrEx</title></Helmet>
                                    <MarketplacePage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* PROJECTS - Admin & Company only */}
                            <Route
                              path="/projects"
                              element={
                                <ProtectedRoute allowedRoles={["admin", "company"]}>
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Projects | HydrEx</title></Helmet>
                                    <ProjectsPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* CALCULATOR - All authenticated users */}
                            <Route
                              path="/calculator"
                              element={
                                <ProtectedRoute
                                  allowedRoles={["admin", "company", "user", "individual", "vvb"]}
                                >
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Calculator | HydrEx</title></Helmet>
                                    <CalculatorPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* REGULATIONS - All authenticated users */}
                            <Route
                              path="/regulations"
                              element={
                                <ProtectedRoute
                                  allowedRoles={["admin", "company", "user", "individual", "vvb"]}
                                >
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Regulations | HydrEx</title></Helmet>
                                    <WaterPricingRegulations />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* ==================== COMMUNITY ==================== */}

                            {/* FORUM - All authenticated users */}
                            <Route
                              path="/forum"
                              element={
                                <ProtectedRoute
                                  allowedRoles={["admin", "company", "user", "individual", "vvb"]}
                                >
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Forum | HydrEx</title></Helmet>
                                    <ForumPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* NEWS - All authenticated users */}
                            <Route
                              path="/news"
                              element={
                                <ProtectedRoute
                                  allowedRoles={["admin", "company", "user", "individual", "vvb"]}
                                >
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>News | HydrEx</title></Helmet>
                                    <NewsPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* EDUCATION - All authenticated users */}
                            <Route
                              path="/education"
                              element={
                                <ProtectedRoute
                                  allowedRoles={["admin", "company", "user", "individual", "vvb"]}
                                >
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Education | HydrEx</title></Helmet>
                                    <EducationPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* ==================== REPORTS & ANALYTICS ==================== */}

                            {/* REPORTS - Admin & Company only */}
                            <Route
                              path="/reports"
                              element={
                                <ProtectedRoute allowedRoles={["admin", "company"]}>
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Reports | HydrEx</title></Helmet>
                                    <ReportsPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* MRV DASHBOARD - Admin & Company only */}
                            <Route
                              path="/mrv-dashboard"
                              element={
                                <ProtectedRoute allowedRoles={["admin", "company"]}>
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>MRV Dashboard | HydrEx</title></Helmet>
                                    <MRVDashboardPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* ESG SCORING - Admin & Company only */}
                            <Route
                              path="/esg-scoring"
                              element={
                                <ProtectedRoute allowedRoles={["admin", "company"]}>
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>ESG Scoring | HydrEx</title></Helmet>
                                    <ESGScoringPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* ==================== ADMIN ==================== */}

                            {/* ADMIN PAGE - Admin only */}
                            <Route
                              path="/admin"
                              element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Admin | HydrEx</title></Helmet>
                                    <AdminPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* ==================== USER ==================== */}

                            {/* PROFILE - All authenticated users */}
                            <Route
                              path="/profile"
                              element={
                                <ProtectedRoute
                                  allowedRoles={["admin", "company", "user", "individual", "vvb"]}
                                >
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Profile | HydrEx</title></Helmet>
                                    <ProfilePage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />

                            {/* SETTINGS - All authenticated users */}
                            <Route
                              path="/settings"
                              element={
                                <ProtectedRoute
                                  allowedRoles={["admin", "company", "user", "individual", "vvb"]}
                                >
                                  <Suspense fallback={<LoadingSpinner />}>
                                    <Helmet><title>Settings | HydrEx</title></Helmet>
                                    <SettingsPage />
                                  </Suspense>
                                </ProtectedRoute>
                              }
                            />
                          </Route>

                          {/* ==================== DEFAULT REDIRECTS ==================== */}
                          <Route path="/" element={<LandingPage />} />
                          <Route path="*" element={<Navigate to="/home" replace />} />
                        </Routes>
                      </ErrorBoundary>
                    </HashRouter>
                  </ESGProvider>
                </MarketplaceProvider>
              </ProjectProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
