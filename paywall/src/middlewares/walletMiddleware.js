/* eslint promise/prefer-await-to-then: 0 */
import {
  CREATE_LOCK,
  WITHDRAW_FROM_LOCK,
  deleteLock,
  UPDATE_LOCK_KEY_PRICE,
  updateLock,
} from '../actions/lock'
import { PURCHASE_KEY } from '../actions/key'
import { setAccount } from '../actions/accounts'
import { setNetwork } from '../actions/network'
import { setError } from '../actions/error'
import { SET_PROVIDER } from '../actions/provider'
import { newTransaction } from '../actions/transaction'
import {
  waitForWallet,
  gotWallet,
  dismissWalletCheck,
} from '../actions/walletStatus'
import { TRANSACTION_TYPES, POLLING_INTERVAL } from '../constants' // TODO change POLLING_INTERVAL into ACCOUNT_POLLING_INTERVAL

import WalletService from '../services/walletService'
import { signatureError } from '../actions/signature'
import { storeLockCreation } from '../actions/storage'
import configure from '../config'
import { NO_USER_ACCOUNT } from '../errors'
import generateSignature from '../utils/signature'
import pollWithConditions from '../utils/polling'

const config = configure()

// This middleware listen to redux events and invokes the walletService API.
// It also listen to events from walletService and dispatches corresponding actions

export default function walletMiddleware({ getState, dispatch }) {
  const walletService = new WalletService()

  /**
   * Helper function which ensures that the walletService is ready
   * before calling it or dispatches an error
   * @param {*} callback
   */
  const ensureReadyBefore = callback => {
    if (!walletService.ready) {
      return dispatch(setError(NO_USER_ACCOUNT))
    }
    return callback()
  }

  // account errors are thrown away, except in dev environment
  pollWithConditions(
    pollForAccountChange,
    POLLING_INTERVAL,
    checkDisableAccountPolling,
    config.env === 'dev' ? handlePollError : () => {} // log errors in dev only
  )

  async function pollForAccountChange() {
    const state = getState()
    const currentAccount = state.account && state.account.address
    const newAccounts = await walletService.getAccount() // errors fall through to the polling handler
    const newAccount = newAccounts && newAccounts[0]
    if (newAccount === currentAccount) return

    /**
     * When an account was changed, we dispatch the corresponding action
     * The setAccount action will reset other relevant redux state
     */
    dispatch(
      setAccount({
        address: newAccount,
      })
    )
  }

  function checkDisableAccountPolling() {
    if (config.isServer) return true // true disables polling temporarily
    const account = getState().account
    if (account && account.fromLocalStorage) {
      throw new Error('disable account polling') // exception
    }
  }

  function handlePollError(error) {
    console.error(error) // eslint-disable-line
  }

  walletService.on('transaction.new', (transactionHash, from, to, input) => {
    // At this point we know that a wallet was found, because a new transaction
    // cannot be created without it
    dispatch(gotWallet())
    dispatch(
      newTransaction({
        hash: transactionHash,
        to,
        from,
        input,
      })
    )
  })

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
    dispatch(updateLock(address, update))
  })

  walletService.on('error', (error, transactionHash) => {
    // If we didn't successfully interact with the wallet, we need to clear the
    // overlay
    dispatch(dismissWalletCheck())
    const transaction = getState().transactions[transactionHash]
    if (transaction && transaction.type === TRANSACTION_TYPES.LOCK_CREATION) {
      // delete the lock
      dispatch(deleteLock(transaction.lock))
      return dispatch(
        setError('Failed to create lock. Did you decline the transaction?')
      )
    }
    dispatch(setError(error.message))
  })

  /**
   * When the network has changed, we need to get a new account
   * as well as reset all the reducers
   */
  walletService.on('network.changed', networkId => {
    // Set the new network, which should also clean up all reducers
    // And we need a new account!
    dispatch(setNetwork(networkId))
    return walletService.getAccount(true /* createIfNone */)
  })

  return function(next) {
    // Connect to the current provider
    walletService.connect(getState().provider)

    return function(action) {
      if (action.type === SET_PROVIDER) {
        walletService.connect(action.provider)
      } else if (action.type === CREATE_LOCK && action.lock.address) {
        ensureReadyBefore(() => {
          walletService
            .createLock(action.lock, getState().account.address)
            .then(() => {
              if (config.services.storage) {
                generateSignature(
                  walletService.web3,
                  getState().account.address,
                  action.lock
                )
                  .then(token => {
                    dispatch(
                      storeLockCreation(
                        getState().account.address,
                        token.data,
                        token.result
                      )
                    )
                  })
                  .catch(error => {
                    dispatch(signatureError(error))
                  })
              }
            })
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
      }

      next(action)
    }
  }
}
