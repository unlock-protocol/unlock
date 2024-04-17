import { Lock } from '~/unlockTypes'
import {
  PaywallConfigType,
  PaywallLockConfigType as PaywallConfigLock,
} from '@unlock-protocol/core'
import { createMachine, assign, ActorRefFrom, Actor } from 'xstate'
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
  | 'GITCOIN'
  | 'CONNECT'

export interface FiatPricing {
  creditCardEnabled: boolean
  usd: {
    keyPrice: number
    unlockServiceFee: number
    creditCardProcessing: number
  }
}

export type CheckoutHookType =
  | 'password'
  | 'promocode'
  | 'captcha'
  | 'guild'
  | 'gitcoin'

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

// TODO: consider setup({})
export const checkoutMachine = createMachine(
  {
    id: 'checkout',
    initial: 'CONNECT',
    types: {
      typegen: {} as import('./checkoutMachine.typegen').Typegen0,
      context: {} as CheckoutMachineContext,
      events: {} as CheckoutMachineEvents,
      input: {} as Partial<CheckoutMachineContext>,
    },
    context: ({ input }) => {
      return {
        ...(DEFAULT_CONTEXT as CheckoutMachineContext),
        ...input,
      } as CheckoutMachineContext
    },
    on: {
      CONNECT: '.CONNECT',
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
      GITCOIN: '.GITCOIN',
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
    },
    states: {
      CONNECT: {
        on: {
          SELECT: 'SELECT',
          DISCONNECT,
        },
      },
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
              target: 'QUANTITY',
              guard: ({ event }) => !event.skipQuantity && !event.expiredMember,
            },
            {
              actions: ['selectLock'],
              target: 'METADATA',
              guard: ({ event }) => {
                // For expired memberships we do not offer the ability
                // to change the metadadata and recipient...
                return !event.skipRecipient && !event.expiredMember
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
                return !event.expiredMember && event.hook === 'password'
              },
            },
            {
              actions: ['selectLock'],
              target: 'PROMO',
              guard: ({ event }) => {
                return !event.expiredMember && event.hook === 'promocode'
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
              target: 'GITCOIN',
              guard: ({ event }) => {
                return event.hook === 'gitcoin'
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
              target: 'GITCOIN',
              actions: ['selectRecipients'],
              guard: 'requireGitcoin',
            },
            {
              actions: ['selectRecipients'],
              target: 'PAYMENT',
            },
          ],
          BACK: [
            {
              target: 'SELECT',
              guard: ({ context }) => {
                return !!context.skipQuantity
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
              guard: 'requireGitcoin',
              target: 'GITCOIN',
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
              guard: 'requireMessageToSign',
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
              guard: 'requireMessageToSign',
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
              guard: 'requireMessageToSign',
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
              guard: 'requireMessageToSign',
            },
            {
              target: 'METADATA',
            },
          ],
          DISCONNECT,
        },
      },
      GITCOIN: {
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
              guard: 'requireMessageToSign',
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
              guard: ({ event }) => {
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
              guard: 'requirePassword',
              target: 'PASSWORD',
            },
            {
              guard: 'requirePromo',
              target: 'PROMO',
            },
            {
              guard: 'requireGuild',
              target: 'GUILD',
            },
            {
              guard: 'requireCaptcha',
              target: 'CAPTCHA',
            },
            {
              guard: 'requireGitcoin',
              target: 'GITCOIN',
            },
            {
              guard: 'requireMessageToSign',
              target: 'MESSAGE_TO_SIGN',
            },
            {
              target: 'METADATA',
              guard: ({ context }) => {
                return !context.skipRecipient
              },
            },
            {
              target: 'QUANTITY',
              guard: ({ context }) => {
                return !context.skipQuantity
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
              guard: 'isCardPayment',
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
            // @ts-ignore
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
            target: 'CONNECT',
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
          BACK: 'SELECT',
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

      selectLock: assign({
        lock: ({ event }) => event.lock,
        renew: ({ event }) => event.expiredMember,
        // Handle undefined case by providing a default value of a boolean
        skipQuantity: ({ event }) => !!event.skipQuantity || false,
        // Explicitly type the assignment to boolean
        skipRecipient: ({ event }) => event.skipRecipient as boolean,
        // Handle undefined case by providing a default value of an empty array
        recipients: ({ event }) => event.recipients || [],
        keyManagers: ({ event }) => event.keyManagers,
        hook: ({ event }) => event.hook,
        existingMember: ({ event }) => event.existingMember,
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
      // @ts-ignore
      confirmMint: assign({
        // @ts-ignore
        mint: ({ event }) => {
          return {
            status: event.status,
            transactionHash: event.transactionHash,
            network: event.network,
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
      requireGitcoin: ({ context }) => context && context?.hook === 'gitcoin',
      isCardPayment: ({ context }) => ['card'].includes(context.payment.method),
    },
  }
)

export type CheckoutService =
  | ActorRefFrom<typeof checkoutMachine>
  | Actor<typeof checkoutMachine>
