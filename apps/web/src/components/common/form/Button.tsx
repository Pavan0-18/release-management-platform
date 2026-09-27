import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'light';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  disabled,
  style,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--accent-primary)',
          color: '#ffffff',
          border: '1px solid var(--accent-primary)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'secondary':
      case 'light':
        return {
          backgroundColor: '#ffffff',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'danger':
        return {
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: '1px solid #dc2626',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--accent-primary)',
          border: '1.5px solid var(--accent-primary)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' };
      case 'lg':
        return { padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' };
      case 'md':
      default:
        return {
          padding: '0.55rem 1.15rem',
          fontSize: '0.875rem',
          borderRadius: 'var(--radius-sm)',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    userSelect: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button
      disabled={disabled || loading}
      style={baseStyles}
      className={`btn-component ${className}`}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'btn-spin 0.6s linear infinite',
          }}
        />
      )}
      {!loading && startIcon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>{startIcon}</span>
      )}
      {children}
      {!loading && endIcon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>{endIcon}</span>
      )}
      <style>{`
        @keyframes btn-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .btn-component:not(:disabled):active {
          transform: scale(0.98);
        }
      `}</style>
    </button>
  );
};
