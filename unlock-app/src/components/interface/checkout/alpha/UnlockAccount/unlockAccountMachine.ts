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

type UnlockAccountMachineEvents =
  | SubmitUserEvent
  | ContinueEvent
  | BackEvent
  | ExitEvent

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
    on: {
      EXIT: 'exit',
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
          BACK: 'exit',
        },
      },
      SIGN_UP: {
        on: {
          BACK: 'ENTER_EMAIL',
          CONTINUE: 'exit',
        },
      },
      SIGN_IN: {
        on: {
          BACK: 'ENTER_EMAIL',
          CONTINUE: 'exit',
        },
      },
      exit: {
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
