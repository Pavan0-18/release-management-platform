import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Release, ReleaseStatus, ProjectNature } from '@rmp/shared';
import { useReleases } from '../hooks/useReleases';
import { useProject, useProjects } from '../hooks/useProjects';
import { ReleaseStatusBadge } from '../components/releases/ReleaseStatusBadge';
import { ProgressBar } from '../components/releases/ProgressBar';
import { CreateReleaseModal } from '../components/releases/CreateReleaseModal';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Input, Button } from '../components/common/form';

export const ReleasesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();

  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateReleaseOpen, setIsCreateReleaseOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const { data: allProjects = [], isLoading: isLoadingProjects } = useProjects();
  const activeProjectId = projectId || (allProjects.length > 0 ? allProjects[0].id : undefined);

  const { data: currentProject, isLoading: isLoadingCurrentProject } = useProject(activeProjectId);

  // Auto redirect from /releases to first project if available
  useEffect(() => {
    if (!projectId && allProjects.length > 0) {
      navigate(`/projects/${allProjects[0].id}`, { replace: true });
    }
  }, [projectId, allProjects, navigate]);

  // Reset service filter when active project changes
  useEffect(() => {
    setServiceFilter('');
    setStatusFilter('');
    setSearchTerm('');
  }, [activeProjectId]);

  const {
    data: releases = [],
    isLoading: isLoadingReleases,
    isFetching,
    error,
    refetch,
  } = useReleases({
    projectId: activeProjectId,
    serviceName: serviceFilter || undefined,
    status: statusFilter ? (statusFilter as ReleaseStatus) : undefined,
    search: searchTerm.trim() || undefined,
  });

  const isMicroservices = currentProject?.nature === ProjectNature.MICROSERVICES;
  const projectServices: string[] = currentProject?.services || [];

  const totalCount = releases.length;
  const inProgressCount = releases.filter((r) => r.status === ReleaseStatus.IN_PROGRESS).length;
  const deployedCount = releases.filter((r) => r.status === ReleaseStatus.DEPLOYED).length;
  const readyCount = releases.filter((r) => r.status === ReleaseStatus.READY_FOR_DEPLOYMENT).length;
  const draftCount = releases.filter((r) => r.status === ReleaseStatus.DRAFT).length;

  if (isLoadingProjects || (!currentProject && isLoadingCurrentProject)) {
    return <LoadingSpinner message="Loading workspace..." />;
  }

  if (allProjects.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
          }}
        >
          📂
        </div>
        <h2
          style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}
        >
          No Projects Found
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            maxWidth: '420px',
            margin: '0 auto 1.5rem auto',
          }}
        >
          Create your first Monolith or Microservices project to begin managing releases and
          verification gates.
        </p>
        <Button variant="primary" onClick={() => setIsCreateProjectOpen(true)}>
          + Create First Project
        </Button>

        <CreateProjectModal
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          onSuccess={(newId) => navigate(`/projects/${newId}`)}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Project Header */}
      {currentProject && (
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
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}
              >
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
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    backgroundColor: isMicroservices ? '#e0f2fe' : '#f5f5f4',
                    color: isMicroservices ? '#0369a1' : '#57534e',
                    border: isMicroservices ? '1px solid #bae6fd' : '1px solid #e7e5e4',
                  }}
                >
                  {isMicroservices
                    ? `Microservices (${projectServices.length} Services)`
                    : 'Monolith'}
                </span>
              </div>

              {currentProject.description && (
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    marginTop: '0.35rem',
                  }}
                >
                  {currentProject.description}
                </p>
              )}
            </div>

            <Button variant="primary" onClick={() => setIsCreateReleaseOpen(true)}>
              + New Release
            </Button>
          </div>
        </div>
      )}

      {/* 2. Dedicated Search & Filter Section */}
      <section
        className="card"
        style={{
          padding: '1.15rem 1.25rem',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* Search input with inner label */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Input
              label={
                isMicroservices
                  ? 'Search releases by version, name, or service...'
                  : 'Search releases by version or name...'
              }
              innerLabel={true}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="secondary"
            onClick={() => refetch()}
            loading={isFetching && !isLoadingReleases}
            style={{ height: '44px', minWidth: '90px' }}
          >
            Refresh
          </Button>
        </div>

        {/* Microservices Filter Pills (If microservices project) */}
        {isMicroservices && projectServices.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginRight: '0.25rem',
              }}
            >
              Service:
            </span>
            <button
              type="button"
              onClick={() => setServiceFilter('')}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border:
                  serviceFilter === ''
                    ? '1.5px solid var(--accent-primary)'
                    : '1px solid var(--border-color)',
                backgroundColor: serviceFilter === '' ? 'var(--accent-light)' : 'transparent',
                color: serviceFilter === '' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              All Services
            </button>

            {projectServices.map((svc) => (
              <button
                key={svc}
                type="button"
                onClick={() => setServiceFilter(svc)}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    serviceFilter === svc ? '1.5px solid #0369a1' : '1px solid var(--border-color)',
                  backgroundColor: serviceFilter === svc ? '#e0f2fe' : 'transparent',
                  color: serviceFilter === svc ? '#0369a1' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {svc}
              </button>
            ))}
          </div>
        )}

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginRight: '0.25rem',
            }}
          >
            Status:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
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
            All ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(ReleaseStatus.IN_PROGRESS)}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border:
                statusFilter === ReleaseStatus.IN_PROGRESS
                  ? '1.5px solid #b45309'
                  : '1px solid var(--border-color)',
              backgroundColor:
                statusFilter === ReleaseStatus.IN_PROGRESS ? '#fffbeb' : 'transparent',
              color:
                statusFilter === ReleaseStatus.IN_PROGRESS ? '#b45309' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            In Progress ({inProgressCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(ReleaseStatus.READY_FOR_DEPLOYMENT)}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
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
            Ready ({readyCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(ReleaseStatus.DEPLOYED)}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
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
            Deployed ({deployedCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(ReleaseStatus.DRAFT)}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
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
            Drafts ({draftCount})
          </button>
        </div>
      </section>

      {/* 3. Releases List */}
      {isLoadingReleases ? (
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
            padding: '3rem 1.5rem',
            border: '1px dashed var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
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
            {searchTerm || statusFilter || serviceFilter
              ? 'No releases match your selected filters.'
              : `Create the first release for project "${currentProject?.name}".`}
          </p>
          <Button variant="primary" onClick={() => setIsCreateReleaseOpen(true)}>
            + Create Release
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
                  padding: '1.15rem 1.25rem',
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
                    marginBottom: '0.45rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Microservice service badge */}
                    {release.serviceName && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          border: '1px solid #bae6fd',
                        }}
                      >
                        ⚙️ {release.serviceName}
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
                      marginBottom: '0.65rem',
                    }}
                  >
                    {release.description}
                  </p>
                )}

                {/* Progress Bar */}
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
                    <span>Verification Checklist</span>
                    <span>
                      {release.completedSteps || 0} of {release.totalSteps || 0} steps verified (
                      {release.progressPercentage || 0}%)
                    </span>
                  </div>
                  <ProgressBar percentage={release.progressPercentage || 0} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Release Modal */}
      <CreateReleaseModal
        isOpen={isCreateReleaseOpen}
        defaultProjectId={activeProjectId}
        defaultServiceName={serviceFilter}
        onClose={() => setIsCreateReleaseOpen(false)}
      />
    </div>
  );
};
