import { useState, useEffect } from 'react'
import localStorageAvailable from '../../utils/localStorage'

export default function useLocalStorage(window, key) {
  const available = localStorageAvailable(window)

  let startVal
  if (available) {
    startVal = window.localStorage.getItem(key)
  }
  // this hook uses state as a proxy for the actual values in localStorage
  // in order to trigger re-renders on any change to the localStorage
  const [value, setValue] = useState(startVal)
  useEffect(
    () => {
      if (!available) return // do nothing if localStorage can't be used
      window.localStorage.setItem(key, value)
    },
    // this effect only runs when the value changes
    // and not on every update to the component containing the hook
    [value]
  )

  return [value, setValue]
}
