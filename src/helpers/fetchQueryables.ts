import { requestAPI } from "../handler";
import { Parameter, Queryables } from "../types";

export const fetchQueryables = async (
  provider: string | null,
  productType: string,
  filterParameters: { [key: string]: any } | undefined
): Promise<{
  properties: Parameter[],
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

  // TODO: review the list of exclusion keys
  const excludedKeys = new Set([
    "productType",
    // geometry related keys because they are handled by the map
    "bbox",
    "geom",
    "geometry",
    // temporal keys because they are handled by the date picker
    "startTimeFromAscendingNode",
    "completionTimeFromAscendingNode",
    "start_datetime",
    "end_datetime",
    "startdate",
    "enddate",
    "end",
  ]);

  const requiredSet = new Set(queryables.required || []);

  const properties = Object.entries(queryables.properties)
    .filter(([key]) => !excludedKeys.has(key))
    .map(([key, value]) => ({
      key,
      value,
      mandatory: requiredSet.has(key),
    }));

  return {
    properties: properties,
    additionalProperties: queryables.additionalProperties,
  };
};
