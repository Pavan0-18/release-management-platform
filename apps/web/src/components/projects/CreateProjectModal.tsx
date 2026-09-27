import React, { useState } from 'react';
import { DefaultChecklistItem } from '@rmp/shared';
import { useCreateProject } from '../../hooks/useProjects';
import { Modal, Input, Textarea, Checkbox, Button } from '../common/form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

export const CreateProjectModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [defaultChecklist, setDefaultChecklist] = useState<DefaultChecklistItem[]>([
    { title: 'Run automated test suite', isRequired: true },
    { title: 'Verify staging deployment', isRequired: true },
    { title: 'Perform security & vulnerability scan', isRequired: true },
  ]);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepRequired, setNewStepRequired] = useState(true);

  const createProjectMutation = useCreateProject();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto-suggest project key if key hasn't been manually heavily edited
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
      description="Projects organize releases and supply default verification checklist templates"
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
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Project Name"
            required
            placeholder="e.g. Core Banking API"
            value={name}
            onChange={handleNameChange}
          />

          <Input
            label="Project Key"
            required
            helper="e.g. CORE, API, WEB"
            placeholder="CORE"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
          />
        </div>

        <Textarea
          label="Project Description"
          rows={2}
          placeholder="Purpose of this project repository, key stakeholders, and architecture scope..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Default Verification Checklist Builder */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            marginTop: '0.35rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              Default Release Checklist Template ({defaultChecklist.length})
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Auto-applied to every new release
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              maxHeight: '160px',
              overflowY: 'auto',
              marginBottom: '0.35rem',
            }}
          >
            {defaultChecklist.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.65rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>✓</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.title}
                  </span>
                  {item.isRequired && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '0.05rem 0.35rem',
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
                    fontSize: '0.85rem',
                    padding: '0.1rem 0.3rem',
                  }}
                  title="Remove template step"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add new default step row */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Add default checklist step"
                placeholder="e.g. Verify database migration rollback script"
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
