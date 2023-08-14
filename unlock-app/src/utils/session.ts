import { APP_NAME } from '~/hooks/useAppStorage'

export const CURRENT_ACCOUNT_KEY = `${APP_NAME}.account`

export const getSessionKey = (address: string) =>
  `${APP_NAME}.session_${address.trim().toLowerCase()}`

export const getCurrentAccount = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CURRENT_ACCOUNT_KEY)
}

export const getCurrentProvider = () => {
  if (typeof window === 'undefined') return null
  const provider = localStorage.getItem(`${APP_NAME}.provider`)
  return provider
}

export const getCurrentNetwork = () => {
  if (typeof window === 'undefined') return 1
  const network = localStorage.getItem(`${APP_NAME}.network`)
  return network ? parseInt(network) : null
}

export const getAccessToken = (
  address: string | null = getCurrentAccount()
) => {
  if (!address) {
    return null
  }
  const ACCESS_TOKEN_KEY = getSessionKey(address)
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const removeAccessToken = (
  address: string | null = getCurrentAccount()
) => {
  if (!address) {
    return null
  }
  const ACCESS_TOKEN_KEY = getSessionKey(address)
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export const saveAccessToken = ({
  walletAddress,
  accessToken,
}: Record<'walletAddress' | 'accessToken', string>) => {
  const ACCESS_TOKEN_KEY = getSessionKey(walletAddress)
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  return accessToken
}
