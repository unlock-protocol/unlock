import styled from 'styled-components'
import React from 'react'
import { WordMarkLogo } from '../interface/Logo'

import { PaywallConfig } from '../../unlockTypes'
import Media from '../../theme/media'
import Svg from '../interface/svg'

interface Props {
  config: PaywallConfig
}

export const NoWallet = ({ config }: Props) => {
  return (
    <>
      <Header>
        <Title>{config.icon && <Logo src={config.icon} />}</Title>
        <p>
          To buy a key you&apos;ll need to use a crypto-enabled browser that has
          a wallet. Here are a few options:
        </p>
      </Header>
      <WalletOptions>
        <WalletDescription
          href="https://metamask.io/"
          target="_blank"
          rel="noopener"
        >
          <span>Desktop Chrome &amp; Firefox</span>
          <div>
            <Metamask />
            <Caption>Metamask</Caption>
          </div>
        </WalletDescription>
        <WalletDescription
          href="https://wallet.coinbase.com/"
          target="_blank"
          rel="noopener"
        >
          <span>Mobile iOS &amp; Android</span>
          <div>
            <CoinbaseWallet />
            <Caption>Coinbase Wallet</Caption>
          </div>
        </WalletDescription>
        <WalletDescription
          href="https://play.google.com/store/apps/details?id=com.opera.browser"
          target="_blank"
          rel="noopener"
        >
          <span>Mobile Android</span>
          <div>
            <Opera />
            <Caption>Opera</Caption>
          </div>
        </WalletDescription>
      </WalletOptions>
      <Footer>
        <span>Powered by</span>
        <NoWalletWordMark alt="Unlock" />
      </Footer>
    </>
  )
}

export default NoWallet

const NoWalletWordMark = styled(WordMarkLogo)`
  width: 42px;
  margin-bottom: -1px;
  margin-left: 1px;
`

const Caption = styled.span``

const WalletDescription = styled.a`
  display: flex;
  flex-direction: column;
  height: 210px;

  & span {
    font-family: IBM Plex Sans;
    font-style: normal;
    font-weight: normal;
    font-size: 8px;
    line-height: 10px;
    text-align: center;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding-bottom: 8px;
    width: 160px;
  }
  & div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 160px;
    height: 192px;
    background-color: var(--white);
    border-radius: 4px;
    padding-bottom: 13px;
    & svg {
      padding-top: 20px;
    }
  }
  & div:hover {
    border: 1px solid var(--link);
  }
  & div ${Caption} {
    text-transform: none;
    font-family: IBM Plex Sans, sans serif;
    font-style: normal;
    font-weight: bold;
    font-size: 15px;
    letter-spacing: 0;
    color: var(--link);
  }
  ${Media.phone`
    padding-top: 24px;
    & div {
      padding-bottom: 0;
    }
  `}
`

const Metamask = styled(Svg.Metamask)`
  width: 120px;
`

const CoinbaseWallet = styled(Svg.CoinbaseWallet)`
  width: 120px;
`

const Opera = styled(Svg.Opera)`
  width: 120px;
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

const WalletOptions = styled.ul`
  display: grid;
  list-style: none;
  margin: 0px;
  padding: 0px;
  justify-content: space-around;
  grid-template-columns: repeat(auto-fit, 186px);
  padding-top: 24px;
  & a,
  & a:visited {
    color: var(--mediumgrey);
  }
`
