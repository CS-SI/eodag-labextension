import React, { useMemo } from 'react';
import AsyncSelect from 'react-select/async';
import {
  components,
  OptionProps,
  SingleValueProps,
  ValueContainerProps
} from 'react-select';
import { PlacesType, Tooltip, VariantType } from 'react-tooltip';
import { IOptionTypeBase } from '../formComponent/FormComponent';
import { MenuList } from './menuList';

interface IProps {
  suggestions: IOptionTypeBase[];
  value: string;
  handleChange: (option: IOptionTypeBase | null) => void;
  label: string;
  placeholder?: string;
  loadSuggestions?: (inputValue: string) => Promise<IOptionTypeBase[]>;
}

const tooltipId = 'tooltip-global';

const NoOptionsMessage = (props: any) => (
  <div
    color="textSecondary"
    style={{ padding: '8px 16px' }}
    {...props.innerProps}
  >
    {props.children}
  </div>
);

const Option = (props: OptionProps<IOptionTypeBase, false>) => (
  <div
    data-tooltip-id={tooltipId}
    data-tooltip-content={props.data.description}
    data-tooltip-variant={'dark' as VariantType}
    data-tooltip-place={'right' as PlacesType}
  >
    <components.Option {...props}>{props.children}</components.Option>
  </div>
);

const SingleValue = (props: SingleValueProps<IOptionTypeBase>) => (
  <div style={{ fontSize: 14 }} {...props.innerProps}>
    {props.children}
  </div>
);

const ValueContainer = (props: ValueContainerProps<IOptionTypeBase, false>) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      flex: 1,
      paddingLeft: 5,
      alignItems: 'center',
      overflow: 'hidden'
    }}
  >
    {props.children}
  </div>
);

const listComponents = {
  NoOptionsMessage,
  Option,
  SingleValue,
  ValueContainer,
  MenuList
};

export const Autocomplete: React.FC<IProps> = ({
  label,
  suggestions,
  value,
  handleChange,
  placeholder,
  loadSuggestions
}) => {
  const currentValue = useMemo(
    () => suggestions.find(e => e.value === value) ?? null,
    [suggestions, value]
  );

  return (
    <div className="jp-EodagWidget-field">
      <label className="jp-EodagWidget-input-name">
        {label}
        <div style={{ marginTop: 10 }}>
          <AsyncSelect
            className="jp-EodagWidget-select"
            classNamePrefix="jp-EodagWidget-select"
            defaultOptions={suggestions}
            loadOptions={loadSuggestions}
            components={listComponents}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            isClearable
          />
        </div>
      </label>

      <Tooltip id={tooltipId} className="jp-Eodag-tooltip" />
    </div>
  );
};
