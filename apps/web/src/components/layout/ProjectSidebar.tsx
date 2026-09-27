import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { Input, Button } from '../common/form';
import { CreateProjectModal } from '../projects/CreateProjectModal';

export const ProjectSidebar: React.FC = () => {
  const { data: projects = [], isLoading } = useProjects();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const location = useLocation();

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 65px)',
        position: 'sticky',
        top: '65px',
        overflowY: 'auto',
      }}
    >
      {/* Sidebar Header with Action */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Projects
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              padding: '0.1rem 0.4rem',
              borderRadius: '999px',
            }}
          >
            {projects.length}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          title="Create New Project"
        >
          + Project
        </Button>
      </div>

      {/* Search Input */}
      <div style={{ padding: '0.75rem 1rem 0.5rem 1rem' }}>
        <Input
          placeholder="Filter projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: '0.8rem' }}
        />
      </div>

      {/* Navigation Links */}
      <div
        style={{
          padding: '0.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          flex: 1,
        }}
      >
        {/* All Releases Top Link */}
        <NavLink
          to="/releases"
          end
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: isActive && !location.search.includes('projectId') ? 700 : 500,
            backgroundColor:
              isActive && !location.search.includes('projectId')
                ? 'var(--accent-light)'
                : 'transparent',
            color:
              isActive && !location.search.includes('projectId')
                ? 'var(--accent-primary)'
                : 'var(--text-primary)',
            transition: 'all 0.15s ease',
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📦</span>
            <span>All Releases</span>
          </div>
        </NavLink>

        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '0.65rem 0.5rem 0.25rem 0.5rem',
            letterSpacing: '0.04em',
          }}
        >
          Workspaces & Projects
        </div>

        {/* Project List */}
        {isLoading ? (
          <div
            style={{
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            style={{
              padding: '1.5rem 0.75rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            {search ? 'No projects match your filter' : 'No projects created yet'}
            <div style={{ marginTop: '0.5rem' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                style={{ fontSize: '0.75rem' }}
              >
                + Create Project
              </Button>
            </div>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isProjectActive =
              location.pathname === `/projects/${project.id}` ||
              location.search.includes(`projectId=${project.id}`);

            return (
              <NavLink
                key={project.id}
                to={`/projects/${project.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isProjectActive ? 700 : 500,
                  backgroundColor: isProjectActive ? 'var(--accent-light)' : 'transparent',
                  color: isProjectActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                  border: isProjectActive ? '1px solid #ebdcd0' : '1px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: isProjectActive ? 'var(--accent-primary)' : '#ede5dc',
                      color: isProjectActive ? '#ffffff' : 'var(--accent-primary)',
                      padding: '0.15rem 0.35rem',
                      borderRadius: '4px',
                      letterSpacing: '0.02em',
                      flexShrink: 0,
                    }}
                  >
                    {project.key}
                  </span>
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {project.name}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    backgroundColor: '#ffffff',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    marginLeft: '0.25rem',
                    flexShrink: 0,
                  }}
                >
                  {project.totalReleases || 0}
                </span>
              </NavLink>
            );
          })
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </aside>
  );
};
