import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { EODAG_SETTINGS_ADDRESS } from '../config/config';

export const useEodagSettings = () => {
  const getEodagSettings = async () => {
    const _serverSettings = ServerConnection.makeSettings();
    const _eodag_settings = URLExt.join(
      _serverSettings.baseUrl,
      _serverSettings.appUrl,
      `${EODAG_SETTINGS_ADDRESS}`
    );
    return fetch(URLExt.join(_eodag_settings), {
      credentials: 'same-origin'
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Bad response from server');
        }
        return res.json();
      })
      .then(data => {
        return data.settings;
      });
  };

  return {
    getEodagSettings
  };
};
