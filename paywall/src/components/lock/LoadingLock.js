import React from 'react'
import styled from 'styled-components'
import { LockWrapper, LockHeader, LockBody, LockFooter } from './LockStyles'

export const LoadingLock = () => {
  return (
    <LockWrapper>
      <LockHeader>Loading Locks...</LockHeader>
      <Body>
        <Footer />
      </Body>
    </LockWrapper>
  )
}

LoadingLock.propTypes = {}

export default LoadingLock

const Footer = styled(LockFooter)`
  background-color: var(--silver);
`

const Body = styled(LockBody)`
  grid-template-rows: none;
  align-items: flex-end;
  background-color: var(--lightgrey);
`
