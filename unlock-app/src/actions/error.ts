import { UnlockError } from '../utils/Error' // eslint-disable-line

export const SET_ERROR = 'error/SET_ERROR'
export const RESET_ERROR = 'error/RESET_ERROR'
export const CLEAR_ALL_ERRORS = 'error/CLEAR_ALL_ERRORS'

export const setError = (error: UnlockError) => ({
  type: SET_ERROR,
  error,
})

export const resetError = (error: UnlockError) => ({
  type: RESET_ERROR,
  error,
})

export const clearAllErrors = () => ({
  type: CLEAR_ALL_ERRORS,
})
