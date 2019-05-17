import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import { LockWrapper, LockHeader, LockBody, LockFooter } from './LockStyles'
import BalanceProvider from '../helpers/BalanceProvider'
import Duration from '../helpers/Duration'
import { UNLIMITED_KEYS_COUNT } from '../../constants'

export const NoKeyLock = ({
  account,
  lock,
  disabled,
  purchaseKey,
  lockKey,
}) => {
  const soldOut =
    lock.outstandingKeys >= lock.maxNumberOfKeys &&
    lock.maxNumberOfKeys !== UNLIMITED_KEYS_COUNT

  // When the lock is not disabled for other reasons (pending key on
  // other lock...), we need to ensure that the lock is disabled
  // when the lock is sold out or too expensive for the current account
  const tooExpensive =
    account && parseFloat(account.balance) <= parseFloat(lock.keyPrice)

  const disableClick = disabled || tooExpensive || soldOut

  let footerMessage = 'Purchase'
  if (soldOut) {
    footerMessage = 'Sold Out'
  } else if (tooExpensive) {
    footerMessage = 'Insufficient funds'
  }

  return (
    <Wrapper
      lock={lock}
      disabled={disableClick}
      onClick={() => {
        !disabled && purchaseKey(lockKey)
      }}
    >
      <LockHeader>{lock.name}</LockHeader>
      <BalanceProvider
        amount={lock.keyPrice}
        render={(ethPrice, fiatPrice) => (
          <div>
            <Body disabled={disabled}>
              <EthPrice>{ethPrice} Eth</EthPrice>
              <div>
                <FiatPrice>${fiatPrice}</FiatPrice>
                <Separator> | </Separator>
                <ExpirationDuration>
                  <Duration seconds={lock.expirationDuration} round />
                </ExpirationDuration>
              </div>
              <Footer>{footerMessage}</Footer>
            </Body>
          </div>
        )}
      />
    </Wrapper>
  )
}

NoKeyLock.propTypes = {
  account: UnlockPropTypes.account,
  lock: UnlockPropTypes.lock.isRequired,
  purchaseKey: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  lockKey: UnlockPropTypes.key,
}

NoKeyLock.defaultProps = {
  account: null,
  disabled: false,
  lockKey: null,
}

export default NoKeyLock

const Wrapper = styled(LockWrapper)`
  cursor: ${props => (props.disabled ? 'not-allowed ' : 'pointer')};
`

const Footer = styled(LockFooter)`
  background-color: var(--green);
  color: var(--white);
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
  text-transform: uppercase;
  color: var(--slate);
  font-weight: bold;
`

const FiatPrice = styled.span`
  font-size: 20px;
  font-weight: 300;
  color: var(--grey);
`

const ExpirationDuration = styled(FiatPrice)``

const Separator = styled.span`
  color: var(--lightgrey);
`
