import React, { ChangeEvent } from 'react';
import Select, { MultiValue } from 'react-select';
import { Controller, UseFormReturn } from 'react-hook-form';
import { IFormInput, IParameter } from '../../types';

interface IParameterGroupProps {
  form: UseFormReturn<IFormInput, any, IFormInput>;
  params: IParameter[];
  setParams: (params: IParameter[]) => void;
  mandatory?: boolean;
  selectedOptions?: string[];
}

export const ParameterGroup: React.FC<IParameterGroupProps> = ({
  form,
  params,
  setParams,
  mandatory = false,
  selectedOptions = []
}) => {
  const errors = form.formState.errors;

  const handleSelectChange = (
    key: string,
    newValue:
      | number
      | string
      | { value: string; label: string }
      | MultiValue<string | { value: string; label: string }>
      | null,
    onChange: ((...event: any[]) => void) | undefined = undefined
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
      throw new Error('Invalid value type ' + typeof newValue);
    }

    if (onChange) {
      onChange(selectedValue);
    }

    // Set selectedValue in params
    const updatedParams = params.map(param =>
      param.key === key
        ? { ...param, value: { ...param.value, selected: selectedValue } }
        : param
    );

    setParams(updatedParams);
  };

  const getSelectedValue = (
    type: string,
    selectedValue: string | string[] | undefined
  ) => {
    if (
      (type === 'array' && selectedValue !== undefined) ||
      Array.isArray(selectedValue)
    ) {
      // If it's an array or the type is 'array', return an array of option objects
      return (
        Array.isArray(selectedValue) ? selectedValue : [selectedValue]
      ).map(item => ({
        value: item,
        label: item
      }));
    }

    // For a single value (when it's not an array)
    return selectedValue
      ? [
          {
            value: selectedValue,
            label: selectedValue
          }
        ]
      : [];
  };

  const renderSelectField = (param: IParameter, enumList: string[]) => {
    const { key, value, mandatory } = param;
    const { type, title, default: defaultValue } = value;

    const lowercaseTitle = title.charAt(0).toLowerCase() + title.slice(1);

    return (
      <Controller
        name={key}
        control={form.control}
        rules={{ required: mandatory && enumList.length > 0 }}
        render={({ field: { onChange } }) => (
          <Select
            className={`jp-EodagWidget-select ${
              errors[key] ? 'jp-EodagWidget-input-error' : ''
            }`}
            classNamePrefix="jp-EodagWidget-select"
            aria-label={title}
            placeholder={`Select a ${lowercaseTitle}...`}
            value={getSelectedValue(type, defaultValue)}
            onChange={selectedOption => {
              handleSelectChange(key, selectedOption, onChange);
            }}
            isClearable
            isDisabled={enumList.length === 0}
            isMulti={type === 'array'}
            options={enumList.map(item => ({
              value: item,
              label: item.charAt(0).toUpperCase() + item.slice(1)
            }))}
          />
        )}
      />
    );
  };

  const renderInputField = (param: IParameter) => {
    const { key, value } = param;
    const { type, title, description, selected } = value;

    return (
      <Controller
        name={key}
        control={form.control}
        rules={{ required: mandatory }}
        render={({ field: { onChange } }) => (
          <input
            className={`jp-EodagWidget-input ${
              errors[key] ? 'jp-EodagWidget-input-error' : ''
            }`}
            type={type === 'integer' ? 'number' : 'text'}
            style={{
              width: '100%',
              height: '2rem',
              borderRadius: '.2rem',
              border: '1px solid #ccc',
              padding: '0.25rem 0.5rem',
              boxSizing: 'border-box'
            }}
            placeholder={`${title}...`}
            title={description || undefined}
            value={selected || ''}
            onChange={e => handleSelectChange(key, e.target.value, onChange)}
          />
        )}
      />
    );
  };

  const renderCloudCoverField = (param: IParameter) => {
    const defaultCloudCover = 100;

    const { key, value, mandatory } = param;
    const { selected = defaultCloudCover } = value;

    return (
      <label className="jp-EodagWidget-input-name">
        Max cloud cover {selected}%
        <div className="jp-EodagWidget-slider">
          <Controller
            name={key}
            control={form.control}
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
    );
  };

  const renderField = (param: IParameter) => {
    const value = param.value || {};

    const enumList: string[] =
      value.type === 'array'
        ? value.items?.enum || (value.items?.const ? [value.items?.const] : [])
        : value?.enum || (value?.const ? [value?.const] : []);

    switch (value.type) {
      case 'string':
      case 'integer':
        return enumList.length > 0
          ? renderSelectField(param, enumList)
          : renderInputField(param);
      case 'array':
        return renderSelectField(param, enumList);
      default:
        console.error(`Unsupported type: ${value.type}`);
        return (
          <p style={{ color: 'red' }}>
            This parameter is not working. Unsupported type: {value.type}
          </p>
        );
    }
  };

  return (
    <>
      {params
        .filter(param => {
          if (mandatory) {
            return param.mandatory;
          } else {
            return selectedOptions.includes(param.key);
          }
        })
        .map(param => (
          <div key={param.key}>
            {param.key === 'cloudCover' ? (
              renderCloudCoverField(param)
            ) : (
              <label className="jp-EodagWidget-input-name">
                {param.value.title}
                {param.mandatory && (
                  <span
                    style={{ color: 'red', marginLeft: 4, fontWeight: 'bold' }}
                  >
                    {' '}
                    *
                  </span>
                )}
                <div style={{ marginTop: 10 }}>{renderField(param)}</div>
              </label>
            )}
          </div>
        ))}
    </>
  );
};
