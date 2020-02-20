import React from 'react'
import styled, { keyframes, css } from 'styled-components'
import Svg from '../svg'
import { RawLock } from '../../../unlockTypes'
import { durationsAsTextFromSeconds } from '../../../utils/durations'
import { usePurchaseKey } from '../../../hooks/usePurchaseKey'

interface LockBodyProps {
  loading?: 'true'
}

export const lockBodyBackground = ({ loading }: LockBodyProps) => {
  const color = loading ? 'var(--lightgrey)' : 'var(--white)'
  return `background-color: ${color};`
}

export const lockBodyHover = ({ loading }: LockBodyProps) => {
  if (loading) {
    return ''
  }
  return `
    &:hover {
      border: 1px solid var(--blue);
    }
    &:hover ${Arrow} {
      fill: var(--blue);
    }
  `
}

export const lockBodyBorder = ({ loading }: LockBodyProps) => {
  const color = loading ? 'var(--lightgrey)' : 'var(--white)'
  return `border: 1px ${color} solid;`
}

export const lockBodyCursor = ({ loading }: LockBodyProps) => {
  const type = loading ? 'wait' : 'pointer'
  return `cursor: ${type};`
}

export const fadeInOut = keyframes`
  0%   { opacity: 1; }
  50%  { opacity: 0.6; }
  100% { opacity: 1; }
`

export const lockBodyOpacity = ({ loading }: LockBodyProps) => {
  if (!loading) {
    return ''
  }

  return css`
    animation: ${fadeInOut} 2s linear infinite;
  `
}

export const Arrow = styled(Svg.Arrow)`
  width: 32px;
  fill: var(--darkgrey);
  margin-left: auto;
  margin-right: 8px;
`

export const LockBody = styled.div`
  height: 48px;
  width: 100%;
  border-radius: 4px;
  ${(props: LockBodyProps) => lockBodyBorder(props)};
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: row;
  align-items: center;
  ${(props: LockBodyProps) => lockBodyBackground(props)};
  ${(props: LockBodyProps) => lockBodyHover(props)};
  ${(props: LockBodyProps) => lockBodyCursor(props)};
  ${(props: LockBodyProps) => lockBodyOpacity(props)};
`

export const LockContainer = styled.div`
  width: 240px;
  height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-top: 17px;
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

export const InfoWrapper = styled.div`
  height: 24px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const LockPrice = styled.span`
  color: var(--darkgrey);
  font-family: IBM Plex Mono;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  margin-left: 12px;
  text-align: right;
  width: 65px;
`

export const TickerSymbol = styled.span`
  color: var(--darkgrey);
  font-family: IBM Plex Mono;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  text-align: right;
  width: 42px;
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

export const LoadingLock = () => {
  return (
    <LockContainer>
      <LockBody loading="true" />
    </LockContainer>
  )
}

interface LockProps {
  lock: RawLock
}

const lockKeysAvailable = (lock: RawLock) => {
  if ((lock as any).unlimitedKeys) {
    return 'Unlimited'
  }

  // maxNumberOfKeys and outstandingKeys are assumed to be defined
  // if they are ever not, a runtime error can occur
  return (lock.maxNumberOfKeys! - lock.outstandingKeys!).toString()
}

export const Lock = ({ lock }: LockProps) => {
  const { purchaseKey } = usePurchaseKey(lock)
  return (
    <LockContainer>
      <InfoWrapper>
        <LockName>{lock.name}</LockName>
        <KeysAvailable>{lockKeysAvailable(lock)} Available</KeysAvailable>
      </InfoWrapper>
      <LockBody onClick={purchaseKey}>
        <LockPrice>{lock.keyPrice}</LockPrice>
        <TickerSymbol>{(lock as any).currencySymbol || 'ETH'}</TickerSymbol>
        <ValidityDuration>
          <span>Valid for</span>
          <br />
          <span>{durationsAsTextFromSeconds(lock.expirationDuration)}</span>
        </ValidityDuration>
        <Arrow />
      </LockBody>
    </LockContainer>
  )
}
