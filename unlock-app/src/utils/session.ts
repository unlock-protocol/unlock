import {
  getLocalStorageItem,
  setLocalStorageItem,
  deleteLocalStorageItem,
} from '~/hooks/useAppStorage'

/**
 * These constants are *not* prefixed with "@unlock-app."
 * They'll be prefixed automatically.
 */
const CURRENT_ACCOUNT_KEY = 'account'
const PROVIDER_KEY = 'provider'
const NETWORK_KEY = 'network'

export const getSessionKey = (address: string) =>
  `session_${address.trim().toLowerCase()}`

export const getCurrentAccount = () => {
  return getLocalStorageItem(CURRENT_ACCOUNT_KEY) || undefined
}

export const getCurrentProvider = () => {
  return getLocalStorageItem(PROVIDER_KEY)
}

export const getCurrentNetwork = () => {
  const network = getLocalStorageItem(NETWORK_KEY)
  return network ? parseInt(network) : undefined
}

export const getAccessToken = (
  address: string | undefined = getCurrentAccount()
) => {
  if (!address) {
    return null
  }
  return getLocalStorageItem(getSessionKey(address))
}

export const removeAccessToken = (
  address: string | undefined = getCurrentAccount()
) => {
  if (!address) {
    return
  }
  deleteLocalStorageItem(getSessionKey(address))
}

export const saveAccessToken = ({
  walletAddress,
  accessToken,
}: Record<'walletAddress' | 'accessToken', string>) => {
  setLocalStorageItem(getSessionKey(walletAddress), accessToken)
  return accessToken
}
