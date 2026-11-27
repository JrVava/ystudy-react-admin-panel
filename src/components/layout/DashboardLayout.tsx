import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Image,
  LogOut,
  User,
  Menu,
  X,
  GraduationCap,
  Clock,
  Users,
  Wrench,
  Calendar,
  BookOpen,
  Table2,
  Globe,
  Settings,
  FileText,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getRouteMeta = (pathname: string): { category?: string; title: string } => {
    if (pathname.startsWith("/media")) return { title: "Media Library" };
    if (pathname.startsWith("/banners")) {
      return {
        category: "Website Management",
        title: pathname.includes("/new") ? "New Banner" : pathname.includes("/edit") ? "Edit Banner" : "Banners"
      };
    }
    if (pathname.startsWith("/navigations")) return { category: "Website Management", title: "Navigation" };
    if (pathname.startsWith("/cms-pages")) return { category: "Website Management", title: "CMS Pages" };
    if (pathname.startsWith("/courses/locations")) {
      return {
        category: "Website Management",
        title: pathname.includes("/new") ? "New Location" : pathname.includes("/edit") ? "Edit Location" : "Locations"
      };
    }
    if (pathname.startsWith("/faqs")) {
      return {
        category: "Website Management",
        title: pathname.includes("/new") ? "New FAQ" : pathname.includes("/edit") ? "Edit FAQ" : "FAQs"
      };
    }
    if (pathname.startsWith("/courses/subjects")) return { category: "Courses Group", title: "Subjects" };
    if (pathname.startsWith("/courses/qualifications")) return { category: "Courses Group", title: "Qualifications" };
    if (pathname.startsWith("/courses/modes")) return { category: "Courses Group", title: "Study Modes" };
    if (pathname.startsWith("/courses/durations")) return { category: "Courses Group", title: "Durations" };
    if (pathname.startsWith("/courses/fundings")) return { category: "Courses Group", title: "Fundings" };
    if (pathname.startsWith("/study-routes")) {
      return {
        category: "Courses Group",
        title: pathname.includes("/new") ? "New Route" : pathname.includes("/edit") ? "Edit Route" : "Routes"
      };
    }
    if (pathname.startsWith("/courses")) {
      return {
        category: "Courses Group",
        title: pathname.includes("/new") ? "New Course" : pathname.includes("/edit") ? "Edit Course" : "Courses"
      };
    }
    if (pathname.startsWith("/courses/upcoming-intakes")) return { title: "Upcoming Intakes" };
    if (pathname.startsWith("/time-tables")) return { title: "Time Tables" };
    if (pathname.startsWith("/student-stories")) return { title: "Student Stories" };
    if (pathname.startsWith("/guides")) return { title: "Student Guides" };
    if (pathname.startsWith("/tools")) return { title: "Tools" };
    if (pathname.startsWith("/repayment-thresholds-plans")) return { title: "Repayment Plans" };
    if (
      pathname.startsWith("/forms/adviser-leads") ||
      pathname.startsWith("/adviser-leads") ||
      pathname.startsWith("/forms/adviser-call") ||
      pathname.startsWith("/adviser-call")
    )
      return { category: "Form", title: "Adviser Leads" };
    if (
      pathname.startsWith("/forms/partner-form") ||
      pathname.startsWith("/partner-form") ||
      pathname.startsWith("/forms/become-an-adviser") ||
      pathname.startsWith("/become-an-adviser")
    )
      return { category: "Form", title: "Partner Form" };
    if (pathname.startsWith("/forms/eligibility-check") || pathname.startsWith("/eligibility-check"))
      return { category: "Form", title: "Eligibility Check" };
    if (pathname.startsWith("/forms/degree-match") || pathname.startsWith("/degree-match"))
      return { category: "Form", title: "Degree Match" };
    if (pathname.startsWith("/forms")) return { category: "Form", title: "Form" };
    if (pathname.startsWith("/smtp-config")) return { category: "Settings", title: "SMTP Config" };
    if (pathname.startsWith("/google-sheets")) return { category: "Settings", title: "Google Sheets Config" };
    if (pathname.startsWith("/dynamic-forms")) return { category: "Settings", title: "Form Builder" };
    if (pathname.startsWith("/form-send-email")) return { category: "Settings", title: "Form Send Email" };
    if (pathname.startsWith("/languages") || pathname.startsWith("/settings/languages"))
      return { category: "Settings", title: "Languages" };
    if (pathname.startsWith("/recycle-bin")) return { category: "Settings", title: "Recycle Bin" };
    return { title: "Dashboard" };
  };

  const routeMeta = getRouteMeta(location.pathname);
  const isWebsiteRoute = (pathname: string) => {
    return (
      pathname.startsWith("/banners") ||
      pathname.startsWith("/navigations") ||
      pathname.startsWith("/cms-pages") ||
      pathname.startsWith("/courses/locations") ||
      pathname.startsWith("/faqs")
    );
  };

  const isCoursesRoute = (pathname: string) => {
    return (
      (pathname.startsWith("/courses") && !pathname.startsWith("/courses/locations")) ||
      pathname.startsWith("/study-routes")
    );
  };

  const isFormRoute = (pathname: string) => {
    return (
      pathname.startsWith("/forms") ||
      pathname.startsWith("/degree-match") ||
      pathname.startsWith("/eligibility-check") ||
      pathname.startsWith("/partner-form") ||
      pathname.startsWith("/become-an-adviser") ||
      pathname.startsWith("/adviser-leads") ||
      pathname.startsWith("/adviser-call")
    );
  };

  const isSettingsRoute = (pathname: string) => {
    return (
      pathname.startsWith("/dynamic-forms") ||
      pathname.startsWith("/google-sheets") ||
      pathname.startsWith("/smtp-config") ||
      pathname.startsWith("/form-send-email") ||
      pathname.startsWith("/languages") ||
      pathname.startsWith("/settings/languages") ||
      pathname.startsWith("/recycle-bin")
    );
  };

  type MenuGroup = "website" | "courses" | "forms" | "settings" | null;

  const getActiveGroupFromRoute = (pathname: string): MenuGroup => {
    if (isWebsiteRoute(pathname)) return "website";
    if (isCoursesRoute(pathname)) return "courses";
    if (isFormRoute(pathname)) return "forms";
    if (isSettingsRoute(pathname)) return "settings";
    return null;
  };

  const [expandedGroup, setExpandedGroup] = useState<MenuGroup>(() => getActiveGroupFromRoute(location.pathname));

  // Sync expanded state if location changes from outside
  useEffect(() => {
    const active = getActiveGroupFromRoute(location.pathname);
    if (active) {
      setExpandedGroup(active);
    }
  }, [location.pathname]);

  const toggleGroup = (group: "website" | "courses" | "forms" | "settings") => {
    setExpandedGroup((prev) => (prev === group ? null : group));
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <header className="mobile-header">
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem", padding: 0, margin: 0 }}>
          <img
            src="/ystudy-logo.png"
            alt="Y Study Logo"
            style={{ width: "28px", height: "28px", objectFit: "contain" }}
          />
          <span
            className="sidebar-logo-text"
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Y Study
          </span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            className="theme-toggle-btn-mobile"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun size={18} style={{ color: "#f59e0b" }} />
            ) : (
              <Moon size={18} style={{ color: "#6366f1" }} />
            )}
          </button>
          <button className="hamburger-btn" onClick={toggleMobileSidebar} aria-label="Toggle Navigation Menu">
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar Backdrop Overlay */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? "sidebar-mobile-open" : ""}`}
        onClick={closeMobileSidebar}
      ></div>

      {/* Sidebar Panel */}
      <aside className={`sidebar ${isMobileOpen ? "sidebar-mobile-open" : ""}`}>
        <div className="sidebar-scrollable-content">
          <div className="sidebar-header" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h1 style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: 0 }}>
                <img
                  src="/ystudy-logo.png"
                  alt="Y Study Logo"
                  style={{ width: "32px", height: "32px", objectFit: "contain" }}
                />
                <span
                  className="sidebar-logo-text"
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    background: "linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}
                >
                  Y Study
                </span>
              </h1>
              <button
                className="hamburger-btn"
                onClick={closeMobileSidebar}
                style={{ display: "none" }} /* controlled in CSS or styled on mobile only if needed */
              >
                <X size={18} />
              </button>
            </div>
            {user && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "var(--user-chip-bg)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--user-chip-border)",
                  overflow: "hidden"
                }}
              >
                <User size={14} style={{ color: "#8b5cf6", flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {user.name}
                </span>
              </div>
            )}
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/media"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <Image size={20} />
              Media Library
            </NavLink>
            {/* Collapsible Website Management Group */}
            <div>
              <div
                className={`nav-item ${isWebsiteRoute(location.pathname) ? "nav-item-active" : ""}`}
                onClick={() => toggleGroup("website")}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Globe size={20} />
                  Website Management
                </div>
                <span
                  style={{
                    fontSize: "0.65rem",
                    transition: "transform 0.2s",
                    transform: expandedGroup === "website" ? "rotate(180deg)" : "none"
                  }}
                >
                  ▼
                </span>
              </div>

              {expandedGroup === "website" && (
                <div
                  style={{
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    marginTop: "4px",
                    borderLeft: "1px solid var(--panel-border)",
                    marginLeft: "12px"
                  }}
                >
                  <NavLink
                    to="/banners"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname === "/banners/new" ||
                        location.pathname.startsWith("/banners/edit/")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Banners
                  </NavLink>
                  <NavLink
                    to="/navigations"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Navigation
                  </NavLink>
                  <NavLink
                    to="/cms-pages"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    CMS Pages
                  </NavLink>
                  <NavLink
                    to="/courses/locations"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname === "/courses/locations/new" ||
                        location.pathname.startsWith("/courses/locations/edit/")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Locations
                  </NavLink>
                  <NavLink
                    to="/faqs"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive || location.pathname === "/faqs/new" || location.pathname.startsWith("/faqs/edit/")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    FAQs
                  </NavLink>
                </div>
              )}
            </div>
            {/* Collapsible Courses Group */}
            <div>
              <div
                className={`nav-item ${
                  (location.pathname.startsWith("/courses") && !location.pathname.startsWith("/courses/locations")) ||
                  location.pathname.startsWith("/study-routes")
                    ? "nav-item-active"
                    : ""
                }`}
                onClick={() => toggleGroup("courses")}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <GraduationCap size={20} />
                  Courses Group
                </div>
                <span
                  style={{
                    fontSize: "0.65rem",
                    transition: "transform 0.2s",
                    transform: expandedGroup === "courses" ? "rotate(180deg)" : "none"
                  }}
                >
                  ▼
                </span>
              </div>

              {expandedGroup === "courses" && (
                <div
                  style={{
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    marginTop: "4px",
                    borderLeft: "1px solid var(--panel-border)",
                    marginLeft: "12px"
                  }}
                >
                  <NavLink
                    to="/courses"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname === "/courses/new" ||
                        location.pathname.startsWith("/courses/edit/")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    end
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Courses
                  </NavLink>
                  <NavLink
                    to="/courses/subjects"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Subjects
                  </NavLink>
                  <NavLink
                    to="/courses/qualifications"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Qualifications
                  </NavLink>
                  <NavLink
                    to="/courses/modes"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Study Modes
                  </NavLink>
                  <NavLink
                    to="/courses/durations"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Durations
                  </NavLink>
                  <NavLink
                    to="/courses/fundings"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Fundings
                  </NavLink>
                  <NavLink
                    to="/study-routes"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname === "/study-routes/new" ||
                        location.pathname.startsWith("/study-routes/edit/")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Routes
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink
              to="/courses/upcoming-intakes"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <Calendar size={20} />
              Upcoming Intakes
            </NavLink>
            <NavLink
              to="/time-tables"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <Clock size={20} />
              Time Tables
            </NavLink>
            <NavLink
              to="/student-stories"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <Users size={20} />
              Student Stories
            </NavLink>
            <NavLink
              to="/guides"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <BookOpen size={20} />
              Student Guides
            </NavLink>
            <NavLink
              to="/tools"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <Wrench size={20} />
              Tools
            </NavLink>
            <NavLink
              to="/repayment-thresholds-plans"
              className={({ isActive }) =>
                `nav-item ${
                  isActive || location.pathname.startsWith("/repayment-thresholds-plans") ? "nav-item-active" : ""
                }`
              }
              onClick={closeMobileSidebar}
            >
              <Table2 size={20} />
              Repayment Plans
            </NavLink>

            {/* Collapsible Form Group */}
            <div>
              <div
                className={`nav-item ${isFormRoute(location.pathname) ? "nav-item-active" : ""}`}
                onClick={() => toggleGroup("forms")}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <FileText size={20} />
                  Forms
                </div>
                <span
                  style={{
                    fontSize: "0.65rem",
                    transition: "transform 0.2s",
                    transform: expandedGroup === "forms" ? "rotate(180deg)" : "none"
                  }}
                >
                  ▼
                </span>
              </div>

              {expandedGroup === "forms" && (
                <div
                  style={{
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    marginTop: "4px",
                    borderLeft: "1px solid var(--panel-border)",
                    marginLeft: "12px"
                  }}
                >
                  <NavLink
                    to="/forms/degree-match"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname.startsWith("/forms/degree-match") ||
                        location.pathname.startsWith("/degree-match")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Degree Match
                  </NavLink>
                  <NavLink
                    to="/forms/eligibility-check"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname.startsWith("/forms/eligibility-check") ||
                        location.pathname.startsWith("/eligibility-check")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Eligibility Check
                  </NavLink>
                  <NavLink
                    to="/forms/partner-form"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname.startsWith("/forms/partner-form") ||
                        location.pathname.startsWith("/partner-form") ||
                        location.pathname.startsWith("/forms/become-an-adviser") ||
                        location.pathname.startsWith("/become-an-adviser")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Partner Form
                  </NavLink>
                  <NavLink
                    to="/forms/adviser-leads"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname.startsWith("/forms/adviser-leads") ||
                        location.pathname.startsWith("/adviser-leads") ||
                        location.pathname.startsWith("/forms/adviser-call") ||
                        location.pathname.startsWith("/adviser-call")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Adviser Leads
                  </NavLink>
                </div>
              )}
            </div>

            {/* Collapsible Settings Group */}
            <div>
              <div
                className={`nav-item ${isSettingsRoute(location.pathname) ? "nav-item-active" : ""}`}
                onClick={() => toggleGroup("settings")}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Settings size={20} />
                  Settings
                </div>
                <span
                  style={{
                    fontSize: "0.65rem",
                    transition: "transform 0.2s",
                    transform: expandedGroup === "settings" ? "rotate(180deg)" : "none"
                  }}
                >
                  ▼
                </span>
              </div>

              {expandedGroup === "settings" && (
                <div
                  style={{
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    marginTop: "4px",
                    borderLeft: "1px solid var(--panel-border)",
                    marginLeft: "12px"
                  }}
                >
                  <NavLink
                    to="/smtp-config"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname === "/smtp-config/new" ||
                        location.pathname.startsWith("/smtp-config/edit/")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    SMTP Config
                  </NavLink>
                  <NavLink
                    to="/google-sheets"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname === "/google-sheets/new" ||
                        location.pathname.startsWith("/google-sheets/edit/")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Google Sheets Config
                  </NavLink>
                  <NavLink
                    to="/dynamic-forms"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Form Builder
                  </NavLink>
                  <NavLink
                    to="/form-send-email"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Notification
                  </NavLink>
                  <NavLink
                    to="/languages"
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ||
                        location.pathname.startsWith("/languages") ||
                        location.pathname.startsWith("/settings/languages")
                          ? "nav-item-active"
                          : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Languages
                  </NavLink>
                  <NavLink
                    to="/recycle-bin"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Recycle Bin
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            className="btn-logout"
            onClick={() => {
              closeMobileSidebar();
              logout();
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="main-wrapper">
        {/* Desktop Top Header */}
        <header className="dashboard-top-header">
          <div className="header-breadcrumb">
            {routeMeta.category && (
              <>
                <span className="header-breadcrumb-category">{routeMeta.category}</span>
                <span className="header-breadcrumb-separator">/</span>
              </>
            )}
            <span className="header-breadcrumb-title">{routeMeta.title}</span>
          </div>

          <div className="header-actions">
            {/* Theme Switcher Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <div className="theme-toggle-icon">
                {theme === "dark" ? (
                  <Sun size={14} style={{ color: "#f59e0b" }} />
                ) : (
                  <Moon size={14} style={{ color: "#6366f1" }} />
                )}
              </div>
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </button>

            {user && (
              <div className="header-user-badge">
                <div className="header-user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "A"}</div>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                  <span className="header-user-name">{user.name}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Administrator</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-wrapper">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
