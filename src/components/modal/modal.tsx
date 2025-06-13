import React, { useEffect, useState } from 'react';
import { Box, IconButton, Modal as MuiModal } from '@mui/material';
import { ResultsPanel } from './resultsPanel';
import { MapBackground } from './mapBackground';
import { SelectedProductPanel } from './selectedProductPanel';
import { useMapFeatures } from '../../hooks/useMapFeatures';
import 'react-datepicker/dist/react-datepicker.css';
import { IFeatures, IParameter } from '../../types';
import ClearIcon from '@mui/icons-material/Clear';
import { IMapSettings } from '../browser';

export interface IModalProps {
  open: boolean;
  handleClose: () => void;
  handleGenerateQuery: (_: IParameter[]) => void;
  features: IFeatures | null;
  isRetrievingMoreFeature: boolean;
  handleRetrieveMoreFeature: () => Promise<void>;
  mapSettings?: IMapSettings;
}

const styles = {
  position: 'absolute',
  inset: '32px',
  width: 'calc(100vw - 64px)',
  height: 'calc(100vh - 64px)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '8px',
  overflow: 'hidden'
};

interface IExitModalButtonProps {
  handleClose: () => void;
}

const ExitModalButton: React.FC<IExitModalButtonProps> = ({ handleClose }) => (
  <IconButton
    className={'jp-EodagWidget-modal-exit-button'}
    onClick={handleClose}
  >
    <ClearIcon />
  </IconButton>
);

export const Modal: React.FC<IModalProps> = ({
  handleGenerateQuery,
  open,
  features,
  handleClose,
  isRetrievingMoreFeature,
  handleRetrieveMoreFeature,
  mapSettings
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(open);

  const {
    hoveredFeatureId,
    setHoveredFeature,
    selectedFeature,
    handleClickFeature,
    zoomFeature,
    handleZoomFeature,
    resetSelectedFeature
  } = useMapFeatures({
    features
  });

  useEffect(() => {
    if (!open) {
      resetSelectedFeature();
    }
    setModalOpen(open);
  }, [open]);

  return (
    <MuiModal open={modalOpen} onClose={handleClose}>
      <>
        <ExitModalButton handleClose={handleClose} />
        <Box sx={styles}>
          <MapBackground
            features={features}
            selectedFeature={selectedFeature}
            zoomFeature={zoomFeature}
            hoveredFeatureId={hoveredFeatureId}
            setHoveredFeature={setHoveredFeature}
            handleClickFeature={handleClickFeature}
            mapSettings={mapSettings}
          />
          <ResultsPanel
            features={features}
            hoveredFeatureId={hoveredFeatureId}
            setHoveredFeature={setHoveredFeature}
            isRetrievingMoreFeature={isRetrievingMoreFeature}
            handleClickFeature={handleClickFeature}
            handleZoomFeature={handleZoomFeature}
            handleRetrieveMoreFeature={handleRetrieveMoreFeature}
            handleGenerateQuery={handleGenerateQuery}
            selectedFeature={selectedFeature}
          />
          {selectedFeature && (
            <SelectedProductPanel
              selectedProduct={selectedFeature}
              resetSelectedFeature={resetSelectedFeature}
              handleGenerateQuery={handleGenerateQuery}
            />
          )}
        </Box>
      </>
    </MuiModal>
  );
};
