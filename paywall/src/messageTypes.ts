import { PaywallConfig, Locks, PurchaseKeyRequest } from './unlockTypes'
import { web3MethodCall, Web3WalletInfo, web3MethodResult } from './windowTypes'

// This file written with HEAVY inspiration from https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/

export enum PostMessages {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  SCROLL_POSITION = 'scrollPosition',
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

  UPDATE_LOCKS = 'update/locks',
  UPDATE_ACCOUNT = 'update/account',
  UPDATE_ACCOUNT_BALANCE = 'update/accountBalance',
  UPDATE_NETWORK = 'update/network',
  UPDATE_WALLET = 'update/walletmodal',

  ERROR = 'error',
  SEND_UPDATES = 'send/updates',

  PURCHASE_KEY = 'purchaseKey',
  DISMISS_CHECKOUT = 'dismiss/checkout',
  INITIATED_TRANSACTION = 'initiated/transaction',

  SHOW_ACCOUNTS_MODAL = 'show/accountsModal',
  HIDE_ACCOUNT_MODAL = 'hide/accountsModal',
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
      type: PostMessages.SCROLL_POSITION
      payload: number
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
      payload: string
    }
  | {
      type: PostMessages.UPDATE_ACCOUNT_BALANCE
      payload: string
    }
  | {
      type: PostMessages.UPDATE_NETWORK
      payload: number
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
      type: PostMessages.HIDE_ACCOUNT_MODAL
      payload: undefined
    }

export type MessageTypes = Message['type']
export type ExtractPayload<TYPE> = Extract<Message, { type: TYPE }>['payload']
