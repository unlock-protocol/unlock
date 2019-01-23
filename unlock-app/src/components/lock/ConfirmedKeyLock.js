import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  LockWrapper,
  LockHeader,
  LockBody,
  LockDetails,
  LockDetail,
  LockFooter,
} from './LockStyles'
import ConfirmedKey from '../interface/buttons/overlay/ConfirmedKey'

const ConfirmedKeyLock = ({ lock, hideModal }) => (
  <LockWrapper>
    <LockHeader>{lock.name}</LockHeader>
    <Body>
      <ConfirmedKey hideModal={hideModal} size="50px" />
      <LockDetails>
        <LockDetail>Go to Content</LockDetail>
      </LockDetails>
      <Footer>Payment Confirmed</Footer>
    </Body>
  </LockWrapper>
)

ConfirmedKeyLock.propTypes = {
  hideModal: PropTypes.func.isRequired,
}

export default ConfirmedKeyLock

const Footer = styled(LockFooter)`
  background-color: var(--green);
  color: var(--white);
`

const Body = styled(LockBody)`
  border: 1px solid var(--green);
`
