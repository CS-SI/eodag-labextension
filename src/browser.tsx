/**
 * Copyright 2021 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import { NotebookActions, INotebookTracker } from '@jupyterlab/notebook';
import { CodeCellModel } from '@jupyterlab/cells';
import { showErrorMessage } from '@jupyterlab/apputils';
import { concat, get } from 'lodash';
import { FormComponent } from './FormComponent';
import ModalComponent from './ModalComponent';
import formatCode from './CodeGenerator';
import SearchService from './SearchService';
import { IFormInput } from './types';

export interface IProps {
  tracker: INotebookTracker;
}

export interface IState {
  features: any;
  openDialog: any;
  searching: any;
  formValues: IFormInput;
}

export class EodagBrowser extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      features: {},
      openDialog: false,
      searching: false,
      formValues: undefined
    };
  }

  handleShowFeature = (features: any) => {
    this.setState({
      features,
      openDialog: true
    });
  };
  handleRetrieveMoreFeature = () => {
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
    return new CodeCellModel({
      cell: {
        cell_type: 'code',
        metadata: {
          trusted: false,
          collapsed: false,
          tags: ['Injected by EODAG plugin']
        },
        source: [code]
      }
    });
  };

  handleGenerateQuery = () => {
    this.setState({
      openDialog: false
    });
    if (!this.props.tracker.currentWidget) {
      return;
    }
    const notebook = this.props.tracker.currentWidget.content;
    const model = notebook.model;
    if (model.defaultKernelLanguage !== 'python') {
      showErrorMessage(
        'Active notebook uses wrong kernel language. Only python is supported',
        {}
      );
      return;
    }
    if (model.readOnly) {
      showErrorMessage('Unable to inject cell into read-only notebook', {});
      return;
    }
    const code = formatCode(this.state.formValues);
    const cell = this.getCodeCell(code);
    const activeCellIndex = notebook.activeCellIndex;
    model.cells.insert(activeCellIndex + 1, cell);
    NotebookActions.selectBelow(notebook);
  };
  handleCloseModal = () => {
    this.setState({
      openDialog: false
    });
  };

  render() {
    const { openDialog, features } = this.state;
    return (
      <div>
        <header className="jp-EodagWidget-header">Products search</header>
        <FormComponent
          handleShowFeature={this.handleShowFeature}
          saveFormValues={(formValues: IFormInput) =>
            this.setState({ formValues })
          }
        />
        <ModalComponent
          open={openDialog}
          features={features}
          handleClose={this.handleCloseModal}
          handleGenerateQuery={this.handleGenerateQuery}
          isRetrievingMoreFeature={this.isRetrievingMoreFeature}
          handleRetrieveMoreFeature={this.handleRetrieveMoreFeature}
        />
      </div>
    );
  }
}
