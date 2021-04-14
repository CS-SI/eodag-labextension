/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
*/

import { isNull } from 'lodash'
import { Extent, SearchDTO } from './types';

class StorageService {
  /**
   * Key used to store extent in storage
   */
  static EXTENT = 'eodag_extent';
  
  /**
   * Key used to store form values in storage
   */
  static FORM_VALUES = 'eodag_form_values';
  
  /**
   * Key used to store the zoom in storage
   */
  static ZOOM = 'eodag_zoom';
  
  
  getExtent () : Extent {
    const extent = sessionStorage.getItem(StorageService.EXTENT);
    if (extent) {
      return JSON.parse(extent);
    }
    return {
      lonMin: null,
      latMin: null,
      lonMax: null,
      latMax: null
    };
  }

  /**
   * Save the extent in the session storage (object removed when browser closed)
   */
  setExtent(extent: Extent) {
    sessionStorage.setItem(StorageService.EXTENT, JSON.stringify(extent));
  }

  isExtentDefined () {
    const extent = this.getExtent();
    return !isNull(extent.lonMin) && !isNull(extent.latMin) && !isNull(extent.lonMax) && !isNull(extent.latMax);
  }

  setFormValues({productType, startDate, endDate, cloud}: SearchDTO) {
    sessionStorage.setItem(StorageService.FORM_VALUES, JSON.stringify({
      productType,
      startDate,
      endDate,
      cloud
    }));
  }

  getFormValues() {
    const  reviver = (key, value) => {
      const dateKeys = ["startDate", "endDate"];
      if (dateKeys.includes(key)) {
        return new Date(value);
      }
      return value;
    }

    const formValues = sessionStorage.getItem(StorageService.FORM_VALUES);
    if (formValues) {
      return <SearchDTO>JSON.parse(formValues, reviver);
    }
    return {
      productType: null,
      startDate: null,
      endDate: null,
      cloud: null,
    };
  }

  setZoom(zoom: number) {
    sessionStorage.setItem(StorageService.ZOOM, zoom.toString(10));
  }

  getZoom() {
    const zoom = sessionStorage.getItem(StorageService.ZOOM);
    if (zoom) {
      return parseInt(zoom, 10);
    }
    return 8;
  }
}

export default new StorageService()