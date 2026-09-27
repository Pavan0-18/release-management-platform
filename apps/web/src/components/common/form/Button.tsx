import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
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
        };
      case 'secondary':
        return {
          backgroundColor: '#ffffff',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        };
      case 'danger':
        return {
          backgroundColor: '#ffffff',
          color: '#b91c1c',
          border: '1px solid #fecaca',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--accent-primary)',
          border: '1px solid var(--accent-primary)',
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
        return { padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '4px' };
      case 'lg':
        return { padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '8px' };
      case 'md':
      default:
        return { padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '6px' };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.65 : 1,
    transition: 'all 0.15s ease',
    textDecoration: 'none',
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
      {!loading && icon && <span>{icon}</span>}
      {children}
      <style>{`
        @keyframes btn-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
