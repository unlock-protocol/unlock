import {
  PaywallConfig,
  Locks,
  PurchaseKeyRequest,
  Transactions,
  Balance,
  UserMetadata,
  KeyResults,
  UnlockNetworks,
} from './unlockTypes'
import { web3MethodCall, Web3WalletInfo, web3MethodResult } from './windowTypes'

// This file written with HEAVY inspiration from https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/

// TODO: there is a lot of duplicates from constants.js
export enum PostMessages {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  REDIRECT = 'redirect',
  GET_OPTIMISTIC = 'optimistic',
  GET_PESSIMISTIC = 'pessimistic',
  READY = 'ready',
  CONFIG = 'config',
  ACCOUNT = 'account',
  WEB3 = 'web3',
  WEB3_RESULT = 'web3', // this is the same as WEB3 because the exchange is 1-way
  READY_WEB3 = 'ready/web3',
  WALLET_INFO = 'walletInfo',
  USING_MANAGED_ACCOUNT = 'info/managedUserAccount',

  UPDATE_LOCKS = 'update/locks',
  UPDATE_ACCOUNT = 'update/account',
  UPDATE_ACCOUNT_BALANCE = 'update/accountBalance',
  UPDATE_NETWORK = 'update/network',
  UPDATE_WALLET = 'update/walletModal',
  UPDATE_KEYS = 'update/keys',
  UPDATE_TRANSACTIONS = 'update/transactions',

  ERROR = 'error',
  SEND_UPDATES = 'send/updates',

  PURCHASE_KEY = 'purchaseKey',
  DISMISS_CHECKOUT = 'dismiss/checkout',
  INITIATED_TRANSACTION = 'initiated/transaction',

  SHOW_ACCOUNTS_MODAL = 'show/accountsModal',
  HIDE_ACCOUNTS_MODAL = 'hide/accountsModal',

  SET_USER_METADATA = 'setMetadata/user',
  SET_USER_METADATA_SUCCESS = 'setMetadata/user/success',
}
// all the possible message types
export type Message =
  | {
      type: PostMessages.LOCKED
      payload: undefined
    }
  | {
      type: PostMessages.UNLOCKED
      payload: string[]
    }
  | {
      type: PostMessages.REDIRECT
      payload: undefined
    }
  | {
      type: PostMessages.GET_OPTIMISTIC
      payload: undefined
    }
  | {
      type: PostMessages.GET_PESSIMISTIC
      payload: undefined
    }
  | {
      type: PostMessages.READY
      payload: undefined
    }
  | {
      type: PostMessages.CONFIG
      payload: PaywallConfig
    }
  | {
      type: PostMessages.ACCOUNT
      payload: string
    }
  | {
      type: PostMessages.WEB3
      payload: web3MethodCall
    }
  | {
      type: PostMessages.WEB3_RESULT
      payload: web3MethodResult
    }
  | {
      type: PostMessages.READY_WEB3
      payload: undefined
    }
  | {
      type: PostMessages.WALLET_INFO
      payload: Web3WalletInfo
    }
  | {
      type: PostMessages.UPDATE_LOCKS
      payload: Locks
    }
  | {
      type: PostMessages.UPDATE_ACCOUNT
      payload: string | null
    }
  | {
      type: PostMessages.UPDATE_ACCOUNT_BALANCE
      payload: Balance
    }
  | {
      type: PostMessages.UPDATE_NETWORK
      payload: UnlockNetworks
    }
  | {
      type: PostMessages.UPDATE_WALLET
      payload: boolean
    }
  | {
      type: PostMessages.ERROR
      payload: string
    }
  | {
      type: PostMessages.SEND_UPDATES
      payload: 'locks' | 'account' | 'balance' | 'network'
    }
  | {
      type: PostMessages.PURCHASE_KEY
      payload: PurchaseKeyRequest
    }
  | {
      type: PostMessages.DISMISS_CHECKOUT
      payload: undefined
    }
  | {
      type: PostMessages.INITIATED_TRANSACTION
      payload: undefined
    }
  | {
      type: PostMessages.SHOW_ACCOUNTS_MODAL
      payload: undefined
    }
  | {
      type: PostMessages.HIDE_ACCOUNTS_MODAL
      payload: undefined
    }
  | {
      type: PostMessages.UPDATE_KEYS
      payload: KeyResults
    }
  | {
      type: PostMessages.UPDATE_TRANSACTIONS
      payload: Transactions
    }
  | {
      type: PostMessages.USING_MANAGED_ACCOUNT
      payload: undefined
    }
  | {
      type: PostMessages.SET_USER_METADATA
      payload: {
        metadata: UserMetadata
        lockAddress: string
      }
    }
  | {
      type: PostMessages.SET_USER_METADATA_SUCCESS
      payload: undefined
    }

export type MessageTypes = Message['type']
export type ExtractPayload<TYPE> = Extract<Message, { type: TYPE }>['payload']

// Eslint requires a default export
export default {}
