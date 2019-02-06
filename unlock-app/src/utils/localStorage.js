// copied from the MDN docs as the best way to detect localStorage presence
export function localStorageAvailable(window) {
  try {
    var storage = window.localStorage,
      x = '__storage_test__'
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

export function getUserStorageName(account, network) {
  return `unlock-${account}-${network}`
}

export function saveKeyToStorage(window, key, network) {
  const storageKeys = getKeysFromStorage(window, key.owner, network)
  const keys = storageKeys ? storageKeys : {}
  keys[key.lock] = keys[key.lock] || {}
  keys[key.lock][key.id] = key
  window.localStorage.setItem(
    getUserStorageName(key.owner, network),
    JSON.stringify(keys)
  )
}

export function getKeysFromStorage(window, account, network) {
  const info = window.localStorage.getItem(getUserStorageName(account, network))
  try {
    return JSON.parse(info)
  } catch (e) {
    return {}
  }
}

export function getKeysForLockFromStorage(window, lock, account, network) {
  const allKeys = getKeysFromStorage(window, account, network)
  return allKeys[lock] || {}
}

export function resetAccountStorage(window, account, network) {
  window.localStorage.removeItem(getUserStorageName(account, network))
}
