import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = '520px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(43, 35, 29, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          maxWidth,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: '#ffffff',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </h3>
            {description && (
              <p
                style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}
              >
                {description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.1rem',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.6rem',
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
