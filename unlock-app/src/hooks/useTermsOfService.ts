import { useState, useEffect } from 'react'

export const localStorageKey = 'terms-of-service'

/**
 * This hook retrieves metadata for a token
 * @param {*} address
 */
export const useTermsOfService = () => {
  const [termsLoading, setTermsLoading] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const readFromLocalStorage = () => {
    try {
      setTermsAccepted(localStorage.getItem(localStorageKey) === 'true')
      setTermsLoading(false)
    } catch (error) {
      // No localstorage, assume false!
      setTermsAccepted(false)
      setTermsLoading(false)
    }
  }

  useEffect(() => {
    readFromLocalStorage()
  }, [])

  const saveTermsAccepted = () => {
    setTermsAccepted(true)
    try {
      localStorage.setItem(localStorageKey, 'true')
    } catch (error) {
      // Could not store in localstorage.
    }
  }

  return { termsAccepted, saveTermsAccepted, termsLoading }
}

export default useTermsOfService
