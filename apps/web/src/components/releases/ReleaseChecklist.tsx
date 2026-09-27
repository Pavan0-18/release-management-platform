import React from 'react';
import { ReleaseStep, StepStatus } from '@rmp/shared';
import { useUpdateReleaseStep, useDeleteReleaseStep } from '../../hooks/useReleases';
import { Select } from '../common/form';

interface Props {
  releaseId: string;
  steps: ReleaseStep[];
}

export const ReleaseChecklist: React.FC<Props> = ({ releaseId, steps }) => {
  const updateStepMutation = useUpdateReleaseStep(releaseId);
  const deleteStepMutation = useDeleteReleaseStep(releaseId);

  const handleStatusChange = (stepId: string, newStatus: StepStatus) => {
    updateStepMutation.mutate({
      id: stepId,
      status: newStatus,
    });
  };

  const handleToggleComplete = (step: ReleaseStep) => {
    const nextStatus =
      step.status === StepStatus.COMPLETED ? StepStatus.PENDING : StepStatus.COMPLETED;
    handleStatusChange(step.id, nextStatus);
  };

  const handleDelete = (stepId: string) => {
    if (window.confirm('Are you sure you want to remove this verification step?')) {
      deleteStepMutation.mutate(stepId);
    }
  };

  if (steps.length === 0) {
    return (
      <div
        style={{
          padding: '2.5rem 1rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-secondary)',
        }}
      >
        <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          No checklist steps created yet
        </p>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Add verification steps, testing gates, or sign-offs above to track progress.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {steps.map((step, index) => {
        const isComplete = step.status === StepStatus.COMPLETED;

        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              backgroundColor: isComplete ? 'var(--bg-primary)' : '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 0.15s ease',
            }}
          >
            {/* Checkbox & Step Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
              <input
                type="checkbox"
                checked={isComplete}
                onChange={() => handleToggleComplete(step)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer',
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                    #{index + 1}
                  </span>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      textDecoration: isComplete ? 'line-through' : 'none',
                      color: isComplete ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}
                  >
                    {step.title}
                  </span>
                  {step.isRequired && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        padding: '0.1rem 0.4rem',
                        backgroundColor: 'var(--status-error-bg)',
                        color: 'var(--status-error-text)',
                        border: '1px solid var(--status-error-border)',
                        borderRadius: '3px',
                      }}
                    >
                      Required
                    </span>
                  )}
                </div>

                {step.description && (
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      marginTop: '0.2rem',
                    }}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Status Selector & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '140px' }}>
                <Select
                  value={step.status}
                  onChange={(val) => handleStatusChange(step.id, val as StepStatus)}
                  options={[
                    { value: StepStatus.PENDING, label: 'Pending' },
                    { value: StepStatus.IN_PROGRESS, label: 'In Progress' },
                    { value: StepStatus.COMPLETED, label: 'Completed' },
                    { value: StepStatus.BLOCKED, label: 'Blocked' },
                    { value: StepStatus.SKIPPED, label: 'Skipped' },
                  ]}
                />
              </div>

              <button
                onClick={() => handleDelete(step.id)}
                title="Remove step"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  fontSize: '0.9rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
