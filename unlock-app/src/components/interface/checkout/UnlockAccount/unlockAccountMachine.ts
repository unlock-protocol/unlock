import { createMachine, assign, ActorRefFrom, Actor } from 'xstate'

interface SubmitUserEvent {
  type: 'SUBMIT_USER'
  email: string
  existingUser: boolean
}

interface ContinueEvent {
  type: 'CONTINUE'
}

interface BackEvent {
  type: 'BACK'
}

interface ExitEvent {
  type: 'EXIT'
}
interface EnterEmailEvent {
  type: 'ENTER_EMAIL'
}

type UnlockAccountMachineEvents =
  | SubmitUserEvent
  | ContinueEvent
  | EnterEmailEvent
  | BackEvent
  | ExitEvent

interface UnlockAccountMachineContext {
  email: string
  existingUser: boolean
}

export const unlockAccountMachine = createMachine(
  {
    id: 'unlockAccount',
    types: {
      typegen: {} as import('./unlockAccountMachine.typegen').Typegen0,
      events: {} as UnlockAccountMachineEvents,
      context: {} as UnlockAccountMachineContext,
    },
    initial: 'ACCOUNT',
    context: {
      email: '',
      existingUser: false,
    },
    on: {
      EXIT: '.EXIT',
    },
    states: {
      ACCOUNT: {
        on: {
          SUBMIT_USER: {
            actions: ['submitUser'],
          },

          BACK: 'EXIT',
        },
      },
      EXIT: {
        type: 'final',
      },
    },
  },
  {
    guards: {
      isExistingUser: ({ context }) => {
        return context.existingUser && !!context.email
      },
      isNotExistingUser: ({ context }) => {
        return !context.existingUser && !!context.email
      },
    },
    actions: {
      submitUser: assign({
        email: ({ event }) => event.email,
        existingUser: ({ event }) => event.existingUser,
      }),
    },
  }
)

export interface UserDetails {
  email: string
  password: string
}

export type UnlockAccountService =
  | Actor<typeof unlockAccountMachine>
  | ActorRefFrom<typeof unlockAccountMachine>
