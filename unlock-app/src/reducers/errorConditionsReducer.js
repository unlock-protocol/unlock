import { ADD_LOCK, UPDATE_LOCK } from '../actions/lock'
import { ADD_KEY, UPDATE_KEY } from '../actions/key'

import { setError } from '../actions/error'

const errorConditionsReducers = next => (state, action) => {
  const nextState = next(state, action)
  if (action.type === ADD_LOCK) {
    if (action.lock.address && action.lock.address !== action.address) {
      return next(
        state,
        setError({
          message: 'Mismatch in lock address',
          context: `Lock: ${action.lock.address}, Action: ${action.address}`,
        })
      )
    }

    if (state.locks[action.address]) {
      return next(
        state,
        setError({
          message: 'Lock already exists',
          context: `Lock: ${action.address}`,
        })
      )
    }
  } else if (action.type === UPDATE_LOCK) {
    if (action.update.address && action.update.address !== action.address) {
      return next(
        state,
        setError({
          message: 'Could not change the lock address',
          context: `Action: ${action.address}, Update: ${
            action.update.address
          }`,
        })
      )
    }

    if (!state[action.address]) {
      return next(
        state,
        setError({
          message: 'Could not update missing lock',
          context: `Address: ${action.address}`,
        })
      )
    }

    return {
      ...state,
      [action.address]: Object.assign(state[action.address], action.update),
    }
  } else if (action.type === ADD_KEY) {
    if (action.key.id && action.key.id !== action.id) {
      return next(
        state,
        setError({
          message: 'Could not add key with wrong id',
          context: `Key: ${action.key.id}, Action: ${action.id}`,
        })
      )
    }

    if (state.keys[action.id]) {
      return next(
        state,
        setError({
          message: 'Could not add already existing key',
          context: `Key: ${action.id}`,
        })
      )
    }
  } else if (action.type === UPDATE_KEY) {
    if (action.update.id && action.update.id !== action.id) {
      return next(
        state,
        setError({
          message: 'Could not change the key id',
          context: `Key: ${action.id}, Id: ${action.update.id}`,
        })
      )
    }

    if (!state[action.id]) {
      return next(
        state,
        setError({
          message: 'Could not update missing key',
          context: `Key: ${action.id}`,
        })
      )
    }
  }

  return next(nextState, action)
}

export default errorConditionsReducers
