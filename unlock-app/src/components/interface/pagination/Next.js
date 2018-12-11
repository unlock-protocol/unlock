import React from 'react'
import { ArrowGroup, RightArrow } from './Pagination.js'

const NextButtons = ({
  count,
  itemsPerPage,
  numberOfPages,
  currentPage,
  goToPage,
}) => {
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

export default NextButtons
