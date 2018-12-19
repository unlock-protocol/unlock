import React from 'react'
import { Provider } from 'react-redux'
import * as rtl from 'react-testing-library'

import withConfig from '../../../utils/withConfig'
import createUnlockStore from '../../../createUnlockStore'

describe('withConfig High Order Component', () => {
  let store1
  beforeEach(() => {
    store1 = createUnlockStore({
      account: null,
      network: {
        name: 4,
      },
      currency: {
        USD: 195.99,
      },
    })
  })

  it('with no account, should render nothing at first, and then an error after delay has passed', () => {
    const Component = () => <div>hi</div>
    const NoAccountComponent = withConfig(Component)
    const fakerouter = {
      route: '/provider',
    }
    jest.useFakeTimers()
    const component = rtl.render(
      <Provider store={store1}>
        <NoAccountComponent router={fakerouter} />
      </Provider>
    )

    expect(component.queryByText('hi')).toBe(null)
    expect(component.queryByText('User account not initialized')).toBe(null)

    jest.advanceTimersByTime(501)

    expect(component.queryByText('hi')).toBe(null)
    expect(
      component.queryByText('User account not initialized')
    ).toHaveTextContent('User account not initialized')
  })
})
