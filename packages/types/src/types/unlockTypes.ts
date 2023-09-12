// This file contains type definitions for the various kinds of data that we use
// throughout unlock-app.
// A bug in eslint causes it to think that this exported enum is "unused". So
// disable eslint for that declaration until they fix it. TODO: follow up on this.
/* eslint-disable no-unused-vars */
export enum TransactionType {
  LOCK_CREATION = 'LOCK_CREATION',
  KEY_PURCHASE = 'KEY_PURCHASE',
  WITHDRAWAL = 'WITHDRAWAL',
  UPDATE_KEY_PRICE = 'UPDATE_KEY_PRICE',
}
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
export enum TransactionStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  MINED = 'mined',
  STALE = 'stale',
  FAILED = 'failed',
  NONE = '', // for testing purposes
}
/* eslint-enable no-unused-vars */

export interface NetworkDeploy {
  unlockAddress: string
  startBlock: number
}

export interface Token {
  name: string
  address: string
  symbol: string
  decimals: number
  coingecko?: string
  coinbase?: string
  mainnetAddress?: string
}

export enum HookType {
  CUSTOM_CONTRACT = 'CUSTOM_CONTRACT',
  PASSWORD = 'PASSWORD',
  PROMOCODE = 'PROMOCODE',
  CAPTCHA = 'CAPTCHA',
  GUILD = 'GUILD',
}

export const HooksName = [
  'onKeyPurchaseHook',
  'onKeyCancelHook',
  'onValidKeyHook',
  'onTokenURIHook',
  'onKeyTransferHook',
  'onKeyExtendHook',
  'onKeyGrantHook',
] as const

export type HookName = (typeof HooksName)[number]

export interface Hook {
  id: HookType
  name: string
  address: string
  description?: string
}

export interface NetworkConfig {
  id: number
  featured: boolean
  name: string
  chain: string
  provider: string
  publicProvider: string
  unlockAddress: string
  multisig?: string
  keyManagerAddress?: string
  universalCard?: {
    cardPurchaserAddress: string
    stripeDestinationNetwork: string
    stripeDestinationCurrency: string
  }
  publicLockVersionToDeploy: number
  subgraph: {
    endpoint: string
    endpointV2?: string
    networkName?: string // for thegraph hosted service
    studioEndpoint?: string
  }
  uniswapV3?: Partial<{
    subgraph: string
    factoryAddress: string
    quoterAddress: string
    oracle: string
    universalRouterAddress: string
  }>
  swapPurchaser?: string
  unlockOwner?: string
  explorer?: {
    name: string
    urls: {
      base: string
      address(address: string): string
      transaction(hash: string): string
      token(address: string, owner: string): string
    }
  }
  opensea?: {
    tokenUrl: (lockAddress: string, tokenId: string) => string | null
    collectionUrl?: (lockAddress: string) => string
    profileUrl?: (address: string) => string
  }
  blockScan?: {
    url?: (address: string) => string
  }
  // info about the bridge are available at
  // https://docs.connext.network/resources/deployments
  bridge?: {
    domainId: number
    connext: string
  }
  isTestNetwork?: boolean
  erc20?: {
    symbol: string
    address: string
  } | null
  maxFreeClaimCost?: number
  nativeCurrency: Omit<Token, 'address'>
  startBlock?: number
  previousDeploys?: NetworkDeploy[]
  description: string
  url?: string
  faucet?: string
  tokens?: Token[]
  hooks?: Partial<Record<HookName, Hook[]>>
  fullySubsidizedGas?: boolean
}

export interface NetworkConfigs {
  [networkId: string]: NetworkConfig
}

export interface ContractAbi {
  contractName: string
  abi: Array<{}>
  bytecode: string
  deployedBytecode: string
  compiler: string
  schemaVersion: string
  updatedAt: string
}

export interface Transaction {
  status: TransactionStatus
  confirmations: number
  hash: string
  type: TransactionType
  blockNumber: number

  createdAt?: Date
  to?: string
  for?: string
  from?: string
  lock?: string
  name?: string
  key?: string // TODO: tighten up our types, hopefully we won't have too many
  // optional properties.
}

// Analogous to the transactions in Redux
export interface Transactions {
  [hash: string]: Transaction
}

export interface Account {
  address: string
  balance: string // TODO: Stricter balance type (enforce currency, precision)
}

export interface Network {
  name: number // TODO: This is very misleading, change property name to id
}

export interface ChainExplorerURLBuilders {
  [site: string]: (_address: string) => string
}

// TODO: to remove, deprecated
export interface PaywallCallToAction {
  default: string
  expired: string
  pending: string
  confirmed: string
  noWallet: string
  metadata: string
}

export interface PaywallConfigLocks {
  [address: string]: PaywallConfigLock
}

export interface PaywallConfigLock {
  name?: string
  network?: number
}

export interface MetadataInput {
  name: string
  type: 'text' | 'date' | 'color' | 'email' | 'url'
  required: boolean
  public?: true // optional, all non-public fields are treated as protected
}

// This interface describes an individual paywall's config
export interface PaywallConfig {
  pessimistic?: boolean
  icon?: string
  unlockUserAccounts?: true | 'true' | false
  callToAction: PaywallCallToAction // TODO: to remove, deprecated
  locks: PaywallConfigLocks
  metadataInputs?: MetadataInput[]
  persistentCheckout?: boolean
  useDelegatedProvider?: boolean
  network: number
  autoconnect?: boolean
}

export enum KeyStatus {
  NONE = 'none',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  VALID = 'valid',
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  FAILED = 'failed',
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

export interface Lock {
  name: string
  address: string
  keyPrice: string
  expirationDuration: number
  key: Key
  currencyContractAddress: string | null
  currencyDecimals?: number | null
  currencySymbol?: string | null
  asOf?: number
  maxNumberOfKeys?: number
  outstandingKeys?: number
  balance?: string
  owner?: string
}

// Mapping if currency: amount
export interface Balance {
  [currency: string]: string
}
export interface Locks {
  [address: string]: Lock
}

export interface RawLocks {
  [address: string]: RawLock
}

export interface Key {
  expiration: number
  transactions: Transaction[]
  status: string
  confirmations: number
  owner: string | null
  lock: string
}

export interface PurchaseKeyRequest {
  lock: string // lock address
  extraTip: string // extra value to add in addition to key price
}

export interface NetworkNames {
  [key: number]: string[]
}

// Keys exactly as they come out of Web3Service
export interface KeyResult {
  lock: string
  owner: string
  expiration: number
}

export type KeyResults = { [key: string]: KeyResult }

export interface UserMetadata {
  publicData?: {
    [key: string]: string
  }
  protectedData?: {
    [key: string]: string
  }
}

export type UnlockNetworks = number
