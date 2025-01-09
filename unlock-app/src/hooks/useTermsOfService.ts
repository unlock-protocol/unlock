import { useState, useEffect } from 'react'
import { useAppStorage } from './useAppStorage'

export const localStorageKey = 'terms-of-service'

export const useTermsOfService = () => {
  const [termsLoading, setTermsLoading] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { getStorage, setStorage } = useAppStorage()

  useEffect(() => {
    try {
      const storedVal = getStorage(localStorageKey)
      setTermsAccepted(storedVal === true)
    } catch (error) {
      console.error(error)
      setTermsAccepted(false)
    } finally {
      setTermsLoading(false)
    }
  }, [getStorage])

  const saveTermsAccepted = () => {
    setTermsAccepted(true)
    try {
      setStorage(localStorageKey, true)
    } catch (error) {
      console.error('Could not store TOS', error)
    }
  }

  return { termsAccepted, saveTermsAccepted, termsLoading }
}

export default useTermsOfService
