import React, { useState } from 'react';
import { useCreateRelease } from '../../hooks/useReleases';
import { Modal, Input, Textarea, DatePicker, Button } from '../common/form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateReleaseModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([
    'Run automated test suite',
    'Verify staging deployment',
    'Perform security audit check',
  ]);
  const [newStepText, setNewStepText] = useState('');

  const createMutation = useCreateRelease();

  const handleAddInlineStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStepText.trim()) {
      setChecklistItems([...checklistItems, newStepText.trim()]);
      setNewStepText('');
    }
  };

  const handleRemoveInlineStep = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !version.trim()) return;

    createMutation.mutate(
      {
        name: name.trim(),
        version: version.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
        steps: checklistItems.map((title) => ({
          title,
          isRequired: true,
        })),
      },
      {
        onSuccess: () => {
          setName('');
          setVersion('');
          setDescription('');
          setTargetDate('');
          onClose();
          if (onSuccess) onSuccess();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Release"
      description="Initialize release metadata and default checklist gates"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={createMutation.isPending}
            disabled={createMutation.isPending || !name.trim() || !version.trim()}
          >
            Create Release
          </Button>
        </>
      }
    >
      {createMutation.error && (
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
          {createMutation.error.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        <Input
          label="Release Name"
          required
          placeholder="e.g. October 2026 Core Platform Upgrade"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Input
            label="Semantic Version"
            required
            helper="e.g. v1.2.0"
            placeholder="v1.0.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />

          <DatePicker
            label="Target Deployment Date"
            value={targetDate}
            onChange={(date) => setTargetDate(date)}
          />
        </div>

        <Textarea
          label="Description & Scope"
          rows={2}
          placeholder="Summary of changes, key components, or deployment criteria..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Initial Checklist Items */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}
        >
          <label
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Initial Checklist Steps ({checklistItems.length})
          </label>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              marginBottom: '0.4rem',
            }}
          >
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.65rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                }}
              >
                <span>&bull; {item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInlineStep(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '0.1rem 0.3rem',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Add step"
                placeholder="e.g. Run database migrations"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInlineStep(e);
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddInlineStep}
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
