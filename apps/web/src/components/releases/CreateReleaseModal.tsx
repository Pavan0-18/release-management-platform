import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_RELEASE, GET_RELEASES } from '../../graphql/releases.queries';

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

  const [createRelease, { loading, error }] = useMutation(CREATE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES }],
    onCompleted: () => {
      setName('');
      setVersion('');
      setDescription('');
      setTargetDate('');
      onClose();
      if (onSuccess) onSuccess();
    },
  });

  if (!isOpen) return null;

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

    createRelease({
      variables: {
        input: {
          name: name.trim(),
          version: version.trim(),
          description: description.trim() || undefined,
          targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
          steps: checklistItems.map((title) => ({
            title,
            isRequired: true,
          })),
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
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
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
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Create New Release
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
              Release Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. October 2026 Core Platform Upgrade"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                Semantic Version <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. v1.2.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
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
                Target Deployment Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                }}
              />
            </div>
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
              Description & Scope
            </label>
            <textarea
              rows={2}
              placeholder="Summary of changes or key components..."
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

          {/* Initial Checklist Items */}
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
              Initial Checklist Steps ({checklistItems.length})
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                marginBottom: '0.5rem',
              }}
            >
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.35rem 0.6rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                  }}
                >
                  <span>&bull; {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInlineStep(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Add checklist step..."
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInlineStep(e);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.8rem',
                }}
              />
              <button
                type="button"
                onClick={handleAddInlineStep}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                Add
              </button>
            </div>
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
            <button
              type="submit"
              disabled={loading || !name.trim() || !version.trim()}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Release'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
