import { showErrorMessage } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { map } from 'lodash';
import { IOptionTypeBase } from './../FormComponent';
import { EODAG_SERVER_ADRESS } from './../config';

const useFetchSuggestions = () => {
  const guessProductTypes = async (inputValue: string) => {
    console.log('01 inputValue', inputValue);
    const _serverSettings = ServerConnection.makeSettings();
    const _eodag_server = URLExt.join(
      _serverSettings.baseUrl,
      `${EODAG_SERVER_ADRESS}`
    );

    return fetch(
      URLExt.join(_eodag_server, `guess-product-type?keywords=${inputValue}`),
      {
        credentials: 'same-origin'
      }
    )
      .then(response => {
        if (response.status >= 400) {
          showErrorMessage(
            `Unable to contact the EODAG server. Are you sure the adress is ${_eodag_server}/ ?`,
            {}
          );
          throw new Error('Bad response from server');
        }
        return response.json();
      })
      .then(products => {
        const guessProductTypes = map(products, product => ({
          value: product.ID,
          label: product.ID,
          description: product.abstract
        }));
        return guessProductTypes;
      });
  };

  const loadSuggestions = (inputValue: string) =>
    new Promise<IOptionTypeBase[]>(resolve => {
      resolve(guessProductTypes(inputValue));
    });
  return loadSuggestions;
};

export { useFetchSuggestions };
