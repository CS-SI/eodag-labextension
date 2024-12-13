import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

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
  const multiSelectStyleDisplay: CSSProperties = {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: '#fff',
    color: disabled ? '#aaa' : '#000'
  };

  const multiSelectDropdownDisplay: CSSProperties = {
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
  };

  const dropdownStyleDisplay: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer'
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownBeingToggled, setIsDropdownBeingToggled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      setIsDropdownBeingToggled(true);
      setIsOpen(prev => !prev);

      setTimeout(() => {
        setIsDropdownBeingToggled(false);
      }, 10);
    },
    [disabled]
  );

  const toggleOption = useCallback(
    (option: string, e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (isDropdownBeingToggled) return;

      const updatedValues = selectedValues.includes(option)
        ? selectedValues.filter(v => v !== option)
        : [...selectedValues, option];
      onChange(updatedValues);
    },
    [isDropdownBeingToggled, selectedValues, onChange]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
        style={multiSelectStyleDisplay}
        onClick={toggleDropdown}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        {selectedValues.length > 0
          ? selectedValues.join(', ')
          : 'Select options'}
      </div>

      {isOpen && !disabled && (
        <div
          className="multiselect-dropdown"
          ref={dropdownRef}
          style={multiSelectDropdownDisplay}
          onClick={e => e.stopPropagation()}
          role="listbox"
          aria-labelledby="multiselect-label"
        >
          {options.map((option, index) => (
            <label key={`${index}-${option}`} style={dropdownStyleDisplay}>
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={e => toggleOption(option, e)}
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
