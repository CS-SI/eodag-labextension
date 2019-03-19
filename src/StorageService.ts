import { isNull } from 'lodash'

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
  
  
  getExtent () {
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
  setExtent(extent) {
    sessionStorage.setItem(StorageService.EXTENT, JSON.stringify(extent));
  }

  isExtentDefined () {
    const extent = this.getExtent();
    return !isNull(extent.lonMin) && !isNull(extent.latMin) && !isNull(extent.lonMax) && !isNull(extent.latMax);
  }

  setFormValues(productType, startDate, endDate, cloud) {
    sessionStorage.setItem(StorageService.FORM_VALUES, JSON.stringify({
      productType,
      startDate,
      endDate,
      cloud
    }));
  }

  getFormValues() {
    const formValues = sessionStorage.getItem(StorageService.FORM_VALUES);
    if (formValues) {
      return JSON.parse(formValues);
    }
    return {
      productType: null,
      startDate: null,
      endDate: null,
      cloud: null,
    };
  }

  setZoom(zoom) {
    sessionStorage.setItem(StorageService.ZOOM, zoom);
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