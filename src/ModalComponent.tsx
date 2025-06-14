/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { find, get, isEqual, isUndefined } from 'lodash';
import Modal, { Styles } from 'react-modal';
import MapFeatureComponent from './MapFeatureComponent';
import BrowseComponent from './BrowseComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import DescriptionProductComponent from './DescriptionProductComponent';
import { PlacesType, Tooltip, VariantType } from 'react-tooltip';
import { IMapSettings } from './browser';

const customStyles: Styles = {
  overlay: {
    zIndex: 10
  },
  content: {
    top: '0px',
    left: '0px',
    right: 'auto',
    bottom: 'auto',
    height: 'auto',
    width: '100%',
    zIndex: 10,
    marginRight: '0',
    padding: '0',
    borderRadius: 'none',
    border: 'none'
  }
};

export interface IProps {
  open: any;
  handleClose: any;
  handleGenerateQuery: any;
  features: any;
  isRetrievingMoreFeature: () => boolean;
  handleRetrieveMoreFeature: () => Promise<void>;
  mapSettings: IMapSettings | undefined;
}

export interface IState {
  displayFeature: any;
  highlightOnMapFeature: any;
  highlightOnTableFeature: any;
  zoomFeature: any;
  features: any;
  selectedFeature: any;
}

function Transition(props: any) {
  return <div direction="up" {...props} />;
}

const tooltipDark: VariantType = 'dark';
const tooltipBottom: PlacesType = 'bottom';

// Override modal's default style
if (!isUndefined(Modal.defaultStyles.overlay)) {
  Modal.defaultStyles.overlay.zIndex = 4;
}

Modal.setAppElement('body');
export default class ModalComponent extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      features: [],
      displayFeature: null,
      highlightOnMapFeature: null,
      highlightOnTableFeature: null,
      zoomFeature: null,
      selectedFeature: null
    };
  }

  componentDidUpdate(prevProps: IProps) {
    // If the features list change, remove the displayed feature
    if (!isEqual(prevProps.features, this.props.features)) {
      this.setState({
        displayFeature: null
      });
    }
  }

  getFeature = (productId: string) => {
    const { features } = this.props;
    return find(features.features, feature => feature.id === productId);
  };

  handleClickFeature = (productId: string) => {
    if (!productId) {
      this.setState({
        selectedFeature: null
      });
    } else {
      const feature = this.getFeature(productId);
      if (feature) {
        this.setState({
          displayFeature: feature,
          selectedFeature: feature
        });
      }
    }
  };

  handleHoverMapFeature = (productId: string) => {
    if (!productId) {
      this.setState({
        highlightOnTableFeature: null
      });
    } else {
      const feature = this.getFeature(productId);
      if (feature) {
        this.setState({
          highlightOnTableFeature: feature
        });
      }
    }
  };

  handleHoverTableFeature = (productId: string) => {
    if (!productId) {
      this.setState({
        highlightOnMapFeature: null
      });
    } else {
      const feature = this.getFeature(productId);
      if (feature) {
        this.setState({
          highlightOnMapFeature: feature
        });
      }
    }
  };

  handleZoomFeature = (productId: string) => {
    const feature = this.getFeature(productId);
    if (feature) {
      this.setState({
        zoomFeature: feature
      });
    }
  };

  render() {
    const {
      features,
      open,
      handleClose,
      isRetrievingMoreFeature,
      handleRetrieveMoreFeature,
      handleGenerateQuery,
      mapSettings
    } = this.props;
    const {
      zoomFeature,
      highlightOnMapFeature,
      highlightOnTableFeature,
      displayFeature,
      selectedFeature
    } = this.state;
    return (
      <Modal
        isOpen={open}
        contentLabel="Modal"
        style={customStyles}
        data-TransitionComponent={Transition}
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
              {mapSettings && (
                <MapFeatureComponent
                  features={features}
                  zoomFeature={zoomFeature}
                  highlightFeature={highlightOnMapFeature}
                  handleHoverFeature={this.handleHoverMapFeature}
                  handleClickFeature={this.handleClickFeature}
                  mapSettings={mapSettings}
                />
              )}
              <div className="jp-EodagWidget-browse-title">
                {isRetrievingMoreFeature() ? (
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
                ) : null}
                {get(features, 'features', []).length} results (total:{' '}
                {get(features, 'properties.totalResults', 0)})
              </div>
              <div className="jp-EodagWidget-browse-wrapper">
                <BrowseComponent
                  features={features}
                  highlightFeature={highlightOnTableFeature}
                  handleClickFeature={this.handleClickFeature}
                  handleZoomFeature={this.handleZoomFeature}
                  handleHoverFeature={this.handleHoverTableFeature}
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
              <DescriptionProductComponent feature={displayFeature} />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
