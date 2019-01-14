export const SET_ERROR = 'SET_ERROR'
export const RESET_ERROR = 'RESET_ERROR'

export const setError = error => ({
  type: SET_ERROR,
  error,
})

export const resetError = error => ({
  type: RESET_ERROR,
  error,
})
