import { Request } from 'express-serve-static-core'

export interface UserCreationInput {
  emailAddress: string
  publicKey: string
  passwordEncryptedPrivateKey: any
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
  gasFee?: number
  keyPrice?: number
  creditCardProcessing?: number
  unlockServiceFee?: number
}

export interface SignedRequest extends Request {
  owner: string
  signee: string
  chain: number
}

export interface UserTokenMetadataInput {
  chain: number
  tokenAddress: string
  userAddress: string
  data: any
}

export type ethereumAddress = string
