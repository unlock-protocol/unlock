import { LocalStorageWindow } from '../windowTypes'

// copied from the MDN docs as the best way to detect localStorage presence
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Testing_for_availability
export const localStorageAvailable = (window: LocalStorageWindow) => {
  let storage
  try {
    storage = window.localStorage // Safari will throw errors when *just* accessing this variable
  } catch (e) {
    return false
  }
  try {
    const x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0
    )
  }
}

// Get an item from local storage. If not present, or local storage
// can't be used, return null.
export const getItem = (
  window: LocalStorageWindow,
  keyName: string
): string | null => {
  if (localStorageAvailable(window)) {
    return window.localStorage.getItem(keyName)
  }
  return null
}

// Set an item in local storage. If local storage can't be used or
// write fails, return false. Otherwise true.
export const setItem = (
  window: LocalStorageWindow,
  keyName: string,
  keyValue: string
): boolean => {
  if (localStorageAvailable(window)) {
    try {
      window.localStorage.setItem(keyName, keyValue)
      return true
    } catch (_) {
      return false
    }
  }

  return false
}
