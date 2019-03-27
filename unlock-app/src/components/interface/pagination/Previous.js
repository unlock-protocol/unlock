import React from 'react'
import PropTypes from 'prop-types'
import {
  ArrowGroup,
  ArrowGroupDisabled,
  LeftArrow,
} from './PaginationComponents'

const PreviousButtons = ({ currentPage, goToPage }) => {
  if (currentPage === 1) {
    return (
      <ArrowGroupDisabled>
        <LeftArrow>&lt;&lt;</LeftArrow>
        <LeftArrow>&lt;</LeftArrow>
      </ArrowGroupDisabled>
    )
  }
  return (
    <ArrowGroup>
      <LeftArrow onClick={() => goToPage(1)}>&lt;&lt;</LeftArrow>
      <LeftArrow onClick={() => goToPage(currentPage - 1)}>&lt;</LeftArrow>
    </ArrowGroup>
  )
}

PreviousButtons.propTypes = {
  currentPage: PropTypes.number,
  goToPage: PropTypes.func,
}

PreviousButtons.defaultProps = {
  currentPage: 1,
  goToPage: null,
}

export default PreviousButtons
