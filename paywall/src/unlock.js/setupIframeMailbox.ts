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

/**
 * Set up all of the post offices for each iframe.
 *
 * Example:
 *
 * {
 *   [PostMessages.READY]: (send, _, checkout) => {
 *     return () => {
 *       send('data', PostMessages.SEND_UPDATES, 'network')
 *       send('data', PostMessages.SEND_UPDATES, 'account')
 *       send('data', PostMessages.SEND_UPDATES, 'locks')
 *       send('data', PostMessages.SEND_UPDATES, 'balance')
 *       if (window.unlockProtocolConfig.type === 'paywall') {
 *         showIframe(window, checkout)
 *       }
 *     }
 *   },
 *   [PostMessages.DISMISS_CHECKOUT]: () => {
 *      hideCheckoutModal()
 *   }
 * }
 *
 * @returns {Function} this function accepts a map of postMessage
 * types to handler templates (MessageHandlerTemplate)
 * defined above. This template will receive a postMessage sender
 * that can be used to send a message to any iframe. It also
 * receives all of the iframes so that they can be modified,
 * for example by showing or hiding the iframe.
 */
export default function setupIframeMailbox(
  window: PostOfficeWindow,
  checkoutIframe: IframeType,
  dataIframe: IframeType,
  accountIframe: IframeType
) {
  // first, create the post offices for each iframe
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

  // next, define the dispatcher for adding new postMessage handlers
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

  // next, define the dispatcher for sending postMessage messages
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

  // next, define the template handler that will be used to create the postMessage listeners
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

  // finally, return the mapper that will convert a map of postMessage types to handlers
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
