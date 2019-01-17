import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import { expirationAsDate } from '../../../utils/durations'
import Pagination from '../../interface/pagination/Pagination'
import { setKeysOnPageForLock } from '../../../actions/keysPages'

export class KeyList extends React.Component {
  componentDidMount() {
    const { loadPage } = this.props
    loadPage(1)
  }

  render() {
    const { keys, lock, loadPage, page } = this.props
    const renderItems = lockKeys => {
      return lockKeys.map(({ id, owner, expiration, data }) => {
        return (
          <Row key={id}>
            <Data>{owner}</Data>
            <Cell>{expirationAsDate(expiration)}</Cell>
            <Data>{data || '-'}</Data>
          </Row>
        )
      })
    }
    return (
      <KeyListWrapper>
        <Table>
          <Header>
            <Cell>Owner</Cell>
            <Cell>Expiration</Cell>
            <Cell>Data</Cell>
          </Header>
        </Table>
        {/*
          <Pagination> takes a list of items
          and a function that takes list of items and renders the list.
          This is so that the Pagination component can be reused across the app
      */}
        <Pagination
          items={keys}
          currentPage={page + 1}
          itemCount={lock.outstandingKeys}
          renderItems={renderItems}
          goToPage={loadPage}
        />
      </KeyListWrapper>
    )
  }
}

KeyList.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  keys: PropTypes.arrayOf(UnlockPropTypes.key),
  loadPage: PropTypes.func.isRequired,
  page: PropTypes.number,
}

KeyList.defaultProps = {
  keys: [],
  page: 0,
}

export const mapStateToProps = (state, { lock }) => {
  let keys = []
  let page = 0
  if (state.keysForLockByPage[lock.address]) {
    keys = state.keysForLockByPage[lock.address].keys
    page = state.keysForLockByPage[lock.address].page
  }
  return {
    keys,
    page,
  }
}

export const mapDispatchToProps = (dispatch, { lock }) => ({
  loadPage: number => {
    dispatch(setKeysOnPageForLock(number - 1, lock.address))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KeyList)

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
  grid-template-columns: 3fr 1fr 4fr;
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
