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
    submitUser: 'SUBMIT_USER'
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isExistingUser: 'CONTINUE'
    isNotExistingUser: 'CONTINUE'
  }
  eventsCausingServices: {}
  matchesStates: 'ENTER_EMAIL' | 'EXIT' | 'SIGN_IN' | 'SIGN_UP'
  tags: never
}
