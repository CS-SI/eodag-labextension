/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';

import '../style/index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { EodagWidget } from './widget';

const NAMESPACE = 'eodag-widget';

/**
 * Initialization data for the eodag-labextension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'eodag-labextension:plugin',
  autoStart: true,
  requires: [INotebookTracker, ILayoutRestorer],
  activate: activate
};

/**
 * Activate the extension.
 */
function activate(
  app: JupyterFrontEnd,
  tracker: INotebookTracker,
  restorer: ILayoutRestorer
) {
  const { commands } = app;
  const eodagBrowser = new EodagWidget(tracker, commands);
  restorer.add(eodagBrowser, NAMESPACE);
  app.shell.add(eodagBrowser, 'left', { rank: 700 });
}

export default extension;
