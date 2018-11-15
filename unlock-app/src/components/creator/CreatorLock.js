import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import Icon from '../lock/Icon'
import EmbedCodeSnippet from './lock/EmbedCodeSnippet'
import KeyList from './lock/KeyList'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'

export class CreatorLock extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      showEmbedCode: false,
      showKeys: false,
    }
    this.toggleEmbedCode = this.toggleEmbedCode.bind(this)
    this.toggleKeys = this.toggleKeys.bind(this)
  }

  toggleEmbedCode() {
    this.setState((previousState) => ({
      showEmbedCode: !previousState.showEmbedCode,
    }))
  }

  toggleKeys() {
    this.setState((previousState) => ({
      showKeys: !previousState.showKeys,
    }))
  }

  render() {
    // TODO add all-time balance to lock

    const { lock } = this.props
    const { showEmbedCode, showKeys } = this.state

    // Some sanitization of strings to display
    let name = lock.name || 'New Lock'
    let outstandingKeys = lock.outstandingKeys || 0

    return (
      <LockRow onClick={this.toggleKeys}>
        <Icon lock={lock} address={lock.address} />
        <LockName>
          {name}
          <LockAddress>{lock.address}</LockAddress>
        </LockName>
        <LockDuration>
          <Duration seconds={lock.expirationDuration} />
        </LockDuration>
        <LockKeys>
          {outstandingKeys}
/
          {lock.maxNumberOfKeys}
        </LockKeys>
        <Balance amount={lock.keyPrice} />
        <Balance amount={lock.balance} />
        <LockIconBar
          lock={lock}
          toggleCode={this.toggleEmbedCode}
        />
        {showEmbedCode &&
          <LockPanel>
            <LockDivider />
            <EmbedCodeSnippet lock={lock} />
          </LockPanel>
        }
        {!showEmbedCode && showKeys &&
          <LockPanel>
            <LockDivider />
            <KeyList lock={lock} />
          </LockPanel>
        }
      </LockRow>
    )
  }
}

CreatorLock.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

const mapStateToProps = (state, { lock }) => {
  return {
    lock,
  }
}

export default connect(mapStateToProps)(CreatorLock)

export const LockRowGrid = 'grid-template-columns: 32px minmax(100px, 1fr) repeat(4, minmax(56px, 100px)) minmax(174px, 1fr);'

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
  grid-gap: 16px;
  ${LockRowGrid}
  grid-template-rows: 84px;
  grid-column-gap: 16px;
  grid-row-gap: 0;
  align-items: start;
  cursor: pointer;
  
  &>* { 
    padding-top: 16px 
  }
`

export const LockName = styled.div`
  color: var(--link);
  font-weight: 600;
`

export const LockAddress = styled.div`
  color: var(--grey);
  font-weight: 200;
  white-space: nowrap;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LockDuration = styled.div`
`

export const LockKeys = styled.div`
`

const LockPanel = styled.div`
  grid-column: 1 / span 7;
`

const LockDivider = styled.div`
  width: 99%;
  height: 1px;
  background-color: var(--lightgrey);
`
