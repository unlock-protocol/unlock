import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import styled from 'styled-components'

import { pageTitle, ETHEREUM_NETWORKS_NAMES } from '../../constants'
import Checkout from '../checkout/Checkout'
import CheckoutWrapper from '../checkout/CheckoutWrapper'
import NoWallet from '../checkout/NoWallet'
import useBlockchainData from '../../hooks/useBlockchainData'
import useWindow from '../../hooks/browser/useWindow'
import usePaywallConfig from '../../hooks/usePaywallConfig'
import usePostMessage from '../../hooks/browser/usePostMessage'
import {
  Key,
  Locks,
  PaywallConfig,
  Account,
  Transactions,
} from '../../unlockTypes'

import { PostMessages } from '../../messageTypes'

import useConfig from '../../hooks/utils/useConfig'
import { WrongNetwork } from '../creator/FatalError'
import Greyout from '../helpers/Greyout'
import useListenForPostMessage from '../../hooks/browser/useListenForPostMessage'
import CheckoutConfirmingModal from '../checkout/CheckoutConfirmingModal'

interface networkNames {
  [key: number]: string[]
}

// TODO: move useBlockchainData to ts and remove these defs
interface blockchainData {
  account: Account | null
  network: number
  locks: Locks
  transactions: Transactions
}
type useBlockchainDataFunc = (
  window: any,
  paywallConfig: PaywallConfig
) => blockchainData

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
  const {
    account,
    network,
    locks,
  }: blockchainData = (useBlockchainData as useBlockchainDataFunc)(
    window,
    paywallConfig
  )

  const currentNetwork: string = (ETHEREUM_NETWORKS_NAMES as networkNames)[
    network
  ][0]
  // for sending purchase requests, hiding the checkout iframe
  const { postMessage } = usePostMessage('Checkout UI')
  const [showWalletCheckOverlay, setShowWalletCheckOverlay] = useState(false)
  const [userInitiatedPurchase, initiatePurchase] = useState(false)
  // purchase a key with this callback
  const purchaseKey = (key: Key) => {
    // record the fact that the purchase was initiated in this process
    // so that we will not automatically dismiss the Checkout UI
    initiatePurchase(true)

    // Until we receive confirmation that a transaction was initiated or rejected,
    // show the modal overlay reminding the user to check their wallet.
    // TODO: how does this perform with user accounts?
    setShowWalletCheckOverlay(true)
    postMessage({
      type: PostMessages.PURCHASE_KEY,
      payload: {
        lock: key.lock,
        extraTip: '0',
      },
    })
  }
  const isLocked = useListenForPostMessage({
    type: PostMessages.LOCKED,
    defaultValue: false,
    getValue: () => true,
  })
  const isUnlocked = useListenForPostMessage({
    type: PostMessages.UNLOCKED,
    defaultValue: false,
    getValue: (val: any) => !!val,
  })
  const usingManagedAccount = useListenForPostMessage({
    type: PostMessages.USING_MANAGED_ACCOUNT,
    defaultValue: false,
    getValue: () => true,
  })

  // This listener is used only for the side effect of closing the overlay when a purchase is rejected.
  useListenForPostMessage({
    type: PostMessages.ERROR,
    defaultValue: undefined,
    getValue: () => {
      // Purchase failed (likely because transaction was rejected in MetaMask),
      // remove the wallet check overlay.
      setShowWalletCheckOverlay(false)
    },
  })

  const locked = !isUnlocked && isLocked
  let allowClosingCheckout: boolean

  if (paywallConfig.persistentCheckout) {
    allowClosingCheckout = !locked
  } else {
    allowClosingCheckout = true
  }
  // hide the checkout iframe
  const hideCheckout = useCallback(() => {
    postMessage({
      type: PostMessages.DISMISS_CHECKOUT,
      payload: undefined, // this must be set to trigger a response in unlock.min.js
    })
  }, [postMessage])

  // get a list of locks with key purchases in progress
  const purchasingLocks = Object.keys(locks as Locks).filter(
    (lockAddress: string) =>
      ['submitted', 'pending', 'confirming'].includes(
        locks[lockAddress].key.status
      )
  )

  // One we have something in purchasingLocks, we can assume that the
  // user approved the transaction in their wallet and dismiss the wallet
  //check overlay.
  // TODO: handle rejected purchase?
  if (purchasingLocks.length && showWalletCheckOverlay) {
    setShowWalletCheckOverlay(false)
  }

  const [userDismissedConfirmingModal, dismissConfirmingModal] = useState(false)
  const hideConfirmingModal = useCallback(() => {
    hideCheckout()
    dismissConfirmingModal(true)
  }, [hideCheckout, dismissConfirmingModal])
  // get a list of locks that have valid keys
  const activeLocks = Object.keys(locks as Locks).filter(
    (lockAddress: string) => locks[lockAddress].key.status === 'valid'
  )
  useEffect(() => {
    if (activeLocks.length && !userInitiatedPurchase) {
      hideCheckout()
    }
  }, [activeLocks.length, hideCheckout, userInitiatedPurchase])

  let child: React.ReactNode
  let bgColor = 'var(--offwhite)'

  if (requiredNetworkId !== network) {
    bgColor = 'var(--lightgrey)'
    // display the "wrong network" error for users who are on an unexpected network
    child = (
      <>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <WrongNetwork
          currentNetwork={currentNetwork}
          requiredNetworkId={requiredNetworkId}
        />
      </>
    )
  } else if (!account) {
    child = (
      <>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <NoWallet config={paywallConfig} />
      </>
    )
  } else if (!userDismissedConfirmingModal && purchasingLocks.length) {
    // for users who just started a key purchase, display the confirming modal
    // unless they have dismissed it. Then we display the checkout component
    // we will use the first confirming lock in the list
    child = (
      <>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <CheckoutConfirmingModal
          config={paywallConfig}
          account={account}
          hideCheckout={hideConfirmingModal}
          confirmingLock={locks[purchasingLocks[0]]}
        />
      </>
    )
  } else {
    // for everyone else, display the checkout component
    child = (
      <>
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
      </>
    )
  }
  const Wrapper = () => (
    <CheckoutWrapper
      hideCheckout={hideCheckout}
      bgColor={bgColor}
      allowClose={allowClosingCheckout}
      onClick={e => {
        e.stopPropagation()
      }}
    >
      {child}
    </CheckoutWrapper>
  )

  // purchasingLocks is an array of locks for which a transaction has
  // been initiated. Once purchasingLocks is non-empty, we know that the
  // user's wallet is enabled and no longer need to show the overlay.
  // We should only show the wallet check overlay if there is a browser wallet.
  // It will not appear when using a managed user account.
  if (showWalletCheckOverlay && !usingManagedAccount) {
    return (
      <Greyout>
        <MessageBox>
          <p>Please check your browser wallet.</p>
          <Dismiss onClick={() => setShowWalletCheckOverlay(false)}>
            Dismiss
          </Dismiss>
        </MessageBox>
      </Greyout>
    )
  }
  return (
    <Greyout onClick={allowClosingCheckout ? hideCheckout : () => {}}>
      <Wrapper />
    </Greyout>
  )
}

const MessageBox = styled.div`
  background: var(--white);
  min-width: 50%;
  max-width: 98%;
  border-radius: 4px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--darkgrey);
  font-size: 20px;
`

const Dismiss = styled.button`
  height: 24px;
  font-size: 20px;
  font-family: Roboto, sans-serif;
  text-align: center;
  border: none;
  background: none;
  color: var(--grey);

  &:hover {
    color: var(--link);
  }
`
