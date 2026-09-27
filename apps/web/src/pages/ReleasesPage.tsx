import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Release, ReleaseStatus } from '@rmp/shared';
import { useReleases } from '../hooks/useReleases';
import { useProject, useProjects } from '../hooks/useProjects';
import { ReleaseStatusBadge } from '../components/releases/ReleaseStatusBadge';
import { ProgressBar } from '../components/releases/ProgressBar';
import { CreateReleaseModal } from '../components/releases/CreateReleaseModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Input, Button } from '../components/common/form';

export const ReleasesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: currentProject } = useProject(projectId);
  const { data: allProjects = [] } = useProjects();

  const {
    data: releases = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useReleases({
    projectId: projectId || undefined,
    status: statusFilter ? (statusFilter as ReleaseStatus) : undefined,
    search: searchTerm.trim() || undefined,
  });

  const totalCount = releases.length;
  const inProgressCount = releases.filter((r) => r.status === ReleaseStatus.IN_PROGRESS).length;
  const deployedCount = releases.filter((r) => r.status === ReleaseStatus.DEPLOYED).length;
  const draftCount = releases.filter((r) => r.status === ReleaseStatus.DRAFT).length;
  const readyCount = releases.filter((r) => r.status === ReleaseStatus.READY_FOR_DEPLOYMENT).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Project Banner or Global Releases Header */}
      {projectId && currentProject ? (
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#ffffff',
            borderLeft: '4px solid var(--accent-primary)',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {currentProject.key}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentProject.name}
                </h2>
              </div>
              {currentProject.description && (
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginTop: '0.35rem',
                  }}
                >
                  {currentProject.description}
                </p>
              )}
            </div>

            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + New Release
            </Button>
          </div>
        </div>
      ) : (
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
              All Releases
            </h2>
            <p
              style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}
            >
              Multi-project deployment pipelines and verification gates
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            disabled={allProjects.length === 0}
            title={allProjects.length === 0 ? 'Create a project first' : undefined}
          >
            + New Release
          </Button>
        </div>
      )}

      {/* Sleek Compact Status Pills Toolbar (Clean status presentation) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            border:
              statusFilter === ''
                ? '1.5px solid var(--accent-primary)'
                : '1px solid var(--border-color)',
            backgroundColor: statusFilter === '' ? 'var(--accent-light)' : 'transparent',
            color: statusFilter === '' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>All Releases</span>
          <span
            style={{
              backgroundColor: statusFilter === '' ? 'var(--accent-primary)' : '#ede5dc',
              color: statusFilter === '' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '999px',
            }}
          >
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(ReleaseStatus.IN_PROGRESS)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            border:
              statusFilter === ReleaseStatus.IN_PROGRESS
                ? '1.5px solid #b45309'
                : '1px solid var(--border-color)',
            backgroundColor: statusFilter === ReleaseStatus.IN_PROGRESS ? '#fffbeb' : 'transparent',
            color: statusFilter === ReleaseStatus.IN_PROGRESS ? '#b45309' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>In Progress</span>
          <span
            style={{
              backgroundColor: statusFilter === ReleaseStatus.IN_PROGRESS ? '#b45309' : '#fef3c7',
              color: statusFilter === ReleaseStatus.IN_PROGRESS ? '#ffffff' : '#92400e',
              fontSize: '0.7rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '999px',
            }}
          >
            {inProgressCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(ReleaseStatus.READY_FOR_DEPLOYMENT)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            border:
              statusFilter === ReleaseStatus.READY_FOR_DEPLOYMENT
                ? '1.5px solid #2563eb'
                : '1px solid var(--border-color)',
            backgroundColor:
              statusFilter === ReleaseStatus.READY_FOR_DEPLOYMENT ? '#eff6ff' : 'transparent',
            color:
              statusFilter === ReleaseStatus.READY_FOR_DEPLOYMENT
                ? '#1d4ed8'
                : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Ready for Deploy</span>
          <span
            style={{
              backgroundColor:
                statusFilter === ReleaseStatus.READY_FOR_DEPLOYMENT ? '#2563eb' : '#dbeafe',
              color: statusFilter === ReleaseStatus.READY_FOR_DEPLOYMENT ? '#ffffff' : '#1e40af',
              fontSize: '0.7rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '999px',
            }}
          >
            {readyCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(ReleaseStatus.DEPLOYED)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            border:
              statusFilter === ReleaseStatus.DEPLOYED
                ? '1.5px solid #16a34a'
                : '1px solid var(--border-color)',
            backgroundColor: statusFilter === ReleaseStatus.DEPLOYED ? '#f0fdf4' : 'transparent',
            color: statusFilter === ReleaseStatus.DEPLOYED ? '#15803d' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Deployed</span>
          <span
            style={{
              backgroundColor: statusFilter === ReleaseStatus.DEPLOYED ? '#16a34a' : '#dcfce7',
              color: statusFilter === ReleaseStatus.DEPLOYED ? '#ffffff' : '#166534',
              fontSize: '0.7rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '999px',
            }}
          >
            {deployedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(ReleaseStatus.DRAFT)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            border:
              statusFilter === ReleaseStatus.DRAFT
                ? '1.5px solid #78716c'
                : '1px solid var(--border-color)',
            backgroundColor: statusFilter === ReleaseStatus.DRAFT ? '#f5f5f4' : 'transparent',
            color: statusFilter === ReleaseStatus.DRAFT ? '#44403c' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Drafts</span>
          <span
            style={{
              backgroundColor: statusFilter === ReleaseStatus.DRAFT ? '#78716c' : '#e7e5e4',
              color: statusFilter === ReleaseStatus.DRAFT ? '#ffffff' : '#44403c',
              fontSize: '0.7rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '999px',
            }}
          >
            {draftCount}
          </span>
        </button>

        {/* Search input inside toolbar */}
        <div style={{ marginLeft: 'auto', minWidth: '220px' }}>
          <Input
            placeholder="Search releases by name or version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => refetch()}
          title="Refresh"
          loading={isFetching && !isLoading}
          style={{ height: '44px' }}
        >
          Refresh
        </Button>
      </div>

      {/* Releases List */}
      {isLoading ? (
        <LoadingSpinner message="Loading releases..." />
      ) : error ? (
        <div className="card" style={{ borderLeft: '4px solid var(--status-error-border)' }}>
          <p style={{ color: 'var(--status-error-text)' }}>
            Failed to load releases: {(error as Error).message}
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
              : projectId
                ? `Create the first release for project "${currentProject?.name}".`
                : 'Create your first project and release to begin governance tracking.'}
          </p>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Create First Release
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {releases.map((release: Release) => (
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
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {release.project && !projectId && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: '#ede5dc',
                          color: 'var(--accent-primary)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {release.project.key}
                      </span>
                    )}

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
      <CreateReleaseModal
        isOpen={isCreateOpen}
        defaultProjectId={projectId}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
