import React from 'react';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  hint,
  htmlFor,
  children,
  style,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', ...style }}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {label}
          {required && <span style={{ color: '#b91c1c' }}>*</span>}
        </label>
      )}

      {children}

      {hint && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</span>
      )}

      {error && (
        <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 500 }}>{error}</span>
      )}
    </div>
  );
};
