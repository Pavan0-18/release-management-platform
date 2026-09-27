import React, { useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      value,
      defaultValue,
      placeholder,
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
    const hasValue = value !== undefined ? Boolean(value) : Boolean(defaultValue);
    const hasError = Boolean(error);
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const isFloating = isFocused || hasValue || Boolean(placeholder) || props.type === 'date';

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
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: isFocused ? 'var(--accent-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}

          {label && (
            <label
              htmlFor={inputId}
              style={{
                position: 'absolute',
                left: leftIcon ? '2.25rem' : '0.75rem',
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
              }}
            >
              {label}
              {required && <span style={{ color: '#dc2626', marginLeft: '0.15rem' }}>*</span>}
            </label>
          )}

          <input
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            placeholder={isFocused || !label ? placeholder : ''}
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
              paddingLeft: leftIcon ? '2.25rem' : '0.75rem',
              paddingRight: rightIcon ? '2.25rem' : '0.75rem',
              paddingTop: label ? '1.15rem' : '0.5rem',
              paddingBottom: label ? '0.35rem' : '0.5rem',
              fontFamily: 'inherit',
            }}
            className={`input-component ${className}`}
            {...props}
          />

          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '0.75rem',
                color: isFocused ? 'var(--accent-primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightIcon}
            </span>
          )}
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

Input.displayName = 'Input';
