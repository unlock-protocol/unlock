import React from 'react'
import styled, { keyframes } from 'styled-components'
import { ETHEREUM_NETWORKS_NAMES } from '../../../constants'
import Svg from '../svg'

export const fadeInOut = keyframes`
  0%   { opacity: 1; }
  50%  { opacity: 0.6; }
  100% { opacity: 1; }
`

export const Arrow = styled(Svg.Arrow)`
  width: 32px;
  fill: var(--darkgrey);
  margin-left: auto;
  margin-right: 8px;
`

const Checkmark = styled(Svg.Checkmark)`
  width: 32px;
  fill: var(--white);
  margin-left: auto;
  margin-right: 8px;
  border-radius: 16px;
  background-color: var(--green);
`

export const Ellipsis = styled(Svg.LoadingDots)`
  width: 32px;
  margin-left: auto;
  margin-right: 8px;
`

export const BaseLockBody = styled.div`
  height: 48px;
  width: 100%;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px var(--white) solid;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  background-color: var(--white);
  cursor: pointer;
  &:hover {
    border: 1px solid var(--blue);
  }
  &:hover ${Arrow} {
    fill: var(--blue);
  }
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
  width: 240px;
  height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-top: 17px;
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

export const KeysAvailable = styled.span`
  font-size: 9px;
  color: var(--grey);
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
`

const SoldOut = styled(KeysAvailable)`
  color: var(--red);
`

const WrongNetwork = styled(NetworkName)`
  color: var(--red);
`

const Processing = styled(KeysAvailable)`
  color: var(--link);
`

export const InfoWrapper = styled.div`
  height: 24px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const LockPrice = styled.span`
  color: var(--darkgrey);
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  margin-left: 12px;
  text-align: right;
  width: 120px;
`

export const ValidityDuration = styled.div`
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
  justify-content: center;
  margin: 0 auto;
  & > span {
    width: 100%;
  }
`

export interface LockProps {
  address: string
  name: string
  formattedKeyPrice: string
  formattedDuration: string
  formattedKeysAvailable: string
  onClick?: () => void
  network: number
  walletNetwork?: number
}

export interface LoadingLockProps {
  address: string
  network: number
}

export const LoadingLock = ({ address, network }: LoadingLockProps) => {
  return (
    <LockContainer data-address={address} data-testid="LoadingLock">
      <LoadingLockBody />
      <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
    </LockContainer>
  )
}

export const WrongNetworkLock = ({
  walletNetwork,
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  formattedKeysAvailable,
}: LockProps) => {
  return (
    <DisabledLockContainer
      data-address={address}
      data-testid="WrongNetworkLock"
    >
      <InfoWrapper>
        <LockName>{name}</LockName>
        <KeysAvailable>{formattedKeysAvailable} Available</KeysAvailable>
      </InfoWrapper>
      <DisabledLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Arrow />
      </DisabledLockBody>
      <WrongNetwork>
        Connect your wallet to {ETHEREUM_NETWORKS_NAMES[network]}
      </WrongNetwork>
    </DisabledLockContainer>
  )
}
export const SoldOutLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
}: LockProps) => {
  return (
    <DisabledLockContainer data-address={address} data-testid="SoldOutLock">
      <InfoWrapper>
        <LockName>{name}</LockName>
        <SoldOut>Sold Out</SoldOut>
      </InfoWrapper>
      <DisabledLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Arrow />
      </DisabledLockBody>
      <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
    </DisabledLockContainer>
  )
}

export const InsufficientBalanceLock = ({
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  formattedKeysAvailable,
}: LockProps) => {
  return (
    <DisabledLockContainer
      data-address={address}
      data-testid="InsufficientBalanceLock"
    >
      <InfoWrapper>
        <LockName>{name}</LockName>
        <KeysAvailable>{formattedKeysAvailable} Available</KeysAvailable>
      </InfoWrapper>
      <DisabledLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Arrow />
      </DisabledLockBody>
      <InsufficentBalanceOverlay>
        Insufficient Balance
      </InsufficentBalanceOverlay>
    </DisabledLockContainer>
  )
}

export const CreditCardNotAvailableLock = ({
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  formattedKeysAvailable,
}: LockProps) => {
  return (
    <DisabledLockContainer
      data-address={address}
      data-testid="CreditCardNotAvailableLock"
    >
      <InfoWrapper>
        <LockName>{name}</LockName>
        <KeysAvailable>{formattedKeysAvailable} Available</KeysAvailable>
      </InfoWrapper>
      <DisabledLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Arrow />
      </DisabledLockBody>
      <InsufficentBalanceOverlay>
        Credit Card Not Available
      </InsufficentBalanceOverlay>
    </DisabledLockContainer>
  )
}

export const DisabledLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
}: LockProps) => {
  return (
    <DisabledLockContainer data-address={address} data-testid="DisabledLock">
      <InfoWrapper>
        <LockName>{name}</LockName>
      </InfoWrapper>
      <DisabledLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Arrow />
      </DisabledLockBody>
      <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
    </DisabledLockContainer>
  )
}

export const PurchaseableLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  formattedKeysAvailable,
  onClick,
}: LockProps) => {
  return (
    <LockContainer data-address={address} data-testid="PurchaseableLock">
      <InfoWrapper>
        <LockName>{name}</LockName>
        <KeysAvailable>{formattedKeysAvailable} Available</KeysAvailable>
      </InfoWrapper>
      <BaseLockBody onClick={onClick}>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Arrow />
      </BaseLockBody>
      <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
    </LockContainer>
  )
}

export const ProcessingLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
}: LockProps) => {
  return (
    <LockContainer data-address={address} data-testid="ProcessingLock">
      <InfoWrapper>
        <LockName>{name}</LockName>
        <Processing>Processing</Processing>
      </InfoWrapper>
      <BaseLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Ellipsis />
      </BaseLockBody>
      <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
    </LockContainer>
  )
}

export const ConfirmedLock = ({
  network,
  address,
  name,
  formattedDuration,
  formattedKeyPrice,
  formattedKeysAvailable,
}: LockProps) => {
  return (
    <LockContainer data-address={address} data-testid="ConfirmedLock">
      <InfoWrapper>
        <LockName>{name}</LockName>
        <KeysAvailable>{formattedKeysAvailable} Available</KeysAvailable>
      </InfoWrapper>
      <ConfirmedBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Checkmark />
      </ConfirmedBody>
      <NetworkName>{ETHEREUM_NETWORKS_NAMES[network]}</NetworkName>
    </LockContainer>
  )
}
