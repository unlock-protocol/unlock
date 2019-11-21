import {
  CREATE_LOCK,
  DELETE_LOCK,
  UPDATE_LOCK,
  UPDATE_LOCK_KEY_PRICE,
} from '../actions/lock'
import { DELETE_TRANSACTION } from '../actions/transaction'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'

export const initialState = {}

const locksReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === CREATE_LOCK) {
    if (action.lock.address) {
      return {
        ...state,
        [action.lock.address]: action.lock,
      }
    }
  }

  // Upsets a lock (adds it if missing or update it if it exists)
  if (action.type === UPDATE_LOCK) {
    if (action.update.address && action.update.address !== action.address) {
      // 'Could not change the lock address' => Let's not change state
      return state
    }

    return {
      ...state,
      [action.address]: { ...state[action.address], ...action.update },
    }
  }

  if (action.type === UPDATE_LOCK_KEY_PRICE) {
    return {
      ...state,
      [action.address]: {
        ...state[action.address],
        keyPrice: action.price,
      },
    }
  }

  if (action.type === DELETE_LOCK) {
    delete state[action.address]
    return {
      ...state,
    }
  }

  // If a transaction is deleted, we need to delete the corresponding lock, if any!
  if (
    action.type === DELETE_TRANSACTION &&
    action.transaction &&
    action.transaction.lock
  ) {
    const { [action.transaction.lock]: lockToRemove, ...otherLocks } = state
    return otherLocks
  }

  return state
}

export default locksReducer
