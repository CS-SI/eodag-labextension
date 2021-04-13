/**
 * Generate the Python code for the notebook
 *
 * Copyright 2020 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
*/

import { Extent, SearchDTO } from "./types"
import { formatDate } from "./utils";

export interface FormatCodeProps extends SearchDTO {
  extent: Extent,
}

const formatCode = ({startDate, endDate, productType, extent, cloud}: FormatCodeProps) => {

  const start = startDate ? formatDate(startDate) : undefined;
  const end = endDate ? formatDate(endDate) : undefined;

  let code = `from eodag import EODataAccessGateway
dag = EODataAccessGateway()
product_type = '${productType}'
`
  if (extent.lonMin && extent.latMin && extent.lonMax && extent.latMax) {
    code += `footprint = {'lonmin': ${extent.lonMin}, 'latmin': ${extent.latMin}, 'lonmax': ${extent.lonMax}, 'latmax': ${extent.latMax}}
`
  }
  if (cloud) {
    code += `cloud_cover = ${cloud}
`
  }
  if (start && end) {
    code += `start, end = '${start}', '${end}'
`
  } else if (start) {
    code += `start = '${start}'
`
  } else if (end) {
    code += `end = '${end}'
`
  }
  code += `search_results, estimated_total_nbr_of_results = dag.search(
  productType=product_type,
`
  if (extent.lonMin && extent.latMin && extent.lonMax && extent.latMax) {
    code += `  box=footprint,
`
  }
  if (start) {
    code += `  start=start,
`
  } 
  if (end) {
    code += `  end=end,
`
  } 
  if (cloud) {
    code += `  cloudCover=cloud_cover,
`
  }
  code += ")"
  return code
}

export default formatCode