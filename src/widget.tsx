/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import { INotebookTracker } from '@jupyterlab/notebook';
import { Widget } from '@lumino/widgets';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { EodagBrowser } from './browser';

import { LabIcon } from '@jupyterlab/ui-components';
import { Signal, ISignal } from '@lumino/signaling';
import iconSvgStr from '../style/icon.svg';

export const logoIcon = new LabIcon({
  name: 'eodag-labextension:logo',
  svgstr: iconSvgStr
});

export class EodagWidget extends Widget {
  tracker: INotebookTracker;
  commands: any;
  private static _instance: EodagWidget | null = null;
  _mapSettingsChanged = new Signal<
    this,
    { lat: number; lon: number; zoom: number }
  >(this);

  /**
   * Construct a new EodagBrowser widget.
   */
  constructor(tracker: INotebookTracker, commands: any) {
    super();
    if (!EodagWidget._instance) {
      EodagWidget._instance = this;
    }
    this.title.caption = 'EODAG';
    this.title.icon = logoIcon;
    this.id = 'eodag-widget';
    this.tracker = tracker;
    this.commands = commands;
    this.addClass('jp-EodagWidget');
    this.update();
  }

  static getCurrentInstance(): EodagWidget | null {
    return EodagWidget._instance;
  }

  get mapSettingsChanged(): ISignal<
    this,
    { lat: number; lon: number; zoom: number }
  > {
    return this._mapSettingsChanged;
  }

  updateMapSettings(lat: number, lon: number, zoom: number): void {
    this._mapSettingsChanged.emit({ lat, lon, zoom });
  }

  onUpdateRequest() {
    ReactDOM.unmountComponentAtNode(this.node);
    ReactDOM.render(
      <EodagBrowser tracker={this.tracker} commands={this.commands} />,
      this.node
    );
  }
}
