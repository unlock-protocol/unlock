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
  | SubmitDataEvent
  | MakeAnotherPurchaseEvent
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
  metadata?: any[]
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
  target: '.SELECT',
  actions: ['disconnect'],
}

export const checkoutMachine = createMachine(
  {
    id: 'checkout',
    initial: 'SELECT',
    types: {
      typegen: {} as import('./checkoutMachine.typegen').Typegen0,
      context: {} as CheckoutMachineContext,
      events: {} as CheckoutMachineEvents,
    },
    context: DEFAULT_CONTEXT,
    on: {
      UNLOCK_ACCOUNT: '.UNLOCK_ACCOUNT',
      SELECT: '.SELECT',
      QUANTITY: '.QUANTITY',
      PAYMENT: '.PAYMENT',
      METADATA: '.METADATA',
      MESSAGE_TO_SIGN: '.MESSAGE_TO_SIGN',
      CAPTCHA: '.CAPTCHA',
      PASSWORD: '.PASSWORD',
      PROMO: '.PROMO',
      GUILD: '.GUILD',
      CARD: '.CARD',
      UPDATE_PAYWALL_CONFIG: {
        target: '.SELECT',
        actions: ['updatePaywallConfig'],
      },
      SIGN_MESSAGE: {
        actions: ['signMessage'],
      },
      SUBMIT_DATA: {
        actions: ['submitData'],
      },
      RESET_CHECKOUT: {
        target: '.SELECT',
        actions: ['disconnect'],
      },
      DISCONNECT,
    },
    states: {
      SELECT: {
        on: {
          SELECT_LOCK: [
            {
              actions: ['selectLock'],
              target: 'RETURNING',
              guard: ({ event }) => event.existingMember,
            },
            {
              actions: ['selectLock'],
              target: 'RENEW',
              guard: ({ event }) => event.expiredMember,
            },
            {
              actions: ['selectLock'],
              target: 'QUANTITY',
              guard: ({ event }) => !event.skipQuantity,
            },
            {
              actions: ['selectLock'],
              target: 'METADATA',
              guard: ({ event }) => {
                return !event.skipRecipient
              },
            },
            {
              actions: ['selectLock'],
              guard: 'requireMessageToSign',
              target: 'MESSAGE_TO_SIGN',
            },
            {
              actions: ['selectLock'],
              target: 'PASSWORD',
              guard: ({ event }) => {
                return event.hook === 'password'
              },
            },
            {
              actions: ['selectLock'],
              target: 'PROMO',
              guard: ({ event }) => {
                return event.hook === 'promocode'
              },
            },
            {
              actions: ['selectLock'],
              target: 'GUILD',
              guard: ({ event }) => {
                return event.hook === 'guild'
              },
            },
            {
              actions: ['selectLock'],
              target: 'CAPTCHA',
              guard: ({ event }) => {
                return event.hook === 'captcha'
              },
            },
            {
              actions: ['selectLock'],
              target: 'PAYMENT',
              guard: ({ event }) => {
                // skip metadata if no quantity and recipient selection
                return !!(event.skipRecipient && event.skipQuantity)
              },
            },
          ],
        },
      },
      QUANTITY: {
        on: {
          SELECT_QUANTITY: {
            actions: ['selectQuantity'],
            target: 'METADATA',
          },
        },
      },
      METADATA: {
        on: {
          SELECT_RECIPIENTS: [
            {
              target: 'MESSAGE_TO_SIGN',
              actions: ['selectRecipients'],
              guard: 'requireMessageToSign',
            },
            {
              target: 'PASSWORD',
              actions: ['selectRecipients'],
              guard: 'requirePassword',
            },
            {
              target: 'PROMO',
              actions: ['selectRecipients'],
              guard: 'requirePromo',
            },
            {
              target: 'CAPTCHA',
              actions: ['selectRecipients'],
              guard: 'requireCaptcha',
            },
            {
              target: 'GUILD',
              actions: ['selectRecipients'],
              guard: 'requireGuild',
            },
            {
              actions: ['selectRecipients'],
              target: 'PAYMENT',
            },
          ],
        },
      },
      MESSAGE_TO_SIGN: {
        on: {
          SIGN_MESSAGE: [
            {
              actions: ['signMessage'],
              guard: 'requirePassword',
              target: 'PASSWORD',
            },
            {
              actions: ['signMessage'],
              guard: 'requirePromo',
              target: 'PROMO',
            },
            {
              actions: ['signMessage'],
              guard: 'requireGuild',
              target: 'GUILD',
            },
            {
              actions: ['signMessage'],
              guard: 'requireCaptcha',
              target: 'CAPTCHA',
            },
            {
              actions: ['signMessage'],
              target: 'PAYMENT',
            },
          ],
        },
      },
      PASSWORD: {
        on: {
          SUBMIT_DATA: [
            {
              target: 'RENEW',
              actions: ['submitData'],
              guard: ({ context }) => context.renew,
            },
            {
              target: 'PAYMENT',
              actions: ['submitData'],
            },
          ],
        },
      },
      PROMO: {
        on: {
          SUBMIT_DATA: [
            {
              target: 'RENEW',
              actions: ['submitData'],
              guard: ({ context }) => context.renew,
            },
            {
              target: 'PAYMENT',
              actions: ['submitData'],
            },
          ],
        },
      },
      GUILD: {
        on: {
          SUBMIT_DATA: [
            {
              target: 'RENEW',
              actions: ['submitData'],
              guard: ({ context }) => context.renew,
            },
            {
              target: 'PAYMENT',
              actions: ['submitData'],
            },
          ],
        },
      },
      CAPTCHA: {
        on: {
          SUBMIT_DATA: [
            {
              target: 'RENEW',
              actions: ['submitData'],
              guard: ({ context }) => context.renew,
            },
            {
              target: 'PAYMENT',
              actions: ['submitData'],
            },
          ],
        },
      },
      PAYMENT: {
        on: {
          SELECT_PAYMENT_METHOD: [
            {
              target: 'CARD',
              actions: ['selectPaymentMethod'],
              guard: ({ event }) => {
                return ['card'].includes(event.payment.method)
              },
            },
            {
              actions: ['selectPaymentMethod'],
              target: 'CONFIRM',
            },
          ],
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
        },
      },
      CONFIRM: {
        on: {
          CONFIRM_MINT: {
            target: 'MINTING',
            actions: ['confirmMint'],
          },
        },
      },
      MINTING: {
        type: 'final',
        on: {
          CONFIRM_MINT: {
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
              guard: ({ context }) => {
                return context.skipQuantity
              },
            },
            {
              target: 'QUANTITY',
            },
          ],
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
        type: 'final',
        on: {
          CONFIRM_RENEW: {
            actions: ['confirmRenew'],
          },
        },
      },
    },
  },
  {
    actions: {
      disconnect: assign(({ context }) => {
        return {
          ...DEFAULT_CONTEXT,
          paywallConfig: context.paywallConfig,
        }
      }),
      selectLock: assign(({ context, event }) => {
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
        quantity: ({ event }) => {
          return event.quantity
        },
      }),
      selectPaymentMethod: assign({
        payment: ({ event }) => {
          return event.payment
        },
      }),
      selectRecipients: assign({
        recipients: ({ event }) => {
          return event.recipients
        },
        keyManagers: ({ event }) => {
          return event.keyManagers
        },
        metadata: ({ event }) => {
          return event.metadata
        },
      }),
      signMessage: assign({
        messageToSign: ({ event }) => {
          return {
            address: event.address,
            signature: event.signature,
          } as const
        },
      }),
      confirmMint: assign({
        mint: ({ event }) => {
          return {
            status: event.status,
            transactionHash: event.transactionHash,
          } as const
        },
      }),
      confirmRenew: assign({
        renewed: ({ event }) => {
          return {
            status: event.status,
            transactionHash: event.transactionHash,
          } as const
        },
      }),
      updatePaywallConfig: assign(({ event }) => {
        return {
          ...DEFAULT_CONTEXT,
          paywallConfig: event.config,
        } as CheckoutMachineContext
      }),
      submitData: assign({
        data: ({ event }) => {
          return event.data
        },
      }),
    },
    guards: {
      requireMessageToSign: ({ context }) =>
        !!context.paywallConfig.messageToSign,
      requireCaptcha: ({ context }) => context && context?.hook === 'captcha',
      requirePassword: ({ context }) => context && context?.hook === 'password',
      requirePromo: ({ context }) => context && context?.hook === 'promocode',
      requireGuild: ({ context }) => context && context?.hook === 'guild',
    },
  }
)

export type CheckoutService = InterpreterFrom<typeof checkoutMachine>
