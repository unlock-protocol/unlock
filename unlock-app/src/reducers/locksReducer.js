import { CREATE_LOCK, RESET_LOCK } from '../actions/lock'
import { DELETE_TRANSACTION } from '../actions/transaction'
import { SET_PROVIDER } from '../actions/provider'

export const initialState = {}

const locksReducer = (state = initialState, action) => {
  if (action.type == SET_PROVIDER) {
    return initialState
  }

  // Add the lock to the list of locks
  if (action.type === CREATE_LOCK) {
    return {
      ...state,
      [action.lock.id]: action.lock,
    }
  }

  // Replace the lock in list with the updated value
  if (action.type === RESET_LOCK) {
    return {
      ...state,
      [action.lock.id]: Object.assign(action.lock, action.update),
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
