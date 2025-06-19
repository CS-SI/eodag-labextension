import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { EODAG_SERVER_ADDRESS } from '../../config/config';
import { IOptionTypeBase } from '../../components/formComponent/formComponent';
import { showCustomErrorDialog } from '../../components/customErrorDialog/customErrorDialog';
import { ICustomError } from '../../types';

interface IFetchDataProps<T> {
  queryParams: string;
  onSuccess: (data: T[]) => Promise<IOptionTypeBase[]>;
}

export const fetchData = async <T>({
  queryParams,
  onSuccess
}: IFetchDataProps<T>): Promise<IOptionTypeBase[]> => {
  const serverSettings = ServerConnection.makeSettings();
  const eodagServer = URLExt.join(serverSettings.baseUrl, EODAG_SERVER_ADDRESS);

  try {
    const response = await fetch(URLExt.join(eodagServer, queryParams), {
      credentials: 'same-origin'
    });

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');

    let responseBody: any;
    if (isJson) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (!response.ok) {
      throw {
        name: '',
        title: responseBody?.error || 'Bad response from server',
        details: responseBody?.details || ''
      };
    }

    return onSuccess(responseBody);
  } catch (error: unknown) {
    const typedError = error as ICustomError;
    const handler = queryParams.split('?')[0];
    const title = `EODAG Labextension - ${handler} error`;
    await showCustomErrorDialog(typedError, title);
    return Promise.reject(typedError);
  }
};
