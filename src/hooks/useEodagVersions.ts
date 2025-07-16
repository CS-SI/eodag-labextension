import { useEffect, useState } from 'react';
import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';
import { EODAG_SERVER_ADDRESS } from '../config/config';
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
        const serverSettings = ServerConnection.makeSettings();
        const eodagServer = URLExt.join(
          serverSettings.baseUrl,
          EODAG_SERVER_ADDRESS
        );
        const res = await fetch(URLExt.join(eodagServer, 'info'), {
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
          throw {
            name: '',
            title: data?.error || 'Error while fetching EODAG information',
            details: data?.details || ''
          };
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
        const customError: ICustomError = {
          name: '',
          title: error?.error || 'Error while fetching information.',
          details: error?.details || ''
        };
        await showCustomErrorDialog(
          customError,
          'EODAG Labextension - info fetch error'
        );

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
