import axios, { AxiosError } from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'
import {
  LocksmithService,
  LocksmithServiceConfiguration,
  WalletService,
} from '@unlock-protocol/unlock-js'
import { config } from './app'
import { SiweMessage, generateNonce } from 'siwe'
import { writeStorage } from '@rehooks/local-storage'
import { APP_NAME } from '~/hooks/useAppStorage'

export interface SessionAuth {
  accessToken: string
  refreshToken: string
  walletAddress: string
}

export const AUTH_SESSION_KEY = `${APP_NAME}.sessions`

export const saveAuth = (auth: SessionAuth) => {
  writeStorage(AUTH_SESSION_KEY, auth)
}

export const getAuth = (): SessionAuth | undefined => {
  const auth = localStorage.getItem(AUTH_SESSION_KEY)
  if (auth) {
    return JSON.parse(auth)
  }
}

export const clearAuth = () => {
  writeStorage(AUTH_SESSION_KEY, undefined)
}

export const storageClient = axios.create()
export const StorageAuthEvent = new EventTarget()
const service = new LocksmithService(
  new LocksmithServiceConfiguration(),
  config.locksmithHost
)
// Use interceptor to inject the token to requests
storageClient.interceptors.request.use((request) => {
  const session = getAuth()
  const accessToken = session?.accessToken
  const requestHost = new URL(request.url!).hostname
  const isAuthRequest = requestHost === new URL(config.locksmithHost).hostname
  if (isAuthRequest && accessToken) {
    request.headers!['Authorization'] = `Bearer ${accessToken}`
  }
  return request
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshAuthLogic = async (failedRequest: any) => {
  try {
    const session = getAuth()
    const refreshToken = session?.refreshToken
    if (!refreshToken) {
      return Promise.reject('No refresh token available')
    }
    const response = await service.refreshToken(refreshToken)
    const { accessToken, walletAddress } = response.data
    saveAuth({
      accessToken,
      refreshToken,
      walletAddress,
    })
    failedRequest.response.config.headers[
      'Authorization'
    ] = `Bearer ${accessToken}`
    return Promise.resolve()
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        clearAuth()
        return Promise.reject('Invalid or expired refresh token')
      }
    }
    return Promise.reject('Failed to refresh token')
  }
}

createAuthRefreshInterceptor(storageClient, refreshAuthLogic)

export const storage = new LocksmithService(
  new LocksmithServiceConfiguration(),
  config.locksmithHost,
  storageClient
)

export const login = async (walletService: WalletService) => {
  try {
    const address = await walletService.signer.getAddress()
    const siwe = new SiweMessage({
      domain: window.location.hostname,
      uri: window.location.origin,
      address,
      chainId: 1,
      version: '1',
      statement: '',
      nonce: generateNonce(),
    })
    const message = siwe.prepareMessage()
    const signature = await walletService.signMessage(message, 'personal_sign')
    const response = await service.login({
      message,
      signature,
    })
    const { accessToken, refreshToken, walletAddress } = response.data
    saveAuth({
      accessToken,
      refreshToken,
      walletAddress: walletAddress!,
    })
  } catch (error) {
    console.error(error)
  }
}
