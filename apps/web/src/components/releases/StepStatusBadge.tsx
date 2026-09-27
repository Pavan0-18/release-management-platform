import React from 'react';
import { StepStatus } from '@rmp/shared';

interface Props {
  status: StepStatus | string;
}

export const StepStatusBadge: React.FC<Props> = ({ status }) => {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case StepStatus.PENDING:
        return {
          label: 'Pending',
          bg: 'rgba(107, 114, 128, 0.15)',
          color: '#9ca3af',
          border: '#4b5563',
        };
      case StepStatus.IN_PROGRESS:
        return {
          label: 'In Progress',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '#d97706',
        };
      case StepStatus.COMPLETED:
        return {
          label: 'Completed',
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '#059669',
        };
      case StepStatus.BLOCKED:
        return {
          label: 'Blocked',
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '#dc2626',
        };
      case StepStatus.SKIPPED:
        return {
          label: 'Skipped',
          bg: 'rgba(156, 163, 175, 0.15)',
          color: '#d1d5db',
          border: '#6b7280',
        };
      default:
        return { label: s, bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: '#4b5563' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.7rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
};
