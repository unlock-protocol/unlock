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
  NetworkNames,
  PaywallConfig,
  UserMetadata,
} from '../../unlockTypes'

import { PostMessages } from '../../messageTypes'

import useConfig from '../../hooks/utils/useConfig'
import { WrongNetwork } from '../creator/FatalError'
import Greyout from '../helpers/Greyout'
import useListenForPostMessage from '../../hooks/browser/useListenForPostMessage'
import CheckoutConfirmingModal from '../checkout/CheckoutConfirmingModal'

interface WrapperProps {
  allowClose: boolean
  config: PaywallConfig
}

/* eslint-disable react/prop-types */
export const Wrapper: React.FunctionComponent<WrapperProps> = ({
  allowClose,
  config,
  children,
}) => {
  const { postMessage } = usePostMessage('Checkout UI')

  const hideCheckout = useCallback(() => {
    postMessage({
      type: PostMessages.DISMISS_CHECKOUT,
      payload: undefined, // this must be set to trigger a response in unlock.min.js
    })
  }, [postMessage])

  return (
    <Greyout onClick={allowClose ? hideCheckout : () => {}}>
      <CheckoutWrapper
        hideCheckout={hideCheckout}
        bgColor="var(--offwhite)"
        allowClose={allowClose}
        onClick={e => {
          e.stopPropagation()
        }}
        icon={config.icon}
      >
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        {children}
      </CheckoutWrapper>
    </Greyout>
  )
}

/**
 * This is the data handler for the Checkout component
 */
export default function CheckoutContent() {
  const window = useWindow()

  // This is the ONLY place where usePaywallConfig should be
  // called. Calling it anywhere else will introduce loops that break the
  // app.
  const paywallConfig = usePaywallConfig()
  const { account, network, locks, checkWallet } = useBlockchainData(
    window,
    paywallConfig
  )

  const { requiredNetworkId } = useConfig()
  const [showWalletCheckOverlay, setShowWalletCheckOverlay] = useState(false)
  const [walletOverlayDismissed, setWalletOverlayDismissed] = useState(false)
  const dismissWalletOverlay = () => {
    setShowWalletCheckOverlay(false)
    setWalletOverlayDismissed(true)
  }

  const currentNetwork: string = (ETHEREUM_NETWORKS_NAMES as NetworkNames)[
    network
  ][0]
  // for sending purchase requests, hiding the checkout iframe
  const { postMessage } = usePostMessage('Checkout UI')
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
  const submitMetadata = (lockAddress: string, metadata: UserMetadata) => {
    postMessage({
      type: PostMessages.SET_USER_METADATA,
      payload: {
        lockAddress,
        metadata,
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
  const purchasingLocks = Object.keys(
    locks as Locks
  ).filter((lockAddress: string) =>
    ['submitted', 'pending', 'confirming'].includes(
      locks[lockAddress].key.status
    )
  )

  // One we have something in purchasingLocks, we can assume that the
  // user approved the transaction in their wallet and dismiss the wallet
  // check overlay.
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

  // We want to show the overlay only:
  // if checkWallet is true AND walletOverlayDismissed is false.
  // OR if we have showWalletCheckOverlay
  const shouldShowWalletOverlay =
    (showWalletCheckOverlay || (checkWallet && !walletOverlayDismissed)) &&
    !usingManagedAccount

  if (!account) {
    return (
      <Wrapper allowClose config={paywallConfig}>
        <NoWallet config={paywallConfig} />
      </Wrapper>
    )
  }

  if (requiredNetworkId !== network) {
    return (
      <Wrapper allowClose={allowClosingCheckout} config={paywallConfig}>
        <WrongNetwork
          currentNetwork={currentNetwork}
          requiredNetworkId={requiredNetworkId}
        />
      </Wrapper>
    )
  }
  if (shouldShowWalletOverlay) {
    return (
      <Greyout>
        <MessageBox>
          <p>Please check your browser&apos;s cryptocurrency wallet.</p>
          <Dismiss onClick={() => dismissWalletOverlay()}>Dismiss</Dismiss>
        </MessageBox>
      </Greyout>
    )
  }
  if (!userDismissedConfirmingModal && purchasingLocks.length) {
    // for users who just started a key purchase, display the confirming modal
    // unless they have dismissed it. Then we display the checkout component
    // we will use the first confirming lock in the list
    return (
      <Wrapper allowClose={allowClosingCheckout} config={paywallConfig}>
        <CheckoutConfirmingModal
          account={account}
          hideCheckout={hideConfirmingModal}
          confirmingLock={locks[purchasingLocks[0]]}
        />
      </Wrapper>
    )
  }
  // for everyone else, display the checkout component
  return (
    <Wrapper allowClose={allowClosingCheckout} config={paywallConfig}>
      <Checkout
        account={account}
        locks={locks}
        config={paywallConfig}
        purchase={purchaseKey}
        hideCheckout={hideCheckout}
        submitMetadata={submitMetadata}
      />
    </Wrapper>
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
