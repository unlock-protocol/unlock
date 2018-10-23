import { CREATE_LOCK, RESET_LOCK } from '../actions/lock'
import { DELETE_TRANSACTION } from '../actions/transaction'

export const initialState = {}

const locksReducer = (state = initialState, action) => {

  if (action.type === CREATE_LOCK || action.type === RESET_LOCK) {
    return { ...state,
      [action.lock.id]: action.lock,
    }
  }

  // If a transaction is deleted, we need to delete the corresponding lock, if any!
  if (action.type === DELETE_TRANSACTION && action.transaction && action.transaction.lock) {
    const {
      [action.transaction.lock]: lockToRemove,
      ...otherLocks
    } = state
    return otherLocks
  }

  return state
}

export default locksReducer
