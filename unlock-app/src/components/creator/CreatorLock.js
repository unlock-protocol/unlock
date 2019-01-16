import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import Icon from '../lock/Icon'
import EmbedCodeSnippet from './lock/EmbedCodeSnippet'
import KeyList from './lock/KeyList'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import Media, { NoPhone, Phone } from '../../theme/media'

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

export const LockRowGrid =
  'grid-template-columns: 32px minmax(100px, 1fr) repeat(4, minmax(56px, 100px)) minmax(174px, 1fr);'

export const PhoneLockRowGrid =
  'grid-template-columns: 43px minmax(80px, 140px) repeat(2, minmax(56px, 80px)); grid-auto-flow: column;'

export const LockRow = styled.div`
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  min-height: 48px;
  padding-left: 8px;
  color: var(--slate);
  font-size: 14px;
  box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: grid;
  grid-row-gap: 0;
  ${Media.nophone`
    ${LockRowGrid} grid-template-rows: 84px;
    grid-column-gap: 16px;
  `} ${Media.phone`
    grid-column-gap: 4px;
    ${PhoneLockRowGrid}
  `}
  align-items: start;
  cursor: pointer;

  & > * {
    padding-top: 16px;
  }
`

export const LockLabel = styled.div`
  color: var(--link);
`

export const DoubleHeightCell = styled.div`
  grid-row: span 2;
`

export const BalanceContainer = styled.div``

export const LockName = styled.div`
  color: var(--link);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  ${Media.phone`
    grid-column: span 2;
  `};
`

export const LockAddress = styled.div`
  color: var(--grey);
  font-weight: 200;
  white-space: nowrap;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LockDuration = styled.div``

export const LockKeys = styled.div``

const LockPanel = styled.div`
  grid-column: 1 / span 7;
  ${Media.phone`
    display: none;
  `};
`

const LockDivider = styled.div`
  width: 99%;
  height: 1px;
  background-color: var(--lightgrey);
`
