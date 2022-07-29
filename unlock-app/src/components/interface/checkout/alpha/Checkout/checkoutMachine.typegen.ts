// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true
  internalEvents: {
    'done.invoke.unlockAccount': {
      type: 'done.invoke.unlockAccount'
      data: unknown
      __tip: 'See the XState TS docs to learn how to strongly type this.'
    }
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
    updatePaywallConfig: 'UPDATE_PAYWALL_CONFIG'
    selectLock: 'SELECT_LOCK'
    disconnect: 'DISCONNECT'
    selectQuantity: 'SELECT_QUANTITY'
    selectRecipients: 'SELECT_RECIPIENTS'
    selectPaymentMethod: 'SELECT_PAYMENT_METHOD'
    selectCardToCharge: 'SELECT_CARD_TO_CHARGE'
    signMessage: 'SIGN_MESSAGE'
    solveCaptcha: 'SOLVE_CAPTCHA'
    confirmMint: 'CONFIRM_MINT'
  }
  eventsCausingServices: {}
  eventsCausingGuards: {
    isLockSelected: 'DISCONNECT' | 'done.invoke.unlockAccount'
    requireMessageToSign: 'CONTINUE' | 'SELECT_CARD_TO_CHARGE' | 'BACK'
    requireCaptcha: 'CONTINUE' | 'SELECT_CARD_TO_CHARGE' | 'SIGN_MESSAGE'
  }
  eventsCausingDelays: {}
  matchesStates:
    | 'SELECT'
    | 'QUANTITY'
    | 'METADATA'
    | 'PAYMENT'
    | 'CARD'
    | 'MESSAGE_TO_SIGN'
    | 'CAPTCHA'
    | 'CONFIRM'
    | 'MINTING'
    | 'UNLOCK_ACCOUNT'
    | 'RETURNING'
  tags: never
}
