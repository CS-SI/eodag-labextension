/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

/**
 * Adress used to contact the EODAG server
 *
 * This is the notebook server REST API extension
 */
export const EODAG_SERVER_ADRESS = 'eodag';

/**
 * Adress used to retrieve tiles
 */
export const EODAG_TILE_URL =
  // 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
  'https://gisco-services.ec.europa.eu/maps/tms/OSMPositronComposite/EPSG3857/{z}/{x}/{-y}.png';
/**
 * Copyright displayed on the map for accessing tiles
 */
export const EODAG_TILE_COPYRIGHT =
  // '&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors';
  'European Commission-GISCO &copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors';

/**
 * Tile zoom offset
 */
export const EODAG_TILE_ZOOM_OFFSET = -1;

/**
 * Adress used to contact the EODAG settings
 */
export const EODAG_SETTINGS_ADDRESS = 'api/settings/eodag-labextension:plugin';
