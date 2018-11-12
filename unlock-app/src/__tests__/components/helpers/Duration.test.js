import React from 'react'
import * as rtl from 'react-testing-library'
// Note, we use name import to import the non connected version of the component for testing
import { Duration } from '../../../components/helpers/Duration'

describe('Duration Component', () => {

  const seconds = 10000000

  const wrapper = rtl.render(<Duration seconds={seconds} />)

  it('shows the duration in seconds', () => {
    expect(wrapper.queryByText('115 days, 17 hours, 46 minutes and 40 seconds')).not.toBe(null)
  })

})
