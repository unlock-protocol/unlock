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
import { HoverFooter, NotHoverFooter } from './HoverFooters'
import BalanceProvider from '../helpers/BalanceProvider'

const ConfirmedKeyLock = ({ lock, hideModal }) => (
  <LockWrapper>
    <LockHeader>{lock.name}</LockHeader>
    <Body>
      <BalanceProvider
        amount={lock.keyPrice}
        render={(ethPrice, fiatPrice) => (
          <>
            <LockDetails>
              <LockDetail bold>{ethPrice} ETH</LockDetail>
              <LockDetail>${fiatPrice}</LockDetail>
            </LockDetails>
          </>
        )}
      />
      <ConfirmedKey hideModal={hideModal} size="50px" />
      <NotHoverFooter backgroundColor="var(--green)">
        Payment Confirmed
      </NotHoverFooter>
      <HoverFooter backgroundColor="var(--green)">Go to Content</HoverFooter>
    </Body>
  </LockWrapper>
)

ConfirmedKeyLock.propTypes = {
  hideModal: PropTypes.func.isRequired,
}

export default ConfirmedKeyLock

const Body = styled(LockBody)`
  border: 1px solid var(--green);
  padding-top: 0;
`
