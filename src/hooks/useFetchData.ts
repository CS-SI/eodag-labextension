import { showErrorMessage } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

import { EODAG_SERVER_ADRESS } from './../config';

interface IUseFetchDataProps<T> {
  queryParams: string;
  onSuccess: (data: T[]) => void;
}

const useFetchData = <T>({
  queryParams,
  onSuccess
}: IUseFetchDataProps<T>): void => {
  const fetchData = async () => {
    const serverSettings = ServerConnection.makeSettings();
    const eodagServer = URLExt.join(
      serverSettings.baseUrl,
      `${EODAG_SERVER_ADRESS}`
    );
    // const slug = queryParams ? `${queryParams}/` : '';

    try {
      const response = await fetch(URLExt.join(eodagServer, queryParams), {
        credentials: 'same-origin'
      });
      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
      const data = await response.json();
      onSuccess(data);
    } catch (error) {
      showErrorMessage(
        `Unable to contact the EODAG server. Are you sure the address is ${eodagServer}/ ?`,
        {}
      );
    }
  };

  fetchData();
};

export { useFetchData };
