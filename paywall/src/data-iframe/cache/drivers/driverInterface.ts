export type UnkeyedItems = 'account' | 'balance' | 'network' | 'locks'
export default interface CacheDriver {
  getKeyedItem(networkId: number, accountAddress: string): Promise<any>
  available(): boolean
  getUnkeyedItem(key: UnkeyedItems): Promise<any>
  saveKeyedItem(
    networkId: number,
    accountAddress: string,
    value: any
  ): Promise<void>
  saveUnkeyedItem(key: UnkeyedItems, value: any): Promise<void>
  clearKeyedCache(networkId: number, accountAddress: string): Promise<void>
  __clear?: () => void
}
