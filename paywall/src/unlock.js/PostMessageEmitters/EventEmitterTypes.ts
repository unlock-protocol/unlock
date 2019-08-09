import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types'
import { PostMessages, ExtractPayload } from '../../messageTypes'

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

/**
 * These are the event definitions for the user accounts iframe. They correspond directly with the post message events
 * These events are the ones received from the user accounts iframe
 *
 * for new events, they should have 1 of 2 forms:
 *
 * for events with no payload, () => void
 * for all others, (payload: ExtractPayload<PostMessages.***>) => void
 */
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
