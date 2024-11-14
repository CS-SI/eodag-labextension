/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { throttle } from 'lodash';
import { EODAG_TILE_URL, EODAG_TILE_COPYRIGHT } from './config';
import { IGeometry } from './types';
import { LeafletMouseEvent } from 'leaflet';
import { throttle } from 'lodash';
import * as React from 'react';
import { FeatureGroup, Map, TileLayer } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { EODAG_TILE_COPYRIGHT, EODAG_TILE_URL } from './config';
import { IGeometry } from './types';
import { EodagWidget } from './widget';

export interface IProps {
  onChange: (value: IGeometry | undefined) => void;
  geometry: IGeometry | undefined;
}

export interface IState {
  lat: number;
  lon: number;
  zoom: number;
  geometry: IGeometry | undefined;
}

export default class MapExtentComponent extends React.Component<
  IProps,
  IState
> {
  /**
   * Leaflet map object
   */
  map: any;
  eodagWidget: EodagWidget | null = null;

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
      geometry: props.geometry
    };
    this.handleMapSettingsChange = this.handleMapSettingsChange.bind(this);
  }

  /**
   * Waiting the app to load before attaching an observer to watch for plugin width change
   */
  componentDidMount() {
    const timer = setInterval(() => {
      const observer = new MutationObserver(mutations => {
        this.invalidateMapSize();
      });
      const target = document.querySelector('.jp-EodagWidget');
      if (target) {
        observer.observe(target, {
          attributes: true
        });
        clearInterval(timer);
      }
      this.invalidateMapSize();
    }, 100);
    this.eodagWidget = EodagWidget.getCurrentInstance();
    this.eodagWidget?.mapSettingsChanged.connect(this.handleMapSettingsChange);
  }

  componentWillUnmount() {
    this.eodagWidget?.mapSettingsChanged.disconnect(
      this.handleMapSettingsChange
    );
  }

  handleMapSettingsChange(
    sender: EodagWidget,
    settings: { lat: number; lon: number; zoom: number }
  ) {
    const { lat, lon, zoom } = settings;
    this.setState({ lat, lon, zoom });
  }

  /**
   * Function called every time the map should change its width,
   * but only redraw every 500ms thanks to throttle
   */
  invalidateMapSize = throttle(() => {
    this.map?.leafletElement?.invalidateSize();
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
      const geometry: IGeometry | undefined = undefined;
      this.setState(
        {
          geometry
        },
        () => {
          this.props.onChange(geometry);
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
        this.props.onChange(geometry);
      }
    );
  };

  /**
   * Get Geometry as Polygon or MultiPolygon
   */
  getGeometry = (target: any) => {
    // I didn’t found a method from leaflet that returns a Multipolygon so we build it if there are more than one polygon
    const layers: any[] = [];
    let geometry: IGeometry;
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
      <MapContainer
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
      </MapContainer>
    );
  }
}
