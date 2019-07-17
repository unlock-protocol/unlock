import localStorageAvailable from '../../utils/localStorage'
import InMemoryDriver from './drivers/memory'
// import LocalStorageDriver from './drivers/localStorage'
import CacheDriver from './drivers/driverInterface'
import { LocalStorageWindow } from '../../windowTypes'

const nullAccount = '0x0000000000000000000000000000000000000000'
let __driver: CacheDriver

export function getDriver(window: LocalStorageWindow) {
  if (__driver) return __driver
  if (!localStorageAvailable(window)) {
    __driver = new InMemoryDriver()
  } else {
    __driver = new InMemoryDriver()

    // __driver = new LocalStorageDriver(window)
  }
  return __driver
}

export function __clearDriver() {
  ;(__driver as unknown) = undefined // for unit testing purposes
}

/**
 * retrieve the container from localStorage, ensure the optional type
 * exists as a key if requested
 *
 * @param {string} key the key for the item in localStorage
 * @param {string} type the sub-key (if any) which must exist on return
 */
async function getContainer(
  window: LocalStorageWindow,
  networkId: number,
  accountAddress: string,
  type?: string
) {
  const driver = getDriver(window)
  const value = await driver.getKeyedItem(networkId, accountAddress)
  if (!value) {
    if (type) {
      return { [type]: null }
    }
    return {}
  }
  if (!type) {
    return value
  }
  if (!value[type]) {
    value[type] = null
  }
  return value
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
}: {
  window: LocalStorageWindow
  networkId: number
  type?: string
  accountAddress: string
}) {
  const container = await getContainer(window, networkId, accountAddress, type)
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
}: {
  window: LocalStorageWindow
  networkId: number
  type: string
  accountAddress: string
  value: any
}) {
  const driver = getDriver(window)
  const container = await getContainer(window, networkId, accountAddress, type)
  if (value === undefined) {
    delete container[type]
  } else {
    container[type] = value
  }

  driver.saveKeyedItem(networkId, accountAddress, container)
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
}: {
  window: LocalStorageWindow
  networkId: number
  type: string
  subType: string
  accountAddress: string
  value: any
}) {
  const driver = getDriver(window)
  const container = await getContainer(window, networkId, accountAddress, type)
  let newContainer
  if (value === undefined) {
    newContainer = {
      ...container,
      [type]: {
        ...container[type],
      },
    }
    delete newContainer[type][subType]
  } else {
    const cType = container[type] || {}
    const oldValue = { ...cType[subType] } || {}
    newContainer = {
      ...container,
      [type]: {
        ...cType,
        [subType]: {
          ...oldValue,
          ...value,
        },
      },
    }
  }

  await driver.saveKeyedItem(networkId, accountAddress, newContainer)
}

/**
 * Retrieve the current cached account
 *
 * @param {object} window this is the global context, either global, window, or self
 * @returns {string}
 */
export async function getAccount(window: LocalStorageWindow) {
  const driver = getDriver(window)
  return driver.getUnkeyedItem('account')
}

/**
 * Set the current cached account
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {string} account the ethereum account address of the current user
 */
export async function setAccount(window: LocalStorageWindow, account: string) {
  const driver = getDriver(window)
  return driver.saveUnkeyedItem('account', account)
}

/**
 * Retrieve the current cached ethereum network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @returns {number}
 */
export async function getNetwork(window: LocalStorageWindow) {
  const driver = getDriver(window)
  return +(await driver.getUnkeyedItem('network'))
}

/**
 * Set the current cached network
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {number} network the id of the current ethereum network
 */
export async function setNetwork(window: LocalStorageWindow, network: number) {
  const driver = getDriver(window)
  return driver.saveUnkeyedItem('network', network)
}

/**
 * clear the cache, either for the user or for a specific value
 *
 * @param {object} window this is the global context, either global, window, or self
 * @param {int} networkId the ethereum network id
 * @param {string} accountAddress the ethereum account address of the user whose data is cached
 * @param {string} type the type of account data to set
 */
export async function clear({
  window,
  networkId,
  accountAddress,
  type,
}: {
  window: LocalStorageWindow
  networkId: number
  accountAddress: string
  type?: string
}) {
  const driver = getDriver(window)

  if (!type) {
    return driver.clearKeyedCache(networkId, accountAddress)
  }

  return put({ window, networkId, accountAddress, type, value: undefined })
}
