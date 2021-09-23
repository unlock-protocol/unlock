// copied from the MDN docs as the best way to detect localStorage presence
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Testing_for_availability
export default function localStorageAvailable(): boolean {
  const storage = localStorage
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

export function store(key: string, value: object) {
  if (localStorageAvailable()) {
    window.localStorage.setItem(key, JSON.stringify(value))
  } else {
    // Fail silently!
  }
}

export function retrieve(key: string) {
  if (localStorageAvailable()) {
    const item = localStorage.getItem(key) || ''
    return JSON.parse(item)
  }
  return undefined
}
