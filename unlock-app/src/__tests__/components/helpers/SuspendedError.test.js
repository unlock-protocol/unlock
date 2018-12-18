import React from 'react'
import * as rtl from 'react-testing-library'

import SuspendedError from '../../../components/helpers/SuspendedError'

jest.useFakeTimers()

describe('SuspendedError', () => {
  const Fallback = () => <div>hi</div>
  it('should not display anything during timeout', () => {
    const rendered = rtl.render(
      <SuspendedError>
        <Fallback />
      </SuspendedError>
    )
    expect(rendered.queryByText('hi')).toBeNull()
  })
  it('should display fallback after timeout', () => {
    const rendered = rtl.render(
      <SuspendedError>
        <Fallback />
      </SuspendedError>
    )
    expect(rendered.queryByText('hi')).toBeNull()
    jest.advanceTimersByTime(201)
    expect(rendered.queryByText('hi')).toHaveTextContent('hi')
  })
})
