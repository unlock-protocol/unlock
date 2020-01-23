import styled from 'styled-components'
import React from 'react'

import {
  Locks,
  PaywallConfig,
  Account,
  Key,
  KeyStatus,
} from '../../unlockTypes' // eslint-disable-line no-unused-vars
import CheckoutLock from './CheckoutLock'
import LoadingLock from '../lock/LoadingLock'
import { getCallToAction } from '../../utils/callToAction'
import { getHighestStatus } from '../../utils/keys'

interface Props {
  locks: Locks
  config: PaywallConfig
  account: Account | null
  purchase: (...args: any[]) => any
  hideCheckout: (...args: any[]) => any
}

export const Checkout = ({
  locks,
  config,
  account,
  purchase,
  hideCheckout,
}: Props) => {
  const hasValidKey = Object.keys(locks).reduce(
    (isValid, address) => isValid || locks[address].key.status === 'valid',
    false
  )
  const lockAddresses: string[] = Object.keys(locks)

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
      // eslint-disable-next-line react/no-array-index-key
      return <p key={index}>{paragraph}</p>
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
          purchase={purchase}
          hideCheckout={hideCheckout}
        />
      )
    }
  })

  return (
    <>
      {callToActionParagraphs}
      <CheckoutLocks>
        {lockAddresses.length < Object.keys(config.locks).length && (
          <LoadingLock />
        )}
        {lockAddresses.length === Object.keys(config.locks).length &&
          checkoutLocks}
      </CheckoutLocks>
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
