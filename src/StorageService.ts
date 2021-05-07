/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import { FormDTO, Geometry } from './types';

class StorageService {
  /**
   * Key used to store geometry in storage
   */
  static GEOMETRY = 'eodag_geometry';

  /**
   * Key used to store form values in storage
   */
  static FORM_VALUES = 'eodag_form_values';

  isGeometryDefined() {
    return !!this.getGeometry();
  }

  setGeometry(geometry: Geometry) {
    geometry = geometry === undefined ? null : geometry;
    sessionStorage.setItem(StorageService.GEOMETRY, JSON.stringify(geometry));
  }

  getGeometry(): Geometry {
    const geometry = sessionStorage.getItem(StorageService.GEOMETRY);
    if (geometry) {
      return JSON.parse(geometry);
    }
  }

  setFormValues({ productType, startDate, endDate, cloud }: FormDTO) {
    sessionStorage.setItem(
      StorageService.FORM_VALUES,
      JSON.stringify({
        productType,
        startDate,
        endDate,
        cloud
      })
    );
  }

  getFormValues(): FormDTO {
    const reviver = (key: string, value: string | number | Date) => {
      const dateKeys = ['startDate', 'endDate'];
      if (dateKeys.includes(key)) {
        return new Date(value);
      }
      return value;
    };

    const formValues = sessionStorage.getItem(StorageService.FORM_VALUES);
    if (formValues) {
      return <FormDTO>JSON.parse(formValues, reviver);
    }
    return {
      productType: null,
      startDate: null,
      endDate: null,
      cloud: null
    };
  }
}

export default new StorageService();
