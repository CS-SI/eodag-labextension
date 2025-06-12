/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */
import { showErrorMessage } from '@jupyterlab/apputils';
import { URLExt } from '@jupyterlab/coreutils';
import {
  INotebookModel,
  INotebookTracker,
  Notebook,
  NotebookActions
} from '@jupyterlab/notebook';
import { concat, get, isNull, isUndefined } from 'lodash';
import ModalComponent from './ModalComponent';
import formatCode from './CodeGenerator';
import SearchService from './SearchService';
import { IFormInput, IGeometry, IParameter } from './types';
import { ServerConnection } from '@jupyterlab/services';
import * as React from 'react';
import { PlacesType, Tooltip, VariantType } from 'react-tooltip';
import { EODAG_SETTINGS_ADDRESS } from './config';
import { FormComponent } from './formComponent/FormComponent';
import { useFetchUserSettings } from './hooks/useFetchData';
import { IcBaselineRefresh } from './icones';
import { OptionsMenuDropdown } from './optionsDropdown';

export interface IProps {
  tracker: INotebookTracker;
  commands: any;
}

export interface IMapSettings {
  tile_attribution: string;
  tile_url: string;
  zoom_offset: number;
}

export interface IState {
  features: any;
  openDialog: any;
  searching: any;
  formValues: IFormInput | undefined;
  replaceCellIndex: number;
  isLoading: boolean;
  reloadIndicator: boolean;
  eodagVersion?: string;
  eodagLabExtensionVersion?: string;
  mapSettings?: IMapSettings;
}

const tooltipDark: VariantType = 'dark';
const tooltipBottom: PlacesType = 'bottom';

export class EodagBrowser extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      features: {},
      openDialog: false,
      searching: false,
      formValues: undefined,
      replaceCellIndex: 0,
      isLoading: false,
      reloadIndicator: false,
      eodagVersion: undefined,
      eodagLabExtensionVersion: undefined,
      mapSettings: undefined
    };
    this.reloadUserSettings = this.reloadUserSettings.bind(this);
  }

  componentDidMount() {
    fetch('/eodag/info')
      .then(res => res.json())
      .then(data => {
        const { packages, map } = data;
        if (packages) {
          this.setState({
            eodagVersion: packages.eodag.version || 'Unknown version',
            eodagLabExtensionVersion:
              packages.eodag_labextension.version || 'Unknown version',
            mapSettings: map
          });
        }
      })
      .catch(() => {
        this.setState({
          eodagVersion: 'Error fetching version',
          eodagLabExtensionVersion: 'Error fetching version'
        });
      });
  }

  handleCurrentWidgetError = () => {
    if (!this.props.tracker.currentWidget) {
      showErrorMessage('No active notebook', 'Please open a notebook first');

      return;
    }
    return true;
  };

  handleOpenEodagConfig = async () => {
    const filePath = '/eodag-config/eodag.yml';

    const widget = await this.props.commands.execute('docmanager:open', {
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
      this.reloadUserSettings();
    });
  };

  handleShowFeature = (features: any, openModal: boolean) => {
    this.setState({
      features,
      openDialog: openModal
    });
  };

  handleRetrieveMoreFeature = async () => {
    const { features } = this.state;
    this.setState({
      searching: true
    });
    return SearchService.search(
      get(features, 'properties.page', 1) + 1,
      this.state.formValues
    )
      .then(results => {
        const featureList = concat(
          get(features, 'features', []),
          results.features
        );
        this.setState({
          searching: false,
          features: {
            ...results,
            features: featureList
          }
        });
      })
      .catch(() => {
        //display error
        this.setState({
          searching: false
        });
      });
  };

  isRetrievingMoreFeature = () => {
    return this.state.searching;
  };

  getCodeCell = (code: string) => {
    return {
      cell_type: 'code',
      metadata: {
        trusted: false,
        collapsed: false,
        tags: ['Injected by EODAG plugin']
      },
      source: code
    };
  };

  getEodagSettings = async () => {
    const _serverSettings = ServerConnection.makeSettings();
    const _eodag_settings = URLExt.join(
      _serverSettings.baseUrl,
      _serverSettings.appUrl,
      `${EODAG_SETTINGS_ADDRESS}`
    );
    return fetch(URLExt.join(_eodag_settings), {
      credentials: 'same-origin'
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Bad response from server');
        }
        return res.json();
      })
      .then(data => {
        const { replaceCode } = data.settings;
        return replaceCode;
      });
  };

  handleCellInsertionPosition = (
    notebook: Notebook,
    model: INotebookModel,
    code: string,
    replaceCode: boolean
  ) => {
    const activeCellIndex = notebook.activeCellIndex;
    const cells = notebook.widgets;
    const searchString = '# Code generated by eodag-labextension,';
    const isReplaceCellExist =
      cells.filter(cell => cell.node.innerText.includes(searchString)).length >
      0
        ? true
        : false;

    if (cells.length > 0) {
      cells.forEach((cell, index) => {
        if (cell.node.innerText.includes(searchString)) {
          this.setState({
            replaceCellIndex: index
          });
        }
      });
    }
    const cell = this.getCodeCell(code);

    if (replaceCode && isReplaceCellExist) {
      notebook.activeCellIndex = this.state.replaceCellIndex;
      NotebookActions.deleteCells(notebook);
      NotebookActions.insertBelow(notebook);
      model.sharedModel.insertCell(this.state.replaceCellIndex, cell);
      notebook.activeCellIndex = this.state.replaceCellIndex;
    }

    if (replaceCode && !isReplaceCellExist) {
      this.setState({
        replaceCellIndex: activeCellIndex + 1
      });
      model.sharedModel.insertCell(activeCellIndex + 1, cell);
      NotebookActions.selectBelow(notebook);
    }

    if (!replaceCode) {
      model.sharedModel.insertCell(activeCellIndex + 1, cell);
      NotebookActions.selectBelow(notebook);
    }
  };

  handleGenerateQuery = async (parameters: IParameter[]) => {
    this.setState({
      openDialog: false
    });
    if (!this.props.tracker.currentWidget) {
      return;
    }

    const notebook = this.props.tracker.currentWidget.content;
    const model = notebook.model;
    if (isNull(model)) {
      showErrorMessage('no model', '');
      return;
    }

    while (!model.defaultKernelLanguage) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (model.defaultKernelLanguage !== 'python') {
      showErrorMessage(
        'Active notebook uses wrong kernel language. Only python is supported',
        ''
      );
      return;
    }

    if (model.readOnly) {
      showErrorMessage('Unable to inject cell into read-only notebook', '');
      return;
    }

    const replaceCode = await this.getEodagSettings();
    let input: IFormInput;
    if (isUndefined(this.state.formValues)) {
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
        geometry: geom
      };
    } else {
      input = this.state.formValues;
    }
    const code = formatCode(input, replaceCode);
    this.handleCellInsertionPosition(notebook, model, code, replaceCode);
  };

  handleCloseModal = () => {
    this.setState({
      openDialog: false
    });
  };

  handleOpenSettings = (): void => {
    this.props.commands.execute('settingeditor:open', { query: 'EODAG' });
  };

  updateLoadingState = () => {
    this.setState(prevState => ({
      isLoading: !prevState.isLoading,
      reloadIndicator: !prevState.reloadIndicator
    }));
  };

  reloadUserSettings = () => {
    useFetchUserSettings();
    this.updateLoadingState();
  };

  resetIsLoading = () => {
    this.updateLoadingState();
  };

  render() {
    const { openDialog, features, mapSettings } = this.state;
    return (
      <div className="jp-EodagWidget-products-search">
        <div className="jp-EodagWidget-header-wrapper">
          <header className="jp-EodagWidget-header">
            Products search by EODAG
          </header>
          <div className="jp-EodagWidget-settings-wrapper">
            <button
              type="button"
              className={'jp-EodagWidget-settingsbutton'}
              data-tooltip-id="eodag-setting"
              data-tooltip-content="Reload eodag environment"
              data-tooltip-variant={tooltipDark}
              data-tooltip-place={tooltipBottom}
              onClick={this.reloadUserSettings}
            >
              <IcBaselineRefresh
                height="20"
                width="20"
                className={this.state.isLoading ? 'spin-icon' : ''}
              />
              <Tooltip id="eodag-setting" className="jp-Eodag-tooltip" />
            </button>
            <OptionsMenuDropdown
              openSettings={this.handleOpenSettings}
              openEodagConfigEditor={this.handleOpenEodagConfig}
              version={this.state.eodagVersion ?? 'Loading ...'}
              labExtensionVersion={
                this.state.eodagLabExtensionVersion ?? 'Loading ...'
              }
            />
          </div>
        </div>
        <FormComponent
          isNotebookCreated={this.handleCurrentWidgetError}
          handleShowFeature={this.handleShowFeature}
          saveFormValues={(formValues: IFormInput) =>
            this.setState({ formValues })
          }
          handleGenerateQuery={this.handleGenerateQuery}
          reloadIndicator={this.state.reloadIndicator}
          onFetchComplete={this.resetIsLoading}
          mapSettings={mapSettings}
        />
        <ModalComponent
          open={openDialog}
          features={features}
          handleClose={this.handleCloseModal}
          handleGenerateQuery={this.handleGenerateQuery}
          isRetrievingMoreFeature={this.isRetrievingMoreFeature}
          handleRetrieveMoreFeature={this.handleRetrieveMoreFeature}
          mapSettings={mapSettings}
        />
      </div>
    );
  }
}
