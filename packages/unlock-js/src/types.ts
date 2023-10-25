import type { ethers, providers } from 'ethers'

export interface PurchaseKeyParams {
  lockAddress: string
  owner: string
  keyPrice?: string
  erc20Address?: string | null
  referrer?: string | null
}

export interface TransactionDefaults {
  hash: string
  to: string
  from: string
  input: string | null
  [key: string]: any
}

export interface Lock {
  name: string
  address: string
  keyPrice: string
  expirationDuration: number
  currencyContractAddress: string | null
  asOf?: number
  maxNumberOfKeys?: number
  outstandingKeys?: number
  balance?: string
  owner?: string
  publicLockVersion?: number
}

export interface KeyResult {
  lock: string
  owner: string | null
  expiration: number
}

export interface KeyPayload {
  tokenId: string
  lock: string
  owner: string | null
  expiration: number
}

export type Web3Provider = string | providers.Web3Provider

export type WalletServiceCallback = (
  _error: Error | null,
  _hash: string | null,
  _transaction?: any | null
) => unknown

export interface TransactionOptions {
  nonce?: number
  gasLimit?: ethers.BigNumberish
  gasPrice?: ethers.BigNumberish
  maxFeePerGas?: ethers.BigNumberish
  maxPriorityFeePerGas?: ethers.BigNumberish
  runEstimate?: boolean
  value?: ethers.BigNumberish
}
