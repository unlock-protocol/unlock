/* eslint promise/prefer-await-to-then: 0 */
import { updateLock } from '../actions/lock'
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

import WalletService from '../services/walletService'
import { NO_USER_ACCOUNT } from '../errors'

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

  /**
   * When an account was changed, we dispatch the corresponding action
   * The setAccount action will reset other relevant redux state
   */
  walletService.on('account.changed', account => {
    dispatch(
      setAccount({
        address: account,
      })
    )
  })

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

  walletService.on('error', error => {
    // If we didn't successfully interact with the wallet, we need to clear the
    // overlay
    dispatch(dismissWalletCheck())
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
    return walletService.getAccount()
  })

  return function(next) {
    // Connect to the current provider
    walletService.connect(getState().provider)

    return function(action) {
      if (action.type === SET_PROVIDER) {
        walletService.connect(action.provider)
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
      }

      next(action)
    }
  }
}
