import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { MediaPage } from "./pages/MediaPage";
import { BannerListPage } from "./pages/BannerListPage";
import BannerAdminPanel from "./components/BannerAdminPanel";
import { NavigationAdminPanel } from "./components/NavigationAdminPanel";
import { CMSPagesAdminPanel } from "./components/CMSPagesAdminPanel";
import LoginPage from "./pages/LoginPage";
import { CourseListPage } from "./pages/CourseListPage";
import CourseAdminPanel from "./components/CourseAdminPanel";
import { LocationListPage } from "./pages/LocationListPage";
import LocationAdminPanel from "./components/LocationAdminPanel";
import { LookupListPage } from "./pages/LookupListPage";
import { LookupAdminPanel } from "./components/LookupAdminPanel";
import { FAQListPage } from "./pages/FAQListPage";
import { FAQAdminPanel } from "./components/FAQAdminPanel";
import { TimeTableListPage } from "./pages/TimeTableListPage";
import { TimeTableAdminPanel } from "./components/TimeTableAdminPanel";
import { RecycleBinPage } from "./pages/RecycleBinPage";

import { StudentStoryListPage } from "./pages/StudentStoryListPage";
import { StudentStoryAdminPanel } from "./components/StudentStoryAdminPanel";
import { UpcomingIntakeListPage } from "./pages/UpcomingIntakeListPage";
import { UpcomingIntakeAdminPanel } from "./components/UpcomingIntakeAdminPanel";
import { ToolListPage } from "./pages/ToolListPage";
import { ToolAdminPanel } from "./components/ToolAdminPanel";
import { DynamicFormBuilderPage } from "./pages/DynamicFormBuilderPage";
import { GuideListPage } from "./pages/GuideListPage";
import { GuideAdminPanel } from "./components/GuideAdminPanel";

// Protected Route wrapper that redirects unauthenticated users to /login
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
          background: "#0b0f19",
          color: "#94a3b8"
        }}
      >
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
        <ToastProvider>
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected admin dashboard routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/media" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <MediaPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/banners"
              element={
                <ProtectedRoute>
                  <BannerListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/banners/new"
              element={
                <ProtectedRoute>
                  <BannerAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/banners/edit/:id"
              element={
                <ProtectedRoute>
                  <BannerAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/navigations"
              element={
                <ProtectedRoute>
                  <NavigationAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cms-pages"
              element={
                <ProtectedRoute>
                  <CMSPagesAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CourseListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/new"
              element={
                <ProtectedRoute>
                  <CourseAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/edit/:id"
              element={
                <ProtectedRoute>
                  <CourseAdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Nested / courses sub-routes */}
            <Route
              path="/courses/locations"
              element={
                <ProtectedRoute>
                  <LocationListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/locations/new"
              element={
                <ProtectedRoute>
                  <LocationAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/locations/edit/:id"
              element={
                <ProtectedRoute>
                  <LocationAdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Dynamic lookup routes */}
            <Route
              path="/courses/subjects"
              element={
                <ProtectedRoute>
                  <LookupListPage type="subjects" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/subjects/new"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="subjects" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/subjects/edit/:id"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="subjects" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/qualifications"
              element={
                <ProtectedRoute>
                  <LookupListPage type="qualifications" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/qualifications/new"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="qualifications" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/qualifications/edit/:id"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="qualifications" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/modes"
              element={
                <ProtectedRoute>
                  <LookupListPage type="modes" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/modes/new"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="modes" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/modes/edit/:id"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="modes" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/durations"
              element={
                <ProtectedRoute>
                  <LookupListPage type="durations" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/durations/new"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="durations" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/durations/edit/:id"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="durations" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/fundings"
              element={
                <ProtectedRoute>
                  <LookupListPage type="fundings" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/fundings/new"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="fundings" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/fundings/edit/:id"
              element={
                <ProtectedRoute>
                  <LookupAdminPanel type="fundings" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faqs"
              element={
                <ProtectedRoute>
                  <FAQListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faqs/new"
              element={
                <ProtectedRoute>
                  <FAQAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faqs/edit/:slug"
              element={
                <ProtectedRoute>
                  <FAQAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/time-tables"
              element={
                <ProtectedRoute>
                  <TimeTableListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/time-tables/new"
              element={
                <ProtectedRoute>
                  <TimeTableAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/time-tables/edit/:id"
              element={
                <ProtectedRoute>
                  <TimeTableAdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recycle-bin"
              element={
                <ProtectedRoute>
                  <RecycleBinPage />
                </ProtectedRoute>
              }
            />

            {/* Student Stories */}
            <Route
              path="/student-stories"
              element={
                <ProtectedRoute>
                  <StudentStoryListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-stories/new"
              element={
                <ProtectedRoute>
                  <StudentStoryAdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-stories/edit/:id"
              element={
                <ProtectedRoute>
                  <StudentStoryAdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Upcoming Intakes */}
            <Route
              path="/courses/upcoming-intakes"
              element={
                <ProtectedRoute>
                  <UpcomingIntakeListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/upcoming-intakes/new"
              element={
                <ProtectedRoute>
                  <UpcomingIntakeAdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/upcoming-intakes/edit/:id"
              element={
                <ProtectedRoute>
                  <UpcomingIntakeAdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Tools */}
            <Route
              path="/tools"
              element={
                <ProtectedRoute>
                  <ToolListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools/new"
              element={
                <ProtectedRoute>
                  <ToolAdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools/edit/:id"
              element={
                <ProtectedRoute>
                  <ToolAdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Dynamic Form Builder */}
            <Route
              path="/dynamic-forms"
              element={
                <ProtectedRoute>
                  <DynamicFormBuilderPage />
                </ProtectedRoute>
              }
            />

            {/* Guides */}
            <Route
              path="/guides"
              element={
                <ProtectedRoute>
                  <GuideListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guides/new"
              element={
                <ProtectedRoute>
                  <GuideAdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guides/edit/:id"
              element={
                <ProtectedRoute>
                  <GuideAdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
