import React from 'react';
import { Release, ReleaseStatus } from '@rmp/shared';
import { ReleaseStatusBadge } from './ReleaseStatusBadge';
import { Button } from '../common/form';
import { Link } from 'react-router-dom';

interface ServicesMatrixViewProps {
  services: string[];
  releases: Release[];
  onSelectService: (serviceName: string) => void;
  onNewReleaseForService: (serviceName: string) => void;
  onManageServices: () => void;
}

export const ServicesMatrixView: React.FC<ServicesMatrixViewProps> = ({
  services,
  releases,
  onSelectService,
  onNewReleaseForService,
  onManageServices,
}) => {
  if (services.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🧩</div>
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem 0',
          }}
        >
          No Microservices Configured
        </h3>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            maxWidth: '400px',
            margin: '0 auto 1.25rem auto',
          }}
        >
          Add your backend, frontend, worker, or API gateway services to manage independent release
          cycles.
        </p>
        <Button variant="primary" onClick={onManageServices}>
          + Add Services
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top microservices architecture metrics bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div
          className="card"
          style={{
            padding: '1rem',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Configured Services
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginTop: '0.2rem',
              }}
            >
              {services.length}
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}
          >
            🧩
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1rem',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Live Deployed Services
            </div>
            <div
              style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}
            >
              {
                services.filter((svc) =>
                  releases.some(
                    (r) => r.serviceName === svc && r.status === ReleaseStatus.DEPLOYED,
                  ),
                ).length
              }{' '}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                / {services.length}
              </span>
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}
          >
            ✓
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1rem',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Active Pipelines
            </div>
            <div
              style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309', marginTop: '0.2rem' }}
            >
              {
                releases.filter(
                  (r) =>
                    r.status === ReleaseStatus.IN_PROGRESS ||
                    r.status === ReleaseStatus.READY_FOR_DEPLOYMENT,
                ).length
              }
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}
          >
            ⚡
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {services.map((serviceName) => {
          const serviceReleases = releases.filter((r) => r.serviceName === serviceName);
          const deployedReleases = serviceReleases.filter(
            (r) => r.status === ReleaseStatus.DEPLOYED,
          );
          const inProgressReleases = serviceReleases.filter(
            (r) => r.status === ReleaseStatus.IN_PROGRESS,
          );
          const readyReleases = serviceReleases.filter(
            (r) => r.status === ReleaseStatus.READY_FOR_DEPLOYMENT,
          );
          const draftReleases = serviceReleases.filter((r) => r.status === ReleaseStatus.DRAFT);

          const latestRelease = serviceReleases[0]; // Releases are sorted newest first
          const latestDeployed = deployedReleases[0];

          return (
            <div
              key={serviceName}
              className="card"
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <div>
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '3px',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        letterSpacing: '0.04em',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Service
                    </span>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {serviceName}
                    </h4>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      backgroundColor: '#f5f0eb',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '999px',
                    }}
                  >
                    {serviceReleases.length} {serviceReleases.length === 1 ? 'release' : 'releases'}
                  </span>
                </div>

                {/* Latest Deployed Version Section */}
                <div
                  style={{
                    padding: '0.75rem 0.85rem',
                    backgroundColor: '#faf7f2',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Live Deployed Version
                  </div>
                  {latestDeployed ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#15803d',
                          fontFamily: 'monospace',
                        }}
                      >
                        {latestDeployed.version}
                      </span>
                      <Link
                        to={`/releases/${latestDeployed.id}`}
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--accent-primary)',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        View &rarr;
                      </Link>
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      No deployed version yet
                    </span>
                  )}
                </div>

                {/* Pipeline Breakdown */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    Pipeline Status
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {inProgressReleases.length > 0 && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                        }}
                      >
                        {inProgressReleases.length} In Progress
                      </span>
                    )}
                    {readyReleases.length > 0 && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                        }}
                      >
                        {readyReleases.length} Ready
                      </span>
                    )}
                    {draftReleases.length > 0 && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: '#f5f5f4',
                          color: '#57534e',
                        }}
                      >
                        {draftReleases.length} Draft
                      </span>
                    )}
                    {serviceReleases.length === 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        No active releases
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectService(serviceName)}
                  style={{ flex: 1, fontSize: '0.75rem', height: '34px' }}
                >
                  View Releases
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNewReleaseForService(serviceName)}
                  style={{ flex: 1, fontSize: '0.75rem', height: '34px' }}
                >
                  + Release
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
