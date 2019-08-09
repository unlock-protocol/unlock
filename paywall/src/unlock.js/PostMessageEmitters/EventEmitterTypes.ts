import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types'
import { PostMessages, ExtractPayload } from '../../messageTypes'
import { web3MethodCall } from '../../windowTypes'

/**
 * These are the event definitions for the data iframe. They correspond directly with the post message events
 * These events are the ones received from the data iframe
 *
 * for new events, they should have 1 of 2 forms:
 *
 * for events with no payload, () => void
 * for all others, (payload: ExtractPayload<PostMessages.***>) => void
 */
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
  // this has to be more specific because WEB3 is overloaded
  [PostMessages.WEB3]: (request: web3MethodCall) => void
}

/**
 * These are the event definitions for the checkout iframe. They correspond directly with the post message events
 * These events are the ones received from the checkout iframe
 *
 * for new events, they should have 1 of 2 forms:
 *
 * for events with no payload, () => void
 * for all others, (payload: ExtractPayload<PostMessages.***>) => void
 */
export interface CheckoutIframeEvents {
  [PostMessages.READY]: () => void
  [PostMessages.DISMISS_CHECKOUT]: () => void
  [PostMessages.PURCHASE_KEY]: (
    request: ExtractPayload<PostMessages.PURCHASE_KEY>
  ) => void
}

export type CheckoutIframeEventEmitter = StrictEventEmitter<
  EventEmitter,
  CheckoutIframeEvents
>

export type DataIframeEventEmitter = StrictEventEmitter<
  EventEmitter,
  DataIframeEvents
>
