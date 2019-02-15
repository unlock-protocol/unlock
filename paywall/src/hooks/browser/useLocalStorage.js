import { useState, useEffect } from 'react'
import localStorageAvailable from '../../utils/localStorage'

export default function useLocalStorage(window, key) {
  const available = localStorageAvailable(window)

  let startVal
  if (available) {
    startVal = window.localStorage.getItem(key)
  }
  const [value, setValue] = useState(startVal)
  useEffect(
    () => {
      if (!available) return
      window.localStorage.setItem(key, value)
    },
    [value]
  )
  return [value, setValue]
}
