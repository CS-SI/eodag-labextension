import { useEffect, useState } from 'react';
import { IMapSettings } from '../components/browser';

export const useEodagVersions = () => {
  const [eodagVersion, setEodagVersion] = useState<string | undefined>();
  const [eodagLabExtensionVersion, setEodagLabExtensionVersion] = useState<
    string | undefined
  >();
  const [mapSettings, setMapSettings] = useState<IMapSettings | undefined>(
    undefined
  );

  useEffect(() => {
    fetch('/eodag/info')
      .then(res => res.json())
      .then(data => {
        const { packages, map } = data;
        if (packages) {
          setEodagVersion(packages.eodag.version || 'Unknown version');
          setEodagLabExtensionVersion(
            packages.eodag_labextension.version || 'Unknown version'
          );
        }
        if (map) {
          setMapSettings({
            tileUrl: map.tile_url,
            tileAttribution: map.tile_attribution,
            zoomOffset: map.zoom_offset
          });
        }
      })
      .catch(() => {
        setEodagVersion('Error fetching version');
        setEodagLabExtensionVersion('Error fetching version');
      });
  }, []);

  return {
    eodagVersion,
    eodagLabExtensionVersion,
    mapSettings
  };
};
