import axios from 'axios'
import {
  LocksmithService,
  LocksmithServiceConfiguration,
} from '@unlock-protocol/unlock-js'
import { config } from './app'
import { getAccessToken, getCurrentAccount } from '~/utils/session'

export const storageClient = axios.create()

// Use interceptor to inject the token to requests
storageClient.interceptors.request.use((request) => {
  const currentAccountAddress = getCurrentAccount()
  if (!currentAccountAddress) {
    return request
  }
  const accessToken = getAccessToken(currentAccountAddress)
  if (!accessToken) {
    return request
  }
  const requestURL = new URL(request.url!)
  const locksmithUrl = new URL(config.locksmithHost)
  const isAuthRequest =
    requestURL.hostname === locksmithUrl.hostname &&
    requestURL.protocol === locksmithUrl.protocol

  if (!isAuthRequest) {
    return request
  }
  request.headers!['Authorization'] = `Bearer ${accessToken}`
  return request
})

export const storage = new LocksmithService(
  new LocksmithServiceConfiguration(),
  config.locksmithHost,
  storageClient
)
