import localStorageAvailable from '../../../utils/localStorage'
import CacheDriver from './driverInterface'
import { LocalStorageWindow } from '../../../windowTypes'

export function storageId(networkId: number, accountAddress: string) {
  return `unlock-protocol/${networkId}/${accountAddress}`
}

type unKeyedKeys = 'account' | 'balance' | 'network' | '__version'

export const currentCacheVersion = '1.0'

export default class LocalStorageDriver implements CacheDriver {
  private window: LocalStorageWindow
  private isReady: boolean
  constructor(window: LocalStorageWindow) {
    this.window = window
    this.isReady = false
    if (this.available()) {
      this.getUnkeyedItem('__version').then(async version => {
        if (version !== currentCacheVersion) {
          // clear cache
          window.localStorage.clear()
          await this.saveUnkeyedItem('__version', currentCacheVersion)
        }
        this.isReady = true
      })
    }
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

  ready() {
    return this.isReady
  }

  available() {
    return localStorageAvailable(this.window)
  }

  async getUnkeyedItem(key: unKeyedKeys) {
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

  async saveUnkeyedItem(key: unKeyedKeys, value: any) {
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
