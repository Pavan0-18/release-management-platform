import React, { useState, useMemo, useEffect } from 'react';

export interface MiniCalendarProps {
  value?: string; // ISO date string YYYY-MM-DD
  onSelect?: (isoDate: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const FULL_MONTH_NAMES = [
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

export const toISO = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseISODate = (isoString: string): Date => {
  const datePart = isoString.includes('T') ? isoString.slice(0, 10) : isoString;
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  value,
  onSelect,
  minDate,
  maxDate,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (value) {
      const parsed = parseISODate(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  const [viewMode, setViewMode] = useState<'days' | 'years' | 'months'>('days');

  // Base starting year for 12-year grid
  const [yearRangeStart, setYearRangeStart] = useState(() => {
    const currentY = (value ? parseISODate(value) : new Date()).getFullYear();
    return currentY - 5;
  });

  useEffect(() => {
    if (value) {
      const parsed = parseISODate(value);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
      }
    }
  }, [value]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const selectedDate = value ? parseISODate(value) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedMinDate = minDate ? parseISODate(minDate) : undefined;
  const parsedMaxDate = maxDate ? parseISODate(maxDate) : undefined;

  // 12-year array starting from yearRangeStart
  const yearsList = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => yearRangeStart + i);
  }, [yearRangeStart]);

  // Days calculation
  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    // Sunday-first: firstOfMonth.getDay()
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: {
      date: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }[] = [];

    // Empty offset days
    for (let i = 0; i < startOffset; i++) {
      days.push({
        date: `prev-${i}`,
        dayNumber: 0,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true,
      });
    }

    // Month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      d.setHours(0, 0, 0, 0);

      const iso = toISO(d);
      const isDayToday = d.getTime() === today.getTime();
      const isDaySelected = selectedDate ? d.getTime() === selectedDate.getTime() : false;

      const isDisabled =
        Boolean(parsedMinDate && d.getTime() < parsedMinDate.getTime()) ||
        Boolean(parsedMaxDate && d.getTime() > parsedMaxDate.getTime());

      days.push({
        date: iso,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: isDayToday,
        isSelected: isDaySelected,
        isDisabled,
      });
    }

    return days;
  }, [year, month, selectedDate, today, parsedMinDate, parsedMaxDate]);

  const handlePrevHeader = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'days') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'years') {
      setYearRangeStart((prev) => prev - 12);
    } else if (viewMode === 'months') {
      setViewMode('years');
    }
  };

  const handleNextHeader = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'days') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'years') {
      setYearRangeStart((prev) => prev + 12);
    }
  };

  return (
    <div
      className={`mini-calendar-container ${className}`}
      style={{
        width: '280px',
        padding: '0.5rem',
        userSelect: 'none',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.25rem 0.35rem 0.65rem 0.35rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={handlePrevHeader}
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.2rem 0.45rem',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          &larr;
        </button>

        {viewMode === 'days' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setYearRangeStart(year - 5);
              setViewMode('years');
            }}
            style={{
              background: 'var(--accent-light)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>
              {FULL_MONTH_NAMES[month]} {year}
            </span>
            <span style={{ fontSize: '0.65rem' }}>▼</span>
          </button>
        )}

        {viewMode === 'years' && (
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {yearRangeStart} – {yearRangeStart + 11}
          </span>
        )}

        {viewMode === 'months' && (
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {year}
          </span>
        )}

        {viewMode !== 'months' ? (
          <button
            type="button"
            onClick={handleNextHeader}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.2rem 0.45rem',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            &rarr;
          </button>
        ) : (
          <div style={{ width: '24px' }} />
        )}
      </div>

      {/* 1. DAYS VIEW */}
      {viewMode === 'days' && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginBottom: '0.35rem',
            }}
          >
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
            }}
          >
            {calendarDays.map((day, idx) => {
              if (!day.isCurrentMonth) {
                return <div key={`empty-${idx}`} style={{ height: '30px' }} />;
              }

              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={day.isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!day.isDisabled && onSelect) {
                      onSelect(day.date);
                    }
                  }}
                  style={{
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: day.isSelected || day.isToday ? 600 : 400,
                    backgroundColor: day.isSelected
                      ? 'var(--accent-primary)'
                      : day.isToday
                        ? 'var(--accent-light)'
                        : 'transparent',
                    color: day.isSelected
                      ? '#ffffff'
                      : day.isToday
                        ? 'var(--accent-primary)'
                        : 'var(--text-primary)',
                    border:
                      day.isToday && !day.isSelected ? '1px solid var(--accent-primary)' : 'none',
                    borderRadius: '4px',
                    cursor: day.isDisabled ? 'not-allowed' : 'pointer',
                    opacity: day.isDisabled ? 0.3 : 1,
                    transition: 'all 0.1s ease',
                  }}
                >
                  {day.dayNumber}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 2. YEARS VIEW */}
      {viewMode === 'years' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.4rem',
            padding: '0.25rem 0',
          }}
        >
          {yearsList.map((y) => {
            const isSelectedYear = y === year;
            return (
              <button
                key={y}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentDate(new Date(y, month, 1));
                  setViewMode('months');
                }}
                style={{
                  padding: '0.5rem 0.25rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isSelectedYear ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: isSelectedYear ? 'none' : '1px solid var(--border-color)',
                  backgroundColor: isSelectedYear ? 'var(--accent-primary)' : '#ffffff',
                  color: isSelectedYear ? '#ffffff' : 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. MONTHS VIEW */}
      {viewMode === 'months' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.4rem',
            padding: '0.25rem 0',
          }}
        >
          {MONTH_NAMES.map((m, idx) => {
            const isSelectedMonth = idx === month;
            return (
              <button
                key={m}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentDate(new Date(year, idx, 1));
                  setViewMode('days');
                }}
                style={{
                  padding: '0.5rem 0.25rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isSelectedMonth ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'center',
                  border: isSelectedMonth ? 'none' : '1px solid var(--border-color)',
                  backgroundColor: isSelectedMonth ? 'var(--accent-primary)' : '#ffffff',
                  color: isSelectedMonth ? '#ffffff' : 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer shortcut buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          paddingTop: '0.4rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const now = new Date();
            if (onSelect) onSelect(toISO(now));
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Today
        </button>

        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) onSelect('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
