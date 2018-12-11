import React from 'react'
import PropTypes from 'prop-types'
import { ArrowGroup, LeftArrow } from './Pagination'

const PreviousButtons = ({ currentPage, goToPage }) => {
  const goToPreviousPage = () => {
    if (currentPage === 1) {
      return
    }
    goToPage(currentPage - 1)
  }
  const goToFirstPage = () => {
    if (currentPage === 1) {
      return
    }
    goToPage(1)
  }
  return (
    <ArrowGroup>
      <LeftArrow onClick={goToFirstPage}>&lt;&lt;</LeftArrow>
      <LeftArrow onClick={goToPreviousPage}>&lt;</LeftArrow>
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
