/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import { isEmpty, get } from 'lodash';
import { EODAG_TILE_URL, EODAG_TILE_COPYRIGHT } from './config';
import L, { FeatureGroup, LeafletMouseEvent } from 'leaflet';

export interface IProps {
  features: any;
  zoomFeature: any;
  highlightFeature: any;
  handleHoverFeature: any;
  handleClickFeature: (productId: string) => void;
}

export interface IState {
  bounds: L.LatLngBounds;
  featureHover: any;
  featureSelected: string;
}

export default class MapFeatureComponent extends React.Component<
  IProps,
  IState
> {
  /**
   * Leaflet map object
   */
  map: any;

  static DEFAULT_EXTENT_STYLE = {
    color: '#3f51b5',
    fillOpacity: 0.01
  };

  static HIGHLIGHT_EXTENT_STYLE = {
    color: '#76ff03',
    fillOpacity: 0.01
  };

  EditOptions = {
    polyline: false,
    polygon: false,
    circle: false,
    marker: false,
    circlemarker: false
  };
  constructor(props: IProps) {
    super(props);
    const featureGeoJSONs = new L.GeoJSON(props.features.features);
    const bounds = featureGeoJSONs.getBounds();
    this.state = {
      bounds,
      featureHover: null,
      featureSelected: null
    };
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.map) {
      if (prevProps.zoomFeature !== this.props.zoomFeature) {
        // Handle zoom on a product
        if (this.props.zoomFeature) {
          let bounds;
          this.map.leafletElement.eachLayer((layer: FeatureGroup) => {
            if (
              get(layer, 'feature.id', null) === prevProps.highlightFeature.id
            ) {
              bounds = layer.getBounds();
            }
          });
          if (bounds) {
            this.map.leafletElement.flyToBounds(bounds, {});
          }
        }
      }
      if (prevProps.highlightFeature !== this.props.highlightFeature) {
        // Handle set feature (un)highlighted
        if (this.props.highlightFeature) {
          // Highlight a feature
          this.map.leafletElement.eachLayer((layer: FeatureGroup) => {
            if (
              get(layer, 'feature.id', null) === this.props.highlightFeature.id
            ) {
              layer.bringToFront();
              layer.setStyle(MapFeatureComponent.HIGHLIGHT_EXTENT_STYLE);
            }
          });
        } else {
          // Remove highlight on feature
          this.map.leafletElement.eachLayer((layer: FeatureGroup) => {
            if (
              get(layer, 'feature.id', null) === prevProps.highlightFeature.id
            ) {
              layer.setStyle(MapFeatureComponent.DEFAULT_EXTENT_STYLE);
            }
          });
        }
      }
    }
  }

  onMouseOver = (e: LeafletMouseEvent) => {
    const productId = e.layer.feature.id;
    this.props.handleHoverFeature(productId);
    e.layer.setStyle(MapFeatureComponent.HIGHLIGHT_EXTENT_STYLE);
    e.layer.bringToFront();
    this.setState({
      featureHover: productId
    });
  };

  onMouseOut = (e: LeafletMouseEvent) => {
    this.props.handleHoverFeature(null);
    e.layer.setStyle(MapFeatureComponent.DEFAULT_EXTENT_STYLE);
    this.setState({
      featureHover: null
    });
  };

  onClick = (e: LeafletMouseEvent) => {
    const productId = e.propagatedFrom.feature.id;
    e.layer.setStyle(MapFeatureComponent.HIGHLIGHT_EXTENT_STYLE);
    e.layer.bringToFront();
    this.props.handleClickFeature(productId);

    this.setState({
      featureSelected: productId
    });
  };

  /**
   * Generate the style for GeoJSON features. This function is used at the initialisation,
   * and on every component redraw
   */
  getStyle = (feature: any) => {
    const { highlightFeature } = this.props;
    const { featureHover, featureSelected } = this.state;
    if (
      get(highlightFeature, 'id') === feature.id ||
      featureHover === feature.id ||
      featureSelected === feature.id
    ) {
      return MapFeatureComponent.HIGHLIGHT_EXTENT_STYLE;
    }
    return MapFeatureComponent.DEFAULT_EXTENT_STYLE;
  };

  render() {
    const { bounds } = this.state;
    return (
      <Map
        bounds={bounds}
        ref={ref => {
          this.map = ref;
        }}
      >
        <TileLayer url={EODAG_TILE_URL} attribution={EODAG_TILE_COPYRIGHT} />
        {!isEmpty(this.props.features) ? (
          <GeoJSON
            key={`features-gson-${
              get(this.props.features, 'features', []).length
            }`}
            data={this.props.features}
            style={this.getStyle}
            onMouseOut={this.onMouseOut}
            onMouseOver={this.onMouseOver}
            onclick={this.onClick}
          />
        ) : null}
      </Map>
    );
  }
}
