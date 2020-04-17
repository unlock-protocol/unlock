import React from 'react'
import * as rtl from '@testing-library/react'

import { HomepageButton } from '../../../components/interface/buttons/homepage/HomepageButton'

describe('HomepageButton', () => {
  it('should display the terms once the dashboard button has been pressed', () => {
    expect.assertions(1)
    const wrapper = rtl.render(
      <HomepageButton destination="/" label="Go to Your Dashboard" />
    )

    const button = wrapper.getByText('Go to Your Dashboard')
    rtl.fireEvent.click(button)

    const dashboardButton = wrapper.getByText('I Agree')

    expect(dashboardButton).not.toBe(null)
  })
})
