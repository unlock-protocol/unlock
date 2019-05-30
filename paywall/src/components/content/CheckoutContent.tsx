import React, { Fragment } from 'react'
import Head from 'next/head'

import { pageTitle, ETHEREUM_NETWORKS_NAMES } from '../../constants'
import Checkout from '../checkout/Checkout'
import useBlockchainData from '../../hooks/useBlockchainData'
import useWindow from '../../hooks/browser/useWindow'
import usePaywallConfig from '../../hooks/usePaywallConfig'
import usePostMessage from '../../hooks/browser/usePostMessage'
import { Key } from '../../unlockTypes'
import {
  POST_MESSAGE_PURCHASE_KEY,
  POST_MESSAGE_DISMISS_CHECKOUT,
} from '../../paywall-builder/constants'
import useConfig from '../../hooks/utils/useConfig'
import { WrongNetwork } from '../creator/FatalError'
import Greyout from '../helpers/Greyout'

interface networkNames {
  [key: number]: string[]
}
/**
 * This is the data handler for the Checkout component
 */
export default function CheckoutContent() {
  const window = useWindow()
  // the network this checkout expects to be on
  const { requiredNetworkId } = useConfig()
  // the paywall configuration passed as window.unlockProtocolConfig in the main window
  const paywallConfig = usePaywallConfig()
  // the blockchain data returned from the data iframe
  const { account, network, locks } = useBlockchainData(window, paywallConfig)
  const currentNetwork: string = (ETHEREUM_NETWORKS_NAMES as networkNames)[
    network
  ][0]
  // for sending purchase requests, hiding the checkout iframe
  const { postMessage } = usePostMessage()
  // purchase a key with this callback
  const purchaseKey = (key: Key) => {
    postMessage({
      type: POST_MESSAGE_PURCHASE_KEY,
      payload: {
        lock: key.lock,
        extraTip: '0',
      },
    })
  }
  // hide the checkout iframe
  const hideCheckout = () => {
    postMessage({
      type: POST_MESSAGE_DISMISS_CHECKOUT,
    })
  }

  let child: React.ReactNode

  if (requiredNetworkId !== network) {
    // display the "wrong network" error for users who are on an unexpected network
    child = (
      <Fragment>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <WrongNetwork
          currentNetwork={currentNetwork}
          requiredNetworkId={requiredNetworkId}
        />
      </Fragment>
    )
  } else {
    // for everyone else, display the checkout component
    child = (
      <Fragment>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <Checkout
          account={account}
          locks={locks}
          config={paywallConfig}
          purchase={purchaseKey}
          hideCheckout={hideCheckout}
        />
      </Fragment>
    )
  }

  return <Greyout>{child}</Greyout>
}
