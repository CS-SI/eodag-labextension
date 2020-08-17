/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
*/

import * as React from 'react';
import Select, { components } from 'react-select';
import * as ReactTooltip from 'react-tooltip';

function NoOptionsMessage(props) {
  return (
    <div
      color="textSecondary"
      style={{
        padding: `8px 16px`,
      }}
      {...props.innerProps}
    >
      {props.children}
    </div>
  );
}

function Option(props) {
  // Tooltip on the right
  return (
    <div data-for={props.label} data-tip={props.data.description}>
      <components.Option {...props}>
        {props.children}
      </components.Option>
      <ReactTooltip id={props.label} className="jp-Eodag-tooltip" place="right" type="dark" effect="solid" />
    </div>
  );
}

function SingleValue(props) {
  return (
    <div style={{
      fontSize: 14,
    }} {...props.innerProps}>
      {props.children}
    </div>
  );
}

function ValueContainer(props) {
  return <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    paddingLeft: 5,
    alignItems: 'center',
    overflow: 'hidden',
  }}>{props.children}</div>;
}

const listcomponents = {
  NoOptionsMessage,
  Option,
  SingleValue,
  ValueContainer,
};

interface IProps {
  suggestions: any,
  value: any,
  handleChange: any,
}

interface IState {
}

class IntegrationReactSelect extends React.Component<IProps, IState> {

  render() {
    const { suggestions, value, handleChange } = this.props;
    let currentValue = '';
    if (value) {
      // @ts-ignore
      currentValue = {
        label: value,
        value: value
      }
    }
    return (
      <div className="jp-EodagWidget-field">
        <label className="jp-EodagWidget-input-name">
          Product type (*)
        </label>
        <div 
          style={{
            marginTop: 10
          }}
        >
          <Select
            options={suggestions}
            components={listcomponents}
            value={currentValue}
            onChange={handleChange}
            styles={{
              option: base => ({
                ...base,
                height: `100%`
              }),
              indicatorSeparator: base => ({
                ...base,
                margin: '0px'
              })
            }}
            theme={theme => ({
              ...theme,
              borderRadius: 0
            })}
            placeholder="S3_..."
            isClearable
          />
        </div>
      </div>
    );
  }
}

export default IntegrationReactSelect;