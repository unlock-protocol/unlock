import { useContext, useEffect } from 'react'
import { StorageServiceContext } from '../utils/withStorageService'
import { WalletServiceContext } from '../utils/withWalletService'

export const useToken = (account: string, network: number) => {
  const walletService = useContext(WalletServiceContext)
  const storageService = useContext(StorageServiceContext)

  useEffect(() => {
    const token = storageService.getToken('token')
    if (!token) {
      getAccessToken()
    }
  }, [])

  const getAccessToken = async () => {
    await loginAndGetTokens()
  }

  const loginAndGetTokens = async () => {
    if (!account && !network) return
    try {
      const message = await storageService.getSiweMessage(account, network)
      const signature = await walletService.signMessage(
        message,
        'personal_sign'
      )
      await storageService.login(message, signature)
    } catch (err) {
      console.error(err)
    }
  }

  return {
    getAccessToken,
  }
}
