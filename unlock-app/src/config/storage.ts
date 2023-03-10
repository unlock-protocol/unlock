import axios, { AxiosError } from 'axios'
import {
  LocksmithService,
  LocksmithServiceConfiguration,
  WalletService,
} from '@unlock-protocol/unlock-js'
import { config } from './app'
import { SiweMessage, generateNonce } from 'siwe'
import { writeStorage } from '@rehooks/local-storage'
import { APP_NAME } from '~/hooks/useAppStorage'
import { queryClient } from './queryClient'
import { ToastHelper } from '~/components/helpers/toast.helper'

export interface SessionAuth {
  accessToken: string
  walletAddress: string
}

const service = new LocksmithService(
  new LocksmithServiceConfiguration(),
  config.locksmithHost
)

export const AUTH_SESSION_KEY = `${APP_NAME}.sessions`
export const IS_REFUSED_TO_SIGN_KEY = `${APP_NAME}.refusedToSign`

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
  writeStorage(AUTH_SESSION_KEY, null)
  writeStorage(IS_REFUSED_TO_SIGN_KEY, false)
}

export const signOut = async () => {
  await storage.logout()
  clearAuth()
  // Remove all cache when logging out
  await queryClient.invalidateQueries()
}

export const storageClient = axios.create()

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

storageClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuth()
    }
  }
)

export const storage = new LocksmithService(
  new LocksmithServiceConfiguration(),
  config.locksmithHost,
  storageClient
)

export const login = async (walletService: WalletService) => {
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
  const signatureRequest = walletService.signMessage(message, 'personal_sign')
  const signature = await ToastHelper.promise(signatureRequest, {
    loading: 'Sign message with your wallet',
    success: 'Successfully signed in',
    error: 'Failed to sign message',
  })

  if (!signature) {
    throw new Error('Failed to sign message')
  }

  const response = await service.login({
    message,
    signature,
  })
  const { accessToken, walletAddress } = response.data
  saveAuth({
    accessToken,
    walletAddress: walletAddress!,
  })
}
