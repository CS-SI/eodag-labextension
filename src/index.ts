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
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import '../style/index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import { EodagWidget } from './widget';

const NAMESPACE = 'eodag-widget';
const PLUGIN_ID = 'eodag-labextension:plugin';

/**
 * Initialization data for the eodag-labextension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [INotebookTracker, ILayoutRestorer, ISettingRegistry],
  activate: activate
};

/**
 * Load the map settings for the extension.
 * Each time the settings change, the map is updated.
 */
function loadSetting(setting: ISettingRegistry.ISettings): void {
  const eodagWidget = EodagWidget.getCurrentInstance();
  const map = setting.get('map').composite as {
    lat: number;
    lon: number;
    zoom: number;
  };

  if (eodagWidget && map) {
    const { lat, lon, zoom } = map;
    eodagWidget.updateMapSettings(lat, lon, zoom);
  }
}

/**
 * Activate the extension.
 */
function activate(
  app: JupyterFrontEnd,
  tracker: INotebookTracker,
  restorer: ILayoutRestorer,
  settings: ISettingRegistry
) {
  const { commands } = app;
  const eodagBrowser = new EodagWidget(tracker, commands);
  restorer.add(eodagBrowser, NAMESPACE);
  app.shell.add(eodagBrowser, 'left', { rank: 700 });

  Promise.all([app.restored, settings.load(PLUGIN_ID)])
    .then(([, setting]) => {
      loadSetting(setting);
      setting.changed.connect(loadSetting);
    })
    .catch(error => {
      console.error(
        `Something went wrong when reading the settings.\n${error}`
      );
    });
}

export default extension;
