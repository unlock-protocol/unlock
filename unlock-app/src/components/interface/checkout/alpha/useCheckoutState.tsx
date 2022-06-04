import { Lock, PaywallConfig } from '~/unlockTypes'
import { Dispatch, Reducer, useReducer } from 'react'
import { CheckoutPage } from '.'

export type CheckoutPage =
  | 'SELECT'
  | 'QUANTITY'
  | 'METADATA'
  | 'CONFIRM'
  | 'CARD'
  | 'PENDING'
  | 'MESSAGE_TO_SIGN'
  | 'CAPTCHA'

interface Options {
  initialState: CheckoutState
  paywallConfig: PaywallConfig
}

export interface CheckoutState {
  lock?: Lock
  signature?: string
  quantity?: number
  current: CheckoutPage
  previous?: CheckoutPage
}

export interface ContinueEvent {
  type: 'CONTINUE'
  payload: {
    continue: CheckoutPage
  }
}

export interface BackEvent {
  type: 'BACK'
}

export interface SelectLockEvent {
  type: 'SELECT_LOCK'
  payload: {
    lock: Lock
  }
}

export interface AddSignatureEvent {
  type: 'ADD_SIGNATURE'
  payload: {
    signature: string
  }
}

export interface AddQuantityEvent {
  type: 'ADD_QUANTITY'
  payload: {
    count: number
  }
}

export type CheckoutStateEvents =
  | SelectLockEvent
  | AddQuantityEvent
  | AddSignatureEvent
  | ContinueEvent
  | BackEvent

export type CheckoutStateDispatch = Dispatch<CheckoutStateEvents>

const checkoutReducer: Reducer<CheckoutState, CheckoutStateEvents> = (
  state,
  action
) => {
  switch (action.type) {
    case 'CONTINUE': {
      return {
        ...state,
        previous: state.current,
        current: action.payload.continue,
      }
    }
    case 'BACK': {
      if (!state.previous) {
        return state
      }
      return {
        ...state,
        previous: undefined,
        current: state.previous,
      }
    }
    case 'SELECT_LOCK': {
      return {
        ...state,
        lock: action.payload.lock,
      }
    }
    case 'ADD_QUANTITY': {
      return {
        ...state,
        quantity: action.payload.count,
      }
    }
    case 'ADD_SIGNATURE': {
      return {
        ...state,
        signature: action.payload.signature,
      }
    }
    default: {
      return state
    }
  }
}

export function useCheckoutHeadContent(
  { callToAction = {}, title, locks }: PaywallConfig,
  page: CheckoutPage = 'SELECT'
) {
  const descriptions = Object.assign(
    {
      pending: 'Purchase pending...',
      default: `${title} has ${
        Object.keys(locks).length
      } membership options, please choose one of the option to continue`,
      quantity:
        'Excellent choice! You might be able to add more than one membership below.',
      metadata:
        'Please enter the required information below in order to included into your NFT.',
      confirmed:
        'Let us prepare the magic, a NFT minting is in progress, you can also follow update in the blockexplorer!',
      card: 'You need to provide card details.',
      messageToSign: 'You need to sign the message provided by the lock owner.',
      captcha: 'You need to solve captcha to continue.',
    },
    callToAction
  )

  const pages: Record<CheckoutPage, Record<'title' | 'description', string>> = {
    SELECT: {
      title: 'Select membership',
      description: descriptions.default,
    },
    QUANTITY: {
      title: 'Add quantity',
      description: descriptions.quantity,
    },
    METADATA: {
      title: 'Enter information',
      description: descriptions.metadata,
    },
    CONFIRM: {
      title: 'Minting is completed',
      description: descriptions.confirmed,
    },
    PENDING: {
      title: 'Minting membership NFT',
      description: descriptions.pending,
    },
    CARD: {
      title: 'Add card',
      description: descriptions.card,
    },
    MESSAGE_TO_SIGN: {
      title: 'Sign Message',
      description: descriptions.messageToSign,
    },
    CAPTCHA: {
      title: 'Solve captcha',
      description: descriptions.captcha,
    },
  }
  return pages[page]
}

export function useCheckout({ initialState, paywallConfig }: Options) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState)
  const content = useCheckoutHeadContent(paywallConfig, state.current)
  return {
    checkout: {
      state,
      content,
    },
    dispatch,
  }
}
