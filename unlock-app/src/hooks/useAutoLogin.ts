import { useCallback, useState } from 'react'
import { useAppStorage } from '../hooks/useAppStorage'
import {
  useAuthenticateHandler,
  WalletProvider,
} from './useAuthenticateHandler'

interface AutoLogin {
  authenticate: (provider: any, messageToSign?: any) => Promise<any>
}
export function useAutoLogin({ authenticate }: AutoLogin) {
  const [isLoading, setLoading] = useState(false)
  const { getStorage } = useAppStorage()

  const { getProviderHandler } = useAuthenticateHandler({ authenticate })

  const getAutoLoginData = useCallback((): Promise<
    [boolean, WalletProvider]
  > => {
    const storedProvider: WalletProvider | null = getStorage(
      'provider'
    ) as WalletProvider

    const canAutoLogin = storedProvider !== null

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([canAutoLogin, storedProvider])
      }, 350)
    })
  }, [])

  const tryAutoLogin = useCallback(async () => {
    setLoading(true)
    const [canAutoLogin, storedProvider] = await getAutoLoginData()
    if (canAutoLogin && storedProvider) {
      await getProviderHandler(storedProvider)
    }
    setLoading(false)
  }, [])

  return {
    tryAutoLogin,
    isLoading,
  }
}
