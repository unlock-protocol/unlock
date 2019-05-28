import React from 'react'
import * as rtl from 'react-testing-library'

import { Errors, mapStateToProps } from '../../../components/interface/Errors'

const close = jest.fn()

afterEach(rtl.cleanup)
describe('Errors Component', () => {
  describe('when the component has no children or no message', () => {
    it('should not render anything', () => {
      expect.assertions(1)
      const wrapper = rtl.render(<Errors errors={[]} close={close} />)
      expect(wrapper.container.firstChild).toBeNull()
    })

    it('should not render when errors length is 0', () => {
      expect.assertions(1)
      const wrapper = rtl.render(<Errors close={close} errors={[]} />)
      expect(wrapper.container.firstChild).toBeNull()
    })
  })

  describe('when the component has a children', () => {
    it('should dispatch a resetError action when clicking on the close icon', () => {
      expect.assertions(2)
      const close = jest.fn()
      const wrapper = rtl.render(
        <Errors close={close} errors={[{ name: 'There was an error.' }]} />
      )
      rtl.fireEvent.click(wrapper.getByTitle(/close/i))
      expect(close).toHaveBeenCalledTimes(1)
      expect(close).toHaveBeenCalledWith('There was an error.')
    })
  })

  describe('the the component has an error message', () => {
    it('should display the content of the children', () => {
      expect.assertions(1)
      const message = 'Broken'
      const wrapper = rtl.render(
        <Errors close={close} errors={[{ name: message }]} />
      )
      expect(
        wrapper.queryByText(
          'There was an error (Broken). Please retry and report if it happens again.'
        )
      ).not.toBeNull()
    })
  })

  describe('connecting to redux', () => {
    it('mapStateToProps', () => {
      expect.assertions(1)
      const expectedState = [
        { name: 'error 1' },
        { name: 'error 2' },
        { name: 'error 3' },
      ]
      expect(mapStateToProps({ errors: expectedState })).toEqual({
        errors: expectedState,
      })
    })
  })
})
