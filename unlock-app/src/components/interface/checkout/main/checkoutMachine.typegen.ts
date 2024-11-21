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
    disconnect: 'DISCONNECT' | 'RESET_CHECKOUT'
    connect: 'CONNECT'
    selectPaymentMethod: 'SELECT_PAYMENT_METHOD'
    lockSelected: 'LOCK_SELECTED'
    selectQuantity: 'SELECT_QUANTITY'
    selectRecipients: 'SELECT_RECIPIENTS'
    signMessage: 'SIGN_MESSAGE'
    submitData: 'SUBMIT_DATA'
    updatePaywallConfig: 'UPDATE_PAYWALL_CONFIG'
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isCardPayment: 'BACK'
    requireAllowList: 'BACK' | 'SELECT_RECIPIENTS' | 'SIGN_MESSAGE'
    requireCaptcha: 'BACK' | 'SELECT_RECIPIENTS' | 'SIGN_MESSAGE'
    requireGitcoin: 'BACK' | 'SELECT_RECIPIENTS' | 'SIGN_MESSAGE'
    requireGuild: 'BACK' | 'SELECT_RECIPIENTS' | 'SIGN_MESSAGE'
    requireMessageToSign: 'BACK' | 'SELECT_LOCK' | 'SELECT_RECIPIENTS'
    requirePassword: 'BACK' | 'SELECT_RECIPIENTS' | 'SIGN_MESSAGE'
    requirePromo: 'BACK' | 'SELECT_RECIPIENTS' | 'SIGN_MESSAGE'
  }
  eventsCausingServices: {
    unlockAccount: 'UNLOCK_ACCOUNT'
  }
  matchesStates:
    | 'CAPTCHA'
    | 'CARD'
    | 'CONFIRM'
    | 'GITCOIN'
    | 'GUILD'
    | 'MESSAGE_TO_SIGN'
    | 'METADATA'
    | 'MINTING'
    | 'PASSWORD'
    | 'PAYMENT'
    | 'PROMO'
    | 'QUANTITY'
    | 'RETURNING'
    | 'SELECT'
    | 'UNLOCK_ACCOUNT'
  tags: never
}
