import styled from 'styled-components'
import React, { useState } from 'react'
import { Web3Window } from '../../windowTypes'

import {
  Locks,
  PaywallConfig,
  Account,
  Key,
  KeyStatus,
  UserMetadata,
} from '../../unlockTypes' // eslint-disable-line no-unused-vars
import CheckoutLock from './CheckoutLock'
import LoadingLock from '../lock/LoadingLock'
import { getCallToAction } from '../../utils/callToAction'
import { getHighestStatus } from '../../utils/keys'
import { MetadataForm } from '../interface/MetadataForm'
import useListenForPostMessage from '../../hooks/browser/useListenForPostMessage'
import { PostMessages } from '../../messageTypes'

interface Props {
  locks: Locks
  config: PaywallConfig
  account: Account | null
  purchase: (...args: any[]) => any
  submitMetadata: (lockAddress: string, metadata: UserMetadata) => void
  hideCheckout: (...args: any[]) => any
}

export const Checkout = ({
  locks,
  config,
  account,
  purchase,
  hideCheckout,
  submitMetadata,
}: Props) => {
  const hasValidKey = Object.keys(locks).reduce(
    (isValid, address) => isValid || locks[address].key.status === 'valid',
    false
  )
  const lockAddresses: string[] = Object.keys(locks)
  const metadataRequired = !!config.metadataInputs
  const [showingForm, setShowingForm] = useState(false)
  const [keyBeingPurchased, setKeyBeingPurchased] = useState<Key | undefined>(
    undefined
  )

  // This listener is used only for the side effect of purchasing a
  // key after metadata is submitted
  useListenForPostMessage({
    type: PostMessages.SET_USER_METADATA_SUCCESS,
    defaultValue: undefined,
    getValue: () => {
      // We have submitted the metadata successfully, continue to
      // purchase key
      setShowingForm(false)
      purchase(keyBeingPurchased)
    },
  })

  const onFormSubmit = (metadata: UserMetadata) => {
    submitMetadata(keyBeingPurchased!.lock, metadata)
  }

  const onPurchase = (key: Key) => {
    setKeyBeingPurchased(key)
    if (metadataRequired) {
      setShowingForm(true)
    } else {
      purchase(key)
    }
  }

  // Here we need to pick the right checkout message based on the keys!
  const lockKeys: Key[] = []
  lockAddresses.forEach(lockAddress => {
    const lock = locks[lockAddress]
    if (lock) {
      lockKeys.push(lock.key)
    }
  })

  const statuses = lockKeys.map(k => k.status as KeyStatus)
  const highestStatus = getHighestStatus(statuses)
  const callToAction = getCallToAction(config.callToAction, highestStatus)

  const callToActionParagraphs = callToAction
    .split('\n')
    .map((paragraph, index) => {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <CallToActionParagraph key={index}>{paragraph}</CallToActionParagraph>
      )
    })

  /* the key is lower-cased. The lock address is checksummed, and so
   * case sensitive. This change ensures we map locks to their
   * configuration names */
  const checkoutLocks = lockAddresses.map((lockAddress: string) => {
    const lock = locks[lockAddress]
    if (lock) {
      const lockWithName = {
        ...lock,
        name: config.locks[lockAddress].name || lock.name,
      }
      return (
        <CheckoutLock
          key={lockAddress} // React needs a `key` on each child
          lock={lockWithName}
          account={account}
          disabled={hasValidKey}
          purchase={onPurchase}
          hideCheckout={hideCheckout}
        />
      )
    }
  })

  return (
    <>
      {!showingForm && (
        <>
          {callToActionParagraphs}
          <CheckoutLocks>
            {lockAddresses.length < Object.keys(config.locks).length && (
              <LoadingLock />
            )}
            {lockAddresses.length === Object.keys(config.locks).length &&
              checkoutLocks}
          </CheckoutLocks>
          {config.unlockUserAccounts && !(window as Web3Window).web3 && (
            <NoWallet>
              Pay using your credit card (you will be asked to signup for an
              Unlock account), or using your Ethereum wallet, such as Metamask
              or Coinbase Wallet.
            </NoWallet>
          )}
        </>
      )}
      {showingForm && (
        <MetadataForm fields={config.metadataInputs!} onSubmit={onFormSubmit} />
      )}
    </>
  )
}

export default Checkout

const CheckoutLocks = styled.ul`
  display: grid;
  list-style: none;
  margin: 0px;
  padding: 0px;
  justify-content: center;
  justify-items: center;
  grid-template-columns: repeat(auto-fit, minmax(186px, 200px));
  grid-gap: 20px;
`

const CallToActionParagraph = styled.p`
  font-size: 20px;
  margin: 5px;
`

const NoWallet = styled.p`
  margin-top: 30px;
  font-size: 12px;
`
