import { Request } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

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
  duration?: number
  links?: any
}

export interface ItemizedKeyPrice {
  keyPrice: number
  gasFee: number
  creditCardProcessing: number
  unlockServiceFee: number
}

export interface SignedRequest extends Request {
  owner: string
}

export type ethereumAddress = string
