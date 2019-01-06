export const SET_ERROR = 'SET_ERROR'
export const RESET_ERROR = 'RESET_ERROR'

export const setError = error => ({
  type: SET_ERROR,
  error:
    !error || error.message
      ? error
      : {
        message: error,
      },
})

export const resetError = id => ({
  type: RESET_ERROR,
  id,
})
