import { EventEmitter } from 'events'
import {
  iframePostOffice,
  IframePostOfficeWindow,
  PostOffice,
} from '../utils/postOffice'
import { PostMessages } from '../messageTypes'
import { isValidLocks, isAccount } from '../utils/validators'

export enum PostOfficeEvents {
  LockUpdate = 'update.locks',
  KeyPurchase = 'purchase.key.request',
  Error = 'error',
  Locked = 'locked',
  Unlocked = 'unlocked',
}

export class PostOfficeService extends EventEmitter {
  private postOffice: PostOffice
  private account: string | null = null
  private network: number

  constructor(window: IframePostOfficeWindow, network: number) {
    super()
    this.postOffice = iframePostOffice(window, 'Account UI')
    this.setupHandlers()
    this.network = network
    // alert the unlock.min.js script that we are ready
    this.postOffice.postMessage(PostMessages.READY, undefined)
  }

  private setupHandlers() {
    // when the data iframe requests the current user account
    // or the current network, we respond with the unlock
    // account public key, and the required network
    this.postOffice.addHandler(PostMessages.SEND_UPDATES, updateType => {
      if (updateType === 'account') {
        this.sendAccount()
      }
      if (updateType === 'network') {
        this.sendNetwork()
      }
    })
    this.postOffice.addHandler(PostMessages.UPDATE_LOCKS, locks => {
      if (!isValidLocks(locks)) {
        this.emit(PostOfficeEvents.Error, 'invalid locks')
      } else {
        this.emit(PostOfficeEvents.LockUpdate, locks)
      }
    })
    this.postOffice.addHandler(
      PostMessages.PURCHASE_KEY,
      ({ lock, extraTip }) => {
        if (!isAccount(lock)) {
          this.emit(
            PostOfficeEvents.Error,
            'invalid lock, cannot purchase a key'
          )
        } else {
          this.emit(PostOfficeEvents.KeyPurchase, lock, extraTip)
        }
      }
    )
    this.postOffice.addHandler(PostMessages.LOCKED, () => {
      this.emit(PostOfficeEvents.Locked)
    })
    this.postOffice.addHandler(PostMessages.UNLOCKED, () => {
      this.emit(PostOfficeEvents.Unlocked)
    })
  }

  private sendAccount() {
    this.postOffice.postMessage(PostMessages.UPDATE_ACCOUNT, this.account)
  }

  private sendNetwork() {
    this.postOffice.postMessage(PostMessages.UPDATE_NETWORK, this.network)
  }

  setAccount(account: string | null) {
    this.account = account
    this.sendAccount()
    if (account === null) {
      // if we don't have an account, initiate a show request
      // if there is no crypto wallet, and at least one ERC-20 lock,
      // we will show the user accounts iframe
      this.showAccountModal()
    }
  }

  hideAccountModal() {
    this.postOffice.postMessage(PostMessages.HIDE_ACCOUNTS_MODAL, undefined)
  }

  /**
   * show the account modal
   */
  showAccountModal() {
    this.postOffice.postMessage(PostMessages.SHOW_ACCOUNTS_MODAL, undefined)
  }

  /**
   * Inform the data UI that a transaction has been initiated
   *
   * This will trigger a fetch of transactions to monitor from locksmith
   */
  transactionInitiated() {
    this.postOffice.postMessage(PostMessages.INITIATED_TRANSACTION, undefined)
  }
}
