import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import PageNumbers from '../../../components/interface/pagination/PageNumbers'

jest.mock('next/link', () => {
  return ({ children }) => children
})

afterEach(rtl.cleanup)
describe('Pagination page numbers', () => {
  it('clicking page number should trigger that page number', () => {
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
