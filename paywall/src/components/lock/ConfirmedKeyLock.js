import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import {
  LockWrapper,
  LockHeader,
  LockBody,
  LockDetails,
  LockDetail,
} from './LockStyles'
import ConfirmedKey from '../interface/buttons/overlay/ConfirmedKey'
import { HoverFooter } from './HoverFooters'
import BalanceProvider from '../helpers/BalanceProvider'

const ConfirmedKeyLock = ({ lock, hideModal }) => {
  const [hover, setHover] = useState(false)
  return (
    <LockWrapper
      lock={lock}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={hideModal}
    >
      <LockHeader>{lock.name}</LockHeader>
      <Body>
        <BalanceProvider
          amount={lock.keyPrice}
          render={(ethPrice, fiatPrice) => (
            <React.Fragment>
              <LockDetails>
                <LockDetail bold>{ethPrice} ETH</LockDetail>
                <LockDetail>${fiatPrice}</LockDetail>
              </LockDetails>
            </React.Fragment>
          )}
        />
        <ConfirmedKey hideModal={hideModal} hover={hover} size="50px" />
        <HoverFooter backgroundColor="var(--green)">
          {hover ? 'Go to Content' : 'Purchase Confirmed'}
        </HoverFooter>
      </Body>
    </LockWrapper>
  )
}

ConfirmedKeyLock.propTypes = {
  hideModal: PropTypes.func.isRequired,
  lock: UnlockPropTypes.lock.isRequired,
}

export default ConfirmedKeyLock

const Body = styled(LockBody)`
  border: 1px solid var(--green);
`
