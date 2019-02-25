import React from 'react'
import * as rtl from 'react-testing-library'

import PageNumbers from '../../../components/interface/pagination/PageNumbers'

jest.mock('next/link', () => {
  return ({ children }) => children
})

describe('Pagination page numbers', () => {
  it('clicking page number should trigger that page number', () => {
    expect.assertions(1)
    let pageClicked = 0
    let pageNumbers = rtl.render(
      <div>
        <PageNumbers
          currentPage={1}
          numberOfPages={3}
          goToPage={() => {
            pageClicked = 2
          }}
        />
      </div>
    )
    let pageNumber = pageNumbers.getByText('2')
    rtl.fireEvent.click(pageNumber)
    expect(pageClicked).toEqual(2)
  })
})
