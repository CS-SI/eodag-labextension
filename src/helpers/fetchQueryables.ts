import { requestAPI } from "../handler";
import { Queryables } from "../types";

export const fetchQueryables = async (
  provider: string | undefined,
  productType: string,
  filterParameters: { [key: string]: any } | undefined
): Promise<{
  properties: { [key: string]: any; },
  required: Set<string>,
  additionalProperties: boolean
}> => {
  const params = new URLSearchParams({ productType });

  if (provider) params.append('provider', provider);

  if (filterParameters) {
    Object.entries(filterParameters).forEach(([key, value]) => {
      params.append(key, value ?? "");
    });
  }

  const queryables = await requestAPI(`queryables?${params.toString()}`) as Queryables;


  if (!queryables.properties) {
    throw new Error('The response is missing the "properties" attribute.');
  }

  if (typeof queryables.additionalProperties !== 'boolean') {
    throw new Error(
      'The response is missing the "additionalProperties" attribute or it is not a boolean.'
    );
  }

  const filteredProperties: { [key: string]: any } = {};
  Object.entries(queryables.properties).forEach(([key, value]) => {
    if (!["productType", "startTimeFromAscendingNode", "completionTimeFromAscendingNode", "geom"].includes(key)) {
      filteredProperties[key] = value;
    }
  });

  const requiredSet = new Set(queryables.required || []);

  return {
    properties: filteredProperties,
    required: requiredSet,
    additionalProperties: queryables.additionalProperties,
  };
};
