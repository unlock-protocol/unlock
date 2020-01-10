import { Web3Window } from '../windowTypes'
import { unlockNetworks } from '../data-iframe/blockchainHandler/blockChainTypes'
import { PostMessages } from '../messageTypes'
import IframeHandler from './IframeHandler'
import { PaywallConfig } from '../unlockTypes'
import StartupConstants from './startupTypes'
import {
  setupUserAccounts,
  setupUserAccountsProxyWallet,
  setupWeb3ProxyWallet,
} from './postMessageHub'
import { WalletStatus } from '../utils/wallet'

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

  private readonly config: PaywallConfig

  private hasWeb3: boolean = false

  private userAccountAddress: string | null = null

  private userAccountNetwork: unlockNetworks

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

  getHasWeb3 = () => {
    return this.hasWeb3
  }

  init({ shouldUseUserAccounts, hasWallet, isMetamask }: WalletStatus) {
    if (shouldUseUserAccounts) {
      // create the preconditions for using user accounts
      setupUserAccounts({
        iframes: this.iframes,
        config: this.config,
        setUserAccountAddress: this.setUserAccountAddress,
        setUserAccountNetwork: this.setUserAccountNetwork,
      })
    }
    // set up the proxy wallet
    if (shouldUseUserAccounts && !hasWallet) {
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
      setupWeb3ProxyWallet({
        iframes: this.iframes,
        hasWallet,
        setHasWeb3: this.setHasWeb3,
        getHasWeb3: this.getHasWeb3,
        isMetamask,
        window: this.window,
      })
    }
  }
}
