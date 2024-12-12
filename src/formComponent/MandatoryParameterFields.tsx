import React from 'react';
import MultiSelect from './MultiSelect';

const MandatoryParameterFields = ({
  params,
  setParams
}: {
  params: any;
  setParams: (params: any) => void;
}) => {
  const handleSelectChange = (key: string, newValue: string | string[]) => {
    const updatedParams = params.map((param: any) =>
      param.key === key
        ? { ...param, value: { ...param.value, selected: newValue } }
        : param
    );
    setParams(updatedParams);
  };

  const renderField = (param: any) => {
    const { key, value } = param;
    const { type, description, title, selected } = value || {};
    const enumList = value?.enum || value?.items?.enum || [];

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
          <option key={index} value={option}>
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

    const renderMultiSelectField = () => (
      <MultiSelect
        options={enumList}
        title={description || undefined}
        selectedValues={selected || []}
        onChange={updatedValues => handleSelectChange(key, updatedValues)}
      />
    );

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
            console.log('Rendering param:', param);
            const { key, value } = param;
            const { type } = param.value;
            const listEnum = value.enum;
            listEnum ? console.log(listEnum) : console.warn('no ENUM');
            if (!value || !type) {
              console.warn(`Paramètre invalide pour ${key}:`, param);
              console.warn({ key }, { value }, { type });
            }

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
export default MandatoryParameterFields;
