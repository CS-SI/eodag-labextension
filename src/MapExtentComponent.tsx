/**
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import { Map, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { throttle } from 'lodash';
import { EODAG_TILE_URL, EODAG_TILE_COPYRIGHT } from './config';
import StorageService from './StorageService';
import { Geometry } from './types';
import { LeafletMouseEvent } from 'leaflet';

export interface IProps {}

export interface IState {
  lat: number;
  lon: number;
  zoom: number;
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
      geometry: undefined
    };
  }

  /**
   * Waiting the app to load before attaching an observer to watch for plugin width change
   */
  componentDidMount() {
    // Reinit the geometry stored in storage
    StorageService.setGeometry(undefined);
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
   * Function called every time the map should change its width,
   * but only redraw every 500ms thanks to throttle
   */
  invalidateMapSize = throttle(() => {
    this.map.leafletElement.invalidateSize();
  }, 500);

  onCreated = (e: LeafletMouseEvent) => {
    const geometry = e.layer.toGeoJSON()['geometry'];
    this.setState(
      {
        geometry
      },
      () => {
        StorageService.setGeometry(geometry);
      }
    );
  };

  onEditStop = (e: any) => {
    if (e.layers.getLayers().length > 0) {
      const layer = e.layers.getLayers()[0];
      const geometry = layer.toGeoJSON()['geometry'];
      this.setState(
        {
          geometry
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
        geometry: undefined
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
      >
        <TileLayer url={EODAG_TILE_URL} attribution={EODAG_TILE_COPYRIGHT} />
        <FeatureGroup>
          <EditControl
            position="topright"
            draw={this.EditOptions}
            onCreated={this.onCreated}
            onEdited={this.onEditStop}
            onDeleted={this.onDeleted}
          />
        </FeatureGroup>
      </Map>
    );
  }
}
