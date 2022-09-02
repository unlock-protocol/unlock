/* eslint-disable react/prop-types */
import React from 'react'
import styled from 'styled-components'
import { Label } from './FormStyles'
import Svg from '../svg'

export const RecommendedWallets = () => {
  return (
    <>
      <WalletOption href="https://metamask.io" platform="desktop">
        <Svg.Metamask />
        Metamask
      </WalletOption>
      <WalletOption href="https://wallet.coinbase.com" platform="mobile">
        <Svg.CoinbaseWallet />
        Coinbase Wallet
      </WalletOption>
      <WalletOption href="https://www.opera.com/crypto" platform="mobile">
        <Svg.Opera />
        Opera
      </WalletOption>
    </>
  )
}

interface WalletOptionProps {
  href: string
  platform: 'mobile' | 'desktop'
}
const WalletOption: React.FunctionComponent<WalletOptionProps> = ({
  href,
  platform,
  children,
}) => {
  let labelText = 'Desktop Chrome & Firefox'
  if (platform === 'mobile') {
    labelText = 'Mobile iOS and Android'
  }
  return (
    <div className="w-full text-left">
      <Label>{labelText}</Label>
      <Link target="_blank" rel="noopener" href={href}>
        {children}
        <Arrow />
      </Link>
    </div>
  )
}

const Arrow = styled(Svg.Arrow)``

const Link = styled.a`
  height: 48px;
  width: 100%;
  display: grid;
  grid-template-columns: 48px 1fr 32px;
  align-items: center;
  padding: 8px;
  background: var(--white);
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  border: thin var(--white) solid;
  border-radius: 4px;
  margin-bottom: 16px;
  color: var(--darkgrey);
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;

  & > svg {
    width: 32px;
  }

  &:hover {
    border: thin var(--blue) solid;
  }

  &:hover ${Arrow} {
    fill: var(--blue);
  }

  &:visited {
    color: var(--darkgrey);
  }
`
