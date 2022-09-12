import { Lock, PaywallConfig, PaywallConfigLock } from '~/unlockTypes'
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
  | 'RENEW'
  | 'RENEWED'
  | 'PASSWORD'

export interface FiatPricing {
  creditCardEnabled: boolean
  usd: {
    keyPrice: number
    unlockServiceFee: number
    creditCardProcessing: number
  }
}

export interface LockState extends Lock, Required<PaywallConfigLock> {
  fiatPricing: FiatPricing
  isMember: boolean
  isSoldOut: boolean
}

export interface SelectLockEvent {
  type: 'SELECT_LOCK'
  lock: LockState
  existingMember: boolean
  expiredMember: boolean
  skipQuantity?: boolean
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

export interface SubmitPasswordEvent {
  type: 'SUBMIT_PASSWORD'
  data: string[]
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

export interface MakeAnotherPurchaseEvent {
  type: 'MAKE_ANOTHER_PURCHASE'
}

interface ConfirmMintEvent extends Transaction {
  type: 'CONFIRM_MINT'
}

interface RenewedEvent extends Transaction {
  type: 'CONFIRM_RENEW'
}

interface SolveCaptchaEvent {
  type: 'SOLVE_CAPTCHA'
  data: string[]
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
  | SubmitPasswordEvent
  | MakeAnotherPurchaseEvent
  | SolveCaptchaEvent
  | ConfirmMintEvent
  | RenewedEvent
  | UnlockAccountEvent
  | UpdatePaywallConfigEvent
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
  | {
      method: 'claim'
    }
export interface Transaction {
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
  mint?: Transaction
  renewed?: Transaction
  skipQuantity: boolean
  password?: string[]
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
      renewed: undefined,
      recipients: [],
      skipQuantity: false,
    },
    on: {
      UNLOCK_ACCOUNT: 'UNLOCK_ACCOUNT',
      SELECT: 'SELECT',
      QUANTITY: 'QUANTITY',
      PAYMENT: 'PAYMENT',
      METADATA: 'METADATA',
      MESSAGE_TO_SIGN: 'MESSAGE_TO_SIGN',
      CAPTCHA: 'CAPTCHA',
      UPDATE_PAYWALL_CONFIG: {
        target: 'SELECT',
        actions: ['updatePaywallConfig'],
      },
      SIGN_MESSAGE: {
        actions: ['signMessage'],
      },
    },
    states: {
      SELECT: {
        on: {
          SELECT_LOCK: [
            {
              actions: ['selectLock'],
              target: 'RENEW',
              cond: (_, event) => event.expiredMember,
            },
            {
              actions: ['selectLock'],
              target: 'RETURNING',
              cond: (_, event) => event.existingMember,
            },
            {
              actions: ['selectLock'],
              target: 'METADATA',
              // Skip quantity page if min or max doesn't require more than 1 recipients
              cond: (_, event) => {
                return !!event.skipQuantity
              },
            },
            {
              actions: ['selectLock'],
              target: 'QUANTITY',
            },
          ],
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
          BACK: 'SELECT',
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
        },
      },
      METADATA: {
        on: {
          SELECT_RECIPIENTS: {
            target: 'PAYMENT',
            actions: ['selectRecipients'],
          },
          BACK: [
            {
              target: 'SELECT',
              cond: (ctx) => {
                return !!ctx.skipQuantity
              },
            },
            {
              target: 'QUANTITY',
            },
          ],
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
        },
      },
      PAYMENT: {
        on: {
          SELECT_PAYMENT_METHOD: [
            {
              target: 'CARD',
              actions: ['selectPaymentMethod'],
              cond: (_, event) => event.payment.method === 'card',
            },
            {
              target: 'MESSAGE_TO_SIGN',
              actions: ['selectPaymentMethod'],
              cond: 'requireMessageToSign',
            },
            {
              target: 'PASSWORD',
              actions: ['selectPaymentMethod'],
              cond: 'requirePassword',
            },
            {
              target: 'CAPTCHA',
              actions: ['selectPaymentMethod'],
              cond: 'requireCaptcha',
            },
            {
              actions: ['selectPaymentMethod'],
              target: 'CONFIRM',
            },
          ],
          BACK: 'METADATA',
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
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
              target: 'PASSWORD',
              actions: ['selectCardToCharge'],
              cond: 'requirePassword',
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
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
          BACK: 'PAYMENT',
        },
      },
      MESSAGE_TO_SIGN: {
        on: {
          SIGN_MESSAGE: [
            {
              target: 'PASSWORD',
              actions: ['signMessage'],
              cond: 'requirePassword',
            },
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
          BACK: 'METADATA',
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
        },
      },
      PASSWORD: {
        on: {
          SUBMIT_PASSWORD: {
            target: 'CONFIRM',
            actions: ['submitPassword'],
          },
          BACK: [
            {
              target: 'MESSAGE_TO_SIGN',
              cond: 'requireMessageToSign',
            },
            {
              target: 'PAYMENT',
            },
          ],
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
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
              target: 'PAYMENT',
            },
          ],
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
        },
      },
      CONFIRM: {
        on: {
          CONFIRM_MINT: {
            target: 'MINTING',
            actions: ['confirmMint'],
          },
          BACK: [
            {
              target: 'MESSAGE_TO_SIGN',
              cond: 'requireMessageToSign',
            },
            {
              target: 'PAYMENT',
            },
          ],
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
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
          onDone: {
            target: 'SELECT',
          },
        },
      },
      RETURNING: {
        on: {
          MAKE_ANOTHER_PURCHASE: [
            {
              target: 'METADATA',
              cond: (ctx) => {
                return ctx.skipQuantity
              },
            },
            {
              target: 'QUANTITY',
            },
          ],
          BACK: 'SELECT',
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
        },
      },
      RENEW: {
        on: {
          CONFIRM_RENEW: {
            actions: ['confirmRenew'],
            target: 'RENEWED',
          },
        },
      },
      RENEWED: {
        on: {
          CONFIRM_RENEW: {
            type: 'final',
            actions: ['confirmRenew'],
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
          skipQuantity: false,
        } as CheckoutMachineContext
      }),
      selectLock: assign((context, event) => {
        return {
          ...context,
          lock: event.lock,
          skipQuantity: event.skipQuantity,
        }
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
      confirmRenew: assign({
        renewed: (context, { status, transactionHash }) => {
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
          skipQuantity: false,
        } as CheckoutMachineContext
      }),
      solveCaptcha: assign({
        captcha: (_, event) => {
          return event.data
        },
      }),
      submitPassword: assign({
        password: (_, event) => {
          return event.data
        },
      }),
    },
    guards: {
      requireMessageToSign: (context) => !!context.paywallConfig.messageToSign,
      requireCaptcha: (context) => {
        return (
          !!(
            context.paywallConfig.captcha ||
            context.paywallConfig.locks?.[context.lock!.address]?.captcha
          ) && context.payment.method === 'crypto'
        )
      },
      requirePassword: (context) => {
        return (
          !!(
            context.paywallConfig.password ||
            context.paywallConfig.locks?.[context.lock!.address]?.password
          ) && context.payment.method === 'crypto'
        )
      },
    },
  }
)

export type CheckoutService = InterpreterFrom<typeof checkoutMachine>
