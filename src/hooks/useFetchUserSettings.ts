import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { EODAG_SERVER_ADDRESS } from '../config/config';
import { showErrorMessage } from '@jupyterlab/apputils';

export const serverSettings = ServerConnection.makeSettings();
export const eodagServer = URLExt.join(
  serverSettings.baseUrl,
  EODAG_SERVER_ADDRESS
);

export const useFetchUserSettings = async () => {
  try {
    const response = await fetch(URLExt.join(eodagServer, 'reload'), {
      credentials: 'same-origin'
    });
    if (response.status >= 400) {
      throw new Error('Bad response from server');
    }
  } catch (error) {
    showErrorMessage(
      'EODAG server error',
      `Unable to contact the EODAG server. Are you sure the address is ${eodagServer}/ ?`
    );
  }
};
