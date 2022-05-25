import { useContext, useState } from 'react'
import { StorageServiceContext } from '../utils/withStorageService'
import { WalletServiceContext } from '../utils/withWalletService'
import { isExpired } from 'react-jwt'

const TOKEN_KEY = 'token'
const NEW_TOKEN_KEY = 'token'

export const useToken = (account: string, network: number) => {
  const [token, setToken] = useState<string>()
  const [newToken, setNewToken] = useState<string>()
  const walletService = useContext(WalletServiceContext)
  const storageService = useContext(StorageServiceContext)

  const storeToken = (accessToken: string, refreshToken: string) => {
    const isTokenExpired = isExpired(accessToken)
    if (!isTokenExpired) {
      setToken(accessToken)
      setNewToken(refreshToken)
    } else {
      updateToken(refreshToken)
    }
  }

  const updateToken = async (token: string) => {
    const { accessToken, refreshToken } = await storageService.refreshToken(
      token
    )
    storeToken(accessToken, refreshToken)
  }

  const getAccessToken = async () => {
    const storedToken = storageService.getToken(TOKEN_KEY)
    const storedNewToken = storageService.getToken(NEW_TOKEN_KEY)

    if (!storedToken && !storedNewToken) {
      const { accessToken, refreshToken } = await loginAndGetTokens()
      storeToken(accessToken, refreshToken)
    }

    return {
      accessToken: token,
      refreshToken: newToken,
    }
  }

  const loginAndGetTokens = async () => {
    const { message } = await storageService.getSiweMessage(account, network)
    const signature = await walletService.signMessage(message, 'personal_sign')
    const { accessToken, refreshToken } = await storageService.login(
      message,
      signature
    )
    storeToken(accessToken, refreshToken)
    return {
      accessToken,
      refreshToken,
    }
  }

  return {
    getAccessToken,
  }
}
