import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { find, get } from 'lodash';
import { Box, Modal as MuiModal } from '@mui/material';
import { MapFeature } from '../mapFeature';
import BrowseComponent from '../browseComponent/browseComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { DescriptionProduct } from '../descriptionProduct';
import { PlacesType, Tooltip, VariantType } from 'react-tooltip';

export interface IModalProps {
  open: any;
  handleClose: any;
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
  isRetrievingMoreFeature,
  handleRetrieveMoreFeature
}) => {
  const [displayFeature, setDisplayFeature] = useState(null);
  const [highlightOnMapFeature, setHighlightOnMapFeature] = useState(null);
  const [highlightOnTableFeature, setHighlightOnTableFeature] = useState(null);
  const [zoomFeature, setZoomFeature] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [modalOpen, setModalOpen] = useState(open);

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  const handleClose = () => setModalOpen(false);

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

  const handleHoverTableFeature = (productId: string) => {
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

  const handleZoomFeature = (productId: string) => {
    const feature = getFeature(productId);
    if (!feature) {
      return null;
    }
    setZoomFeature(feature);
  };

  return (
    <MuiModal open={modalOpen} onClose={handleClose}>
      <Box sx={styles}>
        <div className="jp-EodagWidget-modal">
          <div className="jp-EodagWidget-modal-container">
            <div className="jp-EodagWidget-product-wrapper">
              <MapFeature
                features={features}
                zoomFeature={zoomFeature}
                highlightFeature={highlightOnMapFeature}
                handleHoverFeature={handleHoverMapFeature}
                handleClickFeature={handleClickFeature}
              />
              <div className="jp-EodagWidget-browse-title">
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
                {get(features, 'features', []).length} results (total:{' '}
                {get(features, 'properties.totalResults', 0)})
              </div>
              <div className="jp-EodagWidget-browse-wrapper">
                <BrowseComponent
                  features={features}
                  highlightFeature={highlightOnTableFeature}
                  handleClickFeature={handleClickFeature}
                  handleZoomFeature={handleZoomFeature}
                  handleHoverFeature={handleHoverTableFeature}
                  isRetrievingMoreFeature={isRetrievingMoreFeature}
                  handleRetrieveMoreFeature={handleRetrieveMoreFeature}
                  selectedFeature={selectedFeature}
                />
              </div>
              <div className="jp-EodagWidget-modal-footer">
                <button
                  className="jp-EodagWidget-apply"
                  onClick={handleGenerateQuery}
                >
                  Generate code
                </button>
              </div>
            </div>
            <div className="jp-EodagWidget-desc-wrapper">
              <DescriptionProduct feature={displayFeature} />
            </div>
          </div>
        </div>
      </Box>
    </MuiModal>
  );
};
