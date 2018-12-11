import React from 'react'
import PropTypes from 'prop-types'
import { PageGroup, PageNumber, PageNumberActive } from './Pagination'

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
  if (numberOfPages <= 10) {
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

  // If number of pages greater than 10,  show first five and last five (1 2 3 4 5 .... 26 27 28 29 30)
  return (
    <PageGroup>
      {//show first five page numbers
        Array(5)
          .fill()
          .map((_, pn) => {
            return pageNumber(pn + 1)
          })}
      {//show first few dots
        currentPage - 1 === 5 ? (
          pageNumber(5 + 1)
        ) : (
          <PageNumber>
            {currentPage === numberOfPages / 2 ||
          currentPage <= 5 ||
          currentPage >= numberOfPages - 5
              ? '....'
              : currentPage < numberOfPages / 2
                ? '..'
                : '....'}
          </PageNumber>
        )}
      {// show the current page number if it is between first five and last five elements
        currentPage > 5 + 1 &&
        currentPage < numberOfPages - 5 && (
          <PageNumberActive>{currentPage}</PageNumberActive>
        )}
      {// show last few dots
        currentPage > 5 &&
        currentPage < numberOfPages - 5 && (
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
      {currentPage === numberOfPages - 5 && pageNumber(currentPage)}
      {// show last five page numbers
        Array(5)
          .fill()
          .map((_, pn) => {
            return pageNumber(numberOfPages - 4 + pn)
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
