/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
*/

import "react-datepicker/dist/react-datepicker.css";
import 'isomorphic-fetch';
import { EODAG_SERVER_ADRESS } from './config'
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import StorageService from './StorageService'
import { formatDate } from "./utils";

class SearchService {
  /**
   * This methods internaly uses the StorageService to retrieve form data
   * @param page The page to fetch
   * @returns the URL to fetch from the EODAG server to get products
   */
  getSearchURL (page = 1) {
    const { productType, startDate, endDate, cloud } = StorageService.getFormValues();
    const { lonMin, latMin, lonMax, latMax } = StorageService.getExtent();
    let _serverSettings = ServerConnection.makeSettings();
    let _eodag_server = URLExt.join(_serverSettings.baseUrl, `${EODAG_SERVER_ADRESS}`);
    let _searchParams = `?box=${lonMin},${latMin},${lonMax},${latMax}&cloudCover=${cloud}&page=${page}`;
    let url = URLExt.join(_eodag_server, `${productType}`, _searchParams);
    if (startDate) {
      url += `&dtstart=${formatDate(startDate)}`
    }
    if (endDate) {
      url += `&dtend=${formatDate(endDate)}`
    }
    return url
  }

  /**
   * Contact the EODAG server to retrieve products
   * This methods internaly uses the StorageService to retrieve form data
   * @param page The page to fetch
   * @return a promise that will receive features
   */
  search(page = 1) {
    const url = this.getSearchURL(page)
    return fetch(url, {credentials: 'same-origin'}).then((response) => {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }
      return response.json();
    })
  }
}

export default new SearchService();