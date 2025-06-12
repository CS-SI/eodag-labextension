/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import { FeatureGroup, MapContainer, TileLayer } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { throttle } from 'lodash';
import { IGeometry } from './types';
import { LeafletMouseEvent } from 'leaflet';
import { EodagWidget } from './widget';
import { IMapSettings } from './browser';

export interface IProps {
  onChange: (value: IGeometry | undefined) => void;
  geometry: IGeometry | undefined;
  mapSettings: IMapSettings;
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
  /**
   * Function called every time the map should change its width,
   * but only redraw every 500ms thanks to throttle
   */
  invalidateMapSize = throttle(() => {
    this.map?.invalidateSize();
  }, 500);

  constructor(props: IProps) {
    super(props);
    this.state = {
      lat: 46.8,
      lon: 1.8,
      zoom: props.mapSettings?.zoom_offset || 4,
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
    _sender: EodagWidget,
    settings: { lat: number; lon: number; zoom: number }
  ) {
    const { lat, lon, zoom } = settings;
    this.setState({ lat, lon, zoom });
  }

  componentDidUpdate(_: IProps, prevState: IState) {
    const { lat, lon, zoom } = this.state;
    if (
      this.map &&
      (prevState.lat !== lat ||
        prevState.lon !== lon ||
        prevState.zoom !== zoom)
    ) {
      this.map.flyTo([lat, lon], zoom);
    }
  }

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
    const { mapSettings } = this.props;
    const { tile_url, tile_attribution, zoom_offset } = mapSettings;
    const position: [number, number] = [lat, lon];
    return (
      <MapContainer
        center={position}
        zoom={zoom}
        ref={ref => {
          this.map = ref;
        }}
        minZoom={Math.abs(zoom_offset)}
      >
        <TileLayer
          url={tile_url}
          attribution={tile_attribution}
          zoomOffset={zoom_offset}
        />
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
