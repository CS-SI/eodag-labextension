/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
*/

import * as React from 'react';
import { showErrorMessage } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { map, has } from 'lodash'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'isomorphic-fetch';
import Autocomplete from './Autocomplete';
import { EODAG_SERVER_ADRESS } from './config'
import StorageService from './StorageService'
import SearchService from './SearchService'

export interface IProps {
  handleShowFeature: any,
}

export interface IState {
}

export default class FormComponent extends React.Component<IProps, IState> {

    state = {
      startDate: undefined,
      endDate: undefined,
      productType: undefined,
      productTypes: [],
      isLoadingSearch: false,
      cloud: 100,
    }
    
    componentDidMount() {
      // Fetch product types
      // @ts-ignore
      let _serverSettings = ServerConnection.makeSettings();
      let _eodag_server = URLExt.join(_serverSettings.baseUrl, `${EODAG_SERVER_ADRESS}`);
      fetch(URLExt.join(_eodag_server, 'product-types/'), {credentials: 'same-origin'}).then((response) => {
        if (response.status >= 400) {
          showErrorMessage(`Unable to contact the EODAG server. Are you sure the adress is ${_eodag_server}/ ?`, {})
          throw new Error("Bad response from server");
        }
        return response.json();
      })
      .then((products) => {
        const productTypes = map(products, product => ({
          value: product.ID,
          label: product.ID,
          description: product.abstract,
        }))
        this.setState({
          productTypes: productTypes,
        })
      })
      .catch(() => {
        showErrorMessage(`Unable to contact the EODAG server. Are you sure the adress is ${_eodag_server}/ ?`, {})
      })
    }
    handleSearch = () => {
      // Prevent user not having configure an extent to make the request
      if (!StorageService.isExtentDefined()) {
        showErrorMessage('You first need to set an extent on the map', {})
        return;
      }
      this.saveFormValues()
      this.setState({
        isLoadingSearch: true,
      })
      SearchService.search(1)
      .then((features) => {
        this.setState({
          isLoadingSearch: false
        })
        this.props.handleShowFeature(features)
      })
      .catch(() => {
        let _serverSettings = ServerConnection.makeSettings();
        let _eodag_server = URLExt.join(_serverSettings.baseUrl, `${EODAG_SERVER_ADRESS}`);
        showErrorMessage(`Unable to contact the EODAG server. Are you sure the adress is ${_eodag_server}/ ?`, {})
        this.setState({
          isLoadingSearch: false
        })
      })
    }
    handleChangeEndDate = (date) => {
      this.setState({
        endDate: date
      })
    }
    handleChangeStartDate = (date) => {
      this.setState({
        startDate: date
      })
    }
    handleChangeProductType = val => {
      let nextValue = undefined
      if (has(val,'value')) {
        nextValue = val.value
      }
      this.setState({
        productType: nextValue,
      });
    };

    handleChangeCloud = (event) => {
      this.setState({
        cloud: parseInt(event.target.value, 10)
      })
    }
    saveFormValues = () => {
      const { productType, startDate, endDate, cloud } = this.state
      StorageService.setFormValues(productType, SearchService.formatDate(startDate), SearchService.formatDate(endDate), cloud);
    }
    render() {
      const { productTypes, productType, startDate, endDate, cloud, isLoadingSearch } = this.state
      const isEndDateLowerThanStartDate = startDate instanceof Date && endDate instanceof Date && startDate.getTime() > endDate.getTime(); 
      const isSearchDisabled = !productType || isLoadingSearch;
      return (
        <div className="jp-EodagWidget-form">
          <Autocomplete 
            suggestions={productTypes}
            value={productType}
            handleChange={this.handleChangeProductType}
          />
          <div className="jp-EodagWidget-field">
            <label
              htmlFor="startDate"
              className="jp-EodagWidget-input-name"
            >
              Start date
            </label>
            <div className="jp-EodagWidget-input-wrapper">
              <DatePicker
                className="jp-EodagWidget-input"
                selected={this.state.startDate}
                onChange={this.handleChangeStartDate}
                dateFormat={"dd/MM/yyyy"}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          </div>

          <div className="jp-EodagWidget-field">
            <label
              htmlFor="startDate"
              className="jp-EodagWidget-input-name"
            >
              End date
            </label>
            <div className="jp-EodagWidget-input-wrapper">
              <DatePicker
                className="jp-EodagWidget-input"
                selected={this.state.endDate}
                onChange={this.handleChangeEndDate}
                dateFormat={"dd/MM/yyyy"}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
              { isEndDateLowerThanStartDate ? 
                (<div id="endDate-error-text">End date must be after start date</div>)
                : null
              }
            </div>
          </div>
          <div className="jp-EodagWidget-field">
            <label
              htmlFor="cloud"
              className="jp-EodagWidget-input-name"
            >
              Max cloud cover {cloud}%
            </label>
            <div className="jp-EodagWidget-slider">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={cloud} 
                aria-labelledby="cloud"
                onChange={this.handleChangeCloud} 
              />
            </div>
          </div>
          <div className="jp-EodagWidget-buttons">
            <button
              color="primary" 
              onClick={this.handleSearch}
              disabled={isSearchDisabled}
            >
              {isLoadingSearch ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      );
    }
}
