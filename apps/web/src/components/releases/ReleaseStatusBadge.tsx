import React from 'react';
import { ReleaseStatus } from '@rmp/shared';

interface Props {
  status: ReleaseStatus | string;
}

export const ReleaseStatusBadge: React.FC<Props> = ({ status }) => {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case ReleaseStatus.DRAFT:
        return { label: 'Draft', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
      case ReleaseStatus.PLANNED:
        return { label: 'Planned', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case ReleaseStatus.IN_PROGRESS:
        return { label: 'In Progress', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case ReleaseStatus.READY_FOR_DEPLOYMENT:
        return { label: 'Ready for Deploy', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
      case ReleaseStatus.DEPLOYED:
        return { label: 'Deployed', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case ReleaseStatus.FAILED:
        return { label: 'Failed', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case ReleaseStatus.CANCELLED:
        return { label: 'Cancelled', bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
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
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
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
