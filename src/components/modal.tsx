import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { find, get, isUndefined } from 'lodash';
import ReactModal, { Styles } from 'react-modal';
import { MapFeature } from './mapFeature';
import BrowseComponent from './browseComponent/browseComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DescriptionProduct } from './descriptionProduct';
import { PlacesType, Tooltip, VariantType } from 'react-tooltip';

const customStyles: Styles = {
  overlay: {
    zIndex: 10
  },
  content: {
    top: 0,
    left: 0,
    right: 'auto',
    bottom: 'auto',
    height: 'auto',
    width: '100%',
    zIndex: 10,
    marginRight: 0,
    padding: 0,
    borderRadius: 'none',
    border: 'none'
  }
};

export interface IModalProps {
  open: any;
  handleClose: any;
  handleGenerateQuery: any;
  features: any;
  isRetrievingMoreFeature: () => boolean;
  handleRetrieveMoreFeature: () => Promise<void>;
}

const tooltipDark: VariantType = 'dark';
const tooltipBottom: PlacesType = 'bottom';

// Override modal's default style
if (!isUndefined(ReactModal.defaultStyles.overlay)) {
  ReactModal.defaultStyles.overlay.zIndex = 4;
}
ReactModal.setAppElement('body');

export const Modal: React.FC<IModalProps> = ({
  open,
  handleClose,
  handleGenerateQuery,
  features,
  isRetrievingMoreFeature,
  handleRetrieveMoreFeature
}) => {
  const [displayFeature, setDisplayFeature] = React.useState<any>(null);
  const [highlightOnMapFeature, setHighlightOnMapFeature] =
    React.useState<any>(null);
  const [highlightOnTableFeature, setHighlightOnTableFeature] =
    React.useState<any>(null);
  const [zoomFeature, setZoomFeature] = React.useState<any>(null);
  const [selectedFeature, setSelectedFeature] = React.useState<any>(null);

  React.useEffect(() => {
    setDisplayFeature(null);
  }, [features]);

  const getFeature = (productId: string) => {
    return find(features.features, feature => feature.id === productId);
  };

  const handleClickFeature = (productId: string) => {
    if (!productId) {
      setSelectedFeature(null);
    } else {
      const feature = getFeature(productId);
      if (feature) {
        setDisplayFeature(feature);
        setSelectedFeature(feature);
      }
    }
  };

  const handleHoverMapFeature = (productId: string) => {
    if (!productId) {
      setHighlightOnTableFeature(null);
    } else {
      const feature = getFeature(productId);
      if (feature) {
        setHighlightOnTableFeature(feature);
      }
    }
  };

  const handleHoverTableFeature = (productId: string) => {
    if (!productId) {
      setHighlightOnMapFeature(null);
    } else {
      const feature = getFeature(productId);
      if (feature) {
        setHighlightOnMapFeature(feature);
      }
    }
  };

  const handleZoomFeature = (productId: string) => {
    const feature = getFeature(productId);
    if (feature) {
      setZoomFeature(feature);
    }
  };

  return (
    <ReactModal
      isOpen={open}
      contentLabel="Modal"
      style={customStyles}
      data-TransitionComponent={(props: any) => (
        <div direction="up" {...props} />
      )}
    >
      <div className="jp-EodagWidget-modal">
        <div className="jp-EodagWidget-appbar">
          <div></div>
          <p>Search results</p>
          <button onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
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
    </ReactModal>
  );
};
