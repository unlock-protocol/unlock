import { Machine } from 'xstate'

interface CheckoutStateSchema {
  states: {
    loading: {}
    metadataForm: {}
    notLoggedIn: {}
    locks: {}
    fiatLocks: {}
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
    loading: {
      on: {
        gotConfigAndUserAccount: 'fiatLocks',
        gotConfigAndAccount: 'locks',
        gotConfig: 'notLoggedIn',
      },
    },
    metadataForm: {
      on: {
        metadataSubmitted: 'locks',
      },
    },
    notLoggedIn: {
      on: {
        gotConfigAndUserAccount: 'fiatLocks',
        gotConfigAndAccount: 'locks',
      },
    },
    locks: {
      on: {
        gotConfigAndUserAccount: 'fiatLocks',
        collectMetadata: 'metadataForm',
      },
    },
    fiatLocks: {
      on: {
        collectMetadata: 'metadataForm',
        gotConfigAndAccount: 'locks',
      },
    },
  },
})
