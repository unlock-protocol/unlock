export interface OwnedKey {
  id: string
  expiration: string
  keyId: string
  tokenURI: string
  lock: {
    name: string
    address: string
    expirationDuration: string
    tokenAddress: string
    price: string
  }
}
