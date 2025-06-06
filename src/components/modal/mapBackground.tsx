import React from 'react';
import { MapFeature } from '../map/mapFeature';
import { IFeatures, IProduct } from '../../types';

interface IMapBackgroundProps {
  features: IFeatures | null;
  zoomFeature: IProduct | null;
  selectedFeature: IProduct | null;
  hoveredFeatureId: IProduct['id'] | null;
  setHoveredFeature: (productId: IProduct['id'] | null) => void;
  handleClickFeature: (productId: IProduct['id']) => void;
}

export const MapBackground: React.FC<IMapBackgroundProps> = ({
  features,
  zoomFeature,
  selectedFeature,
  hoveredFeatureId,
  setHoveredFeature,
  handleClickFeature
}) => (
  <div className={'jp-EodagWidget-background-map sizeFull'}>
    <MapFeature
      features={features}
      zoomFeature={zoomFeature}
      selectedFeature={selectedFeature}
      hoveredFeatureId={hoveredFeatureId}
      setHoveredFeature={setHoveredFeature}
      handleClickFeature={handleClickFeature}
    />
  </div>
);
