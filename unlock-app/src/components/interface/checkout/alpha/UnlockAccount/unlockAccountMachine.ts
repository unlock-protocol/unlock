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

type UnlockAccountMachineEvents = SubmitUserEvent | ContinueEvent | BackEvent

interface UnlockAccountMachineContext {
  email: string
  existingUser: boolean
}

export const unlockAccountMachine = createMachine(
  {
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
    states: {
      ENTER_EMAIL: {
        always: [
          {
            target: 'SIGN_IN',
            cond: 'isExistingUser',
          },
          {
            target: 'SIGN_UP',
            cond: 'isNotExistingUser',
          },
        ],
        on: {
          SUBMIT_USER: {
            actions: ['submitUser'],
          },
        },
      },
      SIGN_UP: {
        on: {
          BACK: 'ENTER_EMAIL',
          CONTINUE: {
            target: 'SIGNED_IN',
          },
        },
      },
      SIGN_IN: {
        on: {
          BACK: 'ENTER_EMAIL',
          CONTINUE: {
            target: 'SIGNED_IN',
          },
        },
      },
      SIGNED_IN: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      // @ts-expect-error - xstate unused type bug
      submitUser: assign((context, { email, existingUser }) => {
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
