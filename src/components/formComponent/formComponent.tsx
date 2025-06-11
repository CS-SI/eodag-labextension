/*
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import 'isomorphic-fetch';
import React, { FC, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Controller,
  SubmitHandler,
  UseFormReturn,
  useWatch
} from 'react-hook-form';
import { Autocomplete } from '../autocomplete/autocomplete';
import { fetchQueryables } from '../../utils/fetchers/fetchQueryables';
import { CarbonCalendarAddAlt } from '../icons';
import { MapExtent } from '../map/mapExtent';
import SearchService from '../../utils/searchService';
import { IFormInput, IOptionType, IParameter } from '../../types';
import { AdditionalParameterFields } from './additionalParameterFields';
import { ParameterGroup } from './parameterGroup';
import { DropdownButton } from './dropdownButton';
import { IMapSettings } from '../browser';
import { SubmitButtons } from './submitButtons';
import { showCustomErrorDialog } from '../customErrorDialog/customErrorDialog';
import { formatCustomError } from '../../utils/formatErrors';
import { NoParamsAlert } from './noParamsAlert';

export interface IFormComponentsProps {
  handleShowFeature: any;
  form: UseFormReturn<IFormInput, any, IFormInput>;
  handleGenerateQuery: (params: IParameter[]) => Promise<void>;
  ensureNotebookIsOpen: () => Promise<boolean>;
  mapSettings?: IMapSettings;
  fetchProducts: (
    providerValue: string | null | undefined,
    inputValue?: string
  ) => Promise<IOptionTypeBase[]>;
  fetchProviders: (
    productTypeValue: string | null | undefined,
    inputValue?: string
  ) => Promise<IOptionTypeBase[]>;
  fetchProvidersLoading: boolean;
  fetchProductsLoading: boolean;
}

export interface IOptionTypeBase {
  [key: string]: any;
}

export const FormComponent: FC<IFormComponentsProps> = ({
  handleShowFeature,
  form,
  handleGenerateQuery,
  ensureNotebookIsOpen,
  mapSettings,
  fetchProducts,
  fetchProviders,
  fetchProvidersLoading,
  fetchProductsLoading
}) => {
  const [productTypes, setProductTypes] = useState<IOptionTypeBase[]>();
  const [providers, setProviders] = useState<IOptionTypeBase[]>();
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [openModal, setOpenModal] = useState(true);
  const [params, setParams] = useState<IParameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [additionalParameters, setAdditionalParameters] =
    useState<boolean>(true);
  const [optionalParams, setOptionalParams] = useState<IOptionType[]>([]);

  const formValues = useWatch({ control: form.control });

  const { provider: providerValue, productType: productTypeValue } = formValues;

  useEffect(() => {
    const fetchData = async () => await fetchProducts(providerValue);
    fetchData().then(list => setProductTypes(list));
  }, [providerValue]);

  useEffect(() => {
    const fetchData = async () => await fetchProviders(productTypeValue);
    fetchData().then(list => setProviders(list));
  }, [productTypeValue]);

  const onSubmit: SubmitHandler<IFormInput> = async data => {
    const notebookReady = await ensureNotebookIsOpen();
    if (!notebookReady) {
      return;
    }

    if (!openModal) {
      handleGenerateQuery(params);
    }

    if (openModal) {
      setIsLoadingSearch(true);
      try {
        const featureCollection = await SearchService.search(1, data);

        if (!featureCollection?.features?.length) {
          throw {
            error: 'No result found',
            details: 'The search did not return any features.'
          };
        }

        handleShowFeature(featureCollection, openModal);
      } catch (err: any) {
        await showCustomErrorDialog(
          formatCustomError(err),
          'EODAG Labextension - search error'
        );
      } finally {
        setIsLoadingSearch(false);
      }
    }
  };

  const fetchParameters = async (
    query_params: { [key: string]: any } | undefined = undefined
  ): Promise<IParameter[]> => {
    let queryables;

    setLoading(true);
    if (providerValue && productTypeValue) {
      // Isolate the fetch queryables call and handle errors specifically for it
      try {
        queryables = await fetchQueryables(
          providerValue,
          productTypeValue,
          query_params
        );
      } catch (error) {
        return [];
      }
      setParams(queryables.properties);

      setAdditionalParameters(queryables.additionalProperties);

      setLoading(false);

      return queryables.properties;
    } else {
      throw new Error('No parameters found');
    }
  };

  useEffect(() => {
    if (productTypeValue) {
      fetchParameters()
        .then(params => {
          const defaultValues = params.reduce(
            (acc: { [key: string]: any }, param: IParameter) => {
              // Ensure param.value contains a 'default' property before accessing it
              if (param.value && 'default' in param.value) {
                acc[param.key] = param.value.default;
              }
              return acc;
            },
            {}
          );

          form.reset({
            ...defaultValues,
            geometry: formValues.geometry,
            provider: formValues.provider,
            productType: formValues.productType,
            additionalParameters: formValues.additionalParameters
          });

          const optionals = params
            .filter(param => !param.mandatory)
            .map(param => ({
              value: param.key,
              label: param.value.title ?? param.key
            }));
          setOptionalParams(optionals);
        })
        .catch(error => {
          console.error('Error fetching parameters:', error);
        });
    }
  }, [providerValue, productTypeValue]);

  useEffect(() => {
    if (!params || additionalParameters || !productTypeValue || loading) {
      return;
    }

    const query_params = params
      ? params.reduce(
          (acc: { [key: string]: string }, curr: any) => {
            acc[curr.key] = curr.value.selected;
            return acc;
          },
          {} as { [key: string]: string }
        )
      : undefined;

    fetchParameters(query_params);
  }, [params]);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSelectDropdown = (param: IOptionType): void => {
    if (selectedOptions.includes(param.value)) {
      setSelectedOptions(
        selectedOptions.filter(option => option !== param.value)
      );
      form.resetField(param.value);
    } else {
      setSelectedOptions([...selectedOptions, param.value]);
    }
  };

  const renderParameterGroups = () => (
    <>
      {params.some(param => param.mandatory) || selectedOptions.length > 0 ? (
        <>
          <ParameterGroup
            form={form}
            params={params}
            setParams={setParams}
            mandatory
          />
          <ParameterGroup
            form={form}
            params={params}
            setParams={setParams}
            selectedOptions={selectedOptions}
          />
        </>
      ) : (
        <p>No required parameter for this product type.</p>
      )}
    </>
  );

  return (
    <div className="jp-EodagWidget-wrapper">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="jp-EodagWidget-form"
      >
        {mapSettings && (
          <div className="jp-EodagWidget-map">
            <Controller
              name="geometry"
              control={form.control}
              rules={{ required: false }}
              render={({ field: { onChange, value } }) => (
                <MapExtent
                  geometry={value}
                  onChange={onChange}
                  mapSettings={mapSettings}
                />
              )}
            />
          </div>
        )}
        <div className="jp-EodagWidget-fields">
          <Controller
            name="provider"
            control={form.control}
            render={({ field: { value } }) => (
              <Autocomplete
                label="Provider"
                placeholder="Any"
                suggestions={providers ? providers : []}
                value={value ?? null}
                disabled={fetchProvidersLoading}
                loadSuggestions={(inputValue: string) =>
                  fetchProviders(null, inputValue)
                }
                handleChange={(e: IOptionTypeBase | null) => {
                  const newValue = e === null ? null : e.value;
                  form.setValue('provider', newValue, {
                    shouldValidate: true
                  });
                }}
              />
            )}
          />
          <Controller
            name="productType"
            control={form.control}
            rules={{ required: true }}
            render={({ field: { value } }) => (
              <Autocomplete
                label="Product Type"
                suggestions={productTypes ? productTypes : []}
                placeholder="S2_..."
                value={value ?? null}
                disabled={fetchProductsLoading}
                loadSuggestions={(inputValue: string) =>
                  fetchProducts(providerValue, inputValue)
                }
                handleChange={(e: IOptionTypeBase | null) => {
                  if (e === null) {
                    setParams([]);
                    setOptionalParams([]);
                    form.reset({
                      geometry: formValues.geometry,
                      provider: formValues.provider,
                      additionalParameters: formValues.additionalParameters
                    });
                    return form.setValue('productType', null, {
                      shouldValidate: true
                    });
                  }
                  form.setValue('productType', e.value, {
                    shouldValidate: true
                  });

                  if (e.value !== productTypeValue) {
                    setSelectedOptions([]);
                    form.setValue(
                      'additionalParameters',
                      [{ name: '', value: '' }],
                      { shouldValidate: true }
                    );
                  }
                }}
              />
            )}
          />
          <div className="jp-EodagWidget-field">
            <label htmlFor="startDate">Date range</label>
            <div className="jp-EodagWidget-form-date-picker-wrapper">
              <div className="jp-EodagWidget-input-wrapper">
                <CarbonCalendarAddAlt height="22" width="22" />
                <Controller
                  name="startDate"
                  control={form.control}
                  rules={{ required: false }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DatePicker
                      className="jp-EodagWidget-input jp-EodagWidget-input-with-svg"
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      maxDate={endDate}
                      onChange={(d: any) => {
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
                  control={form.control}
                  rules={{ required: false }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DatePicker
                      className="jp-EodagWidget-input jp-EodagWidget-input-with-svg"
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(d: any) => {
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

          <div className={'jp-EodagWidget-optional-params-wrapper'}>
            <div className={'jp-EodagWidget-optional-params-title'}>
              <p className="jp-EodagWidget-section-title">Parameters</p>
              <DropdownButton
                options={optionalParams}
                onSelect={handleSelectDropdown}
                selectedOptions={selectedOptions}
                disabled={!optionalParams.length}
              />
            </div>
            <div className="jp-EodagWidget-field">
              {!params || !params.length ? (
                <NoParamsAlert
                  label={'Select a product type to unlock custom parameters'}
                />
              ) : (
                renderParameterGroups()
              )}
            </div>
          </div>

          <AdditionalParameterFields
            {...{
              control: form.control,
              register: form.register,
              resetField: form.resetField,
              productType: productTypeValue,
              additionalParameters
            }}
          />
        </div>
        <div className="jp-EodagWidget-form-buttons">
          <SubmitButtons
            isLoadingSearch={isLoadingSearch}
            onPreviewClick={() => setOpenModal(true)}
            onGeneratingClick={() => setOpenModal(false)}
            productTypeValue={productTypeValue}
          />
        </div>
      </form>
    </div>
  );
};
