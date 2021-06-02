/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import React, { FC, useEffect, useState } from 'react';
import {
  useForm,
  SubmitHandler,
  Controller,
  useFieldArray,
  UseFormReturn
} from 'react-hook-form';
import { showErrorMessage } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { map } from 'lodash';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'isomorphic-fetch';
import Autocomplete from './Autocomplete';
import { EODAG_SERVER_ADRESS } from './config';
import SearchService from './SearchService';
import { ChangeEvent } from 'react';
import { OptionTypeBase } from 'react-select';
import MapExtentComponent from './MapExtentComponent';
import _ from 'lodash';
import { IFormInput } from './types';
import { DateTime } from 'luxon';

export interface IProps {
  handleShowFeature: any;
  saveFormValues: (formValue: IFormInput) => void;
}
export const FormComponent: FC<IProps> = ({
  handleShowFeature,
  saveFormValues
}) => {
  const [productTypes, setProductTypes] = useState<OptionTypeBase[]>();
  const now = DateTime.utc();
  const defaultStartDate = now.minus({ days: 1 }).toJSDate();
  const defaultEndDate = now.toJSDate();
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [cloud, setCloud] = useState(100);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const {
    control,
    handleSubmit,
    clearErrors,
    register,
    formState: { errors }
  } = useForm<IFormInput>({
    defaultValues: {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      cloud: 100
    }
  });

  useEffect(() => {
    // Fetch product types
    let _serverSettings = ServerConnection.makeSettings();
    let _eodag_server = URLExt.join(
      _serverSettings.baseUrl,
      `${EODAG_SERVER_ADRESS}`
    );
    fetch(URLExt.join(_eodag_server, 'product-types/'), {
      credentials: 'same-origin'
    })
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
        const productTypes = map(products, product => ({
          value: product.ID,
          label: product.ID,
          description: product.abstract
        }));
        setProductTypes(productTypes);
      })
      .catch(() => {
        showErrorMessage(
          `Unable to contact the EODAG server. Are you sure the adress is ${_eodag_server}/ ?`,
          {}
        );
      });
  }, []);

  useEffect(
    () => {
      if (errors.geometry) {
        showErrorMessage(
          'You first need to set a geometry on the map',
          {}
        ).then(() => clearErrors());
      } else if (!_.isEmpty(errors)) {
        showErrorMessage(
          'The following fields are required',
          _.keys(errors).join(', ')
        ).then(() => clearErrors());
      }
    },
    // useEffect is not triggered with only errors as dependency thus we need to list all its elements
    [
      errors.geometry,
      errors.productType,
      errors.startDate,
      errors.endDate,
      errors.cloud
    ]
  );

  const onSubmit: SubmitHandler<IFormInput> = data => {
    saveFormValues(data);
    setIsLoadingSearch(true);
    SearchService.search(1, data)
      .then(features => {
        setIsLoadingSearch(false);
        handleShowFeature(features);
      })
      .catch(() => {
        let _serverSettings = ServerConnection.makeSettings();
        let _eodag_server = URLExt.join(
          _serverSettings.baseUrl,
          `${EODAG_SERVER_ADRESS}`
        );
        showErrorMessage(
          `Unable to contact the EODAG server. Are you sure the adress is ${_eodag_server}/ ?`,
          {}
        );
        setIsLoadingSearch(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="geometry"
        control={control}
        rules={{ required: 'You first need to set a geometry on the map' }}
        render={({ field: { onChange, value } }) => (
          <MapExtentComponent geometry={value} onChange={onChange} />
        )}
      />
      <div className="jp-EodagWidget-field">
        <Controller
          name="productType"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              suggestions={productTypes}
              value={value}
              handleChange={(e: OptionTypeBase | null) => onChange(e?.value)}
            />
          )}
        />
        <label htmlFor="startDate" className="jp-EodagWidget-input-name">
          Start date
        </label>
        <div className="jp-EodagWidget-input-wrapper">
          <Controller
            name="startDate"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <DatePicker
                className="jp-EodagWidget-input"
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                onChange={(d: Date) => {
                  setStartDate(d);
                  onChange(d);
                }}
                onBlur={onBlur}
                selected={value}
                dateFormat={'dd/MM/yyyy'}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
              />
            )}
          />
        </div>
      </div>
      <label htmlFor="endDate" className="jp-EodagWidget-input-name">
        End date
      </label>
      <div className="jp-EodagWidget-input-wrapper">
        <Controller
          name="endDate"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <DatePicker
              className="jp-EodagWidget-input"
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              onChange={(d: Date) => {
                setEndDate(d);
                onChange(d);
              }}
              onBlur={onBlur}
              selected={value}
              dateFormat={'dd/MM/yyyy'}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              isClearable
            />
          )}
        />
      </div>
      <div className="jp-EodagWidget-field">
        <label htmlFor="cloud" className="jp-EodagWidget-input-name">
          Max cloud cover {cloud}%
        </label>
        <div className="jp-EodagWidget-slider">
          <Controller
            name="cloud"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                aria-labelledby="cloud"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(event.target.value, 10);
                  onChange(value);
                  setCloud(value);
                }}
              />
            )}
          />
        </div>
      </div>
      <Fields {...{ control, register }} />
      <div className="jp-EodagWidget-buttons">
        <button type="submit" color="primary" disabled={isLoadingSearch}>
          {isLoadingSearch ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
};

const Fields = ({ control, register }: Partial<UseFormReturn<IFormInput>>) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionnalParameters'
  });
  return (
    <fieldset>
      <legend>Additionnal Parameters</legend>
      {fields.map((field, index) => {
        return (
          <fieldset key={field.id}>
            <section className={'section'} key={field.id}>
              <input
                placeholder="Parameter name"
                {...register(`additionnalParameters.${index}.name` as const)}
              />
              <input
                placeholder="Parameter value"
                {...register(`additionnalParameters.${index}.value` as const)}
              />
              <button type="button" onClick={() => remove(index)}>
                Delete
              </button>
            </section>
          </fieldset>
        );
      })}

      <button type="button" onClick={() => append({})}>
        Add search parameter
      </button>
    </fieldset>
  );
};
