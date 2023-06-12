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
  eventsCausingActions: {}
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {
    unlockAccount: 'UNLOCK_ACCOUNT'
  }
  matchesStates: 'CONNECT' | 'SIGN_IN'
  tags: never
}
