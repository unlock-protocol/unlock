import React from 'react'
import PropTypes from 'prop-types'
import { PageGroup, PageNumber, PageNumberActive } from './PaginationComponents'
import { PGN_MAX_NUMBER_OF_PAGES_TO_SHOW_ALL } from '../../../constants'

const PageNumbers = ({ numberOfPages, currentPage, goToPage }) => {
  const pageNumber = number => {
    return number === currentPage ? (
      <PageNumberActive
        key={number.toString()}
        onClick={() => goToPage(number)}
      >
        {number}
      </PageNumberActive>
    ) : (
      <PageNumber key={number.toString()} onClick={() => goToPage(number)}>
        {number}
      </PageNumber>
    )
  }

  const pageNumberArray = Array(numberOfPages).fill()

  // If number of pages less than 10, show all 10 page numbers
  if (numberOfPages <= PGN_MAX_NUMBER_OF_PAGES_TO_SHOW_ALL) {
    return (
      <PageGroup>
        {pageNumberArray.slice(0, numberOfPages).map((_, pn) => {
          return pageNumber(pn + 1)
        })}
      </PageGroup>
    )
  }

  const HALF_MAX_PAGES_TO_SHOW_ALL = PGN_MAX_NUMBER_OF_PAGES_TO_SHOW_ALL / 2

  const firstVisiblePages = pageNumberArray
    .slice(0, HALF_MAX_PAGES_TO_SHOW_ALL)
    .map((_, pn) => {
      return pageNumber(pn + 1)
    })
  const formerDots =
    currentPage - 1 === HALF_MAX_PAGES_TO_SHOW_ALL ? (
      pageNumber(HALF_MAX_PAGES_TO_SHOW_ALL + 1)
    ) : (
      <PageNumber style={{ cursor: 'default' }}>
        {currentPage === numberOfPages / 2 ||
        currentPage <= HALF_MAX_PAGES_TO_SHOW_ALL ||
        currentPage >= numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL
          ? '....'
          : currentPage < numberOfPages / 2
          ? '..'
          : '....'}
      </PageNumber>
    )
  const currentIsolatedPageNumber = currentPage >
    HALF_MAX_PAGES_TO_SHOW_ALL + 1 &&
    currentPage < numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL && (
      <PageNumberActive>{currentPage}</PageNumberActive>
    )
  const latterDots = currentPage > HALF_MAX_PAGES_TO_SHOW_ALL &&
    currentPage < numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL && (
      <PageNumber style={{ cursor: 'default' }}>
        {' '}
        {currentPage === numberOfPages / 2
          ? '....'
          : currentPage < numberOfPages / 2
          ? '....'
          : '..'}{' '}
      </PageNumber>
    )

  const lastVisiblePages = (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {currentPage === numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL &&
        pageNumber(currentPage)}
      {pageNumberArray.slice(0, HALF_MAX_PAGES_TO_SHOW_ALL).map((_, pn) => {
        return pageNumber(numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL + 1 + pn)
      })}
    </div>
  )

  // If number of pages greater than 10,  show first five and last five (1 2 3 4 5 .... 26 27 28 29 30)
  return (
    <PageGroup>
      {firstVisiblePages}
      {formerDots}
      {currentIsolatedPageNumber}
      {latterDots}
      {lastVisiblePages}
    </PageGroup>
  )
}

PageNumbers.propTypes = {
  numberOfPages: PropTypes.number,
  currentPage: PropTypes.number,
  goToPage: PropTypes.func,
}

PageNumbers.defaultProps = {
  numberOfPages: 10,
  currentPage: 1,
  goToPage: null,
}

export default PageNumbers
