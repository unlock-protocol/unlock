import { useState, useEffect } from 'react'
import Cookies from 'universal-cookie'
import { usePostmateParent } from './usePostmateParent'

export interface UserInfo {
  address: string
}

export interface TransactionInfo {
  hash: string
  lock?: string
}

export enum CheckoutEvents {
  userInfo = 'checkout.userInfo',
  closeModal = 'checkout.closeModal',
  transactionInfo = 'checkout.transactionInfo',
}

type Payload = UserInfo | TransactionInfo

interface BufferedEvent {
  kind: CheckoutEvents
  payload?: Payload
}

// This is just a convenience hook that wraps the `emit` function
// provided by the parent around some communication helpers. If any
// events are called before the handshake completes, they go into a
// buffer. After that, once the handle to the parent is available, all
// the buffered events are emitted and future events are emitted
// directly.
// Communication also happens thru setting a cookie
// Which is useful in the context of proxying where the checkout window is
// not displayed in an iframe but as the main window.
export const useCheckoutCommunication = (model?: any) => {
  const [buffer, setBuffer] = useState([] as BufferedEvent[])
  const parent = usePostmateParent(model)
  const pushOrEmit = (kind: CheckoutEvents, payload?: Payload) => {
    const cookies = new Cookies()
    cookies.set(`__unlockCookie__${kind}__`, payload)
    if (!parent) {
      setBuffer([...buffer, { kind, payload }])
    } else {
      parent.emit(kind, payload)
    }
  }

  // Once parent is available, we flush the buffer
  useEffect(() => {
    if (parent) {
      buffer.forEach(event => {
        parent.emit(event.kind, event.payload)
      })
      setBuffer([])
    }
  }, [parent])

  const emitUserInfo = (info: UserInfo) => {
    pushOrEmit(CheckoutEvents.userInfo, info)
  }

  const emitCloseModal = () => {
    pushOrEmit(CheckoutEvents.closeModal)
  }

  const emitTransactionInfo = (info: TransactionInfo) => {
    pushOrEmit(CheckoutEvents.transactionInfo, info)
  }

  return {
    emitUserInfo,
    emitCloseModal,
    emitTransactionInfo,
    // `ready` is primarily provided as an aid for testing the buffer
    // implementation.
    ready: !!parent,
  }
}
