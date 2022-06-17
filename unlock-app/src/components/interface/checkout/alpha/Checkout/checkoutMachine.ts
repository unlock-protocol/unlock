import { Lock, PaywallConfig } from '~/unlockTypes'
import {
  createMachine,
  assign,
  StateFrom,
  SCXML,
  SingleOrArray,
  Event,
  EventData,
} from 'xstate'
import { unlockAccountMachine } from '../UnlockAccount/unlockAccountMachine'

export type CheckoutPage =
  | 'SELECT'
  | 'QUANTITY'
  | 'METADATA'
  | 'CONFIRM'
  | 'CARD'
  | 'MINTING'
  | 'MESSAGE_TO_SIGN'
  | 'CAPTCHA'
  | 'RETURNING'
  | 'UNLOCK_ACCOUNT'

export interface FiatPricing {
  creditCardEnabled: boolean
  usd: {
    keyPrice: number
    unlockServiceFee: number
    creditCardProcessing: number
  }
}

export interface LockState extends Lock {
  fiatPricing: FiatPricing
}

export interface SelectLockEvent {
  type: 'SELECT_LOCK'
  lock: LockState
}

export interface SignMessageEvent {
  type: 'SIGN_MESSAGE'
  signature: string
  address: string
}

export interface SelectQuantityEvent {
  type: 'SELECT_QUANTITY'
  quantity: number
}

export interface SelectRecipientsEvent {
  type: 'SELECT_RECIPIENTS'
  recipients: string[]
}

export interface SelectPaymentMethodEvent {
  type: 'SELECT_PAYMENT_METHOD'
  payment: Payment
}

export interface SelectCardToChargeEvent {
  type: 'SELECT_CARD_TO_CHARGE'
  cardId: string
}

export interface DisconnectEvent {
  type: 'DISCONNECT'
}

export interface ContinueEvent {
  type: 'CONTINUE'
}

export interface MakeAnotherPurchaseEvent {
  type: 'MAKE_ANOTHER_PURCHASE'
}

interface ConfirmMintEvent extends Mint {
  type: 'CONFIRM_MINT'
}

interface SolveCaptchaEvent {
  type: 'SOLVE_CAPTCHA'
  data: string[]
}

interface UnlockAccountEvent {
  type: 'UNLOCK_ACCOUNT'
}

export type CheckoutMachineEvents =
  | SelectLockEvent
  | SelectQuantityEvent
  | SelectPaymentMethodEvent
  | SelectRecipientsEvent
  | SelectCardToChargeEvent
  | SignMessageEvent
  | MakeAnotherPurchaseEvent
  | SolveCaptchaEvent
  | ConfirmMintEvent
  | UnlockAccountEvent
  | ContinueEvent
  | DisconnectEvent

type Payment =
  | {
      method: 'card'
      cardId?: string
    }
  | {
      method: 'crypto'
    }

export interface Mint {
  status: 'ERROR' | 'PROCESSING' | 'FINISHED'
  transactionHash?: string
}

interface CheckoutMachineContext {
  paywallConfig: PaywallConfig
  lock?: LockState
  payment: Payment
  captcha?: string[]
  messageToSign?: {
    signature: string
    address: string
  }
  quantity: number
  recipients: string[]
  mint?: Mint
}

export const checkoutMachine = createMachine(
  {
    id: 'checkout',
    initial: 'SELECT',
    tsTypes: {} as import('./checkoutMachine.typegen').Typegen0,
    schema: {
      context: {} as CheckoutMachineContext,
      events: {} as CheckoutMachineEvents,
    },
    context: {
      paywallConfig: {} as PaywallConfig,
      lock: undefined,
      messageToSign: undefined,
      mint: undefined,
      captcha: undefined,
      payment: {
        method: 'crypto',
      },
      quantity: 1,
      recipients: [],
    },
    states: {
      SELECT: {
        on: {
          SELECT_LOCK: {
            target: 'QUANTITY',
            actions: ['selectLock'],
          },
          DISCONNECT: {
            actions: ['disconnect'],
          },
          UNLOCK_ACCOUNT: {
            target: 'UNLOCK_ACCOUNT',
          },
        },
      },
      QUANTITY: {
        on: {
          SELECT_QUANTITY: {
            actions: ['selectQuantity'],
          },
          SELECT_PAYMENT_METHOD: {
            actions: ['selectPaymentMethod'],
          },
          CONTINUE: [
            {
              target: 'CARD',
              cond: (context) => context.payment.method === 'card',
            },
            {
              target: 'METADATA',
              cond: (context) =>
                Boolean(
                  context.paywallConfig.metadataInputs?.length ||
                    context.paywallConfig.locks?.[context.lock!.address]
                      ?.metadataInputs?.length
                ),
            },
            {
              target: 'CONFIRM',
            },
          ],
          DISCONNECT: {
            actions: ['disconnect'],
          },
          UNLOCK_ACCOUNT: {
            target: 'UNLOCK_ACCOUNT',
          },
        },
      },
      CARD: {
        on: {
          SELECT_CARD_TO_CHARGE: [
            {
              target: 'METADATA',
              actions: ['selectCardToCharge'],
              cond: (context) =>
                Boolean(
                  context.paywallConfig.metadataInputs?.length ||
                    context.paywallConfig.locks?.[context.lock!.address]
                      ?.metadataInputs?.length
                ),
            },
            {
              target: 'MESSAGE_TO_SIGN',
              actions: ['selectCardToCharge'],
              cond: (context) => !!context.paywallConfig.messageToSign,
            },
            {
              target: 'CONFIRM',
              actions: ['selectCardToCharge'],
            },
          ],
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
          },
        },
      },
      METADATA: {
        on: {
          SELECT_RECIPIENTS: [
            {
              target: 'MESSAGE_TO_SIGN',
              actions: ['selectRecipients'],
              cond: (context) => !!context.paywallConfig.messageToSign,
            },
            {
              target: 'CAPTCHA',
              actions: ['selectRecipients'],
              cond: (context) =>
                !!context.paywallConfig.captcha &&
                context.payment.method !== 'card',
            },
            {
              target: 'CONFIRM',
              actions: ['selectRecipients'],
            },
          ],
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
          },
        },
      },
      MESSAGE_TO_SIGN: {
        on: {
          SIGN_MESSAGE: [
            {
              target: 'CAPTCHA',
              actions: ['signMessage'],
              cond: (context) =>
                !!context.paywallConfig.captcha &&
                context.payment.method !== 'card',
            },
            {
              target: 'CONFIRM',
              actions: ['signMessage'],
            },
          ],
        },
      },
      CAPTCHA: {
        on: {
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
          },
          SOLVE_CAPTCHA: {
            target: 'CONFIRM',
            actions: ['solveCaptcha'],
          },
        },
      },
      CONFIRM: {
        on: {
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
          },
          CONFIRM_MINT: {
            target: 'MINTING',
            actions: ['confirmMint'],
          },
        },
      },
      MINTING: {
        on: {
          CONFIRM_MINT: {
            type: 'final',
            actions: ['confirmMint'],
          },
        },
      },
      UNLOCK_ACCOUNT: {
        invoke: {
          id: 'unlockAccount',
          src: unlockAccountMachine,
          onDone: [
            {
              target: 'QUANTITY',
              cond: (context) => !!context.lock,
            },
            {
              target: 'SELECT',
            },
          ],
        },
      },
      RETURNING: {
        on: {
          MAKE_ANOTHER_PURCHASE: {
            target: 'SELECT',
          },
        },
      },
    },
  },
  {
    actions: {
      disconnect: assign((context) => {
        return {
          paywallConfig: context.paywallConfig,
          lock: context.lock,
          payment: {
            method: 'crypto',
          },
          quantity: context.quantity,
          messageToSign: undefined,
          recipients: [],
          mint: undefined,
        } as CheckoutMachineContext
      }),
      selectLock: assign({
        lock: (context, event) => {
          return event.lock
        },
      }),
      selectQuantity: assign({
        quantity: (context, event) => {
          return event.quantity
        },
      }),
      selectPaymentMethod: assign({
        payment: (context, event) => {
          return event.payment
        },
      }),
      selectRecipients: assign({
        recipients: (context, event) => {
          return event.recipients
        },
      }),
      selectCardToCharge: assign({
        payment: (context, event) => {
          return {
            method: context.payment.method,
            cardId: event.cardId,
          } as const
        },
      }),
      signMessage: assign({
        messageToSign: (context, event) => {
          return {
            address: event.address,
            signature: event.signature,
          } as const
        },
      }),
      confirmMint: assign({
        mint: (context, { type, status, transactionHash }) => {
          if (!context.paywallConfig.pessimistic) {
            return {
              status: 'FINISHED',
              transactionHash,
            } as const
          } else {
            return {
              status,
              transactionHash,
            } as const
          }
        },
      }),
      solveCaptcha: assign({
        captcha: (context, event) => {
          return event.data
        },
      }),
    },
  }
)

export type CheckoutState = StateFrom<typeof checkoutMachine>

export type CheckoutSend = (
  event:
    | SCXML.Event<CheckoutMachineEvents>
    | SingleOrArray<Event<CheckoutMachineEvents>>,
  payload?: EventData | undefined
) => any
