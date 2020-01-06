import { useState } from 'react'

export const localStorageKey = 'terms-of-service'

/**
 * This hook retrieves metadata for a token
 * @param {*} address
 */
export const useTermsOfService = () => {
  const [tosAccepted, setTosAccepted] = useState(() => {
    try {
      return window.localStorage.getItem(localStorageKey) === 'true'
    } catch (error) {
      // No localstorage, assume false!
      return false
    }
  })

  const saveTosAccepted = () => {
    setTosAccepted(true)
    try {
      window.localStorage.setItem(localStorageKey, true)
    } catch (error) {
      // Could not store in localstorage.
    }
  }
  return [tosAccepted, saveTosAccepted]
}

export default useTermsOfService
