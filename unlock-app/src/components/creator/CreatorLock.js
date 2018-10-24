import React from 'react'
import UnlockPropTypes from '../../propTypes'
import LockIconBar from './lock/LockIconBar'
import CreatorLockConfirming from './lock/CreatorLockConfirming'
import Icon from '../lock/Icon'
import EmbedCodeSnippet from './lock/EmbedCodeSnippet'
import Duration from '../helpers/Duration'
import Balance from '../helpers/Balance'
import styled from 'styled-components'

export class CreatorLock extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {
      showEmbedCode: false,
    }
  }

  toggleEmbedCode() {
    this.setState({
      showEmbedCode: !this.state.showEmbedCode,
    })
  }

  render() {
    // TODO add USD values to lock
    // TODO add all-time balance to lock

    // Some sanitization of strings to display
    let name = this.props.lock.name || 'New Lock'
    let outstandingKeys = this.props.lock.maxNumberOfKeys - this.props.lock.outstandingKeys || 0
    let lockComponentStatusBlock

    if (this.props.status === 'deployed') { // the transaction was mined and confirmed at least 12 times
      lockComponentStatusBlock = (<LockIconBarContainer>
        <LockIconBar lock={this.props.lock} toggleCode={this.toggleEmbedCode} />
      </LockIconBarContainer>)
    } else {
      lockComponentStatusBlock = <CreatorLockConfirming lock={this.props.lock} status={this.props.status} />
    }

    return (
      <LockRow>
        <Icon lock={this.props.lock} address={this.props.lock.address} />
        <LockName>
          {name}
          <LockAddress>{this.props.lock.address}</LockAddress>
        </LockName>
        <LockDuration>
          <Duration seconds={this.props.lock.expirationDuration} />
        </LockDuration>
        <LockKeys>{outstandingKeys}/{this.props.lock.maxNumberOfKeys}</LockKeys>
        <Balance amount={this.props.lock.keyPrice} />
        <Balance amount={this.props.lock.balance} />
        {lockComponentStatusBlock}
        {this.props.status == 'deployed' && this.state.showEmbedCode &&
          <LockCode>
            <LockDivider />
            <EmbedCodeSnippet lock={this.props.lock} />
          </LockCode>
        }
      </LockRow>
    )
  }
}

CreatorLock.propTypes = {
  lock: UnlockPropTypes.lock,
  status: UnlockPropTypes.status,
}

export default CreatorLock

export const LockRowGrid = 'grid-template-columns: 32px minmax(100px, 3fr) repeat(4, minmax(56px, 100px)) minmax(174px, 1fr);'

const LockIconBarContainer = styled.div`
  visibility: hidden;
`

export const LockRow = styled.div`
  &:hover {
    ${LockIconBarContainer} {
      visibility: visible;
    }
  }
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  min-height: 60px;
  padding-left: 8px;
  color: var(--slate);
  font-size: 14px;
  box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: grid;
  grid-gap: 16px;
  ${LockRowGrid}
  grid-template-rows: 60px;
  grid-column-gap: 16px;
  grid-row-gap: 0;
  align-items: center;
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

const LockCode = styled.div`
  grid-column: 1 / span 7;
`

const LockDivider = styled.div`
  width: 99%;
  height: 1px;
  background-color: var(--lightgrey);
`

/* Saving for use with sub-values that need to be added in a future PR
const LockValueSub = styled.div`
  font-size: 0.6em;
  color: var(--grey);
  margin-top: 5px;
`
*/

/* Saving for use with sub-values that need to be added in a future PR
const LockValueUsd = styled.div`
  &:before {
    content: "$ ";
  }
`
*/
