export const SET_ERROR = 'SET_ERROR'

export const setError = error => ({
  type: SET_ERROR,
  error: error.message
    ? error
    : {
      message: error,
    },
})

export const web3Error = error =>
  setError({
    message: error,
    context: 'web3',
  })
