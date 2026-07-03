import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Image, Layers, LayoutTemplate, LogOut, FileText, User, Menu, X, GraduationCap, HelpCircle, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <header className="mobile-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', padding: 0, margin: 0 }}>
          <img src="/ystudy-logo.png" alt="Y Study Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="sidebar-logo-text" style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Y Study</span>
        </h1>
        <button 
          className="hamburger-btn" 
          onClick={toggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}
        onClick={closeMobileSidebar}
      ></div>

      {/* Sidebar Panel */}
      <aside className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div>
          <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                <img src="/ystudy-logo.png" alt="Y Study Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <span className="sidebar-logo-text" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Y Study</span>
              </h1>
              <button 
                className="hamburger-btn" 
                onClick={closeMobileSidebar}
                style={{ display: 'none' }} /* controlled in CSS or styled on mobile only if needed */
              >
                <X size={18} />
              </button>
            </div>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <User size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
              </div>
            )}
          </div>
          
          <nav className="sidebar-nav">
            <NavLink 
              to="/media" 
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <Image size={20} />
              Media Library
            </NavLink>
            <NavLink 
              to="/banners" 
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <LayoutTemplate size={20} />
              Banners
            </NavLink>
            <NavLink 
              to="/navigations" 
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <Layers size={20} />
              Navigation
            </NavLink>
            <NavLink 
              to="/cms-pages" 
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FileText size={20} />
              CMS Pages
            </NavLink>
            <NavLink 
              to="/courses" 
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <GraduationCap size={20} />
              Courses
            </NavLink>
            <NavLink 
              to="/locations" 
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <MapPin size={20} />
              Locations
            </NavLink>
            <NavLink 
              to="/faqs" 
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <HelpCircle size={20} />
              FAQs
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => { closeMobileSidebar(); logout(); }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
