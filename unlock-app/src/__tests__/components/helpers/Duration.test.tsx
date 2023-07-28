import * as rtl from '@testing-library/react'
// Note, we use name import to import the non connected version of the component for testing
import { Duration } from '../../../components/helpers/Duration'
import { expect, describe, it } from 'vitest'

describe('Duration Component', () => {
  const seconds = 10000000

  it('shows - when the seconds are null or undefined', () => {
    expect.assertions(2)
    let wrapper = rtl.render(
      Duration({
        seconds: null,
      })
    )
    expect(wrapper.queryAllByText('-')).not.toBe(null)

    wrapper = rtl.render(
      Duration({
        seconds: null,
      })
    )
    expect(wrapper.queryAllByText('-')).not.toBe(null)
  })

  it('shows the duration in seconds', () => {
    expect.assertions(1)
    const wrapper = rtl.render(
      Duration({
        seconds,
      })
    )
    expect(
      wrapper.queryByText('115 days, 17 hours, 46 minutes and 40 seconds')
    ).not.toBe(null)
  })

  it('unless we want to round', () => {
    expect.assertions(1)
    const wrapper = rtl.render(
      Duration({
        seconds,
        round: true,
      })
    )
    expect(wrapper.queryByText('116 days')).not.toBe(null)
  })
})
