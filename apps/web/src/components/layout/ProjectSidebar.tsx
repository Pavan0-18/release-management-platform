import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ProjectNature } from '@rmp/shared';
import { useProjects } from '../../hooks/useProjects';
import { Input, Button } from '../common/form';
import { CreateProjectModal } from '../projects/CreateProjectModal';

interface ProjectSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { data: projects = [], isLoading } = useProjects();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside
      className={`project-sidebar-container ${isMobileOpen ? 'open' : ''}`}
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {/* Platform Branding Header */}
      <div
        style={{
          padding: '0 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          height: '56px',
          boxSizing: 'border-box',
        }}
      >
        <h1
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          Release Hub
        </h1>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: '30px' }}
          title="Create New Project"
        >
          + Project
        </Button>
      </div>

      {/* Project Search Field */}
      <div style={{ padding: '0.65rem 0.75rem 0.35rem 0.75rem' }}>
        <Input
          label="Search projects..."
          innerLabel={true}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Project Items List - Single Line layout */}
      <div
        style={{
          padding: '0.35rem 0.6rem 0.75rem 0.6rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {isLoading ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            Loading...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            style={{
              padding: '1.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            <p style={{ margin: 0, marginBottom: '0.75rem' }}>
              {search ? 'No matches' : 'No projects'}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              style={{ fontSize: '0.75rem' }}
            >
              + Create Project
            </Button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isProjectActive = location.pathname.includes(`/projects/${project.id}`);
            const isMicroservices = project.nature === ProjectNature.MICROSERVICES;

            return (
              <NavLink
                key={project.id}
                to={`/projects/${project.id}`}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '0 0.65rem',
                  height: '38px',
                  minHeight: '38px',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  backgroundColor: isProjectActive ? 'var(--accent-light)' : 'transparent',
                  color: isProjectActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                  border: isProjectActive
                    ? '1px solid var(--accent-primary)'
                    : '1px solid transparent',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: isProjectActive ? 'var(--accent-primary)' : '#ede5dc',
                      color: isProjectActive ? '#ffffff' : 'var(--accent-primary)',
                      padding: '0.12rem 0.35rem',
                      borderRadius: '3px',
                      letterSpacing: '0.02em',
                      flexShrink: 0,
                    }}
                  >
                    {project.key}
                  </span>
                  <span
                    style={{
                      fontWeight: isProjectActive ? 700 : 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.85rem',
                    }}
                    title={project.name}
                  >
                    {project.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                  {isMicroservices && (
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        color: '#0369a1',
                        backgroundColor: '#e0f2fe',
                        padding: '0.05rem 0.3rem',
                        borderRadius: '3px',
                      }}
                      title="Microservices project"
                    >
                      MS
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: isProjectActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                      backgroundColor: isProjectActive ? '#ffffff' : '#f5f0eb',
                      padding: '0.05rem 0.4rem',
                      borderRadius: '999px',
                    }}
                  >
                    {project.totalReleases || 0}
                  </span>
                </div>
              </NavLink>
            );
          })
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(id) => {
          navigate(`/projects/${id}`);
          if (onCloseMobile) onCloseMobile();
        }}
      />
    </aside>
  );
};
