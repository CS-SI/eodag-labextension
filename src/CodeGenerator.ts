/**
 * Generate the Python code for the notebook
 *
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import { geojsonToWKT } from '@terraformer/wkt';

import { IFormInput } from './types';
import { formatDate } from './utils';

const formatCode = (
  {
    startDate,
    endDate,
    productType,
    geometry,
    cloud,
    additionnalParameters,
    provider
  }: IFormInput,
  replaceCode: boolean
) => {
  const start = startDate ? formatDate(startDate) : undefined;
  const end = endDate ? formatDate(endDate) : undefined;
  const tab = ' '.repeat(4);
  const geometryIsOk = geometry?.type && geometry?.coordinates;

  const replacedCellIntro =
    '# Code generated by eodag-labextension, will be automatically replaced if a new search is performed';
  const standardMessage = `from eodag import EODataAccessGateway, setup_logging

setup_logging(1)  # 0: nothing, 1: only progress bars, 2: INFO, 3: DEBUG

dag = EODataAccessGateway()`;

  let code = replaceCode
    ? `${replacedCellIntro}
${standardMessage}`
    : `${standardMessage}`;

  if (geometryIsOk) {
    code += `
geometry = "${geojsonToWKT(geometry)}"`;
  }
  code += `
search_results = dag.search(`;
  if (provider) {
    code += `
    provider="${provider}",`;
  }
  code += `
    productType="${productType}",`;
  if (geometryIsOk) {
    code += `
    geom=geometry,`;
  }
  if (start) {
    code += `
    start="${start}",`;
  }
  if (end) {
    code += `
    end="${end}",`;
  }
  if (cloud !== 100) {
    code += `
    cloudCover=${cloud},`;
  }
  if (additionnalParameters[0].name && additionnalParameters[0].value) {
    code +=
      '\n' +
      tab +
      '**{\n' +
      additionnalParameters
        .filter(
          ({ name, value }) => name && value && name !== '' && value !== ''
        )
        .filter(({ name, value }) => name !== '' && value !== '')
        .map(
          ({ name, value }) =>
            `${tab + tab}"${name.trim()}": "${value.trim()}",`
        )
        .join('\n');
    code += '\n' + `${tab}}`;
  }
  code += '\n)';

  return code;
};

export default formatCode;
