import React, { useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 150,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) return children;

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case 'bottom':
        return {
          top: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: '50%',
          right: 'calc(100% + 6px)',
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          top: '50%',
          left: 'calc(100% + 6px)',
          transform: 'translateY(-50%)',
        };
      case 'top':
      default:
        return {
          bottom: 'calc(100% + 6px)',
          left: '50%',
          transform: 'translateX(-50%)',
        };
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      className={`tooltip-container ${className}`}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 99999,
            padding: '0.35rem 0.6rem',
            backgroundColor: '#2b231d',
            color: '#faf7f2',
            fontSize: '0.72rem',
            fontWeight: 500,
            lineHeight: 1.25,
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(43, 35, 29, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'tooltipFadeIn 0.15s ease-out',
            ...getPositionStyles(),
          }}
        >
          {content}
        </div>
      )}

      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) \${
              position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)'
            };
          }
          to {
            opacity: 1;
            transform: scale(1) \${
              position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)'
            };
          }
        }
      `}</style>
    </div>
  );
};
