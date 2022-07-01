// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true
  eventsCausingActions: {
    submitUser: 'SUBMIT_USER'
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
  eventsCausingGuards: {
    isExistingUser: 'CONTINUE'
    isNotExistingUser: 'CONTINUE'
  }
  eventsCausingDelays: {}
  matchesStates:
    | 'ENTER_EMAIL'
    | 'SIGN_UP'
    | 'SIGN_IN'
    | 'SIGNED_IN'
    | 'NOT_SIGNED_IN'
  tags: never
}
