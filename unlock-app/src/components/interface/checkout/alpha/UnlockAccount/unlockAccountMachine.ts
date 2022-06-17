import {
  createMachine,
  assign,
  StateFrom,
  SCXML,
  SingleOrArray,
  Event,
  EventData,
} from 'xstate'

interface SubmitUserEvent {
  type: 'SUBMIT_USER'
  email: string
  existingUser: boolean
}

interface ContinueEvent {
  type: 'CONTINUE'
}

type UnlockAccountMachineEvents = SubmitUserEvent | ContinueEvent

interface UnlockAccountMachineContext {
  email: string
  existingUser: boolean
}

export const unlockAccountMachine = createMachine(
  {
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
        on: {
          SUBMIT_USER: {
            actions: ['submitUser'],
          },
          CONTINUE: [
            {
              target: 'SIGN_IN',
              cond: (context) => context.existingUser,
            },
            {
              target: 'SIGN_UP',
              cond: (context) => !context.existingUser,
            },
          ],
        },
      },
      SIGN_UP: {
        on: {
          CONTINUE: {
            target: 'SIGNED_IN',
          },
        },
      },
      SIGN_IN: {
        on: {
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
      submitUser: assign((context, { email, existingUser }) => {
        return {
          email,
          existingUser,
        } as const
      }),
    },
  }
)

export type UnlockAccountState = StateFrom<typeof unlockAccountMachine>

export type UnlockAccountSend = (
  event:
    | SCXML.Event<UnlockAccountMachineEvents>
    | SingleOrArray<Event<UnlockAccountMachineEvents>>,
  payload?: EventData | undefined
) => any

export interface UserDetails {
  email: string
  password: string
}
