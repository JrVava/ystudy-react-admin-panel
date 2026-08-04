import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Image,
  Layers,
  LayoutTemplate,
  LogOut,
  FileText,
  User,
  Menu,
  X,
  GraduationCap,
  HelpCircle,
  Clock,
  Trash2,
  Users,
  Wrench,
  Calendar
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(
    location.pathname.startsWith("/courses") || location.pathname.startsWith("/locations")
  );

  // Sync expanded state if location changes from outside
  useEffect(() => {
    if (location.pathname.startsWith("/courses") || location.pathname.startsWith("/locations")) {
      setIsCoursesExpanded(true);
    }
  }, [location.pathname]);

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
        <button className="hamburger-btn" onClick={toggleMobileSidebar} aria-label="Toggle Navigation Menu">
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
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
                  background: "rgba(255,255,255,0.03)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  overflow: "hidden"
                }}
              >
                <User size={14} style={{ color: "#8b5cf6", flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#94a3b8",
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
            <NavLink
              to="/banners"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <LayoutTemplate size={20} />
              Banners
            </NavLink>
            <NavLink
              to="/navigations"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <Layers size={20} />
              Navigation
            </NavLink>
            <NavLink
              to="/cms-pages"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <FileText size={20} />
              CMS Pages
            </NavLink>
            {/* Collapsible Courses Group */}
            <div>
              <div
                className={`nav-item ${location.pathname.startsWith("/courses") || location.pathname.startsWith("/locations") ? "nav-item-active" : ""}`}
                onClick={() => setIsCoursesExpanded(!isCoursesExpanded)}
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
                    transform: isCoursesExpanded ? "rotate(180deg)" : "none"
                  }}
                >
                  ▼
                </span>
              </div>

              {isCoursesExpanded && (
                <div
                  style={{
                    paddingLeft: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    marginTop: "4px",
                    borderLeft: "1px solid rgba(255,255,255,0.05)",
                    marginLeft: "12px"
                  }}
                >
                  <NavLink
                    to="/courses"
                    end
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Curriculum Courses
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
                    to="/courses/locations"
                    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={closeMobileSidebar}
                    style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                  >
                    Campus Locations
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
              to="/faqs"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <HelpCircle size={20} />
              FAQs
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
              to="/tools"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <Wrench size={20} />
              Tools
            </NavLink>
            <NavLink
              to="/dynamic-forms"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <FileText size={20} />
              Form Builder
            </NavLink>
            <NavLink
              to="/recycle-bin"
              className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              onClick={closeMobileSidebar}
            >
              <Trash2 size={20} />
              Recycle Bin
            </NavLink>
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

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
