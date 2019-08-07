import { UnlockWindow } from '../windowTypes'
import IframeHandler from './IframeHandler'
import WalletHandler from './WalletHandler'
import MainWindowHandler from './MainWindowHandler'
import PurchaseHandler from './PurchaseHandler'

export function normalizeConfig(unlockConfig: any) {
  if (
    !unlockConfig ||
    !unlockConfig.locks ||
    typeof unlockConfig.locks !== 'object'
  )
    return unlockConfig
  const lockAddresses = Object.keys(unlockConfig.locks)
  if (!lockAddresses.length) {
    return unlockConfig
  }
  const normalizedConfig = {
    ...unlockConfig,
    locks: lockAddresses.reduce((allLocks, address) => {
      return {
        ...allLocks,
        [address.toLowerCase()]: unlockConfig.locks[address],
      }
    }, {}),
  }
  return normalizedConfig
}

export default function startup(window: UnlockWindow) {
  const config = normalizeConfig(window.unlockProtocolConfig)

  const origin = '?origin=' + encodeURIComponent(window.origin)
  const dataIframeUrl =
    process.env.PAYWALL_URL + '/static/data-iframe.1.0.html' + origin
  const checkoutIframeUrl = process.env.PAYWALL_URL + '/checkout' + origin
  const userIframeUrl = process.env.USER_IFRAME_URL + origin

  const iframes = new IframeHandler(
    window,
    dataIframeUrl,
    checkoutIframeUrl,
    userIframeUrl
  )
  iframes.init()

  const wallet = new WalletHandler(window, iframes)
  const mainWindow = new MainWindowHandler(window, iframes, config)
  const purchaseHandler = new PurchaseHandler(iframes, wallet)

  mainWindow.init()
  wallet.init()
  purchaseHandler.init()
}
