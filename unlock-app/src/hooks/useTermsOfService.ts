import { useState, useEffect } from 'react'
import { useAppStorage } from './useAppStorage'

export const localStorageKey = 'terms-of-service'

/**
 * This hook retrieves metadata for a token
 * @param {*} address
 */
export const useTermsOfService = () => {
  const [termsLoading, setTermsLoading] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { getStorage, setStorage } = useAppStorage()

  useEffect(() => {
    const readFromLocalStorage = () => {
      try {
        setTermsAccepted(getStorage(localStorageKey) === 'true')
        setTermsLoading(false)
      } catch (error) {
        // No localstorage, assume false!
        setTermsAccepted(false)
        setTermsLoading(false)
      }
    }
    readFromLocalStorage()
  }, [getStorage])

  const saveTermsAccepted = () => {
    setTermsAccepted(true)
    try {
      setStorage(localStorageKey, 'true')
    } catch (error) {
      // Could not store in localstorage.
    }
  }

  return { termsAccepted, saveTermsAccepted, termsLoading }
}

export default useTermsOfService
