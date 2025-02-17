/*
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import { showErrorMessage } from '@jupyterlab/apputils';
import 'isomorphic-fetch';
import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ThreeDots } from 'react-loader-spinner';
import { PlacesType, Tooltip, VariantType } from 'react-tooltip';
import Autocomplete from '../Autocomplete';

import { fetchQueryables } from '../helpers/fetchQueryables';
import { useFetchProduct, useFetchProvider } from '../hooks/useFetchData';
import { ServerConnection } from '@jupyterlab/services';
import {
  CarbonCalendarAddAlt,
  CodiconOpenPreview,
  PhFileCode
} from '../icones.js';
import MapExtentComponent from '../MapExtentComponent';
import SearchService from '../SearchService';
import { IFormInput } from '../types';
import AdditionalParameterFields from './AdditionalParameterFields';
import ParameterFields from './ParameterFields';

export interface IProps {
  handleShowFeature: any;
  saveFormValues: (formValue: IFormInput) => void;
  handleGenerateQuery: any;
  isNotebookCreated: any;
  reloadIndicator: boolean;
  onFetchComplete: () => void;
}

export interface IOptionTypeBase {
  [key: string]: any;
}

export interface IProduct {
  ID: string;
  title: string;
}

export interface IProvider {
  provider: string;
  description: string;
}

export const tooltipDark: VariantType = 'dark';
export const tooltipWarning: VariantType = 'warning';
export const tooltipTop: PlacesType = 'top';

export const FormComponent: FC<IProps> = ({
  handleShowFeature,
  saveFormValues,
  handleGenerateQuery,
  isNotebookCreated,
  reloadIndicator,
  onFetchComplete
}) => {
  const [productTypes, setProductTypes] = useState<IOptionTypeBase[]>();
  const [providers, setProviders] = useState<IOptionTypeBase[]>();
  const defaultStartDate: Date = undefined;
  const defaultEndDate: Date = undefined;
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [cloud, setCloud] = useState(100);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [openModal, setOpenModal] = useState(true);
  const [providerValue, setProviderValue] = useState(null);
  const [productTypeValue, setProductTypeValue] = useState(null);
  const [fetchCount, setFetchCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    // clearErrors,
    register,
    resetField
    // formState: { errors }
  } = useForm<IFormInput>({
    defaultValues: {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      cloud: 100
    }
  });

  useEffect(() => {
    if (!reloadIndicator) {
      setFetchCount(0);
    }
  }, [reloadIndicator]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchProduct = useFetchProduct();
      const productList = await fetchProduct(providerValue);
      setProductTypes(productList);
      if (reloadIndicator) {
        setFetchCount(fetchCount => fetchCount + 1);
      }
    };
    fetchData();
  }, [providerValue, reloadIndicator]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchProvider = useFetchProvider();
      const providerList = await fetchProvider(productTypeValue);

      setProviders(providerList);
      if (reloadIndicator) {
        setFetchCount(fetchCount => fetchCount + 1);
      }
    };

    fetchData();
  }, [productTypeValue, reloadIndicator]);

  useEffect(() => {
    if (fetchCount === 2) {
      onFetchComplete();
    }
  }, [fetchCount, onFetchComplete]);

  const onSubmit: SubmitHandler<IFormInput> = data => {
    if (!isNotebookCreated()) {
      return;
    }

    console.log("Submit data :", data)

    saveFormValues(data);

    if (!openModal) {
      handleGenerateQuery(params);
    }

    if (openModal) {
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
          handleShowFeature(featureCollection, openModal);
          if (!openModal) {
            handleGenerateQuery(params);
          }
        })
        .catch(error => {
          showErrorMessage('Bad response from server:', error);
          setIsLoadingSearch(false);
        });
    }
  };

  const loadProductTypesSuggestions = useFetchProduct();
  const loadProviderSuggestions = useFetchProvider();

  const [params, setParams] = useState(null);
  const [additionalParameters, setAdditionalParameters] =
    useState<boolean>(true);
  const [mandatoryParameters, setMandatoryParameters] = useState<Set<string>>(new Set());

  const fetchData = async (
    provider: string,
    productType: any,
    query_params: { [key: string]: any } | undefined = undefined,
    setMandatory: boolean = false
  ) => {
    let queryables;

    // Isolate the fetch queryables call and handle errors specifically for it
    try {
      queryables = await fetchQueryables(provider, productType, query_params);
    } catch (error) {
      if (error instanceof ServerConnection.ResponseError) {
        showErrorMessage('Bad response from server:', error);
      } else {
        console.error("Error fetching queryables:", error);
      }
      return;
    }

    // Proceed with the rest of the logic only if fetchQueryables is successful
    setAdditionalParameters(queryables.additionalProperties);

    if (setMandatory) {
      setMandatoryParameters(queryables.required);
    }

    const params = Object.entries(queryables.properties)
      .map(([key, value]) => ({
        key,
        value,
        mandatory: mandatoryParameters.has(key),
      }));

    setParams(params);
  };


  useEffect(() => {
    if (providerValue && productTypeValue) {
      fetchData(providerValue, productTypeValue, undefined, true);
    }
  }, [providerValue, productTypeValue]);

  useEffect(() => {
    if (!params || additionalParameters || !productTypeValue || loading) return;

    const query_params = params ? params.reduce((acc: { [key: string]: string }, curr: any) => {
      acc[curr.key] = curr.value.selected;
      return acc;
    }, {} as { [key: string]: string }) : undefined;

    setLoading(true);
    fetchData(providerValue, productTypeValue, query_params)
      .then(() => setLoading(false));

  }, [params]);


  return (
    <div className="jp-EodagWidget-wrapper">
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
            name="provider"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                label="Provider"
                placeholder="Any"
                suggestions={providers}
                value={value}
                loadSuggestions={(inputValue: string) =>
                  loadProviderSuggestions(null, inputValue)
                }
                handleChange={(e: IOptionTypeBase | null) => {
                  onChange(e?.value);
                  setProviderValue(e?.value);
                }}
              />
            )}
          />
          <Controller
            name="productType"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                label="Product Type"
                suggestions={productTypes}
                placeholder="S2_..."
                value={value}
                loadSuggestions={(inputValue: string) =>
                  loadProductTypesSuggestions(providerValue, inputValue)
                }
                handleChange={(e: IOptionTypeBase | null) => {
                  onChange(e?.value);
                  setProductTypeValue(e?.value);
                  if (e?.value === undefined) {
                    setParams([])
                  }
                }}
              />
            )}
          />
          <div className="jp-EodagWidget-form-date-picker">
            <label htmlFor="startDate" className="jp-EodagWidget-input-name">
              Date range
            </label>
            <div className="jp-EodagWidget-form-date-picker-wrapper">
              <div className="jp-EodagWidget-input-wrapper">
                <CarbonCalendarAddAlt height="22" width="22" />
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DatePicker
                      className="jp-EodagWidget-input jp-EodagWidget-input-with-svg"
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
                      placeholderText="Start"
                    />
                  )}
                />
              </div>

              <div className="jp-EodagWidget-input-wrapper">
                <CarbonCalendarAddAlt height="22" width="22" />
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DatePicker
                      className="jp-EodagWidget-input jp-EodagWidget-input-with-svg"
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
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
                      placeholderText="End"
                    />
                  )}
                />
              </div>
            </div>
          </div>
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

          {params && <ParameterFields {...{ params, setParams }} />}

          <AdditionalParameterFields
            {...{ control, register, resetField, additionalParameters }}
          />
        </div>
        <div className="jp-EodagWidget-form-buttons">
          <div className="jp-EodagWidget-form-buttons-wrapper">
            {isLoadingSearch ? (
              <div className="jp-EodagWidget-loader">
                <p>Generating</p>
                <ThreeDots
                  height="35"
                  width="35"
                  radius="9"
                  color="#1976d2"
                  ariaLabel="three-dots-loading"
                  wrapperStyle={{}}
                  visible={true}
                />
              </div>
            ) : (
              <>
                <div className="jp-EodagWidget-buttons">
                  <button
                    type="submit"
                    color="primary"
                    className={
                      !productTypeValue
                        ? 'jp-EodagWidget-buttons-button jp-EodagWidget-buttons-button__disabled'
                        : 'jp-EodagWidget-buttons-button'
                    }
                    disabled={isLoadingSearch}
                    onClick={() => setOpenModal(true)}
                    data-tooltip-id="btn-preview-results"
                    data-tooltip-content="You need to select a product type to preview the results"
                    data-tooltip-variant={tooltipDark}
                    data-tooltip-place={tooltipTop}
                  >
                    <CodiconOpenPreview width="21" height="21" />
                    <p>
                      Preview
                      <br />
                      Results
                    </p>
                    {!productTypeValue && (
                      <Tooltip
                        id="btn-preview-results"
                        className="jp-Eodag-tooltip"
                      />
                    )}
                  </button>
                </div>
                <div className="jp-EodagWidget-buttons">
                  <button
                    type="submit"
                    color="primary"
                    className={
                      !productTypeValue
                        ? 'jp-EodagWidget-buttons-button jp-EodagWidget-buttons-button__disabled'
                        : 'jp-EodagWidget-buttons-button'
                    }
                    disabled={isLoadingSearch}
                    onClick={() => setOpenModal(false)}
                    data-tooltip-id="btn-generate-value"
                    data-tooltip-content="You need to select a product type to generate the code"
                    data-tooltip-variant={tooltipDark}
                    data-tooltip-place={tooltipTop}
                  >
                    <PhFileCode height="21" width="21" />
                    <p>
                      Generate
                      <br />
                      Code
                    </p>
                    {!productTypeValue && (
                      <Tooltip
                        id="btn-generate-value"
                        className="jp-Eodag-tooltip"
                      />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
