/* eslint promise/prefer-await-to-then: 0 */

import StorageService from '../services/storageService'
import { storageError } from '../actions/storage'

import { NEW_TRANSACTION } from '../actions/transaction'

const storageMiddleware = config => {
  const { services } = config
  return ({ dispatch, getState }) => {
    const storageService = new StorageService(services.storage.host)

    return next => {
      return action => {
        if (action.type === NEW_TRANSACTION) {
          // Storing a new transaction so that we can easoly point to it later on
          storageService
            .storeTransaction(
              action.transaction.hash,
              action.transaction.from,
              action.transaction.to,
              getState().network.name,
              action.transaction.input
            )
            .catch(error => {
              dispatch(storageError(error))
            })
        }
        next(action)
      }
    }
  }
}

export default storageMiddleware
