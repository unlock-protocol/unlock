import { Lock } from '~/unlockTypes'
import {
  PaywallConfigType,
  PaywallLockConfigType as PaywallConfigLock,
} from '@unlock-protocol/core'
import { createMachine, assign, ActorRefFrom, Actor } from 'xstate'
import { getHookType } from './checkoutHookUtils'

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
  | 'ALLOW_LIST'
  | 'PRIVY_FUNDING'

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
  | 'allowlist'

export interface LockState extends Lock, Required<PaywallConfigLock> {
  fiatPricing: FiatPricing
  isMember: boolean
  isExpired: boolean
  isSoldOut: boolean
}

export interface SelectLockEvent {
  type: 'SELECT_LOCK'
  existingMember: boolean
  expiredMember: boolean
}

export interface ConnectEvent {
  type: 'CONNECT'
  lock: LockState
  existingMember: boolean
  expiredMember: boolean
  skipQuantity?: boolean
  skipRecipient?: boolean
  recipients?: string[]
  keyManagers?: string[]
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
  lock?: LockState
  existingMember?: boolean
  expiredMember?: boolean
  skipQuantity?: boolean
  skipRecipient?: boolean
  recipients?: string[]
  keyManagers?: string[]
}

interface ResetEvent {
  type: 'RESET_CHECKOUT'
}

export type CheckoutMachineEvents =
  | ConnectEvent
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
  renew: boolean
  existingMember: boolean
  expiredMember: boolean
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
  metadata: undefined,
  existingMember: false,
  expiredMember: false,
}

const DISCONNECT = {
  target: 'SELECT',
  actions: ['disconnect'],
}

// TODO: consider setup({})
export const checkoutMachine = createMachine(
  {
    id: 'checkout',
    initial: 'SELECT',
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
      PRIVY_FUNDING: '.PRIVY_FUNDING',
      PAYMENT: '.PAYMENT',
      METADATA: '.METADATA',
      MESSAGE_TO_SIGN: '.MESSAGE_TO_SIGN',
      CAPTCHA: '.CAPTCHA',
      PASSWORD: '.PASSWORD',
      PROMO: '.PROMO',
      GUILD: '.GUILD',
      GITCOIN: '.GITCOIN',
      ALLOW_LIST: '.ALLOW_LIST',
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
          SELECT_LOCK: [
            {
              actions: ['lockSelected'],
              target: 'RETURNING',
              guard: ({ event }) => event.existingMember,
            },
            {
              actions: ['lockSelected'],
              target: 'QUANTITY',
              guard: ({ context, event }) =>
                !context.skipQuantity && !event.expiredMember,
            },
            {
              actions: ['lockSelected'],
              target: 'METADATA',
              guard: ({ context, event }) => {
                // For expired memberships we do not offer the ability
                // to change the metadadata and recipient...
                return !context.skipRecipient && !event.expiredMember
              },
            },
            {
              actions: ['lockSelected'],
              guard: 'requireMessageToSign',
              target: 'MESSAGE_TO_SIGN',
            },
            {
              actions: ['lockSelected'],
              target: 'PASSWORD',
              guard: 'requirePassword',
            },
            {
              actions: ['lockSelected'],
              target: 'PROMO',
              guard: 'requirePromo',
            },
            {
              actions: ['lockSelected'],
              target: 'GUILD',
              guard: 'requireGuild',
            },
            {
              actions: ['lockSelected'],
              target: 'CAPTCHA',
              guard: 'requireCaptcha',
            },
            {
              actions: ['lockSelected'],
              target: 'GITCOIN',
              guard: 'requireGitcoin',
            },
            {
              actions: ['lockSelected'],
              target: 'ALLOW_LIST',
              guard: 'requireAllowList',
            },
            {
              actions: ['lockSelected'],
              target: 'PAYMENT',
            },
          ],
          DISCONNECT,
        },
      },
      SELECT: {
        on: {
          CONNECT: {
            target: 'CONNECT',
            actions: ['connect'],
          },

          DISCONNECT,
        },
      },
      QUANTITY: {
        on: {
          SELECT_QUANTITY: [
            {
              actions: ['selectQuantity'],
              target: 'METADATA',
              guard: ({ context }) => {
                return !context.skipRecipient && !context.existingMember
              },
            },
            {
              target: 'MESSAGE_TO_SIGN',
              guard: 'requireMessageToSign',
            },
            {
              target: 'PASSWORD',
              guard: 'requirePassword',
            },
            {
              target: 'PROMO',
              guard: 'requirePromo',
            },
            {
              target: 'CAPTCHA',
              guard: 'requireCaptcha',
            },
            {
              target: 'GUILD',
              guard: 'requireGuild',
            },
            {
              target: 'GITCOIN',
              guard: 'requireGitcoin',
            },
            {
              target: 'ALLOW_LIST',
              guard: 'requireAllowList',
            },
            {
              target: 'PAYMENT',
            },
          ],

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
              target: 'ALLOW_LIST',
              actions: ['selectRecipients'],
              guard: 'requireAllowList',
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
              guard: 'requireAllowList',
              target: 'ALLOW_LIST',
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
      ALLOW_LIST: {
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
              guard: 'requireAllowList',
              target: 'ALLOW_LIST',
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
      PRIVY_FUNDING: {
        on: {
          SELECT_PAYMENT_METHOD: {
            target: 'CONFIRM',
            actions: ['selectPaymentMethod'],
          },
          BACK: 'PAYMENT',
          DISCONNECT,
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
            actions: ['confirmMint'],
          },
        },
      },
      UNLOCK_ACCOUNT: {
        target: 'CONNECT',
      },
      RETURNING: {
        on: {
          SIGN_MESSAGE: {
            actions: ['signMessage'],
          },
          MAKE_ANOTHER_PURCHASE: [
            {
              target: 'METADATA',
              guard: ({ context }) => {
                return !context.skipRecipient
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

      lockSelected: assign({
        existingMember: ({ event }: { event: SelectLockEvent }) =>
          event.existingMember as boolean,
        expiredMember: ({ event }: { event: SelectLockEvent }) =>
          event.expiredMember as boolean,
        renew: ({ event }: { event: SelectLockEvent }) =>
          event.expiredMember as boolean,
      }),

      connect: assign({
        lock: ({ event }) => event.lock,
        // Handle undefined case by providing a default value of a boolean
        skipQuantity: ({ event }) => !!event.skipQuantity || false,
        // Explicitly type the assignment to boolean
        skipRecipient: ({ event }) => event.skipRecipient as boolean,
        // Handle undefined case by providing a default value of an empty array
        recipients: ({ event }) => event.recipients || [],
        keyManagers: ({ event }) => event.keyManagers,
        renew: ({ event }) => event.expiredMember as boolean,
        existingMember: ({ event }) => event.existingMember as boolean,
        expiredMember: ({ event }) => event.expiredMember as boolean,
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
      requireCaptcha: ({ context }) =>
        getHookType(context.lock, context.paywallConfig) === 'captcha',
      requirePassword: ({ context }) =>
        getHookType(context.lock, context.paywallConfig) === 'password',
      requirePromo: ({ context }) =>
        getHookType(context.lock, context.paywallConfig) === 'promocode',
      requireGuild: ({ context }) =>
        getHookType(context.lock, context.paywallConfig) === 'guild',
      requireGitcoin: ({ context }) =>
        getHookType(context.lock, context.paywallConfig) === 'gitcoin',
      requireAllowList: ({ context }) =>
        getHookType(context.lock, context.paywallConfig) === 'allowlist',
      isCardPayment: ({ context }) => ['card'].includes(context.payment.method),
    },
  }
)

export type CheckoutService =
  | ActorRefFrom<typeof checkoutMachine>
  | Actor<typeof checkoutMachine>
