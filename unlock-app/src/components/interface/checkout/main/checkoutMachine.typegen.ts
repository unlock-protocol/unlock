// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true
  internalEvents: {
    'xstate.init': { type: 'xstate.init' }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    confirmMint: 'CONFIRM_MINT'
    confirmRenew: 'CONFIRM_RENEW'
    disconnect: 'DISCONNECT' | 'RESET_CHECKOUT'
    selectLock: 'SELECT_LOCK'
    selectPaymentMethod: 'SELECT_PAYMENT_METHOD'
    selectQuantity: 'SELECT_QUANTITY'
    selectRecipients: 'SELECT_RECIPIENTS'
    signMessage: 'SIGN_MESSAGE'
    submitData: 'SUBMIT_DATA'
    updatePaywallConfig: 'UPDATE_PAYWALL_CONFIG'
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    unlockAccount: 'UNLOCK_ACCOUNT'
  }
  matchesStates:
    | 'CAPTCHA'
    | 'CARD'
    | 'CONFIRM'
    | 'GUILD'
    | 'MESSAGE_TO_SIGN'
    | 'METADATA'
    | 'MINTING'
    | 'PASSWORD'
    | 'PAYMENT'
    | 'PROMO'
    | 'QUANTITY'
    | 'RENEW'
    | 'RENEWED'
    | 'RETURNING'
    | 'SELECT'
    | 'UNLOCK_ACCOUNT'
  tags: never
}
