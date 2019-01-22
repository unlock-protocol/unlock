import React from 'react'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'

import { HomepageButton } from '../../../components/interface/buttons/homepage/HomepageButton'

describe('HomepageButton', () => {
  it('should display the dashboard button once terms are accepted', () => {
    let wrapper = rtl.render(<HomepageButton />)

    let button = wrapper.getByText('I Agree')
    rtl.fireEvent.click(button)

    let dashboardButton = wrapper.getByText('Go to Your Dashboard')

    expect(dashboardButton).not.toBe(null)
  })
})
