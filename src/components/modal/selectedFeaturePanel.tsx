import React from 'react';
import { IFeature } from '../../types';

interface ISelectedFeaturePanelProps {
  selectedFeature: IFeature;
}

export const SelectedFeaturePanel: React.FC<ISelectedFeaturePanelProps> = ({
  selectedFeature
}) => {
  return (
    <div className="jp-EodagWidget-modal-selected-result">
      {selectedFeature.id}
      {/*<DescriptionProduct feature={selectedFeature} />*/}
    </div>
  );
};
