import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import { expirationAsDate } from '../../../utils/durations'
import Pagination from '../../interface/pagination/Pagination'

export function KeyList({ keys }) {
  const renderItems = lockKeys => {
    return lockKeys.map(({ id, transaction, expiration, data }) => {
      return (
        <Row key={id}>
          <Data>{transaction}</Data>
          <Cell>{expirationAsDate(expiration)}</Cell>
          <Data>{data}</Data>
        </Row>
      )
    })
  }
  return (
    <KeyListWrapper>
      <Table>
        <Header>
          <Cell>Keys</Cell>
          <Cell>Expiration</Cell>
          <Cell>Data</Cell>
        </Header>
      </Table>
      {/* 
          <Pagination> takes a list of items
          and a function that takes list of items and renders the list.
          This is so that the Pagination component can be reused across the app
      */}
      <Pagination items={Object.values(keys)} renderItems={renderItems} />
    </KeyListWrapper>
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

const KeyListWrapper = styled.div`
  cursor: default;
`

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
