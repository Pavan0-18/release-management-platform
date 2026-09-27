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

  const handleCompleteAll = () => {
    steps.forEach((step) => {
      if (step.status !== StepStatus.COMPLETED) {
        updateStepMutation.mutate({
          id: step.id,
          status: StepStatus.COMPLETED,
        });
      }
    });
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

  const completedCount = steps.filter((s) => s.status === StepStatus.COMPLETED).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Checklist Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '0.25rem',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {completedCount} of {steps.length} steps completed
        </div>

        {completedCount < steps.length && (
          <button
            type="button"
            onClick={handleCompleteAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Mark all completed
          </button>
        )}
      </div>

      {/* Checklist Items */}
      {steps.map((step, index) => {
        const isComplete = step.status === StepStatus.COMPLETED;
        const isBlocked = step.status === StepStatus.BLOCKED;

        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              backgroundColor: isComplete ? '#faf8f5' : '#ffffff',
              border: `1.5px solid ${
                isBlocked ? '#fecaca' : isComplete ? '#e0d5c8' : 'var(--border-color)'
              }`,
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.15s ease',
              gap: '1rem',
            }}
          >
            {/* Checkbox & Step Info */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
              <input
                type="checkbox"
                checked={isComplete}
                onChange={() => handleToggleComplete(step)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer',
                  marginTop: '0.2rem',
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
                      fontWeight: 600,
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
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        backgroundColor: 'var(--status-error-bg)',
                        color: 'var(--status-error-text)',
                        border: '1px solid var(--status-error-border)',
                        borderRadius: '3px',
                      }}
                    >
                      Mandatory
                    </span>
                  )}
                </div>

                {step.description && (
                  <p
                    style={{
                      color: isComplete ? 'var(--text-muted)' : 'var(--text-secondary)',
                      fontSize: '0.825rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Status Selector & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '145px' }}>
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
                type="button"
                onClick={() => handleDelete(step.id)}
                title="Remove step"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.35rem',
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
