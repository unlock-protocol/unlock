import { useCallback, useState } from 'react'
import { useAppStorage } from './useAppStorage'
import { useAuthenticate, WalletProvider } from './useAuthenticate'
import { useSIWE } from '~/hooks/useSIWE'

export function useAutoLogin() {
  const [isLoading, setLoading] = useState(false)
  const { getStorage } = useAppStorage()
  const { authenticateWithProvider } = useAuthenticate()
  const { signOut } = useSIWE()

  const getAutoLoginData = useCallback(() => {
    const storedProvider: WalletProvider | null = getStorage(
      'provider'
    ) as WalletProvider
    const canAutoLogin =
      storedProvider !== null && storedProvider !== 'DELEGATED_PROVIDER'

    return [canAutoLogin, storedProvider] as const
  }, [getStorage])

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
        await signOut()
      }
    }
    if (!canAutoLogin && storedProvider === 'DELEGATED_PROVIDER') {
      await signOut()
    }
    setLoading(false)
  }, [authenticateWithProvider, getAutoLoginData, signOut])

  return {
    tryAutoLogin,
    isLoading,
    getAutoLoginEmail,
  }
}
