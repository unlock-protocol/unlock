import React from 'react'
import styled, { keyframes } from 'styled-components'
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

const Ellipsis = styled(Svg.LoadingDots)`
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

export const InsufficentBalanceOverlay = styled.div`
  height: 48px;
  width: 115px;
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
  width: 115px;
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

interface LockProps {
  name: string
  formattedKeyPrice: string
  formattedDuration: string
  formattedKeysAvailable: string
}

export const LoadingLock = () => {
  return (
    <LockContainer>
      <LoadingLockBody />
    </LockContainer>
  )
}

export const SoldOutLock = ({
  name,
  formattedDuration,
  formattedKeyPrice,
}: LockProps) => {
  return (
    <DisabledLockContainer>
      <InfoWrapper>
        <LockName>{name}</LockName>
        <SoldOut>Sold Out</SoldOut>
      </InfoWrapper>
      <DisabledLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <br />
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Arrow />
      </DisabledLockBody>
    </DisabledLockContainer>
  )
}

export const InsufficientBalanceLock = ({
  name,
  formattedDuration,
  formattedKeyPrice,
  formattedKeysAvailable,
}: LockProps) => {
  return (
    <DisabledLockContainer>
      <InfoWrapper>
        <LockName>{name}</LockName>
        <KeysAvailable>{formattedKeysAvailable} Available</KeysAvailable>
      </InfoWrapper>
      <DisabledLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <br />
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

export const DisabledLock = ({
  name,
  formattedDuration,
  formattedKeyPrice,
}: LockProps) => {
  return (
    <DisabledLockContainer>
      <InfoWrapper>
        <LockName>{name}</LockName>
      </InfoWrapper>
      <DisabledLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <br />
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Arrow />
      </DisabledLockBody>
    </DisabledLockContainer>
  )
}

export const PurchaseableLock = ({
  name,
  formattedDuration,
  formattedKeyPrice,
  formattedKeysAvailable,
}: LockProps) => {
  return (
    <LockContainer>
      <InfoWrapper>
        <LockName>{name}</LockName>
        <KeysAvailable>{formattedKeysAvailable} Available</KeysAvailable>
      </InfoWrapper>
      <BaseLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <br />
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Arrow />
      </BaseLockBody>
    </LockContainer>
  )
}

export const ProcessingLock = ({
  name,
  formattedDuration,
  formattedKeyPrice,
}: LockProps) => {
  return (
    <LockContainer>
      <InfoWrapper>
        <LockName>{name}</LockName>
        <Processing>Processing</Processing>
      </InfoWrapper>
      <BaseLockBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <br />
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Ellipsis />
      </BaseLockBody>
    </LockContainer>
  )
}

export const ConfirmedLock = ({
  name,
  formattedDuration,
  formattedKeyPrice,
  formattedKeysAvailable,
}: LockProps) => {
  return (
    <LockContainer>
      <InfoWrapper>
        <LockName>{name}</LockName>
        <KeysAvailable>{formattedKeysAvailable} Available</KeysAvailable>
      </InfoWrapper>
      <ConfirmedBody>
        <LockPrice>{formattedKeyPrice}</LockPrice>
        <ValidityDuration>
          <span>Valid for</span>
          <br />
          <span>{formattedDuration}</span>
        </ValidityDuration>
        <Checkmark />
      </ConfirmedBody>
    </LockContainer>
  )
}
