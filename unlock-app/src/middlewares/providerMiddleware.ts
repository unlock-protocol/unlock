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
  setEncryptedPrivateKey,
} from '../actions/user'
import { setAccount } from '../actions/accounts'

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
  action: Action,
  unlockProvider: any,
  dispatch: any
) {
  const { key, emailAddress, password } = action
  try {
    await unlockProvider.connect({ key, password })

    const address = unlockProvider.wallet.address
    dispatch(setAccount({ address }))
    dispatch(setEncryptedPrivateKey(key, emailAddress))
    dispatch(providerReady())
  } catch (_) {
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
        if (action.type === SET_PROVIDER) {
          // Only initialize the provider if we haven't already done so.
          if (action.provider !== getState().provider) {
            const provider = config.providers[action.provider]
            initializeProvider(provider, dispatch)
          }
        } else if (action.type === GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD) {
          const provider = config.providers[getState().provider]
          initializeUnlockProvider(action, provider, dispatch)
        }

        next(action)
      }
    }
  }
}

export default providerMiddleware
