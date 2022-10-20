// This file contains type definitions for the various kinds of data that we use
// throughout unlock-app.

import { Card } from '@stripe/stripe-js'
import { z } from 'zod'

export const MetadataInputSchema = z
  .object({
    name: z.string(),
    defaultValue: z.string().optional(),
    type: z.enum(['text', 'date', 'color', 'email', 'url']),
    required: z.boolean(),
    placeholder: z.string().optional(),
    public: z.boolean().optional(), // optional, all non-public fields are treated as protected
  })
  .array()
  .optional()

export const PaywallConfigLockSchema = z.object({
  name: z.string().optional(),
  network: z.number().int().positive().optional(),
  metadataInputs: MetadataInputSchema,
  recurringPayments: z.number().int().optional(),
  captcha: z.boolean().optional(),
  password: z.boolean().optional(),
  emailRequired: z.boolean().optional(),
  maxRecipients: z.number().int().positive().optional(),
  minRecipients: z.number().int().positive().optional(),
  superfluid: z.boolean().optional(),
  default: z.boolean().optional(),
  dataBuilder: z.string().optional(),
})

export const PaywallConfigLocksSchema = z.record(PaywallConfigLockSchema)

export const PaywallConfigSchema = z
  .object({
    title: z.string().optional(),
    icon: z.string().optional(),
    callToAction: z.any().optional(),
    locks: z.record(PaywallConfigLockSchema).optional(),
    metadataInputs: MetadataInputSchema,
    persistentCheckout: z.boolean().optional(),
    redirectUri: z.string().optional(),
    useDelegatedProvider: z.boolean().optional(),
    network: z.number().int().optional(),
    referrer: z.string().optional(),
    messageToSign: z.string().optional(),
    pessimistic: z.boolean().optional(),
    captcha: z.boolean().optional(),
    maxRecipients: z.number().int().optional(),
    minRecipients: z.number().int().optional(),
    superfluid: z.boolean().optional(),
    hideSoldOut: z.boolean().optional(),
    password: z.boolean().optional(),
    emailRequired: z.boolean().optional(),
    dataBuilder: z.string().optional(),
  })
  .passthrough()

export const BasicPaywallConfigSchema = PaywallConfigSchema.pick({
  title: true,
  icon: true,
  persistentCheckout: true,
  referrer: true,
  messageToSign: true,
  pessimistic: true,
  hideSoldOut: true,
})

export enum TransactionType {
  LOCK_CREATION = 'Lock Creation',
  KEY_PURCHASE = 'Key Purchase',
  WITHDRAWAL = 'Withdrawal',
  UPDATE_KEY_PRICE = 'Update Key Price',
}

export enum TransactionStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  MINED = 'mined',
}

export enum KindOfModal {
  WalletCheckOverlay,
}

export interface Transaction {
  status: TransactionStatus
  confirmations: number
  hash: string
  lock: string
  name: string
  type: TransactionType
  blockNumber: number

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
  // emailAddress will be present when a user account is being used, but not otherwise
  emailAddress?: string
  cards?: Card[]
}

export interface Network {
  name: number // TODO: This is very misleading, change property name to id
}
export interface Loading {
  loading: number
}

export interface Action {
  type: string
  [key: string]: any
}

export type Dispatch = (action: Action) => any

// This is currrently the way ethers checks the keystore format.
export interface EncryptedPrivateKey {
  version: number
  [param: string]: any
}

export interface Router {
  location: Location
}

export interface Error {
  name: string
  data?: {
    [key: string]: any
  }
}

export type PaywallCallToAction = any
export type PaywallConfigLock = z.infer<typeof PaywallConfigLockSchema>
export type MetadataInput = z.infer<typeof MetadataInputSchema>
export type PaywallConfig = z.infer<typeof PaywallConfigSchema>
export type PaywallConfigLocks = z.infer<typeof PaywallConfigLocksSchema>
export type BasicPaywallConfig = z.infer<typeof BasicPaywallConfigSchema>

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

export interface Lock {
  canGrant?: boolean
  name: string
  address: string
  network: number
  keyPrice: string
  expirationDuration: number
  key: Key
  currencyContractAddress: string | null
  asOf?: number
  maxNumberOfKeys?: number
  outstandingKeys?: number
  balance?: string
  owner?: string
  creationBlock?: number
  publicLockVersion?: number
  maxKeysPerAddress?: number
  selfAllowance?: string
}

export interface Locks {
  [address: string]: Lock
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

export interface KeyMetadata {
  // These 3 properties are always present -- they come down from the graph as
  // strings
  lockName: string
  expiration: string
  keyholderAddress: string
  // Can have any other arbitrary properies, as long as the values are strings.
  [key: string]: string
}

// TODO: come up with one master type for the Redux store that we can
// import from every connected component

// Represents the keyholdersByLock GraphQL query result
export interface KeyholdersByLock {
  locks: {
    address: string
    name: string
    keys: {
      expiration: string
      keyId: string
      owner: {
        address: string
      }
    }[]
  }[]
}

export interface Balances {
  eth: string
  [contractAddress: string]: string
}

export type MemberFilter = 'all' | 'active' | 'expired'

export interface UserMetadata {
  publicData?: {
    [key: string]: string
  }
  protectedData?: {
    [key: string]: string
  }
}

export interface DelayedPurchase {
  lockAddress: string
  purchaseKey: () => void
}
export interface OAuthConfig {
  clientId: string
  responseType: string
  state: string
  redirectUri: string
}
