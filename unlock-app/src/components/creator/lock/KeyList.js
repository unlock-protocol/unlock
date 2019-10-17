import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import Svg from '../../interface/svg'
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
      return lockKeys.map(({ id, owner, expiration }) => {
        return (
          <Row key={id}>
            <Data>{owner}</Data>
            <Cell>{expirationAsDate(expiration)}</Cell>
          </Row>
        )
      })
    }

    /*
      <Pagination> takes a list of items
      and a function that takes list of items and renders the list.
      This is so that the Pagination component can be reused across the app
    */
    const pagination =
      keys.length > 0 ? (
        <Pagination
          items={keys}
          currentPage={page + 1}
          itemCount={lock.outstandingKeys}
          renderItems={renderItems}
          goToPage={loadPage}
        />
      ) : (
        <Message>
          No keys have been purchased yet. See how you can integrate your lock
          into an application by clicking on <InlineIcon /> the icon in the bar
          above.
        </Message>
      )

    return (
      <KeyListWrapper>
        <Table>
          <Header>
            <Cell>Owner</Cell>
            <Cell>Expiration</Cell>
          </Header>
        </Table>
        {pagination}
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
  margin-bottom: 10px;
`

const Table = styled.div`
  margin-bottom: 10px;
`

const InlineIcon = styled(Svg.AppStore)`
  vertical-align: middle;
  width: 20px;
`

const Row = styled.div`
  display: grid;
  margin-top: 20px;
  margin-left: 48px;
  display: grid;
  grid-template-columns: 450px 1fr;
  grid-gap: 20px;
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
  padding-right: 72px;
`

const Message = styled.div`
  margin-top: 20px;
  margin-left: 48px;
  margin-bottom: 30px;
  color: var(--grey);
`
