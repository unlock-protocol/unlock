import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  LockWrapper,
  LockHeader,
  LockBody,
  LockDetails,
  LockDetail,
} from './LockStyles'
import ConfirmedKey from '../interface/buttons/overlay/ConfirmedKey'

const ConfirmedKeyLock = ({ hideModal }) => (
  <LockWrapper>
    <Header>Payment Confirmed</Header>
    <LockBody>
      <ConfirmedKey hideModal={hideModal} size="50px" />
      <LockDetails>
        <LockDetail>Go to Content</LockDetail>
      </LockDetails>
    </LockBody>
  </LockWrapper>
)

ConfirmedKeyLock.propTypes = {
  hideModal: PropTypes.func.isRequired,
}

export default ConfirmedKeyLock

const Header = styled(LockHeader)`
  background-color: var(--green);
  color: var(--offwhite);
`
