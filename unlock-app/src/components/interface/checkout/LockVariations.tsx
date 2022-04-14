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

interface LockContainerProps {
  selectable?: boolean
}
export const LockContainer = styled.div<LockContainerProps>`
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
LockContainer.defaultProps = {
  selectable: true,
}

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

  span {
    font-size: 10px;
    color: var(--grey);
  }

  span:first-child {
    color: var(--darkgrey);
    font-weight: 600;
    font-size: 16px;
  }
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

export interface LoadingLockProps {
  address: string
  network: number
}

interface FullPriceProps {
  cardEnabled: boolean
  formattedKeyPrice: string
  convertedKeyPrice: string
}

const FullPrice = ({
  cardEnabled,
  formattedKeyPrice,
  convertedKeyPrice,
}: FullPriceProps) => {
  // If card is enabled, we show fiat price first
  if (cardEnabled && convertedKeyPrice) {
    return (
      <LockPrice>
        <span>{convertedKeyPrice}</span>
        <span>{formattedKeyPrice}</span>
      </LockPrice>
    )
  }
  return (
    <LockPrice>
      <span>{formattedKeyPrice}</span>
      <span>{convertedKeyPrice}</span>
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

export interface SoldOutLockProps {
  address: string
  name: string
  formattedKeyPrice: string
  convertedKeyPrice: string
  formattedDuration: string
  network: number
  cardEnabled: boolean
}

export const SoldOutLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  convertedKeyPrice,
  cardEnabled,
}: SoldOutLockProps) => {
  return (
    <DisabledLockContainer data-address={address} data-testid="SoldOutLock">
      <InfoWrapper>
        <LockName>{name}</LockName>
        <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
      </InfoWrapper>
      <DisabledLockBody>
        <FullPrice
          cardEnabled={cardEnabled}
          formattedKeyPrice={formattedKeyPrice}
          convertedKeyPrice={convertedKeyPrice}
        />
        <QuantityAndDuration>
          <SoldOut>Sold Out</SoldOut>
          {formattedDuration && <span>{formattedDuration}</span>}
        </QuantityAndDuration>
        <Cross />
      </DisabledLockBody>
    </DisabledLockContainer>
  )
}

export interface PurchaseableLockProps {
  address: string
  name: string
  formattedKeyPrice: string
  convertedKeyPrice: string
  formattedDuration: string
  formattedKeysAvailable: string
  onClick: () => void
  network: number
  selectable: boolean
  cardEnabled: boolean
  prepend: string
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
  cardEnabled,
  onClick,
  prepend,
}: PurchaseableLockProps) => {
  return (
    <LockContainer
      selectable={selectable}
      data-address={address}
      data-testid="PurchaseableLock"
    >
      <InfoWrapper>
        <LockName>
          {prepend}
          {name}
        </LockName>
        <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
      </InfoWrapper>
      <BaseLockBody onClick={onClick}>
        <FullPrice
          cardEnabled={cardEnabled}
          formattedKeyPrice={formattedKeyPrice}
          convertedKeyPrice={convertedKeyPrice}
        />
        <QuantityAndDuration>
          {formattedKeysAvailable !== 'Unlimited' && (
            <span>{formattedKeysAvailable} Left</span>
          )}
          {formattedDuration && <span>{formattedDuration}</span>}
        </QuantityAndDuration>
        <Cart />
        <Arrow />
      </BaseLockBody>
    </LockContainer>
  )
}

export interface ProcessingLockProps {
  address: string
  name: string
  formattedKeyPrice: string
  convertedKeyPrice: string
  formattedDuration: string
  formattedKeysAvailable: string
  network: number
  cardEnabled: boolean
  prepend: string
}

export const ProcessingLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  convertedKeyPrice,
  formattedKeysAvailable,
  cardEnabled,
  prepend,
}: ProcessingLockProps) => {
  return (
    <LockContainer data-address={address} data-testid="ProcessingLock">
      <InfoWrapper>
        <LockName>
          {prepend}
          {name}
        </LockName>
        <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
      </InfoWrapper>
      <BaseLockBody>
        <FullPrice
          cardEnabled={cardEnabled}
          formattedKeyPrice={formattedKeyPrice}
          convertedKeyPrice={convertedKeyPrice}
        />
        <QuantityAndDuration>
          {formattedKeysAvailable !== 'Unlimited' && (
            <span>{formattedKeysAvailable} Left</span>
          )}
          {formattedDuration && <span>{formattedDuration}</span>}
        </QuantityAndDuration>
        <Ellipsis />
      </BaseLockBody>
    </LockContainer>
  )
}

export interface ConfirmedLockLockProps {
  address: string
  name: string
  formattedKeyPrice: string
  convertedKeyPrice: string
  formattedDuration: string
  formattedKeysAvailable: string
  network: number
  selectable: boolean
  cardEnabled: boolean
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
  cardEnabled,
}: ConfirmedLockLockProps) => {
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
          cardEnabled={cardEnabled}
          formattedKeyPrice={formattedKeyPrice}
          convertedKeyPrice={convertedKeyPrice}
        />
        <QuantityAndDuration>
          {formattedKeysAvailable !== 'Unlimited' && (
            <span>{formattedKeysAvailable} Left</span>
          )}
          {formattedDuration && <span>{formattedDuration}</span>}
        </QuantityAndDuration>
        <Checkmark />
      </ConfirmedBody>
    </LockContainer>
  )
}
