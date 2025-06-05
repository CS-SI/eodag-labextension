import React, { useMemo, useState } from 'react';
import { IFeature, IParameter } from '../../types';
import { Button, IconButton, Tooltip } from '@mui/material';
import { NoImage } from '../icons';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import Clear from '@mui/icons-material/Clear';

interface ISelectedFeaturePanelProps {
  selectedFeature: IFeature;
  resetSelectedFeature: () => void;
  handleGenerateQuery: (params: IParameter[]) => void;
}

interface IMetadataLineProps {
  label: string;
  value: any;
}

const MetadataLine: React.FC<IMetadataLineProps> = ({ label, value }) => {
  const isRenderable =
    ['string', 'number', 'boolean'].includes(typeof value) && value !== null;
  const isFilteredOut = label.startsWith('eodag_') || label.startsWith('_');

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
  handleGenerateQuery,
  resetSelectedFeature
}) => {
  const { properties } = selectedFeature;
  const [isPanelZoomed, setIsPanelZoomed] = useState<boolean>(false);

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

  const closeSelectedResultPanel = () => {
    setIsPanelZoomed(false);
    return resetSelectedFeature();
  };

  return (
    <div
      className={`jp-EodagWidget-modal-selected-result ${
        isPanelZoomed ? 'panelZoomed' : ''
      }`}
    >
      <div className={'jp-EodagWidget-modal-selected-result-panel-tools'}>
        {isPanelZoomed ? (
          <IconButton size={'small'} onClick={() => setIsPanelZoomed(false)}>
            <ZoomInMapIcon fontSize={'inherit'} />
          </IconButton>
        ) : (
          <IconButton size={'small'} onClick={() => setIsPanelZoomed(true)}>
            <ZoomOutMapIcon fontSize={'inherit'} />
          </IconButton>
        )}
        <IconButton size={'small'} onClick={closeSelectedResultPanel}>
          <Clear fontSize={'inherit'} />
        </IconButton>
      </div>
      <div className={'jp-EodagWidget-modal-selected-result-preview'}>
        <div className={'result_preview_background'}>
          <NoImage />
        </div>
        {preview && <img src={preview} alt={' '} />}
      </div>
      <div className={'jp-EodagWidget-modal-selected-result-infos'}>
        <div className={'jp-EodagWidget-modal-selected-result-title'}>
          <span>{selectedFeature.id}</span>
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
          <Button
            variant={'contained'}
            onClick={() =>
              handleGenerateQuery([
                {
                  key: 'id',
                  value: { id: selectedFeature.id },
                  mandatory: false
                }
              ])
            }
          >
            {'Generate code for this product'}
          </Button>
        </div>
      </div>
    </div>
  );
};
