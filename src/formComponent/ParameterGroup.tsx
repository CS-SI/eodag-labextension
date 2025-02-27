import React, { ChangeEvent } from 'react';
import Select, { MultiValue } from 'react-select';
import { Controller } from 'react-hook-form';
import { IFormInput, Parameter } from '../types';
import { Control } from 'react-hook-form';

interface ParameterGroupProps {
  params: Parameter[];
  setParams: (params: Parameter[]) => void;
  setValue: (name: string, value: any) => void;
  control: Control<IFormInput, any>;
  mandatory?: boolean;
}

const ParameterGroup: React.FC<ParameterGroupProps> = ({ params, setParams, setValue, control, mandatory = false
}) => {
  const handleSelectChange = (
    key: string,
    newValue: number | string | { value: string; label: string } | MultiValue<string | { value: string; label: string }>,
    onChange: (...event: any[]) => void | undefined = undefined
  ) => {
    let selectedValue: undefined | number | string | string[];

    if (typeof newValue === 'string' || typeof newValue === 'number') {
      // If it's a literal, use it as it is
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
    const { type, title, default: defaultValue } = value;

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
            placeholder={`Select a ${title}...`}
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
    const { type, title, description, selected } = value;

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
              height: '2rem',
              borderRadius: '.2rem',
              border: '1px solid #ccc',
              padding: '0.25rem 0.5rem',
              boxSizing: 'border-box',
            }}
            placeholder={`Select a ${title}...`}
            title={description || undefined}
            value={selected || ''}
            onChange={e => handleSelectChange(key, e.target.value, onChange)}
          />
        )}
      />
    );
  };

  const renderCloudCoverField = (param: Parameter) => {
    const defaultCloudCover = 100;

    const { key, value, mandatory } = param;
    const { selected = defaultCloudCover } = value;

    setValue(key, selected);

    return (
      <label className="jp-EodagWidget-input-name">
        Max cloud cover {selected}%
        <div className="jp-EodagWidget-slider">
          <Controller
            name={key}
            control={control}
            rules={{ required: mandatory }}
            render={({ field: { onChange, value } }) => (
              <input
                type="range"
                min="0"
                max="100"
                value={value ?? defaultCloudCover}
                aria-label="Max cloud cover"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(event.target.value, 10);
                  onChange(value);
                  handleSelectChange(key, value, onChange);
                }}
              />
            )}
          />
        </div>
      </label>
    )
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
        throw new Error(`Unsupported type: ${value.type}`);
    }
  };

  return (
    <>
      {
        params.filter(param => param.mandatory === mandatory)
          .map(param => (
            <div key={param.key}>
              {param.key === 'cloudCover' ? renderCloudCoverField(param) : (
                <label className="jp-EodagWidget-input-name">
                  {param.value.title}
                  <div style={{ marginTop: 10 }}>{renderField(param)}</div>
                </label>
              )}
            </div>
          ))
      }
    </>
  );
};

export default ParameterGroup;
