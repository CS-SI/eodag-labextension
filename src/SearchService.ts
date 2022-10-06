/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import 'react-datepicker/dist/react-datepicker.css';
import 'isomorphic-fetch';
import { EODAG_SERVER_ADRESS } from './config';
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { formatDate } from './utils';
import { IFormInput, ISearchParameters } from './types';
import _ from 'lodash';

class SearchService {
  /**
   * @param page The page to fetch
   * @returns the URL to fetch from the EODAG server to get products
   */
  getSearchURL(productType: string) {
    const _serverSettings = ServerConnection.makeSettings();
    const _eodag_server = URLExt.join(
      _serverSettings.baseUrl,
      `${EODAG_SERVER_ADRESS}`
    );
    return URLExt.join(_eodag_server, `${productType}`);
  }

  /**
   * Contact the EODAG server to retrieve products
   * @param page The page to fetch
   * @param formValues parameters to pass to EODAG search
   * @return a promise that will receive features
   */
  search(page = 1, formValues: IFormInput) {
    const url = this.getSearchURL(formValues.productType);
    let parameters: ISearchParameters = {
      dtstart: formValues.startDate
        ? formatDate(formValues.startDate)
        : undefined,
      dtend: formValues.endDate ? formatDate(formValues.endDate) : undefined,
      cloudCover: formValues.cloud < 100 ? formValues.cloud : undefined,
      page: page,
      geom: formValues.geometry
    };

    if (formValues.additionnalParameters) {
      parameters = _.extend(
        parameters,
        _.fromPairs(
          formValues.additionnalParameters
            .filter(({ name, value }) => name !== '' && value !== '')
            .map(({ name, value }) => [name, value])
        )
      );
    }

    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    // Set cross-site cookie header
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

    return fetch(request).then(async response => {
      if (!response.ok) {
        const msg = await response.json();
        throw new Error(`${msg.error}`);
      }
      return response.json();
    });
  }

  /**
   * Get a cookie from the document.
   */
  getCookie(name: string): string | undefined {
    // From http://www.tornadoweb.org/en/stable/guide/security.html
    const matches = document.cookie.match('\\b' + name + '=([^;]*)\\b');
    return matches?.[1];
  }
}

export default new SearchService();
