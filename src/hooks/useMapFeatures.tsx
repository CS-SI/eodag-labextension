import { useState } from 'react';
import { IFeature } from 'types';

interface IUseMapFeaturesProps {
  getFeature: (productId: string) => IFeature | null;
  setDisplayFeature: (feature: IFeature | null) => void;
}

export const useMapFeatures = ({
  getFeature,
  setDisplayFeature
}: IUseMapFeaturesProps) => {
  const [highlightFeature, setHighlightFeature] = useState<IFeature | null>(
    null
  );
  const [highlightOnTableFeature, setHighlightOnTableFeature] =
    useState<IFeature | null>(null);
  const [zoomFeature, setZoomFeature] = useState<IFeature | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<IFeature | null>(null);

  const handleClickFeature = (productId: string) => {
    if (!productId) {
      return setSelectedFeature(null);
    } else {
      const feature = getFeature(productId);
      if (!feature) {
        return;
      }
      setDisplayFeature(feature);
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

  return {
    highlightFeature,
    highlightOnTableFeature,
    zoomFeature,
    selectedFeature,
    handleZoomFeature,
    handleHoverMapFeature,
    handleHoverTableFeature,
    handleClickFeature
  };
};
