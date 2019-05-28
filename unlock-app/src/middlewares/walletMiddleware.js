/* eslint promise/prefer-await-to-then: 0 */
import {
  getAccountFromPrivateKey,
  WalletService,
} from '@unlock-protocol/unlock-js'

import {
  CREATE_LOCK,
  WITHDRAW_FROM_LOCK,
  deleteLock,
  UPDATE_LOCK_KEY_PRICE,
  updateLock,
  updateLockName,
} from '../actions/lock'
import { PURCHASE_KEY } from '../actions/key'
import { setAccount } from '../actions/accounts'
import { setNetwork } from '../actions/network'
import { setError } from '../actions/error'
import { PROVIDER_READY } from '../actions/provider'
import { newTransaction } from '../actions/transaction'
import { waitForWallet, dismissWalletCheck } from '../actions/fullScreenModals'
import { POLLING_INTERVAL } from '../constants'

import Error from '../utils/Error'

import {
  FATAL_NO_USER_ACCOUNT,
  FATAL_WRONG_NETWORK,
  FATAL_NON_DEPLOYED_CONTRACT,
} from '../errors'
import { SIGN_DATA, signedData, signatureError } from '../actions/signature'
import { TransactionType } from '../unlockTypes'
import { hideForm } from '../actions/lockFormVisibility'
import { transactionTypeMapping } from '../utils/types' // TODO change POLLING_INTERVAL into ACCOUNT_POLLING_INTERVAL
import {
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  setEncryptedPrivateKey,
} from '../actions/user'

const { Application, Transaction, LogIn } = Error

// This middleware listen to redux events and invokes the walletService API.
// It also listen to events from walletService and dispatches corresponding actions

const walletMiddleware = config => {
  return ({ getState, dispatch }) => {
    const walletService = new WalletService(config)

    /**
     * Helper function which ensures that the walletService is ready
     * before calling it or dispatches an error
     * @param {*} callback
     */
    const ensureReadyBefore = callback => {
      if (!walletService.ready) {
        return dispatch(setError(Application.Fatal(FATAL_NO_USER_ACCOUNT)))
      }
      return callback()
    }

    /**
     * When an account was changed, we dispatch the corresponding action
     * The setAccount action will reset other relevant redux state
     */
    walletService.on('account.changed', account => {
      if (config.isServer) return
      // Let's poll to detect account changes
      setTimeout(walletService.getAccount.bind(walletService), POLLING_INTERVAL)

      // If the account is actually different
      if (!getState().account || getState().account.address !== account) {
        dispatch(
          setAccount({
            address: account,
          })
        )
      }
    })

    walletService.on(
      'transaction.new',
      (transactionHash, from, to, input, type, status) => {
        // At this point we know that a wallet was found, because a new transaction
        // cannot be created without it
        dispatch(dismissWalletCheck())
        dispatch(
          newTransaction({
            hash: transactionHash,
            to,
            from,
            input,
            type: transactionTypeMapping(type),
            status,
            network: getState().network.name,
          })
        )
      }
    )

    // A transaction has started, now we need to signal that we're waiting for
    // interaction with the wallet
    walletService.on('transaction.pending', () => {
      dispatch(waitForWallet())
    })

    // The wallet check overlay may be manually dismissed. When that event is
    // signaled, clear the overlay.
    walletService.on('overlay.dismissed', () => {
      dispatch(dismissWalletCheck())
    })

    walletService.on('lock.updated', (address, update) => {
      // This lock is beeing saved to the chain (that is what the update is about)
      // So we should be able to get its name from the redux store
      const lock = getState().locks[address]
      if (lock) {
        dispatch(updateLockName(address, lock.name))
      }
      dispatch(updateLock(address, update))
      dispatch(hideForm()) // Close the form
    })

    walletService.on('error', (error, transactionHash) => {
      // If we didn't successfully interact with the wallet, we need to clear the
      // overlay
      dispatch(dismissWalletCheck())
      const transaction = getState().transactions[transactionHash]
      if (transaction && transaction.type === TransactionType.LOCK_CREATION) {
        // delete the lock
        dispatch(deleteLock(transaction.lock))
        return dispatch(
          setError(
            Transaction.Warning(
              'Failed to create lock. Did you decline the transaction?'
            )
          )
        )
      }
      dispatch(setError(Transaction.Warning(error.message)))
    })

    /**
     * When the network has changed, we need to ensure Unlock has been deployed there and
     * get a new account as well as reset all the reducers
     */
    walletService.on('network.changed', networkId => {
      // Set the new network, which should also clean up all reducers
      dispatch(setNetwork(networkId))

      // Let's check if we're on the right network
      if (config.isRequiredNetwork && !config.isRequiredNetwork(networkId)) {
        return dispatch(setError(Application.Fatal(FATAL_WRONG_NETWORK)))
      }

      // Check if the smart contract exists
      walletService.isUnlockContractDeployed((error, isDeployed) => {
        if (error) {
          return dispatch(setError(Application.Fatal(error.message)))
        }
        if (!isDeployed) {
          return dispatch(
            setError(Application.Fatal(FATAL_NON_DEPLOYED_CONTRACT))
          )
        }
        // We need a new account!
        return walletService.getAccount(true /* createIfNone */)
      })
    })

    return function(next) {
      return function(action) {
        if (action.type === PROVIDER_READY) {
          walletService.connect(config.providers[getState().provider])
        } else if (action.type === CREATE_LOCK && action.lock.address) {
          ensureReadyBefore(() => {
            walletService.createLock(action.lock, getState().account.address)
          })
        } else if (action.type === PURCHASE_KEY) {
          ensureReadyBefore(() => {
            const account = getState().account
            // find the lock to get its keyPrice
            const lock = Object.values(getState().locks).find(
              lock => lock.address === action.key.lock
            )
            walletService.purchaseKey(
              action.key.lock,
              action.key.owner,
              lock.keyPrice,
              account.address,
              action.key.data
            )
          })
        } else if (action.type === WITHDRAW_FROM_LOCK) {
          ensureReadyBefore(() => {
            const account = getState().account
            walletService.withdrawFromLock(action.lock.address, account.address)
          })
        } else if (action.type === UPDATE_LOCK_KEY_PRICE) {
          ensureReadyBefore(() => {
            const account = getState().account
            walletService.updateKeyPrice(
              action.address,
              account.address,
              action.price
            )
          })
        } else if (action.type === SIGN_DATA) {
          const account = getState().account
          walletService.signData(
            account.address,
            action.data,
            (error, signature) => {
              if (error) {
                dispatch(signatureError(error))
              }
              dispatch(signedData(action.data, signature))
            }
          )
        } else if (action.type === GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD) {
          const { key, emailAddress, password } = action
          // TODO: How will this interact with unlock-provider?
          getAccountFromPrivateKey(key, password)
            .then(wallet => {
              const address = wallet.signingKey.address
              dispatch(setAccount({ address }))
              dispatch(setEncryptedPrivateKey(key, emailAddress))
            })
            .catch(() => {
              // handle error here
              dispatch(
                setError(
                  LogIn.Warning(
                    'Failed to decrypt private key. Check your password and try again.'
                  )
                )
              )
            })
        }

        next(action)
      }
    }
  }
}

export default walletMiddleware
