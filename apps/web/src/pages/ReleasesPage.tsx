import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Release, ReleaseStatus } from '@rmp/shared';
import { GET_RELEASES } from '../graphql/releases.queries';
import { ReleaseStatusBadge } from '../components/releases/ReleaseStatusBadge';
import { ProgressBar } from '../components/releases/ProgressBar';
import { CreateReleaseModal } from '../components/releases/CreateReleaseModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Input, Select, Button } from '../components/common/form';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Releases
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Release checklist tracking and deployment governance
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          + New Release
        </Button>
      </div>

      {/* Summary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div className="card" style={{ padding: '1rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Total Releases
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginTop: '0.2rem',
              color: 'var(--text-primary)',
            }}
          >
            {totalCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            In Progress
          </div>
          <div
            style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem', color: '#b45309' }}
          >
            {inProgressCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Deployed
          </div>
          <div
            style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem', color: '#15803d' }}
          >
            {deployedCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Drafts
          </div>
          <div
            style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem', color: '#78716c' }}
          >
            {draftCount}
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <Input
              placeholder="Search releases by name or version..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ minWidth: '180px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: ReleaseStatus.DRAFT, label: 'Draft' },
                  { value: ReleaseStatus.PLANNED, label: 'Planned' },
                  { value: ReleaseStatus.IN_PROGRESS, label: 'In Progress' },
                  { value: ReleaseStatus.READY_FOR_DEPLOYMENT, label: 'Ready for Deployment' },
                  { value: ReleaseStatus.DEPLOYED, label: 'Deployed' },
                  { value: ReleaseStatus.FAILED, label: 'Failed' },
                  { value: ReleaseStatus.CANCELLED, label: 'Cancelled' },
                ]}
              />
            </div>

            <Button variant="secondary" onClick={() => refetch()} title="Refresh">
              Refresh
            </Button>
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
            padding: '3.5rem 1.5rem',
            border: '1px dashed var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.35rem',
            }}
          >
            No Releases Found
          </h3>
          <p
            style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}
          >
            {searchTerm || statusFilter
              ? 'No releases match your current filters.'
              : 'Create your first release to track checklist items and deployment steps.'}
          </p>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Create First Release
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {releases.map((release) => (
            <Link
              key={release.id}
              to={`/releases/${release.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="card"
                style={{
                  padding: '1.25rem',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h3
                      style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}
                    >
                      {release.name}
                    </h3>
                    <code
                      style={{
                        backgroundColor: 'var(--accent-light)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--accent-primary)',
                        fontWeight: 600,
                        border: '1px solid #ebdcd0',
                      }}
                    >
                      {release.version}
                    </code>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ReleaseStatusBadge status={release.status} />
                    {release.targetDate && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Target: {new Date(release.targetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {release.description && (
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {release.description}
                  </p>
                )}

                {/* Progress Bar & Summary */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span>Checklist Progress</span>
                    <span>
                      {release.completedSteps || 0} of {release.totalSteps || 0} steps verified
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
