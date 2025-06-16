import { useCallback, useState } from 'react';
import { IOptionTypeBase } from '../components/formComponent/formComponent';
import { fetchData } from '../utils/fetchers/fetchData';

interface IProduct {
  ID: string;
  title: string;
}

export const useFetchProducts = () => {
  const [fetchProductLoading, setFetchProductLoading] = useState(false);

  const fetchProducts = useCallback(
    async (
      providerValue: string | null | undefined,
      inputValue?: string
    ): Promise<IOptionTypeBase[]> => {
      setFetchProductLoading(true);
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
      }).finally(() => {
        setFetchProductLoading(false);
      });
    },
    []
  );

  return { fetchProducts, fetchProductLoading };
};
