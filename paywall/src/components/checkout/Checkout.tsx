import styled from 'styled-components'
import React from 'react'
import { RoundedLogo } from '../interface/Logo'

import { Locks, PaywallConfig, Account } from '../../unlockTypes' // eslint-disable-line no-unused-vars
import CheckoutLock from './CheckoutLock'
import LoadingLock from '../lock/LoadingLock'

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

  const callToActionParagraphs = config.callToAction.default
    .split('\n')
    .map((paragraph, index) => {
      // eslint-disable-next-line react/no-array-index-key
      return <p key={index}>{paragraph}</p>
    })

  return (
    <React.Fragment>
      <Header>
        <Title>{config.icon && <Logo src={config.icon} />}</Title>
        {callToActionParagraphs}
      </Header>
      <CheckoutLocks>
        {lockAddresses.length == 0 && <LoadingLock />}
        {// the key is lower-cased. The lock address is checksummed, and so case sensitive. This change ensures we map locks to their configuration names
        lockAddresses.map(lockAddress => {
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
        })}
      </CheckoutLocks>
      <Footer>
        <RoundedLogo />
        Powered by Unlock
      </Footer>
    </React.Fragment>
  )
}

export default Checkout

const Header = styled.header`
  display: grid;

  p {
    font-size: 20px;
    margin: 5px;
  }
`

const Title = styled.h1`
  font-size: 40px;
  font-weight: 200;
  vertical-align: middle;
`

const Logo = styled.img`
  height: 30px;
`

const Footer = styled.footer`
  margin-top: 50px;
  font-size: 12px;
  text-align: center;

  div {
    margin: 8px;
    vertical-align: middle;
    display: inline-block;
    width: 20px;
    height: 20px;
  }
`

const CheckoutLocks = styled.ul`
  display: grid;
  list-style: none;
  margin: 0px;
  padding: 0px;
  justify-content: space-around;
  grid-template-columns: repeat(auto-fit, minmax(186px, 200px));
`
