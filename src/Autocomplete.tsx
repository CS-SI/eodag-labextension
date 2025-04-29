/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import {
  components,
  OptionProps,
  SingleValueProps,
  ValueContainerProps
} from 'react-select';
import AsyncSelect from 'react-select/async';
import { OptionTypeBase } from 'react-select/src/types';
import { PlacesType, Tooltip, VariantType } from 'react-tooltip';

import { IOptionTypeBase } from './formComponent/FormComponent';

function NoOptionsMessage(props: any) {
  return (
    <div
      color="textSecondary"
      style={{
        padding: '8px 16px'
      }}
      {...props.innerProps}
    >
      {props.children}
    </div>
  );
}
const tooltipDark: VariantType = 'dark';
const tooltipRight: PlacesType = 'right';
function Option(props: OptionProps<OptionTypeBase, false>) {
  // Tooltip on the right
  return (
    <div
      data-tooltip-id={props.label}
      data-tooltip-content={props.data.description}
      data-tooltip-variant={tooltipDark}
      data-tooltip-place={tooltipRight}
    >
      <components.Option {...props}>{props.children}</components.Option>
      <Tooltip id={props.label} className="jp-Eodag-tooltip" />
    </div>
  );
}

function SingleValue(props: SingleValueProps<OptionTypeBase>) {
  return (
    <div
      style={{
        fontSize: 14
      }}
      {...props.innerProps}
    >
      {props.children}
    </div>
  );
}

function ValueContainer(props: ValueContainerProps<OptionTypeBase, false>) {
  return (
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
}

const listcomponents = {
  NoOptionsMessage,
  Option,
  SingleValue,
  ValueContainer
};

interface IProps {
  suggestions: IOptionTypeBase[];
  value: string;
  handleChange: any;
  label: string;
  placeholder?: string;
  loadSuggestions?: (inputValue: string) => Promise<IOptionTypeBase[]>;
}

class IntegrationReactSelect extends React.Component<IProps> {
  render() {
    const {
      label,
      suggestions,
      value,
      handleChange,
      placeholder,
      loadSuggestions
    } = this.props;

    const currentValue: OptionTypeBase | undefined = value
      ? suggestions && suggestions.find(e => e.value === value)
      : undefined;

    return (
      <div className="jp-EodagWidget-field">
        <label className="jp-EodagWidget-input-name">
          {label}
          <div
            style={{
              marginTop: 10
            }}
          >
            <AsyncSelect
              className="jp-EodagWidget-select"
              classNamePrefix="jp-EodagWidget-select"
              defaultOptions={suggestions}
              loadOptions={loadSuggestions}
              components={listcomponents}
              value={currentValue}
              onChange={handleChange}
              placeholder={placeholder}
              isClearable
            />
          </div>
        </label>
      </div>
    );
  }
}

export default IntegrationReactSelect;
