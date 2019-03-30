export interface UserCreationInput {
  emailAddress: string
  publicKey: string
  passwordEncryptedPrivateKey: string
  recoveryPhrase: string
}

export interface Lock {
  address: string
  name: string
  owner: string
}

export interface SignatureValidationConfiguration {
  signee: string
  required: string[]
  name: string
}
