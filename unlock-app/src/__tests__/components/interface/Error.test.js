import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import { Error } from '../../../components/interface/Error'

afterEach(rtl.cleanup)
describe('Error Component', () => {

  describe('when the component has no children or no message', () => {
    it('should not render anything', () => {
      const wrapper = rtl.render(<Error />)
      expect(wrapper.container.firstChild).toBeNull()
    })
  })

  describe('when the component has a children', () => {
    it('should display the content of the children', () => {
      const wrapper = rtl.render(
        <Error>
          There was an error.
        </Error>
      )
      expect(wrapper.queryByText('There was an error.')).not.toBeNull()
    })

    it('should dispatch a setError element when clicking on the close icon', () => {
      const close = jest.fn()
      const wrapper = rtl.render(
        <Error close={close}>
          There was an error.
        </Error>
      )
      rtl.fireEvent.click(wrapper.getByTitle(/close/i))
      expect(close).toHaveBeenCalledTimes(1)
    })
  })

  describe('the the component has an error message', () => {

  })

  // describe('when the balance is 0 Eth', () => {
  //   const amount = '0'

  //   it('no conversion data available', () => {
  //     const wrapper = renderIt(amount, { USD: undefined })

  //     expect(wrapper.queryByText('0')).not.toBeNull()
  //     expect(wrapper.queryByText('---')).not.toBeNull()
  //   })
  //   it('USD conversion data available', () => {
  //     const wrapper = renderIt(amount)
  //     expect(wrapper.queryByText('0')).not.toBeNull()
  //     expect(wrapper.queryByText('0')).not.toBeNull()
  //   })
  // })

  // describe('when the balance is < 0.0001 Eth', () => {
  //   const amount = '70'

  //   it('shows the default minimum value of 三 < 0.0001', () => {
  //     const wrapper = renderIt(amount)
  //     expect(wrapper.queryByText('< 0.0001')).not.toBeNull()
  //     expect(wrapper.queryByText('0.014')).not.toBeNull()
  //   })
  // })

  // describe('when the balance is > 0.0001 Eth and less than 1 Eth', () => {
  //   const amount = '75800'

  //   it('shows the balance in Eth to two decimal places', () => {
  //     const wrapper = renderIt(amount)
  //     expect(wrapper.queryByText('0.076')).not.toBeNull()
  //     expect(wrapper.queryByText('14.86')).not.toBeNull()
  //   })
  // })

  // describe('when the balance is > 1 Eth ', () => {
  //   const amount = '2000000'

  //   it('shows the balance in Eth to two decimal places', () => {
  //     const wrapper = renderIt(amount)
  //     expect(wrapper.queryByText('2.00')).not.toBeNull()
  //     expect(wrapper.queryByText('391.98')).not.toBeNull()
  //   })
  // })

  // describe('when the balance converts to > $1000 ', () => {
  //   const amount = '20000000'

  //   it('shows the balance in dollars in locale format without decimal', () => {
  //     const wrapper = renderIt(amount)
  //     expect(wrapper.queryByText('20.00')).not.toBeNull()
  //     expect(wrapper.queryByText('3,920')).not.toBeNull()
  //   })
  // })

  // describe('when the balance converts to > $100k ', () => {
  //   const amount = '2000000000'

  //   it('shows the balance in thousands of dollars postfixed with k', () => {
  //     const wrapper = renderIt(amount)
  //     expect(wrapper.queryByText('2000.00')).not.toBeNull()
  //     expect(wrapper.queryByText('392k')).not.toBeNull()
  //   })
  // })

  // describe('when the balance converts to > $1m ', () => {
  //   const amount = '20000000000'

  //   it('shows the balance in millions of dollars postfixed with m', () => {
  //     const wrapper = renderIt(amount)
  //     expect(wrapper.queryByText('20000.00')).not.toBeNull()
  //     expect(wrapper.queryByText('3.9m')).not.toBeNull()
  //   })
  // })

  // describe('when the balance converts to > $1b ', () => {
  //   const amount = '20000000000000'

  //   it('shows the balance in billions of dollars postfixed with b', () => {
  //     const wrapper = renderIt(amount)
  //     expect(wrapper.queryByText('20000000.00')).not.toBeNull()
  //     expect(wrapper.queryByText('3.9b')).not.toBeNull()
  //   })
  // })

  // describe('when the balance converts to > $1b, unit is eth (used in lock form)', () => {
  //   const amount = '9999999'

  //   it('shows the balance in billions of dollars postfixed with b', () => {
  //     const wrapper = renderIt(amount, undefined, 'eth')
  //     expect(wrapper.queryByText('9999999.00')).not.toBeNull()
  //     expect(wrapper.queryByText('2b')).not.toBeNull()
  //   })
  // })
})
