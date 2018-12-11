import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import CreatorLog from './CreatorLog'
import Error from '../interface/Error'
import { LogRowGrid } from './CreatorLog'

export class CreatorLogs extends React.Component {
  constructor(props, context) {
    super(props)
  }

  render() {
    return (
      <Log>
        <LogHeaderRow>
          <LogHeader>Log</LogHeader>
          <LogMinorHeader>Lock Name/Address</LogMinorHeader>
          <LogMinorHeader>Type</LogMinorHeader>
          <LogMinorHeader>From/To</LogMinorHeader>
          <LogMinorHeader>Qty</LogMinorHeader>
          <LogMinorHeader>Data</LogMinorHeader>
        </LogHeaderRow>
        {Object.values(this.props.transactions).map(transaction => (
          <CreatorLog transaction={transaction} locks={this.props.locks} />
        ))}
      </Log>
    )
  }
}

CreatorLogs.propTypes = {
  transactions: UnlockPropTypes.transactions,
}

CreatorLogs.defaultProps = {
  transactions: {},
}

export default CreatorLogs

const Log = styled.section`
  display: grid;
`

const LogHeaderRow = styled.div`
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  padding-left: 8px;
  font-size: 14px;
  display: grid;
  grid-gap: 16px;
  ${LogRowGrid} align-items: center;
`

const LogHeader = styled.div`
  font-family: 'IBM Plex Sans';
  font-size: 13px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: var(--grey);
`

const LogMinorHeader = styled.div`
  font-family: 'IBM Plex Mono';
  font-size: 8px;
  font-weight: thin;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--darkgrey);
`
