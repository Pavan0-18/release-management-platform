import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';

export type ToastStatus = 'success' | 'danger' | 'error' | 'warning' | 'info';

export interface ToastItemData {
  id: string;
  status: ToastStatus;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (item: Omit<ToastItemData, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, description?: string, duration?: number) => string;
  error: (message: string, description?: string, duration?: number) => string;
  warning: (message: string, description?: string, duration?: number) => string;
  info: (message: string, description?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* Status configuration matching reference */
const statusConfig: Record<
  ToastStatus,
  { icon: string; color: string; bgColor: string; borderColor: string; gradient: [string, string] }
> = {
  success: {
    icon: '✓',
    color: '#15803d',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    gradient: ['#16a34a', '#86efac'],
  },
  danger: {
    icon: '✕',
    color: '#b91c1c',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    gradient: ['#dc2626', '#fca5a5'],
  },
  error: {
    icon: '✕',
    color: '#b91c1c',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    gradient: ['#dc2626', '#fca5a5'],
  },
  warning: {
    icon: '⚠',
    color: '#b45309',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    gradient: ['#d97706', '#fde68a'],
  },
  info: {
    icon: 'ℹ',
    color: '#733f1c',
    bgColor: '#faf7f2',
    borderColor: '#e5dcd3',
    gradient: ['#733f1c', '#a87955'],
  },
};

const ICON_SIZE = 24;
const CIRCLE_STROKE = 2;

function CircularProgress({
  progress,
  size,
  stroke,
  status,
}: {
  progress: number;
  size: number;
  stroke: number;
  status: ToastStatus;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const gradientId = `toast-gradient-${status}`;
  const [startColor, endColor] = statusConfig[status]?.gradient || ['#733f1c', '#a87955'];

  return (
    <svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        inset: 0,
        transform: 'rotate(-90deg) scaleY(-1)',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 50ms linear',
        }}
      />
    </svg>
  );
}

export function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastItemData;
  onRemove: (id: string) => void;
}) {
  const duration = toast.duration ?? 4500;
  const config = statusConfig[toast.status] || statusConfig.info;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration <= 0) return;

    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      intervalRef.current = null;
      timeoutRef.current = null;
      return;
    }

    const remainingTime = duration - elapsedTimeRef.current;
    if (remainingTime <= 0) {
      onRemove(toast.id);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, remainingTime);

    intervalRef.current = setInterval(() => {
      elapsedTimeRef.current = Date.now() - startTimeRef.current;
      const pct = Math.max(0, ((duration - elapsedTimeRef.current) / duration) * 100);
      setProgress(pct);
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      intervalRef.current = null;
      timeoutRef.current = null;
    };
  }, [isPaused, duration, toast.id, onRemove]);

  const handleMouseEnter = () => {
    elapsedTimeRef.current = Date.now() - startTimeRef.current;
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now() - elapsedTimeRef.current;
    setIsPaused(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${config.borderColor}`,
        boxShadow: '0 10px 25px -5px rgba(74, 45, 20, 0.15), 0 8px 10px -6px rgba(74, 45, 20, 0.1)',
        minWidth: '300px',
        maxWidth: '420px',
        width: '100%',
        animation: 'toast-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        pointerEvents: 'auto',
      }}
    >
      {/* Icon with circular timer ring */}
      <div
        style={{
          position: 'relative',
          width: `${ICON_SIZE}px`,
          height: `${ICON_SIZE}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        {duration > 0 && (
          <CircularProgress
            progress={progress}
            size={ICON_SIZE}
            stroke={CIRCLE_STROKE}
            status={toast.status}
          />
        )}
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: config.color,
            lineHeight: 1,
          }}
        >
          {config.icon}
        </span>
      </div>

      {/* Message content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {toast.message}
        </p>
        {toast.description && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginTop: '0.2rem',
              marginBottom: 0,
              lineHeight: 1.4,
            }}
          >
            {toast.description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0.15rem 0.35rem',
          fontSize: '0.85rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '0.25rem',
        }}
        aria-label="Close"
      >
        ✕
      </button>

      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItemData[];
  onRemove: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return createPortal(
    <div
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body,
  );
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((item: Omit<ToastItemData, 'id'>): string => {
    const id = `toast-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItemData = { ...item, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const success = useCallback(
    (message: string, description?: string, duration?: number) =>
      showToast({ status: 'success', message, description, duration }),
    [showToast],
  );

  const error = useCallback(
    (message: string, description?: string, duration?: number) =>
      showToast({ status: 'error', message, description, duration }),
    [showToast],
  );

  const warning = useCallback(
    (message: string, description?: string, duration?: number) =>
      showToast({ status: 'warning', message, description, duration }),
    [showToast],
  );

  const info = useCallback(
    (message: string, description?: string, duration?: number) =>
      showToast({ status: 'info', message, description, duration }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
