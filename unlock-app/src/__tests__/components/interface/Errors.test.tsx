import React from 'react'
import * as rtl from 'react-testing-library'

import { Errors, mapStateToProps } from '../../../components/interface/Errors'
import Error from '../../../utils/Error'

const close = jest.fn()

const errors = [Error.Storage.Warning('PC Load Letter')]

afterEach(rtl.cleanup)
describe('Errors Component', () => {
  describe('when the component has no children or no message', () => {
    it('should not render anything', () => {
      expect.assertions(1)
      const wrapper = rtl.render(<Errors errors={[]} close={close} />)
      expect(wrapper.container.firstChild).toBeNull()
    })
  })

  describe('when the component has children', () => {
    it('should dispatch a resetError action when clicking on the close icon', () => {
      expect.assertions(2)
      const close = jest.fn()
      const wrapper = rtl.render(<Errors close={close} errors={errors} />)
      rtl.fireEvent.click(wrapper.getByTitle(/close/i))
      expect(close).toHaveBeenCalledTimes(1)
      expect(close).toHaveBeenCalledWith(errors[0])
    })
  })

  describe('the component has an error message', () => {
    it('should display the content of the children', () => {
      expect.assertions(1)
      const wrapper = rtl.render(<Errors close={close} errors={errors} />)
      expect(
        wrapper.queryByText(
          'There was an error (PC Load Letter). Please retry and report if it happens again.'
        )
      ).not.toBeNull()
    })
  })

  describe('connecting to redux', () => {
    it('mapStateToProps', () => {
      expect.assertions(1)
      const startingState = [
        Error.Storage.Warning('PC Load Letter'),
        Error.Web3.Diagnostic('Web3 deprecated, upgrade to Web4 beta 37'),
        Error.Signature.Warning('Pen low on ink, refill before signing'),
      ]
      const expectedState = [startingState[0], startingState[2]]
      expect(mapStateToProps({ errors: startingState })).toEqual({
        errors: expectedState,
      })
    })
  })
})
