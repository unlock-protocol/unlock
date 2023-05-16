import { createMachine, assign, InterpreterFrom, ActorRefFrom } from 'xstate'

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
    predictableActionArguments: true, // https://xstate.js.org/docs/guides/actions.html
    id: 'unlockAccount',
    tsTypes: {} as import('./unlockAccountMachine.typegen').Typegen0,
    schema: {
      events: {} as UnlockAccountMachineEvents,
      context: {} as UnlockAccountMachineContext,
    },
    initial: 'ENTER_EMAIL',
    context: {
      email: '',
      existingUser: false,
    },
    on: {
      EXIT: 'EXIT',
    },
    states: {
      ENTER_EMAIL: {
        on: {
          SUBMIT_USER: {
            actions: ['submitUser'],
          },
          CONTINUE: [
            {
              target: 'SIGN_IN',
              cond: 'isExistingUser',
            },
            {
              target: 'SIGN_UP',
              cond: 'isNotExistingUser',
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
    actions: {
      submitUser: assign((_, { email, existingUser }) => {
        return {
          email,
          existingUser,
        } as const
      }),
    },
    guards: {
      isExistingUser: (ctx) => {
        return ctx.existingUser && !!ctx.email
      },
      isNotExistingUser: (ctx) => {
        return !ctx.existingUser && !!ctx.email
      },
    },
  }
)

export interface UserDetails {
  email: string
  password: string
}

export type UnlockAccountService =
  | InterpreterFrom<typeof unlockAccountMachine>
  | ActorRefFrom<typeof unlockAccountMachine>
