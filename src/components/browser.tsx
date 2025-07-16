/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */
import { showErrorMessage } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { isNull, isUndefined } from 'lodash';
import { Modal } from './modal/modal';
import { codeGenerator } from '../utils/codeGenerator';
import { IFeatures, IFormInput, IParameter } from '../types';
import React, { useState } from 'react';
import { CommandRegistry } from '@lumino/commands';
import { FormComponent } from './formComponent/formComponent';
import { HeaderDropdown } from './headerDropdown/headerDropdown';
import { useFetchProviders } from '../hooks/useFetchProviders';
import { useFetchProducts } from '../hooks/useFetchProducts';
import { useVirtualizedList } from '../hooks/useVirtualizedList';
import { useEodagVersions } from '../hooks/useEodagVersions';
import { useNotebookInjection } from '../hooks/useNotebookInjection';
import { useEodagSettings } from '../hooks/useEodagSettings';
import { useUserSettings } from '../hooks/useUserSettings';
import { useProductsForm } from '../hooks/useProductsForm';
import { IconButton, Tooltip as MuiTooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface IEodagBrowserProps {
  tracker: INotebookTracker;
  commands: CommandRegistry;
}

export interface IMapSettings {
  tileAttribution: string;
  tileUrl: string;
  zoomOffset: number;
}

export const EodagBrowser: React.FC<IEodagBrowserProps> = ({
  tracker,
  commands
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [features, setFeatures] = useState<IFeatures | null>(null);
  const { fetchProviders, fetchProvidersLoading } = useFetchProviders();
  const { fetchProducts, fetchProductLoading } = useFetchProducts();
  const { insertCode } = useNotebookInjection();
  const { getEodagSettings } = useEodagSettings();
  const { eodagLabExtensionVersion, eodagVersion, mapSettings } =
    useEodagVersions();
  const { handleOpenEodagConfig, reloadUserSettings, isUserSettingsLoading } =
    useUserSettings();

  const { formValues, form } = useProductsForm();

  const { isRetrievingMoreFeature, handleRetrieveMoreFeature } =
    useVirtualizedList({ features, formValues, setFeatures });

  const ensureNotebookIsOpen = async (): Promise<boolean> => {
    const openNewNotebook = async (): Promise<NotebookPanel> => {
      const nbPanel = (await commands.execute('notebook:create-new', {
        path: '',
        kernelName: 'python3'
      })) as NotebookPanel;

      await nbPanel.context.ready;
      return nbPanel;
    };

    if (!tracker.currentWidget) {
      try {
        await openNewNotebook();
        return true;
      } catch (error) {
        showErrorMessage('Failed to open a new notebook', error as string);
        return false;
      }
    }
    return true;
  };

  const handleShowFeature = (features: any, openModal: boolean) => {
    setFeatures(features);
    setOpenModal(openModal);
  };

  const handleGenerateQuery = async (params: IParameter[]) => {
    const notebookReady = await ensureNotebookIsOpen();
    if (!notebookReady) {
      return;
    }
    setOpenModal(false);
    if (!tracker.currentWidget) {
      return;
    }

    const notebook = tracker.currentWidget.content;
    const model = notebook.model;
    if (isNull(model)) {
      return showErrorMessage('no model', '');
    }

    while (!model.defaultKernelLanguage) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (model.defaultKernelLanguage !== 'python') {
      return showErrorMessage(
        'Active notebook uses wrong kernel language. Only python is supported',
        ''
      );
    }

    if (model.readOnly) {
      return showErrorMessage(
        'Unable to inject cell into read-only notebook',
        ''
      );
    }

    const idParam = params.find(p => p.key === 'id');
    const idValue = idParam?.value?.id;

    const settings = await getEodagSettings();
    const replaceCode = settings.replaceCode;
    let input: IFormInput;
    if (isUndefined(formValues)) {
      input = {
        startDate: new Date(),
        endDate: new Date(),
        productType: null,
        provider: null,
        cloud: 100,
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        id: idValue
      };
    } else {
      if (idValue) {
        input = {
          provider: formValues.provider,
          productType: formValues.productType,
          id: idValue
        };
      } else {
        input = formValues as IFormInput;
      }
    }
    insertCode(
      notebook,
      model,
      await codeGenerator(input, replaceCode),
      replaceCode
    );
  };

  return (
    <div className="jp-EodagWidget-products-search">
      <div className="jp-EodagWidget-header-wrapper">
        <header className="jp-EodagWidget-header">
          {'Products search by EODAG'}
        </header>
        <div className="jp-EodagWidget-settings-wrapper">
          <MuiTooltip title={'Reload eodag environment'}>
            <IconButton
              aria-label="Options"
              size="small"
              onClick={reloadUserSettings}
              sx={{
                color: '#000000'
              }}
              disabled={
                fetchProductLoading ||
                fetchProvidersLoading ||
                isUserSettingsLoading
              }
            >
              <RefreshIcon
                sx={{ width: '1.25rem', height: '1.25rem' }}
                className={isUserSettingsLoading ? 'spin-icon' : ''}
              />
            </IconButton>
          </MuiTooltip>
          <HeaderDropdown
            openSettings={() =>
              commands.execute('settingeditor:open', { query: 'EODAG' })
            }
            openEodagConfigEditor={() => handleOpenEodagConfig(commands)}
            version={eodagVersion ?? 'Loading ...'}
            labExtensionVersion={eodagLabExtensionVersion ?? 'Loading ...'}
          />
        </div>
      </div>
      <FormComponent
        form={form}
        ensureNotebookIsOpen={ensureNotebookIsOpen}
        handleShowFeature={handleShowFeature}
        handleGenerateQuery={handleGenerateQuery}
        mapSettings={mapSettings}
        fetchProducts={fetchProducts}
        fetchProductsLoading={fetchProductLoading}
        fetchProviders={fetchProviders}
        fetchProvidersLoading={fetchProvidersLoading}
      />
      <Modal
        open={openModal}
        features={features}
        handleClose={() => setOpenModal(false)}
        handleGenerateQuery={handleGenerateQuery}
        isRetrievingMoreFeature={isRetrievingMoreFeature}
        handleRetrieveMoreFeature={handleRetrieveMoreFeature}
        mapSettings={mapSettings}
      />
    </div>
  );
};
