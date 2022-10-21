// This file contains type definitions for the various kinds of data that we use
// throughout unlock-app.

import { Card } from '@stripe/stripe-js'
import { z } from 'zod'

export const MetadataInputSchema = z.object({
  name: z.string({
    description: 'Field label',
  }),
  defaultValue: z
    .string({
      description: 'Field default value',
    })
    .optional(),
  type: z.enum(['text', 'date', 'color', 'email', 'url']),
  required: z.boolean({
    description: 'When true the field will be required',
  }),
  placeholder: z
    .string({
      description: 'Field placeholder text',
    })
    .optional(),
  public: z
    .boolean({
      description:
        'If any metadata should be visible to everyone, mark the public field as true.',
    })
    .optional(), // optional, all non-public fields are treated as protected
})

export const PaywallConfigLockSchema = z.object({
  name: z
    .string({
      description: 'Name of the lock to display.',
    })
    .optional(),
  network: z.number().int().positive().optional(),
  metadataInputs: z.array(MetadataInputSchema).optional(),
  recurringPayments: z
    .number({
      description:
        'The number of time a membership should be renewed automatically. This only applies to ERC20 locks.',
    })
    .int()
    .optional(),
  captcha: z
    .boolean({
      description:
        'If set true, the users will be prompted to go through a captcha during the checkout process. This is better used in conjunction with a purchase hook that verifies that captcha is valid.',
    })
    .optional(),
  password: z
    .boolean({
      description:
        'Defaults to false. If set to true, the user will be prompted to enter a password in order to complete their purchases. This will only be useful if the lock is connected to a hook that will handle the password verification.',
    })
    .optional(),
  emailRequired: z
    .boolean({
      description:
        'If set to true, the user will be prompted to enter an email which will be stored as metadata and be visible to any lock manager.',
    })
    .optional(),
  minRecipients: z
    .number({
      description:
        'Set the minimum number of memberships a user needs to purchase.',
    })
    .int()
    .positive()
    .optional(),
  maxRecipients: z
    .number({
      description: `Set the max number of memberships a user can purchase. Note: By default, checkout doesn't allow fiddling with quantity. You have to set maxRecipients to allow for changing to quantity.`,
    })
    .int()
    .positive()
    .optional(),
  superfluid: z
    .boolean({
      description:
        'When set to true, superfluid will be enabled as payment method for the lock.',
    })
    .optional(),
  default: z.boolean().optional(),
  dataBuilder: z
    .string({
      description:
        'If set to a url, checkout will call the URL through a proxy with recipient, lockAddress, and network field for a json response containing data string field. This will be passed to the purchase function when user is claiming or buying the key as is. Make sure the returned data is valid bytes.',
    })
    .optional(),
})

export const PaywallConfigLocksSchema = z.record(PaywallConfigLockSchema)

export const PaywallConfigSchema = z
  .object({
    title: z
      .string({
        description: 'Title for your checkout. This will show up on the head.',
      })
      .optional(),
    icon: z
      .string({
        description:
          'The URL for a icon to display in the top left corner of the modal.',
      })
      .optional(),
    callToAction: z.any().optional(),
    locks: z.record(PaywallConfigLockSchema),
    metadataInputs: z.array(MetadataInputSchema).optional(),
    persistentCheckout: z
      .boolean({
        description:
          'true if the modal cannot be closed, defaults to false when embedded. When closed, the user will be redirected to the redirect query param when using a purchase address (see above).',
      })
      .optional(),
    redirectUri: z
      .string({
        description:
          'The URL-encodded address of a webpage where the user will be redirected when their membership is valid.',
      })
      .optional(),
    useDelegatedProvider: z.boolean().optional(),
    network: z.number().int().optional(),
    referrer: z
      .string({
        description:
          'The address which will receive UDT tokens (if the transaction is applicable)',
      })
      .optional(),
    messageToSign: z
      .string({
        description:
          'If supplied, the user is prompted to sign this message using their wallet. If using a checkout URL, a signature query param is then appended to the redirectUri (see above). If using the embedded paywall, the unlockProtocol.authenticated includes the signature attribute.',
      })
      .optional(),
    pessimistic: z
      .boolean({
        description:
          'By default, to reduce friction, we do not require users to wait for the transaction to be mined before offering them to be redirected. By setting this to true, users will need to wait for the transaction to have been mined in order to proceed to the next step.',
      })
      .optional(),
    captcha: z
      .boolean({
        description:
          'If set true, the users will be prompted to go through a captcha during the checkout process. This is better used in conjunction with a purchase hook that verifies that captcha is valid.',
      })
      .optional(),
    minRecipients: z
      .number({
        description:
          'Set the minimum number of memberships a user needs to purchase.',
      })
      .int()
      .optional(),
    maxRecipients: z
      .number({
        description: `Set the max number of memberships a user can purchase. Note: By default, checkout doesn't allow fiddling with quantity. You have to set maxRecipients to allow for changing to quantity.`,
      })
      .int()
      .optional(),
    superfluid: z
      .boolean({
        description:
          'When set to true, superfluid will be enabled as payment method for the lock.',
      })
      .optional(),
    hideSoldOut: z
      .boolean({
        description:
          'When set to true, sold our locks are not shown to users when they load the checkout modal.',
      })
      .optional(),
    password: z
      .boolean({
        description:
          'Defaults to false. If set to true, the user will be prompted to enter a password in order to complete their purchases. This will only be useful if the lock is connected to a hook that will handle the password verification.',
      })
      .optional(),
    emailRequired: z
      .boolean({
        description:
          'If set to true, the user will be prompted to enter an email which will be stored as metadata and be visible to any lock manager.',
      })
      .optional(),
    dataBuilder: z
      .string({
        description:
          'If set to a url, checkout will call the URL through a proxy with recipient, lockAddress, and network field for a json response containing data string field. This will be passed to the purchase function when user is claiming or buying the key as is. Make sure the returned data is valid bytes.',
      })
      .optional(),
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
