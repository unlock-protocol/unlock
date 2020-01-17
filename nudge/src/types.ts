interface Key {
  lockAddress: string
  emailAddress: string | undefined
  keyId: string
}

interface UserTokenMetadataInput {
  tokenAddress: string
  userAddress: string
  data: any
}
