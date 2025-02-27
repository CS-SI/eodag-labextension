import React from 'react';
import Select, { MultiValue } from 'react-select';
import { Controller } from 'react-hook-form';
import { IFormInput, Parameter } from '../types';
import { Control } from 'react-hook-form';

interface ParameterGroupProps {
  params: Parameter[];
  setParams: (params: Parameter[]) => void;
  control: Control<IFormInput, any>;
  mandatory?: boolean;
}

const ParameterGroup: React.FC<ParameterGroupProps> = ({ params, setParams, control, mandatory = false
}) => {
  const handleSelectChange = (
    key: string,
    newValue: string | { value: string; label: string } | MultiValue<string | { value: string; label: string }>,
    onChange: (...event: any[]) => void | undefined = undefined
  ) => {
    let selectedValue: null | string | string[];

    if (typeof newValue === 'string') {
      // If it's a string, use the string as is
      selectedValue = newValue;
    } else if (Array.isArray(newValue)) {
      // If it's an array (multi-select), check the type of each item
      selectedValue = newValue.map(item =>
        typeof item === 'string' ? item : item.value
      );
    } else if (newValue && 'value' in newValue) {
      // If it's a single object (single select), use the 'value' from the object
      selectedValue = newValue.value;
    } else if (newValue === null) {
      selectedValue = undefined;
    } else {
      throw new Error('Invalid value type');
    }

    if (onChange) onChange(selectedValue);

    // Update the parameters with the new selected value
    const updatedParams = params.map(param =>
      param.key === key
        ? { ...param, value: { ...param.value, selected: selectedValue } }
        : param
    );

    setParams(updatedParams);
  };

  const getSelectedValue = (type: string, selectedValue: string | string[] | undefined) => {
    if (type === 'array' && selectedValue !== undefined || Array.isArray(selectedValue)) {
      // If it's an array or the type is 'array', return an array of option objects
      return (Array.isArray(selectedValue) ? selectedValue : [selectedValue]).map(item => ({
        value: item,
        label: item,
      }));
    }

    // For single value (when it's not an array)
    return selectedValue
      ? [{
        value: selectedValue,
        label: selectedValue,
      }]
      : [];
  };

  const renderSelectField = (param: Parameter, enumList: string[]) => {
    const { key, value, mandatory } = param;
    const { type, title, default: defaultValue } = value || {};

    return (
      <Controller
        name={key}
        control={control}
        rules={{ required: mandatory && enumList.length > 0 }}
        render={({ field: { onChange } }) => (
          <Select
            className="jp-EodagWidget-select"
            classNamePrefix="jp-EodagWidget-select"
            aria-label={title}
            placeholder={title}
            defaultValue={getSelectedValue(type, defaultValue)}
            onChange={(selectedOption) => {
              handleSelectChange(key, selectedOption, onChange);
            }}
            isClearable
            isDisabled={enumList.length === 0}
            isMulti={type === 'array'}
            options={enumList.map(item => ({
              value: item,
              label: item.charAt(0).toUpperCase() + item.slice(1),
            }))}
          />
        )}
      />
    );
  };

  const renderInputField = (param: Parameter) => {
    const { key, value } = param;
    const { type, title, description, selected } = value || {};

    return (
      <Controller
        name={key}
        control={control}
        rules={{ required: mandatory }}
        render={({ field: { onChange } }) => (
          <input
            className="jp-EodagWidget-input"
            type={type === 'integer' ? 'number' : 'text'}
            style={{
              width: '100%',
              height: '1.5rem',
              borderRadius: '.2rem',
              border: '1px solid #ccc',
              padding: '0.25rem 0.5rem',
            }}
            placeholder={title}
            title={description || undefined}
            value={selected || ''}
            onChange={e => handleSelectChange(key, e.target.value, onChange)}
          />
        )}
      />
    );
  };

  const renderField = (param: Parameter) => {
    const value = param.value || {};

    const enumList: string[] = value.type === 'array'
      ? value.items?.enum || (value.items?.const ? [value.items?.const] : [])
      : value?.enum || (value?.const ? [value?.const] : []);


    switch (value.type) {
      case 'string':
      case 'integer':
        return enumList.length > 0 ? renderSelectField(param, enumList) : renderInputField(param);
      case 'array':
        return renderSelectField(param, enumList);
      default:
        return null;
    }
  };

  return (
    <>
      {
        params.filter(param => param.mandatory === mandatory)
          .map(param => (
            <div key={param.key}>
              <label className="jp-EodagWidget-input-name">
                {param.value.title}
                <div style={{ marginTop: 10 }}>{renderField(param)}</div>
              </label>
            </div>
          ))
      }
    </>
  );
};

export default ParameterGroup;
