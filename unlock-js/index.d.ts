/* eslint-disable */
import { EventEmitter } from 'events'
import { providers, Wallet } from 'ethers'

interface Web3ServiceParams {
  readOnlyProvider: string
  unlockAddress: string
  network: number
}

export interface PurchaseKeyParams {
  lockAddress: string
  owner: string
  keyPrice: string
  erc20Address: string | null
  referrer: string | null
}

export interface TransactionDefaults {
  hash: string
  to: string
  from: string
  input: string | null
  [key: string]: any
}

export interface RawLock {
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
}

export interface KeyResult {
  lock: string
  owner: string | null
  expiration: number
}

type Web3Provider = string | providers.Web3Provider

export class Web3Service extends EventEmitter {
  constructor(params: Web3ServiceParams)
  refreshAccountBalance: ({ address }: { address: string }) => Promise<string>
  getTransaction: (
    transactionHash: string,
    defaults?: TransactionDefaults
  ) => Promise<void>
  getLock: (address: string) => Promise<RawLock>
  getKeyByLockForOwner: (lock: string, owner: string) => Promise<KeyResult>
  getTokenBalance: (
    tokenAddress: string,
    accountAddress: string
  ) => Promise<string>
  isLockManager: (lock: string, manager: string) => Promise<boolean>
}

interface SetKeyMetadataParams {
  lockAddress: string
  keyId: string
  metadata: { [key: string]: string }
  locksmithHost: string
}

interface UserMetadata {
  publicData?: {
    [key: string]: string
  }
  privateData?: {
    [key: string]: string
  }
}

interface SetUserMetadataParams {
  lockAddress: string
  userAddress: string
  metadata: UserMetadata
  locksmithHost: string
}

interface GetKeyMetadataParams {
  lockAddress: string
  keyId: string
  locksmithHost: string
  getProtectedData?: boolean
}

export class WalletService extends EventEmitter {
  constructor({ unlockAddress }: { unlockAddress: string })
  ready: boolean
  provider?: any
  connect: (provider: Web3Provider) => Promise<string>
  setUnlockAddress: (address: string) => void
  getAccount: () => Promise<string | false>
  // callback is never called with an error and is always called with
  // a hash -- this may change in the future.
  purchaseKey: (
    params: PurchaseKeyParams,
    callback?: (
      error: Error | null,
      hash: string | null,
      transaction: any | null
    ) => void
  ) => Promise<string>
  setKeyMetadata: (params: SetKeyMetadataParams, callback: any) => void
  setUserMetadata: (params: SetUserMetadataParams, callback: any) => void
  getKeyMetadata: (params: GetKeyMetadataParams, callback: any) => void
}
