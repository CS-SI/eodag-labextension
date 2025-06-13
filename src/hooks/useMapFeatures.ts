import { useCallback, useState } from 'react';
import { IFeatures, IProduct } from 'types';
import { find } from 'lodash';

interface IUseMapFeaturesProps {
  features: IFeatures | null;
}

export const useMapFeatures = ({ features }: IUseMapFeaturesProps) => {
  const [hoveredFeatureId, setHoveredFeatureId] = useState<
    IProduct['id'] | null
  >(null);
  const [selectedFeature, setSelectedFeature] = useState<IProduct | null>(null);
  const [zoomFeature, setZoomFeature] = useState<IProduct | null>(null);

  const getFeature = useCallback(
    (productId: IProduct['id']): IProduct | null => {
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

  const setHoveredFeature = (productId: IProduct['id'] | null) => {
    if (productId === null) {
      return setHoveredFeatureId(null);
    } else {
      const feature = getFeature(productId);
      if (!feature) {
        return;
      }
      setHoveredFeatureId(productId);
    }
  };

  const handleClickFeature = (productId: IProduct['id'] | null) => {
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

  const handleZoomFeature = (productId: IProduct['id']) => {
    const feature = getFeature(productId);
    if (!feature) {
      return null;
    }
    setZoomFeature(feature);
  };

  const resetSelectedFeature = () => {
    setHoveredFeatureId(null);
    setSelectedFeature(null);
  };

  return {
    zoomFeature,
    handleZoomFeature,
    hoveredFeatureId,
    setHoveredFeature,
    selectedFeature,
    handleClickFeature,
    resetSelectedFeature
  };
};
