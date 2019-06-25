export default interface CacheDriver {
  getKeyedItem(networkId: number, accountAddress: string): Promise<any>
  available(): boolean
  getUnkeyedItem(key: 'account' | 'network'): Promise<any>
  saveKeyedItem(
    networkId: number,
    accountAddress: string,
    value: any
  ): Promise<void>
  saveUnkeyedItem(key: 'account' | 'network', value: any): Promise<void>
  clearKeyedCache(networkId: number, accountAddress: string): Promise<void>
  __clear?: () => void
}
