import {
  createMachine,
  StateFrom,
  SCXML,
  SingleOrArray,
  Event,
  EventData,
} from 'xstate'
import { unlockAccountMachine } from '../UnlockAccount/unlockAccountMachine'

interface UnlockAccountEvent {
  type: 'SIGN_IN_USING_UNLOCK_ACCOUNT'
}

type ConnectMachineEvents = UnlockAccountEvent

export const connectMachine = createMachine(
  {
    tsTypes: {} as import('./connectMachine.typegen').Typegen0,
    schema: {
      events: {} as ConnectMachineEvents,
    },
    context: {
      email: '',
      existingUser: false,
    },
    initial: 'CONNECT',
    states: {
      CONNECT: {
        on: {
          SIGN_IN_USING_UNLOCK_ACCOUNT: {
            target: 'SIGN_IN',
          },
        },
      },
      SIGN_IN: {
        invoke: {
          id: 'unlockAccount',
          src: unlockAccountMachine,
          onDone: 'CONNECT',
        },
      },
    },
  },
  {}
)

export type ConnectState = StateFrom<typeof connectMachine>

export type ConnectSend = (
  event:
    | SCXML.Event<ConnectMachineEvents>
    | SingleOrArray<Event<ConnectMachineEvents>>,
  payload?: EventData | undefined
) => any
