import { requestAPI } from './requestApi';
import { IParameter, IQueryables } from '../../types';
import { showCustomErrorDialog } from '../../components/customErrorDialog/customErrorDialog';

export const fetchQueryables = async (
  provider: string | null,
  productType: string,
  filterParameters: { [key: string]: any } | undefined
): Promise<{
  properties: IParameter[];
  additionalProperties: boolean;
}> => {
  const params = new URLSearchParams({ productType });

  if (provider) {
    params.append('provider', provider);
  }

  if (filterParameters) {
    Object.entries(filterParameters).forEach(([key, value]) => {
      params.append(key, value ?? '');
    });
  }

  try {
    const queryables = (await requestAPI(
      `queryables?${params.toString()}`
    )) as IQueryables;

    if (!queryables.properties) {
      throw new Error('The response is missing the "properties" attribute.');
    }

    if (typeof queryables.additionalProperties !== 'boolean') {
      throw new Error(
        'The response is missing the "additionalProperties" attribute or it is not a boolean.'
      );
    }

    const excludedKeys = new Set([
      'productType',
      'bbox',
      'geom',
      'geometry',
      'startTimeFromAscendingNode',
      'completionTimeFromAscendingNode',
      'start_datetime',
      'end_datetime',
      'startdate',
      'enddate',
      'end'
    ]);

    const requiredSet = new Set(queryables.required || []);

    const properties = Object.entries(queryables.properties)
      .filter(([key]) => !excludedKeys.has(key))
      .map(([key, value]) => ({
        key,
        value,
        mandatory: requiredSet.has(key)
      }));

    return {
      properties,
      additionalProperties: queryables.additionalProperties
    };
  } catch (err: any) {
    const formattedError = {
      name: 'Fetch Queryables Error',
      title: err?.error ?? err?.message ?? 'Unknown error',
      details: err?.details ?? ''
    };

    await showCustomErrorDialog(
      formattedError,
      'EODAG Labextension - fetch queryables error'
    );
    throw formattedError;
  }
};
