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
  | 'PAYMENT'

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
interface UpdatePaywallConfigEvent {
  type: 'UPDATE_PAYWALL_CONFIG'
  config: PaywallConfig
}

interface BackEvent {
  type: CheckoutPage | 'BACK'
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
  | UpdatePaywallConfigEvent
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
  | {
      method: 'superfluid'
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
    on: {
      UNLOCK_ACCOUNT: 'UNLOCK_ACCOUNT',
      UPDATE_PAYWALL_CONFIG: {
        target: 'SELECT',
        actions: ['updatePaywallConfig'],
      },
    },
    states: {
      SELECT: {
        on: {
          SELECT_LOCK: {
            actions: ['selectLock'],
          },
          CONTINUE: 'QUANTITY',
          EXISTING_MEMBER: 'RETURNING',
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
        },
      },
      QUANTITY: {
        on: {
          SELECT_QUANTITY: {
            actions: ['selectQuantity'],
            target: 'METADATA',
          },
          SELECT: 'SELECT',
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
            cond: 'isLockSelected',
          },
          BACK: 'SELECT',
        },
      },
      METADATA: {
        on: {
          SELECT_RECIPIENTS: {
            target: 'PAYMENT',
            actions: ['selectRecipients'],
          },
          SELECT: 'SELECT',
          QUANTITY: 'QUANTITY',
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
            cond: 'isLockSelected',
          },
          BACK: 'QUANTITY',
        },
      },
      PAYMENT: {
        on: {
          SELECT_PAYMENT_METHOD: {
            actions: ['selectPaymentMethod'],
          },
          CONTINUE: [
            {
              target: 'CARD',
              cond: (context) => context.payment.method === 'card',
            },
            {
              target: 'MESSAGE_TO_SIGN',

              cond: 'requireMessageToSign',
            },
            {
              target: 'CAPTCHA',
              cond: 'requireCaptcha',
            },
            {
              target: 'CONFIRM',
            },
          ],
          SELECT: 'SELECT',
          QUANTITY: 'QUANTITY',
          METADATA: 'METADATA',
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
            cond: 'isLockSelected',
          },
          BACK: 'METADATA',
        },
      },
      CARD: {
        on: {
          SELECT_CARD_TO_CHARGE: [
            {
              target: 'MESSAGE_TO_SIGN',
              actions: ['selectCardToCharge'],
              cond: 'requireMessageToSign',
            },
            {
              target: 'CAPTCHA',
              actions: ['selectCardToCharge'],
              cond: 'requireCaptcha',
            },
            {
              target: 'CONFIRM',
              actions: ['selectCardToCharge'],
            },
          ],
          BACK: 'PAYMENT',
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
            cond: 'isLockSelected',
          },
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
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
            cond: 'isLockSelected',
          },
          SELECT: 'SELECT',
          QUANTITY: 'QUANTITY',
          PAYMENT: 'PAYMENT',
          METADATA: 'METADATA',
          BACK: 'METADATA',
        },
      },
      CAPTCHA: {
        on: {
          SOLVE_CAPTCHA: {
            target: 'CONFIRM',
            actions: ['solveCaptcha'],
          },
          BACK: [
            {
              target: 'MESSAGE_TO_SIGN',
              cond: 'requireMessageToSign',
            },
            {
              target: 'METADATA',
            },
          ],
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
            cond: 'isLockSelected',
          },
        },
      },
      CONFIRM: {
        on: {
          CONFIRM_MINT: {
            target: 'MINTING',
            actions: ['confirmMint'],
          },
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
            cond: 'isLockSelected',
          },
          SELECT: 'SELECT',
          QUANTITY: 'QUANTITY',
          PAYMENT: 'PAYMENT',
          METADATA: 'METADATA',
          MESSAGE_TO_SIGN: 'MESSAGE_TO_SIGN',
          BACK: [
            {
              target: 'MESSAGE_TO_SIGN',
              cond: 'requireMessageToSign',
            },
            {
              target: 'METADATA',
            },
          ],
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
          MAKE_ANOTHER_PURCHASE: 'QUANTITY',
          BACK: 'SELECT',
          DISCONNECT: {
            target: 'QUANTITY',
            actions: ['disconnect'],
            cond: 'isLockSelected',
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
        lock: (_, event) => {
          return event.lock
        },
      }),
      selectQuantity: assign({
        quantity: (_, event) => {
          return event.quantity
        },
      }),
      selectPaymentMethod: assign({
        payment: (_, event) => {
          return event.payment
        },
      }),
      selectRecipients: assign({
        recipients: (_, event) => {
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
        messageToSign: (_, event) => {
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
      updatePaywallConfig: assign((_, event) => {
        return {
          paywallConfig: event.config,
          lock: undefined,
          messageToSign: undefined,
          mint: undefined,
          captcha: undefined,
          payment: {
            method: 'crypto',
          },
          quantity: 1,
          recipients: [],
        } as CheckoutMachineContext
      }),
      solveCaptcha: assign({
        captcha: (_, event) => {
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
    },
  }
)

export type CheckoutService = InterpreterFrom<typeof checkoutMachine>
