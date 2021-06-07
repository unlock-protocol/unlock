import React from 'react'
import styled, { keyframes } from 'styled-components'
import { ETHEREUM_NETWORKS_NAMES } from '../../../constants'
import Svg from '../svg'
import Loading from '../Loading'

export const fadeInOut = keyframes`
  0%   { opacity: 1; }
  50%  { opacity: 0.6; }
  100% { opacity: 1; }
`

export const Cross = styled(Svg.Arrow)`
  width: 36px;
  fill: var(--darkgrey);
  margin-right: 8px;
`

export const Cart = styled(Svg.Cart)`
  width: 36px;
  fill: var(--grey);
  margin-right: 8px;
`

export const Arrow = styled(Svg.Arrow)`
  width: 36px;
  fill: var(--darkgrey);
  margin-right: 8px;
  display: none;
`

const Checkmark = styled(Svg.Checkmark)`
  width: 36px;
  fill: var(--white);
  margin-right: 8px;
  border-radius: 16px;
  background-color: var(--green);
`

export const Ellipsis = styled(Svg.LoadingDots)`
  width: 36px;
  margin-right: 8px;
`

export const BaseLockBody = styled.div`
  height: 48px;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px var(--white) solid;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  background-color: var(--white);
  justify-content: flex-end;
  flex-wrap: nowrap;
`

const NetworkName = styled.span`
  font-size: 9px;
  text-transform: uppercase;
  font-weight: light;
  color: var(--grey);
  text-align: center;
  padding-top: 5px;
`

export const InsufficentBalanceOverlay = styled.div`
  height: 48px;
  width: 120px;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  z-index: 1000;
  color: var(--red);
  font-size: 9px;
  position: absolute;
  justify-content: flex-end;
  margin-left: 12px;
  margin-bottom: 2px;
  white-space: nowrap;
`

export const LoadingLockBody = styled(BaseLockBody)`
  box-shadow: none;
  cursor: wait;
  justify-content: center;
  border: 1px var(--lightgrey) solid;
  animation: ${fadeInOut} 2s linear infinite;
  background-color: var(--lightgrey);
  &:hover {
    border: 1px solid var(--lightgrey);
  }
`

const DisabledLockBody = styled(BaseLockBody)`
  cursor: not-allowed;
  & ${Arrow} {
    visibility: hidden;
  }
  &:hover {
    border: 1px solid var(--white);
  }
`

const ConfirmedBody = styled(BaseLockBody)`
  &:hover {
    border: 1px solid var(--green);
  }
`

export const LockContainer = styled.div`
  width: 100%;
  height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-top: 17px;

  ${(props) => {
    if (props.selectable) {
      return `
        cursor: pointer;
        &:hover ${BaseLockBody} {
          border: 1px solid var(--blue);
        }
        &:hover ${Arrow} {
          display: block;
          fill: var(--blue);
        }
        &:hover ${Cart} {
          display: none;
        }

      `
    }
    return null
  }};
`

const DisabledLockContainer = styled(LockContainer)`
  opacity: 0.5;
`

export const LockName = styled.span`
  font-size: 13px;
  color: var(--grey);
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
`

const SoldOut = styled.span`
  color: var(--red);
  font-size: 9px;
  color: var(--grey);
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
`

const WrongNetwork = styled(NetworkName)`
  color: var(--red);
`

export const InfoWrapper = styled.div`
  height: 24px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const LockPrice = styled.div`
  display: flex;
  flex-direction: column;
  font-family: IBM Plex Sans;
  text-align: right;
  font-style: normal;
  width: 100%;
`

export const CryptoPrice = styled.span`
  font-weight: 600;
  font-size: 16px;
`

export const FiatPrice = styled.span`
  font-size: 10px;
  color: var(--grey);
`

export const QuantityAndDuration = styled.div`
  width: 92px;
  padding: 12px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 9px;
  line-height: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: right;
  height: 100%;
  justify-content: space-evenly;
  margin: 0 auto;
  color: var(--grey);
  & > span {
    width: 100%;
  }
`

export interface LockProps {
  address: string
  name: string
  formattedKeyPrice: string
  convertedKeyPrice: string
  formattedDuration: string
  formattedKeysAvailable: string
  onClick?: () => void
  network: number
  walletNetwork?: number
  selectable: boolean
}

export interface LoadingLockProps {
  address: string
  network: number
}

interface FullPriceProps {
  formattedKeyPrice: string
  convertedKeyPrice: string
}

const FullPrice = ({
  formattedKeyPrice,
  convertedKeyPrice,
}: FullPriceProps) => {
  return (
    <LockPrice>
      <CryptoPrice>{formattedKeyPrice}</CryptoPrice>
      <FiatPrice>{convertedKeyPrice}</FiatPrice>
    </LockPrice>
  )
}

export const LoadingLock = ({ address, network }: LoadingLockProps) => {
  return (
    <LockContainer data-address={address} data-testid="LoadingLock">
      <InfoWrapper>
        <LockName>&nbsp;</LockName>
        <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
      </InfoWrapper>

      <LoadingLockBody>
        <Loading size={24} />
      </LoadingLockBody>
    </LockContainer>
  )
}
export const SoldOutLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  convertedKeyPrice,
}: LockProps) => {
  return (
    <DisabledLockContainer data-address={address} data-testid="SoldOutLock">
      <InfoWrapper>
        <LockName>{name}</LockName>
        <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
      </InfoWrapper>
      <DisabledLockBody>
        <FullPrice
          formattedKeyPrice={formattedKeyPrice}
          convertedKeyPrice={convertedKeyPrice}
        />
        <QuantityAndDuration>
          <SoldOut>Sold Out</SoldOut>
          <span>{formattedDuration}</span>
        </QuantityAndDuration>
        <Cross />
      </DisabledLockBody>
    </DisabledLockContainer>
  )
}

export const PurchaseableLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  convertedKeyPrice,
  formattedKeysAvailable,
  selectable,
  onClick,
}: LockProps) => {
  return (
    <LockContainer
      selectable={selectable}
      data-address={address}
      data-testid="PurchaseableLock"
    >
      <InfoWrapper>
        <LockName>{name}</LockName>
        <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
      </InfoWrapper>
      <BaseLockBody onClick={onClick}>
        <FullPrice
          formattedKeyPrice={formattedKeyPrice}
          convertedKeyPrice={convertedKeyPrice}
        />
        <QuantityAndDuration>
          {formattedKeysAvailable !== 'Unlimited' && (
            <span>{formattedKeysAvailable} Left</span>
          )}
          <span>{formattedDuration}</span>
        </QuantityAndDuration>
        <Cart />
        <Arrow />
      </BaseLockBody>
    </LockContainer>
  )
}

export const ProcessingLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  convertedKeyPrice,
  formattedKeysAvailable,
}: LockProps) => {
  return (
    <LockContainer data-address={address} data-testid="ProcessingLock">
      <InfoWrapper>
        <LockName>{name}</LockName>
        <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
      </InfoWrapper>
      <BaseLockBody>
        <FullPrice
          formattedKeyPrice={formattedKeyPrice}
          convertedKeyPrice={convertedKeyPrice}
        />
        <QuantityAndDuration>
          {formattedKeysAvailable !== 'Unlimited' && (
            <span>{formattedKeysAvailable} Left</span>
          )}
          <span>{formattedDuration}</span>
        </QuantityAndDuration>
        <Ellipsis />
      </BaseLockBody>
    </LockContainer>
  )
}

export const ConfirmedLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  convertedKeyPrice,
  formattedKeysAvailable,
  selectable,
}: LockProps) => {
  return (
    <LockContainer
      selectable={selectable}
      data-address={address}
      data-testid="ConfirmedLock"
    >
      <InfoWrapper>
        <LockName>{name}</LockName>
        <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
      </InfoWrapper>
      <ConfirmedBody>
        <FullPrice
          formattedKeyPrice={formattedKeyPrice}
          convertedKeyPrice={convertedKeyPrice}
        />
        <QuantityAndDuration>
          {formattedKeysAvailable !== 'Unlimited' && (
            <span>{formattedKeysAvailable} Left</span>
          )}
          <span>{formattedDuration}</span>
        </QuantityAndDuration>
        <Checkmark />
      </ConfirmedBody>
    </LockContainer>
  )
}
