import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import Icon from '../lock/Icon'
import AppStore from './lock/AppStore'
import KeyList from './lock/KeyList'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import CreatorLockForm from './CreatorLockForm'
import { NoPhone, Phone } from '../../theme/media'
import withConfig from '../../utils/withConfig'

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
} from './LockStyles'
import { updateKeyPrice, updateLock } from '../../actions/lock'

import { INFINITY } from '../../constants'

const BalanceOnLock = withConfig(
  ({ lock, attribute, skipConversion, config }) => {
    let currency = ''
    if (lock.currencyContractAddress === config.ERC20Contract.address) {
      currency = config.ERC20Contract.name
    } else if (lock.currencyContractAddress) {
      currency = 'ERC20' // Default
    }
    return (
      <Balance
        amount={lock[attribute]}
        currency={currency}
        convertCurrency={!skipConversion && !currency}
      />
    )
  }
)

BalanceOnLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  attribute: PropTypes.string.isRequired,
  skipConversion: PropTypes.bool,
}

BalanceOnLock.defaultProps = {
  skipConversion: false,
}

const LockKeysNumbers = ({ lock }) => (
  <LockKeys>
    {lock.outstandingKeys !== null &&
    lock.maxNumberOfKeys !== null &&
    typeof lock.outstandingKeys !== 'undefined' &&
    typeof lock.maxNumberOfKeys !== 'undefined'
      ? `${lock.outstandingKeys}/${
          lock.unlimitedKeys ? INFINITY : lock.maxNumberOfKeys
        }`
      : ' - '}
  </LockKeys>
)

LockKeysNumbers.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export class CreatorLock extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      showEmbedCode: false,
      showKeys: false,
      editing: false,
    }
    this.toggleEmbedCode = this.toggleEmbedCode.bind(this)
    this.toggleKeys = this.toggleKeys.bind(this)
  }

  toggleEmbedCode() {
    this.setState(previousState => ({
      showEmbedCode: !previousState.showEmbedCode,
    }))
  }

  toggleKeys() {
    this.setState(previousState => ({
      showKeys: !previousState.showKeys,
    }))
  }

  render() {
    // TODO add all-time balance to lock

    const { lock, updateLock } = this.props
    const { showEmbedCode, showKeys, editing } = this.state

    if (editing) {
      return (
        <CreatorLockForm
          lock={lock}
          hideAction={() => this.setState({ editing: false })}
          saveLock={newLock => updateLock(newLock)}
        />
      )
    }

    // Some sanitization of strings to display
    let name = lock.name || 'New Lock'

    const edit = () =>
      this.setState({
        editing: true,
        showEmbedCode: false,
        showKeys: false,
      })

    return (
      <LockRow
        className="lock" // Used by integration tests
        data-address={`${lock.address}`}
        onClick={this.toggleKeys}
      >
        <DoubleHeightCell>
          <Icon lock={lock} />
        </DoubleHeightCell>
        <LockName>
          {name}
          <LockAddress>{!lock.pending && lock.address}</LockAddress>
        </LockName>
        <LockDuration>
          <Duration seconds={lock.expirationDuration} />
        </LockDuration>
        <LockKeysNumbers lock={lock} />
        <BalanceOnLock lock={lock} attribute="keyPrice" />
        <BalanceContainer>
          <NoPhone>
            <BalanceOnLock lock={lock} attribute="balance" />
          </NoPhone>
          <Phone>
            <BalanceOnLock lock={lock} attribute="balance" skipConversion />
          </Phone>
        </BalanceContainer>
        <LockIconBar
          lock={lock}
          toggleCode={this.toggleEmbedCode}
          edit={edit}
        />
        {showEmbedCode && (
          <LockPanel>
            <LockDivider />
            <AppStore lock={lock} />
          </LockPanel>
        )}
        {!showEmbedCode && showKeys && (
          <LockPanel onClick={e => e.stopPropagation()}>
            <LockDivider />
            <KeyList lock={lock} />
          </LockPanel>
        )}
      </LockRow>
    )
  }
}

CreatorLock.propTypes = {
  updateLock: PropTypes.func.isRequired,
  lock: UnlockPropTypes.lock.isRequired,
}

export const mapDispatchToProps = (dispatch, { lock }) => {
  return {
    updateLock: newLock => {
      // If the price has changed
      if (lock.keyPrice !== newLock.keyPrice) {
        dispatch(updateKeyPrice(lock.address, newLock.keyPrice))
      }

      // Reflect all changes
      dispatch(updateLock(lock.address, newLock))
    },
  }
}

export default connect(
  undefined,
  mapDispatchToProps
)(CreatorLock)
