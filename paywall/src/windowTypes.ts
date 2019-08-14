import { PaywallConfig } from './unlockTypes'

// window sub-types

export interface EventDocument {
  createEvent: (type: string) => CustomEvent
}

export interface IframeManagingDocument {
  createElement: (type: 'iframe') => IframeType // should only create iframes
  querySelector: (selector: string) => any
  body: {
    insertAdjacentElement: (where: 'afterbegin', iframe: IframeType) => void
    style: {
      overflow: string
    }
  }
}

export interface FullDocument extends EventDocument, IframeManagingDocument {}

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
  document: EventDocument
  dispatchEvent: (event: CustomEvent) => void
}

export enum EventTypes {
  STORAGE = 'storage',
  MESSAGE = 'message',
  UNLOCK = 'unlockProtocol',
}

export interface MappedEvents {
  [EventTypes.STORAGE]: StorageEvent
  [EventTypes.MESSAGE]: MessageEvent
  [EventTypes.UNLOCK]: UnlockProtocolEvent
}

export type ExtractEvent<T extends EventTypes> = MappedEvents[T]
export type EventHandler<T extends EventTypes> = (
  event: MappedEvents[T]
) => void

export type AddEventListenerFunc = <T extends EventTypes>(
  type: T,
  handler: EventHandler<T>
) => void
// used anywhere cache is used
export type StorageEventTypes = 'storage'
export type StorageHandler = (event: StorageEvent) => void
export interface LocalStorageWindow {
  localStorage: Storage
  addEventListener: AddEventListenerFunc
}

// used in web3Proxy.ts
export interface Web3WalletInfo {
  noWallet: boolean
  notEnabled: boolean
  isMetamask: boolean
}
export interface web3MethodCall {
  method: string
  params: any[]
  jsonrpc: '2.0'
  id: number
}

interface web3MethodErrorResult {
  id: number
  error: string
  jsonrpc: '2.0'
}

interface web3MethodSuccessResult {
  id: number
  jsonrpc: '2.0'
  result: {
    id: number
    jsonrpc: '2.0'
    result: any
  }
}

export type web3MethodResult = web3MethodErrorResult | web3MethodSuccessResult
export type web3Callback = (error: string | null, result: any) => void
export type web3Send = (
  methodCall: web3MethodCall,
  callback: web3Callback
) => void

export interface Web3Window extends PostOfficeWindow {
  Promise: PromiseConstructor
  web3?: {
    currentProvider: {
      sendAsync?: web3Send
      send?: web3Send
      isMetamask?: true // is only ever true or undefined
      enable?: () => Promise<void>
    }
  }
}
// this is the same as Web3Window, but marks web3 as required instead of optional
export type CryptoWalletWindow = Required<Web3Window>

// a provider that defines sendAsync may define send
export interface SendAsyncProvider {
  sendAsync: web3Send
  send?: web3Send
  isMetamask?: true // is only ever true or undefined
  enable?: () => Promise<void>
}

// some providers do not define sendAsync
export interface SendProvider {
  send: web3Send
  isMetamask?: true // is only ever true or undefined
  enable?: () => Promise<void>
}
// used in utils/postOffice.ts
export interface MessageEvent {
  source: any
  origin: string
  data: any
}

// used in Mailbox.ts
export interface StorageEvent {
  key: string
  oldValue: string | null
  newValue: string | null
  storageArea: any
}

export type LockStatus = 'locked' | 'unlocked' | undefined

// used in setupUnlockProtocolVariable
export interface UnlockProtocolEvent {
  detail: LockStatus
}

export type MessageHandler = (event: MessageEvent) => void

export type PostOfficeEventTypes = 'message' // augment later if needed
export interface PostOfficeWindow {
  addEventListener: AddEventListenerFunc
}

type WindowConsole = Pick<Window, 'console'>['console']
export interface ConsoleWindow {
  console: Pick<WindowConsole, 'log' | 'error'>
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

// the attributes we expect will be modified by setAttribute
export type IframeAttributeNames = 'src' | 'name'
export interface IframeType {
  contentWindow: PostMessageTarget
  className: string
  name?: string
  src: string
  setAttribute: (attr: IframeAttributeNames, value: string) => void
}

// used in unlock.js/iframeManager.ts
export interface IframeManagingWindow {
  document: IframeManagingDocument
  setInterval: (cb: Function, interval?: number) => number
}

// used in unlock.js/startup.ts and setupPostOffices.ts

export interface UnlockProtocolObject {
  loadCheckoutModal: () => void
  getState: () => LockStatus
}

export interface UnlockProtocolWindow {
  unlockProtocol: UnlockProtocolObject
  addEventListener: AddEventListenerFunc
}

export interface OriginWindow extends Pick<Window, 'origin'> {}

export interface ConfigWindow {
  unlockProtocolConfig?: PaywallConfig
}
export interface UnlockAndIframeManagerWindow
  extends IframeManagingWindow,
    UnlockProtocolWindow {}

export interface UnlockWindowNoProtocolYet
  extends PostOfficeWindow,
    EventWindow,
    LocalStorageWindow,
    IframeManagingWindow,
    Web3Window,
    OriginWindow,
    ConfigWindow {
  document: FullDocument
  addEventListener: AddEventListenerFunc
}

export interface UnlockWindow
  extends PostOfficeWindow,
    EventWindow,
    UnlockProtocolWindow,
    LocalStorageWindow,
    IframeManagingWindow,
    Web3Window,
    OriginWindow,
    ConfigWindow {
  document: FullDocument
}
