import React, { useEffect, useRef, useState } from 'react';
import { IOptionType } from '../types';
import { CarbonAddFilled } from '../icones';

// Props for DropdownButton component
interface IDropdownButtonProps {
  options: IOptionType[];
  onSelect: (option: IOptionType) => void;
  selectedOptions: string[];
  buttonLabel?: string;
  disabled?: boolean;
}

const DropdownButton: React.FC<IDropdownButtonProps> = ({
  options,
  onSelect,
  selectedOptions,
  buttonLabel = 'More parameters',
  disabled = false
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Button */}
      <button
        className="jp-EodagWidget-optional-button"
        onClick={event => {
          event.preventDefault(); // Prevent form submission
          setShowDropdown(prev => !prev);
        }}
        disabled={disabled}
      >
        {buttonLabel}
        <CarbonAddFilled height="15" width="15" style={{ marginLeft: '5px' }} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            marginTop: '5px',
            minWidth: '150px',
            maxWidth: '300px'
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: '5px 0' }}>
            {options.map(option => (
              <li
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px 10px'
                }}
                onClick={() => onSelect(option)}
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.value)}
                  style={{ marginRight: '10px' }}
                />
                <span>{option.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
