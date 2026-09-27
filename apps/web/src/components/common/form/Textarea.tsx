import React, { useState } from 'react';
import styles from './form.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean;
  helper?: string;
  innerLabel?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helper,
      value,
      defaultValue,
      placeholder = ' ',
      onFocus,
      onBlur,
      rows = 3,
      style,
      className = '',
      required,
      id,
      disabled,
      innerLabel = true,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const fieldId =
      id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const hasValue = value !== undefined ? Boolean(value) : Boolean(defaultValue);
    const hasError = Boolean(error);

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
          <div style={{ position: 'relative', width: '100%' }}>
            <textarea
              ref={ref}
              id={fieldId}
              rows={rows}
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
                borderColor: hasError ? '#dc2626' : isFocused ? 'var(--border-focus)' : undefined,
              }}
              {...props}
            />

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

Textarea.displayName = 'Textarea';
