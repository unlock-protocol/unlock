/* eslint promise/prefer-await-to-then: 0 */

import {
  createAccountAndPasswordEncryptKey,
  reEncryptPrivateKey,
} from '@unlock-protocol/unlock-js'
import { UPDATE_LOCK, updateLock, getLock } from '../actions/lock'

import { startLoading, doneLoading } from '../actions/loading'

import { StorageService, success, failure } from '../services/storageService'

import { NEW_TRANSACTION, addTransaction } from '../actions/transaction'
import { SET_ACCOUNT, setAccount, updateAccount } from '../actions/accounts'
import {
  LOGIN_CREDENTIALS,
  SIGNUP_CREDENTIALS,
  CHANGE_PASSWORD,
  gotEncryptedPrivateKeyPayload,
  setEncryptedPrivateKey,
  signUserData,
  SIGNED_USER_DATA,
  SIGNED_PAYMENT_DATA,
  GET_STORED_PAYMENT_DETAILS,
  SIGNED_PURCHASE_DATA,
  keyPurchaseInitiated,
} from '../actions/user'
import UnlockUser from '../structured_data/unlockUser'
import { Storage } from '../utils/Error'
import { setError } from '../actions/error'
import { ADD_TO_CART, updatePrice } from '../actions/keyPurchase'

export async function changePassword({
  oldPassword,
  newPassword,
  emailAddress,
  storageService,
  dispatch,
}) {
  let passwordEncryptedPrivateKey
  try {
    passwordEncryptedPrivateKey = await storageService.getUserPrivateKey(
      emailAddress
    )
  } catch (e) {
    dispatch(
      setError(Storage.Warning('Could not retrieve encrypted private key.'))
    )
    return
  }
  try {
    const newEncryptedKey = await reEncryptPrivateKey(
      passwordEncryptedPrivateKey,
      oldPassword,
      newPassword
    )

    dispatch(signUserData({ passwordEncryptedPrivateKey: newEncryptedKey }))
  } catch (e) {
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
      // TODO: this is vestigial, replace with a new action (dismiss loading state?)
      dispatch(
        setEncryptedPrivateKey(user.passwordEncryptedPrivateKey, emailAddress)
      )
    })
    storageService.on(failure.updateUser, ({ error }) => {
      dispatch(setError(Storage.Diagnostic(error)))
      dispatch(
        setError(
          Storage.Warning(
            'Could not update user information. Please try again and report if problem persists.'
          )
        )
      )
    })

    storageService.on(success.addPaymentMethod, ({ emailAddress }) => {
      // User has added a new payment method, refresh the state with the current
      // set of methods.
      storageService.getCards(emailAddress)
    })
    storageService.on(failure.addPaymentMethod, () => {
      dispatch(setError(Storage.Warning('Could not add payment method.')))
    })

    storageService.on(success.getCards, cards => {
      if (cards.length > 0) {
        dispatch(
          updateAccount({
            cards,
          })
        )
      }
    })
    storageService.on(failure.getCards, () => {
      // This will happen when a user does not have a stripe id in locksmith
      // yet.
      // TODO: better decision on when to dispatch a user-visible error,
      // because we don't want to show one if they just haven't added any cards
      // yet.
      dispatch(setError(Storage.Warning('Unable to retrieve payment methods.')))
    })

    // Note: we do not handle failures for now as most locks (except the pending or transfered ones...) should be eventually retrieved thru the transactions anyway
    storageService.on(success.getLockAddressesForUser, addresses => {
      // Once we have the locks, we should emit them so they can be retrieved from chain
      addresses.forEach(address => {
        dispatch(getLock(address))
      })
    })

    storageService.on(success.getKeyPrice, fees => {
      // For now just dispatch the sum of these, in the future we may want to be
      // more granular so we can provide a price breakdown on the checkout page.
      dispatch(updatePrice(Object.values(fees).reduce((a, b) => a + b)))
    })
    storageService.on(failure.getKeyPrice, () => {
      dispatch(
        setError(
          Storage.Warning(
            'Unable to get dollar-denominated key price from server.'
          )
        )
      )
    })

    storageService.on(success.keyPurchase, () => {
      dispatch(keyPurchaseInitiated())
    })
    storageService.on(failure.keyPurchase, () => {
      dispatch(setError(Storage.Warning('Could not initiate key purchase.')))
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
          // When we set the account, we want to retrive the list of locks
          storageService.getLockAddressesForUser(action.account.address)
        }

        if (action.type === UPDATE_LOCK) {
          // Only look up the name for a lock for which the name is empty/not-set
          const lock = getState().locks[action.address]
          if (lock && !lock.name) {
            storageService.lockLookUp(action.address)
          }
        }

        if (action.type === SIGNED_USER_DATA) {
          const { data, sig } = action
          storageService.updateUserEncryptedPrivateKey(
            data.message.user.emailAddress,
            data,
            sig
          )
        }

        if (action.type === SIGNED_PAYMENT_DATA) {
          const { data, sig } = action
          storageService.addPaymentMethod(
            data.message.user.emailAddress,
            data,
            sig
          )
        }

        if (action.type === SIGNED_PURCHASE_DATA) {
          const { data, sig } = action
          storageService.purchaseKey(data, btoa(sig))
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
            account: { emailAddress },
          } = getState()

          changePassword({
            oldPassword,
            newPassword,
            emailAddress,
            storageService,
            dispatch,
          })
        }

        if (action.type === GET_STORED_PAYMENT_DETAILS) {
          const { emailAddress } = action
          storageService.getCards(emailAddress)
        }

        if (action.type === ADD_TO_CART) {
          const { lock } = action
          storageService.getKeyPrice(lock.address)
        }

        next(action)
      }
    }
  }
}

export default storageMiddleware
