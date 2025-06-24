import React, { useMemo, useState } from 'react';
import { IParameter, IProduct } from '../../types';
import { IconButton, Tooltip } from '@mui/material';
import { Button } from '../button';
import { NoImage } from '../icons';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import Clear from '@mui/icons-material/Clear';

interface ISelectedProductPanelProps {
  selectedProduct: IProduct;
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

export const SelectedProductPanel: React.FC<ISelectedProductPanelProps> = ({
  selectedProduct,
  handleGenerateQuery,
  resetSelectedFeature
}) => {
  const { properties } = selectedProduct;
  const [isPanelZoomed, setIsPanelZoomed] = useState<boolean>(false);

  const preview = useMemo(() => {
    return properties.quicklook
      ? properties.quicklook
      : properties.thumbnail
        ? properties.thumbnail
        : null;
  }, [selectedProduct.id, properties]);

  const metadataList = useMemo(
    () =>
      Object.entries(properties).map(([key, value]) => (
        <MetadataLine key={key} label={key} value={value} />
      )),
    [selectedProduct.id, properties]
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
          <span>{selectedProduct.id}</span>
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
            label={'Generate code for this product'}
            variant={'contained'}
            onClick={() =>
              handleGenerateQuery([
                {
                  key: 'id',
                  value: {
                    id: selectedProduct.id.includes('ORDERABLE')
                      ? undefined
                      : selectedProduct.id
                  },
                  mandatory: false
                }
              ])
            }
          />
        </div>
      </div>
    </div>
  );
};
