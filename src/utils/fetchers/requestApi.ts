import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { EODAG_SERVER_ADDRESS } from '../../config/config';

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
  const settings = ServerConnection.makeSettings();
  const requestUrl = URLExt.join(
    settings.baseUrl,
    EODAG_SERVER_ADDRESS,
    endPoint
  );

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(requestUrl, init, settings);
  } catch (error) {
    if (error instanceof Error) {
      throw {
        name: 'Network Error',
        message: error.message,
        details: 'Unable to reach the server.'
      };
    } else {
      throw {
        name: 'Unknown Error',
        message: 'An unexpected error occurred during the request.',
        details: ''
      };
    }
  }

  const rawText = await response.text();
  let data: any = rawText;

  if (rawText.length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      // Invalid JSON: log for devs, but continue using raw text
      console.error('Invalid JSON response body.', response);
    }
  }

  if (!response.ok) {
    // Construction de l’erreur dans le format attendu
    throw {
      name: `API Error (${response.status})`,
      message:
        typeof data === 'string' ? data : data?.error || 'Unknown server error',
      details: data?.details || ''
    };
  }

  return data;
}
