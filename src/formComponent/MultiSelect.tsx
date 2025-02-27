import React, { useState, useRef, useCallback } from 'react';

const MultiSelect = ({
  options,
  selectedValues,
  onChange,
  title,
  disabled = false
}: {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  title: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownBeingToggled, setIsDropdownBeingToggled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    setIsDropdownBeingToggled(true);
    setIsOpen(prev => !prev);

    setTimeout(() => {
      setIsDropdownBeingToggled(false);
    }, 10);
  }, [disabled]);

  const toggleOption = useCallback((option: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (isDropdownBeingToggled) return;

    const updatedValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(updatedValues);
  }, [isDropdownBeingToggled, selectedValues, onChange]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      className="multiselect-container"
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto'
      }}
      title={title}
    >
      <div
        className="multiselect-display"
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: '#fff',
          color: disabled ? '#aaa' : '#000'
        }}
        onClick={toggleDropdown}
      >
        {selectedValues.length > 0
          ? selectedValues.join(', ')
          : 'Select options'}
      </div>

      {isOpen && !disabled && (
        <div
          className="multiselect-dropdown"
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: '#fff',
            zIndex: 10,
            height: '200px',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((option, index) => (
            <label
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={(e) => toggleOption(option, e)}
                disabled={disabled}
                style={{ marginRight: '8px' }}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
