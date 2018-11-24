import uniqid from 'uniqid'

import { CREATE_LOCK, RESET_LOCK } from '../actions/lock'
import { DELETE_TRANSACTION } from '../actions/transaction'
import { SET_PROVIDER } from '../actions/provider'

export const initialState = {}

const locksReducer = (state = initialState, action) => {
  if (action.type == SET_PROVIDER) {
    return initialState
  }

  if (action.type === CREATE_LOCK) {
    // The lock does not have an address yet, so we use a 'temporary' one in the form of an id
    action.lock.address = uniqid()
    action.lock.pending = true
    return {
      ...state,
      [action.lock.address]: action.lock,
    }
  }

  // Replace the lock in list with the updated value
  if (action.type === RESET_LOCK) {
    // If the address has been updated, we first need to remove the mapping to the old address
    if (
      action.update.address &&
      action.update.address !== action.lock.address
    ) {
      const newState = { ...state }
      delete newState[action.lock.address]
      newState[action.update.address] = Object.assign(
        action.lock,
        action.update
      )
      return newState
    }

    return {
      ...state,
      [action.lock.address]: Object.assign(action.lock, action.update),
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
