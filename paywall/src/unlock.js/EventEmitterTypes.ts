import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types'
import { PostMessages, ExtractPayload } from '../messageTypes'
import { web3MethodCall } from '../windowTypes'

export interface DataIframeEvents {
  [PostMessages.READY]: () => void
  [PostMessages.READY_WEB3]: () => void
  [PostMessages.LOCKED]: () => void
  [PostMessages.UNLOCKED]: (
    locks: ExtractPayload<PostMessages.UNLOCKED>
  ) => void
  [PostMessages.ERROR]: (error: ExtractPayload<PostMessages.ERROR>) => void
  [PostMessages.UPDATE_WALLET]: (
    update: ExtractPayload<PostMessages.UPDATE_WALLET>
  ) => void
  [PostMessages.UPDATE_ACCOUNT]: (
    update: ExtractPayload<PostMessages.UPDATE_ACCOUNT>
  ) => void
  [PostMessages.UPDATE_ACCOUNT_BALANCE]: (
    update: ExtractPayload<PostMessages.UPDATE_ACCOUNT_BALANCE>
  ) => void
  [PostMessages.UPDATE_LOCKS]: (
    update: ExtractPayload<PostMessages.UPDATE_LOCKS>
  ) => void
  [PostMessages.UPDATE_NETWORK]: (
    update: ExtractPayload<PostMessages.UPDATE_NETWORK>
  ) => void
  [PostMessages.WEB3]: (request: web3MethodCall) => void
}

export interface CheckoutIframeEvents {
  [PostMessages.READY]: () => void
  [PostMessages.DISMISS_CHECKOUT]: () => void
  [PostMessages.PURCHASE_KEY]: (
    request: ExtractPayload<PostMessages.PURCHASE_KEY>
  ) => void
}

export interface UserAccountsIframeEvents {
  [PostMessages.READY]: () => void
  [PostMessages.UPDATE_ACCOUNT]: (
    account: ExtractPayload<PostMessages.UPDATE_ACCOUNT>
  ) => void
  [PostMessages.UPDATE_NETWORK]: (
    account: ExtractPayload<PostMessages.UPDATE_NETWORK>
  ) => void
  [PostMessages.INITIATED_TRANSACTION]: () => void
  [PostMessages.SHOW_ACCOUNTS_MODAL]: () => void
  [PostMessages.HIDE_ACCOUNTS_MODAL]: () => void
}

export type UserAccountsIframeEventEmitter = StrictEventEmitter<
  EventEmitter,
  UserAccountsIframeEvents
>

export type CheckoutIframeEventEmitter = StrictEventEmitter<
  EventEmitter,
  CheckoutIframeEvents
>

export type DataIframeEventEmitter = StrictEventEmitter<
  EventEmitter,
  DataIframeEvents
>
