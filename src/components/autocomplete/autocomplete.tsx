import React, { useMemo } from 'react';
import AsyncSelect from 'react-select/async';
import {
  components,
  OptionProps,
  SingleValueProps,
  ValueContainerProps
} from 'react-select';
import { Tooltip } from 'react-tooltip';
import { IOptionTypeBase } from '../formComponent/formComponent';
import { MenuList } from './menuList';
import { LoadingState } from '../loadingState/loadingState';

interface IAutocompleteProps {
  suggestions: IOptionTypeBase[];
  value: string | null;
  disabled: boolean;
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
    data-tooltip-html={`<div><p>${props.data.description}</p><br /><em>${props.data.label}</em></div>`}
    data-tooltip-variant="dark"
    data-tooltip-place="right"
    style={{
      maxHeight: 44,
      overflow: 'hidden'
    }}
  >
    <components.Option
      {...props}
      innerProps={{
        ...props.innerProps,
        style: {
          ...props.innerProps.style,
          display: 'flex',
          alignItems: 'center',
          height: '44px',
          padding: '0 12px'
        }
      }}
    >
      <p
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {props.children}
      </p>
    </components.Option>
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

export const Autocomplete: React.FC<IAutocompleteProps> = ({
  label,
  suggestions,
  value,
  handleChange,
  placeholder,
  disabled,
  loadSuggestions
}) => {
  const currentValue = useMemo(
    () => suggestions.find(e => e.value === value) ?? null,
    [suggestions, value]
  );

  return (
    <div className="jp-EodagWidget-field">
      <label>{label}</label>
      <LoadingState disabled={disabled}>
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
      </LoadingState>

      <Tooltip id={tooltipId} className="jp-Eodag-tooltip" />
    </div>
  );
};
