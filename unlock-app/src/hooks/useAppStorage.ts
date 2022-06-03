import { useCallback } from 'react'

export const APP_NAME = '@unlock-app'

export function useAppStorage() {
  const isObject = useCallback((value: any) => typeof value === 'object', [])

  const getKey = useCallback((key: string, withAppName = true) => {
    return withAppName ? `${APP_NAME}.${key}` : key
  }, [])

  const setStorage = useCallback((key: string, value: any) => {
    try {
      localStorage.setItem(
        getKey(key),
        isObject(value) ? JSON.stringify(value) : value
      )
    } catch (error) {
      console.error(error)
    }
  }, [])

  const removeKey = useCallback((key: string, withAppName = true) => {
    try {
      localStorage.removeItem(getKey(key, withAppName))
    } catch (error) {
      console.error(error)
    }
  }, [])

  const getStorage = useCallback((key: string): string | null => {
    try {
      const value = localStorage.getItem(getKey(key))
      if (!value) return null
      return isObject(value) ? JSON.parse(value) : value
    } catch (error) {
      console.error(error)
    }
    return null
  }, [])

  const clearStorage = useCallback((): void => {
    const items = { ...localStorage } ?? []
    Object.keys(items)
      .filter((item: string) => item.includes(APP_NAME))
      .forEach((key: string) => removeKey(key, false))
  }, [])

  return {
    setStorage,
    getStorage,
    clearStorage,
    removeKey,
  }
}
