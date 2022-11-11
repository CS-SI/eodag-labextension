/**
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

export interface IProps {
  handleShowFeature: any;
  saveFormValues: (formValue: IFormInput) => void;
  handleGenerateQuery: any;
}
export interface IOptionTypeBase {
  [key: string]: any;
}

export interface SVGProps {
  strokeColor?: string;
  strokeWidth?: string;
  strokeWidth2?: string;
  strokeWidth3?: string;
  strokeFill?: string;
  fillColor?: string;
  fillColor2?: string;
  fillColor3?: string;
  fillColor4?: string;
  fillColor5?: string;
  fillColor6?: string;
  fillColor7?: string;
  imageWidth?: string;
  imageHeight?: string;
  width?: string;
  height?: string;
  rotateCenter?: number;
  className?: string;
  className2?: string;
  className3?: string;
  className4?: string;
  className5?: string;
}

const CodiconOpenPreview = (props: SVGProps) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 16" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3 1h11l1 1v5.3a3.21 3.21 0 0 0-1-.3V2H9v10.88L7.88 14H3l-1-1V2l1-1zm0 12h5V2H3v11zm10.379-4.998a2.53 2.53 0 0 0-1.19.348h-.03a2.51 2.51 0 0 0-.799 3.53L9 14.23l.71.71l2.35-2.36c.325.22.7.358 1.09.4a2.47 2.47 0 0 0 1.14-.13a2.51 2.51 0 0 0 1-.63a2.46 2.46 0 0 0 .58-1a2.63 2.63 0 0 0 .07-1.15a2.53 2.53 0 0 0-1.35-1.81a2.53 2.53 0 0 0-1.211-.258zm.24 3.992a1.5 1.5 0 0 1-.979-.244a1.55 1.55 0 0 1-.56-.68a1.49 1.49 0 0 1-.08-.86a1.49 1.49 0 0 1 1.18-1.18a1.49 1.49 0 0 1 .86.08c.276.117.512.311.68.56a1.5 1.5 0 0 1-1.1 2.324z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

const PhFileCode = (props: SVGProps) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 256 256" {...props}>
      <path
        fill="currentColor"
        d="M216 88a7.7 7.7 0 0 0-2.4-5.7l-55.9-56A8.1 8.1 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88Zm-56-36.7L188.7 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48v120Zm-22.3-69.7a8.1 8.1 0 0 1 0 11.4l-24 24a8.5 8.5 0 0 1-5.7 2.3a8.3 8.3 0 0 1-5.7-2.3a8.1 8.1 0 0 1 0-11.4l18.4-18.3l-18.4-18.3a8.1 8.1 0 0 1 11.4-11.4Zm-64-12.6L95.3 152l18.4 18.3a8.1 8.1 0 0 1 0 11.4a8.5 8.5 0 0 1-5.7 2.3a8.3 8.3 0 0 1-5.7-2.3l-24-24a8.1 8.1 0 0 1 0-11.4l24-24a8.1 8.1 0 0 1 11.4 11.4Z"
      ></path>
    </svg>
  );
};
const CarbonTrashCan = (props: SVGProps) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 32 32" {...props}>
      <path fill="currentColor" d="M12 12h2v12h-2zm6 0h2v12h-2z"></path>
      <path
        fill="currentColor"
        d="M4 6v2h2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8h2V6zm4 22V8h16v20zm4-26h8v2h-8z"
      ></path>
    </svg>
  );
};

const CarbonCalendarAddAlt = (props: SVGProps) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 32 32" {...props}>
      <path fill="currentColor" d="M26 21h-3v-3h-2v3h-3v2h3v3h2v-3h3z"></path>
      <path
        fill="currentColor"
        d="M22 30c-4.4 0-8-3.6-8-8s3.6-8 8-8s8 3.6 8 8s-3.6 8-8 8zm0-14c-3.3 0-6 2.7-6 6s2.7 6 6 6s6-2.7 6-6s-2.7-6-6-6z"
      ></path>
      <path
        fill="currentColor"
        d="M28 6c0-1.1-.9-2-2-2h-4V2h-2v2h-8V2h-2v2H6c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h6v-2H6V6h4v2h2V6h8v2h2V6h4v6h2V6z"
      ></path>
    </svg>
  );
};

const CarbonAddFilled = (props: SVGProps) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 32 32" {...props}>
      <path
        fill="currentColor"
        d="M16 2A14.172 14.172 0 0 0 2 16a14.172 14.172 0 0 0 14 14a14.172 14.172 0 0 0 14-14A14.172 14.172 0 0 0 16 2Zm8 15h-7v7h-2v-7H8v-2h7V8h2v7h7Z"
      ></path>
      <path fill="none" d="M24 17h-7v7h-2v-7H8v-2h7V8h2v7h7v2z"></path>
    </svg>
  );
};

export const FormComponent: FC<IProps> = ({
  handleShowFeature,
  saveFormValues,
  handleGenerateQuery
}) => {
  const [productTypes, setProductTypes] = useState<IOptionTypeBase[]>();
  const defaultStartDate: Date = undefined;
  const defaultEndDate: Date = undefined;
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [cloud, setCloud] = useState(100);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [openModal, setOpenModal] = useState(true);

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
        handleShowFeature(featureCollection, openModal);
        if (!openModal) {
          handleGenerateQuery();
        }
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
              handleChange={(e: IOptionTypeBase | null) => onChange(e?.value)}
            />
          )}
        />
        {/* <fieldset> */}
        {/* <legend>Date range</legend> */}
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
                    placeholderText="Start"
                  />
                )}
              />
            </div>
            {/* <label htmlFor="endDate" className="jp-EodagWidget-input-name"> */}
            {/*   End */}
            {/* </label> */}
            <div className="jp-EodagWidget-input-wrapper">
              <CarbonCalendarAddAlt height="22" width="22" />
              <Controller
                name="endDate"
                control={control}
                rules={{ required: false }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
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
                      placeholderText="End"
                    />
                  </>
                )}
              />
            </div>
          </div>
        </div>
        {/* </fieldset> */}
        <label
          className={`jp-EodagWidget-input-name ${
            cloud === 100 ? 'jp-EodagWidget-input-name-line-through' : ''
          } `}
        >
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
        <Fields {...{ control, register }} />
      </div>
      <div className="jp-EodagWidget-form-buttons">
        <div className="jp-EodagWidget-form-buttons-wrapper">
          {isLoadingSearch ? (
            <div className="jp-EodagWidget-buttons">
              <button type="submit" color="primary" disabled={isLoadingSearch}>
                Searching...
              </button>
            </div>
          ) : (
            <>
              <div className="jp-EodagWidget-buttons">
                <button
                  type="submit"
                  color="primary"
                  disabled={isLoadingSearch}
                  onClick={() => setOpenModal(true)}
                >
                  <CodiconOpenPreview width="21" height="21" />
                  <p>
                    Preview
                    <br />
                    Results
                  </p>
                </button>
              </div>
              <div className="jp-EodagWidget-buttons">
                <button
                  type="submit"
                  color="primary"
                  disabled={isLoadingSearch}
                  onClick={() => setOpenModal(false)}
                >
                  <PhFileCode height="21" width="21" />
                  <p>
                    Generate
                    <br />
                    Code
                  </p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
};

// type ControlAddParams ={
//   additionnalParameters: { name: string; value: string }[];
// }
// type IFormInputControl = Control<ControlAddParams>
// type IFormInputRegister = UseFormRegister<ControlAddParams>

// type FormInputMethod = Pick<My,"control"|"register">
// Partial<UseFormReturn<IFormInput>>
const Fields = ({ control, register }: Partial<UseFormReturn<IFormInput>>) => {
  // @ts-ignore
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionnalParameters'
  });
  fields[0] = { name: '', value: '', id: '999' };
  console.log(fields);
  return (
    <div className="jp-EodagWidget-additionnalParameters">
      <label className="jp-EodagWidget-input-name">
        Additionnal Parameters
      </label>

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
                <CarbonTrashCan height="20" width="20" />
              </button>
              <button
                type="button"
                className="jp-EodagWidget-additionnalParameters-addbutton"
                onClick={() => append({ name: '', value: '' })}
              >
                <CarbonAddFilled height="20" width="20" />
              </button>
            </section>
          </div>
        );
      })}

      {/* <button */}
      {/*   type="button" */}
      {/*   className="jp-EodagWidget-additionnalParameters-addbutton" */}
      {/*   onClick={() => append({ name: '', value: '' })} */}
      {/* > */}
      {/*   <CarbonAdd height="18" width="18" /> */}
      {/*   <p>Add</p> */}
      {/* </button> */}
    </div>
  );
};
