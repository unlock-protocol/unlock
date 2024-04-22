import { Actor, ActorRefFrom, createMachine } from 'xstate'

interface UnlockAccountEvent {
  type: 'UNLOCK_ACCOUNT'
}

interface DisconnectEvent {
  type: 'DISCONNECT'
}

interface BackEvent {
  type: 'BACK'
}

type ConnectMachineEvents = UnlockAccountEvent | BackEvent | DisconnectEvent

export const connectMachine = createMachine(
  {
    id: 'connect',
    types: {
      typegen: {} as import('./connectMachine.typegen').Typegen0,
      events: {} as ConnectMachineEvents,
    },
    on: {
      DISCONNECT: '.CONNECT',
    },
    initial: 'CONNECT',
    states: {
      CONNECT: {
        on: {
          UNLOCK_ACCOUNT: {
            target: 'SIGN_IN',
          },
        },
      },
      SIGN_IN: {
        on: {
          BACK: 'CONNECT',
        },
      },
    },
  },
  {}
)

export type ConnectService =
  | Actor<typeof connectMachine>
  | ActorRefFrom<typeof connectMachine>
