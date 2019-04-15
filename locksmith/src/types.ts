export interface UserCreationInput {
  emailAddress: string
  publicKey: string
  passwordEncryptedPrivateKey: string
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

export interface EventCreation {
  lockAddress: string
  name: string
  description: string
  location: string
  date: number
  logo: string
  owner: string
}
