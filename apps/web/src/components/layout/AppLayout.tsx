import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <header className="header">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-group">
            <div className="logo-badge">RM</div>
            <div>
              <h1 className="logo-title">Release Management Platform</h1>
            </div>
          </div>
        </Link>
        <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Releases
          </NavLink>
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

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>
          Release Management Platform &copy; {new Date().getFullYear()} &bull; Production Release
          Governance
        </p>
      </footer>
    </div>
  );
};
