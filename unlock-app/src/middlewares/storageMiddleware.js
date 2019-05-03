/* eslint promise/prefer-await-to-then: 0 */

import {
  createAccountAndPasswordEncryptKey,
  getAccountFromPrivateKey,
} from '@unlock-protocol/unlock-js'
import { UPDATE_LOCK, updateLock, UPDATE_LOCK_NAME } from '../actions/lock'

import { startLoading, doneLoading } from '../actions/loading'

import StorageService from '../services/storageService'
import { STORE_LOCK_NAME, storageError } from '../actions/storage'

import { NEW_TRANSACTION, addTransaction } from '../actions/transaction'
import { SET_ACCOUNT, setAccount } from '../actions/accounts'
import UnlockLock from '../structured_data/unlockLock'
import { SIGNED_DATA, signData } from '../actions/signature'
import { SIGNUP_CREDENTIALS } from '../actions/signUp'
import {
  LOGIN_CREDENTIALS,
  loginFailed,
  loginSucceeded,
} from '../actions/login'
import UnlockUser from '../structured_data/unlockUser'
import { setError } from '../actions/error'

const storageMiddleware = config => {
  const { services } = config
  return ({ getState, dispatch }) => {
    const storageService = new StorageService(services.storage.host)

    return next => {
      return action => {
        // TODO: never async/await middlewares
        if (action.type === SET_ACCOUNT) {
          dispatch(startLoading())
          // When we set the account, we want to retrieve the list of transactions
          storageService
            .getTransactionsHashesSentBy(action.account.address)
            .then(transactions => {
              dispatch(doneLoading())
              // Dispatch each lock. Greg probably wants to a batch action?
              transactions.forEach(transaction => {
                if (transaction.network === getState().network.name) {
                  dispatch(addTransaction(transaction))
                }
              })
            })
            .catch(error => {
              dispatch(doneLoading())
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

        if (
          action.type === SIGNED_DATA &&
          action.data.message &&
          action.data.message.lock
        ) {
          // Once signed, let's save it!
          storageService
            .storeLockDetails(action.data, action.signature)
            .catch(error => {
              dispatch(storageError(error))
            })
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

        // TODO : remove me because it is not needed anymore
        if (action.type === STORE_LOCK_NAME) {
          // A new lock has been created
          storageService
            .storeLockDetails(action.lock, action.token)
            .catch(error => {
              dispatch(storageError(error))
            })
        }

        if (action.type === UPDATE_LOCK) {
          // Only look up the name for a lock for which the name is empty/not-set
          const lock = getState().locks[action.address]
          if (lock && !lock.name) {
            storageService
              .lockLookUp(action.address)
              .then(name => {
                dispatch(updateLock(action.address, { name }))
              })
              .catch(error => {
                dispatch(storageError(error))
              })
          }
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

          storageService
            .createUser(user) // TODO: Now what?
            .then(() => dispatch(setAccount({ address })))
            // TODO: This isn't the right way to handle the error
            .catch(err => dispatch(setError(err)))
        }

        if (action.type === LOGIN_CREDENTIALS) {
          const { emailAddress, password } = action
          storageService
            .getUserPrivateKey(emailAddress)
            .then(key => {
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
            .catch(err => dispatch(loginFailed(err)))
        }

        next(action)
      }
    }
  }
}

export default storageMiddleware
