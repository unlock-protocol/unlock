/* eslint promise/prefer-await-to-then: 0 */

import {
  createAccountAndPasswordEncryptKey,
  getAccountFromPrivateKey,
} from '@unlock-protocol/unlock-js'
import { UPDATE_LOCK, updateLock, UPDATE_LOCK_NAME } from '../actions/lock'

import { startLoading, doneLoading } from '../actions/loading'

import { StorageService, success, failure } from '../services/storageService'
import { storageError } from '../actions/storage'

import { NEW_TRANSACTION, addTransaction } from '../actions/transaction'
import { SET_ACCOUNT, setAccount } from '../actions/accounts'
import UnlockLock from '../structured_data/unlockLock'
import { SIGNED_DATA, signData } from '../actions/signature'
import {
  LOGIN_CREDENTIALS,
  SIGNUP_CREDENTIALS,
  loginFailed,
  loginSucceeded,
} from '../actions/user'
import UnlockUser from '../structured_data/unlockUser'

const storageMiddleware = config => {
  const { services } = config
  return ({ getState, dispatch }) => {
    const storageService = new StorageService(services.storage.host)

    // NEW_TRANSACTION
    storageService.on(failure.storeTransaction, error => {
      dispatch(storageError(error))
    })

    // SET_ACCOUNT
    storageService.on(success.getTransactionHashesSentBy, ({ hashes }) => {
      // Dispatch each lock. Greg probably wants to do a batch action?
      hashes.forEach(hash => {
        if (hash.network === getState().network.name) {
          dispatch(addTransaction(hash))
        }
      })
      dispatch(doneLoading())
    })
    storageService.on(failure.getTransactionHashesSentBy, error => {
      dispatch(storageError(error))
      dispatch(doneLoading())
    })

    // UPDATE_LOCK
    storageService.on(success.lockLookUp, ({ address, name }) => {
      dispatch(updateLock(address, { name }))
    })
    storageService.on(failure.lockLookUp, error => {
      dispatch(storageError(error))
    })

    // SIGNED_DATA
    storageService.on(failure.storeLockDetails, ({ error }) => {
      dispatch(storageError(error))
    })

    // SIGNUP_CREDENTIALS
    storageService.on(success.createUser, publicKey => {
      dispatch(setAccount({ address: publicKey }))
    })
    storageService.on(failure.createUser, error => {
      dispatch(storageError(error))
    })

    // LOGIN_CREDENTIALS
    storageService.on(failure.getUserPrivateKey, ({ error }) => {
      dispatch(storageError(error))
    })

    return next => {
      return action => {
        if (action.type === NEW_TRANSACTION) {
          // Storing a new transaction so that we can easily point to it later on
          storageService.storeTransaction(
            action.transaction.hash,
            action.transaction.from,
            action.transaction.to,
            getState().network.name
          )
        }

        if (action.type === SET_ACCOUNT) {
          dispatch(startLoading())
          // When we set the account, we want to retrieve the list of transactions
          storageService.getTransactionsHashesSentBy(action.account.address)
        }

        if (action.type === UPDATE_LOCK) {
          // Only look up the name for a lock for which the name is empty/not-set
          const lock = getState().locks[action.address]
          if (lock && !lock.name) {
            storageService.lockLookUp(action.address)
          }
        }

        if (
          action.type === SIGNED_DATA &&
          action.data.message &&
          action.data.message.lock
        ) {
          // Once signed, let's save it!
          storageService.storeLockDetails(action.data, action.signature)
        }

        if (action.type === UPDATE_LOCK_NAME) {
          const lock = getState().locks[action.address]
          // Build the data to sign
          let data = UnlockLock.build({
            name: action.name,
            owner: lock.owner,
            address: lock.address,
          })
          // Ask someone to sign it!
          dispatch(signData(data))
        }

        if (action.type === SIGNUP_CREDENTIALS) {
          const { emailAddress, password } = action

          const {
            address,
            passwordEncryptedPrivateKey,
          } = createAccountAndPasswordEncryptKey(password)

          const user = UnlockUser.build({
            emailAddress,
            publicKey: address,
            passwordEncryptedPrivateKey,
          })

          storageService.createUser(user)
        }

        if (action.type === LOGIN_CREDENTIALS) {
          const { emailAddress, password } = action
          storageService.getUserPrivateKey(emailAddress).then(key => {
            try {
              // TODO: store more than just the account address (encrypted key, etc.)
              const account = getAccountFromPrivateKey(key, password)
              if (account && account.address) {
                dispatch(loginSucceeded())
                dispatch(setAccount(account))
              }
            } catch (err) {
              dispatch(loginFailed(err))
            }
          })
        }

        next(action)
      }
    }
  }
}

export default storageMiddleware
