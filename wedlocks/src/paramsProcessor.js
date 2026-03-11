/**
 * Process parameters for templates
 * @param {Object} params - Parameters to process
 * @returns {Object} - Processed parameters
 */
export const processParams = (params = {}) => {
  const processed = {}
  for (const key in params) {
    const param = params[key]
    processed[key] =
      typeof param === 'object' && param.encrypt ? param.value : param
  }
  return processed
}
