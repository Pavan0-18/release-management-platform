import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Release, ReleaseStatus } from '@rmp/shared';
import { GET_RELEASES } from '../graphql/releases.queries';
import { ReleaseStatusBadge } from '../components/releases/ReleaseStatusBadge';
import { ProgressBar } from '../components/releases/ProgressBar';
import { CreateReleaseModal } from '../components/releases/CreateReleaseModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ReleasesPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_RELEASES, {
    variables: {
      filter: {
        status: statusFilter ? (statusFilter as ReleaseStatus) : undefined,
        search: searchTerm.trim() || undefined,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const releases: Release[] = data?.releases || [];

  const totalCount = releases.length;
  const inProgressCount = releases.filter((r) => r.status === ReleaseStatus.IN_PROGRESS).length;
  const deployedCount = releases.filter((r) => r.status === ReleaseStatus.DEPLOYED).length;
  const draftCount = releases.filter((r) => r.status === ReleaseStatus.DRAFT).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
            Release Governance
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track, verify, and orchestrate software deployment checklists across target
            environments.
          </p>
        </div>

        <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
          + New Release
        </button>
      </div>

      {/* Summary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Total Releases
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
            {totalCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            In Progress
          </div>
          <div
            style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#fbbf24' }}
          >
            {inProgressCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Deployed
          </div>
          <div
            style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#34d399' }}
          >
            {deployedCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Drafts
          </div>
          <div
            style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem', color: '#9ca3af' }}
          >
            {draftCount}
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search by release name, version..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <option value="">All Statuses</option>
              <option value={ReleaseStatus.DRAFT}>Draft</option>
              <option value={ReleaseStatus.PLANNED}>Planned</option>
              <option value={ReleaseStatus.IN_PROGRESS}>In Progress</option>
              <option value={ReleaseStatus.READY_FOR_DEPLOYMENT}>Ready for Deployment</option>
              <option value={ReleaseStatus.DEPLOYED}>Deployed</option>
              <option value={ReleaseStatus.FAILED}>Failed</option>
              <option value={ReleaseStatus.CANCELLED}>Cancelled</option>
            </select>

            <button
              onClick={() => refetch()}
              className="btn btn-secondary"
              title="Refresh releases"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Releases List */}
      {loading && !data ? (
        <LoadingSpinner message="Loading releases..." />
      ) : error ? (
        <div className="card" style={{ borderLeft: '4px solid var(--status-error-border)' }}>
          <p style={{ color: 'var(--status-error-text)' }}>
            Failed to load releases: {error.message}
          </p>
        </div>
      ) : releases.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            border: '1px dashed var(--border-color)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            No Releases Found
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              maxWidth: '400px',
              margin: '0 auto 1.5rem',
            }}
          >
            {searchTerm || statusFilter
              ? 'No releases match your current search and filter criteria.'
              : 'Create your first release to initialize step verification checklists and deployment gates.'}
          </p>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            + Create First Release
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {releases.map((release) => (
            <Link
              key={release.id}
              to={`/releases/${release.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="card"
                style={{
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{release.name}</h3>
                    <code
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {release.version}
                    </code>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ReleaseStatusBadge status={release.status} />
                    {release.targetDate && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Target: {new Date(release.targetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {release.description && (
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {release.description}
                  </p>
                )}

                {/* Progress Bar & Checklist Summary */}
                <div style={{ marginTop: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span>Checklist Progress</span>
                    <span>
                      {release.completedSteps || 0} / {release.totalSteps || 0} Steps Verified
                    </span>
                  </div>
                  <ProgressBar percentage={release.progressPercentage || 0} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateReleaseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
