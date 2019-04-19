/* eslint promise/prefer-await-to-then: 0 */
import { batch } from 'react-redux'

import StorageService from '../services/storageService'
import { storageError } from '../actions/storage'

import { NEW_TRANSACTION, addTransaction } from '../actions/transaction'
import { SET_ACCOUNT } from '../actions/accounts'

const storageMiddleware = config => {
  const { services } = config
  return ({ dispatch }) => {
    const storageService = new StorageService(services.storage.host)

    return next => {
      return action => {
        // TODO: never async/await middlewares
        if (action.type === SET_ACCOUNT) {
          // When we set the account, we want to retrieve the list of transactions
          storageService
            .getTransactionsHashesSentBy(action.account.address)
            .then(transactionHashes => {
              // Dispatch each transaction, but only trigger 1 re-render
              batch(() =>
                transactionHashes.forEach(transaction => {
                  dispatch(
                    addTransaction({
                      hash: transaction.transactionHash,
                      to: transaction.recipient,
                      from: transaction.sender,
                      network: transaction.network,
                    })
                  )
                })
              )
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
              action.transaction.to
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
