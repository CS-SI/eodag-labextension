import { showErrorMessage } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { EODAG_SERVER_ADRESS } from './../config';
import {
  IOptionTypeBase,
  IProduct,
  IProvider
} from './../formComponent/FormComponent';

interface IFetchDataProps<T> {
  queryParams: string;
  onSuccess: (data: T[]) => Promise<IOptionTypeBase[]>;
}

const fetchData = async <T>({
  queryParams,
  onSuccess
}: IFetchDataProps<T>): Promise<IOptionTypeBase[]> => {
  const serverSettings = ServerConnection.makeSettings();
  const eodagServer = URLExt.join(serverSettings.baseUrl, EODAG_SERVER_ADRESS);

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
      `Unable to contact the EODAG server. Are you sure the address is ${eodagServer}/ ?`,
    );
    return Promise.reject(error);
  }
};

const useFetchProduct = () => {
  const fetchProduct = async (
    providerValue: string | null,
    inputValue?: string
  ): Promise<IOptionTypeBase[]> => {
    let queryParams = 'guess-product-type?';

    if (inputValue) {
      queryParams += `keywords=${inputValue}`;
    }

    if (providerValue) {
      queryParams += queryParams.includes('keywords') ? '&' : '';
      queryParams += `provider=${providerValue}`;
    }
    return fetchData<IProduct>({
      queryParams,
      onSuccess: data =>
        Promise.resolve(
          data.map((d: IProduct) => ({
            value: d.ID,
            label: d.ID,
            description: d.title
          }))
        )
    });
  };

  return fetchProduct;
};

const useFetchProvider = () => {
  const fetchProvider = async (
    productTypeValue: string | null,
    inputValue?: string
  ): Promise<IOptionTypeBase[]> => {
    let queryParams = 'providers?';

    if (inputValue) {
      queryParams += `keywords=${inputValue}`;
    }
    if (productTypeValue) {
      queryParams += `product_type=${productTypeValue}`;
    }
    return fetchData<IProvider>({
      queryParams,
      onSuccess: data =>
        Promise.resolve(
          data.map((d: IProvider) => ({
            value: d.provider,
            label: d.provider,
            description: d.description
          }))
        )
    });
  };

  return fetchProvider;
};

const useFetchUserSettings = async () => {
  const serverSettings = ServerConnection.makeSettings();
  const eodagServer = URLExt.join(serverSettings.baseUrl, EODAG_SERVER_ADRESS);

  try {
    const response = await fetch(URLExt.join(eodagServer, 'reload'), {
      credentials: 'same-origin'
    });
    if (response.status >= 400) {
      throw new Error('Bad response from server');
    }
  } catch (error) {
    showErrorMessage(
      "EODAG server error",
      `Unable to contact the EODAG server. Are you sure the address is ${eodagServer}/ ?`
    );
  }
};

export { fetchData, useFetchProduct, useFetchProvider, useFetchUserSettings };
