import { DelegationState, DelegationAction } from './types'

export const initialState: DelegationState = {
  delegating: false,
  isSelfDelegate: false,
  delegateAddress: null,
  delegateAddressError: null,
  isResolving: false,
}

export function delegationReducer(
  state: DelegationState,
  action: DelegationAction
): DelegationState {
  switch (action.type) {
    case 'START_DELEGATING':
      return { ...state, delegating: true }
    case 'FINISH_DELEGATING':
      return { ...state, delegating: false }
    case 'SET_SELF_DELEGATE':
      return { ...state, isSelfDelegate: action.payload }
    case 'START_RESOLVING':
      return { ...state, isResolving: true }
    case 'SET_DELEGATE_ADDRESS':
      return {
        ...state,
        delegateAddress: action.payload,
        delegateAddressError: null,
      }
    case 'SET_DELEGATE_ERROR':
      return {
        ...state,
        delegateAddress: null,
        delegateAddressError: action.payload,
      }
    case 'CLEAR_DELEGATE_ERROR':
      return { ...state, delegateAddressError: null }
    case 'FINISH_RESOLVING':
      return { ...state, isResolving: false }
    default:
      return state
  }
}
