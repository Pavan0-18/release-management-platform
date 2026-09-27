import React, { useState } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      value,
      defaultValue,
      placeholder,
      onFocus,
      onBlur,
      rows = 3,
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
    const textareaId =
      id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const isFloating = isFocused || hasValue || Boolean(placeholder);

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
            flexDirection: 'column',
            backgroundColor: disabled ? '#f5efe6' : '#ffffff',
            border: `1.5px solid ${
              hasError ? '#dc2626' : isFocused ? 'var(--accent-primary)' : 'var(--border-color)'
            }`,
            borderRadius: 'var(--radius-sm)',
            boxShadow: isFocused ? '0 0 0 3px var(--accent-glow)' : 'var(--shadow-sm)',
            transition: 'all 0.15s ease',
          }}
        >
          {label && (
            <label
              htmlFor={textareaId}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: isFloating ? '0.35rem' : '0.75rem',
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

          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
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
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
              paddingTop: label ? '1.25rem' : '0.5rem',
              paddingBottom: '0.5rem',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            className={`textarea-component ${className}`}
            {...props}
          />
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

Textarea.displayName = 'Textarea';
