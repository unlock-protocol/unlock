import { useCallback } from 'react'

const APP_NAME = '@unlock-app'

export function useAppStorage() {
  const isObject = useCallback((value: any) => typeof value === 'object', [])

  const getKey = useCallback((key: string) => `${APP_NAME}.${key}`, [])

  const setStorage = useCallback((key: string, value: any) => {
    localStorage.setItem(
      getKey(key),
      isObject(value) ? JSON.stringify(value) : value
    )
  }, [])

  const removeKey = useCallback((key: string) => {
    localStorage.removeItem(getKey(key))
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
      .forEach(removeKey)
  }, [])

  return {
    setStorage,
    getStorage,
    clearStorage,
    removeKey,
  }
}
