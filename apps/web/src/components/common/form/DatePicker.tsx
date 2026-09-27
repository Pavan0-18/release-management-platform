import React, { useState, useRef, useEffect } from 'react';

export interface DatePickerProps {
  label?: string;
  value?: string; // Format: YYYY-MM-DD
  onChange?: (date: string) => void;
  error?: string | boolean;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  style?: React.CSSProperties;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = 'Select date',
  required,
  disabled,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate,
  );

  const selectedDate = value ? new Date(value) : null;
  const isSelectedValid = selectedDate && !isNaN(selectedDate.getTime());

  const hasError = Boolean(error);
  const isFloating = isOpen || Boolean(value);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateString = `${year}-${formattedMonth}-${formattedDay}`;
    if (onChange) {
      onChange(dateString);
    }
    setIsOpen(false);
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const formattedMonth = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(today.getDate()).padStart(2, '0');
    const dateString = `${today.getFullYear()}-${formattedMonth}-${formattedDay}`;
    if (onChange) {
      onChange(dateString);
    }
    setViewDate(today);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange('');
    }
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day: number) => {
    if (!isSelectedValid || !selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const formattedDisplay =
    isSelectedValid && selectedDate
      ? selectedDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        width: '100%',
        ...style,
      }}
    >
      {/* Input trigger container */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        tabIndex={disabled ? -1 : 0}
        onFocus={() => {
          if (!disabled) setIsOpen(true);
        }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: disabled ? '#f5efe6' : '#ffffff',
          border: `1.5px solid ${
            hasError ? '#dc2626' : isOpen ? 'var(--accent-primary)' : 'var(--border-color)'
          }`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: isOpen ? '0 0 0 3px var(--accent-glow)' : 'var(--shadow-sm)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: label ? '48px' : '38px',
          paddingLeft: '0.75rem',
          paddingRight: '2rem',
          paddingTop: label ? '1.15rem' : '0.5rem',
          paddingBottom: label ? '0.35rem' : '0.5rem',
          transition: 'all 0.15s ease',
          userSelect: 'none',
        }}
      >
        {label && (
          <label
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: isFloating ? '0.35rem' : '50%',
              transform: isFloating ? 'none' : 'translateY(-50%)',
              fontSize: isFloating ? '0.7rem' : '0.85rem',
              fontWeight: isFloating ? 600 : 400,
              color: hasError ? '#dc2626' : isOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
              pointerEvents: 'none',
              transition: 'all 0.15s ease',
              lineHeight: 1,
            }}
          >
            {label}
            {required && <span style={{ color: '#dc2626', marginLeft: '0.15rem' }}>*</span>}
          </label>
        )}

        <span
          style={{
            fontSize: '0.875rem',
            color: formattedDisplay ? 'var(--text-primary)' : 'var(--text-muted)',
          }}
        >
          {formattedDisplay || (isOpen ? '' : placeholder)}
        </span>

        {/* Calendar icon */}
        <span
          style={{
            position: 'absolute',
            right: '0.75rem',
            color: isOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',
          }}
        >
          📅
        </span>
      </div>

      {hint && !hasError && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.25rem' }}>
          {hint}
        </span>
      )}

      {typeof error === 'string' && (
        <span
          style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500, paddingLeft: '0.25rem' }}
        >
          {error}
        </span>
      )}

      {/* Calendar popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1100,
            width: '280px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow:
              '0 10px 25px -5px rgba(74, 45, 20, 0.15), 0 8px 10px -6px rgba(74, 45, 20, 0.1)',
            padding: '0.85rem',
          }}
        >
          {/* Header Month / Year & Prev/Next */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '0.2rem 0.5rem',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              &larr;
            </button>

            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {monthNames[month]} {year}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '0.2rem 0.5rem',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              &rarr;
            </button>
          </div>

          {/* Days of week */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              textAlign: 'center',
              marginBottom: '4px',
            }}
          >
            {daysOfWeek.map((day) => (
              <span
                key={day}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  padding: '2px 0',
                }}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
            }}
          >
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '30px' }} />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const selected = isSelected(dayNum);
              const today = isToday(dayNum);

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDay(dayNum);
                  }}
                  style={{
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: selected || today ? 600 : 400,
                    backgroundColor: selected
                      ? 'var(--accent-primary)'
                      : today
                        ? 'var(--accent-light)'
                        : 'transparent',
                    color: selected
                      ? '#ffffff'
                      : today
                        ? 'var(--accent-primary)'
                        : 'var(--text-primary)',
                    border: today && !selected ? '1px solid var(--accent-primary)' : 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) {
                      e.currentTarget.style.backgroundColor = today
                        ? 'var(--accent-light)'
                        : 'transparent';
                    }
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Footer Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.65rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={handleSetToday}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              Today
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '2px 4px',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
