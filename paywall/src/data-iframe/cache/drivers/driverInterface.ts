export default interface CacheDriver {
  getKeyedItem(networkId: number, accountAddress: string): Promise<any>
  available(): boolean
  ready(): boolean
  getUnkeyedItem(key: 'account' | 'balance' | 'network'): Promise<any>
  saveKeyedItem(
    networkId: number,
    accountAddress: string,
    value: any
  ): Promise<void>
  saveUnkeyedItem(
    key: 'account' | 'balance' | 'network',
    value: any
  ): Promise<void>
  clearKeyedCache(networkId: number, accountAddress: string): Promise<void>
  __clear?: () => void
}
