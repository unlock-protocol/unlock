import React from 'react'
import * as rtl from 'react-testing-library'

import { Errors, mapStateToProps } from '../../../components/interface/Error'

const close = jest.fn()

afterEach(rtl.cleanup)
describe('Error Component', () => {
  describe('when the component has no children or no message', () => {
    it('should not render anything', () => {
      const wrapper = rtl.render(<Errors close={close} />)
      expect(wrapper.container.firstChild).toBeNull()
    })
    it('should not render when errors length is 0', () => {
      const wrapper = rtl.render(<Errors close={close} errors={[]} />)
      expect(wrapper.container.firstChild).toBeNull()
    })
  })

  describe('when the component has a children', () => {
    it('should dispatch a resetError action when clicking on the close icon', () => {
      const close = jest.fn()
      const wrapper = rtl.render(
        <Errors close={close} errors={['There was an error.']} />
      )
      rtl.fireEvent.click(wrapper.getByTitle(/close/i))
      expect(close).toHaveBeenCalledTimes(1)
    })
  })

  describe('the the component has an error message', () => {
    it('should display the content of the children', () => {
      const message = 'Broken'
      const wrapper = rtl.render(<Errors close={close} errors={[message]} />)
      expect(
        wrapper.queryByText(
          'There was an error (Broken). Please retry and report if it happens again.'
        )
      ).not.toBeNull()
    })
  })

  describe('connecting to redux', () => {
    it('mapStateToProps', () => {
      const expectedState = ['error 1', 'error 2', 'error 3']
      expect(mapStateToProps({ errors: expectedState })).toEqual({
        errors: expectedState,
      })
    })
  })
})
