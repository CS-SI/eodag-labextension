import React, { useState } from 'react';

const MultiSelect = ({
  options,
  selectedValues,
  onChange,
  title
}: {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  title: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    const updatedValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(updatedValues);
  };

  return (
    <div
      className="multiselect-container"
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '100%'
      }}
      title={title}
    >
      <div
        className="multiselect-display"
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          cursor: 'pointer',
          background: '#fff'
        }}
        onClick={() => setIsOpen(prev => !prev)}
      >
        {selectedValues.length > 0
          ? selectedValues.join(', ')
          : 'Select options'}
      </div>
      {isOpen && (
        <div
          className="multiselect-dropdown"
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
        >
          {options.map((option, index) => (
            <label
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => toggleOption(option)}
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
