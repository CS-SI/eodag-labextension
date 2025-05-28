import { useState } from 'react';
import SearchService from '../utils/searchService';
import { concat, get } from 'lodash';

interface IProps {
  features: any;
  formValues: any;
  setFeatures: (features: any) => void;
}

export const useVirtualizedList = ({
  features,
  formValues,
  setFeatures
}: IProps) => {
  const [searching, setSearching] = useState(false);

  const handleRetrieveMoreFeature = async () => {
    setSearching(true);
    return SearchService.search(
      get(features, 'properties.page', 1) + 1,
      formValues
    )
      .then(results => {
        const featureList = concat(
          get(features, 'features', []),
          results.features
        );
        setSearching(false);
        setFeatures({
          ...results,
          features: featureList
        });
      })
      .catch(() => {
        setSearching(false);
      });
  };

  return {
    isRetrievingMoreFeature: searching,
    handleRetrieveMoreFeature
  };
};
