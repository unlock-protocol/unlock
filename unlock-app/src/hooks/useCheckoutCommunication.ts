import { usePostmateParent } from './usePostmateParent'

export interface UserInfo {
  address: string
}

export interface TransactionInfo {
  hash: string
}

export enum CheckoutEvents {
  userInfo = 'checkout.userInfo',
  closeModal = 'checkout.closeModal',
  transactionInfo = 'checkout.transactionInfo',
}

// This is just a convenience hook that wraps the `emit` function
// provided by the parent around some communication helpers. Consumers
// are intended to check the `ready` property to know when to start
// using the hook. If they do not, runtime errors may occur if any of
// these functions are called before the postmate handshake completes.
export const useCheckoutCommunication = () => {
  const parent = usePostmateParent()

  const emitUserInfo = (info: UserInfo) => {
    parent!.emit(CheckoutEvents.userInfo, info)
  }

  const emitCloseModal = () => {
    parent!.emit(CheckoutEvents.closeModal)
  }

  const emitTransactionInfo = (info: TransactionInfo) => {
    parent!.emit(CheckoutEvents.transactionInfo, info)
  }

  return {
    emitUserInfo,
    emitCloseModal,
    emitTransactionInfo,
    ready: !!parent,
  }
}
