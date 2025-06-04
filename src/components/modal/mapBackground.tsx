import React from 'react';
import { MapFeature } from '../mapFeature';
import { IFeature, IFeatures } from '../../types';

interface IMapBackgroundProps {
  features: IFeatures | null;
  zoomFeature: IFeature | null;
  selectedFeature: IFeature | null;
  hoveredFeatureId: IFeature['id'] | null;
  setHoveredFeature: (productId: IFeature['id'] | null) => void;
  handleClickFeature: (productId: IFeature['id']) => void;
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
