import { useCallback } from 'react'

export const APP_NAME = '@unlock-app'

const isObject = (value: any) => typeof value === 'object'

const getKey = (key: string, withAppName = true) => {
  return withAppName ? `${APP_NAME}.${key}` : key
}

export const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const value = localStorage.getItem(getKey(key))
    if (!value) return null
    return isObject(value) ? JSON.parse(value) : value
  } catch (error) {
    console.error(error)
  }
  return null
}

export const setLocalStorageItem = (key: string, value: any) => {
  const currentValue = getLocalStorageItem(key)
  if (currentValue === value) return false
  try {
    localStorage.setItem(
      getKey(key),
      isObject(value) ? JSON.stringify(value) : value
    )
  } catch (error) {
    console.error(error)
  }
  return value
}

export const deleteLocalStorageItem = (key: string, withAppName = true) => {
  try {
    localStorage.removeItem(getKey(key, withAppName))
  } catch (error) {
    console.error(error)
  }
}

export const clearLocalStorage = (clearItems: string[], addAppName = true) => {
  for (const item of clearItems) {
    deleteLocalStorageItem(item, addAppName)
  }
}

export function useAppStorage() {
  // Get and set items in local storage, with caching!
  const getStorage = useCallback(getLocalStorageItem, [])
  const setStorage = useCallback(setLocalStorageItem, [])
  return {
    setStorage,
    getStorage,
  }
}
