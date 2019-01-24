import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import { LockWrapper, LockHeader, LockBody, LockFooter } from './LockStyles'
import BalanceProvider from '../helpers/BalanceProvider'
import Duration from '../helpers/Duration'

export const NoKeyLock = ({
  lock,
  disabled,
  purchaseKey,
  lockKey,
  soldOut,
}) => (
  <Wrapper
    disabled={disabled}
    onClick={() => {
      !disabled && purchaseKey(lockKey)
    }}
  >
    <LockHeader>{lock.name}</LockHeader>
    <BalanceProvider
      amount={lock.keyPrice}
      render={(ethPrice, fiatPrice) => (
        <div>
          <Body>
            <EthPrice>{ethPrice} Eth</EthPrice>
            <div>
              <FiatPrice>${fiatPrice}</FiatPrice>
              <Separator> | </Separator>
              <ExpirationDuration>
                <Duration seconds={lock.expirationDuration} round />
              </ExpirationDuration>
            </div>
            <Footer>{soldOut ? 'Sold Out' : 'Purchase'}</Footer>
          </Body>
        </div>
      )}
    />
  </Wrapper>
)

NoKeyLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  purchaseKey: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  soldOut: PropTypes.bool,
  lockKey: UnlockPropTypes.key,
}

NoKeyLock.defaultProps = {
  disabled: false,
  lockKey: null,
  soldOut: false,
}

export default NoKeyLock

const Wrapper = styled(LockWrapper)`
  cursor: pointer;
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

const EthPrice = styled.div`
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
