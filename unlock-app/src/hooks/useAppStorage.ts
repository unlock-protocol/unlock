import { useCallback } from 'react'

export const APP_NAME = '@unlock-app'

/**
 * Store objects as JSON, so it's easier to just always try parse, then fallback to the raw value on parse errors.
 */
function parseIfNeeded(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    // If not valid JSON, just return the original string
    return value
  }
}

function getKey(key: string, withAppName = true) {
  return withAppName ? `${APP_NAME}.${key}` : key
}

export function getLocalStorageItem(key: string, withAppName = true) {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(getKey(key, withAppName))
    if (!stored) return null
    return parseIfNeeded(stored)
  } catch (error) {
    console.error(error)
    return null
  }
}

export function setLocalStorageItem(
  key: string,
  value: any,
  withAppName = true
) {
  try {
    localStorage.setItem(
      getKey(key, withAppName),
      typeof value === 'object' ? JSON.stringify(value) : String(value)
    )
    return value
  } catch (error) {
    console.error(error)
    return null
  }
}

export function deleteLocalStorageItem(key: string, withAppName = true) {
  try {
    localStorage.removeItem(getKey(key, withAppName))
  } catch (error) {
    console.error(error)
  }
}

export function clearLocalStorage(keys: string[], withAppName = true) {
  for (const key of keys) {
    deleteLocalStorageItem(key, withAppName)
  }
}

export function useAppStorage() {
  const getStorage = useCallback(getLocalStorageItem, [])
  const setStorage = useCallback(setLocalStorageItem, [])
  const removeKey = useCallback(deleteLocalStorageItem, [])
  const clearStorage = useCallback(clearLocalStorage, [])

  return {
    getStorage,
    setStorage,
    removeKey,
    clearStorage,
  }
}
