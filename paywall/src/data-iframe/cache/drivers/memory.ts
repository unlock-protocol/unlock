import CacheDriver from './driverInterface'

interface InMemoryCache {
  account?: string
  network?: number
  balance?: number
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

  ready() {
    return true
  }

  available() {
    return true
  }

  async getUnkeyedItem(key: 'account' | 'balance' | 'network') {
    const item = this.cache[key]
    if (!item) return null
    return item
  }

  async saveKeyedItem(networkId: number, accountAddress: string, value: any) {
    this.cache[networkId] = this.cache[networkId] || {}
    this.cache[networkId][accountAddress] = value
  }

  async saveUnkeyedItem(key: 'account' | 'balance' | 'network', value: any) {
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
