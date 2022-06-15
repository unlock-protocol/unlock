// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true
  eventsCausingActions: {
    selectLock: 'SELECT_LOCK'
    disconnect: 'DISCONNECT'
    selectQuantity: 'SELECT_QUANTITY'
    selectPaymentMethod: 'SELECT_PAYMENT_METHOD'
    selectCardToCharge: 'SELECT_CARD_TO_CHARGE'
    selectRecipients: 'SELECT_RECIPIENTS'
    signMessage: 'SIGN_MESSAGE'
    solveCaptcha: 'SOLVE_CAPTCHA'
    confirmMint: 'CONFIRM_MINT'
    finishMint: 'FINISH_MINT'
  }
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
  eventsCausingServices: {}
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | 'SELECT'
    | 'QUANTITY'
    | 'CARD'
    | 'METADATA'
    | 'MESSAGE_TO_SIGN'
    | 'CAPTCHA'
    | 'CONFIRM'
    | 'MINTING'
    | 'RETURNING'
  tags: never
}
