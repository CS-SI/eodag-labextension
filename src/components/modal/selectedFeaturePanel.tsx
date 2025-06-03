import React, { useMemo } from 'react';
import { IFeature } from '../../types';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { Button, IconButton, Tooltip } from '@mui/material';
import { NoImage } from '../icons';

interface ISelectedFeaturePanelProps {
  selectedFeature: IFeature;
  onZoom: (productId: string) => void;
  generateProductCode: (productId: string) => void;
}

interface IMetadataLineProps {
  label: string;
  value: any;
}

const MetadataLine: React.FC<IMetadataLineProps> = ({ label, value }) => {
  const isRenderable =
    ['string', 'number', 'boolean'].includes(typeof value) && value !== null;
  const isFilteredOut = label.startsWith('eodag_');

  if (!isRenderable || isFilteredOut) {
    return null;
  }

  return (
    <div className={'jp-EodagWidget-modal-selected-result-metadata-line'}>
      <Tooltip title={label} placement={'top'} arrow>
        <span>{label}</span>
      </Tooltip>
      <div className={'separator'} />
      <Tooltip title={value} placement={'top'} arrow>
        <span>{value}</span>
      </Tooltip>
    </div>
  );
};

export const SelectedFeaturePanel: React.FC<ISelectedFeaturePanelProps> = ({
  selectedFeature,
  onZoom,
  generateProductCode
}) => {
  const { properties } = selectedFeature;

  const preview = useMemo(() => {
    return properties.quicklook
      ? properties.quicklook
      : properties.thumbnail
        ? properties.thumbnail
        : null;
  }, [selectedFeature.id, properties]);

  const metadataList = useMemo(
    () =>
      Object.entries(properties).map(([key, value]) => (
        <MetadataLine key={key} label={key} value={value} />
      )),
    [selectedFeature.id, properties]
  );

  return (
    <div className="jp-EodagWidget-modal-selected-result">
      <div className={'jp-EodagWidget-modal-selected-result-preview'}>
        <div className={'result_preview_background'}>
          <NoImage />
        </div>
        {preview && <img src={preview} alt={' '} />}
      </div>
      <div className={'jp-EodagWidget-modal-selected-result-infos'}>
        <div className={'jp-EodagWidget-modal-selected-result-title'}>
          <span>{selectedFeature.id}</span>
          <IconButton
            size={'small'}
            className={'jp-EodagWidget-modal-selected-result-zoomButton'}
            onClick={() => onZoom(selectedFeature.id)}
          >
            <ZoomInIcon fontSize={'inherit'} />
          </IconButton>
        </div>
        <div className={'jp-EodagWidget-modal-selected-result-metadata'}>
          <div
            className={'jp-EodagWidget-modal-selected-result-metadata-title'}
          >
            <span>{'Metadata'}</span>
          </div>
          <div
            className={'jp-EodagWidget-modal-selected-result-metadata-content'}
          >
            {metadataList}
          </div>
        </div>
        <div className={'jp-EodagWidget-modal-selected-result-action-buttons'}>
          <Button onClick={() => generateProductCode(selectedFeature.id)}>
            {'Generate code for this product'}
          </Button>
        </div>
      </div>
    </div>
  );
};
