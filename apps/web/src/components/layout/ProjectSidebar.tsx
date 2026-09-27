import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ProjectNature } from '@rmp/shared';
import { useProjects } from '../../hooks/useProjects';
import { Input, Button } from '../common/form';
import { CreateProjectModal } from '../projects/CreateProjectModal';

export const ProjectSidebar: React.FC = () => {
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
      style={{
        width: '275px',
        minWidth: '275px',
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
          padding: '1.25rem 1.15rem 1rem 1.15rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#faf7f2',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              letterSpacing: '-0.02em',
              boxShadow: '0 2px 6px rgba(115, 63, 28, 0.25)',
            }}
          >
            RM
          </div>
          <div>
            <h1
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Release Hub
            </h1>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              Platform Governance
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}
          title="Create New Project"
        >
          + Project
        </Button>
      </div>

      {/* Project Search Field */}
      <div style={{ padding: '0.85rem 1rem 0.5rem 1rem' }}>
        <Input
          label="Search projects..."
          innerLabel={true}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Projects Navigation Section */}
      <div
        style={{
          padding: '0.25rem 1rem 0.5rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
          }}
        >
          Projects ({projects.length})
        </span>
      </div>

      {/* Project Items List */}
      <div
        style={{
          padding: '0 0.65rem 1rem 0.65rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
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
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-color)',
              margin: '0.5rem 0.25rem',
            }}
          >
            <p style={{ margin: 0, marginBottom: '0.75rem' }}>
              {search ? 'No matching projects' : 'No projects yet'}
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
            const serviceCount = project.services?.length || 0;

            return (
              <NavLink
                key={project.id}
                to={`/projects/${project.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  backgroundColor: isProjectActive ? 'var(--accent-light)' : 'transparent',
                  color: isProjectActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                  border: isProjectActive
                    ? '1.5px solid var(--accent-primary)'
                    : '1px solid transparent',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: isProjectActive ? 'var(--accent-primary)' : '#ede5dc',
                        color: isProjectActive ? '#ffffff' : 'var(--accent-primary)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        letterSpacing: '0.02em',
                        flexShrink: 0,
                      }}
                    >
                      {project.key}
                    </span>
                    <span
                      style={{
                        fontWeight: isProjectActive ? 700 : 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '0.875rem',
                      }}
                    >
                      {project.name}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: isProjectActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                      backgroundColor: isProjectActive ? '#ffffff' : '#f5f0eb',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '999px',
                      flexShrink: 0,
                    }}
                  >
                    {project.totalReleases || 0}
                  </span>
                </div>

                {/* Nature tag & services summary */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    paddingLeft: '0.2rem',
                    fontSize: '0.7rem',
                  }}
                >
                  <span
                    style={{
                      padding: '0.05rem 0.35rem',
                      borderRadius: '3px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      backgroundColor: isMicroservices ? '#e0f2fe' : '#f5f5f4',
                      color: isMicroservices ? '#0369a1' : '#57534e',
                      border: isMicroservices ? '1px solid #bae6fd' : '1px solid #e7e5e4',
                    }}
                  >
                    {isMicroservices ? `Microservices (${serviceCount})` : 'Monolith'}
                  </span>
                </div>
              </NavLink>
            );
          })
        )}
      </div>

      {/* Footer System Status */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#faf7f2',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
            }}
          />
          API Connected
        </span>
        <a
          href="http://localhost:3000/graphql"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}
        >
          GraphQL &rarr;
        </a>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(id) => navigate(`/projects/${id}`)}
      />
    </aside>
  );
};
