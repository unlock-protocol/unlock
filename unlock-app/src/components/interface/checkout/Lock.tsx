import React from 'react'
import styled from 'styled-components'
import Svg from '../svg'

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
  margin-left: 4px;
  text-align: center;
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
  name: string
  keysAvailable: string
  price: string
  symbol: string
  validityDuration: string
}

export const Lock = ({
  name,
  keysAvailable,
  price,
  symbol,
  validityDuration,
}: LockProps) => {
  return (
    <LockContainer>
      <InfoWrapper>
        <LockName>{name}</LockName>
        <KeysAvailable>{keysAvailable} Available</KeysAvailable>
      </InfoWrapper>
      <LockBody>
        <LockPrice>{price}</LockPrice>
        <TickerSymbol>{symbol}</TickerSymbol>
        <ValidityDuration>
          <span>Valid for</span>
          <br />
          <span>{validityDuration}</span>
        </ValidityDuration>
        <Arrow />
      </LockBody>
    </LockContainer>
  )
}
