export interface UserCreationInput {
  emailAddress: String
  publicKey: String
  passwordEncryptedPrivateKey: String
  recoveryPhrase: String
}

export interface Lock {
  address: string
  name: string
  owner: string
}
