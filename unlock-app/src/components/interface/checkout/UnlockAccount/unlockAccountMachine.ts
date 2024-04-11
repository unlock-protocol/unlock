import { createMachine, assign, ActorRefFrom, Actor } from 'xsatev5'

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
    initial: 'ENTER_EMAIL',
    context: {
      email: '',
      existingUser: false,
    },
    // This breakes everithing out, not sure why, docs provide no info
    /*on: {
      EXIT: 'EXIT',
    },*/
    states: {
      ENTER_EMAIL: {
        on: {
          SUBMIT_USER: {
            actions: ['submitUser'],
          },
          CONTINUE: [
            {
              target: 'SIGN_IN',
              guard: 'isExistingUser',
            },
            {
              target: 'SIGN_UP',
              guard: 'isNotExistingUser',
            },
          ],
          BACK: 'EXIT',
        },
      },
      SIGN_UP: {
        on: {
          BACK: 'ENTER_EMAIL',
          ENTER_EMAIL: 'ENTER_EMAIL',
          CONTINUE: 'EXIT',
        },
      },
      SIGN_IN: {
        on: {
          BACK: 'ENTER_EMAIL',
          ENTER_EMAIL: 'ENTER_EMAIL',
          CONTINUE: 'EXIT',
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
