/**
 * Copyright 2021 CS GROUP - France, http://www.c-s.fr
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

export interface IProps {
  handleShowFeature: any;
  saveFormValues: (formValue: IFormInput) => void;
}
export const FormComponent: FC<IProps> = ({
  handleShowFeature,
  saveFormValues
}) => {
  const [productTypes, setProductTypes] = useState<OptionTypeBase[]>();
  const defaultStartDate: Date = undefined;
  const defaultEndDate: Date = undefined;
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
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
    const _serverSettings = ServerConnection.makeSettings();
    const _eodag_server = URLExt.join(
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
      if (!_.isEmpty(errors)) {
        showErrorMessage(
          'The following fields are required',
          _.keys(errors).join(', ')
        ).then(() => clearErrors());
      }
    },
    // useEffect is not triggered with only errors as dependency thus we need to list all its elements
    [errors.productType]
  );

  const onSubmit: SubmitHandler<IFormInput> = data => {
    saveFormValues(data);
    setIsLoadingSearch(true);
    SearchService.search(1, data)
      .then(featureCollection => {
        if (featureCollection?.features?.length === 0) {
          throw new Error('No result found');
        } else {
          return featureCollection;
        }
      })
      .then(featureCollection => {
        setIsLoadingSearch(false);
        handleShowFeature(featureCollection);
      })
      .catch(error => {
        showErrorMessage('Bad response from server:', error);
        setIsLoadingSearch(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="jp-EodagWidget-form">
      <div className="jp-EodagWidget-map">
        <Controller
          name="geometry"
          control={control}
          rules={{ required: false }}
          render={({ field: { onChange, value } }) => (
            <MapExtentComponent geometry={value} onChange={onChange} />
          )}
        />
      </div>
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
        <fieldset>
          <legend>Date range</legend>
          <label htmlFor="startDate" className="jp-EodagWidget-input-name">
            Start
          </label>
          <div className="jp-EodagWidget-input-wrapper">
            <Controller
              name="startDate"
              control={control}
              rules={{ required: false }}
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
          <label htmlFor="endDate" className="jp-EodagWidget-input-name">
            End
          </label>
          <div className="jp-EodagWidget-input-wrapper">
            <Controller
              name="endDate"
              control={control}
              rules={{ required: false }}
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
        </fieldset>
        <label className="jp-EodagWidget-input-name">
          Max cloud cover {cloud}%
          <div className="jp-EodagWidget-slider">
            <Controller
              name="cloud"
              control={control}
              rules={{ required: false }}
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
        </label>
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
    <fieldset className="jp-EodagWidget-additionnalParameters-fieldset">
      <legend>Additionnal Parameters</legend>
      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <section className={'section'} key={field.id}>
              <input
                placeholder="Name"
                {...register(`additionnalParameters.${index}.name` as const)}
              />
              <input
                placeholder="Value"
                {...register(`additionnalParameters.${index}.value` as const)}
              />
              <button
                type="button"
                className="jp-EodagWidget-additionnalParameters-deletebutton"
                onClick={() => remove(index)}
              >
                x
              </button>
            </section>
          </div>
        );
      })}

      <button
        type="button"
        className="jp-EodagWidget-additionnalParameters-addbutton"
        onClick={() => append({})}
      >
        Add search parameter
      </button>
    </fieldset>
  );
};
