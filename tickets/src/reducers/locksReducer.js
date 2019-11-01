import { ADD_LOCK, UPDATE_LOCK } from '../actions/lock'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = {}

const locksReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === ADD_LOCK) {
    if (action.lock.address && action.lock.address !== action.address) {
      // 'Mismatch in lock address' => Let's not change state
      return state
    }

    if (state[action.address]) {
      // 'Lock already exists' => Let's not change state
      return state
    }

    return {
      ...state,
      [action.address]: {
        address: action.address,
        ...action.lock,
      },
    }
  }

  // Replace the lock in list with the updated value
  // This will change the locks value... except for its address!
  if (action.type === UPDATE_LOCK) {
    if (action.update.address && action.update.address !== action.address) {
      // 'Could not change the lock address' => Let's not change state
      return state
    }

    if (!state[action.address]) {
      // 'Could not update missing lock' => Let's not change state
      return state
    }

    return {
      ...state,
      [action.address]: { ...state[action.address], ...action.update },
    }
  }

  return state
}

export default locksReducer
