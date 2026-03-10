import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext"; // ✅ pakai ProjectContext (bukan _v2)
import { MarketplaceProvider } from "./context/MarketplaceContext";
import { ESGProvider } from "./context/ESGContext"; // ← TAMBAHAN: ESGProvider
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { ProjectsPage } from "./pages/ProjectsPage"; // ✅ named import - sesuai "export const ProjectsPage"
import CalculatorPage from "./pages/CalculatorPage";
import { ForumPage } from "./pages/ForumPage";
import { NewsPage } from "./pages/NewsPage";
import { EducationPage } from "./pages/EducationPage";
import { ReportsPage } from "./pages/ReportsPage";
import { MRVDashboardPage } from "./pages/MRVDashboardPage";
import ESGScoringPage from "./pages/ESGScoringPage";
import { AdminPage } from "./pages/AdminPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import WaterPricingRegulations from "./pages/WaterPricingRegulations";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <LanguageProvider>
          <AuthProvider>
            <ProjectProvider>
              <MarketplaceProvider>
                <ESGProvider>
                  {" "}
                  {/* ← TAMBAHAN: Wrap ESGProvider */}
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
                            <HomePage />
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
                            <MarketplacePage />
                          </ProtectedRoute>
                        }
                      />

                      {/* PROJECTS - Admin & Company only */}
                      <Route
                        path="/projects"
                        element={
                          <ProtectedRoute allowedRoles={["admin", "company"]}>
                            <ProjectsPage />
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
                            <CalculatorPage />
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
                            <WaterPricingRegulations />
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
                            <ForumPage />
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
                            <NewsPage />
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
                            <EducationPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* ==================== REPORTS & ANALYTICS ==================== */}

                      {/* REPORTS - Admin & Company only */}
                      <Route
                        path="/reports"
                        element={
                          <ProtectedRoute allowedRoles={["admin", "company"]}>
                            <ReportsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* MRV DASHBOARD - Admin & Company only */}
                      <Route
                        path="/mrv-dashboard"
                        element={
                          <ProtectedRoute allowedRoles={["admin", "company"]}>
                            <MRVDashboardPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* ESG SCORING - Admin & Company only */}
                      <Route
                        path="/esg-scoring"
                        element={
                          <ProtectedRoute allowedRoles={["admin", "company"]}>
                            <ESGScoringPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* ==================== ADMIN ==================== */}

                      {/* ADMIN PAGE - Admin only */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminPage />
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
                            <ProfilePage />
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
                            <SettingsPage />
                          </ProtectedRoute>
                        }
                      />
                    </Route>

                    {/* ==================== DEFAULT REDIRECTS ==================== */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </ESGProvider>{" "}
                {/* ← TAMBAHAN: Tutup ESGProvider */}
              </MarketplaceProvider>
            </ProjectProvider>
          </AuthProvider>
        </LanguageProvider>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
