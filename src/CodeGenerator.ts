/**
 * Generate the Python code for the notebook
 *
 * Copyright 2021 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

import { geojsonToWKT } from '@terraformer/wkt';

import { IFormInput } from './types';
import { formatDate } from './utils';

const formatCode = ({
  startDate,
  endDate,
  productType,
  geometry,
  cloud,
  additionnalParameters
}: IFormInput) => {
  const start = startDate ? formatDate(startDate) : undefined;
  const end = endDate ? formatDate(endDate) : undefined;

  const geometryIsOk = geometry?.type && geometry?.coordinates;

  let code = `from eodag import EODataAccessGateway, setup_logging

setup_logging(1) # 0: nothing, 1: only progress bars, 2: INFO, 3: DEBUG

dag = EODataAccessGateway()
`;
  if (geometryIsOk) {
    code += `geometry = "${geojsonToWKT(geometry)}"
`;
  }
  code += `search_results, total_count = dag.search(
  productType="${productType}",
`;
  if (geometryIsOk) {
    code += `  geom=geometry,
`;
  }
  if (start) {
    code += `  start="${start}",
`;
  }
  if (end) {
    code += `  end="${end}",
`;
  }
  if (cloud !== undefined) {
    code += `  cloudCover=${cloud},
`;
  }
  if (additionnalParameters?.length > 0) {
    code +=
      additionnalParameters
        .filter(({ name, value }) => name !== '' && value !== '')
        .map(({ name, value }) => `  ${name}="${value}",`)
        .join('\n') + '\n';
  }

  code += ')';
  return code;
};

export default formatCode;
