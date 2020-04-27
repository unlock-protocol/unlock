import styled from 'styled-components'
import React from 'react'

import { PaywallConfig } from '../../unlockTypes'
import Media from '../../theme/media'
import Svg from '../interface/svg'

interface Props {
  config: PaywallConfig
}

export const NoWallet = ({ config }: Props) => {
  const callToAction =
    config.callToAction.noWallet ||
    'To buy a key you&apos;ll need to use a crypto-enabled browser that has a wallet. Here are a few options.'
  return (
    <>
      <p>{callToAction}</p>
      <WalletOptions>
        <WalletDescription
          href="https://metamask.io/"
          target="_blank"
          rel="noopener"
        >
          <Platform>
            Desktop
            <br />
            Chrome &amp; Firefox
          </Platform>
          <WalletOption>
            <Svg.Metamask />
            <Caption>Metamask</Caption>
          </WalletOption>
        </WalletDescription>

        <WalletDescription
          href="https://wallet.coinbase.com/"
          target="_blank"
          rel="noopener"
        >
          <Platform>
            Mobile
            <br />
            iOS &amp; Android
          </Platform>
          <WalletOption>
            <Svg.CoinbaseWallet />
            <Caption>Coinbase Wallet</Caption>
          </WalletOption>
        </WalletDescription>

        <WalletDescription
          href="https://www.opera.com/crypto"
          target="_blank"
          rel="noopener"
        >
          <Platform>
            Mobile
            <br />
            iOS &amp; Android
          </Platform>
          <WalletOption>
            <Svg.Opera />
            <Caption>Opera</Caption>
          </WalletOption>
        </WalletDescription>

        <WalletDescription
          href="https://trustwallet.com"
          target="_blank"
          rel="noopener"
        >
          <Platform>
            Mobile
            <br />
            iOS &amp; Android
          </Platform>
          <WalletOption>
            <Svg.TrustWallet />
            <Caption>Trust Wallet</Caption>
          </WalletOption>
        </WalletDescription>
      </WalletOptions>
    </>
  )
}

export default NoWallet

const Caption = styled.span`
  text-transform: none;
  font-family: IBM Plex Sans, sans serif;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  letter-spacing: 0;
  text-align: center;
  color: var(--link);
`

const WalletOption = styled.div`
  max-width: 130px;
  padding: 5px;
  border: 1px solid transparent;
  background-color: var(--white);
  border-radius: 4px;
  :hover {
    border: 1px solid var(--link);
  }

  > svg {
    width: 80px;
    margin: 20px;
  }
`

const Platform = styled.span`
  font-size: 1em;
  font-family: IBM Plex Sans;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding-bottom: 8px;
`

const WalletDescription = styled.a`
  display: grid;
  text-align: center;
  justify-items: center;

  ${Media.phone`
    padding-top: 24px;
    & div {
      padding-bottom: 0;
    }
  `}
`

const WalletOptions = styled.ul`
  display: grid;
  list-style: none;
  padding: 0px;
  justify-self: center;
  justify-content: center;
  justify-items: center;
  justify-items: center;
  grid-template-columns: repeat(auto-fit, minmax(180px, max-content));
  grid-gap: 10px;

  & a,
  & a:visited {
    color: var(--mediumgrey);
  }
`
