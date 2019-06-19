// window sub-types

// used in unlock.js/dispatchEvent.ts
export interface EventWindow {
  CustomEvent: {
    // this is copy/paste from the .d.ts for window, because it
    // declares CustomEvent as an interface and exports it, but
    // also as a global variable, and the global variable is not
    // also exported in the definition of window.
    // So, calling new window.CustomEvent() fails, but
    // new CustomEvent() succeeds.
    prototype: CustomEvent
    new <T>(typeArg: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T>
  }
  document: {
    createEvent: (type: string) => CustomEvent
  }
  dispatchEvent: (event: CustomEvent) => void
}

// used anywhere cache is used
export interface LocalStorageWindow {
  localStorage: Storage
}

// used in web3Proxy.ts
export interface web3MethodCall {
  method: string
  params: any[]
  jsonrpc: '2.0'
  id: number
}

export type web3Callback = (error: Error | string | null, result: any) => void
export type web3Send = (
  methodCall: web3MethodCall,
  callback: web3Callback
) => void

export interface Web3Window extends PostOfficeWindow {
  web3?: {
    currentProvider: {
      sendAsync?: web3Send
      send?: web3Send
      isMetamask: true | undefined
    }
  }
}

// used in utils/postOffice.ts
export interface MessageEvent {
  source: any
  origin: string
  data: any
}

export type MessageHandler = (event: MessageEvent) => void

export interface PostOfficeWindow {
  addEventListener: (type: 'message', handler: MessageHandler) => void
}

export interface IframePostOfficeWindow extends PostOfficeWindow {
  parent: PostMessageTarget
  location: {
    href: string
  }
}

export interface PostMessageTarget {
  postMessage: (data: any, origin: string) => void
}

export interface IframeType {
  contentWindow: PostMessageTarget
  className: string
  src: string
  setAttribute: (attr: 'src', value: string) => void
}

// used in unlock.js/iframeManager.ts
export interface IframeManagingWindow {
  document: {
    createElement: (type: 'iframe') => IframeType
    querySelector: (selector: string) => any
    body: {
      insertAdjacentElement: (where: 'afterbegin', iframe: IframeType) => void
      style: {
        overflow: string
      }
    }
  }
  setInterval: (cb: Function, interval?: number) => number
}

// used in unlock.js/startup.ts and setupPostOffices.ts

export interface UnlockProtocolObject {
  loadCheckoutModal: () => void
}

export interface UnlockProtocolWindow {
  unlockProtocol: UnlockProtocolObject
}

export interface UnlockWindow
  extends PostOfficeWindow,
    EventWindow,
    UnlockProtocolWindow,
    LocalStorageWindow {
  unlockProtocolConfig?: PaywallConfig
}
