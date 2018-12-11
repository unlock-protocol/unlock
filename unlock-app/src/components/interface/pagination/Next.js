import React from 'react'
import PropTypes from 'prop-types'
import { ArrowGroup, RightArrow } from './Pagination'

const NextButtons = ({ numberOfPages, currentPage, goToPage }) => {
  const goToNextPage = () => {
    if (currentPage + 1 > numberOfPages) {
      return
    }
    goToPage(currentPage + 1)
  }
  const goToLastPage = () => {
    if (currentPage + 1 > numberOfPages) {
      return
    }
    goToPage(numberOfPages)
  }
  return (
    <ArrowGroup>
      <RightArrow onClick={goToNextPage}>&gt;</RightArrow>
      <RightArrow onClick={goToLastPage}>&gt;&gt;</RightArrow>
    </ArrowGroup>
  )
}

NextButtons.propTypes = {
  numberOfPages: PropTypes.number,
  currentPage: PropTypes.number,
  goToPage: PropTypes.func,
}

NextButtons.defaultProps = {
  numberOfPages: 10,
  currentPage: 1,
  goToPage: null,
}

export default NextButtons
