/* eslint-disable */
import { providers, Wallet } from 'ethers'
import { NetworkConfigs } from '@unlock-protocol/types'

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

export interface KeyPayload {
  tokenId: string
  lock: string
  owner: string | null
  expiration: number
}

type Web3Provider = string | providers.Web3Provider

type Callback = (
  error: Error | null,
  hash: string | null,
  transaction: any | null
) => unknown

export class Web3Service {
  constructor(params: NetworkConfigs)
  getTransaction: (transactionHash: string, network: number) => Promise<void>
  getLock: (address: string, network: number) => Promise<RawLock>
  getKeyByLockForOwner: (
    lock: string,
    owner: string,
    network: number
  ) => Promise<KeyResult>
  getTokenBalance: (
    tokenAddress: string,
    accountAddress: string,
    network: number
  ) => Promise<string>
  isLockManager: (
    lock: string,
    manager: string,
    network: number
  ) => Promise<boolean>
  ownerOf: (
    lockAddress: string,
    tokenId: string,
    network: number
  ) => Promise<string>
  isKeyGranter: (
    lockAddress: string,
    owner: string,
    network: number
  ) => Promise<boolean>
  getKeyExpirationByLockForOwner: (
    lock: string,
    owner: string,
    network: number
  ) => Promise<KeyPayload>
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

export class WalletService {
  constructor(NetworkConfigs)
  ready: boolean
  provider?: any
  connect: (provider: any, signer: unknown) => Promise<string>
  setUnlockAddress: (address: string) => void
  getAccount: () => Promise<string | false>
  grantKey: (
    params: { lockAddress: string; recipient: string },
    callback: () => unknown
  ) => unknown
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

  setMaxNumberOfKeys(
    params: { lockAddress: string; maxNumberOfKeys: number },
    callback: Callback
  ): Promise<void>

  setExpirationDuration(
    params: {
      lockAddress: string
      expirationDuration: number
    },
    callback: Callback
  ): Promise<void>

  expireAndRefundFor(
    params: {
      lockAddress: string
      keyOwner: string
      amount: string
      decimals: number | null
      erc20Address: string
    },
    callback: Callback
  ): Promise<void>

  cancelAndRefund(
    params: {
      lockAddress: string
      tokenId: string
    },
    callback: Callback
  ): Promise<void>
}
