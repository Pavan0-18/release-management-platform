import React from 'react';
import { useQuery } from '@apollo/client';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Banner */}
      <div
        className="card"
        style={{
          background:
            'linear-gradient(180deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Release Management Platform
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Enterprise-grade Multi-Tenant Release & Deployment Governance System
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="btn btn-secondary"
            title="Recheck system status"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Frontend Status Card */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Frontend Status
            </span>
            <span className="badge badge-connected">
              <span className="dot-indicator" /> Running
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Frontend is running.
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            React 19 + Vite + TypeScript + Apollo Client
          </p>
        </div>

        {/* Backend API Status Card */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Backend API Status
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
          <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            API: {loading && !data ? 'Checking...' : isApiConnected ? 'Connected' : 'Not Connected'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
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
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Database Status
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
          <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            PostgreSQL:{' '}
            {loading && !data
              ? 'Checking...'
              : isDbConnected
                ? 'Connected'
                : isApiConnected
                  ? 'Disconnected'
                  : 'Unavailable'}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Prisma ORM Connection</p>
        </div>
      </div>

      {/* Detailed Diagnostic & Diagnostic Info */}
      <div className="card">
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            marginBottom: '1rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.5rem',
          }}
        >
          Infrastructure Diagnostics
        </h3>

        {loading && !data ? (
          <LoadingSpinner message="Polling backend health endpoint..." />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                GraphQL Health Query
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                <code>query &#123; health &#125;</code> &rarr;{' '}
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
              <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                {healthStatus?.environment || import.meta.env.MODE}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                API Process Uptime
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                {healthStatus?.uptime !== undefined ? `${healthStatus.uptime.toFixed(1)}s` : 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Last Health Check
              </div>
              <div style={{ fontWeight: 600, marginTop: '0.25rem', fontSize: '0.85rem' }}>
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
              marginTop: '1.25rem',
              padding: '0.85rem',
              backgroundColor: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--status-error-text)',
              fontSize: '0.85rem',
            }}
          >
            <strong>Connection notice:</strong> Could not reach backend GraphQL endpoint at{' '}
            <code>{API_URL}</code>. Ensure the API server is running with <code>pnpm dev</code> or
            Docker.
          </div>
        )}
      </div>

      {/* Architecture Readiness Card */}
      <div className="card" style={{ borderColor: 'var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Foundation Roadmap Readiness
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          The foundation layer is initialized with clean modular separation for future capability
          phases:
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            fontSize: '0.85rem',
          }}
        >
          <div
            style={{
              padding: '0.6rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            &bull; Phase 1: Release checklist
          </div>
          <div
            style={{
              padding: '0.6rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            &bull; Phase 2: Projects
          </div>
          <div
            style={{
              padding: '0.6rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            &bull; Phase 3: Organizations
          </div>
          <div
            style={{
              padding: '0.6rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            &bull; Phase 4: Users & Memberships
          </div>
          <div
            style={{
              padding: '0.6rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            &bull; Phase 5: RBAC & Permissions
          </div>
          <div
            style={{
              padding: '0.6rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            &bull; Phase 6: ABAC Policy Engine
          </div>
        </div>
      </div>
    </div>
  );
};
