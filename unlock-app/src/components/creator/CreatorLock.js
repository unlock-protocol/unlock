import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import Icon from '../lock/Icon'
import EmbedCodeSnippet from './lock/EmbedCodeSnippet'
import KeyList from './lock/KeyList'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import CreatorLockForm from './CreatorLockForm'
import { NoPhone, Phone } from '../../theme/media'

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

const KeyPrice = ({ lock }) => (
  <Balance className="price" amount={lock.keyPrice} />
)

KeyPrice.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
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
        <KeyPrice lock={lock} />
        <BalanceContainer>
          <NoPhone>
            <Balance amount={lock.balance} />
          </NoPhone>
          <Phone>
            <Balance amount={lock.balance} convertCurrency={false} />
          </Phone>
        </BalanceContainer>
        <LockIconBar
          lock={lock}
          toggleCode={this.toggleEmbedCode}
          edit={() =>
            this.setState({
              editing: true,
              showEmbedCode: false,
              showKeys: false,
            })
          }
        />
        {showEmbedCode && (
          <LockPanel>
            <LockDivider />
            <EmbedCodeSnippet lock={lock} />
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
