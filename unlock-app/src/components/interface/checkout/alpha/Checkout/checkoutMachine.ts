import { Lock, PaywallConfig } from '~/unlockTypes'
import { createMachine, assign, InterpreterFrom } from 'xstate'
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
interface ExistingMemberEvent {
  type: 'EXISTING_MEMBER'
}

interface UnlockAccountEvent {
  type: 'UNLOCK_ACCOUNT'
}

interface BackEvent {
  type: CheckoutPage
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
  | ExistingMemberEvent
  | ContinueEvent
  | DisconnectEvent
  | BackEvent

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
    on: {},
    states: {
      SELECT: {
        on: {
          SELECT_LOCK: {
            actions: ['selectLock'],
          },
          CONTINUE: {
            target: 'QUANTITY',
          },
          EXISTING_MEMBER: {
            target: 'RETURNING',
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
              cond: 'requireCardPayment',
            },
            {
              target: 'METADATA',
            },
          ],
          UNLOCK_ACCOUNT: {
            target: 'UNLOCK_ACCOUNT',
          },
          SELECT: 'SELECT',
        },
      },
      CARD: {
        on: {
          SELECT_CARD_TO_CHARGE: [
            {
              target: 'METADATA',
              actions: ['selectCardToCharge'],
            },
          ],
          DISCONNECT: [
            {
              target: 'QUANTITY',
              actions: ['disconnect'],
              cond: 'isLockSelected',
            },
            {
              target: 'SELECT',
              actions: ['disconnect'],
            },
          ],
          QUANTITY: 'QUANTITY',
        },
      },
      METADATA: {
        on: {
          SELECT_RECIPIENTS: [
            {
              target: 'MESSAGE_TO_SIGN',
              actions: ['selectRecipients'],
              cond: 'requireMessageToSign',
            },
            {
              target: 'CAPTCHA',
              actions: ['selectRecipients'],
              cond: 'requireCaptcha',
            },
            {
              target: 'CONFIRM',
              actions: ['selectRecipients'],
            },
          ],
          DISCONNECT: [
            {
              target: 'QUANTITY',
              actions: ['disconnect'],
              cond: 'isLockSelected',
            },
            {
              target: 'SELECT',
              actions: ['disconnect'],
            },
          ],
          SELECT: 'SELECT',
          QUANTITY: 'QUANTITY',
          CARD: 'CARD',
        },
      },
      MESSAGE_TO_SIGN: {
        on: {
          SIGN_MESSAGE: [
            {
              target: 'CAPTCHA',
              actions: ['signMessage'],
              cond: 'requireCaptcha',
            },
            {
              target: 'CONFIRM',
              actions: ['signMessage'],
            },
          ],
          DISCONNECT: [
            {
              target: 'QUANTITY',
              actions: ['disconnect'],
              cond: 'isLockSelected',
            },
            {
              target: 'SELECT',
              actions: ['disconnect'],
            },
          ],
          SELECT: 'SELECT',
          QUANTITY: 'QUANTITY',
          CARD: 'CARD',
          METADATA: 'METADATA',
        },
      },
      CAPTCHA: {
        on: {
          SOLVE_CAPTCHA: {
            target: 'CONFIRM',
            actions: ['solveCaptcha'],
          },
          DISCONNECT: [
            {
              target: 'QUANTITY',
              actions: ['disconnect'],
              cond: 'isLockSelected',
            },
            {
              target: 'SELECT',
              actions: ['disconnect'],
            },
          ],
          MESSAGE_TO_SIGN: 'MESSAGE_TO_SIGN',
        },
      },
      CONFIRM: {
        on: {
          CONFIRM_MINT: {
            target: 'MINTING',
            actions: ['confirmMint'],
          },
          DISCONNECT: [
            {
              target: 'QUANTITY',
              actions: ['disconnect'],
              cond: 'isLockSelected',
            },
            {
              target: 'SELECT',
              actions: ['disconnect'],
            },
          ],
          SELECT: 'SELECT',
          QUANTITY: 'QUANTITY',
          CARD: 'CARD',
          METADATA: 'METADATA',
          MESSAGE_TO_SIGN: 'MESSAGE_TO_SIGN',
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
        on: {
          QUANTITY: 'QUANTITY',
          SELECT: 'SELECT',
        },
        invoke: {
          id: 'unlockAccount',
          src: unlockAccountMachine,
          onDone: [
            {
              target: 'QUANTITY',
              cond: 'isLockSelected',
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
            target: 'QUANTITY',
          },
          DISCONNECT: [
            {
              target: 'QUANTITY',
              actions: ['disconnect'],
              cond: 'isLockSelected',
            },
            {
              target: 'SELECT',
              actions: ['disconnect'],
            },
          ],
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
        // @ts-expect-error xstate unused variable type bug
        lock: (context, event) => {
          return event.lock
        },
      }),
      selectQuantity: assign({
        // @ts-expect-error xstate unused variable type bug
        quantity: (context, event) => {
          return event.quantity
        },
      }),
      selectPaymentMethod: assign({
        // @ts-expect-error xstate unused variable type bug
        payment: (context, event) => {
          return event.payment
        },
      }),
      selectRecipients: assign({
        // @ts-expect-error xstate unused variable type bug
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
        // @ts-expect-error xstate unused variable type bug
        messageToSign: (context, event) => {
          return {
            address: event.address,
            signature: event.signature,
          } as const
        },
      }),
      confirmMint: assign({
        mint: (context, { status, transactionHash }) => {
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
        // @ts-expect-error xstate unused variable type bug
        captcha: (context, event) => {
          return event.data
        },
      }),
    },
    guards: {
      isLockSelected: (context) => {
        return !!context.lock
      },
      requireMessageToSign: (context) => !!context.paywallConfig.messageToSign,
      requireCaptcha: (context) => {
        return (
          !!context.paywallConfig.captcha && context.payment.method !== 'card'
        )
      },
      requireCardPayment: (context) => context.payment.method === 'card',
    },
  }
)

export type CheckoutService = InterpreterFrom<typeof checkoutMachine>
