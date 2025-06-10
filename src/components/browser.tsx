/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */
import { showErrorMessage } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { isNull, isUndefined } from 'lodash';
import { Modal } from './modal/modal';
import { codeGenerator } from '../utils/codeGenerator';
import { IFeatures, IFormInput, IGeometry, IParameter } from '../types';
import React, { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { CommandRegistry } from '@lumino/commands';
import { FormComponent } from './formComponent/formComponent';
import { IcBaselineRefresh } from './icons';
import { OptionsMenuDropdown } from './menuDropdown/optionsDropdown';
import { useFetchProviders } from '../hooks/useFetchProviders';
import { useFetchProducts } from '../hooks/useFetchProducts';
import { useVirtualizedList } from '../hooks/useVirtualizedList';
import { useEodagVersions } from '../hooks/useEodagVersions';
import { useNotebookInjection } from '../hooks/useNotebookInjection';
import { useEodagSettings } from '../hooks/useEodagSettings';
import { useUserSettings } from '../hooks/useUserSettings';
import { useCacheResults } from '../hooks/useCacheResults';

export interface IEodagBrowserProps {
  tracker: INotebookTracker;
  commands: CommandRegistry;
}

export interface IMapSettings {
  attributions: string;
  url: string;
  zoomOffset: number;
}

export const EodagBrowser: React.FC<IEodagBrowserProps> = ({
  tracker,
  commands
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [formValues, setFormValues] = useState<IFormInput | undefined>();
  const [features, setFeatures] = useState<IFeatures | null>(null);
  const { fetchProviders, fetchProvidersLoading } = useFetchProviders();
  const { fetchProducts, fetchProductLoading } = useFetchProducts();
  const { insertCode } = useNotebookInjection();
  const { getEodagSettings } = useEodagSettings();
  const { eodagLabExtensionVersion, eodagVersion, mapSettings } =
    useEodagVersions();
  const { isRetrievingMoreFeature, handleRetrieveMoreFeature } =
    useVirtualizedList({ features, formValues, setFeatures });
  const { handleOpenEodagConfig, reloadUserSettings, isUserSettingsLoading } =
    useUserSettings();
  const { cachedResults } = useCacheResults(formValues, features);

  useEffect(() => {
    console.log('cachedResults', cachedResults);
  }, [cachedResults]);

  const handleCurrentWidgetError = () => {
    if (!tracker.currentWidget) {
      return showErrorMessage(
        'No active notebook',
        'Please open a notebook first'
      );
    }
    return true;
  };

  const handleShowFeature = (features: any, openModal: boolean) => {
    setFeatures(features);
    setOpenModal(openModal);
  };

  const handleGenerateQuery = async (params: IParameter[]) => {
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

    const replaceCode = await getEodagSettings();
    let input: IFormInput;
    if (isUndefined(formValues)) {
      const geom: IGeometry = {
        type: 'Point',
        coordinates: [0, 0]
      };
      input = {
        startDate: new Date(),
        endDate: new Date(),
        productType: '',
        provider: '',
        cloud: 100,
        geometry: geom,
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
        input = formValues;
      }
    }
    insertCode(notebook, model, codeGenerator(input, replaceCode), replaceCode);
  };

  return (
    <div className="jp-EodagWidget-products-search">
      <div className="jp-EodagWidget-header-wrapper">
        <header className="jp-EodagWidget-header">
          Products search by EODAG
        </header>
        <div className="jp-EodagWidget-settings-wrapper">
          <button
            type="button"
            className={'jp-EodagWidget-settingsButton'}
            data-tooltip-id="eodag-setting"
            data-tooltip-content="Reload eodag environment"
            data-tooltip-variant={'dark'}
            data-tooltip-place={'bottom'}
            disabled={fetchProductLoading || fetchProvidersLoading}
            onClick={reloadUserSettings}
          >
            <IcBaselineRefresh
              height="20"
              width="20"
              className={isUserSettingsLoading ? 'spin-icon' : ''}
            />
            <Tooltip id="eodag-setting" className="jp-Eodag-tooltip" />
          </button>
          <OptionsMenuDropdown
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
        isNotebookCreated={handleCurrentWidgetError}
        handleShowFeature={handleShowFeature}
        saveFormValues={(formValues: IFormInput) => setFormValues(formValues)}
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
      />
    </div>
  );
};
