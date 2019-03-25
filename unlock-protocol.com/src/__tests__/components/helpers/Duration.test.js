import React from 'react'
import * as rtl from 'react-testing-library'
// Note, we use name import to import the non connected version of the component for testing
import { Duration } from '../../../components/helpers/Duration'

describe('Duration Component', () => {
  const seconds = 10000000

  it('shows - when the seconds are null or undefined', () => {
    expect.assertions(2)
    let wrapper = rtl.render(<Duration seconds={null} />)
    expect(wrapper.queryByText('-')).not.toBe(null)

    wrapper = rtl.render(<Duration seconds={undefined} />)
    expect(wrapper.queryByText('-')).not.toBe(null)
  })

  it('shows the duration in seconds', () => {
    expect.assertions(1)
    const wrapper = rtl.render(<Duration seconds={seconds} />)
    expect(
      wrapper.queryByText('115 days, 17 hours, 46 minutes and 40 seconds')
    ).not.toBe(null)
  })

  it('unless we want to round', () => {
    expect.assertions(1)
    const wrapper = rtl.render(<Duration seconds={seconds} round />)
    expect(wrapper.queryByText('116 days')).not.toBe(null)
  })
})
