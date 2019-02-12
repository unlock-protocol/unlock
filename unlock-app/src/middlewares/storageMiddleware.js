/* eslint promise/prefer-await-to-then: 0 */

import { UPDATE_LOCK, updateLock } from '../actions/lock'
import StorageService from '../services/storageService'
import { STORE_LOCK_CREATION } from '../actions/storage'

import configure from '../config'
import { NEW_TRANSACTION, addTransaction } from '../actions/transaction'
import { SET_ACCOUNT } from '../actions/accounts'

const { services } = configure(global)

export default function storageMiddleware({ getState, dispatch }) {
  const storageService = new StorageService(services.storage.host)
  return next => {
    return action => {
      // TODO: never async/await middlewares
      if (action.type === SET_ACCOUNT) {
        // When we set the account, we want to retrieve the list of transactions
        storageService
          .getTransactionsHashesSentBy(action.account.address)
          .then(transactionHashes => {
            // Dispatch each lock. Greg probably wants to a batch action?
            transactionHashes.forEach(hash => {
              dispatch(
                addTransaction({
                  hash,
                })
              )
            })
          })
      }

      if (action.type === NEW_TRANSACTION) {
        // Storing a new transaction so that we can easoly point to it later on
        storageService.storeTransaction(
          action.transaction.hash,
          action.transaction.from,
          action.transaction.to
        )
      }

      if (action.type === STORE_LOCK_CREATION) {
        // A new lock has been created
        storageService.storeLockDetails(action.lock, action.token)
      }

      if (action.type === UPDATE_LOCK) {
        // Only look up the name for a lock for which the name is empty/not-set
        const lock = getState().locks[action.address]
        if (lock && !lock.name) {
          storageService.lockLookUp(action.address).then(name => {
            dispatch(updateLock(action.address, { name }))
          })
        }
      }

      next(action)
    }
  }
}
