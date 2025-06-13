import { showErrorMessage } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { EODAG_SERVER_ADDRESS } from '../../config/config';
import { IOptionTypeBase } from '../../components/formComponent/formComponent';

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
    if (response.status >= 400) {
      throw new Error('Bad response from server');
    }
    const data = await response.json();
    return onSuccess(data);
  } catch (error) {
    showErrorMessage(
      'EODAG server error',
      `Unable to contact the EODAG server. Are you sure the address is ${eodagServer}/ ?`
    );
    return Promise.reject(error);
  }
};
