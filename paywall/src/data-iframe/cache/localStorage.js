import localStorageAvailable from '../../utils/localStorage'

export function storageId(networkId, accountAddress) {
  return `unlock-protocol/${networkId}/${accountAddress}`
}

const nullAccount = '0x0000000000000000000000000000000000000000'

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

  if (!type) {
    return container
  }
  if (!container[type]) {
    container[type] = null
  }
  return container
}

/**
 * check for local storage, throw if it is unavailable with a nicely formatted error message
 * @param {object} window this is the global context, either global, window, or self
 * @param {string} action a description of the action that will be performed if localStorage exists
 */
function ensureLocalStorageAvailable(window, action) {
  if (!localStorageAvailable(window)) {
    throw new Error(`localStorage is unavailable, cannot ${action}`)
  }
}

/**
 * Retrieve a cached value for a user on a specific network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {int} networkId the ethereum network id
 * @param {string} type the type of account data to retrieve
 * @param {string} accountAddress the ethereum account address of the user whose data is cached. For general
 *                                values like locks, use null account to make them available to anyone
 */
export async function get({
  window,
  networkId,
  type,
  accountAddress = nullAccount,
}) {
  ensureLocalStorageAvailable(window, `get ${type} from cache`)
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
 * @param {string} type the type of account data to set
 * @param {*} value the value to store. This must be serializable as JSON
 * @param {string} accountAddress the ethereum account address of the user whose data is cached. For general
 *                                values like locks, use null account to make them available to anyone
 */
export async function put({
  window,
  networkId,
  type,
  value,
  accountAddress = nullAccount,
}) {
  ensureLocalStorageAvailable(window, `save ${type} in cache`)
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
 * Merge a sub-value into a larger value store in the cache
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {int} networkId the ethereum network id
 * @param {string} type the type of account data to set
 * @param {*} value the value to store. This must be serializable as JSON
 * @param {string} accountAddress the ethereum account address of the user whose data is cached. For general
 *                                values like locks, use null account to make them available to anyone
 */
export async function merge({
  window,
  networkId,
  type,
  subType,
  value,
  accountAddress = nullAccount,
}) {
  ensureLocalStorageAvailable(window, `save ${type}/${subType} in cache`)
  const key = storageId(networkId, accountAddress)
  const container = getContainer(window, key, type)
  if (value === undefined) {
    delete container[type][subType]
  } else {
    container[type][subType] = value
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
  ensureLocalStorageAvailable(window, 'get account from cache')
  return window.localStorage.getItem('__unlockProtocol.account') || null
}

/**
 * Set the current cached account
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {string} account the ethereum account address of the current user
 */
export async function setAccount(window, account) {
  ensureLocalStorageAvailable(window, 'save account in cache')
  window.localStorage.setItem('__unlockProtocol.account', account)
}

/**
 * Retrieve the current cached ethereum network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @returns {number}
 */
export async function getNetwork(window) {
  ensureLocalStorageAvailable(window, 'get network from cache')
  return +window.localStorage.getItem('__unlockProtocol.network') || null
}

/**
 * Set the current cached network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {number} network the id of the current ethereum network
 */
export async function setNetwork(window, network) {
  ensureLocalStorageAvailable(window, 'save network in cache')
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
export async function clear({ window, networkId, accountAddress, type }) {
  ensureLocalStorageAvailable(window, 'clear cache')
  const key = storageId(networkId, accountAddress)
  if (!type) {
    window.localStorage.removeItem(key)
    return
  }

  await put({ window, networkId, accountAddress, type, value: undefined })
}

const listeners = {}

/**
 * Listen for changes to cached values in other tabs
 *
 * @param {object} window this is the global context, either global, window or self
 * @param {int} networkId the ethereum network id
 * @param {string} accountAddress the ethereum account address of the user whose data is cached
 */
export async function addListener({
  window,
  networkId,
  changeCallback,
  accountAddress = nullAccount,
}) {
  const key = storageId(networkId, accountAddress)
  if (listeners[key]) {
    removeListener({ window, networkId, accountAddress })
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
export async function removeListener({
  window,
  networkId,
  accountAddress = nullAccount,
}) {
  const key = storageId(networkId, accountAddress)
  if (!listeners[key]) return
  window.removeEventListener('storage', listeners[key])
  delete listeners[key]
}
