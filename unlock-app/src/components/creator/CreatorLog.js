import React from 'react'
import styled from 'styled-components'
import BalanceProvider from '../helpers/BalanceProvider'
import { expirationAsDate } from '../../utils/durations'

import UnlogPropTypes from '../../propTypes'

export class CreatorLog extends React.Component {
  constructor(props, context) {
    super(props, context)
  }

  getLock = (transaction, locks) => {
    return locks && locks[transaction.lock]
  }

  getLockNameAddress = (transaction, locks) => {
    const lock = this.getLock(transaction, locks)
    return lock
      ? lock.name
        ? lock.name
        : lock.address
          ? lock.address
          : ''
      : ''
  }

  getOwner = (transaction, locks) => {
    const lock = this.getLock(transaction, locks)

    return lock ? lock.owner : null
  }

  getPrice = (transaction, locks) => {
    const lock = this.getLock(transaction, locks)

    return lock.keyPrice
  }

  render() {
    const { transaction } = this.props

    return (
      <LogRow>
        <div>{expirationAsDate(transaction.createdAt)}</div>
        <LogName>
          {this.getLockNameAddress(transaction, this.props.locks)}
        </LogName>
        <LogType>{transaction.type || 'TRANSACTION'}</LogType>
        <LogOwner>{this.getOwner(transaction, this.props.locks)}</LogOwner>
        <BalanceProvider
          amount={this.getPrice(transaction, this.props.locks)}
          unit="wei"
          render={ethWithPresentation => <div>
            {ethWithPresentation}
            {' '}
ETH
          </div>}
        />
        <div>{transaction.data || 'NONE'}</div>
      </LogRow>
    )
  }
}

CreatorLog.propTypes = {
  transaction: UnlogPropTypes.transaction.isRequired,
}

export default CreatorLog

export const LogRowGrid =
  'grid-template-columns: 170px repeat(5, minmax(100px, 1fr));'

export const LogRow = styled.div`
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  min-height: 48px;
  padding-left: 8px;
  color: var(--slate);
  font-size: 14px;
  display: grid;
  grid-gap: 16px;
  ${LogRowGrid} grid-template-rows: 0px;
  grid-column-gap: 16px;
  grid-row-gap: 0;
  align-items: start;

  & > * {
    padding-top: 16px;
  }
`

export const LogName = styled.div`
  color: var(--link);
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LogType = styled.div`
  color: #74ce63;
`

export const LogOwner = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LogAddress = styled.div`
  color: var(--grey);
  font-weight: 200;
  white-space: nowrap;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
`
