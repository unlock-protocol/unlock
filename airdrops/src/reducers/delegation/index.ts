import { useReducer } from 'react'
import { delegationReducer, initialState } from './reducer'
import { delegationActions } from './actions'
import type { DelegationState, DelegationAction } from './types'

export function useDelegationReducer() {
  const [state, dispatch] = useReducer(delegationReducer, initialState)

  const actions = {
    startDelegating: () => dispatch(delegationActions.startDelegating()),
    finishDelegating: () => dispatch(delegationActions.finishDelegating()),
    setSelfDelegate: (isSelfDelegate: boolean) =>
      dispatch(delegationActions.setSelfDelegate(isSelfDelegate)),
    startResolving: () => dispatch(delegationActions.startResolving()),
    setDelegateAddress: (address: string) =>
      dispatch(delegationActions.setDelegateAddress(address)),
    setDelegateError: (error: boolean) =>
      dispatch(delegationActions.setDelegateError(error)),
    clearDelegateError: () => dispatch(delegationActions.clearDelegateError()),
    finishResolving: () => dispatch(delegationActions.finishResolving()),
  }

  return {
    state,
    actions,
  }
}

export type { DelegationState, DelegationAction }
