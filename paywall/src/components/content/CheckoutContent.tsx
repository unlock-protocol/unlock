import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useReducer,
} from 'react'
import Head from 'next/head'

import { pageTitle, ETHEREUM_NETWORKS_NAMES } from '../../constants'
import Checkout from '../checkout/Checkout'
import CheckoutWrapper from '../checkout/CheckoutWrapper'
import NoWallet from '../checkout/NoWallet'
import useBlockchainData from '../../hooks/useBlockchainData'
import useWindow from '../../hooks/browser/useWindow'
import usePaywallConfig from '../../hooks/usePaywallConfig'
import usePostMessage from '../../hooks/browser/usePostMessage'
import { Key, Locks, PaywallConfig, Account } from '../../unlockTypes'
import useConfig from '../../hooks/utils/useConfig'
import { WrongNetwork } from '../creator/FatalError'
import Greyout from '../helpers/Greyout'
import useListenForPostMessage from '../../hooks/browser/useListenForPostMessage'
import CheckoutConfirmingModal from '../checkout/CheckoutConfirmingModal'
import CheckoutErrorModal from '../checkout/CheckoutError'
import { PostMessages } from '../../messageTypes'

interface networkNames {
  [key: number]: string[]
}

// TODO: move useBlockchainData to ts and remove these defs
interface blockchainData {
  account: Account | null
  network: number
  locks: Locks
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
  const [userInitiatedPurchase, initiatePurchase] = useState(false)
  // purchase a key with this callback
  const purchaseKey = (key: Key) => {
    // record the fact that the purchase was initiated in this process
    // so that we will not automatically dismiss the Checkout UI
    initiatePurchase(true)
    postMessage({
      type: PostMessages.PURCHASE_KEY,
      payload: {
        lock: key.lock,
        extraTip: '0',
      },
    })
  }

  enum actions {
    HIDE_MODAL = 'hide',
    SET_ERROR = 'error',
  }
  const [errorInfo, dispatchError] = useReducer(
    (
      state: { show: boolean; error: string },
      action: { type: actions; payload: string }
    ) => {
      switch (action.type) {
        case actions.SET_ERROR:
          return {
            show: true,
            error: action.payload as string,
          }
        case actions.HIDE_MODAL:
          return {
            show: false,
            error: '',
          }
      }
      return state
    },
    { show: false, error: '' }
  )
  const errorMessageFromDataIframe = useListenForPostMessage({
    type: PostMessages.ERROR,
    defaultValue: '',
    validator: (val: unknown) => typeof val === 'string',
    local: 'Checkout UI Error Handler',
  })
  useEffect(() => {
    if (errorMessageFromDataIframe) {
      dispatchError({
        type: actions.SET_ERROR,
        payload: errorMessageFromDataIframe,
      })
    }
  }, [actions.SET_ERROR, errorMessageFromDataIframe])
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
  const locked = !isUnlocked && isLocked
  let allowClosingCheckout: boolean
  if (paywallConfig.type === 'paywall') {
    // for the paywall, the checkout cannot be closed unless the user explicitly closes it
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
  } else if (!account) {
    child = (
      <Fragment>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <NoWallet config={paywallConfig} />
      </Fragment>
    )
  } else if (!userDismissedConfirmingModal && purchasingLocks.length) {
    // for users who just started a key purchase, display the confirming modal
    // unless they have dismissed it. Then we display the checkout component
    // we will use the first confirming lock in the list
    child = (
      <Fragment>
        <Head>
          <title>{pageTitle('Checkout')}</title>
        </Head>
        <CheckoutConfirmingModal
          config={paywallConfig}
          account={account}
          hideCheckout={hideConfirmingModal}
          confirmingLock={locks[purchasingLocks[0]]}
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

  const ErrorDialog = errorInfo.show ? (
    <CheckoutErrorModal
      message={errorInfo.error}
      dismiss={() => {
        dispatchError({ type: actions.HIDE_MODAL, payload: '' })
      }}
    />
  ) : null

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
      {ErrorDialog}
    </CheckoutWrapper>
  )

  return (
    <Greyout onClick={allowClosingCheckout ? hideCheckout : () => {}}>
      <Wrapper />
    </Greyout>
  )
}
