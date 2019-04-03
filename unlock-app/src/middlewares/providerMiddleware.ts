import { SET_PROVIDER } from '../actions/provider'
import { setError } from '../actions/error'
import {
  FATAL_MISSING_PROVIDER,
  FATAL_NOT_ENABLED_IN_PROVIDER,
} from '../errors'

interface Action {
  type: string
  [key: string]: any
}

async function initializeProvider(
  provider: { enable?: () => any },
  dispatch: any
) {
  try {
    if (provider.enable) {
      // this exists for metamask and other modern dapp wallets and must be
      // called, see:
      // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
      // TODO: unlock provider specific code to open communication channels for prompts
      // Prerequisite: unlock provider must exist
      await provider.enable()
    }
  } catch (err) {
    // If we fail here, the provider has not been enabled. For example, a user
    // may not have authorized the connection to our dapp. When using the Unlock
    // Provider, this should never occur because it should block until there is
    // a successful authentication.
    dispatch(setError(FATAL_NOT_ENABLED_IN_PROVIDER))
  }
}

const providerMiddleware = (config: any) => {
  return ({ getState, dispatch }: { [key: string]: any }) => {
    return function(next: any) {
      return function(action: Action) {
        if (action.type === SET_PROVIDER) {
          // Only initialize the provider if we haven't already done so.
          if (action.provider !== getState().provider) {
            const provider = config.providers[action.provider]
            if (provider) {
              initializeProvider(provider, dispatch)
            } else {
              dispatch(setError(FATAL_MISSING_PROVIDER))
            }
          }
          next(action)
        }
      }
    }
  }
}

export default providerMiddleware
