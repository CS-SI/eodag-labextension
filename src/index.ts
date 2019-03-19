import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';

import '../style/index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { EodagWidget } from './widget';

const NAMESPACE = 'eodag-widget';

/**
 * Initialization data for the jupyterlab-eodag extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-eodag',
  autoStart: true,
  activate,
  requires: [INotebookTracker, ILayoutRestorer]
};

/**
 * Activate the extension.
 */
function activate(app: JupyterLab, tracker: INotebookTracker, restorer: ILayoutRestorer) {
  const eodagBrowser = new EodagWidget(tracker);
  restorer.add(eodagBrowser, NAMESPACE);
  app.shell.addToLeftArea(eodagBrowser, {rank:700});
}

export default extension;
