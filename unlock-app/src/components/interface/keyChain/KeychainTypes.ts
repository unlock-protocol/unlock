export interface OwnedKey {
  id: string
  expiration: string
  keyId: string
  lock: {
    name: string
    address: string
    expirationDuration: string
    tokenAddress: string
    price: string
  }
}
