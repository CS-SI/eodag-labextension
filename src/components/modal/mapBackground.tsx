import React from 'react';
import { MapFeature } from '../mapFeature';
import { IFeature, IFeatures } from '../../types';

interface IMapBackgroundProps {
  features: IFeatures | null;
  zoomFeature: IFeature | null;
  highlightFeature: IFeature | null;
  handleHoverMapFeature: (productId: string | null) => void;
  handleClickFeature: (productId: string) => void;
}

export const MapBackground: React.FC<IMapBackgroundProps> = ({
  features,
  zoomFeature,
  highlightFeature,
  handleHoverMapFeature,
  handleClickFeature
}) => (
  <div className={'jp-EodagWidget-background-map sizeFull'}>
    <MapFeature
      features={features}
      zoomFeature={zoomFeature}
      highlightFeature={highlightFeature}
      handleHoverFeature={handleHoverMapFeature}
      handleClickFeature={handleClickFeature}
    />
  </div>
);
