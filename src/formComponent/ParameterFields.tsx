import React from 'react';
import { Parameter } from '../types';
import MultiSelect from './MultiSelect';

const ParameterFields = ({
  params,
  setParams
}: {
  params: Parameter[];
  setParams: (params: Parameter[]) => void;
}) => {
  const handleSelectChange = (key: string, newValue: string | string[]) => {
    const updatedParams = params.map((param: Parameter) =>
      param.key === key
        ? { ...param, value: { ...param.value, selected: newValue } }
        : param
    );
    setParams(updatedParams);
  };

  const renderField = (param: Parameter) => {
    const { key, value } = param;

    value.selected ??= value.default ?? undefined;

    const { type, description, title, selected } = value || {};
    const enumList =
      value?.enum ||
      value?.items?.enum ||
      (typeof value?.items?.const === 'string' ? [value?.items?.const] : []);
    const renderSelectField = () => (
      <select
        className="jp-EodagWidget-select"
        style={{ width: '100%', height: '2rem', borderRadius: '.2rem' }}
        aria-label={title}
        placeholder={title}
        title={description || undefined}
        onChange={e => handleSelectChange(key, e.target.value)}
        value={selected || ''}
      >
        {enumList.map((option: any, index: number) => (
          <option key={`${index}-${option}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    );

    const renderInputField = (type: string) => (
      // type === "string" || type === "integer"

      <input
        className="jp-EodagWidget-input"
        type={type === 'integer' ? 'number' : 'text'}
        style={{
          width: '100%',
          height: '2rem',
          borderRadius: '.2rem',
          border: '1px solid #ccc',
          padding: '0.5rem'
        }}
        placeholder={title}
        title={description || undefined}
        value={selected || ''}
        onChange={e => handleSelectChange(key, e.target.value)}
      />
    );

    const renderMultiSelectField = () => {
      const toArray = (value: string): string[] => {
        if (Array.isArray(value)) {
          return value;
        }
        if (value) {
          return [value];
        }
        return [];
      };

      const selectedValues = toArray(selected);

      return (
        <MultiSelect
          options={enumList}
          title={description || undefined}
          selectedValues={selectedValues}
          onChange={updatedValues => handleSelectChange(key, updatedValues)}
          disabled={enumList.length === 0}
        />
      );
    };

    switch (type) {
      case 'string':
      case 'integer':
        return enumList.length > 0
          ? renderSelectField()
          : renderInputField(type);
      case 'array':
        return renderMultiSelectField();
      default:
        return null;
    }
  };

  const renderParameterGroup = (
    params: any[],
    title: string,
    mandatory: boolean
  ) => (
    <div style={{ marginTop: mandatory ? '0' : '2rem' }}>
      <p>{title}</p>
      <div className="jp-EodagWidget-field">
        {params
          .filter((param: any) => param.mandatory === mandatory)
          .map((param: any) => {
            return (
              <div key={param.key}>
                <label className="jp-EodagWidget-input-name">
                  {param.value.title}
                  <div style={{ marginTop: 10 }}>{renderField(param)}</div>
                </label>
              </div>
            );
          })}
      </div>
    </div>
  );

  return (
    <>
      {renderParameterGroup(params, 'Mandatory Parameters', true)}
      {renderParameterGroup(params, 'Optional Parameters', false)}
    </>
  );
};
export default ParameterFields;
