import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './form.module.css';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  name?: string;
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  error?: string | boolean;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  search?: boolean;
  innerLabel?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  name,
  options,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Select option...',
  error,
  helper,
  required,
  disabled,
  search = false,
  innerLabel = true,
  style,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState<string | number>(
    value !== undefined ? value : defaultValue,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<React.CSSProperties>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fieldId = name || `select-${Math.random().toString(36).substr(2, 9)}`;

  const currentValue = value !== undefined ? value : localValue;

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(currentValue));
  }, [options, currentValue]);

  const filteredOptions = useMemo(() => {
    if (!search || !searchTerm.trim()) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    );
  }, [options, search, searchTerm]);

  // Dropdown portal positioning with collision flip
  useEffect(() => {
    const updatePosition = () => {
      if (!isOpen || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownMaxHeight = 250;
      const dropdownGap = 4;

      const shouldOpenUpward = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;

      let topPos: string | number = 'auto';
      let bottomPos: string | number = 'auto';
      let maxHeight = dropdownMaxHeight;

      if (shouldOpenUpward) {
        maxHeight = Math.min(dropdownMaxHeight, spaceAbove - dropdownGap);
        bottomPos = `${viewportHeight - rect.top + dropdownGap}px`;
      } else {
        maxHeight = Math.min(dropdownMaxHeight, spaceBelow - dropdownGap);
        topPos = `${rect.bottom + dropdownGap}px`;
      }

      setDropdownPosition({
        position: 'fixed',
        top: topPos,
        bottom: bottomPos,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: `${Math.max(100, maxHeight)}px`,
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
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (opt: SelectOption, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (opt.disabled) return;

    if (value === undefined) {
      setLocalValue(opt.value);
    }
    onChange?.(opt.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) setSearchTerm('');
    }
  };

  const hasValue = Boolean(selectedOption) && String(currentValue).trim() !== '';
  const hasError = Boolean(error);
  const displayLabel = selectedOption?.label || '';

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
        ref={wrapperRef}
      >
        <div
          className={`${styles.customSelectDisplay} ${isOpen ? styles.open : ''}`}
          onClick={handleToggle}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle(e as any);
            }
          }}
          data-has-value={hasValue || isOpen ? 'true' : 'false'}
          style={{
            borderColor: hasError ? '#dc2626' : isOpen ? 'var(--border-focus)' : undefined,
            backgroundColor: disabled ? '#f7f3ee' : '#ffffff',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <span
            className={styles.customSelectDisplayText}
            style={{
              color: displayLabel ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {displayLabel || (isOpen || !innerLabel ? placeholder : '')}
          </span>

          <span className={`${styles.customSelectArrow} ${isOpen ? styles.open : ''}`}>▼</span>

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

        {/* Portal Dropdown Menu */}
        {isOpen &&
          !disabled &&
          createPortal(
            <div ref={dropdownRef} className={styles.customSelectDropdown} style={dropdownPosition}>
              {search && (
                <div
                  className={styles.customSelectSearchContainer}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    className={styles.customSelectSearchInput}
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(currentValue);
                  return (
                    <div
                      key={String(opt.value)}
                      className={`${styles.customSelectOption} ${isSelected ? styles.selected : ''}`}
                      onClick={(e) => handleSelect(opt, e)}
                      style={{
                        opacity: opt.disabled ? 0.4 : 1,
                        cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <span
                          style={{
                            color: 'var(--accent-primary)',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={styles.customSelectNoOptions}>No options found</div>
              )}
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
