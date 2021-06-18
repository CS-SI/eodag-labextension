/**
 * Copyright 2021 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Widget } from '@lumino/widgets';
import { INotebookTracker } from '@jupyterlab/notebook';
import { EodagBrowser } from './browser';

import { LabIcon } from '@jupyterlab/ui-components';
import iconSvgStr from '../style/icon.svg';

export const logoIcon = new LabIcon({
  name: 'eodag-labextension:logo',
  svgstr: iconSvgStr
});

export class EodagWidget extends Widget {
  tracker: INotebookTracker;
  /**
   * Construct a new EodagBrowser widget.
   */
  constructor(tracker: INotebookTracker) {
    super();
    this.title.caption = 'EODAG';
    this.title.icon = logoIcon;
    this.id = 'eodag-widget';
    this.tracker = tracker;
    this.addClass('jp-EodagWidget');
    this.update();
  }

  onUpdateRequest() {
    ReactDOM.unmountComponentAtNode(this.node);
    ReactDOM.render(<EodagBrowser tracker={this.tracker} />, this.node);
  }
}
