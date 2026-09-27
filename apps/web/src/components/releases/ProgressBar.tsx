import React from 'react';

interface Props {
  percentage: number;
  showText?: boolean;
}

export const ProgressBar: React.FC<Props> = ({ percentage, showText = true }) => {
  const clamped = Math.min(Math.max(percentage, 0), 100);

  const getColor = (p: number) => {
    if (p === 100) return '#059669';
    if (p > 50) return '#2563eb';
    if (p > 0) return '#d97706';
    return '#94a3b8';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
      <div
        style={{
          flex: 1,
          height: '6px',
          backgroundColor: '#e2e8f0',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            backgroundColor: getColor(clamped),
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {showText && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            minWidth: '36px',
          }}
        >
          {clamped.toFixed(0)}%
        </span>
      )}
    </div>
  );
};
