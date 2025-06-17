import { useEffect, useState } from 'react';
import { IMapSettings } from '../components/browser';
import { ICustomError } from '../types';
import { showCustomErrorDialog } from '../components/customErrorDialog/customErrorDialog';

export const useEodagVersions = () => {
  const [eodagVersion, setEodagVersion] = useState<string | undefined>();
  const [eodagLabExtensionVersion, setEodagLabExtensionVersion] = useState<
    string | undefined
  >();
  const [mapSettings, setMapSettings] = useState<IMapSettings | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch('/eodag/info', {
          credentials: 'same-origin'
        });

        const contentType = res.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        let data: any;
        if (isJson) {
          data = await res.json();
        } else {
          data = await res.text();
        }

        if (!res.ok) {
          const customError: ICustomError = Object.assign(
            new Error(
              data?.error ||
                'Erreur lors de la récupération des informations EODAG.'
            ),
            {
              error:
                data?.error ||
                'Erreur lors de la récupération des informations EODAG.',
              details: data?.details || ''
            }
          );
          throw customError;
        }

        const { packages, map } = data;

        if (packages) {
          setEodagVersion(packages.eodag?.version || 'Unknown version');
          setEodagLabExtensionVersion(
            packages.eodag_labextension?.version || 'Unknown version'
          );
        }

        if (map) {
          setMapSettings({
            tileUrl: map.tile_url,
            tileAttribution: map.tile_attribution,
            zoomOffset: map.zoom_offset
          });
        }
      } catch (error: any) {
        const customError: ICustomError = Object.assign(
          new Error(error?.message || 'Erreur inconnue'),
          {
            error:
              error?.error ||
              'Erreur lors de la récupération des informations.',
            details: error?.details || ''
          }
        );
        await showCustomErrorDialog(customError);

        setEodagVersion('Error fetching version');
        setEodagLabExtensionVersion('Error fetching version');
      }
    };

    fetchInfo();
  }, []);

  return {
    eodagVersion,
    eodagLabExtensionVersion,
    mapSettings
  };
};
