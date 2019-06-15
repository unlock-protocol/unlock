import { SET_PROVIDER, providerReady } from '../actions/provider'
import { setError } from '../actions/error'
import {
  FATAL_MISSING_PROVIDER,
  FATAL_NOT_ENABLED_IN_PROVIDER,
} from '../errors'
import { Application, LogIn } from '../utils/Error'
import { Action } from '../unlockTypes' // eslint-disable-line
import {
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  SIGN_USER_DATA,
  signedUserData,
  SIGN_PAYMENT_DATA,
  signedPaymentData,
} from '../actions/user'

interface Provider {
  enable?: () => any
  isUnlock?: boolean
}

export function initializeProvider(provider: Provider, dispatch: any) {
  // TODO: when UnlockProvider is enabled, this error should never happen.
  if (!provider) {
    dispatch(setError(Application.Fatal(FATAL_MISSING_PROVIDER)))
    return
  }

  // provider.enable exists for metamask and other modern dapp wallets and must be called, see:
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  if (provider.enable) {
    provider
      .enable()
      .then(() => dispatch(providerReady()))
      .catch(() =>
        dispatch(setError(Application.Fatal(FATAL_NOT_ENABLED_IN_PROVIDER)))
      )
  } else if (provider.isUnlock) {
    // This initialization is handled on receipt of GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD
    return
  } else {
    // Default case, provider doesn't have an enable method, so it must already be ready
    dispatch(providerReady())
  }
}

export async function initializeUnlockProvider(
  action: Action, // action: GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD
  unlockProvider: any,
  dispatch: any
) {
  try {
    await unlockProvider.connect(action)

    dispatch(providerReady())
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    // TODO: password isn't the only thing that can go wrong here...
    dispatch(
      setError(
        LogIn.Warning(
          'Failed to decrypt private key. Check your password and try again.'
        )
      )
    )
  }
}

export const providerMiddleware = (config: any) => {
  return ({ getState, dispatch }: { [key: string]: any }) => {
    return function(next: any) {
      // Initialize provider based on the one grabbed in the state. Fragile?
      setTimeout(() => {
        const provider = config.providers[getState().provider]
        initializeProvider(provider, dispatch)
      }, 0)

      return function(action: Action) {
        const providerName = getState().provider
        const provider = config.providers[providerName]
        if (action.type === SET_PROVIDER) {
          // Only initialize the provider if we haven't already done so.
          if (action.provider !== providerName) {
            const newProvider = config.providers[action.provider]
            initializeProvider(newProvider, dispatch)
          }
        } else if (action.type === GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD) {
          initializeUnlockProvider(action, provider, dispatch)
        } else if (action.type === SIGN_USER_DATA) {
          const payload = provider.signUserData(action.data)
          dispatch(signedUserData(payload))
        } else if (action.type === SIGN_PAYMENT_DATA) {
          const payload = provider.signPaymentData(action.stripeTokenId)
          dispatch(signedPaymentData(payload))
        }

        next(action)
      }
    }
  }
}

export default providerMiddleware
