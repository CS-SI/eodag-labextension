import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { FeatureGroup, MapContainer, TileLayer } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { throttle } from 'lodash';
import { LeafletMouseEvent } from 'leaflet';
import { IGeometry } from '../../types';
import { EodagWidget } from '../../widget';
import { IMapSettings } from '../browser';

interface IMapExtentProps {
  onChange: (value: IGeometry | undefined) => void;
  geometry: IGeometry | undefined;
  mapSettings: IMapSettings;
}

export const MapExtent: React.FC<IMapExtentProps> = ({
  onChange,
  geometry,
  mapSettings
}) => {
  const [lat, setLat] = useState(46.8);
  const [lon, setLon] = useState(1.8);
  const [zoom, setZoom] = useState(mapSettings.zoomOffset || 4);
  const [_, setCurrentGeometry] = useState<IGeometry | undefined>(geometry);

  const mapRef = useRef<any>(null);
  const widgetRef = useRef<EodagWidget | null>(null);

  const EditOptions = useMemo(
    () => ({
      polyline: false,
      polygon: true,
      circle: false,
      marker: false,
      circlemarker: false
    }),
    []
  );

  const invalidateMapSize = useMemo(
    () =>
      throttle(() => {
        mapRef.current?.invalidateSize();
      }, 500),
    []
  );

  const handleMapSettingsChange = useCallback(
    (_: EodagWidget, settings: { lat: number; lon: number; zoom: number }) => {
      setLat(settings.lat);
      setLon(settings.lon);
      setZoom(settings.zoom);
    },
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const target = document.querySelector('.jp-EodagWidget');
      if (target) {
        const observer = new MutationObserver(() => {
          invalidateMapSize();
        });
        observer.observe(target, { attributes: true });
        clearInterval(timer);
      }
      invalidateMapSize();
    }, 100);

    widgetRef.current = EodagWidget.getCurrentInstance();
    widgetRef.current?.mapSettingsChanged.connect(handleMapSettingsChange);

    return () => {
      widgetRef.current?.mapSettingsChanged.disconnect(handleMapSettingsChange);
    };
  }, [handleMapSettingsChange, invalidateMapSize]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], zoom);
    }
  }, [lat, lon, zoom]);

  const getGeometry = useCallback((target: any): IGeometry | undefined => {
    const layers: any[] = [];
    target.eachLayer((l: any) => layers.push(l.toGeoJSON?.()));
    const geo = layers
      .filter(e => e?.type === 'Feature')
      .map(e => e.geometry)
      .filter(e => e.type === 'Polygon');
    if (geo.length > 1) {
      return {
        type: 'MultiPolygon',
        coordinates: geo.map(e => e.coordinates)
      };
    }
    return geo?.[0];
  }, []);

  const saveGeometry = useCallback(
    (target: any) => {
      const geometry = getGeometry(target);
      setCurrentGeometry(geometry);
      onChange(geometry);
    },
    [getGeometry, onChange]
  );

  const onDrawStop = useCallback(
    (e: LeafletMouseEvent) => saveGeometry(e.target),
    [saveGeometry]
  );

  const onEditStop = useCallback(
    (e: any) => saveGeometry(e.target),
    [saveGeometry]
  );

  const onDeleted = useCallback(
    (e: any) => {
      try {
        saveGeometry(e.target);
      } catch (error) {
        setCurrentGeometry(undefined);
        onChange(undefined);
      }
    },
    [saveGeometry, onChange]
  );

  const center: [number, number] = useMemo(() => [lat, lon], [lat, lon]);

  return (
    <MapContainer
      center={center}
      ref={ref => {
        mapRef.current = ref;
      }}
      zoom={zoom}
      minZoom={Math.abs(mapSettings.zoomOffset)}
    >
      <TileLayer
        url={mapSettings.tileUrl}
        attribution={mapSettings.tileAttribution}
        zoomOffset={mapSettings.zoomOffset}
      />
      <FeatureGroup>
        <EditControl
          position="topright"
          draw={EditOptions}
          onDrawStop={onDrawStop}
          onEdited={onEditStop}
          onDeleted={onDeleted}
        />
      </FeatureGroup>
    </MapContainer>
  );
};
