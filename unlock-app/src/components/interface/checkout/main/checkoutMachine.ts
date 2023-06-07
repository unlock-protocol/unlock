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
  | SubmitGuildEvent
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
    /** @xstate-layout N4IgpgJg5mDOIC5QGMAWZkGsD2BXALgMQCqAcgDIDyAwgNID6AgtdZWQCoDaADALqKgADtlgBLfKOwA7ASAAeiAGwB2ADQgAnogAsygIwAmAHQBWAJwBmPSZN6zADhV6Avs-VoMOAoQDKAUXI-ai4+WWExCWlZBQQVdS0EbXsbIwsLbW5daz1Fc1d3dCw8IgBFYkZSdgBJdgBNHn4kEHDxSRkmmLjNRGVuRyNtNJN7PW4bTLN8kA8i7wAFRlqAWT9KhrCRVqiOpTVuxIMTAcz7ZQtuZTNtRW4LKZmvIhX2RgARRhf1ppbI9tBOvYJXoWI5XDJ6KwOEwGO5uaaFR6EFY+HyMADifno7Eo9B8VTRpC+Qk2v2iu3iSihAxM2lpJnSdjMynuCOKhGojDm7GoAAlGETmiS2mTYoCehDFEYzDC9EkzHprMobCzPGyFiiAOqUABKrwFP2FO1FFIQFgM2gGhzOZ0UigyymUihVsyIc21lCWlH1Qu2-3J+wsygt8vpYwM4cs2mdiLRxCq5D1oW+Pr+8n9QJhFiMsvsFiujv0Bns0bZHN13oihr9xv2BjOUosihyZhM3AcIxMJe8xDm73YmIWtQ1jHI5HorFIADF8RWtqmASbtGYxkZ7DCm62+npHF2iHiCfRkaiMbPSUbw9pjMkW9L9NoTI6TaN7EZw9D78kbNCYbvfMQAEJLDU9B9vySbEpWvppggF5mNmtxbkWjhnE+Bi-tqfj+Ow448kEtBsCEjQQXOIpdAk973lK9i0ua5pNooLa7kY-iBMEvgBEE2FUHQp5VtBoyyqkDHUYGsrmNYJrmDS2ZmDc4yKIGS5MSxnHsaxXE0LQnB6ERgqQfOiACRajYOIMd7iSYknXNmS65L0FzKDCUZwg8xTMRxbEqcE9DcVpBi6QaUExEZQmmaJ94hiadogqYTnysCNywgUqoEO56lqZxPmaZwFgBSmIohSZInmZF+y2HoygDNkjm2Mo9hmJMLmsqlXnsBl3m+Zw2h5fpBXcIJRVmWJpUJHmgZGL0NoVf18pOk1KX4GlqmtVlPEmD1JFGoVwlDRFEn7BCFWvtwmYtrcEL9cpHltStnWKBtZ7VttYUlftCS0UcIwwgY0pJIYpxXelt3ZcoD18cF-XGTt4UWVFIwvkyea5tosq9MW80uktnnXatWn2GDQWGZDoXFcNb1KPSegTUk1o2CGnYY48WM3TjnVmATBkIM9pN7ZZta2i+SowvYIuKuYSXwgtzOEK8VQ+BOpCcbxhMIEGlUOC2yT6KcKPaIua7cBNFWWIoRbLo2DPJZjZQVNUdTtdhNuVDU9TgXpm3VnRlWtnV5y1abVn1r0di1Q+4bo1bTNO3btSEP+zBaW7gWc4cKhGApX0tradU5FF5pU5eF1tnY5wuIzbnRy7MtywrStJ-l562Ibbb1Vcdo0oMFh5-KUrPoopxKmuzLl6lzxvB8jAO-QGHUFUcxVKs7A+MrKcGP32a5BYa5r5kIL2JJbaG4cso3JkTbmkxY+gVPM9zwvlTLzpGy9eea8vjk9LbzcgzDIubbGJCUyptZLSkvn4F418Vq33novZe-ln4e2guGdeH8t7IN3r-fYS5BimEbHaBS6RMiW0lpjK+E8b5BDvrAnKHMRTIPfpvL+GD95lUDJVXQKgxjLhyI6MBEDyFQMoTAh+XVaGvxQYw9BP8WEJGGAqKqKhcjXEsNwXIfDx4vAobPYRS9ODrQQY9fiaMpR1kMCCNeNxcwmiLA6bMSoaTpEjCYW06jr7xx4vXF+T1qIvnsG2SwpkRZv0XNKLMVgfojDOCCJkrjyHuK0k-ZMXikFvw3p-KRe9JLOLgreOwjpDB1ViZo2W8tKCkEVsEFeBVTgvisK2BqZkDAfxCfWPxhwlzmH6j+Eei0jzokxNiXE+JSC+GGYeTCx4-BVPPC2I45wgzbg1gHLBRZJSXiaUqFGeYrhgJRP0rEOJ9wjKOeMvZJ5EnEUMTEH6KR5ko3qvVZZ5FO7ZiKvKHeZxdmTIOUMgkoyDx9JPPApJiDrmzNSBce5SyDCLkcpKZxtoP6tm6ZHNygKBmHOGf80gpzJk0IMeDRANy5mQsWY8mFWCHxwWSNuE6uYOxl1RaPCZ+zBlHOxbi-poiCUqxhEqAYslDDOLzNCTI1jbRHzGLYQMbY7QQi+ayzFfz4nTM9s4yqGdDBZxUCMRQB88wTSbPVJp9VzDDyZb0llGIfnspKbXSpnjQVEqbkYFuDT260jSCaQMVxXX5i3g6XWTF1Q+C1LqP8gFgIhrDYmMR1Y2HGUGLJM4FwcgyJ0KY11a8GQBIqsGxgmodSvAjUBbC0ai3aTjUg0ypg8npBGAG9NME+hHHsSdRkyRAz5sLeGlVjqrmIHOOGY6BhMiZAyIcLei4YSgjNDcexQZ+7dtDUWuOCdK08s5ucX1atoSzXOKo71TIqYPlFRcSGP1l0xurqU8pdcq0xDqWEhqyFR0qBpHq-YTJJQOCFlS0YtVg3uk9CWqNwGvT9sJaaQNqQk0qHmWmkJRYbKIWvOGRlJCmZug9JQUDZbwMbpBQO00-UswtjNA6VRa5cyfveoGYwDgTo6ppH0RqFqjDYZA32h9g6TrGFHaOjItITqf0XGg9OuhC5rxbLoIDOG108Que7Yj26LS7p+jkA9tGdDbwmvKRw5oxh1TQj0jj4Gb32sIpukUT7UgvpUG+zZ2mubXENiMWy5pt2qJM+x2M8Zi0+AAqW+gfmEyquggm2DeZ4Opv7iafQvqRa6HDD9Os8omKhYC0F4CmXCOXKg0Oi0ZrTjOP-kyMUpot6SkMLoVj5tzTENcqlTLCnE48ZI8OgTY7hOTqbdcR0rrKNJAYjK5yvm4wJla3l5TBW2xqd0HuzT3BD1lQYobJwDhrAo13hlibxa7VlIqVZojBXrDPocA51RTmorvqEhKE4I3rBMQ5FyXkk8fCUHIAANUxC97kfJwuPpg+kaLKb9Bxf2L0Bw6dzAcMaVvRrzVFp-be74T7P3xycn+-yJTycbPLcqn0XQSWFkbm9am18DoziXip3kUzKO+RTcgyrId-GTrdYnaJylP0hLhkcbqw4z2seo5Vbjhu8a5vUyFvu5bznoTOImpCJpiMtlC9e4zg7d6HXtds9s19V2P1RTbJVPxyFLghkF6ZwcKxKhT2t4vcZ7AeSUFjdZra7cBg9cvH4pIFKEgf2DBVM7TTRU7it4sG3LN1L0Ht5UR3zu9Ri+ScFD3tIJ3e5OH7wyVxjCyhhA1c9jo+j5uWIvJn7WciUTTydDPvvrGHH4yCJIeZDhrjmux2PbVRcV9T17osmfrH0jgq5xyTIG2FPD6X23KrgX5ZVpXo41faI+7XN6mwxg5LTXik2RsJfI9Tdym7p6vf0-97rwGPlE05GyVHa2JIe+y8qu6kf-iJ+a9n9X7WNv6drxKgUiNzIB-afddfRE7efN-ZfAfWsRGY4C4eqRxZbNjTDNyTvKbe6F-FPKvPvFfLPU0JCV8XQR0DIDcIMCWJrRaVAlVUGDAwybcC0JpEEYONIcyQfYdW4JUJUUYRsEYIAtqTXI7QHQyWiVcXIZcSJRdNeQfRyWKO8H6G4Udc1ZA1KMsALHGTvePF3QQmCVJVBJhaRJ8IPV1eqcHU9JvIXcNfg+9GgrmGpVIawfxRpZpfYXMMJIMZcVZCjZxcw4tbjawkuT6GkJyPeL8J8b+S0QeekYYfuFFJQ5HMpacbUJYdkeIqoRIw8KoNYZnFOcFO5MlG-Aw+sYYY9OySIsbWIowCcBIpI3wsAlOS8LMPjOwQg9IAw0ddOZbHMbWIeCOcoyo1I6o9dJPJ1GCe8Aua4XICVZsPmf3NcKmPMfJWwS8JcB0Z7FIxIizQ7Kw2ouhF1N1NuCiTuOGOCR0cMc3JvBqRHKWICZ2UgNEZIqcfo9IzInXcwY4vxIVATb+CrBUE6KiVRMxO0fqXMJiMgXyJgFgNgW3CAaQMAIwUQKQAAN2wEwFhNwCkAABtsAsBGBkBkA8ApB8AtD6QswODODCDTYUIsE7w-Ut4Tp9AvxLjMYMJ2BiBtRSAMi7ilhGBaBMQKhKAnc-BtQY9WS3t-AtCF9PdT8cDJI14qY6TLgO51VGSmZmTWT2TbikRuTeTSB+TcIhS5gRS+QxShjiMJSl9a9P9ZFytVwmRTjotzB29yjVS2SOTy8-CD1jg79t0RZ+o9BJJzYJpVEaYFC+cmIMJFYNR7iqjp5Vg-ANQtDC4swmkzFx16SlR4taVUhRZlEpVbgwzYyNQ-Bi0+i0jwy4yEyMgwkmxbgOk7QHAMy2wJpLhMhpMUYVBXA4QpBsAIA4BZByC-CzAnx+h7wJgg8fjBgejyDmZrCHQ5T7EGIsgQ49YsFpQqYrgrBZi6R6omJK46hrC6wmkBhLgG85UfoWiyomQ4IT5ATLhHIVjTMyEXh9yLg4IGJIjSDzhbRlzZF2lPS8wcg+hooFVrU2Vhl9zHIC5jzoRTzIxFxoLUgQQ6TbSCEr0i1rDGxDgYdDhbALtTgvUVlfU8wUYU0nI80rdwN0LTYXwHSEU8LzRpQQlbBTBAKk1Bh+tdt-NKKedzBR0iF7wfZ4sTVXx5diTKMu16dhc+QuKf1iSzZ5QFRAwMy2C6x5loQcx7xeC-DPVswLErRYcrRxURhBs0haRLgt4dZvDnzpRKdDpv0ZNbQDD+hAwpJ2DqIL56c1ilhwL0hXVC5f1z4nlaDZIpQHwmxSTmyfNyjrjqhbiuLKpehRDP47A+gm1DBMhjphhhhlcHwxgQSKBNJwTWAOB0K0hKdEpwl+4JzFx+44IzVMh9Azg258yWSXTYrtito2KCD6Iwq0h-p-T9AqJldzLGxtx8yIzrDttF8Hw-Yks-FpiehR0SS6YDc4oxq4yiyJrOrop8FkgFzBzIdkzXUWyRYaRbSOznAgA */
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
