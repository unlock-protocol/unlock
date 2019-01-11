import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import { Error } from '../../../components/interface/Error'
import { web3Error } from '../../../actions/error'

const close = jest.fn()

afterEach(rtl.cleanup)
describe('Error Component', () => {
  describe('when the component has no children or no message', () => {
    it('should not render anything', () => {
      const wrapper = rtl.render(<Error close={close} />)
      expect(wrapper.container.firstChild).toBeNull()
    })
  })

  describe('when the component has children', () => {
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

  describe('when the component is passed error metadata', () => {
    it('should display a formatted error message based on the metadata', () => {
      const error = web3Error({ message: 'error message' }).error
      const close = () => {}
      const wrapper = rtl.render(<Error close={close} error={error} />)
      expect(wrapper.queryByText('Web3 error: error message')).not.toBeNull()
    })
    it('should display a formatted error message based on the metadata and locale', () => {
      const error = web3Error({ message: 'error message' }).error
      const close = () => {}
      const wrapper = rtl.render(
        <Error close={close} error={error} locale="fr" />
      )
      expect(wrapper.queryByText('Web3 erreur: error message')).not.toBeNull()
    })
  })
})
