import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Release, ReleaseStatus, ProjectNature } from '@rmp/shared';
import { useReleases } from '../hooks/useReleases';
import { useProject, useProjects } from '../hooks/useProjects';
import { ReleaseStatusBadge } from '../components/releases/ReleaseStatusBadge';
import { ProgressBar } from '../components/releases/ProgressBar';
import { CreateReleaseModal } from '../components/releases/CreateReleaseModal';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { ManageServicesModal } from '../components/projects/ManageServicesModal';
import { ServicesMatrixView } from '../components/releases/ServicesMatrixView';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Input, Button } from '../components/common/form';

export const ReleasesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();

  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'releases' | 'services'>('releases');
  const [preselectedService, setPreselectedService] = useState<string>('');

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
    setViewMode('releases');
    setPreselectedService('');
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

  // Query all project releases for metrics calculation
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
      {/* 1. Project Header with Nature and Actions */}
      {currentProject && (
        <div
          className="card"
          style={{
            padding: '1.15rem 1.35rem',
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
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
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
                    marginBottom: 0,
                  }}
                >
                  {currentProject.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {isMicroservices && (
                <Button
                  variant="secondary"
                  onClick={() => setIsManageServicesOpen(true)}
                  style={{ height: '40px', fontSize: '0.85rem' }}
                >
                  ⚙️ Manage Services
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => {
                  setPreselectedService('');
                  setIsCreateReleaseOpen(true);
                }}
                style={{ height: '40px', fontSize: '0.85rem' }}
              >
                + New Release
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Microservices View Switcher & Service Filter (Only for Microservices) */}
      {isMicroservices && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Segmented View Switcher */}
          <div
            style={{
              display: 'inline-flex',
              padding: '3px',
              backgroundColor: '#ede5dc',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('releases')}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: viewMode === 'releases' ? '#ffffff' : 'transparent',
                color: viewMode === 'releases' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'releases' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              📋 Releases Feed ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('services')}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: viewMode === 'services' ? '#ffffff' : 'transparent',
                color: viewMode === 'services' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'services' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              🧩 Services Architecture ({projectServices.length})
            </button>
          </div>

          {/* Quick Service Filter Pills (When in Releases View) */}
          {viewMode === 'releases' && projectServices.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Filter Service:
              </span>
              <button
                type="button"
                onClick={() => setServiceFilter('')}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border:
                    serviceFilter === ''
                      ? '1.5px solid var(--accent-primary)'
                      : '1px solid var(--border-color)',
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
                    padding: '0.2rem 0.55rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border:
                      serviceFilter === svc
                        ? '1.5px solid #0369a1'
                        : '1px solid var(--border-color)',
                    backgroundColor: serviceFilter === svc ? '#e0f2fe' : '#ffffff',
                    color: serviceFilter === svc ? '#0369a1' : 'var(--text-secondary)',
                  }}
                >
                  {svc}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Render Services Matrix View or Releases View */}
      {isMicroservices && viewMode === 'services' ? (
        <ServicesMatrixView
          services={projectServices}
          releases={allProjectReleases}
          onSelectService={(svc) => {
            setServiceFilter(svc);
            setViewMode('releases');
          }}
          onNewReleaseForService={(svc) => {
            setPreselectedService(svc);
            setIsCreateReleaseOpen(true);
          }}
          onManageServices={() => setIsManageServicesOpen(true)}
        />
      ) : (
        <>
          {/* Dedicated Search & Filter Section - EXACT SINGLE LINE FORMAT (No refresh button) */}
          <section
            className="card"
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              flexWrap: 'wrap',
              minHeight: '56px',
            }}
          >
            {/* Search Input with Inner Label on Left */}
            <div style={{ flex: '1 1 280px', minWidth: '220px' }}>
              <Input
                label={
                  isMicroservices
                    ? 'Search releases by version, name, or service...'
                    : 'Search releases by version or name...'
                }
                innerLabel={true}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ margin: 0 }}
              />
            </div>

            {/* Status Filter Pills in Exact Single Line on Right */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexShrink: 0,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginRight: '0.2rem',
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
                  height: '30px',
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
                  height: '30px',
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
                  height: '30px',
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
                  height: '30px',
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
                  height: '30px',
                }}
              >
                Drafts ({draftCount})
              </button>
            </div>
          </section>

          {/* Releases List */}
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
                  marginBottom: '0.5rem',
                }}
              >
                No releases found
              </h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                }}
              >
                {searchTerm || statusFilter || serviceFilter
                  ? 'Try clearing your filters or search terms.'
                  : 'Start planning and executing verification gates for your deployments.'}
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setPreselectedService('');
                  setIsCreateReleaseOpen(true);
                }}
              >
                + Create First Release
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {releases.map((release) => (
                <Link
                  key={release.id}
                  to={`/releases/${release.id}`}
                  className="card"
                  style={{
                    display: 'block',
                    padding: '1.15rem 1.35rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {/* Service badge if microservices */}
                        {release.serviceName && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              fontFamily: 'monospace',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {release.serviceName}
                          </span>
                        )}

                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--accent-primary)',
                            backgroundColor: '#ede5dc',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          {release.version}
                        </span>

                        <h3
                          style={{
                            margin: 0,
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {release.name}
                        </h3>
                      </div>

                      {release.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.4,
                          }}
                        >
                          {release.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <ReleaseStatusBadge status={release.status} />
                    </div>
                  </div>

                  {/* Progress & Metadata */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                      marginTop: '0.75rem',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flex: 1,
                        minWidth: '220px',
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>
                        Verification Gates: {release.completedSteps}/{release.totalSteps}
                      </span>
                      <div style={{ flex: 1, maxWidth: '160px' }}>
                        <ProgressBar
                          percentage={release.progressPercentage || 0}
                        />
                      </div>
                    </div>

                    <div>
                      {release.targetDate && (
                        <span>Target: {new Date(release.targetDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Release Modal */}
      <CreateReleaseModal
        isOpen={isCreateReleaseOpen}
        onClose={() => {
          setIsCreateReleaseOpen(false);
          setPreselectedService('');
        }}
        defaultProjectId={activeProjectId}
        defaultServiceName={preselectedService || serviceFilter || undefined}
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
