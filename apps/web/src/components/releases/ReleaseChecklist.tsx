import React from 'react';
import { useMutation } from '@apollo/client';
import { ReleaseStep, StepStatus } from '@rmp/shared';
import {
  DELETE_RELEASE_STEP,
  GET_RELEASE,
  UPDATE_RELEASE_STEP,
} from '../../graphql/releases.queries';
import { StepStatusBadge } from './StepStatusBadge';

interface Props {
  releaseId: string;
  steps: ReleaseStep[];
}

export const ReleaseChecklist: React.FC<Props> = ({ releaseId, steps }) => {
  const [updateStep] = useMutation(UPDATE_RELEASE_STEP, {
    refetchQueries: [{ query: GET_RELEASE, variables: { id: releaseId } }],
  });

  const [deleteStep] = useMutation(DELETE_RELEASE_STEP, {
    refetchQueries: [{ query: GET_RELEASE, variables: { id: releaseId } }],
  });

  const handleStatusChange = (stepId: string, newStatus: StepStatus) => {
    updateStep({
      variables: {
        input: {
          id: stepId,
          status: newStatus,
        },
      },
    });
  };

  const handleToggleComplete = (step: ReleaseStep) => {
    const nextStatus =
      step.status === StepStatus.COMPLETED ? StepStatus.PENDING : StepStatus.COMPLETED;
    handleStatusChange(step.id, nextStatus);
  };

  const handleDelete = (stepId: string) => {
    if (window.confirm('Are you sure you want to remove this verification step?')) {
      deleteStep({
        variables: { id: stepId },
      });
    }
  };

  if (steps.length === 0) {
    return (
      <div
        style={{
          padding: '2.5rem 1rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-muted)',
        }}
      >
        <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>No checklist items created yet.</p>
        <p style={{ fontSize: '0.85rem' }}>
          Add release verification steps, deployment gates, or sign-offs above.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {steps.map((step, index) => {
        const isComplete = step.status === StepStatus.COMPLETED;

        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Step Checkbox & Details */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
              <input
                type="checkbox"
                checked={isComplete}
                onChange={() => handleToggleComplete(step)}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '0.2rem',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer',
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}
                >
                  <span
                    style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    #{index + 1}
                  </span>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textDecoration: isComplete ? 'line-through' : 'none',
                      color: isComplete ? 'var(--text-secondary)' : 'var(--text-primary)',
                    }}
                  >
                    {step.title}
                  </span>
                  {step.isRequired && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.1rem 0.4rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        color: '#f87171',
                        borderRadius: '4px',
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
                      fontSize: '0.85rem',
                      marginTop: '0.35rem',
                    }}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Status Selector & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                value={step.status}
                onChange={(e) => handleStatusChange(step.id, e.target.value as StepStatus)}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <option value={StepStatus.PENDING}>Pending</option>
                <option value={StepStatus.IN_PROGRESS}>In Progress</option>
                <option value={StepStatus.COMPLETED}>Completed</option>
                <option value={StepStatus.BLOCKED}>Blocked</option>
                <option value={StepStatus.SKIPPED}>Skipped</option>
              </select>

              <button
                onClick={() => handleDelete(step.id)}
                title="Remove step"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem 0.4rem',
                  fontSize: '1rem',
                }}
              >
                🗑
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
