import React from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_HEALTH_STATUS } from '../graphql/health.queries';
import { API_URL } from '../apollo/client';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_HEALTH_STATUS, {
    pollInterval: 10000,
    notifyOnNetworkStatusChange: true,
  });

  const isApiConnected = !error && Boolean(data?.health === 'OK' || data?.healthStatus?.status);
  const healthStatus = data?.healthStatus;
  const isDbConnected = healthStatus?.database === 'CONNECTED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Release Management Platform
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Release governance and deployment checklist system
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/releases" className="btn btn-primary">
            View Releases &rarr;
          </Link>
          <button
            onClick={() => refetch()}
            className="btn btn-secondary"
            title="Recheck system status"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Frontend Status Card */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Frontend
            </span>
            <span className="badge badge-connected">
              <span className="dot-indicator" /> Running
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Frontend is running.
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
            React 19 &bull; Vite &bull; TypeScript
          </p>
        </div>

        {/* Backend API Status Card */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Backend API
            </span>
            {loading && !data ? (
              <span className="badge badge-warning">
                <span className="dot-indicator" /> Connecting
              </span>
            ) : isApiConnected ? (
              <span className="badge badge-connected">
                <span className="dot-indicator" /> Connected
              </span>
            ) : (
              <span className="badge badge-disconnected">
                <span className="dot-indicator" /> Not Connected
              </span>
            )}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            API: {loading && !data ? 'Checking...' : isApiConnected ? 'Connected' : 'Not Connected'}
          </div>
          <div
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              marginTop: '0.35rem',
              wordBreak: 'break-all',
            }}
          >
            Target: <code>{API_URL}</code>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Database
            </span>
            {loading && !data ? (
              <span className="badge badge-warning">
                <span className="dot-indicator" /> Checking
              </span>
            ) : isDbConnected ? (
              <span className="badge badge-connected">
                <span className="dot-indicator" /> Connected
              </span>
            ) : (
              <span className="badge badge-disconnected">
                <span className="dot-indicator" /> {isApiConnected ? 'Disconnected' : 'Unknown'}
              </span>
            )}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            PostgreSQL:{' '}
            {loading && !data
              ? 'Checking...'
              : isDbConnected
                ? 'Connected'
                : isApiConnected
                  ? 'Disconnected'
                  : 'Unavailable'}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
            Prisma ORM Connection
          </p>
        </div>
      </div>

      {/* Diagnostics */}
      <div className="card">
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '0.85rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.5rem',
          }}
        >
          Infrastructure Status
        </h3>

        {loading && !data ? (
          <LoadingSpinner message="Checking backend health..." />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                GraphQL Health
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.2rem', fontSize: '0.9rem' }}>
                <code>health</code> &rarr;{' '}
                <span
                  style={{
                    color: isApiConnected
                      ? 'var(--status-success-text)'
                      : 'var(--status-error-text)',
                  }}
                >
                  {data?.health || 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Environment</div>
              <div style={{ fontWeight: 600, marginTop: '0.2rem', fontSize: '0.9rem' }}>
                {healthStatus?.environment || import.meta.env.MODE}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Process Uptime
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.2rem', fontSize: '0.9rem' }}>
                {healthStatus?.uptime !== undefined ? `${healthStatus.uptime.toFixed(1)}s` : 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Last Checked</div>
              <div style={{ fontWeight: 600, marginTop: '0.2rem', fontSize: '0.85rem' }}>
                {healthStatus?.timestamp
                  ? new Date(healthStatus.timestamp).toLocaleTimeString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--status-error-text)',
              fontSize: '0.85rem',
            }}
          >
            Could not reach backend GraphQL endpoint at <code>{API_URL}</code>.
          </div>
        )}
      </div>
    </div>
  );
};
