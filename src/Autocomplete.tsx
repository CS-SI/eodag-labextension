/**
 * Copyright 2021 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import Select, {
  components,
  OptionProps,
  SingleValueProps,
  ValueContainerProps
} from 'react-select';
import ReactTooltip from 'react-tooltip';
import { OptionTypeBase } from 'react-select/src/types';

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

function Option(props: OptionProps<OptionTypeBase, false>) {
  // Tooltip on the right
  return (
    <div data-for={props.label} data-tip={props.data.description}>
      <components.Option {...props}>{props.children}</components.Option>
      <ReactTooltip
        id={props.label}
        className="jp-Eodag-tooltip"
        place="right"
        type="dark"
        effect="solid"
      />
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
  suggestions: OptionTypeBase[];
  value: string;
  handleChange: any;
}

class IntegrationReactSelect extends React.Component<IProps> {
  render() {
    const { suggestions, value, handleChange } = this.props;
    const currentValue: OptionTypeBase = value
      ? suggestions.find(e => e.value === value)
      : undefined;
    return (
      <div className="jp-EodagWidget-field">
        <label className="jp-EodagWidget-input-name">
          Product type (*)
          <div
            style={{
              marginTop: 10
            }}
          >
            <Select
              className="jp-EodagWidget-select"
              classNamePrefix="jp-EodagWidget-select"
              options={suggestions}
              components={listcomponents}
              value={currentValue}
              onChange={handleChange}
              placeholder="S3_..."
              isClearable
            />
          </div>
        </label>
      </div>
    );
  }
}

export default IntegrationReactSelect;
