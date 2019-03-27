import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import PreviousButtons from './Previous'
import NextButtons from './Next'
import PageNumbers from './PageNumbers'
import { PGN_ITEMS_PER_PAGE } from '../../../constants'
import UnlockPropTypes from '../../../propTypes'
import { LockDivider } from './PaginationComponents'

export function Paginate({
  goToPage,
  itemCount,
  currentPage,
  renderItems,
  items,
}) {
  const pageInfo = {
    numberOfPages: Math.ceil(itemCount / PGN_ITEMS_PER_PAGE),
    currentPage,
    goToPage,
  }
  return (
    <PaginationWrapper>
      {renderItems(items)}
      {itemCount > PGN_ITEMS_PER_PAGE && (
        <div>
          <LockDivider />
          <Pagination>
            <PreviousButtons {...pageInfo} />
            <PageNumbers {...pageInfo} />
            <NextButtons {...pageInfo} />
          </Pagination>
        </div>
      )}
    </PaginationWrapper>
  )
}

Paginate.propTypes = {
  goToPage: PropTypes.func.isRequired,
  itemCount: PropTypes.number,
  currentPage: PropTypes.number,
  renderItems: PropTypes.func.isRequired,
  items: UnlockPropTypes.keyList,
}

Paginate.defaultProps = {
  itemCount: 0,
  currentPage: 0,
  items: [],
}

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-left: 48px;
  margin-right: 8px;
`

const PaginationWrapper = styled.div`
  margin-top: 20px;
`

export default Paginate
