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
    if (typeof window === 'undefined') return null
    try {
      const value = localStorage.getItem(getKey(key))
      if (!value) return null
      return isObject(value) ? JSON.parse(value) : value
    } catch (error) {
      console.error(error)
    }
    return null
  }, [])

  /*
   * @param exclude: string[] - Array of keys to exclude from deletion, only for keys with APP_NAME
   */
  const clearStorage = useCallback((exclude?: string[]): void => {
    const items = { ...localStorage } ?? []
    Object.keys(items)
      .filter((item: string) => item.includes(APP_NAME))
      .forEach((key: string) => {
        if (exclude && !exclude.includes(key.split('.')[1]))
          removeKey(key, false)
      })
  }, [])

  return {
    setStorage,
    getStorage,
    clearStorage,
    removeKey,
  }
}
