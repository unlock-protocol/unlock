import React from 'react'
import { ArrowGroup, LeftArrow } from './Pagination.js'

const PreviousButtons = ({ count, itemsPerPage, currentPage, goToPage }) => {
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

export default PreviousButtons
