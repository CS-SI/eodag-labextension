import React, { useCallback, useEffect, useRef } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import { get, isEmpty } from 'lodash';
import L from 'leaflet';
import { IFeatures, IProduct } from '../../types';
import { IMapSettings } from 'components/browser';

export interface IMapFeatureProps {
  features: IFeatures | null;
  zoomFeature: IProduct | null;
  selectedFeature: IProduct | null;
  hoveredFeatureId: string | null;
  setHoveredFeature: (productId: string | null) => void;
  handleClickFeature: (productId: string) => void;
  mapSettings: IMapSettings;
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
  selectedFeature,
  zoomFeature,
  hoveredFeatureId,
  setHoveredFeature,
  handleClickFeature,
  mapSettings
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const map = mapRef.current;

  const bounds = L.geoJSON(features?.features || []).getBounds();

  const zoomToFeature = (feature: IProduct | null) => {
    if (!map || !feature) {
      return;
    }
    let found = false;

    if (map) {
      map.eachLayer((layer: any) => {
        if (found) {
          // Early return so that we don't loop over useless layers
          return;
        }

        const layerId = get(layer, 'feature.id');
        if (feature && layerId === feature.id) {
          found = true;
          layer.bringToFront();

          const layerBounds = layer.getBounds?.();
          if (!layerBounds) {
            return;
          }

          const center = layerBounds.getCenter();

          // Compute the optimal zoom level for the selected layer
          const optimalZoom = map.getBoundsZoom(layerBounds);
          const targetZoom = Math.min(optimalZoom - 2, map.getMaxZoom()); // -2 is arbitrary but seems to work well

          // Convert to pixel coordinates
          const centerPoint = map.project(center, targetZoom);

          // Offset the point: shift to the left and down,
          // to make space for the "results" component
          // Values are arbitrary once again, but they seem to work well
          const offsetX = -map.getSize().x / 7;
          const offsetY = map.getSize().y / 7;
          const offsetPoint = centerPoint.add([offsetX, offsetY]);

          // Convert back to lat/lng
          const offsetLatLng = map.unproject(offsetPoint, targetZoom);

          map.flyTo(offsetLatLng, targetZoom, {
            animate: true,
            duration: 0.75
          });
        }
      });
    }
  };

  useEffect(() => {
    zoomToFeature(selectedFeature);
  }, [selectedFeature]);

  useEffect(() => {
    zoomToFeature(zoomFeature);
  }, [zoomFeature]);

  const getStyle = useCallback(
    (feature: any) => {
      if (
        hoveredFeatureId === feature.id ||
        (selectedFeature && selectedFeature.id === feature.id)
      ) {
        return HIGHLIGHT_EXTENT_STYLE;
      }
      return DEFAULT_EXTENT_STYLE;
    },
    [hoveredFeatureId, selectedFeature]
  );

  const boundsLatLng = L.latLngBounds(
    L.latLng(bounds.getSouthWest().lat, bounds.getSouthWest().lng),
    L.latLng(bounds.getNorthEast().lat, bounds.getNorthEast().lng)
  );

  return (
    <MapContainer
      zoomControl={false}
      bounds={boundsLatLng}
      ref={ref => {
        if (ref) {
          mapRef.current = ref;
        }
      }}
      minZoom={Math.abs(mapSettings.zoomOffset)}
    >
      <TileLayer
        url={mapSettings.tileUrl}
        attribution={mapSettings.tileAttribution}
        zoomOffset={mapSettings.zoomOffset}
      />
      {!isEmpty(features) && (
        <GeoJSON
          key={features?.features?.length}
          data={features}
          style={getStyle}
          onEachFeature={(_, layer) => {
            layer.on({
              mouseover: e => setHoveredFeature(e.target.feature.id),
              mouseout: () => setHoveredFeature(null),
              click: e => handleClickFeature(e.target.feature.id)
            });
          }}
        />
      )}
    </MapContainer>
  );
};
