import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h2 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-secondary)' }}>404</h2>
      <p style={{ margin: '1rem 0 2rem', color: 'var(--text-muted)' }}>
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
        Return to Dashboard
      </Link>
    </div>
  );
};
