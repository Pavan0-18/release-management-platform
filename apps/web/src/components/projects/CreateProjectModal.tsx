import React, { useState } from 'react';
import { DefaultChecklistItem, ProjectNature } from '@rmp/shared';
import { useCreateProject } from '../../hooks/useProjects';
import { Modal, Input, Textarea, Button } from '../common/form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

export const CreateProjectModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [nature, setNature] = useState<ProjectNature>(ProjectNature.MONOLITH);
  const [services, setServices] = useState<string[]>([
    'auth-service',
    'api-gateway',
    'payment-service',
  ]);
  const [newServiceName, setNewServiceName] = useState('');

  const [defaultChecklist, setDefaultChecklist] = useState<DefaultChecklistItem[]>([
    { title: 'Automated test suite passing', isRequired: true },
    { title: 'Staging environment validation', isRequired: true },
    { title: 'Security & vulnerability scan', isRequired: true },
  ]);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepRequired, setNewStepRequired] = useState(true);

  const createProjectMutation = useCreateProject();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (
      !key ||
      key ===
        name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, 6)
    ) {
      const generated = val
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6);
      setKey(generated);
    }
  };

  const handleAddService = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newServiceName.trim().toLowerCase().replace(/\s+/g, '-');
    if (trimmed && !services.includes(trimmed)) {
      setServices([...services, trimmed]);
      setNewServiceName('');
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter((s) => s !== serviceToRemove));
  };

  const handleAddDefaultStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStepTitle.trim()) {
      setDefaultChecklist([
        ...defaultChecklist,
        {
          title: newStepTitle.trim(),
          isRequired: newStepRequired,
        },
      ]);
      setNewStepTitle('');
      setNewStepRequired(true);
    }
  };

  const handleRemoveDefaultStep = (index: number) => {
    setDefaultChecklist(defaultChecklist.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    createProjectMutation.mutate(
      {
        name: name.trim(),
        key: key.toUpperCase().trim(),
        description: description.trim() || undefined,
        nature,
        services: nature === ProjectNature.MICROSERVICES ? services : undefined,
        defaultChecklist: defaultChecklist.length > 0 ? defaultChecklist : undefined,
      },
      {
        onSuccess: (newProject) => {
          setName('');
          setKey('');
          setDescription('');
          onClose();
          if (onSuccess) onSuccess(newProject.id);
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={createProjectMutation.isPending}
            disabled={createProjectMutation.isPending || !name.trim() || !key.trim()}
          >
            Create Project
          </Button>
        </>
      }
    >
      {createProjectMutation.error && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--status-error-bg)',
            color: 'var(--status-error-text)',
            border: '1px solid var(--status-error-border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
          }}
        >
          {createProjectMutation.error.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {/* Project Name & Key */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Project Name"
            innerLabel={true}
            required
            placeholder="e.g. Core Banking Platform"
            value={name}
            onChange={handleNameChange}
          />

          <Input
            label="Project Key"
            innerLabel={true}
            required
            placeholder="CORE"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
          />
        </div>

        {/* Nature of Project: Monolith vs Microservices */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.4rem',
            }}
          >
            Nature of Project
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div
              onClick={() => setNature(ProjectNature.MONOLITH)}
              style={{
                border:
                  nature === ProjectNature.MONOLITH
                    ? '2px solid var(--accent-primary)'
                    : '1px solid var(--border-color)',
                backgroundColor:
                  nature === ProjectNature.MONOLITH ? 'var(--accent-light)' : '#ffffff',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.2rem',
                }}
              >
                <input
                  type="radio"
                  name="nature"
                  checked={nature === ProjectNature.MONOLITH}
                  onChange={() => setNature(ProjectNature.MONOLITH)}
                />
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Monolith
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Single application with unified version releases.
              </p>
            </div>

            <div
              onClick={() => setNature(ProjectNature.MICROSERVICES)}
              style={{
                border:
                  nature === ProjectNature.MICROSERVICES
                    ? '2px solid var(--accent-primary)'
                    : '1px solid var(--border-color)',
                backgroundColor:
                  nature === ProjectNature.MICROSERVICES ? 'var(--accent-light)' : '#ffffff',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.2rem',
                }}
              >
                <input
                  type="radio"
                  name="nature"
                  checked={nature === ProjectNature.MICROSERVICES}
                  onChange={() => setNature(ProjectNature.MICROSERVICES)}
                />
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Microservices
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Multiple independent services with per-service releases.
              </p>
            </div>
          </div>
        </div>

        {/* Microservices List (If Microservices selected) */}
        {nature === ProjectNature.MICROSERVICES && (
          <div
            style={{
              backgroundColor: '#fbf8f5',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Services ({services.length})
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Releases can be deployed per service
              </span>
            </div>

            {/* Service Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {services.map((svc) => (
                <span
                  key={svc}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--accent-primary)',
                    color: 'var(--accent-primary)',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <span>{svc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(svc)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 0,
                      fontSize: '0.75rem',
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            {/* Add Service input */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Add service name"
                  innerLabel={true}
                  placeholder="e.g. notification-worker"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddService}
                style={{ height: '44px' }}
              >
                + Add Service
              </Button>
            </div>
          </div>
        )}

        {/* Description */}
        <Textarea
          label="Description"
          innerLabel={true}
          rows={2}
          placeholder="Brief summary of project scope..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Default Verification Checklist Builder */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Default Checklist ({defaultChecklist.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Auto-populated into each release
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
              maxHeight: '130px',
              overflowY: 'auto',
            }}
          >
            {defaultChecklist.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>✓</span>
                  <span>{item.title}</span>
                  {item.isRequired && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '0.05rem 0.3rem',
                        backgroundColor: 'var(--accent-light)',
                        color: 'var(--accent-primary)',
                        borderRadius: '3px',
                      }}
                    >
                      Mandatory
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveDefaultStep(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add Step row */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Add checklist template item"
                innerLabel={true}
                placeholder="e.g. Smoke test API endpoints"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDefaultStep(e);
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddDefaultStep}
              style={{ height: '44px' }}
            >
              Add
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
