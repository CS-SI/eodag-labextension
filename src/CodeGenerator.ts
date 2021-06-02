/**
 * Generate the Python code for the notebook
 *
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

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
from shapely.geometry import shape
dag = EODataAccessGateway()
product_type = '${productType}'
`;
  if (geometryIsOk) {
    code += `footprint = shape(${JSON.stringify(geometry)})
`;
  }
  if (cloud) {
    code += `cloud_cover = ${cloud}
`;
  }
  if (start && end) {
    code += `start, end = '${start}', '${end}'
`;
  } else if (start) {
    code += `start = '${start}'
`;
  } else if (end) {
    code += `end = '${end}'
`;
  }
  code += `search_results, estimated_total_nbr_of_results = dag.search(
  productType=product_type,
`;
  if (geometryIsOk) {
    code += `  geom=footprint,
`;
  }
  if (start) {
    code += `  start=start,
`;
  }
  if (end) {
    code += `  end=end,
`;
  }
  if (cloud) {
    code += `  cloudCover=cloud_cover,
`;
  }
  if (additionnalParameters) {
    code += additionnalParameters
      .map(({ name, value }) => `  ${name}="${value}",`)
      .join('\n');
  }

  code += ')';
  return code;
};

export default formatCode;
