import {
  Web3Window,
  web3MethodCall,
  CryptoWalletWindow,
  SendAsyncProvider,
  SendProvider,
} from '../windowTypes'
import { unlockNetworks } from '../data-iframe/blockchainHandler/blockChainTypes'
import { PostMessages } from '../messageTypes'
import IframeHandler from './IframeHandler'
import { PaywallConfig } from '../unlockTypes'
import StartupConstants from './startupTypes'
import {
  enableCryptoWallet,
  setupUserAccounts,
  setupUserAccountsProxyWallet,
} from './postMessageHub'

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
  useUserAccounts: boolean = false

  private userAccountAddress: string | null = null
  private userAccountNetwork: unlockNetworks
  private debug: boolean

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
    this.debug = !!constants.debug

    // do we have a web3 wallet?
    this.hasWallet = !!(this.window.web3 && this.window.web3.currentProvider)
    this.isMetamask = !!(
      this.hasWallet &&
      (window as CryptoWalletWindow).web3.currentProvider.isMetamask
    )
    // user accounts are used in 2 conditions:
    // 1. there is no crypto wallet present
    // 2. the paywall configuration explicitly asks for them
    this.useUserAccounts =
      !this.hasWallet &&
      (config.unlockUserAccounts === true ||
        config.unlockUserAccounts === 'true')
    if (this.debug) {
      if (this.useUserAccounts) {
        // eslint-disable-next-line
        console.log('[USER ACCOUNTS] using user accounts')
      } else {
        // eslint-disable-next-line
        console.log('[USER ACCOUNTS] using native crypto wallet')
      }
    }
  }

  setUserAccountAddress = (address: string | null) => {
    this.userAccountAddress = address
  }

  setUserAccountNetwork = (network: unlockNetworks) => {
    this.userAccountNetwork = network
  }

  getUserAccountAddress = () => {
    return this.userAccountAddress
  }

  getUserAccountNetwork = () => {
    return this.userAccountNetwork
  }

  setHasWeb3 = (value: boolean) => {
    this.hasWeb3 = value
  }

  init() {
    if (this.useUserAccounts) {
      // create the preconditions for using user accounts
      setupUserAccounts({
        iframes: this.iframes,
        config: this.config,
        setUserAccountAddress: this.setUserAccountAddress,
        setUserAccountNetwork: this.setUserAccountNetwork,
      })
    }
    // set up the proxy wallet
    if (this.useUserAccounts && !this.hasWallet) {
      // if user accounts are explicitly enabled, we use them
      // but only if there is no crypto wallet
      setupUserAccountsProxyWallet({
        iframes: this.iframes,
        setHasWeb3: this.setHasWeb3,
        getUserAccountAddress: this.getUserAccountAddress,
        getUserAccountNetwork: this.getUserAccountNetwork,
      })

      // We should also tell the checkout iframe that we are in a user account context
      const { checkout } = this.iframes
      checkout.once(PostMessages.READY, () => {
        checkout.postMessage(PostMessages.USING_MANAGED_ACCOUNT, undefined)
      })
    } else {
      // if we have a wallet, we always use it
      // if we have no wallet, and no use accounts, we use the web3 proxy wallet
      this.setupWeb3ProxyWallet()
    }
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

    // The next code is the main window side of Web3ProxyProvider, which is used in the data iframe
    // READY_WEB3 is sent when the Web3ProxyProvider is ready to go, and is used to determine the wallet type
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
      // at this point, we have a wallet, the only question is whether it is enabled
      this.hasWeb3 = true
      try {
        // first, enable the wallet if necessary
        await enableCryptoWallet(this.window, this.iframes)
      } catch (e) {
        // user declined to enable the crypto wallet
        // they still have a wallet, but we need to re-enable it to use it
        this.iframes.data.postMessage(PostMessages.WALLET_INFO, {
          noWallet: false,
          notEnabled: true, // user declined to enable the wallet
          isMetamask: this.isMetamask, // this is used for some decisions in signing
        })
        return
      }
      this.iframes.data.postMessage(PostMessages.WALLET_INFO, {
        noWallet: false,
        notEnabled: false,
        isMetamask: this.isMetamask, // this is used for some decisions in signing
      })
    })

    // WEB3 is used to send requests from the Web3ProxyProvider to the crypto wallet,
    // and to return the values. The crypto wallet uses the web3 interface, so
    // we will call its RPC handler and pass in a callback to send the result back
    // to the Web3ProxyProvider
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
      // to communicate with the crypto wallet,
      // use sendAsync if available, otherwise we will use send
      const web3 = (this.window as CryptoWalletWindow).web3.currentProvider
      const send =
        (web3 as SendAsyncProvider).sendAsync || (web3 as SendProvider).send

      // we use call to bind the web3 call to the crypto wallet's web3 provider
      send.call(
        web3,
        {
          method,
          params,
          jsonrpc: '2.0',
          id,
        },
        (error: string | null, result?: any) => {
          // this callback is called by the crypto wallet
          // with the result of the web3 call, we pass
          // it back to the Web3ProxyProvider
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
}
