import CacheDriver, { UnkeyedItems } from './driverInterface'
import { Locks } from '../../../unlockTypes'

interface InMemoryCache {
  account?: string
  network?: number
  balance?: number
  locks?: Locks
  [network: number]: {
    [account: string]: {
      [key: string]: any
    }
  }
}

export default class InMemoryDriver implements CacheDriver {
  private cache: InMemoryCache = {}

  async getKeyedItem(networkId: number, accountAddress: string) {
    const container =
      this.cache[networkId] && this.cache[networkId][accountAddress]
    if (!container) return null
    return container
  }

  available() {
    return true
  }

  async getUnkeyedItem(key: UnkeyedItems) {
    const item = this.cache[key]
    if (!item) return null
    return item
  }

  async saveKeyedItem(networkId: number, accountAddress: string, value: any) {
    this.cache[networkId] = this.cache[networkId] || {}
    this.cache[networkId][accountAddress] = value
  }

  async saveUnkeyedItem(key: UnkeyedItems, value: any) {
    this.cache[key] = value
  }

  async clearKeyedCache(networkId: number, accountAddress: string) {
    if (!this.cache[networkId]) return
    delete this.cache[networkId][accountAddress]
  }

  __clear() {
    this.cache = {}
  }
}
