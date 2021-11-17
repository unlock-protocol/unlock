import { useCallback } from 'react'
import { ProviderName } from '../components/interface/LoginPrompt'
import { useAppStorage } from '../hooks/useAppStorage'

export function useAutoLogin() {
  const { getStorage } = useAppStorage()

  const canAutoLogin = useCallback((): boolean => {
    const storedProvider: ProviderName | null = getStorage(
      'provider'
    ) as ProviderName

    if (!storedProvider) return false
    return true
  }, [])

  return {
    canAutoLogin,
  }
}
