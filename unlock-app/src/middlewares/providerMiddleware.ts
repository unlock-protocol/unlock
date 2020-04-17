import UnlockProvider from '../services/unlockProvider'

import { reEncryptPrivateKey } from '../utils/accounts'
import { providerReady } from '../actions/provider'
import { setError } from '../actions/error'
import { resetRecoveryPhrase } from '../actions/recovery'
import { LogIn } from '../utils/Error'
import { Action } from '../unlockTypes' // eslint-disable-line
import {
  GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD,
  SIGN_USER_DATA,
  signedUserData,
  signUserData,
  SIGN_PAYMENT_DATA,
  signedPaymentData,
  SIGN_PURCHASE_DATA,
  signedPurchaseData,
  CHANGE_PASSWORD,
  SIGN_ACCOUNT_EJECTION,
  signedAccountEjection,
} from '../actions/user'

interface ChangePasswordArgs {
  oldPassword: string
  newPassword: string
  passwordEncryptedPrivateKey: any
  dispatch: (action: any) => void
}

export async function changePassword({
  oldPassword,
  newPassword,
  passwordEncryptedPrivateKey,
  dispatch,
}: ChangePasswordArgs) {
  try {
    const newEncryptedKey = await reEncryptPrivateKey(
      passwordEncryptedPrivateKey,
      oldPassword,
      newPassword
    )

    dispatch(signUserData({ passwordEncryptedPrivateKey: newEncryptedKey }))
    dispatch(resetRecoveryPhrase()) // We unset the recovery phrase
  } catch (e) {
    dispatch(
      setError(
        LogIn.Warning('Could not re-encrypt private key -- bad password?')
      )
    )
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

/**
 *
 * @param config
 * @param getProvider
 */
export const providerMiddleware = (
  config: any,
  getProvider: () => any,
  setProvider: (provider: any) => void
) => {
  const { readOnlyProvider, requiredNetworkId } = config
  return ({ dispatch }: { [key: string]: any }) => {
    return function middleware(next: any) {
      return function handler(action: Action) {
        const provider = getProvider()
        if (action.type === GOT_ENCRYPTED_PRIVATE_KEY_PAYLOAD) {
          const unlockProvider = new UnlockProvider({
            readOnlyProvider,
            requiredNetworkId,
          })
          setProvider(unlockProvider)
          initializeUnlockProvider(action, unlockProvider, dispatch)
        } else if (action.type === SIGN_USER_DATA) {
          const payload = provider.signUserData(action.data)
          dispatch(signedUserData(payload))
        } else if (action.type === SIGN_PAYMENT_DATA) {
          const payload = provider.signPaymentData(action.stripeTokenId)
          dispatch(signedPaymentData(payload))
        } else if (action.type === SIGN_PURCHASE_DATA) {
          const payload = provider.signKeyPurchaseRequestData(action.data)
          dispatch(signedPurchaseData(payload))
        } else if (action.type === SIGN_ACCOUNT_EJECTION) {
          const payload = provider.generateSignedEjectionRequest()
          dispatch(signedAccountEjection(payload))
        }

        if (action.type === CHANGE_PASSWORD) {
          const { oldPassword, newPassword } = action
          const { passwordEncryptedPrivateKey } = provider
          changePassword({
            passwordEncryptedPrivateKey,
            oldPassword,
            newPassword,
            dispatch,
          })
        }

        next(action)
      }
    }
  }
}

export default providerMiddleware
