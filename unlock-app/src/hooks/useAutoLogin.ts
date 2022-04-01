import { useCallback, useState } from 'react'
import { useAppStorage } from './useAppStorage'
import {
  useAuthenticateHandler,
  WalletProvider,
} from './useAuthenticateHandler'

export function useAutoLogin() {
  const [isLoading, setLoading] = useState(false)
  const { getStorage } = useAppStorage()

  const { authenticateWithProvider } = useAuthenticateHandler({})

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

  const getAutoLoginEmail = (): string => {
    if (getStorage('provider') !== 'UNLOCK') return ''
    return getStorage('email') ?? ''
  }

  const tryAutoLogin = useCallback(async () => {
    setLoading(true)
    const [canAutoLogin, storedProvider] = await getAutoLoginData()
    if (canAutoLogin && storedProvider) {
      try {
        if (storedProvider !== 'UNLOCK') {
          await authenticateWithProvider(storedProvider)
        }
      } catch (error: any) {
        console.error('Autologin failed.')
        console.error(error)
      }
    }
    setLoading(false)
  }, [])

  return {
    tryAutoLogin,
    isLoading,
    getAutoLoginEmail,
  }
}
