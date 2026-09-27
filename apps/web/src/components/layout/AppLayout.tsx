import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-group">
          <div className="logo-badge">RM</div>
          <div>
            <h1 className="logo-title">Release Management Platform</h1>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Docs
          </a>
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Release Management Platform &copy; {new Date().getFullYear()} &bull; Foundation Setup</p>
      </footer>
    </div>
  );
};
