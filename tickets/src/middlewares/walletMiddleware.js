/* eslint promise/prefer-await-to-then: 0 */
import { WalletService } from '@unlock-protocol/unlock-js'
import { setAccount } from '../actions/accounts'
import { PROVIDER_READY } from '../actions/provider'
import { ETHEREUM_NETWORKS_NAMES } from '../constants'
import { setNetwork } from '../actions/network'
import { setError } from '../actions/error'
import { FATAL_WRONG_NETWORK, FATAL_NON_DEPLOYED_CONTRACT } from '../errors'
import { dismissWalletCheck, waitForWallet } from '../actions/walletStatus'
import { SIGN_DATA, signatureError, signedData } from '../actions/signature'

// This middleware listen to redux events and invokes the walletService API.
// It also listen to events from walletService and dispatches corresponding actions

const walletMiddleware = config => {
  return ({ getState, dispatch }) => {
    const walletService = new WalletService(config)

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
            currentNetwork,
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
      // If the account is actually different
      if (!getState().account || getState().account.address !== account) {
        dispatch(
          setAccount({
            address: account,
          })
        )
      }
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

    walletService.on('error', error => {
      dispatch(setError(error.message))
    })

    return function(next) {
      return function(action) {
        if (action.type === PROVIDER_READY) {
          const provider = config.providers[getState().provider]
          walletService.connect(provider)
        }

        if (action.type === SIGN_DATA) {
          const { account } = getState()
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
}

export default walletMiddleware
