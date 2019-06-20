import { IframeType } from '../windowTypes'
import {
  mainWindowPostOffice,
  PostMessageListener,
  PostOfficeWindow,
} from '../utils/postOffice'
import { MessageTypes, ExtractPayload } from '../messageTypes'

export type IframeNames = 'checkout' | 'data' | 'account'
declare const process: {
  env: any
}

export type PostMessageToIframe<T extends MessageTypes> = (
  iframe: IframeNames,
  type: T,
  payload: ExtractPayload<T>
) => void
export type MessageHandlerTemplate<T extends MessageTypes> = (
  send: PostMessageToIframe<T>,
  dataIframe: IframeType,
  checkoutIframe: IframeType,
  accountIframe: IframeType
) => PostMessageListener
export type MessageHandlerTemplates<T extends MessageTypes> = {
  [key in T]?: MessageHandlerTemplate<T>
}

export default function setupIframeMailbox(
  window: PostOfficeWindow,
  checkoutIframe: IframeType,
  dataIframe: IframeType,
  accountIframe: IframeType
) {
  const {
    postMessage: dataPostOffice,
    addHandler: addDataMessageHandler,
  } = mainWindowPostOffice(
    window,
    dataIframe,
    process.env.PAYWALL_URL,
    'main window',
    'Data iframe'
  )
  const {
    postMessage: checkoutUIPostOffice,
    addHandler: addCheckoutMessageHandler,
  } = mainWindowPostOffice(
    window,
    checkoutIframe,
    process.env.PAYWALL_URL,
    'main window',
    'Checkout UI'
  )

  const {
    postMessage: accountUIPostOffice,
    addHandler: addAccountMessageHandler,
  } = mainWindowPostOffice(
    window,
    accountIframe,
    process.env.UNLOCK_APP_URL,
    'main window',
    'Account UI'
  )

  const addHandler = (
    forIframe: IframeNames,
    type: string,
    handler: PostMessageListener
  ) => {
    switch (forIframe) {
      case 'data':
        return addDataMessageHandler(type, handler)
      case 'account':
        return addAccountMessageHandler(type, handler)
      case 'checkout':
        return addCheckoutMessageHandler(type, handler)
    }
  }

  const send = (
    to: IframeNames,
    type: MessageTypes,
    payload: ExtractPayload<MessageTypes>
  ) => {
    switch (to) {
      case 'data':
        return dataPostOffice(type, payload)
      case 'account':
        return accountUIPostOffice(type, payload)
      case 'checkout':
        return checkoutUIPostOffice(type, payload)
    }
  }
  const createHandler = (
    forIframe: IframeNames,
    type: string,
    handlerTemplate: MessageHandlerTemplate<MessageTypes>
  ) => {
    const listener = handlerTemplate(
      send,
      dataIframe,
      checkoutIframe,
      accountIframe
    )
    addHandler(forIframe, type, listener)
  }

  return (
    forIframe: IframeNames,
    handlers: MessageHandlerTemplates<MessageTypes>
  ) => {
    const keys = Object.keys(handlers) as Array<keyof typeof handlers>
    keys.forEach(type => {
      const handler = handlers[type]
      handler && createHandler(forIframe, type, handler)
    })
  }
}
