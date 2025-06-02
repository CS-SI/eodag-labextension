import { useCallback, useState } from 'react';
import { IFeature, IFeatures } from 'types';
import { find } from 'lodash';

interface IUseMapFeaturesProps {
  features: IFeatures | null;
}

export const useMapFeatures = ({ features }: IUseMapFeaturesProps) => {
  const [highlightFeature, setHighlightFeature] = useState<IFeature | null>(
    null
  );
  const [highlightOnTableFeature, setHighlightOnTableFeature] =
    useState<IFeature | null>(null);
  const [zoomFeature, setZoomFeature] = useState<IFeature | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<IFeature | null>(null);

  const getFeature = useCallback(
    (productId: string): IFeature | null => {
      if (!features) {
        return null;
      }
      const featureToFind = find(
        features.features,
        feature => feature.id === productId
      );
      if (featureToFind) {
        return featureToFind;
      }
      return null;
    },
    [features]
  );

  const handleClickFeature = (productId: string | null) => {
    if (!productId) {
      return setSelectedFeature(null);
    } else {
      const feature = getFeature(productId);
      if (!feature) {
        return;
      }
      setZoomFeature(feature);
      setSelectedFeature(feature);
    }
  };

  const handleHoverMapFeature = (productId: string | null) => {
    if (productId === null) {
      return setHighlightOnTableFeature(null);
    } else {
      const feature = getFeature(productId);
      if (!feature) {
        return;
      }
      setHighlightOnTableFeature(feature);
    }
  };

  const handleHoverTableFeature = (productId: string | null) => {
    if (!productId) {
      return setHighlightFeature(null);
    } else {
      const feature = getFeature(productId);
      if (!feature) {
        return;
      }
      setHighlightFeature(feature);
    }
  };

  const handleZoomFeature = (productId: string) => {
    const feature = getFeature(productId);
    if (!feature) {
      return null;
    }
    setZoomFeature(feature);
  };

  const resetSelectedFeature = () => {
    setSelectedFeature(null);
  };

  return {
    highlightFeature,
    highlightOnTableFeature,
    zoomFeature,
    selectedFeature,
    handleZoomFeature,
    handleHoverMapFeature,
    handleHoverTableFeature,
    handleClickFeature,
    resetSelectedFeature
  };
};
