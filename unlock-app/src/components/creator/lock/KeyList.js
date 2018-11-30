import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import { expirationAsDate } from '../../../utils/durations'

// TODO add pagination
export function KeyList({ keys }) {
  return (
    <Table>
      <Header>
        <Cell>Keys</Cell>
        <Cell>Expiration</Cell>
        <Cell>Data</Cell>
      </Header>
      {Object.values(keys).map(key => {
        return (
          <Row key={key.id}>
            <Data>{key.transaction}</Data>
            <Cell>{expirationAsDate(key.expiration)}</Cell>
            <Data>{key.data}</Data>
          </Row>
        )
      })}
    </Table>
  )
}

KeyList.propTypes = {
  keys: UnlockPropTypes.keys,
}

KeyList.defaultProps = {
  keys: [],
}

const mapStateToProps = (state, { lock }) => {
  const keys = {}
  if (state.keys)
    Object.values(state.keys)
      .filter(key => key.lock === lock.address)
      .forEach(item => (keys[item.id] = item))
  return {
    keys,
    lock,
  }
}

export default connect(mapStateToProps)(KeyList)

const Table = styled.div``

const Row = styled.div`
  display: grid;
  margin-top: 20px;
  margin-left: 48px;
  width: 100%;
  display: grid;
  grid-template-columns: 2fr 3fr 3fr;
  grid-gap: 36px;
  margin-bottom: 10px;
`

const Header = styled(Row)`
  font-family: 'IBM Plex Sans';
  font-size: 10px;
  text-transform: uppercase;
`

const Cell = styled.div``

const Data = styled(Cell)`
  overflow: hidden;
  text-overflow: ellipsis;
`
