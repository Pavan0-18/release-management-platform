import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './form.module.css';
import { MiniCalendar, toISO, parseISODate } from './MiniCalendar';

export interface DatePickerProps {
  label?: string;
  name?: string;
  value?: string; // Format: YYYY-MM-DD
  onChange?: (date: string) => void;
  error?: string | boolean;
  helper?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  innerLabel?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  helper,
  placeholder = 'DD/MM/YYYY',
  required,
  disabled,
  minDate,
  maxDate,
  innerLabel = true,
  style,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<React.CSSProperties>({});
  const fieldId = name || `datepicker-${Math.random().toString(36).substr(2, 9)}`;

  // Convert ISO string YYYY-MM-DD -> display string DD/MM/YYYY
  const formatToDisplay = useCallback((val: string | undefined): string => {
    if (!val) return '';
    const dateOnly = val.includes('T') ? val.slice(0, 10) : val;
    const parts = dateOnly.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  }, []);

  const [displayText, setDisplayText] = useState(() => formatToDisplay(value));

  useEffect(() => {
    setDisplayText(formatToDisplay(value));
  }, [value, formatToDisplay]);

  // Positioning logic for Portal dropdown (auto flip if not enough room below)
  useEffect(() => {
    const updatePosition = () => {
      if (!isOpen || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 310;
      const dropdownGap = 6;

      const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      let topPos: string | number = 'auto';
      let bottomPos: string | number = 'auto';

      if (shouldOpenUpward) {
        bottomPos = `${viewportHeight - rect.top + dropdownGap}px`;
      } else {
        topPos = `${rect.bottom + dropdownGap}px`;
      }

      const leftPos = Math.max(8, Math.min(rect.left, window.innerWidth - 300));

      setDropdownPosition({
        position: 'fixed',
        top: topPos,
        bottom: bottomPos,
        left: `${leftPos}px`,
        width: '290px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 10px 25px -5px rgba(74, 45, 20, 0.15), 0 8px 10px -6px rgba(74, 45, 20, 0.1)',
        zIndex: 99999,
      });
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle typing formatted date DD/MM/YYYY
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '').substring(0, 8);
    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setDisplayText(formatted);

    if (formatted.length === 10) {
      const [d, m, y] = formatted.split('/');
      const iso = `${y}-${m}-${d}`;
      const parsed = parseISODate(iso);
      if (!isNaN(parsed.getTime())) {
        onChange?.(iso);
      }
    } else if (formatted.length === 0) {
      onChange?.('');
    }
  };

  const handleSelectDate = (isoDate: string) => {
    onChange?.(isoDate);
    setDisplayText(formatToDisplay(isoDate));
    setIsOpen(false);
  };

  const hasValue = Boolean(displayText);
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
        ref={containerRef}
        className={innerLabel ? styles.inputGroup : ''}
        style={{ position: 'relative', width: '100%' }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            id={fieldId}
            name={name}
            type="text"
            data-has-value={hasValue || isOpen ? 'true' : 'false'}
            value={displayText}
            onChange={handleTextChange}
            onFocus={() => {
              if (!disabled) setIsOpen(true);
            }}
            placeholder={isOpen || hasValue ? placeholder : ' '}
            maxLength={10}
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            required={required}
            style={{
              paddingRight: '2.5rem',
              borderColor: hasError ? '#dc2626' : isOpen ? 'var(--border-focus)' : undefined,
            }}
          />

          {/* Calendar trigger icon */}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              if (!disabled) setIsOpen((prev) => !prev);
            }}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: isOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              padding: '0.2rem',
            }}
            title="Open calendar"
          >
            📅
          </button>

          {innerLabel && label && (
            <label
              htmlFor={fieldId}
              className={`${styles.innerlabel} innerlabel`}
              data-has-value={hasValue || isOpen ? 'true' : 'false'}
            >
              {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
            </label>
          )}
        </div>

        {/* Portal Calendar Popover */}
        {isOpen &&
          !disabled &&
          createPortal(
            <div ref={dropdownRef} style={dropdownPosition}>
              <MiniCalendar
                value={value}
                onSelect={handleSelectDate}
                minDate={minDate}
                maxDate={maxDate}
              />
            </div>,
            document.body,
          )}
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
};
