declare module '@react-leaflet/core/lib/context' {
  export type ControlledLayer = {
    addLayer(layer: import('leaflet').Layer): void;
    removeLayer(layer: import('leaflet').Layer): void;
  };
}
