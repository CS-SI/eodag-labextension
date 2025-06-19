import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { EODAG_SERVER_ADDRESS } from '../config/config';
import { useState } from 'react';
import { CommandRegistry } from '@lumino/commands';
import { showCustomErrorDialog } from '../components/customErrorDialog/customErrorDialog';
import { formatCustomError } from '../utils/formatErrors';

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
      if (!response.ok) {
        const msg = await response.json();
        throw {
          error: msg.error ?? 'Unknown error',
          details: msg.details ?? ''
        };
      }
    } catch (error) {
      showCustomErrorDialog(
        formatCustomError(error),
        'EODAG Labextension - reload error'
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
    setIsUserSettingsLoading(true);

    const delay = new Promise(resolve => setTimeout(resolve, 500));

    try {
      await Promise.all([fetchUserSettings(), delay]);
    } finally {
      setIsUserSettingsLoading(false);
    }
  };

  return {
    handleOpenEodagConfig,
    isUserSettingsLoading,
    reloadUserSettings
  };
};
