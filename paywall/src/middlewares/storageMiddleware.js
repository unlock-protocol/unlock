/* eslint promise/prefer-await-to-then: 0 */

import StorageService from '../services/storageService'
import { storageError } from '../actions/storage'

import { NEW_TRANSACTION, addTransaction } from '../actions/transaction'
import { SET_ACCOUNT } from '../actions/accounts'

const storageMiddleware = config => {
  const { services } = config
  return ({ dispatch, getState }) => {
    const storageService = new StorageService(services.storage.host)

    return next => {
      return action => {
        // TODO: never async/await middlewares
        if (action.type === SET_ACCOUNT) {
          // When we set the account, we want to retrieve the list of transactions
          storageService
            .getTransactionsHashesSentBy(action.account.address)
            .then(transactions => {
              transactions.forEach(transaction => {
                if (transaction.network !== getState().network.name) return
                setTimeout(() => {
                  dispatch(addTransaction(transaction))
                })
              })
            })
            .catch(error => {
              dispatch(storageError(error))
            })
        }

        if (action.type === NEW_TRANSACTION) {
          // Storing a new transaction so that we can easoly point to it later on
          storageService
            .storeTransaction(
              action.transaction.hash,
              action.transaction.from,
              action.transaction.to,
              getState().network.name
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
