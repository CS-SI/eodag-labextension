import * as React from 'react';
import { Button, FormControl, InputLabel, Input, FormHelperText } from '@material-ui/core';
import { Slider } from '@material-ui/lab';
import { showErrorMessage } from '@jupyterlab/apputils';
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
      fetch(`${EODAG_SERVER_ADRESS}/product-types/`, {credentials: 'same-origin'}).then((response) => {
        if (response.status >= 400) {
          showErrorMessage(`Unable to contact the EODAG server. Are you sure the adress is ${EODAG_SERVER_ADRESS} ?`, {})
          throw new Error("Bad response from server");
        }
        return response.json();
      })
      .then((products) => {
        const productTypes = map(products, product => ({
          value: product.ID,
          label: product.ID,
          description: product.desc,
        }))
        this.setState({
          productTypes: productTypes,
        })
      })
      .catch(() => {
        showErrorMessage(`Unable to contact the EODAG server. Are you sure the adress is ${EODAG_SERVER_ADRESS} ?`, {})
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
        showErrorMessage(`Unable to contact the EODAG server. Are you sure the adress is ${EODAG_SERVER_ADRESS} ?`, {})
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

    handleChangeCloud = (event, value) => {
      this.setState({
        cloud: parseInt(value, 10)
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
          <FormControl className="jp-EodagWidget-field">
            <InputLabel
              htmlFor="startDate"
              className="jp-EodagWidget-input-name"
            >
              Start date
            </InputLabel>

            <Input
              onChange={this.handleChangeStartDate}
              inputComponent={DatePicker}
              inputProps={{
                dateFormat: "dd/MM/yyyy",
                selected: startDate,
                showMonthDropdown: true,
                showYearDropdown: true,
              }}
            />
          </FormControl>


          <FormControl className="jp-EodagWidget-field">
            <InputLabel
              htmlFor="startDate"
              className="jp-EodagWidget-input-name"
            >
              End date
            </InputLabel>
            <Input
              onChange={this.handleChangeEndDate}
              inputComponent={DatePicker}
              aria-describedby="endDate-error-text"
              inputProps={{
                dateFormat: "dd/MM/yyyy",
                selected: endDate,
                showMonthDropdown: true,
                showYearDropdown: true,
              }}
            />
            { isEndDateLowerThanStartDate ? 
              (<FormHelperText id="endDate-error-text" error>End date must be after start date</FormHelperText>)
              : null
            }
          </FormControl>
          <FormControl className="jp-EodagWidget-field">
            <InputLabel
              htmlFor="cloud"
              className="jp-EodagWidget-input-name"
            >
              Max cloud cover {cloud}%
            </InputLabel>
            <div className="jp-EodagWidget-slider">
              <Slider
                value={cloud}
                aria-labelledby="cloud"
                onChange={this.handleChangeCloud}
              />
            </div>
          </FormControl>
          <div className="jp-EodagWidget-buttons">
            <Button
              color="primary" 
              onClick={this.handleSearch}
              disabled={isSearchDisabled}
            >
              {isLoadingSearch ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      );
    }
}
