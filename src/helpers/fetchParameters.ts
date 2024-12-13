import { requestAPI } from "../handler";
import { Queryables, Parameter, QueryablesResult } from "../types";

export const fetchQueryables = async (
  provider: string | undefined,
  productType: string,
  additionalParameters: { [key: string]: any } | undefined
): Promise<QueryablesResult> => {
  const params = new URLSearchParams({
    productType: productType
  });

  if (provider) {
    params.append('provider', provider);
  }

  if (additionalParameters) {
    Object.keys(additionalParameters).forEach(key => {
      const value = additionalParameters[key];
      params.append(key, value !== undefined ? value : "");
    });
  }

  const url = `queryables?${params.toString()}`;

  const queryables = await requestAPI(url) as Queryables;


  if (!queryables.properties) {
    throw new Error('The response is missing the "properties" attribute.');
  }

  if (typeof queryables.additionalProperties !== 'boolean') {
    throw new Error(
      'The response is missing the "additionalProperties" attribute or it is not a boolean.'
    );
  }

  const requiredKeys = queryables.required || [];


  const propertiesArray = Object.entries(queryables.properties)
    .map(([key, value]) => ({
      key,
      value,
      mandatory: requiredKeys.includes(key),
    }))
    .filter(
      ({ key }) => ![
        "productType",
        "startTimeFromAscendingNode",
        "completionTimeFromAscendingNode",
        "geom"
      ].includes(key)
    ) as Parameter[];

  return { parameters: propertiesArray, additionalParameters: queryables.additionalProperties };
};
