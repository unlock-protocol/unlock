import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import PreviousButtons from './Previous'
import NextButtons from './Next'
import PageNumbers from './PageNumbers'
import { PGN_ITEMS_PER_PAGE } from '../../../constants'
import UnlockPropTypes from '../../../propTypes'

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

export const ArrowGroup = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  color: #72accf;
  font-weight: bold;
`

export const ArrowGroupDisabled = styled.div`
  display: flex;
  flex-direction: row;
  cursor: default;
  color: gray;
  font-weight: bold;
`

export const LeftArrow = styled.div`
  margin-right: 20px;
`

export const RightArrow = styled.div`
  margin-left: 20px;
`

export const PageGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: spread
  cursor: pointer;
  color: #72ACCF;
  font-weight: bold;
`

export const PageNumber = styled.div`
  margin: 0 10px;
  cursor: pointer;
`

export const PageNumberActive = styled.div`
  margin: 0 10px;
  color: red;
`

export const LockDivider = styled.div`
  width: 99%;
  height: 1px;
  background-color: var(--lightgrey);
  margin-bottom: 10px;
`

export default Paginate
