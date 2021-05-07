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

  onDrawStop = (e: LeafletMouseEvent) => {
    // We use drawStop instead of onCreated because the latter gives same geometry multiple times
    this.saveGeometry(e.target);
  };

  onEditStop = (e: any) => {
    this.saveGeometry(e.target);
  };

  onDeleted = (e: any) => {
    try {
      this.saveGeometry(e.target);
    } catch (TypeError) {
      // When clearAll `updateMapProperties` crash
      const geometry: Geometry = undefined;
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

  /**
   *  Save geometry in state and storage
   *
   * @param target
   * @returns
   */
  saveGeometry = (target: any) => {
    const geometry = this.getGeometry(target);
    this.setState(
      {
        geometry
      },
      () => {
        StorageService.setGeometry(geometry);
      }
    );
  };

  /**
   * Get Geometry as Polygon or MultiPolygon
   */
  getGeometry = (target: any) => {
    // I didn’t found a method from leaflet that returns a Multipolygon so we build it if there are more than one polygon
    const layers: any[] = [];
    let geometry: Geometry;
    target.eachLayer((l: any) => layers.push(l.toGeoJSON?.()));
    const geo = layers
      .filter(e => e?.type === 'Feature')
      .map(e => e.geometry)
      .filter(e => e.type === 'Polygon');
    if (geo.length > 1) {
      geometry = {
        type: 'MultiPolygon',
        coordinates: geo.map(e => e.coordinates)
      };
    } else {
      geometry = geo?.[0];
    }
    return geometry;
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
            onDrawStop={this.onDrawStop}
            onEdited={this.onEditStop}
            onDeleted={this.onDeleted}
          />
        </FeatureGroup>
      </Map>
    );
  }
}
