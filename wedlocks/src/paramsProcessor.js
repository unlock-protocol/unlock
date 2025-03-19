import encrypter from './encrypter'

/**
 * Process parameters for templates, handling encrypted values
 * @param {Object} params - Parameters to process
 * @returns {Object} - Processed parameters
 */
export const processParams = (params = {}) => {
  const processed = {}
  for (const key in params) {
    const param = params[key]
    processed[key] =
      typeof param === 'object' && param.encrypt
        ? encrypter.signParam(param.value)
        : param
  }
  return processed
}
