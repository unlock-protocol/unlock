import { SET_ERROR, RESET_ERROR, CLEAR_ALL_ERRORS } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'

/* eslint-disable */
import { UnlockError } from '../utils/Error'
import { Action } from '../unlockTypes'
/* eslint-enable */

type State = UnlockError[]
export const initialState: State = []

const errorsReducer = (state = initialState, action: Action) => {
  if (
    [SET_ACCOUNT, SET_PROVIDER, SET_NETWORK, CLEAR_ALL_ERRORS].indexOf(
      action.type
    ) > -1
  ) {
    return initialState
  }

  if (action.type === SET_ERROR) {
    const thisError: UnlockError = action.error
    if (state.map((error) => error.message).includes(thisError.message))
      return state
    return [...state, thisError]
  }

  if (action.type === RESET_ERROR) {
    const thisError: UnlockError = action.error

    // If the error to be reset is not in the list, nothing changes
    if (!state.find((error) => thisError.message === error.message))
      return state

    // Otherwise, only push to new state the all the other errors
    return state.filter((error) => error.message !== thisError.message)
  }

  return state
}

export default errorsReducer
