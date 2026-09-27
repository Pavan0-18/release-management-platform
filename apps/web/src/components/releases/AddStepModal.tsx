import React, { useState } from 'react';
import { useAddReleaseStep } from '../../hooks/useReleases';
import { Modal, Input, Textarea, Checkbox, Button } from '../common/form';

interface Props {
  isOpen: boolean;
  releaseId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddStepModal: React.FC<Props> = ({ isOpen, releaseId, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(true);

  const addMutation = useAddReleaseStep(releaseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMutation.mutate(
      {
        releaseId,
        title: title.trim(),
        description: description.trim() || undefined,
        isRequired,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setIsRequired(true);
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
      title="Add Verification Step"
      description="Add a checklist gate required before promoting this release"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={addMutation.isPending}
            disabled={addMutation.isPending || !title.trim()}
          >
            Add Step
          </Button>
        </>
      }
    >
      {addMutation.error && (
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
          {addMutation.error.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        <Input
          label="Step Requirement / Title"
          required
          placeholder="e.g. Verify database migrations executed cleanly"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          label="Instructions & Notes"
          rows={3}
          placeholder="Verification command, dashboard link, or sign-off prerequisites..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ marginTop: '0.25rem' }}>
          <Checkbox
            label="Mandatory verification step"
            description="Must be completed or explicitly approved before release deployment"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
          />
        </div>
      </form>
    </Modal>
  );
};
