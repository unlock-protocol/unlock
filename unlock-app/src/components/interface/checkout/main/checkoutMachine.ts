import { Lock } from '~/unlockTypes'
import {
  PaywallConfigType,
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
  isExpired: boolean
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

interface UnlockAccountEvent {
  type: 'UNLOCK_ACCOUNT'
}
interface UpdatePaywallConfigEvent {
  type: 'UPDATE_PAYWALL_CONFIG'
  config: PaywallConfigType
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
  | SubmitDataEvent
  | MakeAnotherPurchaseEvent
  | ConfirmMintEvent
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
      method: 'crosschain_purchase'
      route?: any
    }
  | {
      method: 'universal_card'
      cardId?: string
    }
  | {
      method: 'crossmint'
    }

export type TransactionStatus = 'ERROR' | 'PROCESSING' | 'FINISHED'

export interface Transaction {
  network?: number
  status: TransactionStatus
  transactionHash?: string
}

export interface CheckoutMachineContext {
  paywallConfig: PaywallConfigType
  lock?: LockState
  payment: Payment
  messageToSign?: {
    signature: string
    address: string
  }
  quantity: number
  recipients: string[]
  keyManagers?: string[]
  mint?: Transaction
  skipQuantity: boolean
  skipRecipient: boolean
  metadata?: any[]
  data?: string[]
  hook?: CheckoutHookType
  renew: boolean
  existingMember: boolean
}

const DEFAULT_CONTEXT: CheckoutMachineContext = {
  paywallConfig: {} as PaywallConfigType,
  skipRecipient: true,
  lock: undefined,
  messageToSign: undefined,
  mint: undefined,
  payment: {
    method: 'crypto',
  },
  quantity: 1,
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
              target: 'QUANTITY',
              cond: (_, event) => !event.skipQuantity && !event.expiredMember,
            },
            {
              actions: ['selectLock'],
              target: 'METADATA',
              cond: (_, event) => {
                // For expired memberships we do not offer the ability
                // to change the metadadata and recipient...
                return !event.skipRecipient && !event.expiredMember
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
              cond: (_, event) => {
                return event.hook === 'password'
              },
            },
            {
              actions: ['selectLock'],
              target: 'PROMO',
              cond: (_, event) => {
                return event.hook === 'promocode'
              },
            },
            {
              actions: ['selectLock'],
              target: 'GUILD',
              cond: (_, event) => {
                return event.hook === 'guild'
              },
            },
            {
              actions: ['selectLock'],
              target: 'CAPTCHA',
              cond: (_, event) => {
                return event.hook === 'captcha'
              },
            },
            {
              actions: ['selectLock'],
              target: 'PAYMENT',
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
          SUBMIT_DATA: [
            {
              target: 'PAYMENT',
              actions: ['submitData'],
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
          SUBMIT_DATA: [
            {
              target: 'PAYMENT',
              actions: ['submitData'],
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
          SUBMIT_DATA: [
            {
              target: 'PAYMENT',
              actions: ['submitData'],
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
          SUBMIT_DATA: [
            {
              target: 'PAYMENT',
              actions: ['submitData'],
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
        mint: (_, { status, transactionHash, network }) => {
          return {
            status,
            transactionHash,
            network,
          } as const
        },
      }),
      updatePaywallConfig: assign((_, event) => {
        return {
          ...DEFAULT_CONTEXT,
          paywallConfig: event.config,
        } as CheckoutMachineContext
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
