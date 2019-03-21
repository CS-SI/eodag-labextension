/**
 * Generate the Python code for the notebook
 */
const formatCode = (start, end, productType, extent, cloud) => {

  let code = `import os
from eodag import EODataAccessGateway
dag = EODataAccessGateway(user_conf_file_path=os.environ["EODAG_CFG_FILE"])
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
  product_type,
`
  if (extent.lonMin && extent.latMin && extent.lonMax && extent.latMax) {
    code += `  geometry=footprint,
`
  }
  if (start) {
    code += `  startTimeFromAscendingNode=start,
`
  } 
  if (end) {
    code += `  completionTimeFromAscendingNode=end,
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