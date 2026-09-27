import React, { useState } from 'react';
import styles from './form.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  innerLabel?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      value,
      defaultValue,
      placeholder = ' ',
      onFocus,
      onBlur,
      style,
      className = '',
      required,
      id,
      disabled,
      type = 'text',
      innerLabel = true,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const fieldId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const hasValue = value !== undefined ? Boolean(value) : Boolean(defaultValue);
    const hasError = Boolean(error);
    const isPassword = type === 'password';
    const effectiveType = isPassword && showPassword ? 'text' : type;

    return (
      <div style={{ width: '100%', ...style }} className={className}>
        {!innerLabel && label && (
          <label
            htmlFor={fieldId}
            style={{
              display: 'block',
              marginBottom: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
          </label>
        )}

        <div
          className={innerLabel ? styles.inputGroup : ''}
          style={{ position: 'relative', width: '100%' }}
        >
          <div
            style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}
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
                  zIndex: 2,
                }}
              >
                {leftIcon}
              </span>
            )}

            <input
              ref={ref}
              id={fieldId}
              type={effectiveType}
              value={value}
              defaultValue={defaultValue}
              placeholder={
                isFocused || hasValue || !innerLabel
                  ? placeholder === ' '
                    ? ''
                    : placeholder
                  : ' '
              }
              disabled={disabled}
              required={required}
              data-has-value={hasValue || isFocused ? 'true' : 'false'}
              onFocus={(e) => {
                setIsFocused(true);
                if (onFocus) onFocus(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                if (onBlur) onBlur(e);
              }}
              style={{
                paddingLeft: leftIcon ? '2.25rem' : '0.85rem',
                paddingRight: rightIcon || isPassword ? '2.5rem' : '0.85rem',
                borderColor: hasError ? '#dc2626' : isFocused ? 'var(--border-focus)' : undefined,
              }}
              {...props}
            />

            {isPassword && !disabled && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            )}

            {rightIcon && !isPassword && (
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

            {innerLabel && label && (
              <label
                htmlFor={fieldId}
                className={`${styles.innerlabel} innerlabel`}
                data-has-value={hasValue || isFocused ? 'true' : 'false'}
              >
                {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
              </label>
            )}
          </div>
        </div>

        {helper && !hasError && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
              paddingLeft: '0.25rem',
            }}
          >
            {helper}
          </p>
        )}

        {typeof error === 'string' && (
          <p
            style={{
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: 500,
              marginTop: '0.25rem',
              paddingLeft: '0.25rem',
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
