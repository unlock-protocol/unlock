import { Web3Window, web3MethodCall } from '../windowTypes'
import { PostMessages } from '../messageTypes'
import IframeHandler from './IframeHandler'
import { PaywallConfig } from '../unlockTypes'
import StartupConstants from './startupTypes'

declare const process: {
  env: any
}

/**
 * This class handles everything relating to the web3 wallet, including key purchases
 *
 * It either sets up a proxy wallet to the user wallet,
 * or a proxy wallet for user accounts.
 * If user accounts will be used, it is explicitly
 * specified in the configuration, and a crypto
 * wallet is not present. In that situation,
 * the wallet will trigger a load of the
 * user accounts iframe and initialize it
 */
export default class Wallet {
  private readonly iframes: IframeHandler
  private readonly window: Web3Window
  private readonly hasWallet: boolean = true
  private readonly isMetamask: boolean
  private readonly config: PaywallConfig
  private hasWeb3: boolean = false
  private useUserAccounts: boolean = false

  private userAccountAddress: string | null = null
  private userAccountNetwork: number

  constructor(
    window: Web3Window,
    iframes: IframeHandler,
    config: PaywallConfig,
    constants: StartupConstants
  ) {
    this.window = window
    this.iframes = iframes
    this.config = config
    this.userAccountNetwork = constants.network

    // do we have a web3 wallet?
    this.hasWallet = !!(this.window.web3 && this.window.web3.currentProvider)
    this.isMetamask = !!(
      window.web3 &&
      window.web3.currentProvider &&
      window.web3.currentProvider.isMetamask
    )
    // user accounts are used in 2 conditions:
    // 1. there is no crypto wallet present
    // 2. the paywall configuration explicitly asks for them
    this.useUserAccounts =
      !this.hasWallet &&
      (config.unlockUserAccounts === true ||
        config.unlockUserAccounts === 'true')
    if (process.env.DEBUG) {
      if (this.useUserAccounts) {
        // eslint-disable-next-line
        console.log('[USER ACCOUNTS] using user accounts')
      } else {
        // eslint-disable-next-line
        console.log('[USER ACCOUNTS] using native crypto wallet')
      }
    }
  }

  init() {
    if (this.useUserAccounts) {
      // create the preconditions for using user accounts
      this.setupUserAccounts()
    }
    // set up the proxy wallet
    this.setupProxyWallet()
  }

  /**
   * This is called only if we can use user accounts
   */
  setupUserAccounts() {
    // listen for updates to state from the data iframe, and forward them to the checkout UI
    this.iframes.data.on(PostMessages.UPDATE_LOCKS, locks =>
      this.iframes.accounts.postMessage(PostMessages.UPDATE_LOCKS, locks)
    )

    // pass on the configuration and request the latest data
    this.iframes.accounts.on(PostMessages.READY, () => {
      this.iframes.accounts.postMessage(PostMessages.CONFIG, this.config)

      this.iframes.data.postMessage(PostMessages.SEND_UPDATES, 'locks')
    })

    // listen for account and network from the user accounts iframe
    this.iframes.accounts.on(PostMessages.UPDATE_ACCOUNT, account => {
      this.userAccountAddress = account
    })
    this.iframes.accounts.on(PostMessages.UPDATE_NETWORK, network => {
      this.userAccountNetwork = network
    })

    // when a purchase is in progress, tell the data iframe to retrieve the transaction
    this.iframes.accounts.on(PostMessages.INITIATED_TRANSACTION, () => {
      this.iframes.data.postMessage(
        PostMessages.INITIATED_TRANSACTION,
        undefined
      )
    })

    // then create the iframe and ready its post office
    this.iframes.accounts.createIframe()
  }

  setupProxyWallet() {
    if (this.useUserAccounts && !this.hasWallet) {
      // if user accounts are explicitly enabled, we use them
      // but only if there is no crypto wallet
      this.setupUserAccountsProxyWallet()
    } else {
      // if we have a wallet, we always use it
      // if we have no wallet, and no use accounts, we use the web3 proxy wallet
      this.setupWeb3ProxyWallet()
    }
  }

  async enableCryptoWallet() {
    if (
      !this.window.web3 ||
      !this.window.web3.currentProvider ||
      !this.window.web3.currentProvider.enable
    ) {
      return
    }
    await this.window.web3.currentProvider.enable()
  }

  /**
   * This is the proxy wallet for a crypto wallet
   *
   * It handles the "ready" event posted by the Web3ProxyProvider
   * in the data iframe, and also the "web3" event for
   * communicating with the crypto wallet
   */
  setupWeb3ProxyWallet() {
    // when receiving a key purchase request, we either pass it to the
    // account iframe for credit card purchase if user accounts are
    // explicitly enabled, or to the crypto wallet
    this.iframes.checkout.on(PostMessages.PURCHASE_KEY, async request => {
      this.iframes.data.postMessage(PostMessages.PURCHASE_KEY, request)
    })

    this.iframes.data.on(PostMessages.READY_WEB3, async () => {
      // initialize, we do this once the iframe is ready to receive information on the wallet
      // we need to tell the iframe if the wallet is metamask
      // TODO: pass the name of the wallet if we know it? (secondary importance right now, so omitting)
      if (!this.hasWallet) {
        // the user has no crypto wallet
        this.hasWeb3 = false
        this.iframes.data.postMessage(PostMessages.WALLET_INFO, {
          noWallet: true,
          notEnabled: false,
          isMetamask: false,
        })
        return
      }
      try {
        // first, enable the wallet if necessary
        await this.enableCryptoWallet()
      } catch (e) {
        // user declined to enable the crypto wallet
        // they still have a wallet, but we need to re-enable it to use it
        this.hasWeb3 = true
        this.iframes.data.postMessage(PostMessages.WALLET_INFO, {
          noWallet: false,
          notEnabled: true, // user declined to enable the wallet
          isMetamask: this.isMetamask, // this is used for some decisions in signing
        })
        return
      }
      this.hasWeb3 = true
      this.iframes.data.postMessage(PostMessages.WALLET_INFO, {
        noWallet: false,
        notEnabled: false,
        isMetamask: this.isMetamask, // this is used for some decisions in signing
      })
    })

    // to communicate with the crypto wallet,
    // use sendAsync if available, otherwise we will use send
    const send =
      this.window.web3 &&
      this.window.web3.currentProvider &&
      (this.window.web3.currentProvider.sendAsync ||
        this.window.web3.currentProvider.send)

    this.iframes.data.on(PostMessages.WEB3, payload => {
      // handler for the actual web3 calls
      if (!this.hasWeb3) {
        // error - no crypto wallet
        this.iframes.data.postMessage(PostMessages.WEB3_RESULT, {
          id: payload.id,
          jsonrpc: '2.0',
          error: 'No web3 wallet is available',
        })
        return
      }

      // the payload is validated inside DataIframeMessageEmitter
      const { method, params, id }: web3MethodCall = payload

      // we use call to bind the web3 call to the current provider
      send &&
        send.call(
          this.window.web3 && this.window.web3.currentProvider,
          {
            method,
            params,
            jsonrpc: '2.0',
            id,
          },
          (error: string | null, result?: any) => {
            // this callback is called by the crypto wallet
            // with the result of the web3 call, we pass
            // it to the data iframe as-is
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

  /**
   * This is the proxy wallet for user accounts
   *
   * When the account iframe is ready, we request the account and network
   * When the data iframe Web3ProxyProvider is ready, we tell it that we
   * have a fully enabled wallet.
   * Then, we respond to "eth_accounts" and "net_version" only, passing
   * in the current values
   */
  setupUserAccountsProxyWallet() {
    // when receiving a key purchase request, we either pass it to the
    // account iframe for credit card purchase if user accounts are
    // explicitly enabled, or to the crypto wallet
    this.iframes.checkout.on(PostMessages.PURCHASE_KEY, request => {
      this.iframes.accounts.postMessage(PostMessages.PURCHASE_KEY, request)
    })
    this.iframes.accounts.on(PostMessages.READY, () => {
      // once the accounts iframe is ready, request the current account and
      // default network
      this.iframes.accounts.postMessage(PostMessages.SEND_UPDATES, 'account')
      this.iframes.accounts.postMessage(PostMessages.SEND_UPDATES, 'network')
    })

    // enable the user account wallet
    this.hasWeb3 = true
    this.iframes.data.on(PostMessages.READY_WEB3, async () => {
      this.iframes.data.postMessage(PostMessages.WALLET_INFO, {
        noWallet: false,
        notEnabled: false,
        isMetamask: false,
      })
    })

    this.iframes.data.on(PostMessages.WEB3, payload => {
      const { method, id }: web3MethodCall = payload
      switch (method) {
        case 'eth_accounts':
          // if account is null, we have no account, so return []
          // userAccountAddress listening is in this.setupUserAccounts()
          this.postResult(
            id,
            this.userAccountAddress ? [this.userAccountAddress] : []
          )
          break
        case 'net_version':
          // userAccountNetwork listening is in this.setupUserAccounts()
          this.postResult(id, this.userAccountNetwork)
          break
        default:
          // this is a fail-safe, and will not happen unless there is a bug
          this.iframes.data.postMessage(PostMessages.WEB3_RESULT, {
            id,
            jsonrpc: '2.0',
            error: `"${method}" is not supported`,
          })
      }
    })
  }

  postResult(id: number, result: any) {
    this.iframes.data.postMessage(PostMessages.WEB3_RESULT, {
      id,
      jsonrpc: '2.0',
      result: {
        id,
        jsonrpc: '2.0',
        result,
      },
    })
  }
}
