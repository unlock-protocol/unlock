import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import { HomepageButton } from '../../../components/interface/buttons/homepage/HomepageButton'

describe('HomepageButton', () => {
  it('should display the terms once the dashboard button has been pressed', () => {
    expect.assertions(1)
    const config = {
      unlockStaticUrl: 'https://foo/bar',
    }
    let wrapper = rtl.render(<HomepageButton config={config} />)

    let button = wrapper.getByText('Go to Your Dashboard')
    rtl.fireEvent.click(button)

    let dashboardButton = wrapper.getByText('I Agree')

    expect(dashboardButton).not.toBe(null)
  })
})
