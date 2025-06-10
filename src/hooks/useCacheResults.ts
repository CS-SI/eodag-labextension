import { useEffect, useState } from 'react';
import { IFeatures, IFormInput } from 'types';
import { isEqual } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

interface ICachedResults {
  formValues: IFormInput | undefined;
  results: IFeatures | null;
}

type ICachedResultsDictionary = Record<string, ICachedResults>;

export const useCacheResults = (
  formValues: IFormInput | undefined,
  features: IFeatures | null
) => {
  const [cachedResults, setCachedResults] = useState<ICachedResultsDictionary>(
    {}
  );

  useEffect(() => {
    console.log('cacheResults : ', cachedResults);
  }, [cachedResults]);

  useEffect(() => {
    if (!formValues || !features) {
      return;
    }

    let updated = false;
    const newCachedResults: ICachedResultsDictionary = { ...cachedResults };

    for (const [id, cachedEntry] of Object.entries(newCachedResults)) {
      if (isEqual(cachedEntry.formValues, formValues)) {
        // Fusion shallow des features (objets)
        const mergedFeatures = {
          ...cachedEntry.results,
          ...features
        };

        // Si les features ont changé, on met à jour
        if (!isEqual(mergedFeatures, cachedEntry.results)) {
          newCachedResults[id] = {
            formValues,
            results: mergedFeatures
          };
          updated = true;
        }
        break;
      }
    }

    if (!updated) {
      const newId = uuidv4();
      newCachedResults[newId] = {
        formValues,
        results: features
      };
      updated = true;
    }

    if (updated) {
      setCachedResults(newCachedResults);
    }
  }, [formValues, features]);

  return {
    cachedResults
  };
};
