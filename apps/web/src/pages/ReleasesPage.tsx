import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ReleaseStatus, ProjectNature } from '@rmp/shared';
import { useReleases } from '../hooks/useReleases';
import { useProject, useProjects } from '../hooks/useProjects';
import { ReleaseStatusBadge } from '../components/releases/ReleaseStatusBadge';
import { CreateReleaseModal } from '../components/releases/CreateReleaseModal';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { ManageServicesModal } from '../components/projects/ManageServicesModal';
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
  const [isManageServicesOpen, setIsManageServicesOpen] = useState(false);

  const { data: allProjects = [], isLoading: isLoadingProjects } = useProjects();
  const activeProjectId = projectId || (allProjects.length > 0 ? allProjects[0].id : undefined);

  const { data: currentProject, isLoading: isLoadingCurrentProject } = useProject(activeProjectId);

  // Auto redirect from /releases to first project if available
  useEffect(() => {
    if (!projectId && allProjects.length > 0) {
      navigate(`/projects/${allProjects[0].id}`, { replace: true });
    }
  }, [projectId, allProjects, navigate]);

  // Reset filters when active project changes
  useEffect(() => {
    setServiceFilter('');
    setStatusFilter('');
    setSearchTerm('');
  }, [activeProjectId]);

  const {
    data: releases = [],
    isLoading: isLoadingReleases,
    error,
  } = useReleases({
    projectId: activeProjectId,
    serviceName: serviceFilter || undefined,
    status: statusFilter ? (statusFilter as ReleaseStatus) : undefined,
    search: searchTerm.trim() || undefined,
  });

  // Query all project releases for status count indicators
  const { data: allProjectReleases = [] } = useReleases({
    projectId: activeProjectId,
  });

  const isMicroservices = currentProject?.nature === ProjectNature.MICROSERVICES;
  const projectServices: string[] = currentProject?.services || [];

  const totalCount = allProjectReleases.length;
  const inProgressCount = allProjectReleases.filter((r) => r.status === ReleaseStatus.IN_PROGRESS).length;
  const deployedCount = allProjectReleases.filter((r) => r.status === ReleaseStatus.DEPLOYED).length;
  const readyCount = allProjectReleases.filter(
    (r) => r.status === ReleaseStatus.READY_FOR_DEPLOYMENT,
  ).length;
  const draftCount = allProjectReleases.filter((r) => r.status === ReleaseStatus.DRAFT).length;

  if (isLoadingProjects || (!currentProject && isLoadingCurrentProject)) {
    return <LoadingSpinner message="Loading workspace..." />;
  }

  if (allProjects.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Projects Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Create your first project to begin managing releases.
        </p>
        <Button variant="primary" onClick={() => setIsCreateProjectOpen(true)}>
          + Create Project
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. Sleek Project Header */}
      {currentProject && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                letterSpacing: '0.02em',
              }}
            >
              {currentProject.key}
            </span>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {currentProject.name}
            </h2>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                backgroundColor: isMicroservices ? '#e0f2fe' : '#f5f5f4',
                color: isMicroservices ? '#0369a1' : '#57534e',
              }}
            >
              {isMicroservices ? `Microservices (${projectServices.length})` : 'Monolith'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isMicroservices && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsManageServicesOpen(true)}
              >
                ⚙️ Services
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateReleaseOpen(true)}
            >
              + New Release
            </Button>
          </div>
        </div>
      )}

      {/* 2. Single Line Search & Status Filter Section */}
      <section
        style={{
          padding: '0.5rem 0.85rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          minHeight: '52px',
        }}
      >
        {/* Search Input with Inner Label */}
        <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
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

        {/* Status Filter in Exact Single Line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginRight: '0.15rem',
            }}
          >
            Status:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter('')}
            style={{
              padding: '0.2rem 0.5rem',
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
              height: '28px',
            }}
          >
            All ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(ReleaseStatus.IN_PROGRESS)}
            style={{
              padding: '0.2rem 0.5rem',
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
              height: '28px',
            }}
          >
            In Progress ({inProgressCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(ReleaseStatus.READY_FOR_DEPLOYMENT)}
            style={{
              padding: '0.2rem 0.5rem',
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
              height: '28px',
            }}
          >
            Ready ({readyCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(ReleaseStatus.DEPLOYED)}
            style={{
              padding: '0.2rem 0.5rem',
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
              height: '28px',
            }}
          >
            Deployed ({deployedCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(ReleaseStatus.DRAFT)}
            style={{
              padding: '0.2rem 0.5rem',
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
              height: '28px',
            }}
          >
            Drafts ({draftCount})
          </button>
        </div>
      </section>

      {/* 3. Microservice Filter Pills (If microservices project) */}
      {isMicroservices && projectServices.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Service:
          </span>
          <button
            type="button"
            onClick={() => setServiceFilter('')}
            style={{
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: serviceFilter === '' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              backgroundColor: serviceFilter === '' ? 'var(--accent-light)' : '#ffffff',
              color: serviceFilter === '' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            All
          </button>
          {projectServices.map((svc) => (
            <button
              key={svc}
              type="button"
              onClick={() => setServiceFilter(svc)}
              style={{
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'monospace',
                border: serviceFilter === svc ? '1px solid #0369a1' : '1px solid var(--border-color)',
                backgroundColor: serviceFilter === svc ? '#e0f2fe' : '#ffffff',
                color: serviceFilter === svc ? '#0369a1' : 'var(--text-secondary)',
              }}
            >
              {svc}
            </button>
          ))}
        </div>
      )}

      {/* 4. Releases List */}
      {isLoadingReleases ? (
        <LoadingSpinner message="Loading releases..." />
      ) : error ? (
        <div className="card" style={{ borderLeft: '4px solid var(--status-error-border)' }}>
          <p style={{ color: 'var(--status-error-text)', margin: 0, fontSize: '0.85rem' }}>
            Failed to load releases: {(error as Error).message}
          </p>
        </div>
      ) : releases.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)',
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
            {searchTerm || statusFilter || serviceFilter ? 'No matching releases' : 'No releases yet'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateReleaseOpen(true)}>
            + Create Release
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {releases.map((release) => (
            <Link
              key={release.id}
              to={`/releases/${release.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                textDecoration: 'none',
                color: 'inherit',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.15s ease',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    backgroundColor: '#ede5dc',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                  }}
                >
                  {release.version}
                </span>

                {release.serviceName && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      fontFamily: 'monospace',
                    }}
                  >
                    {release.serviceName}
                  </span>
                )}

                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {release.name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Gates: {release.completedSteps}/{release.totalSteps}
                </span>
                <ReleaseStatusBadge status={release.status} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Release Modal */}
      <CreateReleaseModal
        isOpen={isCreateReleaseOpen}
        onClose={() => setIsCreateReleaseOpen(false)}
        defaultProjectId={activeProjectId}
        defaultServiceName={serviceFilter || undefined}
        onSuccess={(id) => navigate(`/releases/${id}`)}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={(id) => navigate(`/projects/${id}`)}
      />

      {/* Manage Services Modal */}
      {currentProject && (
        <ManageServicesModal
          isOpen={isManageServicesOpen}
          onClose={() => setIsManageServicesOpen(false)}
          project={currentProject}
        />
      )}
    </div>
  );
};
