/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import { Map, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { throttle, isNull } from 'lodash';
import { EODAG_TILE_URL, EODAG_TILE_COPYRIGHT } from './config';
import StorageService from './StorageService';
import { Geometry } from './types';
import { LeafletMouseEvent } from 'leaflet';

export interface IProps {}

export interface IState {
  lat: number;
  lon: number;
  zoom: number;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
  geometry: Geometry;
}

export default class MapExtentComponent extends React.Component<
  IProps,
  IState
> {
  /**
   * Leaflet map object
   */
  map: any;

  EditOptions = {
    polyline: false,
    polygon: true,
    circle: false,
    marker: false,
    circlemarker: false
  };
  constructor(props: IProps) {
    super(props);
    this.state = {
      lat: 46.8,
      lon: 1.8,
      zoom: 4,
      latMin: null,
      latMax: null,
      lonMin: null,
      lonMax: null,
      geometry: undefined
    };
  }

  /**
   * Waiting the app to load before attaching an observer to watch for plugin width change
   */
  componentDidMount() {
    // Reinit the extent stored in storage
    this.saveExtent();
    const that = this;
    const timer = setInterval(function () {
      var observer = new MutationObserver(function (mutations) {
        that.invalidateMapSize();
      });
      var target = document.querySelector('.jp-EodagWidget');
      if (target) {
        observer.observe(target, {
          attributes: true
        });
        clearInterval(timer);
      }
      that.invalidateMapSize();
    }, 100);
  }

  /**
   * Truncate the number to 6 digits
   * source: https://stackoverflow.com/a/49747203
   */
  truncateNumberOfDigits(number: number) {
    if (isNull(number)) {
      return number;
    }
    return parseInt(`${number * 1000000}`, 10) / 1000000;
  }

  /**
   * Save the extent in the session storage (object removed when browser closed)
   */
  saveExtent = () => {
    const { latMin, latMax, lonMin, lonMax } = this.state;
    const extent = {
      latMin: this.truncateNumberOfDigits(latMin),
      latMax: this.truncateNumberOfDigits(latMax),
      lonMin: this.truncateNumberOfDigits(lonMin),
      lonMax: this.truncateNumberOfDigits(lonMax)
    };
    StorageService.setExtent(extent);
  };

  /**
   * Function called every time the user (un)zoom,
   * but store that value max every 500 ms thanks to throttle
   */
  handleZoomEnd = throttle(e => {
    const zoom = e.target.getZoom();
    StorageService.setZoom(zoom);
  }, 500);

  /**
   * Function called every time the map should change its width,
   * but only redraw every 500ms thanks to throttle
   */
  invalidateMapSize = throttle(() => {
    this.map.leafletElement.invalidateSize();
  }, 500);

  /**
   * When the user starts to draw a new extent, we try to remove any extent already existing
   */
  onDrawStart = (e: any) => {
    let layerToRemove;
    e.target.eachLayer((method: any) => {
      if (method.getBounds && method.getBounds().isValid()) {
        // if the layer has a valid bounds, we can safely remove it
        layerToRemove = method;
      }
    });
    if (layerToRemove) {
      e.target.removeLayer(layerToRemove);
    }
  };

  onCreated = (e: LeafletMouseEvent) => {
    const geometry = e.layer.toGeoJSON()['geometry'];
    const bounds = e.layer.getBounds();
    this.setState(
      {
        geometry,
        latMin: bounds.getSouth(),
        latMax: bounds.getNorth(),
        lonMin: bounds.getWest(),
        lonMax: bounds.getEast()
      },
      () => {
        StorageService.setGeometry(geometry);
        this.saveExtent();
      }
    );
  };

  onEditStop = (e: any) => {
    if (e.layers.getLayers().length > 0) {
      const layer = e.layers.getLayers()[0];
      const bounds = layer.getBounds();
      const geometry = layer.toGeoJSON()['geometry'];
      this.setState(
        {
          geometry,
          latMin: bounds.getSouth(),
          latMax: bounds.getNorth(),
          lonMin: bounds.getWest(),
          lonMax: bounds.getEast()
        },
        () => {
          StorageService.setGeometry(geometry);
        }
      );
    }
  };

  onDeleted = (e: any) => {
    this.setState(
      {
        geometry: undefined,
        latMin: null,
        latMax: null,
        lonMin: null,
        lonMax: null
      },
      () => {
        StorageService.setGeometry(undefined);
        this.saveExtent();
      }
    );
  };

  render() {
    const { zoom, lat, lon } = this.state;
    const position: [number, number] = [lat, lon];
    return (
      <Map
        center={position}
        zoom={zoom}
        ref={ref => {
          this.map = ref;
        }}
        onzoomend={this.handleZoomEnd}
      >
        <TileLayer url={EODAG_TILE_URL} attribution={EODAG_TILE_COPYRIGHT} />
        <FeatureGroup>
          <EditControl
            position="topright"
            draw={this.EditOptions}
            onDrawStart={this.onDrawStart}
            onCreated={this.onCreated}
            onEdited={this.onEditStop}
            onDeleted={this.onDeleted}
          />
        </FeatureGroup>
      </Map>
    );
  }
}
