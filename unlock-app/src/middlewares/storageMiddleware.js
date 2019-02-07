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
    return async action => {
      if (action.type === SET_ACCOUNT) {
        // When we set the account, we want to retrieve the list of transactions
        const transactionHashes = await storageService.getTransactionsHashesSentBy(
          action.account.address
        )
        // Dispatch each lock. Greg probably wants to a batch action?
        transactionHashes.forEach(hash => {
          dispatch(
            addTransaction({
              hash,
            })
          )
        })
      }

      if (action.type === NEW_TRANSACTION) {
        // Storing a new transaction so that we can easoly point to it later on
        await storageService.storeTransaction(
          action.transaction.hash,
          action.transaction.from,
          action.transaction.to
        )
      }

      if (action.type === STORE_LOCK_CREATION) {
        // A new lock has been created
        await storageService.storeLockDetails(action.lock, action.token)
      }

      if (action.type === UPDATE_LOCK) {
        // Only look up the name for a lock for which the name is empty/not-set
        const lock = getState().locks[action.address]
        if (!lock.name) {
          // TODO: lockLookUp should probably return the data, not the HTTP response
          const results = await storageService.lockLookUp(action.address)
          dispatch(updateLock(action.address, { name: results.data.name }))
        }
      }

      next(action)
    }
  }
}
