import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import {
  LockWrapper,
  LockHeader,
  LockBody,
  LockFooter,
  ExpirationDuration,
} from './LockStyles'
import Duration from '../helpers/Duration'
import { UNLIMITED_KEYS_COUNT } from '../../constants'
import withConfig from '../../utils/withConfig'
import { currencySymbolForLock, isTooExpensiveForUser } from '../../utils/locks'

// WARNING: if you use any new fields of a lock here
// it *must* be added to validation in isValidLock
// src/utils/validators.js or it opens a potential
// security hole
export const NoKeyLock = ({
  account,
  lock,
  disabled,
  purchaseKey,
  lockKey,
  config,
}) => {
  const soldOut =
    lock.outstandingKeys >= lock.maxNumberOfKeys &&
    lock.maxNumberOfKeys !== UNLIMITED_KEYS_COUNT

  const tooExpensive = isTooExpensiveForUser(lock, account)

  // When the lock is not disabled for other reasons (pending key on
  // other lock...), we need to ensure that the lock is disabled
  // when the lock is sold out or too expensive for the current account
  const disableClick = disabled || tooExpensive || soldOut

  let footerMessage = 'Purchase'
  if (soldOut) {
    footerMessage = 'Sold Out'
  } else if (tooExpensive) {
    footerMessage = 'Insufficient funds'
  }

  const currency = currencySymbolForLock(lock, config)

  return (
    <Wrapper
      lock={lock}
      disabled={disableClick}
      onClick={() => {
        !disableClick && purchaseKey(lockKey)
      }}
    >
      <LockHeader>{lock.name}</LockHeader>
      <Body disabled={disableClick}>
        <EthPrice>
          {lock.keyPrice} {currency}
        </EthPrice>
        <div>
          <ExpirationDuration>
            <Duration seconds={lock.expirationDuration} round />
          </ExpirationDuration>
        </div>
        <Footer disabled={disableClick}>{footerMessage}</Footer>
      </Body>
    </Wrapper>
  )
}

NoKeyLock.propTypes = {
  account: UnlockPropTypes.account,
  lock: UnlockPropTypes.lock.isRequired,
  purchaseKey: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  lockKey: UnlockPropTypes.key,
  config: UnlockPropTypes.configuration.isRequired,
}

NoKeyLock.defaultProps = {
  account: null,
  disabled: false,
  lockKey: null,
}

export default withConfig(NoKeyLock)

const Wrapper = styled(LockWrapper)`
  cursor: ${props => (props.disabled ? 'not-allowed ' : 'pointer')};
`

const Footer = styled(LockFooter)`
  background-color: ${props =>
    props.disabled ? 'var(--lightgrey)' : 'var(--green)'};
  color: ${props => (props.disabled ? 'var(--darkgrey)' : 'var(--white)')};
`

const Body = styled(LockBody)`
  padding-top: 13px;

  &:hover {
    border: ${props =>
      !props.disabled ? '1px solid var(--activegreen)' : null};
  }
  &:hover ${Footer} {
    background-color: ${props =>
      !props.disabled ? 'var(--activegreen)' : null};
  }
`

const EthPrice = styled.div.attrs({
  className: 'price',
})`
  font-size: 30px;
  color: var(--slate);
  font-weight: bold;
`
