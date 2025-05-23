import React, { useEffect, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import { get, isEmpty } from 'lodash';
import L, { LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import { EODAG_TILE_COPYRIGHT, EODAG_TILE_URL } from '../config/config';

export interface IMapFeatureProps {
  features: any;
  zoomFeature: any;
  highlightFeature: any;
  handleHoverFeature: any;
  handleClickFeature: (productId: string) => void;
}

const DEFAULT_EXTENT_STYLE = {
  color: '#3f51b5',
  fillOpacity: 0.01
};

const HIGHLIGHT_EXTENT_STYLE = {
  color: '#76ff03',
  fillOpacity: 0.01
};

export const MapFeature: React.FC<IMapFeatureProps> = ({
  features,
  zoomFeature,
  highlightFeature,
  handleHoverFeature,
  handleClickFeature
}) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const [featureHover, setFeatureHover] = useState<string | null>(null);
  const [featureSelected, setFeatureSelected] = useState<string>('');

  const bounds = L.geoJSON(features?.features || []).getBounds();

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (zoomFeature) {
      map.eachLayer((layer: any) => {
        if (get(layer, 'feature.id') === highlightFeature?.id) {
          const layerBounds = layer.getBounds?.();
          if (layerBounds) {
            map.flyToBounds(layerBounds);
          }
        }
      });
    }
  }, [zoomFeature]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.eachLayer((layer: any) => {
      const layerId = get(layer, 'feature.id');
      if (highlightFeature && layerId === highlightFeature.id) {
        layer.bringToFront();
        layer.setStyle(HIGHLIGHT_EXTENT_STYLE);
      } else if (!highlightFeature && layerId === featureSelected) {
        layer.setStyle(DEFAULT_EXTENT_STYLE);
      }
    });
  }, [highlightFeature]);

  const onMouseOver = (e: LeafletMouseEvent) => {
    const productId = e.target.feature.id;
    handleHoverFeature(productId);
    e.target.setStyle(HIGHLIGHT_EXTENT_STYLE);
    e.target.bringToFront();
    setFeatureHover(productId);
  };

  const onMouseOut = (e: LeafletMouseEvent) => {
    handleHoverFeature(null);
    e.target.setStyle(DEFAULT_EXTENT_STYLE);
    setFeatureHover(null);
  };

  const onClick = (e: LeafletMouseEvent) => {
    const productId = e.target.feature.id;
    handleClickFeature(productId);
    e.target.setStyle(HIGHLIGHT_EXTENT_STYLE);
    e.target.bringToFront();
    setFeatureSelected(productId);
  };

  const getStyle = (feature: any) => {
    if (
      get(highlightFeature, 'id') === feature.id ||
      featureHover === feature.id ||
      featureSelected === feature.id
    ) {
      return HIGHLIGHT_EXTENT_STYLE;
    }
    return DEFAULT_EXTENT_STYLE;
  };

  const boundsLatLng = L.latLngBounds(
    L.latLng(bounds.getSouthWest().lat, bounds.getSouthWest().lng),
    L.latLng(bounds.getNorthEast().lat, bounds.getNorthEast().lng)
  );

  return (
    <MapContainer bounds={boundsLatLng} ref={map => (mapRef.current = map)}>
      <TileLayer url={EODAG_TILE_URL} attribution={EODAG_TILE_COPYRIGHT} />
      {!isEmpty(features) && (
        <GeoJSON
          key={`features-gson-${get(features, 'features', []).length}`}
          data={features}
          style={getStyle}
          onEachFeature={(feature, layer) => {
            layer.on({
              mouseover: onMouseOver,
              mouseout: onMouseOut,
              click: onClick
            });
          }}
        />
      )}
    </MapContainer>
  );
};
