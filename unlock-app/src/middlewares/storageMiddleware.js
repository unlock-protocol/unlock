/* eslint promise/prefer-await-to-then: 0 */
import queryString from 'query-string'
import {
  createAccountAndPasswordEncryptKey,
  reEncryptPrivateKey,
} from '../utils/accounts'

import { startLoading, doneLoading } from '../actions/loading'

import { success, failure } from '../services/storageService'

import { NEW_TRANSACTION, addTransaction } from '../actions/transaction'
import { SET_ACCOUNT, updateAccount } from '../actions/accounts'
import { gotRecoveryPhrase } from '../actions/recovery'
import {
  LOGIN_CREDENTIALS,
  SIGNUP_CREDENTIALS,
  gotEncryptedPrivateKeyPayload,
  setEncryptedPrivateKey,
  SIGNED_USER_DATA,
  SIGNED_PAYMENT_DATA,
  GET_STORED_PAYMENT_DETAILS,
  SIGNED_PURCHASE_DATA,
  SIGNED_ACCOUNT_EJECTION,
  keyPurchaseInitiated,
  welcomeEmail,
} from '../actions/user'
import UnlockUser from '../structured_data/unlockUser'
import { Storage } from '../utils/Error'
import { setError } from '../actions/error'
import { ADD_TO_CART, updatePrice } from '../actions/keyPurchase'

const storageMiddleware = (storageService) => {
  return ({ getState, dispatch }) => {
    // NEW_TRANSACTION
    storageService.on(failure.storeTransaction, () => {
      // TODO: we are in control of what storageService emits --
      // construct helpful errors at source of failure?
      dispatch(setError(Storage.Diagnostic('Failed to store transaction.')))
    })

    // SET_ACCOUNT
    storageService.on(success.getTransactionHashesSentBy, ({ hashes }) => {
      // Dispatch each lock. Greg probably wants to do a batch action?
      hashes.forEach((hash) => {
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

    // SIGNUP_CREDENTIALS
    storageService.on(
      success.createUser,
      async ({
        passwordEncryptedPrivateKey,
        emailAddress,
        password,
        recoveryPhrase,
      }) => {
        // Build a recovery key with the private key and recovery phrase
        const recoveryKey = await reEncryptPrivateKey(
          passwordEncryptedPrivateKey,
          password,
          recoveryPhrase
        )
        dispatch(welcomeEmail(emailAddress, recoveryKey))
        dispatch(
          gotEncryptedPrivateKeyPayload(
            passwordEncryptedPrivateKey,
            emailAddress,
            password
          )
        )
        dispatch(
          setEncryptedPrivateKey(passwordEncryptedPrivateKey, emailAddress)
        )
      }
    )
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

    storageService.on(success.getCards, (cards) => {
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

    storageService.on(success.getKeyPrice, (fees) => {
      dispatch(updatePrice(fees))
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

    // Key metadata
    storageService.on(failure.getBulkMetadataFor, (error) => {
      dispatch(
        setError(
          Storage.Diagnostic(`Could not get bulk metadata: ${error.message}`)
        )
      )
    })

    const { router } = getState()
    if (router && router.location && router.location.pathname === '/recover/') {
      // Let's get the user's recovery key from locksmith
      // And log the user in with the recoveryKey (submitted by user thru email) and the recoveryPhase,
      // from locksmith
      const query = queryString.parse(router.location.search)
      if (query && query.email && query.recoveryKey) {
        storageService.once(
          success.getUserRecoveryPhrase,
          ({ recoveryPhrase }) => {
            dispatch(gotRecoveryPhrase(recoveryPhrase))
            dispatch(
              gotEncryptedPrivateKeyPayload(
                JSON.parse(query.recoveryKey),
                query.email,
                recoveryPhrase
              )
            )
          }
        )
        storageService.once(failure.getUserRecoveryPhrase, () => {
          dispatch(
            setError(Storage.Warning('Could not initiate account recovery.'))
          )
        })
        // We must put in state the email, and the recoveryKey
        storageService.getUserRecoveryPhrase(query.email)
      } else {
        setError(Storage.Warning('Could not initiate account recovery.'))
      }
    }

    return (next) => {
      return (action) => {
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
          storageService.getRecentTransactionsHashesSentBy(
            action.account.address
          )
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

        if (action.type === SIGNED_ACCOUNT_EJECTION) {
          const { data, sig } = action
          storageService.ejectUser(data.message.user.publicKey, data, sig)
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
              // Passing credentials through so that the user can be logged in
              // after signup.
              storageService.createUser(user, emailAddress, password)
            }
          )
        }

        if (action.type === LOGIN_CREDENTIALS) {
          const { emailAddress, password } = action
          storageService.getUserPrivateKey(emailAddress).then((key) => {
            dispatch(gotEncryptedPrivateKeyPayload(key, emailAddress, password))
            dispatch(setEncryptedPrivateKey(key, emailAddress))
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
