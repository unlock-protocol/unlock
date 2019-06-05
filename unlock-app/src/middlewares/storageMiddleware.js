/* eslint promise/prefer-await-to-then: 0 */

import {
  createAccountAndPasswordEncryptKey,
  reEncryptPrivateKey,
} from '@unlock-protocol/unlock-js'
import { UPDATE_LOCK, updateLock, UPDATE_LOCK_NAME } from '../actions/lock'

import { startLoading, doneLoading } from '../actions/loading'

import { StorageService, success, failure } from '../services/storageService'

import { NEW_TRANSACTION, addTransaction } from '../actions/transaction'
import { SET_ACCOUNT, setAccount } from '../actions/accounts'
import UnlockLock from '../structured_data/unlockLock'
import { SIGNED_DATA, signData } from '../actions/signature'
import {
  LOGIN_CREDENTIALS,
  SIGNUP_CREDENTIALS,
  CHANGE_PASSWORD,
  gotEncryptedPrivateKeyPayload,
  setEncryptedPrivateKey,
} from '../actions/user'
import UnlockUser from '../structured_data/unlockUser'
import { Storage } from '../utils/Error'
import { setError } from '../actions/error'

export async function changePassword({
  oldPassword,
  newPassword,
  passwordEncryptedPrivateKey,
  publicKey,
  emailAddress,
  dispatch,
}) {
  try {
    const newEncryptedKey = await reEncryptPrivateKey(
      passwordEncryptedPrivateKey,
      oldPassword,
      newPassword
    )

    const payload = UnlockUser.build({
      emailAddress,
      publicKey,
      passwordEncryptedPrivateKey: newEncryptedKey,
    })

    dispatch(signData(payload))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    dispatch(
      setError(
        Storage.Warning('Could not re-encrypt private key -- bad password?')
      )
    )
  }
}

const storageMiddleware = config => {
  const { services } = config
  return ({ getState, dispatch }) => {
    const storageService = new StorageService(services.storage.host)

    // NEW_TRANSACTION
    storageService.on(failure.storeTransaction, () => {
      // TODO: we are in control of what storageService emits --
      // construct helpful errors at source of failure?
      dispatch(setError(Storage.Diagnostic('Failed to store transaction.')))
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
    storageService.on(failure.getTransactionHashesSentBy, () => {
      dispatch(
        setError(Storage.Diagnostic('getTransactionHashesSentBy failed.'))
      )
      dispatch(doneLoading())
    })

    // UPDATE_LOCK
    storageService.on(success.lockLookUp, ({ address, name }) => {
      dispatch(updateLock(address, { name }))
    })
    storageService.on(failure.lockLookUp, () => {
      dispatch(setError(Storage.Diagnostic('Could not look up lock details.')))
    })

    // SIGNED_DATA
    storageService.on(failure.storeLockDetails, () => {
      dispatch(setError(Storage.Warning('Could not store some lock metadata.')))
    })

    // SIGNUP_CREDENTIALS
    storageService.on(success.createUser, publicKey => {
      // TODO: Dispatch a gotEncryptedPrivateKeyPayload instead of
      // setting here, will need to change what storageService emits
      dispatch(setAccount({ address: publicKey }))
    })
    storageService.on(failure.createUser, () => {
      dispatch(setError(Storage.Warning('Could not create this user account.')))
    })

    // LOGIN_CREDENTIALS
    storageService.on(failure.getUserPrivateKey, () => {
      dispatch(setError(Storage.Warning('Could not find this user account.')))
    })

    // When updating a user
    // TODO: May have to separately handle different kinds of user updates
    storageService.on(success.updateUser, ({ user, emailAddress }) => {
      dispatch(
        setEncryptedPrivateKey(user.passwordEncryptedPrivateKey, emailAddress)
      )
    })
    storageService.on(failure.updateUser, ({ error }) => {
      // eslint-disable-next-line no-console
      console.error(error)
      dispatch(
        setError(
          Storage.Warning(
            'Could not update user information. Please try again and report if problem persists.'
          )
        )
      )
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

        if (action.type === SIGNED_DATA) {
          const { message } = action.data
          if (message && message.lock) {
            // Once signed, let's save it!
            storageService.storeLockDetails(action.data, action.signature)
          } else if (message && message.user) {
            const {
              userDetails: { email },
            } = getState()
            // Once signed, let's save it!
            storageService.updateUser(email, action.data, action.signature)
          }
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

          createAccountAndPasswordEncryptKey(password).then(
            ({ address, passwordEncryptedPrivateKey }) => {
              const user = UnlockUser.build({
                emailAddress,
                publicKey: address,
                passwordEncryptedPrivateKey,
              })
              storageService.createUser(user)
            }
          )
        }

        if (action.type === LOGIN_CREDENTIALS) {
          const { emailAddress, password } = action
          storageService.getUserPrivateKey(emailAddress).then(key => {
            dispatch(gotEncryptedPrivateKeyPayload(key, emailAddress, password))
          })
        }

        if (action.type === CHANGE_PASSWORD) {
          const { oldPassword, newPassword } = action
          const {
            userDetails: { key, email },
            account: { address },
          } = getState()

          changePassword({
            oldPassword,
            newPassword,
            passwordEncryptedPrivateKey: key,
            publicKey: address,
            emailAddress: email,
            dispatch,
          })
        }

        next(action)
      }
    }
  }
}

export default storageMiddleware
