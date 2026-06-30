import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { MediaPage } from "./pages/MediaPage";
import { BannerListPage } from "./pages/BannerListPage";
import BannerAdminPanel from "./components/BannerAdminPanel";
import { NavigationAdminPanel } from "./components/NavigationAdminPanel";
import { CMSPagesAdminPanel } from "./components/CMSPagesAdminPanel";
import LoginPage from "./pages/LoginPage";
import { CourseListPage } from "./pages/CourseListPage";
import CourseAdminPanel from "./components/CourseAdminPanel";

// Protected Route wrapper that redirects unauthenticated users to /login
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', background: '#0b0f19', color: '#94a3b8' }}>
        <span>Loading session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public login route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected admin dashboard routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/media" replace />
            </ProtectedRoute>
          } />
          
          <Route path="/media" element={
            <ProtectedRoute>
              <MediaPage />
            </ProtectedRoute>
          } />
          
          <Route path="/banners" element={
            <ProtectedRoute>
              <BannerListPage />
            </ProtectedRoute>
          } />
          
          <Route path="/banners/new" element={
            <ProtectedRoute>
              <BannerAdminPanel />
            </ProtectedRoute>
          } />
          
          <Route path="/banners/edit/:id" element={
            <ProtectedRoute>
              <BannerAdminPanel />
            </ProtectedRoute>
          } />
          
          <Route path="/navigations" element={
            <ProtectedRoute>
              <NavigationAdminPanel />
            </ProtectedRoute>
          } />
          
          <Route path="/cms-pages" element={
            <ProtectedRoute>
              <CMSPagesAdminPanel />
            </ProtectedRoute>
          } />

          <Route path="/courses" element={
            <ProtectedRoute>
              <CourseListPage />
            </ProtectedRoute>
          } />

          <Route path="/courses/new" element={
            <ProtectedRoute>
              <CourseAdminPanel />
            </ProtectedRoute>
          } />

          <Route path="/courses/edit/:id" element={
            <ProtectedRoute>
              <CourseAdminPanel />
            </ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
