import localStorageAvailable from '../../utils/localStorage'

export function storageId(networkId, accountAddress) {
  return `unlock-protocol/${networkId}/${accountAddress}`
}

/**
 * retrieve the container from localStorage, ensure the optional type
 * exists as a key if requested
 *
 * @param {string} key the key for the item in localStorage
 * @param {string} type the sub-key (if any) which must exist on return
 */
function getContainer(window, key, type = false) {
  const value = window.localStorage.getItem(key)
  if (!value) {
    if (type) {
      return { [type]: null }
    }
    return {}
  }
  let container
  try {
    container = JSON.parse(value)
  } catch (e) {
    // always work, cache is invalid, so we will overwrite on next write
    return { [type]: null }
  }

  if (typeof container !== 'object') {
    if (type) {
      return { [type]: null }
    }
    return {}
  }

  if (!type) {
    return container
  }
  if (!container[type]) {
    container[type] = null
  }
  return container
}

/**
 * Retrieve a cached value for a non-user-specific type on a specific network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {int} networkId the ethereum network id
 * @param {string} type the type of account data to retrieve
 */
export async function getReadOnly(window, networkId, type) {
  return get(
    window,
    networkId,
    '0x0000000000000000000000000000000000000000',
    type
  )
}

/**
 * Cache a value for a non-user-specific type on a network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {int} networkId the ethereum network id
 * @param {string} type the type of account data to set
 * @param {*} value the value to store. This must be serializable as JSON
 */
export async function putReadOnly(window, networkId, type, value) {
  return put(
    window,
    networkId,
    '0x0000000000000000000000000000000000000000',
    type,
    value
  )
}

/**
 * Retrieve a cached value for a user on a specific network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {int} networkId the ethereum network id
 * @param {string} accountAddress the ethereum account address of the user whose data is cached
 * @param {string} type the type of account data to retrieve
 */
export async function get(window, networkId, accountAddress, type) {
  if (!localStorageAvailable(window)) {
    throw new Error('Cannot get value from localStorage')
  }
  const key = storageId(networkId, accountAddress)

  const container = getContainer(window, key, type)
  if (!type) return container
  return container[type]
}

/**
 * Cache a value for a user on a network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {int} networkId the ethereum network id
 * @param {string} accountAddress the ethereum account address of the user whose data is cached
 * @param {string} type the type of account data to set
 * @param {*} value the value to store. This must be serializable as JSON
 */
export async function put(window, networkId, accountAddress, type, value) {
  if (!localStorageAvailable(window)) {
    throw new Error('Cannot put value into localStorage')
  }
  const key = storageId(networkId, accountAddress)
  const container = getContainer(window, key, type)
  if (value === undefined) {
    delete container[type]
  } else {
    container[type] = value
  }

  window.localStorage.setItem(key, JSON.stringify(container))
}

/**
 * Retrieve the current cached account
 *
 * @param {object} window this is the global context, either global, window, or self
 * @returns {string}
 */
export async function getAccount(window) {
  if (!localStorageAvailable(window)) {
    throw new Error('Cannot get value from localStorage')
  }
  return window.localStorage.getItem('__unlockProtocol.account') || null
}

/**
 * Set the current cached account
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {string} account the ethereum account address of the current user
 */
export async function setAccount(window, account) {
  if (!localStorageAvailable(window)) {
    throw new Error('Cannot put value into localStorage')
  }
  window.localStorage.setItem('__unlockProtocol.account', account)
}

/**
 * Retrieve the current cached ethereum network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @returns {number}
 */
export async function getNetwork(window) {
  if (!localStorageAvailable(window)) {
    throw new Error('Cannot get value from localStorage')
  }
  return +window.localStorage.getItem('__unlockProtocol.network') || null
}

/**
 * Set the current cached network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {number} network the id of the current ethereum network
 */
export async function setNetwork(window, network) {
  if (!localStorageAvailable(window)) {
    throw new Error('Cannot put value into localStorage')
  }
  window.localStorage.setItem('__unlockProtocol.network', String(network))
}

/**
 * clear the cache, either for the user or for a specific value
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {int} networkId the ethereum network id
 * @param {string} accountAddress the ethereum account address of the user whose data is cached
 * @param {string} type the type of account data to set
 */
export async function clear(window, networkId, accountAddress, type) {
  if (!localStorageAvailable(window)) {
    throw new Error('Cannot clear localStorage cache')
  }
  const key = storageId(networkId, accountAddress)
  if (!type) {
    window.localStorage.removeItem(key)
    return
  }

  await put(window, networkId, accountAddress, type, undefined)
}

const listeners = {}

/**
 * Listen for changes to cached values in other tabs
 *
 * @param {object} window this is the global context, either global, window or self
 * @param {int} networkId the ethereum network id
 * @param {string} accountAddress the ethereum account address of the user whose data is cached
 */
export async function addListener(
  window,
  networkId,
  accountAddress,
  changeCallback = () => {}
) {
  const key = storageId(networkId, accountAddress)
  if (listeners[key]) {
    removeListener(window, networkId, accountAddress)
  }
  listeners[key] = evt => {
    if (evt.storageArea !== window.localStorage) return // ignore sessionStorage
    const changedKey = evt.key
    if (changedKey === key) {
      changeCallback(evt.oldValue, evt.newValue)
    }
  }
  window.addEventListener('storage', listeners[key])
}

/**
 * Stop listening for changes to cached values in other tabs
 *
 * @param {object} window this is the global context, either global, window or self
 * @param {int} networkId the ethereum network id
 * @param {string} accountAddress the ethereum account address of the user whose data is cached
 */
export async function removeListener(window, networkId, accountAddress) {
  const key = storageId(networkId, accountAddress)
  if (!listeners[key]) return
  window.removeEventListener('storage', listeners[key])
  delete listeners[key]
}
