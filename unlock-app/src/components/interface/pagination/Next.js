import React from 'react'
import PropTypes from 'prop-types'
import { ArrowGroup, ArrowGroupDisabled, RightArrow } from './Pagination'

const NextButtons = ({ numberOfPages, currentPage, goToPage }) => {
  if (currentPage === numberOfPages) {
    return (
      <ArrowGroupDisabled>
        <RightArrow>&gt;</RightArrow>
        <RightArrow>&gt;&gt;</RightArrow>
      </ArrowGroupDisabled>
    )
  }
  return (
    <ArrowGroup>
      <RightArrow onClick={() => goToPage(currentPage + 1)}>&gt;</RightArrow>
      <RightArrow onClick={() => goToPage(numberOfPages)}>&gt;&gt;</RightArrow>
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
