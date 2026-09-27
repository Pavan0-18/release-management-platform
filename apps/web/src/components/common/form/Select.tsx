import React, { useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string | boolean;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      hint,
      value,
      defaultValue,
      children,
      onFocus,
      onBlur,
      style,
      className = '',
      required,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '' ? Boolean(value) : Boolean(defaultValue);
    const hasError = Boolean(error);
    const selectId =
      id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const isFloating = isFocused || hasValue;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          width: '100%',
          ...style,
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: disabled ? '#f5efe6' : '#ffffff',
            border: `1.5px solid ${
              hasError ? '#dc2626' : isFocused ? 'var(--accent-primary)' : 'var(--border-color)'
            }`,
            borderRadius: 'var(--radius-sm)',
            boxShadow: isFocused ? '0 0 0 3px var(--accent-glow)' : 'var(--shadow-sm)',
            transition: 'all 0.15s ease',
            minHeight: label ? '48px' : '38px',
          }}
        >
          {label && (
            <label
              htmlFor={selectId}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: isFloating ? '0.35rem' : '50%',
                transform: isFloating ? 'none' : 'translateY(-50%)',
                fontSize: isFloating ? '0.7rem' : '0.85rem',
                fontWeight: isFloating ? 600 : 400,
                color: hasError
                  ? '#dc2626'
                  : isFocused
                    ? 'var(--accent-primary)'
                    : 'var(--text-muted)',
                pointerEvents: 'none',
                transition: 'all 0.15s ease',
                lineHeight: 1,
                zIndex: 2,
              }}
            >
              {label}
              {required && <span style={{ color: '#dc2626', marginLeft: '0.15rem' }}>*</span>}
            </label>
          )}

          <select
            ref={ref}
            id={selectId}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              if (onFocus) onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (onBlur) onBlur(e);
            }}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              paddingLeft: '0.75rem',
              paddingRight: '2rem',
              paddingTop: label ? '1.15rem' : '0.5rem',
              paddingBottom: label ? '0.35rem' : '0.5rem',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              fontFamily: 'inherit',
            }}
            className={`select-component ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Custom dropdown arrow */}
          <span
            style={{
              position: 'absolute',
              right: '0.75rem',
              pointerEvents: 'none',
              color: isFocused ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '0.65rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ▼
          </span>
        </div>

        {hint && !hasError && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.25rem' }}>
            {hint}
          </span>
        )}

        {typeof error === 'string' && (
          <span
            style={{
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: 500,
              paddingLeft: '0.25rem',
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
