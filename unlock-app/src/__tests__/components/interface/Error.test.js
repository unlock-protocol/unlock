import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import { Error, Errors } from '../../../components/interface/Error'

const close = jest.fn()

afterEach(rtl.cleanup)
describe('Errors', () => {
  describe('Errors Component', () => {
    const manyErrors = [
      {
        message: 'The blockchain may have made your head explode',
        context: 'Is too sexy',
      },
      {
        message: 'Secondary error',
        context: 'Thing',
      },
    ]
    let wrapper, close
    beforeEach(() => {
      close = jest.fn()
      wrapper = rtl.render(<Errors errors={manyErrors} close={close} />)
    })
    it('should clear all errors on clicking CLose All', () => {
      rtl.fireEvent.click(wrapper.getByTitle('Close All'))

      expect(close).toHaveBeenCalledWith(null)
    })
    it('should clear a specific error when clicking the close button of that error', () => {
      rtl.fireEvent.click(
        wrapper.getByTitle(
          'dismiss "The blockchain may have made your head explode" error'
        )
      )

      expect(close).toHaveBeenCalledWith(manyErrors[0])
    })
    it('should render as many errors as there are in the error array plus 1 for the close all button', () => {
      rtl.fireEvent.click(wrapper.getByTitle('dismiss "Secondary error" error'))

      expect(close).toHaveBeenCalledWith(manyErrors[1])
    })
  })
  describe('Error Sub-component', () => {
    describe('when the component has no children or no message', () => {
      it('should not render anything', () => {
        const wrapper = rtl.render(<Error close={close} />)
        expect(wrapper.container.firstChild).toBeNull()
      })
    })

    describe('when the component has a children', () => {
      it('should display the content of the children', () => {
        const wrapper = rtl.render(
          <Error close={close}>There was an error.</Error>
        )
        expect(wrapper.queryByText('There was an error.')).not.toBeNull()
      })

      it('should dispatch a setError element when clicking on the close icon', () => {
        const close = jest.fn()
        const wrapper = rtl.render(
          <Error close={close}>There was an error.</Error>
        )
        rtl.fireEvent.click(wrapper.getByTitle(/close/i))
        expect(close).toHaveBeenCalledTimes(1)
      })
    })

    describe('the the component has an error message', () => {
      it('should display the content of the children', () => {
        const error = {
          message: 'There was an error.',
        }
        const wrapper = rtl.render(<Error close={close} error={error} />)
        expect(wrapper.queryByText('There was an error.')).not.toBeNull()
      })
    })
  })
})
