// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true
  internalEvents: {
    'xstate.init': { type: 'xstate.init' }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    confirmMint: 'CONFIRM_MINT'
    disconnect: 'DISCONNECT'
    selectCardToCharge: 'SELECT_CARD_TO_CHARGE'
    selectLock: 'SELECT_LOCK'
    selectPaymentMethod: 'SELECT_PAYMENT_METHOD'
    selectQuantity: 'SELECT_QUANTITY'
    selectRecipients: 'SELECT_RECIPIENTS'
    signMessage: 'SIGN_MESSAGE'
    solveCaptcha: 'SOLVE_CAPTCHA'
    updatePaywallConfig: 'UPDATE_PAYWALL_CONFIG'
  }
  eventsCausingServices: {}
  eventsCausingGuards: {
    requireCaptcha:
      | 'SELECT_CARD_TO_CHARGE'
      | 'SELECT_PAYMENT_METHOD'
      | 'SIGN_MESSAGE'
    requireMessageToSign:
      | 'BACK'
      | 'SELECT_CARD_TO_CHARGE'
      | 'SELECT_PAYMENT_METHOD'
  }
  eventsCausingDelays: {}
  matchesStates:
    | 'CAPTCHA'
    | 'CARD'
    | 'CONFIRM'
    | 'MESSAGE_TO_SIGN'
    | 'METADATA'
    | 'MINTING'
    | 'PAYMENT'
    | 'QUANTITY'
    | 'RETURNING'
    | 'SELECT'
    | 'UNLOCK_ACCOUNT'
  tags: never
}
