import * as React from 'react';
import { Button, Dialog, AppBar, Toolbar, IconButton, Typography, Slide, Tooltip, InputLabel, CircularProgress } from '@material-ui/core';
import "react-datepicker/dist/react-datepicker.css";
import { Close } from '@material-ui/icons';
import { find, isEqual, get } from 'lodash'
import MapFeatureComponent from './MapFeatureComponent'
import BrowseComponent from './BrowseComponent'
import DescriptionProductComponent from './DescriptionProductComponent'

export interface IProps {
  open: any;
  handleClose: any;
  handleGenerateQuery: any;
  features: any;
  isRetrievingMoreFeature: any;
  handleRetrieveMoreFeature: any;
}

export interface IState {
  displayFeature: any;
  highlightOnMapFeature: any;
  highlightOnTableFeature: any;
  zoomFeature: any;
  features: any;
}


function Transition(props) {
  return <Slide direction="up" {...props} />;
}

export default class ModalComponent extends React.Component<IProps, IState> {
    state = {
      features: [],
      displayFeature: null,
      highlightOnMapFeature: null,
      highlightOnTableFeature: null,
      zoomFeature: null,
    }

    componentDidUpdate(prevProps) {
      // If the features list change, remove the displayed feature
      if (!isEqual(prevProps.features, this.props.features)) {
        this.setState({
          displayFeature: null,
        })
      }
    }

    getFeature = (productId) => {
      const { features } = this.props
      return find(features.features, (feature) => (
        feature.id === productId
      ))
    }

    handleClickFeature = (productId) => {
      const feature = this.getFeature(productId);
      if (feature) {
        this.setState({
          displayFeature: feature,
        })
      }
    }

    handleHoverMapFeature = (productId) => {
      if (!productId) {
        this.setState({
          highlightOnTableFeature: null,
        })
      } else {
        const feature = this.getFeature(productId);
        if (feature) {
          this.setState({
            highlightOnTableFeature: feature,
          })
        }
      }
    }

    handleHoverTableFeature = (productId) => {
      if (!productId) {
        this.setState({
          highlightOnMapFeature: null,
        })
      } else {
        const feature = this.getFeature(productId);
        if (feature) {
          this.setState({
            highlightOnMapFeature: feature,
          })
        }
      }
    }

    handleZoomFeature = (productId) => {
      const feature = this.getFeature(productId);
      if (feature) {
        this.setState({
          zoomFeature: feature,
        })
      }
    }
    
    render() {
      const { features, open, handleClose, handleGenerateQuery, isRetrievingMoreFeature, handleRetrieveMoreFeature } = this.props
      const { displayFeature, zoomFeature, highlightOnMapFeature, highlightOnTableFeature } = this.state
      return (
        <Dialog
          fullScreen
          open={open}
          TransitionComponent={Transition}
        >
          <div className="jp-EodagWidget-modal">
            <AppBar position="static" square elevation={0}>
              <Toolbar variant="dense">
                <IconButton color="inherit" onClick={handleClose} aria-label="Close">
                  <Close />
                </IconButton>
                <Typography variant="h6" color="inherit" className="jp-EodagWidget-title">
                  Search results
                </Typography>
                <div className="jp-EodagWidget-right-buttons-wrapper">
                <Tooltip title="Generate the python code" placement="bottom-start">
                    <Button variant="contained" onClick={handleGenerateQuery}>
                      Apply
                    </Button>
                  </Tooltip>
                </div>
              </Toolbar>
            </AppBar>
            <div className="jp-EodagWidget-modal-container">
              <div className="jp-EodagWidget-product-wrapper">
                <MapFeatureComponent 
                  features={features}
                  zoomFeature={zoomFeature}
                  highlightFeature={highlightOnMapFeature}
                  handleHoverFeature={this.handleHoverMapFeature}
                />
                <InputLabel className="jp-EodagWidget-browse-title">
                  {isRetrievingMoreFeature() ? (
                    <div className="jp-EodagWidget-loading-wrapper">
                      <Tooltip title="Loading more products" placement="top">
                        <CircularProgress size={17}/>
                      </Tooltip>
                    </div>
                  ) : null}
                  {get(features, 'features', []).length} results
                </InputLabel>
                <div className="jp-EodagWidget-browse-wrapper">
                  <BrowseComponent
                    features={features}
                    highlightFeature={highlightOnTableFeature}
                    handleClickFeature={this.handleClickFeature}
                    handleZoomFeature={this.handleZoomFeature}
                    handleHoverFeature={this.handleHoverTableFeature}
                    isRetrievingMoreFeature={isRetrievingMoreFeature}
                    handleRetrieveMoreFeature={handleRetrieveMoreFeature}
                  />
                </div>
              </div>
              <div className="jp-EodagWidget-desc-wrapper">
                <DescriptionProductComponent
                  feature={displayFeature}
                />
              </div>
            </div>
          </div>
        </Dialog>
      );
    }
}
