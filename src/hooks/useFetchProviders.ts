import { useCallback, useState } from 'react';
import { IOptionTypeBase } from '../components/formComponent/formComponent';
import { fetchData } from '../utils/fetchers/fetchData';

interface IProvider {
  provider: string;
  description: string;
}

export const useFetchProviders = () => {
  const [fetchProvidersLoading, setFetchProviderLoading] =
    useState<boolean>(false);

  const fetchProviders = useCallback(
    async (
      productTypeValue: string | null | undefined,
      inputValue?: string
    ): Promise<IOptionTypeBase[]> => {
      setFetchProviderLoading(true);
      let queryParams = 'providers?';

      if (inputValue) {
        queryParams += `keywords=${inputValue}`;
      }
      if (productTypeValue) {
        queryParams += queryParams.includes('keywords') ? '&' : '';
        queryParams += `product_type=${productTypeValue}`;
      }

      try {
        return await fetchData<IProvider>({
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
      } finally {
        setFetchProviderLoading(false);
      }
    },
    []
  );

  return { fetchProviders, fetchProvidersLoading };
};
