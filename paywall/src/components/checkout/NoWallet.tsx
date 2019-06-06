import styled from 'styled-components'
import React from 'react'
import { RoundedLogo } from '../interface/Logo'

import { PaywallConfig } from '../../unlockTypes'
import Media from '../../theme/media'
import Svg from '../interface/svg'

interface Props {
  config: PaywallConfig
}

export const NoWallet = ({ config }: Props) => {
  return (
    <React.Fragment>
      <Header>
        <Title>
          {config.icon && <Logo src={config.icon} />}
          <UnlockedText>Unlocked</UnlockedText>
        </Title>
        <p>
          To enjoy Forbes Online without any ads you&apos;ll need to use a
          crypto-enabled browser that has a wallet. Here are a few options
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
          </div>
        </WalletDescription>
      </WalletOptions>
      <Footer>
        <RoundedLogo />
        Powered by Unlock
      </Footer>
    </React.Fragment>
  )
}

export default NoWallet

const WalletDescription = styled.a`
  display: flex;
  flex-direction: column;
  height: 210px;

  & span {
    color: var(--mediumgrey)
    font-family: IBM Plex Sans;
    font-style: normal;
    font-weight: normal;
    font-size: 8px;
    line-height: 10px;
    text-align: center;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding-bottom: 8px;
  }
  & div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 160px;
    height: 192px;
    background-color: var(--white);
    border-radius: 4px;
    & svg {
      padding-top: 20px;
    }
  }
  ${Media.phone`
    padding-top: 24px;
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

const UnlockedText = styled.span`
  padding-left: 10px;
  ${Media.phone`
    padding-left: 0;
  `}
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

const WalletOptions = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0px;
  padding: 0px;
  justify-content: space-around;
  grid-template-columns: repeat(auto-fit, 186px);
  padding-top: 24px;
`
