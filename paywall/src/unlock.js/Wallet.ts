import { unlockNetworks } from 'src/data-iframe/blockchainHandler/blockChainTypes'
import {
  Web3Window,
  CryptoWalletWindow,
} from '../windowTypes'
import IframeHandler from './IframeHandler'
import { PaywallConfig } from '../unlockTypes'
import StartupConstants from './startupTypes'
import {
  setupUserAccounts,
  setupUserAccountsProxyWallet,
  setupWeb3ProxyWallet,
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

  userAccountAddress: string | null = null
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

  getUserAccountAddress = () => {
    return this.userAccountAddress
  }

  setUserAccountNetwork = (network: unlockNetworks) => {
    this.userAccountNetwork = network
  }

  getUserAccountNetwork = () => {
    return this.userAccountNetwork
  }

  setHasWeb3 = (value: boolean) => {
    this.hasWeb3 = value
  }

  getHasWeb3 = () => {
    return this.hasWeb3
  }

  init() {
    console.log({
      hasWallet: this.hasWallet
    })
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
      console.log('setting up account proxy wallet')
      setupUserAccountsProxyWallet({
        iframes: this.iframes,
        setHasWeb3: this.setHasWeb3,
        getUserAccountAddress: this.getUserAccountAddress,
        getUserAccountNetwork: this.getUserAccountNetwork,
      })
    } else {
      // if we have a wallet, we always use it
      // if we have no wallet, and no use accounts, we use the web3 proxy wallet
      setupWeb3ProxyWallet({
        iframes: this.iframes,
        getHasWeb3: this.getHasWeb3,
        setHasWeb3: this.setHasWeb3,
        isMetamask: this.isMetamask,
        hasWallet: this.hasWallet,
        window: this.window,
      })
    }
  }
}
