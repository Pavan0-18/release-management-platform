import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ProjectSidebar } from './ProjectSidebar';

export const AppLayout: React.FC = () => {
  return (
    <div
      className="app-container"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top Navbar */}
      <header className="header" style={{ height: '65px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-group">
            <div className="logo-badge">RM</div>
            <div>
              <h1 className="logo-title">Release Management Platform</h1>
            </div>
          </div>
        </Link>
        <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href="http://localhost:3000/graphql"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            GraphQL API
          </a>
        </nav>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'stretch' }}>
        <ProjectSidebar />
        <main
          style={{
            flex: 1,
            padding: '2rem',
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </main>
      </div>

      <footer className="footer">
        <p>
          Release Management Platform &copy; {new Date().getFullYear()} &bull; Production Release
          Governance & Multi-Project Scoping
        </p>
      </footer>
    </div>
  );
};
