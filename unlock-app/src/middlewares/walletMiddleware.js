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
import { POLLING_INTERVAL, ETHEREUM_NETWORKS_NAMES } from '../constants' // TODO change POLLING_INTERVAL into ACCOUNT_POLLING_INTERVAL

import WalletService from '../services/walletService'
import {
  FATAL_NO_USER_ACCOUNT,
  FATAL_WRONG_NETWORK,
  FATAL_NON_DEPLOYED_CONTRACT,
} from '../errors'
import { SIGN_DATA, signedData, signatureError } from '../actions/signature'
import configure from '../config'
import { TransactionType } from '../unlock'
import { hideForm } from '../actions/lockFormVisibility'

// This middleware listen to redux events and invokes the walletService API.
// It also listen to events from walletService and dispatches corresponding actions

export default function walletMiddleware({ getState, dispatch }) {
  const config = configure()
  const walletService = new WalletService(config)

  /**
   * Helper function which ensures that the walletService is ready
   * before calling it or dispatches an error
   * @param {*} callback
   */
  const ensureReadyBefore = callback => {
    if (!walletService.ready) {
      return dispatch(setError(FATAL_NO_USER_ACCOUNT))
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
    // This is a new lock!
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
        setError('Failed to create lock. Did you decline the transaction?')
      )
    }
    dispatch(setError(error.message))
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
      const currentNetwork = ETHEREUM_NETWORKS_NAMES[networkId]
        ? ETHEREUM_NETWORKS_NAMES[networkId][0]
        : 'Unknown Network'
      return dispatch(
        setError(FATAL_WRONG_NETWORK, {
          currentNetwork: currentNetwork,
          requiredNetworkId: config.requiredNetworkId,
        })
      )
    }

    // Check if the smart contract exists
    walletService.isUnlockContractDeployed((error, isDeployed) => {
      if (error) {
        return dispatch(setError(error.message))
      }
      if (!isDeployed) {
        return dispatch(setError(FATAL_NON_DEPLOYED_CONTRACT))
      }
      // We need a new account!
      return walletService.getAccount(true /* createIfNone */)
    })
  })

  return function(next) {
    // Connect to the current provider
    // We connect once the middleware has been initialized, using setTimout (warning: fragile?)
    setTimeout(() => {
      walletService.connect(getState().provider)
    })

    return function(action) {
      if (action.type === SET_PROVIDER) {
        walletService.connect(action.provider)
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
      }

      next(action)
    }
  }
}
