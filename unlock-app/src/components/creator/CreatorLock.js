import React from 'react'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import Icon from '../lock/Icon'
import EmbedCodeSnippet from './lock/EmbedCodeSnippet'
import KeyList from './lock/KeyList'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
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

const LockKeysNumbers = ({ lock }) => (
  <LockKeys>
    {lock.outstandingKeys !== null &&
    lock.maxNumberOfKeys !== null &&
    typeof lock.outstandingKeys !== 'undefined' &&
    typeof lock.maxNumberOfKeys !== 'undefined'
      ? `${lock.outstandingKeys}/${
          lock.maxNumberOfKeys > 0 ? lock.maxNumberOfKeys : '∞'
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

    const { lock, edit } = this.props
    const { showEmbedCode, showKeys } = this.state

    // Some sanitization of strings to display
    let name = lock.name || 'New Lock'
    return (
      <LockRow onClick={this.toggleKeys}>
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
        <Balance amount={lock.keyPrice} />
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
          edit={edit}
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
  lock: UnlockPropTypes.lock.isRequired,
  edit: PropTypes.func, // no-op for now, we will change to isRequired when wiring up the action
}

CreatorLock.defaultProps = {
  edit: () => {},
}

export default CreatorLock
