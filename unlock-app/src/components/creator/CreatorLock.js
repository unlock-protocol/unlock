import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import networks from '@unlock-protocol/networks'
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
  LockRow,
  LockName,
  DoubleHeightCell,
  BalanceContainer,
  LockWarning,
  LockDetails,
  LockLabelSmall,
} from './LockStyles'
import { currencySymbol } from '../../utils/lock'
import { INFINITY, MAX_UINT } from '../../constants'

const BalanceOnLock = withConfig(({ lock, attribute, config }) => {
  const currency = currencySymbol(lock, config.ERC20Contract)
  return <Balance amount={lock[attribute]} currency={currency} />
})

BalanceOnLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  attribute: PropTypes.string.isRequired,
}

const LockKeysNumbers = ({ lock, edit }) => (
  <LockKeys className="flex">
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
    <InlineButton type="button" onClick={() => edit(lock.address)}>
      <Svg.Edit name="Edit" />
    </InlineButton>
  </LockKeys>
)

LockKeysNumbers.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  edit: PropTypes.func.isRequired,
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
  const {
    lock,
    updateKeyPrice,
    updateMaxNumberOfKeys,
    withdraw,
    updateSelfAllowance,
  } = useLock(lockFromProps, network)

  const recurringPossible =
    lock.publicLockVersion >= 10 && lock.currencyContractAddress

  if (recurringPossible) {
    console.log(lock.address)
    console.log(lock.selfAllowance)
  }

  const [isRecurring, setIsRecurring] = useState(
    recurringPossible && lock.selfAllowance === MAX_UINT
  )

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
    if (newLock.keyPrice !== lock.keyPrice) {
      updateKeyPrice(newLock.keyPrice, () => {
        setEditing(false)
      })
    }

    if (newLock.maxNumberOfKeys !== lock.maxNumberOfKeys) {
      updateMaxNumberOfKeys(newLock.maxNumberOfKeys, () => {
        setEditing(false)
      })
    }

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

  const handleApproveRecurring = () => {
    updateSelfAllowance(MAX_UINT, () => {
      setIsRecurring(true)
    })
  }

  // Some sanitization of strings to display
  const name = lock.name || 'New Lock'
  const lockVersion = lock.publicLockVersion || '1'

  // check if lock is using a past/unsupported version of Unlock contract
  const isOutdated =
    networks[network] &&
    networks[network].previousDeploys &&
    networks[network].previousDeploys
      .map((d) => d.unlockAddress)
      .includes(lock.unlockContractAddress)

  const edit = () => {
    setShowDrawer('')
    setEditing(!editing)
  }

  // https://github.com/unlock-protocol/unlock/wiki/Lock-version-1.2-vulnerability
  return (
    <LockRow className="pb-2">
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
      {isOutdated && (
        <LockWarning>
          Your lock was deployed on an older Unlock contract, please{' '}
          <a
            href={`/clone?locks=${lock.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            clone it to use a new version of Unlock
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
          {lock && !lock.pending && (
            <div className="flex items-center gap-2 py-1 text-gray-400">
              <span className="text-xs">v{lock.publicLockVersion}</span>
              <span className="text-xs">{networks[lock.network].name}</span>
            </div>
          )}
        </LockName>
        <LockDuration>
          <Duration seconds={lock.expirationDuration} />
          {isRecurring && (
            <small>
              <br />
              Recurring enabled
            </small>
          )}
          {!isRecurring && recurringPossible && (
            <LockLabelSmall onClick={handleApproveRecurring}>
              Enable recurring
            </LockLabelSmall>
          )}
        </LockDuration>
        <LockKeysNumbers edit={edit} lock={lock} />
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
