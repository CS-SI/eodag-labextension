import React, { useEffect, useState } from 'react';
import { Box, IconButton, Modal as MuiModal } from '@mui/material';
import { ResultsPanel } from './resultsPanel';
import { MapBackground } from './mapBackground';
import { SelectedFeaturePanel } from './selectedFeaturePanel';
import { useMapFeatures } from '../../hooks/useMapFeatures';
import 'react-datepicker/dist/react-datepicker.css';
import { IFeatures, IParameter } from '../../types';
import ClearIcon from '@mui/icons-material/Clear';

export interface IModalProps {
  open: boolean;
  handleClose: () => void;
  handleGenerateQuery: (_: IParameter[]) => void;
  features: IFeatures | null;
  isRetrievingMoreFeature: boolean;
  handleRetrieveMoreFeature: () => Promise<void>;
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
  handleRetrieveMoreFeature
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(open);
  const {
    highlightOnTableFeature,
    highlightFeature,
    selectedFeature,
    zoomFeature,
    handleClickFeature,
    handleHoverTableFeature,
    handleZoomFeature,
    handleHoverMapFeature,
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
            zoomFeature={zoomFeature}
            highlightFeature={highlightFeature}
            handleHoverMapFeature={handleHoverMapFeature}
            handleClickFeature={handleClickFeature}
          />
          <ResultsPanel
            features={features}
            isRetrievingMoreFeature={isRetrievingMoreFeature}
            highlightOnTableFeature={highlightOnTableFeature}
            handleClickFeature={handleClickFeature}
            handleZoomFeature={handleZoomFeature}
            handleHoverTableFeature={handleHoverTableFeature}
            handleRetrieveMoreFeature={handleRetrieveMoreFeature}
            handleGenerateQuery={handleGenerateQuery}
            selectedFeature={selectedFeature}
          />
          {selectedFeature && (
            <SelectedFeaturePanel
              selectedFeature={selectedFeature}
              resetSelectedFeature={resetSelectedFeature}
              handleGenerateQuery={handleGenerateQuery}
            />
          )}
        </Box>
      </>
    </MuiModal>
  );
};
