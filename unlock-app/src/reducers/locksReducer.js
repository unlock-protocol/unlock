import {
  ADD_LOCK,
  CREATE_LOCK,
  DELETE_LOCK,
  UPDATE_LOCK,
  UPDATE_LOCK_KEY_PRICE,
} from '../actions/lock'
import { DELETE_TRANSACTION } from '../actions/transaction'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { SET_ACCOUNT } from '../actions/accounts'
import { MAX_UINT, UNLIMITED_KEYS_COUNT } from '../constants'

export const initialState = {}

const locksReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK, SET_ACCOUNT].indexOf(action.type) > -1) {
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

  if (action.type === CREATE_LOCK) {
    // Smart contracts and the frontend app use a different representation for
    // unlimited keys. Here we look to see if the value of maxNumberOfKeys is
    // set to the smart contract representation. If it is, we replace it with
    // the frontend representation.
    let lock = {}
    Object.assign(lock, action.lock)
    if (lock.maxNumberOfKeys === MAX_UINT) {
      lock.maxNumberOfKeys = UNLIMITED_KEYS_COUNT
    }
    if (lock.address) {
      return {
        ...state,
        [lock.address]: lock,
      }
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

    // Smart contracts and the frontend app use a different representation for
    // unlimited keys. Here we look to see if the value of maxNumberOfKeys is
    // set to the smart contract representation. If it is, we replace it with
    // the frontend representation.
    let update = {}
    Object.assign(update, action.update)
    if (update.maxNumberOfKeys === MAX_UINT) {
      update.maxNumberOfKeys = UNLIMITED_KEYS_COUNT
    }
    return {
      ...state,
      [action.address]: Object.assign(state[action.address], update),
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
