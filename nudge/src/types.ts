interface Key {
  emailAddress: string | undefined
  keyId: string
  lockAddress: string
  lockName: string| null
}

interface UserTokenMetadataInput {
  data: any
  tokenAddress: string
  userAddress: string
}
