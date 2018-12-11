import React from 'react'
import PropTypes from 'prop-types'
import { PageGroup, PageNumber, PageNumberActive } from './Pagination'
import { PGN_MAX_NUMBER_OF_PAGES_TO_SHOW_ALL } from '../../../constants'

const PageNumbers = ({ numberOfPages, currentPage, goToPage }) => {
  const pageNumber = number => {
    return number === currentPage ? (
      <PageNumberActive onClick={() => goToPage(number)}>
        {number}
      </PageNumberActive>
    ) : (
      <PageNumber onClick={() => goToPage(number)}>{number}</PageNumber>
    )
  }

  // If number of pages less than 10, show all 10 page numbers
  if (numberOfPages <= PGN_MAX_NUMBER_OF_PAGES_TO_SHOW_ALL) {
    return (
      <PageGroup>
        {Array(numberOfPages)
          .fill()
          .map((_, pn) => {
            return pageNumber(pn + 1)
          })}
      </PageGroup>
    )
  }

  const HALF_MAX_PAGES_TO_SHOW_ALL = PGN_MAX_NUMBER_OF_PAGES_TO_SHOW_ALL / 2

  // If number of pages greater than 10,  show first five and last five (1 2 3 4 5 .... 26 27 28 29 30)
  return (
    <PageGroup>
      {//show first five page numbers
        Array(HALF_MAX_PAGES_TO_SHOW_ALL)
          .fill()
          .map((_, pn) => {
            return pageNumber(pn + 1)
          })}
      {//show first few dots
        currentPage - 1 === HALF_MAX_PAGES_TO_SHOW_ALL ? (
          pageNumber(HALF_MAX_PAGES_TO_SHOW_ALL + 1)
        ) : (
          <PageNumber>
            {currentPage === numberOfPages / 2 ||
          currentPage <= HALF_MAX_PAGES_TO_SHOW_ALL ||
          currentPage >= numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL
              ? '....'
              : currentPage < numberOfPages / 2
                ? '..'
                : '....'}
          </PageNumber>
        )}
      {// show the current page number if it is between first five and last five elements
        currentPage > HALF_MAX_PAGES_TO_SHOW_ALL + 1 &&
        currentPage < numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL && (
          <PageNumberActive>{currentPage}</PageNumberActive>
        )}
      {// show last few dots
        currentPage > HALF_MAX_PAGES_TO_SHOW_ALL &&
        currentPage < numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL && (
          <PageNumber>
            {' '}
            {currentPage === numberOfPages / 2
              ? '....'
              : currentPage < numberOfPages / 2
                ? '....'
                : '..'}
            {' '}
          </PageNumber>
        )}
      {currentPage === numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL &&
        pageNumber(currentPage)}
      {// show last five page numbers
        Array(HALF_MAX_PAGES_TO_SHOW_ALL)
          .fill()
          .map((_, pn) => {
            return pageNumber(numberOfPages - HALF_MAX_PAGES_TO_SHOW_ALL + 1 + pn)
          })}
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
