/* eslint-disable react/prop-types */
import React, { createContext, useReducer, useContext } from 'react'
import { DelayedPurchase } from '../unlockTypes'
import { Action } from '../utils/checkoutActions'
import { assertNever } from '../utils/assertNever'

interface State {
  purchasingLockAddress: string | undefined
  transactionHash: string | undefined
  delayedPurchase: DelayedPurchase | undefined
}

export const defaultState: State = {
  purchasingLockAddress: undefined,
  transactionHash: undefined,
  delayedPurchase: undefined,
}

export function reducer(state = defaultState, action: Action): State {
  switch (action.kind) {
    case 'setPurchasingLockAddress':
      return { ...state, purchasingLockAddress: action.address }
    case 'setTransactionHash':
      return { ...state, transactionHash: action.hash }
    case 'setDelayedPurchase':
      return { ...state, delayedPurchase: action.purchase }
    default:
      // Exhaustiveness check, will cause compile error if you forget to implement an action
      assertNever(action)
  }
}

interface ContextValue {
  state: State
  dispatch: React.Dispatch<Action>
}

export const CheckoutStoreContext = createContext<ContextValue | null>(null)

export const CheckoutStoreProvider: React.FunctionComponent = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, defaultState)
  const value = { state, dispatch }

  return (
    <CheckoutStoreContext.Provider value={value}>
      {children}
    </CheckoutStoreContext.Provider>
  )
}

// We cast the return result as ContextValue to do away with the
// default null value. The store will always be available so long as the
// consuming component is under a provider.
export const useCheckoutStore = () =>
  useContext(CheckoutStoreContext) as ContextValue
