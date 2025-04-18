import type { DelegationAction } from './types'

export const delegationActions = {
  startDelegating: (): DelegationAction => ({
    type: 'START_DELEGATING',
  }),

  finishDelegating: (): DelegationAction => ({
    type: 'FINISH_DELEGATING',
  }),

  setSelfDelegate: (isSelfDelegate: boolean): DelegationAction => ({
    type: 'SET_SELF_DELEGATE',
    payload: isSelfDelegate,
  }),

  startResolving: (): DelegationAction => ({
    type: 'START_RESOLVING',
  }),

  setDelegateAddress: (address: string): DelegationAction => ({
    type: 'SET_DELEGATE_ADDRESS',
    payload: address,
  }),

  setDelegateError: (error: boolean): DelegationAction => ({
    type: 'SET_DELEGATE_ERROR',
    payload: error,
  }),

  clearDelegateError: (): DelegationAction => ({
    type: 'CLEAR_DELEGATE_ERROR',
  }),

  finishResolving: (): DelegationAction => ({
    type: 'FINISH_RESOLVING',
  }),
}
