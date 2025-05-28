import React, { useEffect, useMemo, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { find, get } from 'lodash';
import { Box, Modal as MuiModal } from '@mui/material';
import { MapFeature } from '../mapFeature';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { PlacesType, Tooltip, VariantType } from 'react-tooltip';
import { ResultsList } from '../resultsList/resultsList';

export interface IModalProps {
  open: boolean;
  handleClose: () => void;
  handleGenerateQuery: any;
  features: any;
  isRetrievingMoreFeature: () => boolean;
  handleRetrieveMoreFeature: () => Promise<void>;
}

const styles = {
  position: 'absolute',
  top: 32,
  left: 32,
  right: 32,
  bottom: 32,
  width: 'calc(100vw - 64px)',
  height: 'calc(100vh - 64px)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '8px',
  overflow: 'hidden'
};

const tooltipDark: VariantType = 'dark';
const tooltipBottom: PlacesType = 'bottom';

export const Modal: React.FC<IModalProps> = ({
  handleGenerateQuery,
  open,
  features,
  handleClose,
  isRetrievingMoreFeature,
  handleRetrieveMoreFeature
}) => {
  const [displayFeature, setDisplayFeature] = useState(null);
  const [highlightOnMapFeature, setHighlightOnMapFeature] = useState(null);
  const [highlightOnTableFeature, setHighlightOnTableFeature] = useState(null);
  const [zoomFeature] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [modalOpen, setModalOpen] = useState<boolean>(open);

  void displayFeature;

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  useEffect(() => {
    setDisplayFeature(null);
  }, [features]);

  const getFeature = (productId: string) =>
    find(features.features, feature => feature.id === productId);

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

  const handleHoverMapFeature = (productId: string) => {
    if (!productId) {
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
      return setHighlightOnMapFeature(null);
    } else {
      const feature = getFeature(productId);
      if (!feature) {
        return;
      }
      setHighlightOnMapFeature(feature);
    }
  };

  // const handleZoomFeature = (productId: string) => {
  //   const feature = getFeature(productId);
  //   if (!feature) {
  //     return null;
  //   }
  //   setZoomFeature(feature);
  // };

  const { displayedResults, totalResults } = useMemo(() => {
    const displayedResults = get(features, 'features', []).length;
    const totalResults = get(features, 'properties.totalResults', 0);
    return { displayedResults, totalResults };
  }, [features]);

  return (
    <MuiModal open={modalOpen} onClose={handleClose}>
      <Box sx={styles}>
        <div className={'jp-EodagWidget-background-map'}>
          <MapFeature
            features={features}
            zoomFeature={zoomFeature}
            highlightFeature={highlightOnMapFeature}
            handleHoverFeature={handleHoverMapFeature}
            handleClickFeature={handleClickFeature}
          />
        </div>
        <div className={'jp-EodagWidget-modal-results'}>
          <div className={'jp-EodagWidget-results-wrapper'}>
            <div className={'jp-EodagWidget-results-title'}>
              <h2>{`Results (${totalResults})`}</h2>
              <div className={'jp-EodagWidget-results-subtitle'}>
                <span>{`Showing the first ${displayedResults} items that matched your filter`}</span>
                {isRetrievingMoreFeature() && (
                  <div
                    data-tooltip-id="load-tooltip"
                    data-tootip-content="Loading more products"
                    data-tooltip-variant={tooltipDark}
                    data-tooltip-place={tooltipBottom}
                    className="jp-EodagWidget-loading-wrapper"
                  >
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <Tooltip id="load-tooltip" className="jp-Eodag-tooltip" />
                  </div>
                )}
              </div>
            </div>
            <div className="jp-EodagWidget-results-content">
              <ResultsList
                features={features}
                highlightFeature={highlightOnTableFeature}
                handleClickFeature={handleClickFeature}
                // handleZoomFeature={handleZoomFeature}
                handleHoverFeature={handleHoverTableFeature}
                isRetrievingMoreFeature={isRetrievingMoreFeature}
                handleRetrieveMoreFeature={handleRetrieveMoreFeature}
                selectedFeature={selectedFeature}
              />
              {/*<BrowseComponent*/}
              {/*  features={features}*/}
              {/*  highlightFeature={highlightOnTableFeature}*/}
              {/*  handleClickFeature={handleClickFeature}*/}
              {/*  handleZoomFeature={handleZoomFeature}*/}
              {/*  handleHoverFeature={handleHoverTableFeature}*/}
              {/*  isRetrievingMoreFeature={isRetrievingMoreFeature}*/}
              {/*  handleRetrieveMoreFeature={handleRetrieveMoreFeature}*/}
              {/*  selectedFeature={selectedFeature}*/}
              {/*/>*/}
            </div>
            <div className="jp-EodagWidget-results-footer">
              <button
                className="jp-EodagWidget-apply"
                onClick={handleGenerateQuery}
              >
                Generate code
              </button>
            </div>
          </div>
        </div>
      </Box>
      {/*<div className="jp-EodagWidget-desc-wrapper">*/}
      {/*  <DescriptionProduct feature={displayFeature} />*/}
      {/*</div>*/}
    </MuiModal>
  );
};
