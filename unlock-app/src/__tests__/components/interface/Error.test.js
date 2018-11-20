import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import { Error } from '../../../components/interface/Error'

const close = jest.fn()

afterEach(rtl.cleanup)
describe('Error Component', () => {
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
      const message = <p>There was an error.</p>
      const wrapper = rtl.render(<Error close={close} error={message} />)
      expect(wrapper.queryByText('There was an error.')).not.toBeNull()
    })
  })
})
