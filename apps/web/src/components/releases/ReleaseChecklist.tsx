import React from 'react';
import { useMutation } from '@apollo/client';
import { ReleaseStep, StepStatus } from '@rmp/shared';
import {
  DELETE_RELEASE_STEP,
  GET_RELEASE,
  UPDATE_RELEASE_STEP,
} from '../../graphql/releases.queries';

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
          padding: '2rem 1rem',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-secondary)',
        }}
      >
        <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>No checklist steps created yet.</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Add verification steps, testing gates, or sign-offs above.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {steps.map((step, index) => {
        const isComplete = step.status === StepStatus.COMPLETED;

        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: isComplete ? '#f8fafc' : '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 0.15s ease',
            }}
          >
            {/* Checkbox & Step Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
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
                        padding: '0.1rem 0.35rem',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
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
              <select
                value={step.status}
                onChange={(e) => handleStatusChange(step.id, e.target.value as StepStatus)}
                style={{
                  backgroundColor: '#ffffff',
                  color: 'var(--text-primary)',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
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
                  padding: '0.2rem',
                  fontSize: '0.9rem',
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
