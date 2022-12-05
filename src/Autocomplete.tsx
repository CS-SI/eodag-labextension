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
import ReactTooltip from 'react-tooltip';
import { OptionTypeBase } from 'react-select/src/types';
import AsyncSelect from 'react-select/async';

import { showErrorMessage } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { EODAG_SERVER_ADRESS } from './config';
import { map } from 'lodash';
import { IOptionTypeBase } from './FormComponent';

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

    const guessProductTypes = async (inputValue: string) => {
      const _serverSettings = ServerConnection.makeSettings();
      const _eodag_server = URLExt.join(
        _serverSettings.baseUrl,
        `${EODAG_SERVER_ADRESS}`
      );

      return fetch(
        URLExt.join(_eodag_server, `guess-product-type?keywords=${inputValue}`),
        {
          credentials: 'same-origin'
        }
      )
        .then(response => {
          if (response.status >= 400) {
            showErrorMessage(
              `Unable to contact the EODAG server. Are you sure the adress is ${_eodag_server}/ ?`,
              {}
            );
            throw new Error('Bad response from server');
          }
          return response.json();
        })
        .then(products => {
          const guessProductTypes = map(products, product => ({
            value: product.ID,
            label: product.ID,
            description: product.abstract
          }));
          return guessProductTypes;
        });
    };

    const loadSuggestions = (inputValue: string) =>
      new Promise<IOptionTypeBase[]>(resolve => {
        resolve(guessProductTypes(inputValue));
      });

    return (
      <div className="jp-EodagWidget-field">
        <label className="jp-EodagWidget-input-name">
          Product type
          <div
            style={{
              marginTop: 10
            }}
          >
            <AsyncSelect
              className="jp-EodagWidget-select"
              classNamePrefix="jp-EodagWidget-select"
              cacheOptions
              defaultOptions={suggestions}
              loadOptions={loadSuggestions}
              components={listcomponents}
              value={currentValue}
              onChange={handleChange}
              placeholder="S2_..."
              isClearable
            />
          </div>
        </label>
      </div>
    );
  }
}

export default IntegrationReactSelect;
