import { SET_PROVIDER, providerReady } from '../actions/provider'
import { setError } from '../actions/error'
import {
  FATAL_MISSING_PROVIDER,
  FATAL_NOT_ENABLED_IN_PROVIDER,
} from '../errors'
import { waitForWallet, dismissWalletCheck } from '../actions/walletStatus'

interface Action {
  type: string
  [key: string]: any
}

type dispatcher = (action: Action) => void

export function delayedDispatch(
  dispatch: dispatcher,
  action: () => { type: string },
  time: number
) {
  return setTimeout(() => dispatch(action()), time)
}

// Returns true if provider was successfully enabled, false otherwise
export async function enableProvider(provider: { enable?: () => any }) {
  if (provider.enable) {
    try {
      await provider.enable()
      return true
    } catch (_) {
      return false
    }
  }
  // provider.enable doesn't exist, so provider is de facto enabled
  return true
}

export async function initializeProvider(
  provider: { enable?: () => any },
  dispatch: dispatcher
) {
  if (!provider) {
    dispatch(setError(FATAL_MISSING_PROVIDER))
    return
  }

  // provider.enable exists for metamask and other modern dapp wallets and must be called, see:
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  const timeout = delayedDispatch(dispatch, waitForWallet, 750)
  const couldEnable = await enableProvider(provider)

  if (couldEnable) {
    dispatch(providerReady())
  } else {
    dispatch(setError(FATAL_NOT_ENABLED_IN_PROVIDER))
  }

  clearTimeout(timeout)
  dispatch(dismissWalletCheck())
}

const providerMiddleware = (config: any) => {
  return ({
    getState,
    dispatch,
  }: {
    getState: () => any
    dispatch: dispatcher
  }) => {
    return function(next: dispatcher) {
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
