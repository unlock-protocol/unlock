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
      // Normalize to lower case to avoid dupes
      const normalizedLockAddress = action.lock.address.toLowerCase()
      return {
        ...state,
        [normalizedLockAddress]: {
          ...action.lock,
          address: normalizedLockAddress,
        },
      }
    }
  }

  // Upsets a lock (adds it if missing or update it if it exists)
  if (action.type === UPDATE_LOCK) {
    if (!action.address) {
      return state
    }

    const normalizedLockAddress = action.address.toLowerCase()
    if (
      action.update.address &&
      action.update.address.toLowerCase() !== normalizedLockAddress
    ) {
      // 'Could not change the lock address' => Let's not change state
      return state
    }

    // Making sure we set the address to be the same
    action.update.address = normalizedLockAddress

    return {
      ...state,
      [normalizedLockAddress]: {
        ...state[normalizedLockAddress],
        ...action.update,
      },
    }
  }

  if (action.type === UPDATE_LOCK_KEY_PRICE) {
    const normalizedLockAddress = action.address.toLowerCase()
    return {
      ...state,
      [normalizedLockAddress]: {
        ...state[normalizedLockAddress],
        keyPrice: action.price,
      },
    }
  }

  if (action.type === DELETE_LOCK) {
    const normalizedLockAddress = action.address.toLowerCase()
    delete state[normalizedLockAddress]
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
