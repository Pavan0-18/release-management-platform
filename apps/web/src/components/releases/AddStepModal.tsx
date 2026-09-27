import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_RELEASE_STEP, GET_RELEASE } from '../../graphql/releases.queries';

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

  const [addStep, { loading, error }] = useMutation(ADD_RELEASE_STEP, {
    refetchQueries: [{ query: GET_RELEASE, variables: { id: releaseId } }],
    onCompleted: () => {
      setTitle('');
      setDescription('');
      setIsRequired(true);
      onClose();
      if (onSuccess) onSuccess();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addStep({
      variables: {
        input: {
          releaseId,
          title: title.trim(),
          description: description.trim() || undefined,
          isRequired,
        },
      },
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.75rem',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Add Verification Step
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {error && (
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
            {error.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.3rem',
              }}
            >
              Step Title / Requirement <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Verify database migration execution"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.3rem',
              }}
            >
              Instructions / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Verification command, dashboard URL, or prerequisite..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}
          >
            <input
              type="checkbox"
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer',
              }}
            />
            <label
              htmlFor="isRequired"
              style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              Mandatory step for release promotion
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              marginTop: '0.75rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.75rem',
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim()} className="btn btn-primary">
              {loading ? 'Adding...' : 'Add Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
