import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ProjectSidebar } from './ProjectSidebar';

export const AppLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout-root">
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Left Sidebar (Sticky on Desktop, Drawer on Mobile) */}
      <ProjectSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Viewport */}
      <div className="app-main-viewport">
        {/* Mobile Header Bar with Hamburger Button */}
        <header className="mobile-top-bar">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.65rem',
              fontSize: '1.1rem',
              cursor: 'pointer',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle Project Navigation"
          >
            ☰
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              Release Hub
            </span>
          </div>

          <div style={{ width: '36px' }} /> {/* Spacer for symmetry */}
        </header>

        {/* Dynamic Route Content */}
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
