/* eslint promise/prefer-await-to-then: 0 */
import { WalletService } from '@unlock-protocol/unlock-js'

import { updateLock } from '../actions/lock'
import { PURCHASE_KEY } from '../actions/key'
import { setAccount } from '../actions/accounts'
import { setNetwork } from '../actions/network'
import { setError } from '../actions/error'
import { PROVIDER_READY } from '../actions/provider'
import { newTransaction } from '../actions/transaction'
import {
  waitForWallet,
  gotWallet,
  dismissWalletCheck,
} from '../actions/walletStatus'
import { POLLING_INTERVAL, ETHEREUM_NETWORKS_NAMES } from '../constants' // TODO change POLLING_INTERVAL into ACCOUNT_POLLING_INTERVAL
import { transactionTypeMapping } from '../utils/types' // TODO change POLLING_INTERVAL into ACCOUNT_POLLING_INTERVAL

import {
  FATAL_NO_USER_ACCOUNT,
  FATAL_NON_DEPLOYED_CONTRACT,
  FATAL_WRONG_NETWORK,
} from '../errors'

// This middleware listen to redux events and invokes the walletService API.
// It also listen to events from walletService and dispatches corresponding actions

const walletMiddleware = config => ({ getState, dispatch }) => {
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

  walletService.on(
    'transaction.new',
    (transactionHash, from, to, input, type, status) => {
      // At this point we know that a wallet was found, because a new transaction
      // cannot be created without it
      dispatch(gotWallet())
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
    dispatch(updateLock(address, update))
  })

  walletService.on('error', error => {
    // If we didn't successfully interact with the wallet, we need to clear the
    // overlay
    dispatch(dismissWalletCheck())
    dispatch(setError(error.message))
  })

  /**
   * When the network has changed, we need to ensure Unlock has been deployed there and
   * get a new account as well as reset all the reducers
   */
  walletService.on('network.changed', networkId => {
    // Set the new network, which should also clean up all reducers
    const {
      network: { name },
    } = getState()
    if (name !== networkId) {
      // this resets a whole bunch of values, so only change it if it really changed
      dispatch(setNetwork(networkId))
    }

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
    return function(action) {
      if (action.type === PROVIDER_READY) {
        walletService.connect(config.providers[getState().provider])
      } else if (action.type === PURCHASE_KEY) {
        ensureReadyBefore(() => {
          // find the lock to get its keyPrice and currencyContractAddress
          const lock = Object.values(getState().locks).find(
            lock => lock.address === action.key.lock
          )
          // support the currency!
          walletService.purchaseKey(
            action.key.lock,
            action.key.owner,
            lock.keyPrice,
            null /* account */, // THIS FIELD HAS BEEN DEPRECATED AND WILL BE IGNORED
            null /* data */, // THIS FIELD HAS BEEN DEPRECATED AND WILL BE IGNORED
            lock.currencyContractAddress
          )
        })
      }

      next(action)
    }
  }
}

export default walletMiddleware
