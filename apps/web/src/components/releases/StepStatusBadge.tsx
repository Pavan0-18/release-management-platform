import React from 'react';
import { StepStatus } from '@rmp/shared';

interface Props {
  status: StepStatus | string;
}

export const StepStatusBadge: React.FC<Props> = ({ status }) => {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case StepStatus.PENDING:
        return { label: 'Pending', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
      case StepStatus.IN_PROGRESS:
        return { label: 'In Progress', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case StepStatus.COMPLETED:
        return { label: 'Completed', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case StepStatus.BLOCKED:
        return { label: 'Blocked', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case StepStatus.SKIPPED:
        return { label: 'Skipped', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
      default:
        return { label: s, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.15rem 0.5rem',
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
