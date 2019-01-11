export const SET_ERROR = 'SET_ERROR'
export const RESET_ERROR = 'RESET_ERROR'
export const WEB3_ERROR = 'WEB3_ERROR'

export const setError = (error, type = 'SET_ERROR') => ({
  type,
  error,
})

export const resetError = error => ({
  type: RESET_ERROR,
  error,
})

export const metadataError = (metadata, type) => {
  return setError({ metadata, type }, type)
}

export const web3Error = originalError =>
  metadataError({ originalError }, WEB3_ERROR)
