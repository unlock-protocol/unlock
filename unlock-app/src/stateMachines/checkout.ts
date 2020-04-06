import { Machine } from 'xstate'

export enum CheckoutState {
  loading = 'loading',
  metadataForm = 'metadataForm',
  notLoggedIn = 'notLoggedIn',
  locks = 'locks',
  fiatLocks = 'fiatLocks',
}

interface CheckoutStateSchema {
  states: {
    [CheckoutState.loading]: {}
    [CheckoutState.metadataForm]: {}
    [CheckoutState.notLoggedIn]: {}
    [CheckoutState.locks]: {}
    [CheckoutState.fiatLocks]: {}
  }
}

type CheckoutEvent =
  | { type: 'gotConfigAndAccount' }
  | { type: 'gotConfigAndUserAccount' }
  | { type: 'gotConfig' }
  | { type: 'metadataSubmitted' }
  | { type: 'collectMetadata' }

export const checkoutMachine = Machine<CheckoutStateSchema, CheckoutEvent>({
  id: 'checkout',
  initial: 'loading',
  states: {
    [CheckoutState.loading]: {
      on: {
        gotConfigAndUserAccount: 'fiatLocks',
        gotConfigAndAccount: 'locks',
        gotConfig: 'notLoggedIn',
      },
    },
    [CheckoutState.metadataForm]: {
      on: {
        metadataSubmitted: 'locks',
      },
    },
    [CheckoutState.notLoggedIn]: {
      on: {
        gotConfigAndUserAccount: 'fiatLocks',
        gotConfigAndAccount: 'locks',
      },
    },
    [CheckoutState.locks]: {
      on: {
        gotConfigAndUserAccount: 'fiatLocks',
        collectMetadata: 'metadataForm',
      },
    },
    [CheckoutState.fiatLocks]: {
      on: {
        collectMetadata: 'metadataForm',
        gotConfigAndAccount: 'locks',
      },
    },
  },
})
