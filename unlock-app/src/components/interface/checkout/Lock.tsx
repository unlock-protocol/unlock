import React from 'react'
import styled from 'styled-components'

interface LockBodyProps {
  loading?: true
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
  `
}

export const LockBody = styled.div`
  height: 48px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid var(--white);
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: row;
  align-items: center;
  ${(props: LockBodyProps) => lockBodyBackground(props)};
  ${(props: LockBodyProps) => lockBodyHover(props)};
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
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  margin-left: 24px;
  text-align: right;
  width: 120px;
`

export const LoadingLock = () => {
  return (
    <LockContainer>
      <LockBody loading />
    </LockContainer>
  )
}

export const Lock = () => {
  return (
    <LockContainer>
      <InfoWrapper>
        <LockName>Corporate</LockName>
        <KeysAvailable>1,500</KeysAvailable>
      </InfoWrapper>
      <LockBody>
        <LockPrice>20.001 ETH</LockPrice>
      </LockBody>
    </LockContainer>
  )
}
