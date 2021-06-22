import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import Icon from '../lock/Icon'
import AppStore from './lock/AppStore'
import CreditCardSettings from './lock/CreditCardSettings'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import CreatorLockForm from './CreatorLockForm'
import { NoPhone, Phone } from '../../theme/media'
import withConfig from '../../utils/withConfig'
import { useLock } from '../../hooks/useLock'
import Svg from '../interface/svg'

import {
  LockPanel,
  LockAddress,
  LockDivider,
  LockDuration,
  LockKeys,
  LockName,
  LockRow,
  DoubleHeightCell,
  BalanceContainer,
  LockWarning,
  LockDetails,
} from './LockStyles'
import { currencySymbol } from '../../utils/lock'
import { INFINITY } from '../../constants'

const BalanceOnLock = withConfig(({ lock, attribute, config }) => {
  const currency = currencySymbol(lock, config.ERC20Contract)
  return <Balance amount={lock[attribute]} currency={currency} />
})

BalanceOnLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  attribute: PropTypes.string.isRequired,
}

const LockKeysNumbers = ({ lock }) => (
  <LockKeys>
    {lock.outstandingKeys !== null &&
    lock.maxNumberOfKeys !== null &&
    typeof lock.outstandingKeys !== 'undefined' &&
    typeof lock.maxNumberOfKeys !== 'undefined'
      ? `${lock.outstandingKeys}/${
          lock.unlimitedKeys || lock.maxNumberOfKeys === -1
            ? INFINITY
            : lock.maxNumberOfKeys
        }`
      : ' - '}
  </LockKeys>
)

LockKeysNumbers.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export const CreatorLock = ({
  lock: lockFromProps,
  network,
  showIntegrations,
}) => {
  const { query } = useRouter()
  const [showDrawer, setShowDrawer] = useState(
    showIntegrations ? 'embed-coded' : ''
  )
  const [editing, setEditing] = useState(false)
  const { lock, updateKeyPrice, withdraw } = useLock(lockFromProps, network)

  useEffect(() => {
    if (query.stripe && lock.address == query.lock) {
      setShowDrawer('credit-card')
    }
  }, [query])

  const toggleDrawer = (state) => {
    if (state === showDrawer) {
      setShowDrawer('')
    } else {
      setShowDrawer(state)
    }
  }

  const updateLock = (newLock) => {
    updateKeyPrice(newLock.keyPrice, () => {
      setEditing(false)
    })
    // TODO: support other changes?
  }

  if (editing) {
    return (
      <CreatorLockForm
        lock={lock}
        hideAction={() => setEditing(false)}
        saveLock={updateLock}
      />
    )
  }

  // Some sanitization of strings to display
  const name = lock.name || 'New Lock'

  const lockVersion = lock.publicLockVersion || '1'

  const edit = () => {
    setShowDrawer('')
    setEditing(!editing)
  }

  // https://github.com/unlock-protocol/unlock/wiki/Lock-version-1.2-vulnerability
  return (
    <LockRow>
      {lockVersion === 5 && (
        <LockWarning>
          Your lock is vulnerable, please{' '}
          <a
            href="https://github.com/unlock-protocol/unlock/wiki/Lock-version-1.2-vulnerability"
            target="_blank"
            rel="noopener noreferrer"
          >
            read this important message
          </a>
          .
        </LockWarning>
      )}
      <LockDetails
        className="lock" // Used by integration tests
        data-address={`${lock.address}`}
        data-block={lock.creationBlock}
      >
        <DoubleHeightCell>
          <Icon lock={lock} />
        </DoubleHeightCell>
        <LockName>
          {name}
          <LockAddress address={!lock.pending && lock.address} />
        </LockName>
        <LockDuration>
          <Duration seconds={lock.expirationDuration} />
        </LockDuration>
        <LockKeysNumbers lock={lock} />
        <KeyPrice>
          <BalanceOnLock lock={lock} attribute="keyPrice" />
          <InlineButton type="button" onClick={() => edit(lock.address)}>
            <Svg.Edit name="Edit" />
          </InlineButton>
        </KeyPrice>
        <BalanceContainer>
          <NoPhone>
            <BalanceOnLock lock={lock} attribute="balance" />
          </NoPhone>
          <Phone>
            <BalanceOnLock lock={lock} attribute="balance" />
          </Phone>
        </BalanceContainer>
        <LockIconBar
          lock={lock}
          toggleCreditCard={() => toggleDrawer('credit-card')}
          toggleCode={() => toggleDrawer('embed-coded')}
          withdraw={withdraw}
        />
        {showDrawer === 'embed-coded' && (
          <LockPanel>
            <LockDivider />
            <AppStore lock={lock} />
          </LockPanel>
        )}
        {showDrawer === 'credit-card' && (
          <LockPanel>
            <LockDivider />
            <CreditCardSettings network={network} lock={lock} />
          </LockPanel>
        )}
      </LockDetails>
    </LockRow>
  )
}

const KeyPrice = styled.div`
  display: flex;
`

const InlineButton = styled.button`
  cursor: pointer;
  border: none;
  width: 20px;
  height: 20px;
  padding: 0px;
  background-color: transparent;
  > svg {
    fill: var(--darkgrey);
    &:hover {
      fill: var(--slate);
    }
  }
`

CreatorLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  network: PropTypes.number.isRequired,
  showIntegrations: PropTypes.bool,
}

CreatorLock.defaultProps = {
  showIntegrations: false,
}

export default CreatorLock
