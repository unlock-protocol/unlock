/* eslint-disable react/prop-types */
import React, { createContext, useReducer, useContext } from 'react'
import { PaywallConfig } from '../unlockTypes'
import { Action } from '../utils/checkoutActions'

interface State {
  showingLogin: boolean
  config: PaywallConfig | undefined
  purchasingLockAddress: string | undefined
  transactionHash: string | undefined
}

export const defaultState: State = {
  showingLogin: false,
  config: undefined,
  purchasingLockAddress: undefined,
  transactionHash: undefined,
}

function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`)
}

export function reducer(state = defaultState, action: Action): State {
  switch (action.kind) {
    case 'setConfig':
      return { ...state, config: action.config }
    case 'setShowingLogin':
      return { ...state, showingLogin: action.value }
    case 'setPurchasingLockAddress':
      return { ...state, purchasingLockAddress: action.address }
    case 'setTransactionHash':
      return { ...state, transactionHash: action.hash }
    default:
      // Exhaustiveness check, will cause compile error if you forget to implement an action
      return assertNever(action)
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
