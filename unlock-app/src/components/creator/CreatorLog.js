import React from 'react'
import styled from 'styled-components'
import BalanceProvider from '../helpers/BalanceProvider'
import { dateTimeString } from '../../utils/durations'

import UnlockPropTypes from '../../propTypes'

/** Define default string values for the log so we don't crash the app */
const logDefaults = {
  DATE: 'Date Unknown',
  NAME: '',
  TYPE: 'TRANSACTION',
  OWNER: '',
  DATA: '',
}

function snakeToTitleCase(string) {
  return string
    .split('_')
    .map(word => word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

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
          : logDefaults.NAME
      : logDefaults.NAME
  }

  getOwner = (transaction, locks) => {
    const lock = this.getLock(transaction, locks)

    return lock ? lock.owner : logDefaults.OWNER
  }

  getType = transaction => {
    return transaction.type ? transaction.type : logDefaults.TYPE
  }

  getPrice = (transaction, locks) => {
    const lock = this.getLock(transaction, locks)

    return lock ? lock.keyPrice : 0
  }

  render() {
    const { transaction } = this.props

    return (
      <LogRow>
        <LogDate>
          {transaction.createdAt
            ? dateTimeString(transaction.createdAt)
            : logDefaults.DATE}
        </LogDate>
        <LogName>
          {this.getLockNameAddress(transaction, this.props.locks)}
        </LogName>
        <LogType>{snakeToTitleCase(this.getType(transaction))}</LogType>
        <LogOwner>{this.getOwner(transaction, this.props.locks)}</LogOwner>
        <BalanceProvider
          amount={this.getPrice(transaction, this.props.locks)}
          unit="wei"
          render={ethWithPresentation => (
            <LogAmount>{`${ethWithPresentation} ETH`}</LogAmount>
          )}
        />
        <LogData>{transaction.data || logDefaults.DATA}</LogData>
      </LogRow>
    )
  }
}

CreatorLog.propTypes = {
  transaction: UnlockPropTypes.transaction.isRequired,
}

export default CreatorLog

export const LogRowGrid =
  'grid-template-columns: 160px repeat(3, minmax(100px, 1fr)) 100px minmax(100px, 1fr);'

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
  grid-column-gap: 24px;
  grid-row-gap: 0;
  align-items: start;

  & > * {
    padding-top: 16px;
  }
`

const LogDate = styled.div``

const LogName = styled.div`
  color: var(--link);
  overflow: hidden;
  text-overflow: ellipsis;
`

const LogType = styled.div`
  color: #74ce63;
`

const LogOwner = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`

const LogAmount = styled.div``

const LogData = styled.div``
