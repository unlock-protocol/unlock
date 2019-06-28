import localStorageAvailable from '../../../utils/localStorage'
import CacheDriver from './driverInterface'
import { LocalStorageWindow } from '../../../windowTypes'

export function storageId(networkId: number, accountAddress: string) {
  return `unlock-protocol/${networkId}/${accountAddress}`
}

export default class LocalStorageDriver implements CacheDriver {
  private window: LocalStorageWindow
  constructor(window: LocalStorageWindow) {
    this.window = window
  }

  async getKeyedItem(networkId: number, accountAddress: string) {
    const item = this.window.localStorage.getItem(
      storageId(networkId, accountAddress)
    )
    // not present in localStorage
    if (!item) return null
    try {
      const container = JSON.parse(item)
      return container
    } catch (_) {
      return null
    }
  }

  available() {
    return localStorageAvailable(this.window)
  }

  async getUnkeyedItem(key: 'account' | 'balance' | 'network') {
    const item = this.window.localStorage.getItem(`__unlockProtocol.${key}`)
    if (!item) return null
    try {
      const container = JSON.parse(item)
      return container
    } catch (_) {
      return null
    }
  }

  async saveKeyedItem(networkId: number, accountAddress: string, value: any) {
    this.window.localStorage.setItem(
      storageId(networkId, accountAddress),
      JSON.stringify(value)
    )
  }

  async saveUnkeyedItem(key: 'account' | 'balance' | 'network', value: any) {
    return this.window.localStorage.setItem(
      `__unlockProtocol.${key}`,
      JSON.stringify(value)
    )
  }

  async clearKeyedCache(networkId: number, accountAddress: string) {
    return this.window.localStorage.removeItem(
      storageId(networkId, accountAddress)
    )
  }
}
