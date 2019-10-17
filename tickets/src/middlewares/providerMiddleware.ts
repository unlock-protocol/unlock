import { SET_PROVIDER, providerReady } from '../actions/provider'
import { setError } from '../actions/error'
import { waitForWallet, dismissWalletCheck } from '../actions/walletStatus'
import { FATAL_NOT_ENABLED_IN_PROVIDER } from '../errors'

interface Action {
  type: string
  [key: string]: any
}

function initializeProvider(provider: { enable?: () => any }, dispatch: any) {
  if (!provider) {
    return
  }

  // provider.enable exists for metamask and other modern dapp wallets and must be called, see:
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  if (provider.enable) {
    dispatch(waitForWallet())
    provider
      .enable()
      .then(() => {
        dispatch(dismissWalletCheck())
        dispatch(providerReady())
      })
      .catch(() => {
        dispatch(dismissWalletCheck())
        dispatch(setError(FATAL_NOT_ENABLED_IN_PROVIDER))
      })
  } else {
    // Default case, provider doesn't have an enable method, so it must already be ready
    dispatch(providerReady())
  }
}

const providerMiddleware = (config: any) => {
  return ({ getState, dispatch }: { [key: string]: any }) => {
    return function(next: any) {
      // Initialize provider based on the one grabbed in the state. Fragile?
      setTimeout(() => {
        const provider = config.providers[getState().provider]
        initializeProvider(provider, dispatch)
      }, 0)

      return function(action: Action) {
        if (action.type === SET_PROVIDER) {
          // Only initialize the provider if we haven't already done so.
          if (action.provider !== getState().provider) {
            const provider = config.providers[action.provider]
            initializeProvider(provider, dispatch)
          }
        }
        next(action)
      }
    }
  }
}

export default providerMiddleware
