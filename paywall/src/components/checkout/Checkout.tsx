import styled from 'styled-components'
import React from 'react'
import { RoundedLogo } from '../interface/Logo'

import { Locks, PaywallConfig, Account } from '../../unlockTypes' // eslint-disable-line no-unused-vars
import CheckoutLock from './CheckoutLock'

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

  return (
    <Wrapper>
      <Header>
        <Title>{config.icon && <Logo src={config.icon} />} Unlocked</Title>
        <p>{config.callToAction.default}</p>
      </Header>
      <CheckoutLocks>
        {Object.values(locks).map(lock => {
          if (lock) {
            return (
              <CheckoutLock
                key={lock.address} // React needs a `key` on each child
                lock={lock}
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
    </Wrapper>
  )
}

export default Checkout

const Wrapper = styled.section`
  max-width: 1000px;
  padding: 10px 40px;
  display: grid;
  background-color: var(--offwhite);
  color: var(--darkgrey);
`

const Header = styled.header`
  display: grid;

  p {
    font-size: 20px;
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
  display: flex;
  flex-wrap: wrap;
  grid-gap: 48px;
  list-style: none;
  margin: 0px;
  padding: 0px;
  justify-content: center;
  grid-template-columns: repeat(auto-fit, 186px);
`
