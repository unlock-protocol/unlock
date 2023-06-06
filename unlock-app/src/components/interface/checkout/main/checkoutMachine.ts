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
  | 'GUILD'

export interface FiatPricing {
  creditCardEnabled: boolean
  usd: {
    keyPrice: number
    unlockServiceFee: number
    creditCardProcessing: number
  }
}

export type CheckoutHookType = 'password' | 'promocode' | 'captcha' | 'guild'

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

export interface SubmitGuildEvent {
  type: 'SUBMIT_GUILD'
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

interface ResetEvent {
  type: 'RESET_CHECKOUT'
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
  | ResetEvent
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
      route?: any
    }
  | {
      method: 'universal_card'
      cardId?: string
    }

export type TransactionStatus = 'ERROR' | 'PROCESSING' | 'FINISHED'

export interface Transaction {
  status: TransactionStatus
  transactionHash?: string
}

export interface CheckoutMachineContext {
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
  existingMember: boolean
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
  existingMember: false,
}

const DISCONNECT = {
  target: 'SELECT',
  actions: ['disconnect'],
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
      GUILD: 'GUILD',
      CARD: 'CARD',
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
      RESET_CHECKOUT: {
        target: 'SELECT',
        actions: ['disconnect'],
      },
    },
    states: {
      SELECT: {
        on: {
          SELECT_LOCK: [
            {
              actions: ['selectLock'],
              target: 'RETURNING',
              cond: (_, event) => event.existingMember,
            },
            {
              actions: ['selectLock'],
              target: 'RENEW',
              cond: (_, event) => event.expiredMember,
            },
            {
              actions: ['selectLock'],
              target: 'QUANTITY',
              cond: (_, event) => !event.skipQuantity,
            },
            {
              actions: ['selectLock'],
              target: 'METADATA',
              cond: (_, event) => {
                return !event.skipRecipient
              },
            },
            {
              actions: ['selectLock'],
              cond: 'requireMessageToSign',
              target: 'MESSAGE_TO_SIGN',
            },
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
              target: 'GUILD',
              cond: (ctx, event) => {
                console.log('I WAS HERE TO CHECK IF THE HOOK IS A GUILD HOOK')
                console.log(ctx)
                const isGuild = ctx?.hook === 'guild'
                return !!isGuild && event.expiredMember
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
              target: 'PAYMENT',
              cond: (_, event) => {
                // skip metadata if no quantity and recipient selection
                return !!(event.skipRecipient && event.skipQuantity)
              },
            },
          ],
          DISCONNECT,
        },
      },
      QUANTITY: {
        on: {
          SELECT_QUANTITY: {
            actions: ['selectQuantity'],
            target: 'METADATA',
          },
          BACK: 'SELECT',
          DISCONNECT,
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
              target: 'GUILD',
              actions: ['selectRecipients'],
              cond: 'requireGuild',
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
          DISCONNECT,
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
              cond: 'requireGuild',
              target: 'GUILD',
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
          DISCONNECT,
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
          DISCONNECT,
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
          DISCONNECT,
        },
      },
      GUILD: {
        on: {
          SUBMIT_GUILD: [
            {
              target: 'RENEW',
              actions: ['submitGuild'],
              cond: (ctx) => ctx.renew,
            },
            {
              target: 'PAYMENT',
              actions: ['submitGuild'],
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
          DISCONNECT,
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
          DISCONNECT,
        },
      },
      PAYMENT: {
        on: {
          SELECT_PAYMENT_METHOD: [
            {
              target: 'CARD',
              actions: ['selectPaymentMethod'],
              cond: (_, event) => {
                return ['card'].includes(event.payment.method)
              },
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
              cond: 'requireGuild',
              target: 'GUILD',
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
              cond: (ctx) => {
                return !ctx.skipRecipient
              },
            },
            {
              target: 'QUANTITY',
              cond: (ctx) => {
                return !ctx.skipQuantity
              },
            },
            {
              target: 'SELECT',
            },
          ],
          DISCONNECT,
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
          DISCONNECT,
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
              target: 'CARD',
              cond: 'isCardPayment',
            },
            {
              target: 'PAYMENT',
            },
          ],
          DISCONNECT,
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
          existingMember: event.existingMember,
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
      requireGuild: (context) => context && context?.hook === 'guild',
      isCardPayment: (context) => ['card'].includes(context.payment.method),
    },
  }
)

export type CheckoutService = InterpreterFrom<typeof checkoutMachine>
