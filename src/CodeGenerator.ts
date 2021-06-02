/**
 * Generate the Python code for the notebook
 *
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
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

  const geometryIsOk = geometry.type && geometry.coordinates;

  let code = `from eodag import EODataAccessGateway
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
  if (additionnalParameters) {
    code += additionnalParameters
      .map(({ name, value }) => `  ${name}="${value}",`)
      .join('\n');
  }

  code += `
  )`;
  return code;
};

export default formatCode;
