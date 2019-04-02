import { SET_PROVIDER } from '../actions/provider'
import { setError } from '../actions/error'
import { FATAL_MISSING_PROVIDER } from '../errors'

interface Action {
  type: string
  [key: string]: any
}

async function initializeProvider(
  providerName: string,
  providers: { [key: string]: any },
  dispatch: any
) {
  const provider = providers[providerName]
  if (!provider) {
    // Once Unlock Provider is in place, it should be highly unusual for this error to occur.
    dispatch(setError(FATAL_MISSING_PROVIDER))
    return
  }

  try {
    if (provider.enable) {
      // this exists for metamask and other modern dapp wallets and must be
      // called, see:
      // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
      // TODO: unlock provider specific code to open communication channels for prompts
      await provider.enable()
    }
  } catch (err) {
    // do a thing with err
  }
}

const providerMiddleware = (config: any) => {
  return ({ getState, dispatch }: { [key: string]: any }) => {
    return function(next: any) {
      return function(action: Action) {
        if (action.type === SET_PROVIDER) {
          // Only initialize the provider if we haven't already done so.
          if (action.provider !== getState().provider) {
            initializeProvider(action.provider, config.providers, dispatch)
          }
          next(action)
        }
      }
    }
  }
}

export default providerMiddleware
