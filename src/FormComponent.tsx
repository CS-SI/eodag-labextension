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
import MapExtentComponent from './MapExtentComponent';
import _ from 'lodash';
import { IFormInput } from './types';
import {
  CodiconOpenPreview,
  PhFileCode,
  CarbonTrashCan,
  CarbonAddFilled,
  CarbonCalendarAddAlt,
  CarbonSettings,
  CarbonInformation
} from './icones.js';
import ReactTooltip from 'react-tooltip';
import { ThreeDots } from 'react-loader-spinner';

export interface IProps {
  handleShowFeature: any;
  saveFormValues: (formValue: IFormInput) => void;
  handleGenerateQuery: any;
  isNotebookCreated: any;
  commands: any;
}
export interface IOptionTypeBase {
  [key: string]: any;
}

export const FormComponent: FC<IProps> = ({
  handleShowFeature,
  saveFormValues,
  handleGenerateQuery,
  isNotebookCreated,
  commands
}) => {
  const [productTypes, setProductTypes] = useState<IOptionTypeBase[]>();
  const defaultStartDate: Date = undefined;
  const defaultEndDate: Date = undefined;
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [cloud, setCloud] = useState(100);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [openModal, setOpenModal] = useState(true);
  const [selectValue, setSelectValue] = useState(null);

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

  // useEffect(
  //   () => {
  //     if (!_.isEmpty(errors)) {
  //       showErrorMessage(
  //         'The following fields are required',
  //         _.keys(errors).join(', ')
  //       ).then(() => clearErrors());
  //     }
  //   },
  //   // useEffect is not triggered with only errors as dependency thus we need to list all its elements
  //   [errors]
  // );

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

  const handleOpenSettings = (): void => {
    commands.execute('settingeditor:open', { query: 'EODAG' });
  };

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
            name="productType"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                suggestions={productTypes}
                value={value}
                handleChange={(e: IOptionTypeBase | null) => {
                  onChange(e?.value);
                  setSelectValue(e?.value);
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
                        maxDate={endDate}
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
                      !selectValue
                        ? 'jp-EodagWidget-buttons-button jp-EodagWidget-buttons-button__disabled'
                        : 'jp-EodagWidget-buttons-button'
                    }
                    disabled={isLoadingSearch}
                    onClick={() => setOpenModal(true)}
                    data-for="btn-preview-results"
                    data-tip="You need to select a product type to preview the results"
                  >
                    <CodiconOpenPreview width="21" height="21" />
                    <p>
                      Preview
                      <br />
                      Results
                    </p>
                    {!selectValue && (
                      <ReactTooltip
                        id="btn-preview-results"
                        className="jp-Eodag-tooltip"
                        place="top"
                        type="dark"
                        effect="solid"
                      />
                    )}
                  </button>
                </div>
                <div className="jp-EodagWidget-buttons">
                  <button
                    type="submit"
                    color="primary"
                    className={
                      !selectValue
                        ? 'jp-EodagWidget-buttons-button jp-EodagWidget-buttons-button__disabled'
                        : 'jp-EodagWidget-buttons-button'
                    }
                    disabled={isLoadingSearch}
                    onClick={() => setOpenModal(false)}
                    data-for="btn-generate-value"
                    data-tip="You need to select a product type to generate the code"
                  >
                    <PhFileCode height="21" width="21" />
                    <p>
                      Generate
                      <br />
                      Code
                    </p>
                    {!selectValue && (
                      <ReactTooltip
                        id="btn-generate-value"
                        className="jp-Eodag-tooltip"
                        place="top"
                        type="dark"
                        effect="solid"
                      />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
      <div>
        <button
          type="button"
          className="jp-EodagWidget-settingsbutton"
          data-for="eodag-setting"
          data-tip="Eodag labextension settings"
          onClick={handleOpenSettings}
        >
          <CarbonSettings height="20" width="20" />
          <ReactTooltip
            id="eodag-setting"
            className="jp-Eodag-tooltip"
            place="bottom"
            type="dark"
            effect="solid"
          />
        </button>
      </div>
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
          data-for="parameters-information"
          data-tip="Click to check queryable metadata in parameters documentation"
        >
          <CarbonInformation height="20" width="20" />
          <ReactTooltip
            id="parameters-information"
            className="jp-Eodag-tooltip"
            place="top"
            type="dark"
            effect="solid"
          />
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
                data-for="parameters-delete"
                data-tip="remove additionnal parameter"
              >
                <CarbonTrashCan height="20" width="20" />
                <ReactTooltip
                  id="parameters-delete"
                  className="jp-Eodag-tooltip"
                  place="top"
                  type="warning"
                  effect="solid"
                />
              </button>
              <button
                type="button"
                className="jp-EodagWidget-additionnalParameters-addbutton"
                onClick={() => append({ name: '', value: '' })}
                data-for="parameters-add"
                data-tip="add a new additionnal parameter"
              >
                <CarbonAddFilled height="20" width="20" />
                <ReactTooltip
                  id="parameters-add"
                  className="jp-Eodag-tooltip"
                  place="top"
                  type="dark"
                  effect="solid"
                />
              </button>
            </section>
          </div>
        );
      })}
    </div>
  );
};
