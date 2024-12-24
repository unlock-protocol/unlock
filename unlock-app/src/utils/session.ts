import {
  APP_NAME,
  deleteLocalStorageItem,
  getLocalStorageItem,
  setLocalStorageItem,
} from '~/hooks/useAppStorage'

export const CURRENT_ACCOUNT_KEY = `${APP_NAME}.account`

export const getSessionKey = (address: string) =>
  `${APP_NAME}.session_${address.trim().toLowerCase()}`

export const getCurrentAccount = () => {
  return getLocalStorageItem(CURRENT_ACCOUNT_KEY) || undefined
}

export const getCurrentProvider = () => {
  return getLocalStorageItem(`${APP_NAME}.provider`)
}

export const getCurrentNetwork = () => {
  const network = getLocalStorageItem(`${APP_NAME}.network`)
  return network ? parseInt(network) : undefined
}

export const getAccessToken = (
  address: string | undefined = getCurrentAccount()
) => {
  if (!address) {
    return null
  }
  const ACCESS_TOKEN_KEY = getSessionKey(address)
  return getLocalStorageItem(ACCESS_TOKEN_KEY)
}

export const removeAccessToken = (
  address: string | undefined = getCurrentAccount()
) => {
  if (!address) {
    return null
  }
  const ACCESS_TOKEN_KEY = getSessionKey(address)
  deleteLocalStorageItem(ACCESS_TOKEN_KEY)
}

export const saveAccessToken = ({
  walletAddress,
  accessToken,
}: Record<'walletAddress' | 'accessToken', string>) => {
  const ACCESS_TOKEN_KEY = getSessionKey(walletAddress)
  setLocalStorageItem(ACCESS_TOKEN_KEY, accessToken)
  return accessToken
}
