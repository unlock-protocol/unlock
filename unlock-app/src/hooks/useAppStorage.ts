import { useCallback } from 'react'

const APP_NAME = '@unlock-app'

export function useAppStorage() {
  const isObject = useCallback((value: any) => typeof value === 'object', [])

  const getKey = useCallback((key: string, withAppName = true) => {
    return withAppName ? `${APP_NAME}.${key}` : key
  }, [])

  const setStorage = useCallback((key: string, value: any) => {
    localStorage.setItem(
      getKey(key),
      isObject(value) ? JSON.stringify(value) : value
    )
  }, [])

  const removeKey = useCallback((key: string, withAppName = true) => {
    localStorage.removeItem(getKey(key, withAppName))
  }, [])

  const getStorage = useCallback((key: string): string | null => {
    const value = localStorage.getItem(getKey(key))
    if (!value) return null
    return isObject(value) ? JSON.parse(value) : value
  }, [])

  const clearStorage = useCallback((): void => {
    const items = { ...localStorage } ?? []
    Object.keys(items)
      .filter((item: string) => item.includes(APP_NAME))
      .forEach((item: string) => removeKey(item, false))
  }, [])

  return {
    setStorage,
    getStorage,
    clearStorage,
    removeKey,
  }
}
