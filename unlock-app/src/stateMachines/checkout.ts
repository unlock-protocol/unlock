import { Machine } from 'xstate'

interface CheckoutStateSchema {
  states: {
    loading: {}
    metadataForm: {}
    notLoggedIn: {}
    locks: {}
  }
}

type CheckoutEvent =
  | { type: 'gotConfigAndAccount' }
  | { type: 'gotConfig' }
  | { type: 'metadataSubmitted' }
  | { type: 'collectMetadata' }

export const checkoutMachine = Machine<CheckoutStateSchema, CheckoutEvent>({
  id: 'checkout',
  initial: 'loading',
  states: {
    loading: {
      on: {
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
        gotConfigAndAccount: 'locks',
      },
    },
    locks: {
      on: {
        collectMetadata: 'metadataForm',
      },
    },
  },
})
