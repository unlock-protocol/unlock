import {
  CREATE_LOCK,
  ADD_LOCK,
  UPDATE_LOCK,
  LOCK_DEPLOYED,
} from '../actions/lock'
import { DELETE_TRANSACTION } from '../actions/transaction'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'

export const initialState = {}

const locksReducer = (state = initialState, action) => {
  if ([SET_PROVIDER, SET_NETWORK].indexOf(action.type) > -1) {
    return initialState
  }

  if (action.type === ADD_LOCK) {
    if (action.lock.address && action.lock.address !== action.address) {
      throw new Error('Mismatch in lock address')
    }

    if (state[action.address]) {
      throw new Error('Lock already exists')
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
    action.lock.pending = true
    return {
      ...state,
      [action.lock.address]: action.lock,
    }
  }

  // Invoked when a lock has been deployed at an address
  if (action.type === LOCK_DEPLOYED) {
    action.lock.pending = false
    const newState = { ...state }
    const previousLock = newState[action.lock.address] || action.lock

    // First remove the previous locks mapping (the address was updated), if any!
    delete newState[action.lock.address]

    // Then we update the lock object
    return {
      ...newState,
      [action.address]: Object.assign(previousLock, {
        address: action.address,
        pending: false,
      }),
    }
  }

  // Replace the lock in list with the updated value
  // This will change the locks value... except for its address!
  if (action.type === UPDATE_LOCK) {
    if (action.update.address && action.update.address !== action.address) {
      throw new Error('Could not change the lock address')
    }

    if (!state[action.address]) {
      throw new Error('Could not update missing lock')
    }

    return {
      ...state,
      [action.address]: Object.assign(state[action.address], action.update),
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
