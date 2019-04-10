export const SET_ERROR = 'error/SET_ERROR'
export const RESET_ERROR = 'error/RESET_ERROR'

export const setError = (error, data = {}) => ({
  type: SET_ERROR,
  error,
  data,
})

export const resetError = error => ({
  type: RESET_ERROR,
  error,
})
