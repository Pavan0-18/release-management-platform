import React from 'react';
import { ReleaseStatus } from '@rmp/shared';

interface Props {
  status: ReleaseStatus | string;
}

export const ReleaseStatusBadge: React.FC<Props> = ({ status }) => {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case ReleaseStatus.DRAFT:
        return {
          label: 'Draft',
          bg: 'rgba(107, 114, 128, 0.15)',
          color: '#9ca3af',
          border: '#4b5563',
        };
      case ReleaseStatus.PLANNED:
        return {
          label: 'Planned',
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          border: '#2563eb',
        };
      case ReleaseStatus.IN_PROGRESS:
        return {
          label: 'In Progress',
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '#d97706',
        };
      case ReleaseStatus.READY_FOR_DEPLOYMENT:
        return {
          label: 'Ready for Deploy',
          bg: 'rgba(139, 92, 246, 0.15)',
          color: '#c084fc',
          border: '#9333ea',
        };
      case ReleaseStatus.DEPLOYED:
        return {
          label: 'Deployed',
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '#059669',
        };
      case ReleaseStatus.FAILED:
        return {
          label: 'Failed',
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '#dc2626',
        };
      case ReleaseStatus.CANCELLED:
        return {
          label: 'Cancelled',
          bg: 'rgba(107, 114, 128, 0.15)',
          color: '#9ca3af',
          border: '#4b5563',
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
        padding: '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.02em',
      }}
    >
      {config.label}
    </span>
  );
};
