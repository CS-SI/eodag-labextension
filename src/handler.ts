/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import { URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';
import { EODAG_SERVER_ADRESS } from './config';

/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
  endPoint = '',
  init: RequestInit = {}
): Promise<T> {
  // Make request to Jupyter API
  const settings = ServerConnection.makeSettings();
  const requestUrl = URLExt.join(
    settings.baseUrl,
    EODAG_SERVER_ADRESS, // API Namespace
    endPoint
  );

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(requestUrl, init, settings);
  } catch (error) {
    if (error instanceof Error) {
      // Now TypeScript knows `error` is of type `Error`
      throw new ServerConnection.NetworkError(error as TypeError);
    } else {
      throw Error("unknown error")
    }
  }

  let data: any = await response.text();

  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.error('Not a JSON response body.', response);
    }
  }

  if (!response.ok) {
    throw new ServerConnection.ResponseError(
      response,
      JSON.stringify(data.message || data)
    );
  }

  return data;
}
