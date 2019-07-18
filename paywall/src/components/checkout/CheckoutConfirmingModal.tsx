import styled from 'styled-components'
import React from 'react'
import { WordMarkLogo } from '../interface/Logo'

import { PaywallConfig, Lock, Account } from '../../unlockTypes'
import Media from '../../theme/media'
import CheckoutLock from './CheckoutLock'
import ActionButton from '../interface/buttons/ActionButton'
import { LockHeader, LockWrapper } from '../lock/LockStyles'

interface Props {
  config: PaywallConfig
  confirmingLock: Lock
  account: Account | null
  hideCheckout: (...args: any[]) => any
}

export const CheckoutConfirmingModal = ({
  config,
  confirmingLock,
  account,
  hideCheckout,
}: Props) => {
  const noTitleLock = {
    ...confirmingLock,
  }
  delete noTitleLock.name
  return (
    <React.Fragment>
      <Header>
        <Title>
          {config.icon && <Logo src={config.icon} />}
          <UnlockedText>Unlocked</UnlockedText>
        </Title>
        <h2>Thanks for your purchase!</h2>
      </Header>
      <Content>
        <CheckoutLock
          lock={noTitleLock}
          account={account}
          disabled
          purchase={() => {}}
          hideCheckout={hideCheckout}
        />
        <div>
          <p>
            Your transaction was sent and is currently being confirmed on the
            Ethereum blockchain. Please enjoy our content while it is
            confirming!
          </p>
          <Status>You&apos;ll see the status of your order on the left.</Status>
          <StartReading onClick={hideCheckout}>Start Reading</StartReading>
        </div>
      </Content>
      <Footer>
        <span>Powered by</span>
        <WordMark alt="Unlock" />
      </Footer>
    </React.Fragment>
  )
}

export default CheckoutConfirmingModal

const StartReading = styled(ActionButton)`
  width: 280px;
  height: 60px;
  ${Media.phone`
    width: 100%;
  `}
`

const WordMark = styled(WordMarkLogo)`
  width: 42px;
  margin-bottom: -1px;
  margin-left: 1px;
`

const UnlockedText = styled.span`
  padding-left: 10px;
  ${Media.phone`
    padding-left: 0;
  `}
`

const Status = styled.p`
  ${Media.phone`
  display: none;
`}
`

const Header = styled.header`
  display: grid;

  h2 {
    font-size: 40px;
    font-family: IBM Plex Sans;
    font-style: normal;
    font-weight: normal;
    margin: 0 0 16px;
  }

  ${Media.phone`
  h2 {
    display: none;
  }
  `}
`

const Title = styled.h1`
  font-size: 40px;
  font-weight: 200;
  vertical-align: middle;
  margin-bottom: 24px;
`

const Logo = styled.img`
  height: 30px;
`

const Footer = styled.footer`
  margin-top: 50px;
  font-size: 12px;
  text-align: center;

  span {
    padding-right: 1px;
  }
  div {
    margin: 8px;
    vertical-align: middle;
    display: inline-block;
    width: 20px;
    height: 20px;
  }
`

const Content = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: start;
  padding: 0;
  margin: 0;
  & ${LockWrapper} {
    grid-template-rows: 4px 140px;
  }
  & ${LockHeader} {
    height: 0;
  }
  & > div {
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0 0 0 24px;
    & > .lock {
      width: 20%;
    }
    & > p {
      margin-top: 0;
      font-size: 20px;
    }
  }
  ${Media.phone`
    flex-flow: column;
    place-items: center;
    & > div {
      padding: 16px 0 16px;
      & > p {
        margin: 0 10px 10px 10px;
        font-size: 16px;
      }
    }
  `}
`
