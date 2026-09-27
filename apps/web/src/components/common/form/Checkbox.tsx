import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, id, style, className = '', ...props }, ref) => {
    const inputId =
      id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', ...style }}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          style={{
            width: '16px',
            height: '16px',
            marginTop: '0.15rem',
            accentColor: 'var(--accent-primary)',
            cursor: 'pointer',
          }}
          className={`checkbox-component ${className}`}
          {...props}
        />
        {(label || description) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {label && (
              <label
                htmlFor={inputId}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {label}
              </label>
            )}
            {description && (
              <span
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
