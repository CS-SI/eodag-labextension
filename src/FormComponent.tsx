/*
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'isomorphic-fetch';
import Autocomplete from './Autocomplete';
import SearchService from './SearchService';
import { ChangeEvent } from 'react';
import MapExtentComponent from './MapExtentComponent';
import _ from 'lodash';
import { IFormInput } from './types';
import {
  CodiconOpenPreview,
  PhFileCode,
  CarbonTrashCan,
  CarbonAddFilled,
  CarbonCalendarAddAlt,
  CarbonInformation
} from './icones.js';
import { Tooltip, PlacesType, VariantType } from 'react-tooltip';
import { ThreeDots } from 'react-loader-spinner';
import { useFetchProduct, useFetchProvider } from './hooks/useFetchData';

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

const tooltipDark: VariantType = 'dark';
const tooltipWarning: VariantType = 'warning';
const tooltipTop: PlacesType = 'top';

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
  }, [fetchCount]);

  const onSubmit: SubmitHandler<IFormInput> = data => {
    if (!isNotebookCreated()) {
      return;
    }

    saveFormValues(data);

    if (!openModal) {
      handleGenerateQuery();
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
            handleGenerateQuery();
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
                    <>
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
                    </>
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
          <Fields {...{ control, register, resetField }} />
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

const Fields = ({
  control,
  register,
  resetField
}: Partial<UseFormReturn<IFormInput>>) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'additionnalParameters'
  });
  fields[0] = { name: '', value: '', id: '999' };

  const clearInput = (index: number): void => {
    resetField(`additionnalParameters.${index}.name`);
    resetField(`additionnalParameters.${index}.value`);
  };
  return (
    <div className="jp-EodagWidget-additionnalParameters">
      <div className="jp-EodagWidget-additionnalParameters-label-icon-wrapper">
        <label className="jp-EodagWidget-input-name">
          Additional Parameters
        </label>
        <a
          href="https://eodag.readthedocs.io/en/stable/add_provider.html#opensearch-parameters-csv"
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id="parameters-information"
          data-tooltip-content="Click to check queryable metadata in parameters documentation"
          data-tooltip-variant={tooltipDark}
          data-tooltip-place={tooltipTop}
        >
          <CarbonInformation height="20" width="20" />
          <Tooltip id="parameters-information" className="jp-Eodag-tooltip" />
        </a>
      </div>

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
                onClick={() =>
                  fields.length === 1 ? clearInput(index) : remove(index)
                }
                data-tooltip-id="parameters-delete"
                data-tooltip-content="remove additionnal parameter"
                data-tooltip-variant={tooltipWarning}
                data-tooltip-place={tooltipTop}
              >
                <CarbonTrashCan height="20" width="20" />
                <Tooltip id="parameters-delete" className="jp-Eodag-tooltip" />
              </button>
              <button
                type="button"
                className="jp-EodagWidget-additionnalParameters-addbutton"
                onClick={() => append({ name: '', value: '' })}
                data-tooltip-id="parameters-add"
                data-tooltip-content="add a new additionnal parameter"
                data-tooltip-variant={tooltipDark}
                data-tooltip-place={tooltipTop}
              >
                <CarbonAddFilled height="20" width="20" />
                <Tooltip id="parameters-add" className="jp-Eodag-tooltip" />
              </button>
            </section>
          </div>
        );
      })}
    </div>
  );
};
