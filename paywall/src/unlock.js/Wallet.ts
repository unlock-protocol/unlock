import { Web3Window, web3MethodCall, ConfigWindow } from '../windowTypes'
import { PostMessages } from '../messageTypes'
import IframeHandler from './IframeHandler'
import { PaywallConfig } from '../unlockTypes'

const NO_WEB3 = 'no web3 wallet'

export default class Wallet {
  private readonly iframes: IframeHandler
  private readonly window: Web3Window & ConfigWindow
  private readonly hasWallet: boolean = true
  private readonly isMetamask: boolean
  private readonly config: PaywallConfig
  private hasWeb3: boolean = false
  private useUserAccounts: boolean = false

  private userAccountAddress: string | null = null
  private userAccountNetwork: number = 1

  constructor(
    window: Web3Window & ConfigWindow,
    iframes: IframeHandler,
    config: PaywallConfig
  ) {
    this.window = window
    this.iframes = iframes
    this.config = config

    // do we have a web3 wallet?
    this.hasWallet = !!(this.window.web3 && this.window.web3.currentProvider)
    this.isMetamask = !!(
      window.web3 &&
      window.web3.currentProvider &&
      window.web3.currentProvider.isMetamask
    )
    this.useUserAccounts =
      !this.hasWallet &&
      !!(
        this.window.unlockProtocolConfig &&
        (this.window.unlockProtocolConfig.useUnlockUserAccounts === true ||
          this.window.unlockProtocolConfig.useUnlockUserAccounts === 'true')
      )
  }

  init() {
    if (!this.hasWallet) {
      this.setupUserAccounts()
      this.iframes.accounts.createIframe()
      // now that we are loaded, handle the passing of data back and forth between the account UI and the data iframe
      this.iframes.setupAccountUIHandler(this.config)
    }
    this.setupWallet()
  }

  usingUserAccounts() {
    return this.useUserAccounts
  }

  setupUserAccounts() {
    this.iframes.accounts.on(PostMessages.UPDATE_ACCOUNT, account => {
      this.userAccountAddress = account
    })
    this.iframes.accounts.on(PostMessages.UPDATE_NETWORK, network => {
      this.userAccountNetwork = network
    })
  }

  enable() {
    return new this.window.Promise((resolve, reject) => {
      if (!this.hasWallet) {
        return resolve(NO_WEB3)
      }
      if (
        !this.window.web3 ||
        !this.window.web3.currentProvider ||
        !this.window.web3.currentProvider.enable
      )
        return resolve()
      this.window.web3.currentProvider
        .enable()
        .then(() => {
          return resolve()
        })
        .catch((e: any) => {
          reject(e)
        })
    })
  }

  setupWallet() {
    if (this.hasWallet) {
      this.setupWeb3Wallet()
    } else {
      this.setupUserAccountsWallet()
    }

    this.iframes.checkout.on(PostMessages.PURCHASE_KEY, async request => {
      if (this.usingUserAccounts()) {
        this.iframes.accounts.postMessage(PostMessages.PURCHASE_KEY, request)
      } else {
        this.iframes.data.postMessage(PostMessages.PURCHASE_KEY, request)
      }
    })
  }

  setupWeb3Wallet() {
    this.iframes.data.on(PostMessages.READY_WEB3, async () => {
      // initialize, we do this once the iframe is ready to receive information on the wallet
      // we need to tell the iframe if the wallet is metamask
      // TODO: pass the name of the wallet if we know it? (secondary importance right now, so omitting)
      try {
        const result = await this.enable()
        if (result === NO_WEB3) {
          this.iframes.data.postMessage(PostMessages.WALLET_INFO, {
            noWallet: true,
            notEnabled: false,
            isMetamask: false,
          })
          return
        }
        this.hasWeb3 = true
        this.iframes.data.postMessage(PostMessages.WALLET_INFO, {
          noWallet: false,
          notEnabled: false,
          isMetamask: this.isMetamask, // this is used for some decisions in signing
        })
      } catch (e) {
        this.hasWeb3 = true
        this.iframes.data.postMessage(PostMessages.WALLET_INFO, {
          noWallet: false,
          notEnabled: true, // user declined to enable the wallet
          isMetamask: false,
        })
        return
      }
    })

    // use sendAsync if available, otherwise we will use send
    const send =
      this.window.web3 &&
      this.window.web3.currentProvider &&
      (this.window.web3.currentProvider.sendAsync ||
        this.window.web3.currentProvider.send)

    this.iframes.data.on(PostMessages.WEB3, payload => {
      // handler for the actual web3 calls
      if (!this.hasWeb3) {
        this.iframes.data.postMessage(PostMessages.WEB3, {
          id: payload.id,
          jsonrpc: '2.0',
          error: 'No web3 wallet is available',
        })
        return
      }

      const { method, params, id }: web3MethodCall = payload

      // we use call to bind the call to the current provider
      send &&
        send.call(
          this.window.web3 && this.window.web3.currentProvider,
          {
            method,
            params,
            jsonrpc: '2.0',
            id,
          },
          (error: string | null, result: any) => {
            this.iframes.data.postMessage(
              PostMessages.WEB3_RESULT,
              error
                ? {
                    id,
                    error,
                    jsonrpc: '2.0',
                  }
                : {
                    id,
                    result,
                    jsonrpc: '2.0',
                  }
            )
          }
        )
    })
  }

  setupUserAccountsWallet() {
    this.iframes.accounts.on(PostMessages.READY, () => {
      this.iframes.accounts.postMessage(PostMessages.SEND_UPDATES, 'account')
      this.iframes.accounts.postMessage(PostMessages.SEND_UPDATES, 'balance')
      this.iframes.accounts.postMessage(PostMessages.SEND_UPDATES, 'network')
    })
    this.iframes.data.on(PostMessages.WEB3, payload => {
      const { method, id }: web3MethodCall = payload
      switch (method) {
        case 'eth_accounts':
          this.iframes.data.postMessage(PostMessages.WEB3_RESULT, {
            id,
            jsonrpc: '2.0',
            result: {
              id,
              jsonrpc: '2.0',
              // if account is null, we have no account, so return []
              result: this.userAccountAddress ? [this.userAccountAddress] : [],
            },
          })
          break
        case 'net_version':
          this.iframes.data.postMessage(PostMessages.WEB3_RESULT, {
            id,
            jsonrpc: '2.0',
            result: { id, jsonrpc: '2.0', result: this.userAccountNetwork },
          })
          break
        default:
          this.iframes.data.postMessage(PostMessages.WEB3_RESULT, {
            id,
            jsonrpc: '2.0',
            error: `"${method}" is not supported`,
          })
      }
    })
  }
}
