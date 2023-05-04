import { Lock } from '~/unlockTypes'
import {
  PaywallConfigType as PaywallConfig,
  PaywallLockConfigType as PaywallConfigLock,
} from '@unlock-protocol/core'
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
  | 'PROMO'

export interface FiatPricing {
  creditCardEnabled: boolean
  usd: {
    keyPrice: number
    unlockServiceFee: number
    creditCardProcessing: number
  }
}

export type CheckoutHookType = 'password' | 'promocode' | 'captcha'

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
  skipRecipient?: boolean
  recipients?: string[]
  keyManagers?: string[]
  hook?: CheckoutHookType
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

export interface SubmitDataEvent {
  type: 'SUBMIT_DATA'
  data: string[]
}

export interface SubmitPasswordEvent {
  type: 'SUBMIT_PASSWORD'
  data: string[]
}

export interface SubmitPromoEvent {
  type: 'SUBMIT_PROMO'
  data: string[]
}

export interface SelectRecipientsEvent {
  type: 'SELECT_RECIPIENTS'
  recipients: string[]
  keyManagers?: string[]
  metadata?: any[]
}

export interface SelectPaymentMethodEvent {
  type: 'SELECT_PAYMENT_METHOD'
  payment: Payment
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
  | SignMessageEvent
  | SubmitPasswordEvent
  | SubmitPromoEvent
  | SubmitDataEvent
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
      method: 'claim'
    }
  | {
      method: 'swap_and_purchase'
      route: any
    }

export type TransactionStatus = 'ERROR' | 'PROCESSING' | 'FINISHED'

export interface Transaction {
  status: TransactionStatus
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
  keyManagers?: string[]
  mint?: Transaction
  renewed?: Transaction
  skipQuantity: boolean
  skipRecipient: boolean
  password?: string[]
  metadata?: any[]
  promo?: string[]
  data?: string[]
  hook?: CheckoutHookType
  renew: boolean
}

const DEFAULT_CONTEXT: CheckoutMachineContext = {
  paywallConfig: {} as PaywallConfig,
  skipRecipient: true,
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
  keyManagers: [],
  skipQuantity: false,
  renew: false,
  hook: undefined,
  metadata: undefined,
}

export const checkoutMachine = createMachine(
  {
    predictableActionArguments: true, // https://xstate.js.org/docs/guides/actions.html
    id: 'checkout',
    initial: 'SELECT',
    tsTypes: {} as import('./checkoutMachine.typegen').Typegen0,
    schema: {
      context: {} as CheckoutMachineContext,
      events: {} as CheckoutMachineEvents,
    },
    context: DEFAULT_CONTEXT,
    on: {
      UNLOCK_ACCOUNT: 'UNLOCK_ACCOUNT',
      SELECT: 'SELECT',
      QUANTITY: 'QUANTITY',
      PAYMENT: 'PAYMENT',
      METADATA: 'METADATA',
      MESSAGE_TO_SIGN: 'MESSAGE_TO_SIGN',
      CAPTCHA: 'CAPTCHA',
      PASSWORD: 'PASSWORD',
      PROMO: 'PROMO',
      UPDATE_PAYWALL_CONFIG: {
        target: 'SELECT',
        actions: ['updatePaywallConfig'],
      },
      SIGN_MESSAGE: {
        actions: ['signMessage'],
      },
      SUBMIT_DATA: {
        actions: ['submitData'],
      },
    },
    states: {
      SELECT: {
        on: {
          SELECT_LOCK: [
            {
              actions: ['selectLock'],
              target: 'PASSWORD',
              cond: (ctx, event) => {
                const isPassword = ctx?.hook === 'password'
                return !!isPassword && event.expiredMember
              },
            },
            {
              actions: ['selectLock'],
              target: 'PROMO',
              cond: (ctx, event) => {
                const isPromo = ctx?.hook === 'promocode'
                return !!isPromo && event.expiredMember
              },
            },
            {
              actions: ['selectLock'],
              target: 'CAPTCHA',
              cond: (ctx, event) => {
                const isCaptcha = ctx?.hook === 'captcha'
                return !!isCaptcha && event.expiredMember
              },
            },
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
              target: 'PAYMENT',
              cond: (_, event) => {
                // skip metadata if no quantity and recipient selection
                return !!(event.skipRecipient && event.skipQuantity)
              },
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
          SELECT_RECIPIENTS: [
            {
              target: 'MESSAGE_TO_SIGN',
              actions: ['selectRecipients'],
              cond: 'requireMessageToSign',
            },
            {
              target: 'PASSWORD',
              actions: ['selectRecipients'],
              cond: 'requirePassword',
            },
            {
              target: 'PROMO',
              actions: ['selectRecipients'],
              cond: 'requirePromo',
            },
            {
              target: 'CAPTCHA',
              actions: ['selectRecipients'],
              cond: 'requireCaptcha',
            },
            {
              actions: ['selectRecipients'],
              target: 'PAYMENT',
            },
          ],
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
      MESSAGE_TO_SIGN: {
        on: {
          SIGN_MESSAGE: [
            {
              actions: ['signMessage'],
              cond: 'requirePassword',
              target: 'PASSWORD',
            },
            {
              actions: ['signMessage'],
              cond: 'requirePromo',
              target: 'PROMO',
            },
            {
              actions: ['signMessage'],
              cond: 'requireCaptcha',
              target: 'CAPTCHA',
            },
            {
              actions: ['signMessage'],
              target: 'PAYMENT',
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
          SUBMIT_PASSWORD: [
            {
              target: 'RENEW',
              actions: ['submitPassword'],
              cond: (ctx) => ctx.renew,
            },
            {
              target: 'PAYMENT',
              actions: ['submitPassword'],
            },
          ],
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
            target: 'SELECT',
            actions: ['disconnect'],
          },
        },
      },
      PROMO: {
        on: {
          SUBMIT_PROMO: [
            {
              target: 'RENEW',
              actions: ['submitPromo'],
              cond: (ctx) => ctx.renew,
            },
            {
              target: 'PAYMENT',
              actions: ['submitPromo'],
            },
          ],
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
            target: 'SELECT',
            actions: ['disconnect'],
          },
        },
      },
      CAPTCHA: {
        on: {
          SOLVE_CAPTCHA: [
            {
              target: 'RENEW',
              actions: ['solveCaptcha'],
              cond: (ctx) => ctx.renew,
            },
            {
              target: 'PAYMENT',
              actions: ['solveCaptcha'],
            },
          ],
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
              actions: ['selectPaymentMethod'],
              target: 'CONFIRM',
            },
          ],
          BACK: [
            {
              cond: 'requirePassword',
              target: 'PASSWORD',
            },
            {
              cond: 'requirePromo',
              target: 'PROMO',
            },
            {
              cond: 'requireCaptcha',
              target: 'CAPTCHA',
            },
            {
              cond: 'requireMessageToSign',
              target: 'MESSAGE_TO_SIGN',
            },
            {
              target: 'METADATA',
            },
          ],
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
        },
      },
      CARD: {
        on: {
          SELECT_PAYMENT_METHOD: [
            {
              target: 'CONFIRM',
              actions: ['selectPaymentMethod'],
            },
          ],
          DISCONNECT: {
            target: 'SELECT',
            actions: ['disconnect'],
          },
          BACK: 'PAYMENT',
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
      disconnect: assign((_context) => {
        return {
          ...DEFAULT_CONTEXT,
          paywallConfig: _context.paywallConfig,
        }
      }),
      selectLock: assign((context, event) => {
        return {
          ...context,
          lock: event.lock,
          renew: event.expiredMember,
          skipQuantity: event.skipQuantity,
          skipRecipient: event.skipRecipient,
          recipients: event.recipients,
          keyManagers: event.keyManagers,
          hook: event.hook,
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
        keyManagers: (_, event) => {
          return event.keyManagers
        },
        metadata: (_, event) => {
          return event.metadata
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
        mint: (_, { status, transactionHash }) => {
          return {
            status,
            transactionHash,
          } as const
        },
      }),
      confirmRenew: assign({
        renewed: (_, { status, transactionHash }) => {
          return {
            status,
            transactionHash,
          } as const
        },
      }),
      updatePaywallConfig: assign((_, event) => {
        return {
          ...DEFAULT_CONTEXT,
          paywallConfig: event.config,
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
      submitPromo: assign({
        promo: (_, event) => {
          return event.data
        },
      }),
      submitData: assign({
        data: (_, event) => {
          return event.data
        },
      }),
    },
    guards: {
      requireMessageToSign: (context) => !!context.paywallConfig.messageToSign,
      requireCaptcha: (context) => context && context?.hook === 'captcha',
      requirePassword: (context) => context && context?.hook === 'password',
      requirePromo: (context) => context && context?.hook === 'promocode',
    },
  }
)

export type CheckoutService = InterpreterFrom<typeof checkoutMachine>
