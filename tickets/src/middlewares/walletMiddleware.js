/* eslint promise/prefer-await-to-then: 0 */
import UnlockJs from '@unlock-protocol/unlock-js'
import { setAccount } from '../actions/accounts'
import { PROVIDER_READY } from '../actions/provider'
import { POLLING_INTERVAL, ETHEREUM_NETWORKS_NAMES } from '../constants'
import { setNetwork } from '../actions/network'
import { setError } from '../actions/error'
import {
  FATAL_WRONG_NETWORK,
  FATAL_NON_DEPLOYED_CONTRACT,
  FAILED_TO_SIGN_ADDRESS,
  FATAL_NO_USER_ACCOUNT,
} from '../errors'
import { SIGN_ADDRESS, gotSignedAddress } from '../actions/ticket'
import { PURCHASE_KEY } from '../actions/key'

const { WalletService } = UnlockJs

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
        return dispatch(setError(FATAL_NO_USER_ACCOUNT))
      }
      return callback()
    }

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

    walletService.on('account.changed', account => {
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

    walletService.on('error', error => {
      dispatch(setError(error.message))
    })

    return function(next) {
      return function(action) {
        if (action.type === PROVIDER_READY) {
          const provider = config.providers[getState().provider]
          walletService.connect(provider)
        }

        if (action.type === PURCHASE_KEY) {
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

        if (action.type === SIGN_ADDRESS) {
          const { account } = getState()
          const { address } = action
          walletService.signData(account, address, (error, signedAddress) => {
            if (error) {
              // TODO: Does this need to be handled in the error consumer?
              dispatch(setError(FAILED_TO_SIGN_ADDRESS, error))
            } else {
              dispatch(gotSignedAddress(address, signedAddress))
            }
          })
        }
        next(action)
      }
    }
  }
}

export default walletMiddleware
