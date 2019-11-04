import React from 'react'
import * as rtl from '@testing-library/react'

import { HomepageButton } from '../../../components/interface/buttons/homepage/HomepageButton'

describe('HomepageButton', () => {
  it('should display the terms once the dashboard button has been pressed', () => {
    expect.assertions(1)
    let wrapper = rtl.render(<HomepageButton label="Go to Your Dashboard" />)

    let button = wrapper.getByText('Go to Your Dashboard')
    rtl.fireEvent.click(button)

    let dashboardButton = wrapper.getByText('I Agree')

    expect(dashboardButton).not.toBe(null)
  })
})
