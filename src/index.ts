
import { ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';

import '../style/index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { EodagWidget } from './widget';

const NAMESPACE = 'eodag-widget';

/**
 * Initialization data for the eodag-labextension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  autoStart: true,
  id: 'eodag-labextension',
  requires: [INotebookTracker, ILayoutRestorer],
};

/**
 * Activate the extension.
 */
function activate(app: JupyterFrontEnd, tracker: INotebookTracker, restorer: ILayoutRestorer) {
  const eodagBrowser = new EodagWidget(tracker);
  restorer.add(eodagBrowser, NAMESPACE);
  app.shell.add(eodagBrowser, 'left', {rank:700});
}

export default plugin;
