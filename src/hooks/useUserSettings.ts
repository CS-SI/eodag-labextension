import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { EODAG_SERVER_ADDRESS } from '../config/config';
import { showErrorMessage } from '@jupyterlab/apputils';
import { useState } from 'react';
import { CommandRegistry } from '@lumino/commands';

export const serverSettings = ServerConnection.makeSettings();
export const eodagServer = URLExt.join(
  serverSettings.baseUrl,
  EODAG_SERVER_ADDRESS
);

export const useUserSettings = () => {
  const [isUserSettingsLoading, setIsUserSettingsLoading] =
    useState<boolean>(false);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch(URLExt.join(eodagServer, 'reload'), {
        credentials: 'same-origin'
      });
      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
    } catch (error) {
      showErrorMessage(
        'EODAG server error',
        `Unable to contact the EODAG server. Are you sure the address is ${eodagServer}/ ?`
      );
    }
  };

  const handleOpenEodagConfig = async (commands: CommandRegistry) => {
    // File that uses a symbolic link to the eodag config file
    // present in the ~/.config/eodag/eodag.yml
    const filePath = '/eodag-config/eodag.yml';

    const widget = await commands.execute('docmanager:open', {
      path: filePath,
      factory: 'Editor'
    });

    const context = widget.context;

    let isInitial = true;

    context.fileChanged.connect(() => {
      if (isInitial) {
        // Ignore the first change (on open)
        isInitial = false;
        return;
      }

      // Only called on subsequent file changes (i.e., saves)
      reloadUserSettings();
    });
  };

  const reloadUserSettings = async () => {
    fetchUserSettings().then(() => {
      setIsUserSettingsLoading(false);
    });
  };

  return {
    handleOpenEodagConfig,
    isUserSettingsLoading,
    reloadUserSettings
  };
};
