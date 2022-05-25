import { useContext, useState } from 'react'
import { StorageServiceContext } from '../utils/withStorageService'
import { WalletServiceContext } from '../utils/withWalletService'

const TOKEN_KEY = 'token'
const NEW_TOKEN_KEY = 'token'

export const useToken = (account: string, network: number) => {
  const [token, setToken] = useState()
  const [newToken, setNewToken] = useState()
  const walletService = useContext(WalletServiceContext)
  const storageService = useContext(StorageServiceContext)

  const getAccessToken = () => {
    const storedToken = storageService.getToken(TOKEN_KEY)
    const storedNewToken = storageService.getToken(NEW_TOKEN_KEY)

    if (!storedToken && !storedNewToken) {
      loginAndGetToken()
    }

    setToken(storedToken)
    setNewToken(storedNewToken)
    return {
      accessToken: token,
      refreshToken: newToken,
    }
  }

  const loginAndGetToken = async () => {
    const { message } = await storageService.getSiweMessage(account, network)
    const signature = await walletService.signMessage(message, 'personal_sign')
    const { accessToken, refreshToken } = await storageService.login(
      message,
      signature
    )
    setToken(accessToken)
    setNewToken(refreshToken)
    return {
      accessToken,
      refreshToken,
    }
  }

  return {
    getAccessToken,
  }
}
