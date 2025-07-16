/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import 'react-datepicker/dist/react-datepicker.css';
import 'isomorphic-fetch';
import { EODAG_SERVER_ADDRESS } from '../config/config';
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { IFormInput, ISearchParameters } from '../types';
import _, { isUndefined } from 'lodash';
import { useEodagSettings } from '../hooks/useEodagSettings';

const formatDate = (date: Date): string => {
  const local = new Date(date);
  local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};

class SearchService {
  /**
   * @returns the URL to fetch from the EODAG server to get products
   * @param productType
   */
  getSearchURL(productType: string) {
    const _serverSettings = ServerConnection.makeSettings();
    const _eodag_server = URLExt.join(
      _serverSettings.baseUrl,
      `${EODAG_SERVER_ADDRESS}`
    );
    return URLExt.join(_eodag_server, `${productType}`);
  }

  /**
   * Contact the EODAG server to retrieve products
   * @param page The page to fetch
   * @param formValues parameters to pass to EODAG search
   * @return a promise that will receive features
   */
  async search(page = 1, formValues: IFormInput | undefined) {
    if (isUndefined(formValues)) {
      throw new Error('Input undefined');
    }
    const url = this.getSearchURL(formValues.productType ?? '');
    let parameters: ISearchParameters = {
      dtstart: formValues.startDate
        ? formatDate(formValues.startDate)
        : undefined,
      dtend: formValues.endDate ? formatDate(formValues.endDate) : undefined,
      page: page,
      geom: formValues.geometry,
      provider: formValues.provider
    };

    if (formValues.additionalParameters) {
      parameters = _.extend(
        parameters,
        _.fromPairs(
          formValues.additionalParameters
            .filter(({ name, value }) => name !== '' && value !== '')
            .map(({ name, value }) => [name, value])
        )
      );
    }

    // Map any extra dynamic properties (excluding already handled ones)
    const excludedKeys = new Set([
      'startDate',
      'endDate',
      'productType',
      'geometry',
      'provider',
      'additionalParameters'
    ]);

    Object.keys(formValues).forEach(key => {
      if (!excludedKeys.has(key)) {
        parameters[key] = formValues[key];
      }
    });

    // count
    const { getEodagSettings } = useEodagSettings();
    const settings = await getEodagSettings();
    parameters.count = settings.searchCount;

    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    // Set a cross-site cookie header
    if (typeof document !== 'undefined' && document?.cookie) {
      const xsrfToken = this.getCookie('_xsrf');
      if (xsrfToken !== undefined) {
        headers.append('X-XSRFToken', xsrfToken);
      }
    }

    const request = new Request(url, {
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: headers
    });

    const response = await fetch(request);
    if (!response.ok) {
      const msg = await response.json();
      throw {
        error: msg.error ?? 'Unknown error',
        details: msg.details ?? ''
      };
    }
    return await response.json();
  }

  // Get a cookie from the document.
  getCookie(name: string): string | undefined {
    // From http://www.tornadoweb.org/en/stable/guide/security.html
    const matches = document.cookie.match('\\b' + name + '=([^;]*)\\b');
    return matches?.[1];
  }
}

export default new SearchService();
