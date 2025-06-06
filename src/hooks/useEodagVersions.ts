import { useEffect, useState } from 'react';
import { IMapSettings } from '../components/browser';

export const useEodagVersions = () => {
  const [eodagVersion, setEodagVersion] = useState<string | undefined>();
  const [eodagLabExtensionVersion, setEodagLabExtensionVersion] = useState<
    string | undefined
  >();
  const [mapSettings, setMapSettings] = useState<IMapSettings>({
    zoomOffset: 0,
    url: '',
    attributions: ''
  });

  useEffect(() => {
    fetch('/eodag/info')
      .then(res => res.json())
      .then(data => {
        const { packages } = data;
        if (packages) {
          setEodagVersion(packages.eodag.version || 'Unknown version');
          setEodagLabExtensionVersion(
            packages.eodag_labextension.version || 'Unknown version'
          );
          setMapSettings(packages.mapInfos);
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
