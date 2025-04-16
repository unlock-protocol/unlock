export interface DelegationState {
  delegating: boolean
  isSelfDelegate: boolean
  delegateAddress: string | null
  delegateAddressError: boolean
  isResolving: boolean
}

export type DelegationAction =
  | { type: 'START_DELEGATING' }
  | { type: 'FINISH_DELEGATING' }
  | { type: 'SET_SELF_DELEGATE'; payload: boolean }
  | { type: 'START_RESOLVING' }
  | { type: 'SET_DELEGATE_ADDRESS'; payload: string }
  | { type: 'SET_DELEGATE_ERROR'; payload: boolean }
  | { type: 'CLEAR_DELEGATE_ERROR' }
  | { type: 'FINISH_RESOLVING' }
